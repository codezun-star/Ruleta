import {NotConfiguredError} from '@/lib/db/client';

const ALGORITHM = 'AES-GCM';
/** 96 bits es el nonce recomendado para GCM. */
const NONCE_BYTES = 12;

export type SealedValue = {nonce: string; ciphertext: string};

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

/**
 * Copia a un `ArrayBuffer` propio: el `Buffer` de Node comparte un búfer
 * mayor, y `crypto.subtle` exige uno exclusivo.
 */
function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const decoded = Buffer.from(value, 'base64');
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length));
  bytes.set(decoded);
  return bytes;
}

let cachedKey: CryptoKey | null = null;

/**
 * La clave vive solo en el servidor. Ni el organizador ni nadie con acceso a
 * la base de datos puede leer el reparto sin ella.
 */
export async function getAssignmentKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const raw = process.env.ASSIGNMENTS_ENCRYPTION_KEY?.trim();
  if (!raw) throw new NotConfiguredError('encryption');

  const bytes = fromBase64(raw);
  if (bytes.length !== 32) {
    throw new Error(
      `ASSIGNMENTS_ENCRYPTION_KEY tiene ${bytes.length} bytes y necesita 32. Genérala con: openssl rand -base64 32`
    );
  }

  cachedKey = await crypto.subtle.importKey('raw', bytes, ALGORITHM, false, ['encrypt', 'decrypt']);
  return cachedKey;
}

export async function seal(plaintext: string, key: CryptoKey): Promise<SealedValue> {
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  const encrypted = await crypto.subtle.encrypt(
    {name: ALGORITHM, iv: nonce},
    key,
    new TextEncoder().encode(plaintext)
  );
  return {nonce: toBase64(nonce), ciphertext: toBase64(new Uint8Array(encrypted))};
}

export async function unseal(sealed: SealedValue, key: CryptoKey): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    {name: ALGORITHM, iv: fromBase64(sealed.nonce)},
    key,
    fromBase64(sealed.ciphertext)
  );
  return new TextDecoder().decode(decrypted);
}

/** Solo para los tests y para `openssl rand -base64 32` desde código. */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({name: ALGORITHM, length: 256}, false, ['encrypt', 'decrypt']);
}
