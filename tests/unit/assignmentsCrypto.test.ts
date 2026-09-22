import {describe, expect, it} from 'vitest';
import {generateKey, seal, unseal} from '@/lib/crypto/assignments';

describe('cifrado de asignaciones', () => {
  it('lo que se cifra se recupera igual', async () => {
    const key = await generateKey();
    const sealed = await seal('participante-42', key);
    expect(await unseal(sealed, key)).toBe('participante-42');
  });

  it('el mismo valor cifrado dos veces no se parece', async () => {
    const key = await generateKey();
    const a = await seal('mismo-valor', key);
    const b = await seal('mismo-valor', key);
    // Nonce nuevo en cada cifrado: si no, dos asignaciones iguales se notarían.
    expect(a.nonce).not.toBe(b.nonce);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('otra clave no puede leerlo', async () => {
    const sealed = await seal('secreto', await generateKey());
    await expect(unseal(sealed, await generateKey())).rejects.toThrow();
  });

  it('un texto cifrado manipulado no pasa: GCM autentica', async () => {
    const key = await generateKey();
    const sealed = await seal('secreto', key);
    const bytes = Buffer.from(sealed.ciphertext, 'base64');
    bytes[0] = (bytes[0]! ^ 0xff) & 0xff;
    await expect(
      unseal({nonce: sealed.nonce, ciphertext: bytes.toString('base64')}, key)
    ).rejects.toThrow();
  });

  it('aguanta acentos y emoji', async () => {
    const key = await generateKey();
    const value = 'Rubén Peñaloza 🎁';
    expect(await unseal(await seal(value, key), key)).toBe(value);
  });
});
