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

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domain}`;

/** Remitente de Resend. El dominio debe estar verificado con SPF, DKIM y DMARC. */
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? `${BRAND.name} <${BRAND.mailbox}@${BRAND.domain}>`;

export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO ?? `${BRAND.mailbox}@${BRAND.domain}`;

/**
 * Los únicos glifos japoneses que usamos como elemento gráfico. Se piden a
 * Google Fonts con el parámetro `text`, así que el archivo pesa unos pocos KB
 * en lugar de los megas del subset japonés completo.
 */
export const JA_GLYPHS =
  '福引抽選大当たりお楽しみに運試し縁起祭くじ秘密交換贈一二三四五六七八九十';
