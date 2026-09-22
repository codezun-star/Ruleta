import {randomInt, shuffle} from './random';

export type Assignment = {giver: string; receiver: string};

export type DerangementResult =
  | {
      ok: true;
      assignments: Assignment[];
      /**
       * `cycle`: una sola cadena que pasa por todos, así que nadie se devuelve
       * el regalo. `matching`: emparejamiento válido, pero pueden salir pares
       * que se regalan entre sí. Solo se usa si las exclusiones impiden el ciclo.
       */
      strategy: 'cycle' | 'matching';
    }
  | {ok: false; reason: 'tooFew'; blocked: [] }
  | {ok: false; reason: 'impossible'; blocked: string[]};

type Random = (max: number) => number;

/** Quién puede regalarle a quién: todos menos uno mismo y menos los excluidos. */
function buildAllowed(ids: string[], exclusions: [string, string][]): Map<string, Set<string>> {
  const allowed = new Map<string, Set<string>>();
  for (const id of ids) {
    allowed.set(id, new Set(ids.filter((other) => other !== id)));
  }
  for (const [a, b] of exclusions) {
    allowed.get(a)?.delete(b);
    allowed.get(b)?.delete(a);
  }
  return allowed;
}

/**
 * Emparejamiento bipartito máximo (algoritmo de Kuhn con caminos aumentantes).
 * Es lo que nos deja **afirmar con certeza** que un sorteo es imposible: si el
 * máximo no llega a emparejar a todos, no existe ninguna asignación válida.
 */
function maximumMatching(
  ids: string[],
  allowed: Map<string, Set<string>>,
  random: Random
): Map<string, string> {
  /** receptor → dador */
  const takenBy = new Map<string, string>();

  const augment = (giver: string, visited: Set<string>): boolean => {
    for (const receiver of shuffle([...(allowed.get(giver) ?? [])], random)) {
      if (visited.has(receiver)) continue;
      visited.add(receiver);
      const current = takenBy.get(receiver);
      if (current === undefined || augment(current, visited)) {
        takenBy.set(receiver, giver);
        return true;
      }
    }
    return false;
  };

  for (const giver of shuffle(ids, random)) {
    augment(giver, new Set());
  }
  return takenBy;
}

/**
 * Ciclo hamiltoniano aleatorio que respeta las exclusiones. El presupuesto de
 * pasos evita que un caso patológico deje la petición colgada: si se agota,
 * quien llama se queda con el emparejamiento, que ya sabemos que existe.
 */
function findCycle(
  ids: string[],
  allowed: Map<string, Set<string>>,
  random: Random,
  stepBudget: number
): string[] | null {
  const start = ids[random(ids.length)] as string;
  const path: string[] = [start];
  const used = new Set<string>([start]);
  let steps = 0;

  const walk = (): boolean => {
    if (steps++ > stepBudget) return false;
    const last = path[path.length - 1] as string;

    if (path.length === ids.length) {
      return allowed.get(last)?.has(start) ?? false;
    }

    const candidates = shuffle([...(allowed.get(last) ?? [])].filter((id) => !used.has(id)), random);
    // Warnsdorff: probar antes a quien menos salidas le quedan. Sin esto, un
    // grafo con pocas exclusiones ya obliga a retroceder muchísimo.
    candidates.sort((a, b) => remainingDegree(a) - remainingDegree(b));

    for (const next of candidates) {
      used.add(next);
      path.push(next);
      if (walk()) return true;
      path.pop();
      used.delete(next);
    }
    return false;
  };

  const remainingDegree = (id: string): number => {
    let count = 0;
    for (const candidate of allowed.get(id) ?? []) {
      if (!used.has(candidate)) count++;
    }
    return count;
  };

  return walk() ? path : null;
}

/**
 * ¿Existe alguna asignación válida? Corre el emparejamiento máximo, que es lo
 * único que responde con certeza. Mirar solo si a alguien le quedan cero
 * candidatos se queda corto: con tres personas y una sola exclusión, todos
 * conservan al menos un candidato y aun así el sorteo es imposible.
 */
export function checkFeasible(
  ids: string[],
  exclusions: [string, string][] = [],
  random: Random = randomInt
): {ok: boolean; blocked: string[]} {
  if (ids.length < 2) return {ok: false, blocked: []};
  if (exclusions.length === 0) return {ok: true, blocked: []};

  const matching = maximumMatching(ids, buildAllowed(ids, exclusions), random);
  if (matching.size === ids.length) return {ok: true, blocked: []};

  const matchedGivers = new Set(matching.values());
  return {ok: false, blocked: ids.filter((id) => !matchedGivers.has(id))};
}

/**
 * Asigna a quién le regala cada quien.
 *
 * Garantiza que nadie se saca a sí mismo, que cada persona da exactamente una
 * vez y recibe exactamente una vez (un derangement), y que se respetan las
 * exclusiones. Si no existe ninguna asignación posible lo dice, en vez de
 * quedarse reintentando para siempre.
 */
export function assignSecretSanta(
  ids: string[],
  exclusions: [string, string][] = [],
  random: Random = randomInt
): DerangementResult {
  if (ids.length < 2) return {ok: false, reason: 'tooFew', blocked: []};
  if (new Set(ids).size !== ids.length) {
    throw new Error('assignSecretSanta necesita identificadores únicos');
  }

  const allowed = buildAllowed(ids, exclusions);

  // Sin exclusiones, barajar y encadenar da un ciclo directo: O(n), siempre
  // válido y uniforme entre todos los ciclos posibles. No hace falta buscar.
  if (exclusions.length === 0) {
    return {ok: true, strategy: 'cycle', assignments: cycleToAssignments(shuffle(ids, random))};
  }

  const matching = maximumMatching(ids, allowed, random);
  if (matching.size < ids.length) {
    const matchedGivers = new Set(matching.values());
    return {
      ok: false,
      reason: 'impossible',
      blocked: ids.filter((id) => !matchedGivers.has(id))
    };
  }

  const cycle = findCycle(ids, allowed, random, ids.length * 400);
  if (cycle) {
    return {ok: true, strategy: 'cycle', assignments: cycleToAssignments(cycle)};
  }

  // El ciclo no salió, pero el emparejamiento sí: sigue siendo un sorteo válido.
  const assignments = [...matching].map(([receiver, giver]) => ({giver, receiver}));
  return {ok: true, strategy: 'matching', assignments};
}

function cycleToAssignments(order: string[]): Assignment[] {
  return order.map((giver, index) => ({
    giver,
    receiver: order[(index + 1) % order.length] as string
  }));
}

/**
 * Comprueba que un resultado cumple las reglas. Se usa en los tests y como
 * red de seguridad antes de mandar un solo correo.
 */
export function isValidDerangement(
  ids: string[],
  assignments: Assignment[],
  exclusions: [string, string][] = []
): boolean {
  if (assignments.length !== ids.length) return false;

  const givers = new Set<string>();
  const receivers = new Set<string>();
  const blocked = new Set(exclusions.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));

  for (const {giver, receiver} of assignments) {
    if (giver === receiver) return false;
    if (givers.has(giver) || receivers.has(receiver)) return false;
    if (blocked.has(`${giver}|${receiver}`)) return false;
    givers.add(giver);
    receivers.add(receiver);
  }

  return ids.every((id) => givers.has(id) && receivers.has(id));
}
