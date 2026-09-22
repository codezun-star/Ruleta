/**
 * Vibración de respuesta al toque. Es de las cosas que más separan una app
 * instalada de una página: el resultado no solo se ve y se oye, se nota.
 *
 * Solo existe en Android; iOS no expone la API de vibración a la web, así que
 * allí esto no hace nada y no debe hacer nada visible. Se llama siempre en
 * paralelo al sonido, nunca en su lugar.
 */

/** Duraciones en ms. Cortas: una vibración larga se siente a avería. */
const PATTERNS = {
  /** Un toque cualquiera: seleccionar, añadir, quitar. */
  tap: 10,
  /** Arranca el giro. */
  start: 18,
  /** Sale el resultado: dos golpes secos, como un sello al caer. */
  result: [14, 60, 26]
} as const;

export type Haptic = keyof typeof PATTERNS;

function enabled(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  if (typeof navigator.vibrate !== 'function') return false;

  // Quien pide menos movimiento no quiere que el teléfono le tiemble en la
  // mano. Es la misma preferencia que ya salta el giro y el confeti.
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function haptic(kind: Haptic): void {
  if (!enabled()) return;
  try {
    navigator.vibrate(PATTERNS[kind] as number | number[]);
  } catch {
    // Algunos navegadores la exponen y luego la bloquean por política de
    // permisos. No es motivo para romper el giro.
  }
}
