/**
 * Entero uniforme en [0, max). Descarta los valores que caerían en el tramo
 * incompleto del último ciclo: sin ese rechazo, los índices bajos saldrían
 * más veces que los altos (sesgo de módulo).
 *
 * `crypto.getRandomValues` existe igual en el navegador y en Node 19+, así
 * que la misma función sirve en cliente y en servidor.
 */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError(`randomInt necesita un entero positivo, recibió ${max}`);
  }
  if (max === 1) return 0;

  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0] as number;
  } while (value >= limit);

  return value % max;
}
