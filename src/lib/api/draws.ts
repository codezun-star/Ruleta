import type {DrawConfig} from '@/lib/validation/draw';

export type DeliverySummary = {sent: number; failed: number; total: number};

export type DrawResponse =
  | {
      status: 'ok';
      drawId: string;
      shortId: string;
      winners?: {name: string; position: number}[];
      deliveries: DeliverySummary;
    }
  /** Todavía no hay base de datos ni Resend: el sorteo se hace en el navegador. */
  | {status: 'notConfigured'}
  | {status: 'impossible'}
  | {status: 'rateLimited'; retryAfter: number}
  | {status: 'captcha'}
  | {status: 'error'};

export async function createDraw(
  draw: DrawConfig,
  turnstileToken?: string | null
): Promise<DrawResponse> {
  let response: Response;
  try {
    response = await fetch('/api/draws', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({draw, turnstileToken: turnstileToken ?? undefined})
    });
  } catch {
    return {status: 'error'};
  }

  if (response.status === 503) return {status: 'notConfigured'};
  if (response.status === 409) return {status: 'impossible'};
  if (response.status === 403) return {status: 'captcha'};
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('Retry-After') ?? 0);
    return {status: 'rateLimited', retryAfter};
  }
  if (!response.ok) return {status: 'error'};

  const data = (await response.json()) as Omit<Extract<DrawResponse, {status: 'ok'}>, 'status'>;
  return {status: 'ok', ...data};
}

export async function retryDeliveries(
  drawId: string
): Promise<{sent: number; failed: number} | null> {
  try {
    const response = await fetch(`/api/draws/${drawId}/retry`, {method: 'POST'});
    if (!response.ok) return null;
    return (await response.json()) as {sent: number; failed: number};
  } catch {
    return null;
  }
}
