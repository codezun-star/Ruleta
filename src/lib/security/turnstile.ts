const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

/**
 * Comprueba el token del captcha contra Cloudflare. Si no hay clave secreta
 * configurada no se exige nada: el sitio tiene que poder funcionar sin ello.
 */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;
  if (!token) return false;

  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip !== 'desconocida') body.append('remoteip', ip);

  try {
    const response = await fetch(VERIFY_URL, {method: 'POST', body});
    if (!response.ok) return false;
    const result = (await response.json()) as {success?: boolean};
    return result.success === true;
  } catch {
    // Si Cloudflare no responde, no dejamos pasar: el captcha está para eso.
    return false;
  }
}
