import {getResend} from './resend';
import {EMAIL_FROM, EMAIL_REPLY_TO} from '@/config/brand';
import type {OutgoingEmail} from '@/emails/render';

export type Envelope = OutgoingEmail & {
  to: string;
  /** Identificador propio para poder casar el resultado con la fila de la base. */
  deliveryId: string;
};

export type SendOutcome = {deliveryId: string; ok: boolean; providerId?: string; error?: string};

/** Resend acepta hasta 100 correos por llamada a la API de lotes. */
const BATCH_SIZE = 100;
/** Su límite por defecto son 2 peticiones por segundo. */
const GAP_MS = 600;
const MAX_ATTEMPTS = 4;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryable(error: unknown): boolean {
  const message = String((error as {message?: string})?.message ?? error ?? '');
  const name = String((error as {name?: string})?.name ?? '');
  return /rate.?limit|429|timeout|ECONN|socket|502|503|504|internal/i.test(`${name} ${message}`);
}

function toPayload(envelope: Envelope) {
  return {
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: [envelope.to],
    subject: envelope.subject,
    html: envelope.html,
    text: envelope.text
  };
}

/**
 * Manda los correos por lotes y devuelve el resultado de cada uno.
 *
 * Si un lote entero falla incluso tras los reintentos, se reenvía uno a uno:
 * la API de lotes no dice cuál de los cien falló, y sin eso no se puede
 * ofrecer "reintentar solo los fallidos".
 */
export async function sendEmails(envelopes: Envelope[]): Promise<SendOutcome[]> {
  const resend = getResend();
  const outcomes: SendOutcome[] = [];

  for (let start = 0; start < envelopes.length; start += BATCH_SIZE) {
    const batch = envelopes.slice(start, start + BATCH_SIZE);
    if (start > 0) await sleep(GAP_MS);

    let sent = false;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS && !sent; attempt++) {
      try {
        const response = await resend.batch.send(batch.map(toPayload));
        if (response.error) throw response.error;

        const ids = response.data?.data ?? [];
        batch.forEach((envelope, index) => {
          outcomes.push({
            deliveryId: envelope.deliveryId,
            ok: true,
            providerId: ids[index]?.id
          });
        });
        sent = true;
      } catch (error) {
        if (attempt === MAX_ATTEMPTS || !isRetryable(error)) break;
        // Espera creciente: 0.6s, 1.2s, 2.4s.
        await sleep(GAP_MS * 2 ** (attempt - 1));
      }
    }

    if (!sent) {
      outcomes.push(...(await sendOneByOne(batch)));
    }
  }

  return outcomes;
}

async function sendOneByOne(batch: Envelope[]): Promise<SendOutcome[]> {
  const resend = getResend();
  const outcomes: SendOutcome[] = [];

  for (const envelope of batch) {
    let outcome: SendOutcome = {deliveryId: envelope.deliveryId, ok: false, error: 'unknown'};

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await resend.emails.send(toPayload(envelope));
        if (response.error) throw response.error;
        outcome = {deliveryId: envelope.deliveryId, ok: true, providerId: response.data?.id};
        break;
      } catch (error) {
        const message = String((error as {message?: string})?.message ?? error);
        outcome = {deliveryId: envelope.deliveryId, ok: false, error: message.slice(0, 300)};
        if (attempt === MAX_ATTEMPTS || !isRetryable(error)) break;
        await sleep(GAP_MS * 2 ** (attempt - 1));
      }
      await sleep(GAP_MS);
    }

    outcomes.push(outcome);
  }

  return outcomes;
}
