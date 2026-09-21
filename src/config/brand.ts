/**
 * Fuente única del nombre de marca. Cambiar `name` aquí actualiza la interfaz,
 * los correos, el remitente y los metadatos: no debe haber ningún otro sitio
 * del código donde el nombre esté escrito a mano.
 */
export const BRAND = {
  name: 'Kuji',
  /** くじ — "el papelito del sorteo". Decorativo, nunca sustituye al texto. */
  nameJa: 'くじ',
  /** 福 — "fortuna". Va en el eje de la ruleta y en el favicon. */
  glyph: '福',
  domain: 'ruleta.codezun.com',
  mailbox: 'hola'
} as const;

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
    (env(process.env.VERCEL_PROJECT_PRODUCTION_URL) ?? env(process.env.VERCEL_URL));

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

export const EMAIL_REPLY_TO =
  env(process.env.EMAIL_REPLY_TO) ?? `${BRAND.mailbox}@${BRAND.domain}`;

/**
 * Los únicos glifos japoneses que usamos como elemento gráfico. Se piden a
 * Google Fonts con el parámetro `text`, así que el archivo pesa unos pocos KB
 * en lugar de los megas del subset japonés completo.
 */
export const JA_GLYPHS =
  '福引抽選大当たりお楽しみに運試し縁起祭くじ秘密交換贈一二三四五六七八九十';
