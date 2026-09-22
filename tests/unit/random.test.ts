import {describe, expect, it} from 'vitest';
import {randomInt, shuffle} from '@/lib/draw/random';

describe('randomInt', () => {
  it('con un solo valor siempre devuelve cero', () => {
    expect(randomInt(1)).toBe(0);
  });

  it('se queda dentro del rango', () => {
    for (let i = 0; i < 5000; i++) {
      const value = randomInt(7);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(7);
    }
  });

  it('rechaza rangos que no son enteros positivos', () => {
    expect(() => randomInt(0)).toThrow(RangeError);
    expect(() => randomInt(-3)).toThrow(RangeError);
    expect(() => randomInt(2.5)).toThrow(RangeError);
  });

  it('reparte parejo: ninguna cara se lleva más del doble que otra', () => {
    // 7 no divide a 2^32, que es justo donde aparecería el sesgo de módulo.
    const counts = new Array<number>(7).fill(0);
    const draws = 70_000;
    for (let i = 0; i < draws; i++) counts[randomInt(7)]!++;

    const expected = draws / 7;
    for (const count of counts) {
      expect(count).toBeGreaterThan(expected * 0.9);
      expect(count).toBeLessThan(expected * 1.1);
    }
  });
});

describe('shuffle', () => {
  it('conserva todos los elementos', () => {
    const input = ['a', 'b', 'c', 'd', 'e'];
    const result = shuffle(input);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it('no toca la lista original', () => {
    const input = ['a', 'b', 'c'];
    shuffle(input);
    expect(input).toEqual(['a', 'b', 'c']);
  });

  it('cambia el orden alguna vez', () => {
    const input = Array.from({length: 10}, (_, i) => i);
    const orders = new Set(Array.from({length: 50}, () => shuffle(input).join(',')));
    expect(orders.size).toBeGreaterThan(1);
  });
});
