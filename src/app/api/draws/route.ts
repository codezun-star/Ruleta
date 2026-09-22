import {NextResponse} from 'next/server';
import {drawRequestSchema} from '@/lib/validation/draw';
import {DrawImpossibleError, runDraw} from '@/lib/draw/runDraw';
import {isDatabaseConfigured, NotConfiguredError} from '@/lib/db/client';
import {isEmailConfigured} from '@/lib/email/resend';
import {checkRateLimit, clientIp} from '@/lib/security/ratelimit';
import {verifyTurnstile} from '@/lib/security/turnstile';

export const runtime = 'nodejs';
/** El sorteo escribe y manda correos: nunca debe servirse de caché. */
export const dynamic = 'force-dynamic';

/** Cincuenta personas con nombre y correo no llegan ni de lejos a esto. */
const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: Request) {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({code: 'tooLarge'}, {status: 413});
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({code: 'tooLarge'}, {status: 413});
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({code: 'badRequest'}, {status: 400});
  }

  // La misma validación que el formulario, ahora del lado en el que se confía.
  const parsed = drawRequestSchema.safeParse(body);
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

  const limit = await checkRateLimit(request);
  if (!limit.allowed) {
    return NextResponse.json(
      {code: 'rateLimited', retryAfter: limit.retryAfter},
      {status: 429, headers: {'Retry-After': String(limit.retryAfter)}}
    );
  }

  if (!(await verifyTurnstile(parsed.data.turnstileToken, clientIp(request)))) {
    return NextResponse.json({code: 'captcha'}, {status: 403});
  }

  if (!isDatabaseConfigured() || !isEmailConfigured()) {
    return NextResponse.json({code: 'notConfigured'}, {status: 503});
  }

  try {
    return NextResponse.json(await runDraw(parsed.data.draw), {status: 201});
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
