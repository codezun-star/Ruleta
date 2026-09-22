import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core';

export const drawMode = pgEnum('draw_mode', ['raffle', 'secretSanta']);
export const emailKind = pgEnum('email_kind', [
  'secretSanta',
  'raffleWinner',
  'raffleParticipant',
  'organizerReceipt'
]);
export const emailStatus = pgEnum('email_status', ['pending', 'sent', 'failed']);

export const draws = pgTable(
  'draws',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mode: drawMode('mode').notNull(),
    locale: text('locale').notNull(),

    /** Semilla y huella del sorteo: lo que lo hace auditable. */
    seed: text('seed').notNull(),
    fingerprint: text('fingerprint').notNull(),
    shortId: text('short_id').notNull(),

    prize: text('prize'),
    winnerCount: integer('winner_count'),
    notify: text('notify'),

    budget: numeric('budget'),
    currency: text('currency'),
    exchangeDate: date('exchange_date'),
    place: text('place'),
    message: text('message'),

    organizerEmail: text('organizer_email'),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    /**
     * El cron borra los correos a partir de esta fecha. Se fija al plazo largo
     * al crear el sorteo y se acorta cuando se confirma que salió todo; ver
     * `purgeDeadline` en `runDraw.ts`.
     */
    purgeAfter: timestamp('purge_after', {withTimezone: true}).notNull(),
    purgedAt: timestamp('purged_at', {withTimezone: true})
  },
  (table) => [
    uniqueIndex('draws_short_id_idx').on(table.shortId),
    index('draws_purge_after_idx').on(table.purgeAfter)
  ]
);

export const participants = pgTable(
  'participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    drawId: uuid('draw_id')
      .notNull()
      .references(() => draws.id, {onDelete: 'cascade'}),
    position: integer('position').notNull(),
    name: text('name').notNull(),
    /** La vacía el cron; la fila se queda para no romper el histórico. */
    email: text('email'),
    /**
     * Reservado para un enlace privado al resultado. **Todavía no lo lee
     * ninguna ruta**: se genera y se guarda, y nada más. Está anotado aquí
     * para que no se confunda con algo en uso.
     */
    token: text('token').notNull()
  },
  (table) => [
    index('participants_draw_idx').on(table.drawId),
    uniqueIndex('participants_token_idx').on(table.token)
  ]
);

export const raffleWinners = pgTable(
  'raffle_winners',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    drawId: uuid('draw_id')
      .notNull()
      .references(() => draws.id, {onDelete: 'cascade'}),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participants.id, {onDelete: 'cascade'}),
    position: integer('position').notNull()
  },
  (table) => [index('raffle_winners_draw_idx').on(table.drawId)]
);

/**
 * Quién le regala a quién, **siempre cifrado**. La clave vive solo en el
 * servidor, así que ni con acceso a la base se puede leer el reparto. Las
 * filas se borran en cuanto todos los correos han salido.
 */
export const assignments = pgTable(
  'assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    drawId: uuid('draw_id')
      .notNull()
      .references(() => draws.id, {onDelete: 'cascade'}),
    giverId: uuid('giver_id')
      .notNull()
      .references(() => participants.id, {onDelete: 'cascade'}),
    /** AES-GCM: nonce + texto cifrado, en base64. */
    nonce: text('nonce').notNull(),
    ciphertext: text('ciphertext').notNull()
  },
  (table) => [index('assignments_draw_idx').on(table.drawId)]
);

export const emailDeliveries = pgTable(
  'email_deliveries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    drawId: uuid('draw_id')
      .notNull()
      .references(() => draws.id, {onDelete: 'cascade'}),
    participantId: uuid('participant_id').references(() => participants.id, {
      onDelete: 'cascade'
    }),
    kind: emailKind('kind').notNull(),
    toEmail: text('to_email').notNull(),
    status: emailStatus('status').notNull().default('pending'),
    providerId: text('provider_id'),
    error: text('error'),
    attempts: integer('attempts').notNull().default(0),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow()
  },
  (table) => [index('email_deliveries_draw_idx').on(table.drawId)]
);

export type DrawRow = typeof draws.$inferSelect;
export type ParticipantRow = typeof participants.$inferSelect;
export type EmailDeliveryRow = typeof emailDeliveries.$inferSelect;
