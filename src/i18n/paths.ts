import {routing, type StaticPathname} from './routing';

/**
 * La dirección de una ruta estática en un idioma, sin pasar por
 * `next-intl/navigation`.
 *
 * Existe para los correos: se renderizan fuera del ciclo de una petición —y en
 * el script de previsualización, fuera de Next entero—, donde importar la
 * navegación arrastra `next/navigation` y revienta. Aquí solo hace falta la
 * tabla de rutas, que es un objeto plano.
 *
 * Con `localePrefix: 'always'` la dirección es siempre el prefijo del idioma
 * más lo que diga la tabla, que es justo lo que devuelve `getPathname`.
 */
export function localePath(href: StaticPathname, locale: string): string {
  const known = routing.locales.includes(locale as (typeof routing.locales)[number])
    ? locale
    : routing.defaultLocale;

  const entry = routing.pathnames[href];
  const path = typeof entry === 'string' ? entry : entry[known as 'es' | 'en'];

  // La raíz es '/' y concatenarla dejaría '/es/', con una barra de más que
  // convierte el enlace en una redirección innecesaria.
  return path === '/' ? `/${known}` : `/${known}${path}`;
}
