import {NextResponse} from 'next/server';
import {z} from 'zod';
import {retryFailed} from '@/lib/draw/runDraw';
import {isDatabaseConfigured, NotConfiguredError} from '@/lib/db/client';
import {isEmailConfigured} from '@/lib/email/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const drawId = z.uuid();

export async function POST(_request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  if (!drawId.safeParse(id).success) {
    return NextResponse.json({code: 'badRequest'}, {status: 400});
  }
  if (!isDatabaseConfigured() || !isEmailConfigured()) {
    return NextResponse.json({code: 'notConfigured'}, {status: 503});
  }

  try {
    return NextResponse.json(await retryFailed(id));
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return NextResponse.json({code: 'notConfigured', service: error.service}, {status: 503});
    }
    console.error('El reintento falló', error);
    return NextResponse.json({code: 'serverError'}, {status: 500});
  }
}
