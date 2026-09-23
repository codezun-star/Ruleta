import type {MetadataRoute} from 'next';
import {SITE_URL} from '@/config/brand';

/**
 * Los rastreadores de los asistentes se listan a propósito, aunque `*` ya los
 * cubra: queremos que nos citen, y dejarlo escrito evita que un cambio futuro
 * en la regla general los bloquee sin querer.
 */
const ANSWER_ENGINES = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot'
];

/**
 * `/ads/` no es contenido: es el documento que hospeda cada banner dentro de
 * un iframe. Indexado sería una página en blanco con un anuncio.
 */
const DISALLOW = ['/api/', '/ads/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {userAgent: '*', allow: '/', disallow: DISALLOW},
      ...ANSWER_ENGINES.map((userAgent) => ({userAgent, allow: '/', disallow: DISALLOW}))
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
