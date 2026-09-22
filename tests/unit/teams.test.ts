import {describe, expect, it} from 'vitest';
import {splitIntoTeams, teamSizes} from '@/lib/draw/teams';

const people = (count: number) => Array.from({length: count}, (_, i) => `Persona ${i + 1}`);

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return (max: number) => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state % max;
  };
}

describe('splitIntoTeams', () => {
  it('no pierde ni duplica a nadie', () => {
    const members = people(17);
    const teams = splitIntoTeams(members, 4, [], seededRandom(1));
    const repartidos = teams.flatMap((team) => team.members);
    expect(repartidos).toHaveLength(17);
    expect(new Set(repartidos).size).toBe(17);
    expect([...repartidos].sort()).toEqual([...members].sort());
  });

  it('deja los equipos parejos: nunca más de una persona de diferencia', () => {
    for (const [total, count] of [
      [17, 4],
      [10, 3],
      [50, 7],
      [4, 2],
      [23, 5]
    ] as const) {
      const teams = splitIntoTeams(people(total), count, [], seededRandom(total));
      const sizes = teams.map((team) => team.members.length);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(total);
    }
  });

  it('usa los nombres de equipo que se le den', () => {
    const teams = splitIntoTeams(people(6), 2, ['Rojos', 'Azules'], seededRandom(3));
    expect(teams.map((team) => team.name)).toEqual(['Rojos', 'Azules']);
  });

  it('reparte distinto en tiradas distintas', () => {
    const members = people(8);
    const repartos = new Set(
      Array.from({length: 40}, (_, i) =>
        splitIntoTeams(members, 2, [], seededRandom(i + 1))
          .map((team) => team.members.join(','))
          .join('|')
      )
    );
    expect(repartos.size).toBeGreaterThan(1);
  });

  it('se niega si hay menos personas que equipos', () => {
    expect(() => splitIntoTeams(people(2), 3)).toThrow(RangeError);
  });

  it('se niega con menos de dos equipos', () => {
    expect(() => splitIntoTeams(people(5), 1)).toThrow(RangeError);
  });
});

describe('teamSizes', () => {
  it('reparte el resto entre los primeros equipos', () => {
    expect(teamSizes(10, 3)).toEqual([4, 3, 3]);
    expect(teamSizes(12, 4)).toEqual([3, 3, 3, 3]);
    expect(teamSizes(7, 2)).toEqual([4, 3]);
  });

  it('coincide con lo que reparte splitIntoTeams', () => {
    const teams = splitIntoTeams(people(23), 5, [], seededRandom(9));
    expect(teams.map((team) => team.members.length).sort((a, b) => b - a)).toEqual(
      teamSizes(23, 5)
    );
  });
});
