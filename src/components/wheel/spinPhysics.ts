/**
 * Física del giro. El resultado **no** sale de aquí: el ganador se decide
 * fuera y esta función calcula hacia atrás el ángulo que hay que recorrer
 * para acabar justo en su segmento.
 */

export const SPIN_DURATION_MS = 6200;

/** Vueltas enteras antes de empezar a frenar. */
const MIN_TURNS = 5;
const EXTRA_TURNS = 3;

/** Grados que se pasa de largo antes de asentarse. */
const OVERSHOOT_DEG = 4.5;

/** Parte del giro dedicada a la frenada; el resto es el rebote final. */
const SETTLE_AT = 0.9;

const mod360 = (value: number) => ((value % 360) + 360) % 360;

export type SpinPlan = {
  /** Ángulo de partida, en grados. */
  from: number;
  /** Ángulo final exacto, donde el puntero queda sobre el segmento ganador. */
  to: number;
};

/**
 * @param winner Índice del segmento que tiene que ganar.
 * @param random Fuente de aleatoriedad **solo decorativa**: elige cuántas
 *   vueltas da y en qué punto del segmento se detiene. Nunca decide quién gana.
 */
export function planSpin(
  currentRotation: number,
  winner: number,
  segmentCount: number,
  random: () => number = Math.random
): SpinPlan {
  const step = 360 / segmentCount;
  // No siempre clava el centro: queda más creíble parando algo descentrado.
  const jitter = (random() - 0.5) * step * 0.6;
  const landing = mod360(-winner * step + jitter);
  const turns = MIN_TURNS + Math.floor(random() * EXTRA_TURNS);
  const to =
    currentRotation + turns * 360 + mod360(landing - mod360(currentRotation)) + OVERSHOOT_DEG;

  return {from: currentRotation, to: to - OVERSHOOT_DEG};
}

/**
 * Ángulo en un instante dado. Frena con una cuártica de salida y al final
 * retrocede los grados que se había pasado, como una ruleta de verdad al
 * asentarse contra el clavo.
 */
export function spinAngleAt(progress: number, plan: SpinPlan): number {
  const peak = plan.to + OVERSHOOT_DEG;
  if (progress < SETTLE_AT) {
    const eased = 1 - Math.pow(1 - progress / SETTLE_AT, 4);
    return plan.from + (peak - plan.from) * eased;
  }
  const eased = 1 - Math.pow(1 - (progress - SETTLE_AT) / (1 - SETTLE_AT), 3);
  return peak + (plan.to - peak) * eased;
}

/**
 * Muelle amortiguado del puntero. Cada vez que pasa un clavo recibe un
 * empujón proporcional a la velocidad y vuelve al centro oscilando.
 */
export function createPointerSpring() {
  let angle = 0;
  let velocity = 0;

  return {
    kick(speed: number) {
      velocity -= Math.min(10, 1.2 + speed * 0.55);
    },
    step(): number {
      velocity += -angle * 0.4;
      velocity *= 0.76;
      angle = Math.max(-15, Math.min(15, angle + velocity));
      return angle;
    },
    reset() {
      angle = 0;
      velocity = 0;
    }
  };
}
