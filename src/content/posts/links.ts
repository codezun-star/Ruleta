import {getPathname} from '@/i18n/navigation';
import {routing, type StaticPathname} from '@/i18n/routing';

const INTERNAL_LINK = /\]\((\/[^)\s]*)\)/g;

/**
 * Traduce los enlaces internos de un artículo al idioma en el que se pinta. El
 * texto los escribe en su forma interna —`/turnos`, `/blog/<slug>`— y aquí se
 * convierten en la dirección real, que en inglés es otra: `/en/turn-order`.
 *
 * Escribir `/es/turnos` a mano en el Markdown parece más simple y es una
 * trampa: ese enlace se queda en español dentro de un artículo en inglés, y
 * además se salta la tabla de rutas traducidas.
 *
 * Vive aquí y no en el renderizador a propósito: `markdown.tsx` no sabe nada
 * de rutas ni de idiomas, y así se puede probar sin levantar medio Next.
 */
export function localizeLinks(markdown: string, locale: string): string {
  const known = new Set(Object.keys(routing.pathnames));

  return markdown.replace(INTERNAL_LINK, (match, href: string) => {
    if (href.startsWith('/blog/')) {
      const slug = href.slice('/blog/'.length);
      return `](${getPathname({href: {pathname: '/blog/[slug]', params: {slug}}, locale})})`;
    }
    if (known.has(href)) {
      return `](${getPathname({href: href as StaticPathname, locale})})`;
    }
    // Una ruta que no conocemos se deja intacta: romperla en silencio sería
    // peor que servir el enlace tal y como lo escribió el artículo.
    return match;
  });
}
