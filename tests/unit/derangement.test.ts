import {describe, expect, it} from 'vitest';
import {assignSecretSanta, isValidDerangement} from '@/lib/draw/derangement';

/** Congruencial lineal: reproducible, para que un fallo se pueda repetir. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state % max;
  };
}

const ids = (count: number) => Array.from({length: count}, (_, i) => `p${i + 1}`);

describe('assignSecretSanta', () => {
  it('rechaza los grupos de menos de dos personas', () => {
    expect(assignSecretSanta([])).toMatchObject({ok: false, reason: 'tooFew'});
    expect(assignSecretSanta(['solo'])).toMatchObject({ok: false, reason: 'tooFew'});
  });

  it('con dos personas solo cabe el intercambio mutuo', () => {
    const result = assignSecretSanta(['a', 'b']);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.assignments).toEqual(
      expect.arrayContaining([
        {giver: 'a', receiver: 'b'},
        {giver: 'b', receiver: 'a'}
      ])
    );
  });

  it('con tres personas nadie se saca a sí mismo, en mil intentos', () => {
    const people = ids(3);
    for (let run = 0; run < 1000; run++) {
      const result = assignSecretSanta(people, [], seededRandom(run + 1));
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(isValidDerangement(people, result.assignments)).toBe(true);
    }
  });

  it('cada quien da una vez y recibe una vez', () => {
    const people = ids(12);
    const result = assignSecretSanta(people, [], seededRandom(7));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const givers = result.assignments.map((a) => a.giver);
    const receivers = result.assignments.map((a) => a.receiver);
    expect(new Set(givers).size).toBe(people.length);
    expect(new Set(receivers).size).toBe(people.length);
  });

  it('resuelve cincuenta personas', () => {
    const people = ids(50);
    const result = assignSecretSanta(people, [], seededRandom(99));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.assignments).toHaveLength(50);
    expect(isValidDerangement(people, result.assignments)).toBe(true);
  });

  it('respeta las exclusiones', () => {
    const people = ids(8);
    const exclusions: [string, string][] = [
      ['p1', 'p2'],
      ['p3', 'p4'],
      ['p5', 'p6']
    ];
    for (let run = 0; run < 200; run++) {
      const result = assignSecretSanta(people, exclusions, seededRandom(run + 1));
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(isValidDerangement(people, result.assignments, exclusions)).toBe(true);
    }
  });

  it('las exclusiones son en los dos sentidos', () => {
    const people = ids(6);
    const exclusions: [string, string][] = [['p1', 'p2']];
    const result = assignSecretSanta(people, exclusions, seededRandom(3));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const pairs = result.assignments.map((a) => `${a.giver}->${a.receiver}`);
    expect(pairs).not.toContain('p1->p2');
    expect(pairs).not.toContain('p2->p1');
  });

  it('avisa cuando las exclusiones hacen el sorteo imposible', () => {
    // Tres personas y una excluida de las otras dos: se queda sin nadie.
    const result = assignSecretSanta(ids(3), [
      ['p1', 'p2'],
      ['p1', 'p3']
    ]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('impossible');
    expect(result.blocked).toContain('p1');
  });

  it('avisa cuando dos parejas cerradas bloquean a un cuarteto', () => {
    // p1↔p2 y p3↔p4 excluidos entre sí deja el grafo sin ciclo ni emparejamiento.
    const result = assignSecretSanta(ids(4), [
      ['p1', 'p2'],
      ['p1', 'p3'],
      ['p1', 'p4']
    ]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('impossible');
  });

  it('con tres personas, cualquier exclusión deja el sorteo sin salida', () => {
    // Solo hay dos derangements de tres elementos y son los dos ciclos; cada
    // uno usa una de las dos direcciones del par excluido, así que se caen los dos.
    const result = assignSecretSanta(ids(3), [['p1', 'p3']]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('impossible');
  });

  it('encuentra la cadena cuando las exclusiones aprietan pero dejan salida', () => {
    // Dos parejas que no se tocan: la única forma es alternar entre ellas.
    const people = ids(4);
    const exclusions: [string, string][] = [
      ['p1', 'p2'],
      ['p3', 'p4']
    ];
    for (let run = 0; run < 200; run++) {
      const result = assignSecretSanta(people, exclusions, seededRandom(run + 1));
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(isValidDerangement(people, result.assignments, exclusions)).toBe(true);
    }
  });

  it('sin exclusiones sale una sola cadena, así que nadie se devuelve el regalo', () => {
    const people = ids(6);
    const result = assignSecretSanta(people, [], seededRandom(5));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.strategy).toBe('cycle');

    const next = new Map(result.assignments.map((a) => [a.giver, a.receiver]));
    for (const [giver, receiver] of next) {
      expect(next.get(receiver)).not.toBe(giver);
    }
  });

  it('reparte: con mil tiradas nadie recibe siempre de la misma persona', () => {
    const people = ids(4);
    const seen = new Set<string>();
    for (let run = 0; run < 1000; run++) {
      const result = assignSecretSanta(people, [], seededRandom(run + 1));
      if (!result.ok) continue;
      const first = result.assignments.find((a) => a.giver === 'p1');
      if (first) seen.add(first.receiver);
    }
    // p1 debería poder regalarle a cualquiera de los otros tres.
    expect(seen.size).toBe(3);
  });

  it('exige identificadores únicos', () => {
    expect(() => assignSecretSanta(['a', 'a', 'b'])).toThrow(/únicos/);
  });
});

describe('isValidDerangement', () => {
  it('rechaza que alguien se saque a sí mismo', () => {
    expect(
      isValidDerangement(
        ['a', 'b'],
        [
          {giver: 'a', receiver: 'a'},
          {giver: 'b', receiver: 'b'}
        ]
      )
    ).toBe(false);
  });

  it('rechaza que alguien reciba dos veces', () => {
    expect(
      isValidDerangement(
        ['a', 'b', 'c'],
        [
          {giver: 'a', receiver: 'c'},
          {giver: 'b', receiver: 'c'},
          {giver: 'c', receiver: 'a'}
        ]
      )
    ).toBe(false);
  });

  it('rechaza una asignación que pisa una exclusión', () => {
    expect(
      isValidDerangement(
        ['a', 'b', 'c'],
        [
          {giver: 'a', receiver: 'b'},
          {giver: 'b', receiver: 'c'},
          {giver: 'c', receiver: 'a'}
        ],
        [['a', 'b']]
      )
    ).toBe(false);
  });
});
