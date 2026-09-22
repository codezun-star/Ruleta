import {describe, expect, it} from 'vitest';
import {getTableColumns} from 'drizzle-orm';
import {purgeDeadline} from '@/lib/draw/runDraw';
import {draws, participants, emailDeliveries} from '@/lib/db/schema';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const BASE = new Date('2026-09-22T10:00:00.000Z');

describe('purgeDeadline', () => {
  it('da 72 horas cuando salió todo', () => {
    expect(purgeDeadline(BASE, true).getTime() - BASE.getTime()).toBe(72 * HOUR);
  });

  it('da 10 días cuando algo falló y hay que poder reintentar', () => {
    expect(purgeDeadline(BASE, false).getTime() - BASE.getTime()).toBe(10 * DAY);
  });

  /**
   * El invariante que de verdad importa: el plazo del sorteo entregado nunca
   * puede pasarse del otro. Si alguien toca las constantes y los cruza, un
   * sorteo con envíos fallidos perdería las direcciones antes de que el
   * reintento fuera posible, que es justo lo que ese plazo existe para evitar.
   */
  it('el plazo entregado siempre es más corto que el de fallos', () => {
    expect(purgeDeadline(BASE, true).getTime()).toBeLessThan(purgeDeadline(BASE, false).getTime());
  });

  it('no toca la fecha de origen', () => {
    const original = BASE.getTime();
    purgeDeadline(BASE, true);
    expect(BASE.getTime()).toBe(original);
  });
});

/**
 * El correo del organizador estuvo guardado para siempre mientras la política
 * prometía que se borraba: el cron limpiaba las otras dos columnas y esa no.
 * Esto no puede volver a pasar en silencio, así que se enumeran todas las
 * columnas que guardan una dirección y se comparan con las que el cron limpia.
 * Añadir una columna nueva rompe el test hasta que alguien decida qué hacer
 * con ella.
 */
describe('columnas con datos de contacto', () => {
  const PURGED = ['draws.organizerEmail', 'participants.email', 'emailDeliveries.toEmail'];

  it('el cron cubre todas las que existen', () => {
    const tables = {draws, participants, emailDeliveries};
    const found: string[] = [];

    for (const [name, table] of Object.entries(tables)) {
      for (const column of Object.keys(getTableColumns(table))) {
        if (/email/i.test(column)) found.push(`${name}.${column}`);
      }
    }

    expect(found.sort()).toEqual([...PURGED].sort());
  });
});
