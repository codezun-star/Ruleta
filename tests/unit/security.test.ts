import {describe, expect, it} from 'vitest';
import {clientIp} from '@/lib/security/ratelimit';

const withHeaders = (headers: Record<string, string>) => new Request('https://x.test', {headers});

describe('clientIp', () => {
  it('toma la primera de x-forwarded-for, que es la del cliente', () => {
    expect(
      clientIp(withHeaders({'x-forwarded-for': '203.0.113.7, 70.41.3.18, 150.172.238.178'}))
    ).toBe('203.0.113.7');
  });

  it('quita los espacios', () => {
    expect(clientIp(withHeaders({'x-forwarded-for': '  203.0.113.7  '}))).toBe('203.0.113.7');
  });

  it('cae a x-real-ip', () => {
    expect(clientIp(withHeaders({'x-real-ip': '198.51.100.4'}))).toBe('198.51.100.4');
  });

  it('sin cabeceras no inventa una IP', () => {
    // Todos los anónimos comparten cubo: preferimos eso a no limitar nada.
    expect(clientIp(withHeaders({}))).toBe('desconocida');
  });
});
