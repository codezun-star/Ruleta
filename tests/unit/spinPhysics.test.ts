import {describe, expect, it} from 'vitest';
import {planSpin, spinAngleAt, createPointerSpring} from '@/components/wheel/spinPhysics';

const mod360 = (value: number) => ((value % 360) + 360) % 360;

/**
 * El puntero está fijo arriba. Un punto que en la ruleta está en el ángulo θ
 * aparece en pantalla en θ + rotación, así que bajo el puntero queda -rotación.
 */
function segmentUnderPointer(rotation: number, segmentCount: number): number {
  const step = 360 / segmentCount;
  return Math.round(mod360(-rotation) / step) % segmentCount;
}

describe('planSpin', () => {
  it('deja siempre el segmento ganador debajo del puntero', () => {
    for (const segmentCount of [2, 3, 5, 8, 13, 50]) {
      for (let winner = 0; winner < segmentCount; winner++) {
        for (let run = 0; run < 25; run++) {
          const plan = planSpin(Math.random() * 720, winner, segmentCount);
          expect(segmentUnderPointer(plan.to, segmentCount)).toBe(winner);
        }
      }
    }
  });

  it('siempre avanza y da al menos cinco vueltas', () => {
    for (let run = 0; run < 200; run++) {
      const from = Math.random() * 360;
      const plan = planSpin(from, 3, 8);
      expect(plan.to - plan.from).toBeGreaterThanOrEqual(5 * 360);
    }
  });
});

describe('spinAngleAt', () => {
  const plan = planSpin(0, 2, 8);

  it('arranca donde estaba y termina donde toca', () => {
    expect(spinAngleAt(0, plan)).toBeCloseTo(plan.from, 6);
    expect(spinAngleAt(1, plan)).toBeCloseTo(plan.to, 6);
  });

  it('se pasa de largo antes de asentarse', () => {
    expect(spinAngleAt(0.9, plan)).toBeGreaterThan(plan.to);
  });

  it('no retrocede durante la frenada', () => {
    let previous = spinAngleAt(0, plan);
    for (let t = 0.01; t <= 0.9; t += 0.01) {
      const current = spinAngleAt(t, plan);
      expect(current).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = current;
    }
  });
});

describe('createPointerSpring', () => {
  it('vuelve al centro después de un golpe', () => {
    const spring = createPointerSpring();
    spring.kick(12);
    let angle = 0;
    for (let i = 0; i < 60; i++) angle = spring.step();
    expect(Math.abs(angle)).toBeLessThan(0.5);
  });

  it('no se sale del tope, por fuerte que sea el golpe', () => {
    const spring = createPointerSpring();
    for (let i = 0; i < 40; i++) {
      spring.kick(500);
      expect(Math.abs(spring.step())).toBeLessThanOrEqual(15);
    }
  });
});
