import {NextResponse} from 'next/server';
import {and, isNull, lte, sql} from 'drizzle-orm';
import {getDb, isDatabaseConfigured, schema} from '@/lib/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Borra las direcciones de correo de los sorteos que ya pasaron su fecha de
 * caducidad. Las filas se quedan sin datos de contacto, para que el ID
 * verificable siga significando algo.
 *
 * Vercel lo llama a diario con `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({code: 'notConfigured'}, {status: 503});
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({code: 'unauthorized'}, {status: 401});
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({code: 'notConfigured'}, {status: 503});
  }

  const db = getDb();
  const now = new Date();

  const expired = await db
    .select({id: schema.draws.id})
    .from(schema.draws)
    .where(and(lte(schema.draws.purgeAfter, now), isNull(schema.draws.purgedAt)))
    .limit(500);

  if (expired.length === 0) {
    return NextResponse.json({purged: 0});
  }

  const ids = expired.map((row) => row.id);

  await db
    .update(schema.participants)
    .set({email: null})
    .where(sql`${schema.participants.drawId} = ANY(${ids})`);

  await db
    .update(schema.emailDeliveries)
    .set({toEmail: ''})
    .where(sql`${schema.emailDeliveries.drawId} = ANY(${ids})`);

  // Si quedó algún reparto sin borrar (por envíos fallidos), se va ahora.
  await db.delete(schema.assignments).where(sql`${schema.assignments.drawId} = ANY(${ids})`);

  await db
    .update(schema.draws)
    .set({purgedAt: now})
    .where(sql`${schema.draws.id} = ANY(${ids})`);

  return NextResponse.json({purged: ids.length});
}
