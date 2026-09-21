export const LIMITS = {
  /** Con una sola persona no hay sorteo que valga. */
  minRaffle: 2,
  /** Con dos, el amigo secreto es un intercambio obvio: no hay secreto. */
  minSecretSanta: 3,
  max: 50,
  maxWinners: 10,
  maxNameLength: 60,
  maxPrizeLength: 120,
  maxPlaceLength: 80,
  maxMessageLength: 400
} as const;

export const CURRENCIES = ['MXN', 'COP', 'ARS', 'CLP', 'PEN', 'USD', 'EUR'] as const;
export type Currency = (typeof CURRENCIES)[number];
