import {eq} from 'drizzle-orm';
import {getDb, schema} from '@/lib/db/client';
import {getAssignmentKey, seal, unseal} from '@/lib/crypto/assignments';
import {assignSecretSanta} from './derangement';
import {randomInt, shuffle} from './random';
import {createSeed, fingerprint, shortId} from './audit';
import {sendEmails, type Envelope} from '@/lib/email/send';
import {
  organizerLabels,
  renderOrganizerReceipt,
  renderRaffleParticipant,
  renderRaffleWinner,
  renderSecretSanta
} from '@/emails/render';
import {formatDate, formatMoney} from '@/lib/format';
import type {DrawConfig} from '@/lib/validation/draw';

/** Los correos de los participantes se borran a los 30 días. */
const RETENTION_DAYS = 30;

export type DrawOutcome = {
  drawId: string;
  shortId: string;
  /** Solo en el sorteo simple. En el amigo secreto no se devuelve nada. */
  winners?: {name: string; position: number}[];
  deliveries: {sent: number; failed: number; total: number};
};

function token(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Ejecuta el sorteo entero: lo decide, lo guarda, manda los correos y anota
 * cómo fue cada envío. El reparto del amigo secreto se guarda cifrado y no
 * sale de aquí en claro bajo ningún concepto.
 */
export async function runDraw(config: DrawConfig): Promise<DrawOutcome> {
  const db = getDb();
  const createdAt = new Date();
  const seed = createSeed();
  const ids = config.participants.map((person) => person.id);
  const hash = await fingerprint(seed, createdAt.toISOString(), ids);
  const ticket = shortId(hash);

  const purgeAfter = new Date(createdAt.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const [draw] = await db
    .insert(schema.draws)
    .values({
      mode: config.mode,
      locale: config.locale,
      seed,
      fingerprint: hash,
      shortId: ticket,
      prize: config.mode === 'raffle' ? config.prize : null,
      winnerCount: config.mode === 'raffle' ? config.winnerCount : null,
      notify: config.mode === 'raffle' ? config.notify : null,
      budget: config.mode === 'secretSanta' && config.budget !== '' ? String(config.budget) : null,
      currency: config.mode === 'secretSanta' ? config.currency : null,
      exchangeDate: config.mode === 'secretSanta' && config.date !== '' ? config.date : null,
      place: config.mode === 'secretSanta' ? config.place : null,
      message: config.mode === 'secretSanta' ? config.message : null,
      organizerEmail: config.organizerEmail || null,
      createdAt,
      purgeAfter
    })
    .returning({id: schema.draws.id});

  if (!draw) throw new Error('No se pudo crear el sorteo');

  const rows = await db
    .insert(schema.participants)
    .values(
      config.participants.map((person, index) => ({
        drawId: draw.id,
        position: index,
        name: person.name,
        email: person.email || null,
        token: token()
      }))
    )
    .returning();

  const byPosition = new Map(rows.map((row) => [row.position, row]));
  const envelopes: Envelope[] =
    config.mode === 'raffle'
      ? await prepareRaffle(config, draw.id, ticket, byPosition)
      : await prepareSecretSanta(config, draw.id, ticket, byPosition);

  const outcome = await deliver(draw.id, envelopes);

  const winners =
    config.mode === 'raffle'
      ? (
          await db
            .select({
              name: schema.participants.name,
              position: schema.raffleWinners.position
            })
            .from(schema.raffleWinners)
            .innerJoin(
              schema.participants,
              eq(schema.raffleWinners.participantId, schema.participants.id)
            )
            .where(eq(schema.raffleWinners.drawId, draw.id))
        ).sort((a, b) => a.position - b.position)
      : undefined;

  // El reparto ya viajó por correo: no hay razón para seguir guardándolo.
  if (config.mode === 'secretSanta' && outcome.failed === 0) {
    await db.delete(schema.assignments).where(eq(schema.assignments.drawId, draw.id));
  }

  return {drawId: draw.id, shortId: ticket, winners, deliveries: outcome};
}

type ParticipantRows = Map<number, typeof schema.participants.$inferSelect>;

async function prepareRaffle(
  config: Extract<DrawConfig, {mode: 'raffle'}>,
  drawId: string,
  ticket: string,
  byPosition: ParticipantRows
): Promise<Envelope[]> {
  const db = getDb();
  const total = config.participants.length;
  const count = Math.min(config.winnerCount, total);

  // Sacar posiciones sin repetir: barajar y coger las primeras es equivalente
  // a sortear uno a uno, y no puede entrar en bucle.
  const winnerPositions = shuffle(
    Array.from({length: total}, (_, index) => index),
    randomInt
  ).slice(0, count);

  await db.insert(schema.raffleWinners).values(
    winnerPositions.map((position, index) => ({
      drawId,
      participantId: byPosition.get(position)!.id,
      position: index + 1
    }))
  );

  const winnerNames = winnerPositions.map((position) => byPosition.get(position)!.name);
  const envelopes: Envelope[] = [];

  for (const [index, position] of winnerPositions.entries()) {
    const row = byPosition.get(position)!;
    if (!row.email || config.notify === 'none') continue;
    const email = await renderRaffleWinner({
      locale: config.locale,
      drawId: ticket,
      winnerName: row.name,
      prize: config.prize,
      position: index + 1
    });
    envelopes.push({...email, to: row.email, deliveryId: `${row.id}:raffleWinner`});
  }

  if (config.notify === 'all') {
    for (const row of byPosition.values()) {
      if (!row.email || winnerPositions.includes(row.position)) continue;
      const email = await renderRaffleParticipant({
        locale: config.locale,
        drawId: ticket,
        name: row.name,
        prize: config.prize,
        winners: winnerNames
      });
      envelopes.push({...email, to: row.email, deliveryId: `${row.id}:raffleParticipant`});
    }
  }

  if (config.organizerEmail) {
    const labels = organizerLabels(config.locale);
    const email = await renderOrganizerReceipt({
      locale: config.locale,
      drawId: ticket,
      rows: [
        {label: labels.participants, value: String(total)},
        {label: labels.prize, value: config.prize},
        {label: labels.winners, value: winnerNames.join(', ')}
      ]
    });
    envelopes.push({...email, to: config.organizerEmail, deliveryId: 'organizer:organizerReceipt'});
  }

  return envelopes;
}

async function prepareSecretSanta(
  config: Extract<DrawConfig, {mode: 'secretSanta'}>,
  drawId: string,
  ticket: string,
  byPosition: ParticipantRows
): Promise<Envelope[]> {
  const db = getDb();
  const rows = [...byPosition.values()].sort((a, b) => a.position - b.position);
  const byId = new Map(rows.map((row) => [row.id, row]));

  // Las exclusiones vienen con los ids del formulario; se traducen a los de la
  // base por posición, que es lo único estable entre los dos mundos.
  const positionOf = new Map(config.participants.map((person, index) => [person.id, index]));
  const exclusions = config.exclusions
    .map(([a, b]) => {
      const rowA = byPosition.get(positionOf.get(a) ?? -1);
      const rowB = byPosition.get(positionOf.get(b) ?? -1);
      return rowA && rowB ? ([rowA.id, rowB.id] as [string, string]) : null;
    })
    .filter((pair): pair is [string, string] => pair !== null);

  const result = assignSecretSanta(
    rows.map((row) => row.id),
    exclusions
  );
  if (!result.ok) {
    throw new DrawImpossibleError(result.reason);
  }

  const key = await getAssignmentKey();
  await db.insert(schema.assignments).values(
    await Promise.all(
      result.assignments.map(async ({giver, receiver}) => {
        const sealed = await seal(receiver, key);
        return {drawId, giverId: giver, nonce: sealed.nonce, ciphertext: sealed.ciphertext};
      })
    )
  );

  const budget =
    config.budget !== '' ? formatMoney(Number(config.budget), config.currency, config.locale) : undefined;
  const date = config.date !== '' ? (formatDate(config.date, config.locale) ?? undefined) : undefined;

  const envelopes: Envelope[] = [];
  for (const {giver, receiver} of result.assignments) {
    const giverRow = byId.get(giver);
    const receiverRow = byId.get(receiver);
    if (!giverRow?.email || !receiverRow) continue;

    const email = await renderSecretSanta({
      locale: config.locale,
      drawId: ticket,
      giverName: giverRow.name,
      receiverName: receiverRow.name,
      budget,
      date,
      place: config.place || undefined,
      message: config.message || undefined
    });
    envelopes.push({...email, to: giverRow.email, deliveryId: `${giverRow.id}:secretSanta`});
  }

  if (config.organizerEmail) {
    const labels = organizerLabels(config.locale);
    const email = await renderOrganizerReceipt({
      locale: config.locale,
      drawId: ticket,
      // Ni una asignación: el recibo solo cuenta cuánta gente y cuántos correos.
      rows: [{label: labels.participants, value: String(rows.length)}]
    });
    envelopes.push({...email, to: config.organizerEmail, deliveryId: 'organizer:organizerReceipt'});
  }

  return envelopes;
}

export class DrawImpossibleError extends Error {
  constructor(readonly reason: string) {
    super(`No hay ninguna asignación posible: ${reason}`);
    this.name = 'DrawImpossibleError';
  }
}

/** Crea las filas de envío, manda los correos y anota cómo fue cada uno. */
async function deliver(drawId: string, envelopes: Envelope[]) {
  const db = getDb();
  if (envelopes.length === 0) return {sent: 0, failed: 0, total: 0};

  const inserted = await db
    .insert(schema.emailDeliveries)
    .values(
      envelopes.map((envelope) => {
        const [participantId, kind] = envelope.deliveryId.split(':');
        return {
          drawId,
          participantId: participantId === 'organizer' ? null : participantId,
          kind: kind as (typeof schema.emailKind.enumValues)[number],
          toEmail: envelope.to
        };
      })
    )
    .returning({id: schema.emailDeliveries.id});

  const withRowIds = envelopes.map((envelope, index) => ({
    ...envelope,
    deliveryId: inserted[index]!.id
  }));

  const outcomes = await sendEmails(withRowIds);

  await Promise.all(
    outcomes.map((outcome) =>
      db
        .update(schema.emailDeliveries)
        .set({
          status: outcome.ok ? 'sent' : 'failed',
          providerId: outcome.providerId ?? null,
          error: outcome.error ?? null,
          attempts: 1,
          updatedAt: new Date()
        })
        .where(eq(schema.emailDeliveries.id, outcome.deliveryId))
    )
  );

  const sent = outcomes.filter((outcome) => outcome.ok).length;
  return {sent, failed: outcomes.length - sent, total: outcomes.length};
}

/**
 * Reintenta solo los envíos que fallaron. Para el amigo secreto hay que
 * descifrar de nuevo el reparto, que por eso no se borra hasta que sale todo.
 */
export async function retryFailed(drawId: string): Promise<{sent: number; failed: number}> {
  const db = getDb();
  const failed = await db
    .select()
    .from(schema.emailDeliveries)
    .where(eq(schema.emailDeliveries.drawId, drawId));

  const pending = failed.filter((row) => row.status === 'failed');
  if (pending.length === 0) return {sent: 0, failed: 0};

  const [draw] = await db.select().from(schema.draws).where(eq(schema.draws.id, drawId));
  if (!draw) throw new Error('Ese sorteo no existe');

  const people = await db
    .select()
    .from(schema.participants)
    .where(eq(schema.participants.drawId, drawId));
  const byId = new Map(people.map((row) => [row.id, row]));

  const sealedRows = await db
    .select()
    .from(schema.assignments)
    .where(eq(schema.assignments.drawId, drawId));
  const key = sealedRows.length > 0 ? await getAssignmentKey() : null;
  const receiverOf = new Map<string, string>();
  if (key) {
    for (const row of sealedRows) {
      receiverOf.set(row.giverId, await unseal(row, key));
    }
  }

  const winnerRows = await db
    .select()
    .from(schema.raffleWinners)
    .where(eq(schema.raffleWinners.drawId, drawId));
  const winnerNames = winnerRows
    .sort((a, b) => a.position - b.position)
    .map((row) => byId.get(row.participantId)?.name ?? '');

  const envelopes: Envelope[] = [];
  for (const row of pending) {
    const person = row.participantId ? byId.get(row.participantId) : null;
    const locale = draw.locale;
    const common = {locale, drawId: draw.shortId};

    if (row.kind === 'secretSanta' && person) {
      const receiverId = receiverOf.get(person.id);
      const receiver = receiverId ? byId.get(receiverId) : null;
      if (!receiver) continue;
      const email = await renderSecretSanta({
        ...common,
        giverName: person.name,
        receiverName: receiver.name,
        budget:
          draw.budget && draw.currency
            ? formatMoney(Number(draw.budget), draw.currency, locale)
            : undefined,
        date: draw.exchangeDate ? (formatDate(draw.exchangeDate, locale) ?? undefined) : undefined,
        place: draw.place ?? undefined,
        message: draw.message ?? undefined
      });
      envelopes.push({...email, to: row.toEmail, deliveryId: row.id});
    } else if (row.kind === 'raffleWinner' && person) {
      const position = winnerRows.find((w) => w.participantId === person.id)?.position ?? 1;
      const email = await renderRaffleWinner({
        ...common,
        winnerName: person.name,
        prize: draw.prize ?? '',
        position
      });
      envelopes.push({...email, to: row.toEmail, deliveryId: row.id});
    } else if (row.kind === 'raffleParticipant' && person) {
      const email = await renderRaffleParticipant({
        ...common,
        name: person.name,
        prize: draw.prize ?? '',
        winners: winnerNames
      });
      envelopes.push({...email, to: row.toEmail, deliveryId: row.id});
    } else if (row.kind === 'organizerReceipt') {
      const labels = organizerLabels(locale);
      const email = await renderOrganizerReceipt({
        ...common,
        rows: [{label: labels.participants, value: String(people.length)}]
      });
      envelopes.push({...email, to: row.toEmail, deliveryId: row.id});
    }
  }

  const outcomes = await sendEmails(envelopes);
  await Promise.all(
    outcomes.map((outcome) =>
      db
        .update(schema.emailDeliveries)
        .set({
          status: outcome.ok ? 'sent' : 'failed',
          providerId: outcome.providerId ?? null,
          error: outcome.error ?? null,
          updatedAt: new Date()
        })
        .where(eq(schema.emailDeliveries.id, outcome.deliveryId))
    )
  );

  const sent = outcomes.filter((outcome) => outcome.ok).length;

  // Si ya salió todo, el reparto deja de hacer falta.
  if (sent === outcomes.length && sealedRows.length > 0) {
    await db.delete(schema.assignments).where(eq(schema.assignments.drawId, drawId));
  }

  return {sent, failed: outcomes.length - sent};
}
