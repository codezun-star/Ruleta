/** Sin 0/O ni 1/I: un código que alguien pueda dictar por teléfono. */
const TICKET_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Semilla del sorteo. Se guarda junto al hash para poder reconstruirlo. */
export function createSeed(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Huella del sorteo: SHA-256 de la semilla, el momento y la lista. Registrarla
 * al crear el sorteo es lo que permite demostrar después que no se repitió
 * hasta que saliera quien convenía.
 */
export async function fingerprint(seed: string, createdAt: string, ids: string[]): Promise<string> {
  const payload = `${seed}|${createdAt}|${[...ids].sort().join(',')}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Versión corta y legible de la huella, con forma de boleto. */
export function shortId(hex: string): string {
  const code = Array.from({length: 7}, (_, index) => {
    const byte = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16) || 0;
    return TICKET_ALPHABET[byte % TICKET_ALPHABET.length];
  }).join('');
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/** Id de boleto sin huella previa, para sorteos que aún no pasan por servidor. */
export function randomTicketId(): string {
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (byte) => TICKET_ALPHABET[byte % TICKET_ALPHABET.length]).join('');
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}
