/**
 * Fuente única del nombre de marca. Cambiar `name` aquí actualiza la interfaz,
 * los correos, el remitente y los metadatos: no debe haber ningún otro sitio
 * del código donde el nombre esté escrito a mano.
 */
export const BRAND = {
  name: 'Tómbola',
  /**
   * Versión sin acentos ni mayúsculas. De aquí cuelgan las claves de
   * almacenamiento y los prefijos, que no admiten un nombre con tilde y que
   * si no se quedarían con el nombre viejo sin que nadie lo note.
   */
  slug: 'tombola',
  domain: 'ruleta.codezun.com',
  mailbox: 'hola'
} as const;

/** Clave con el prefijo de la marca, para todo lo que viva en el navegador. */
export function storageKey(name: string): string {
  return `${BRAND.slug}-${name}`;
}

/**
 * Una variable de entorno declarada pero vacía llega como `''`, no como
 * `undefined`, así que `??` no la cubre. Esto sí.
 */
function env(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveSiteUrl(): string {
  const configured =
    env(process.env.NEXT_PUBLIC_SITE_URL) ??
    // En previews de Vercel el dominio lo pone la plataforma.
    env(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    env(process.env.VERCEL_URL);

  const candidate = configured ?? BRAND.domain;
  // Admite tanto "ruleta.codezun.com" como "https://ruleta.codezun.com/".
  const absolute = /^https?:\/\//.test(candidate) ? candidate : `https://${candidate}`;

  try {
    return new URL(absolute).origin;
  } catch {
    return `https://${BRAND.domain}`;
  }
}

/** Siempre una URL absoluta y válida: `metadataBase` no admite otra cosa. */
export const SITE_URL = resolveSiteUrl();

/** Remitente de Resend. El dominio debe estar verificado con SPF, DKIM y DMARC. */
export const EMAIL_FROM =
  env(process.env.EMAIL_FROM) ?? `${BRAND.name} <${BRAND.mailbox}@${BRAND.domain}>`;

export const EMAIL_REPLY_TO = env(process.env.EMAIL_REPLY_TO) ?? `${BRAND.mailbox}@${BRAND.domain}`;
