import {NextResponse} from 'next/server';
import {drawSchema} from '@/lib/validation/draw';
import {DrawImpossibleError, runDraw} from '@/lib/draw/runDraw';
import {isDatabaseConfigured, NotConfiguredError} from '@/lib/db/client';
import {isEmailConfigured} from '@/lib/email/resend';

export const runtime = 'nodejs';
/** El sorteo escribe y manda correos: nunca debe servirse de caché. */
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({code: 'badRequest'}, {status: 400});
  }

  // La misma validación que el formulario, ahora del lado en el que se confía.
  const parsed = drawSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: 'invalid',
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      },
      {status: 422}
    );
  }

  if (!isDatabaseConfigured() || !isEmailConfigured()) {
    return NextResponse.json({code: 'notConfigured'}, {status: 503});
  }

  try {
    return NextResponse.json(await runDraw(parsed.data), {status: 201});
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return NextResponse.json({code: 'notConfigured', service: error.service}, {status: 503});
    }
    if (error instanceof DrawImpossibleError) {
      return NextResponse.json({code: 'impossible'}, {status: 409});
    }
    console.error('El sorteo falló', error);
    return NextResponse.json({code: 'serverError'}, {status: 500});
  }
}
