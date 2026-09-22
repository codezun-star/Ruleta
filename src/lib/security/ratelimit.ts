import {Ratelimit} from '@upstash/ratelimit';
import {Redis} from '@upstash/redis';

/** Cinco sorteos por hora y por IP: de sobra para usarlo, poco para spamear. */
const WINDOW = '1 h';
const LIMIT = 5;

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({url, token}),
      limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
      prefix: 'kuji:draws',
      analytics: false
    });
  }
  return limiter;
}

/**
 * La IP real detrás del proxy de Vercel. `x-forwarded-for` puede traer una
 * cadena; la primera es la del cliente.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip')?.trim() || 'desconocida';
}

export type RateLimitVerdict = {
  allowed: boolean;
  /** Segundos que faltan para poder volver a intentarlo. */
  retryAfter: number;
  /** `false` cuando no hay Upstash configurado y por tanto no se limita nada. */
  enforced: boolean;
};

export async function checkRateLimit(request: Request): Promise<RateLimitVerdict> {
  const instance = getLimiter();
  // Sin Upstash no se bloquea a nadie: preferimos un despliegue que funcione
  // a uno que rechace todo por una variable que falta.
  if (!instance) return {allowed: true, retryAfter: 0, enforced: false};

  const {success, reset} = await instance.limit(clientIp(request));
  return {
    allowed: success,
    retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    enforced: true
  };
}
