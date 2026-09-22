import {z} from 'zod';
import {LIMITS} from './limits';

/**
 * Los mensajes son **claves de traducción**, no texto: el mismo esquema corre
 * en el navegador y en el servidor, y cada lado las resuelve en su idioma.
 */
export const participantSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'nameRequired').max(LIMITS.maxNameLength, 'nameTooLong'),
  email: z.union([z.literal(''), z.email('emailInvalid')])
});

export type Participant = z.infer<typeof participantSchema>;

export type ParticipantIssue = {
  /** Índice en la lista, o `null` si el problema es de la lista entera. */
  index: number | null;
  field: 'name' | 'email' | 'list';
  key: string;
  params?: Record<string, number>;
};

type ListOptions = {
  min: number;
  /** El amigo secreto necesita el correo de todos; el sorteo simple no. */
  requireEmail: boolean;
};

/**
 * Valida la lista completa. Devuelve todos los problemas a la vez en lugar de
 * parar en el primero, para poder marcar cada fila en su sitio.
 */
export function validateParticipants(
  participants: Participant[],
  {min, requireEmail}: ListOptions
): ParticipantIssue[] {
  const issues: ParticipantIssue[] = [];

  participants.forEach((participant, index) => {
    const parsed = participantSchema.safeParse(participant);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] === 'email' ? 'email' : 'name';
        issues.push({index, field, key: issue.message});
      }
    }
    if (requireEmail && participant.email.trim() === '') {
      issues.push({index, field: 'email', key: 'emailRequired'});
    }
  });

  // Duplicados: se marca la repetición, no la primera aparición.
  const seenEmails = new Map<string, number>();
  const seenNames = new Map<string, number>();
  participants.forEach((participant, index) => {
    const email = participant.email.trim().toLowerCase();
    if (email) {
      if (seenEmails.has(email)) issues.push({index, field: 'email', key: 'duplicateEmail'});
      else seenEmails.set(email, index);
    }
    const name = participant.name.trim().toLowerCase();
    if (name) {
      if (seenNames.has(name)) issues.push({index, field: 'name', key: 'duplicateName'});
      else seenNames.set(name, index);
    }
  });

  const filled = participants.filter((p) => p.name.trim() !== '').length;
  if (filled < min) {
    issues.push({index: null, field: 'list', key: 'tooFewParticipants', params: {min}});
  }
  if (participants.length > LIMITS.max) {
    issues.push({
      index: null,
      field: 'list',
      key: 'tooManyParticipants',
      params: {max: LIMITS.max}
    });
  }

  return issues;
}

/**
 * Convierte texto pegado en participantes. Acepta una persona por línea, con
 * el correo separado por coma, punto y coma, tabulador o entre < >.
 */
export function parsePastedParticipants(text: string): {name: string; email: string}[] {
  return text
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const angled = line.match(/^(.*?)<([^>]+)>\s*$/);
      if (angled) {
        return {name: (angled[1] ?? '').trim(), email: (angled[2] ?? '').trim()};
      }
      const parts = line.split(/[,;\t]+/).map((part) => part.trim());
      const email = parts.find((part) => part.includes('@')) ?? '';
      const name = parts.find((part) => part !== email) ?? '';
      return {name: name || email, email};
    })
    .filter((entry) => entry.name !== '');
}
