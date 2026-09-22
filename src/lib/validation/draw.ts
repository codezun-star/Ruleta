import {z} from 'zod';
import {LIMITS, CURRENCIES} from './limits';
import {participantSchema} from './participants';

export const NOTIFY_OPTIONS = ['winners', 'all', 'none'] as const;
export type NotifyOption = (typeof NOTIFY_OPTIONS)[number];

const organizerEmail = z.union([z.literal(''), z.email('emailInvalid')]);

/** Modo A. El correo de los participantes es opcional: sirve en vivo. */
export const raffleSchema = z.object({
  mode: z.literal('raffle'),
  participants: z
    .array(participantSchema)
    .min(LIMITS.minRaffle, 'tooFewParticipants')
    .max(LIMITS.max, 'tooManyParticipants'),
  prize: z.string().trim().min(1, 'prizeRequired').max(LIMITS.maxPrizeLength, 'prizeTooLong'),
  winnerCount: z.number().int().min(1, 'winnersRange').max(LIMITS.maxWinners, 'winnersRange'),
  notify: z.enum(NOTIFY_OPTIONS),
  organizerEmail,
  locale: z.string()
});

/** Modo B. Aquí el correo sí es obligatorio: cada quien recibe solo el suyo. */
export const secretSantaSchema = z.object({
  mode: z.literal('secretSanta'),
  participants: z
    .array(participantSchema)
    .min(LIMITS.minSecretSanta, 'tooFewParticipants')
    .max(LIMITS.max, 'tooManyParticipants'),
  budget: z.union([z.literal(''), z.coerce.number().positive('budgetPositive')]),
  currency: z.enum(CURRENCIES),
  date: z.union([z.literal(''), z.iso.date('dateInvalid')]),
  place: z.string().trim().max(LIMITS.maxPlaceLength, 'placeTooLong'),
  message: z.string().trim().max(LIMITS.maxMessageLength, 'messageTooLong'),
  /** Pares de ids que no pueden tocarse entre sí. */
  exclusions: z.array(z.tuple([z.string(), z.string()])),
  organizerEmail,
  locale: z.string()
});

export const drawSchema = z.discriminatedUnion('mode', [raffleSchema, secretSantaSchema]);

export type RaffleConfig = z.infer<typeof raffleSchema>;
export type SecretSantaConfig = z.infer<typeof secretSantaSchema>;
export type DrawConfig = z.infer<typeof drawSchema>;

/**
 * Lo que llega por HTTP: el sorteo más el token del captcha. Se mantiene
 * aparte de `drawSchema` para que el dominio no sepa nada de Turnstile.
 */
export const drawRequestSchema = z.object({
  draw: drawSchema,
  turnstileToken: z.string().max(4096).optional()
});

export type DrawRequest = z.infer<typeof drawRequestSchema>;
