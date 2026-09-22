import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import {sanitizeDatabaseUrl} from './url';

/**
 * El sitio tiene que poder desplegarse antes de que exista la base de datos:
 * si falta la configuración, quien la necesita lo dice con un error claro en
 * vez de tumbar el arranque.
 */
export class NotConfiguredError extends Error {
  constructor(readonly service: 'database' | 'email' | 'encryption') {
    super(`Falta configurar: ${service}`);
    this.name = 'NotConfiguredError';
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

let client: ReturnType<typeof postgres> | null = null;
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new NotConfiguredError('database');

  if (!database) {
    // `prepare: false` porque los pooler de Supabase, Neon y Vercel en modo
    // transacción no admiten sentencias preparadas.
    client = postgres(sanitizeDatabaseUrl(url), {prepare: false, max: 3});
    database = drizzle(client, {schema});
  }
  return database;
}

export {schema};
