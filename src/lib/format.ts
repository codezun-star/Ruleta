/** `new Date('2026-12-20')` es medianoche UTC y en América se ve como el 19. */
export function parseLocalDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function formatDate(iso: string, locale: string): string | null {
  const date = parseLocalDate(iso);
  if (!date) return null;
  return new Intl.DateTimeFormat(locale, {dateStyle: 'long'}).format(date);
}

export function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}
