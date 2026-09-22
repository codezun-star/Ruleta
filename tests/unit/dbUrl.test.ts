import {describe, expect, it} from 'vitest';
import postgres from 'postgres';
import {sanitizeDatabaseUrl} from '@/lib/db/url';

/**
 * La cadena de Neon trae `channel_binding=require`, que libpq entiende y
 * Postgres no. `postgres-js` manda al arranque de la conexión todo parámetro
 * que no reconoce, así que colarlo tumba la conexión entera. Estas pruebas
 * miran lo que acaba en `options.connection`, que es lo que se envía de
 * verdad, en vez de dar por bueno que la cadena "se ve bien".
 */
const NEON =
  'postgresql://usuario:clave@ep-ejemplo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function connectionParams(url: string): Record<string, string> {
  const sql = postgres(url, {prepare: false, max: 1});
  const {application_name: _ignored, ...rest} = sql.options.connection;
  void sql.end();
  return rest as Record<string, string>;
}

describe('sanitizeDatabaseUrl', () => {
  it('quita channel_binding, que Postgres rechazaría', () => {
    expect(connectionParams(NEON)).toHaveProperty('channel_binding');
    expect(connectionParams(sanitizeDatabaseUrl(NEON))).toEqual({});
  });

  it('conserva sslmode, que sí hace falta contra Neon', () => {
    const sql = postgres(sanitizeDatabaseUrl(NEON), {prepare: false, max: 1});
    expect(sql.options.ssl).toBe('require');
    void sql.end();
  });

  it('no toca el host, la base ni las credenciales', () => {
    const sql = postgres(sanitizeDatabaseUrl(NEON), {prepare: false, max: 1});
    expect(sql.options.host).toEqual(['ep-ejemplo-pooler.us-east-2.aws.neon.tech']);
    expect(sql.options.database).toBe('neondb');
    expect(sql.options.user).toBe('usuario');
    expect(sql.options.pass).toBe('clave');
    void sql.end();
  });

  it('quita el pgbouncer de Supabase y Prisma', () => {
    const url = 'postgresql://u:p@host:6543/db?pgbouncer=true&sslmode=require';
    expect(connectionParams(url)).toHaveProperty('pgbouncer');
    expect(connectionParams(sanitizeDatabaseUrl(url))).toEqual({});
  });

  it('deja intacta una cadena que ya está limpia', () => {
    const url = 'postgresql://u:p@host:5432/db?sslmode=require';
    expect(connectionParams(sanitizeDatabaseUrl(url))).toEqual({});
    expect(sanitizeDatabaseUrl(url)).toContain('sslmode=require');
  });

  it('devuelve tal cual lo que no es una URL, para que el error lo dé el driver', () => {
    expect(sanitizeDatabaseUrl('esto no es una url')).toBe('esto no es una url');
  });
});
