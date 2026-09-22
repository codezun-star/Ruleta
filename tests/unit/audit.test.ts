import {describe, expect, it} from 'vitest';
import {createSeed, fingerprint, randomTicketId, shortId} from '@/lib/draw/audit';

describe('fingerprint', () => {
  it('con los mismos datos da siempre la misma huella', async () => {
    const a = await fingerprint('semilla', '2026-12-01T10:00:00.000Z', ['p1', 'p2']);
    const b = await fingerprint('semilla', '2026-12-01T10:00:00.000Z', ['p1', 'p2']);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('no depende del orden en que vengan los participantes', async () => {
    const a = await fingerprint('semilla', '2026-12-01T10:00:00.000Z', ['p1', 'p2', 'p3']);
    const b = await fingerprint('semilla', '2026-12-01T10:00:00.000Z', ['p3', 'p1', 'p2']);
    expect(a).toBe(b);
  });

  it('cambia si cambia la semilla, el momento o la lista', async () => {
    const base = await fingerprint('semilla', '2026-12-01T10:00:00.000Z', ['p1']);
    expect(await fingerprint('otra', '2026-12-01T10:00:00.000Z', ['p1'])).not.toBe(base);
    expect(await fingerprint('semilla', '2026-12-01T10:00:01.000Z', ['p1'])).not.toBe(base);
    expect(await fingerprint('semilla', '2026-12-01T10:00:00.000Z', ['p2'])).not.toBe(base);
  });
});

describe('createSeed', () => {
  it('da 32 bytes en hexadecimal y no se repite', () => {
    const seed = createSeed();
    expect(seed).toMatch(/^[0-9a-f]{64}$/);
    expect(new Set(Array.from({length: 100}, createSeed)).size).toBe(100);
  });
});

describe('shortId', () => {
  it('tiene forma de boleto y no usa caracteres que se confundan', () => {
    const id = shortId('a1b2c3d4e5f60718293a4b5c6d7e8f90');
    expect(id).toMatch(/^[A-HJ-NP-Z2-9]{3}-[A-HJ-NP-Z2-9]{4}$/);
    expect(id).not.toMatch(/[01OI]/);
  });

  it('es estable para la misma huella', () => {
    const hex = 'ffeeddccbbaa99887766554433221100';
    expect(shortId(hex)).toBe(shortId(hex));
  });
});

describe('randomTicketId', () => {
  it('respeta el mismo formato', () => {
    for (let i = 0; i < 200; i++) {
      expect(randomTicketId()).toMatch(/^[A-HJ-NP-Z2-9]{3}-[A-HJ-NP-Z2-9]{4}$/);
    }
  });
});
