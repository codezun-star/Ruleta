type ClassValue = string | false | null | undefined;

/** Une clases y descarta las condicionales apagadas. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
