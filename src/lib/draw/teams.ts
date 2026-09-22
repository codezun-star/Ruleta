import {randomInt, shuffle} from './random';

export type Team = {name: string; members: string[]};

/**
 * Reparte a la gente en equipos parejos. Baraja y va repartiendo de uno en
 * uno, como quien reparte cartas: así los tamaños nunca se diferencian en más
 * de una persona, y quién cae en cada equipo sigue siendo azar.
 */
export function splitIntoTeams(
  members: string[],
  teamCount: number,
  teamNames: string[] = [],
  random: (max: number) => number = randomInt
): Team[] {
  if (teamCount < 2) throw new RangeError('Hacen falta al menos dos equipos');
  if (members.length < teamCount) {
    throw new RangeError('No puede haber más equipos que personas');
  }

  const teams: Team[] = Array.from({length: teamCount}, (_, index) => ({
    name: teamNames[index] ?? `${index + 1}`,
    members: []
  }));

  shuffle(members, random).forEach((member, index) => {
    teams[index % teamCount]!.members.push(member);
  });

  return teams;
}

/** Cuánta gente acaba en cada equipo, sin llegar a repartir. */
export function teamSizes(total: number, teamCount: number): number[] {
  const base = Math.floor(total / teamCount);
  const extra = total % teamCount;
  return Array.from({length: teamCount}, (_, index) => base + (index < extra ? 1 : 0));
}
