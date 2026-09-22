import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
  /**
   * Rutas traducidas: la clave es la ruta interna (la carpeta en `app/`) y el
   * valor, lo que ve cada idioma en la barra de direcciones. `/en/amigo-secreto`
   * chirría; `/en/secret-santa` no.
   */
  pathnames: {
    '/': '/',
    '/sorteo': {es: '/sorteo', en: '/raffle'},
    '/amigo-secreto': {es: '/amigo-secreto', en: '/secret-santa'},
    '/decidir': {es: '/decidir', en: '/decide'},
    '/turnos': {es: '/turnos', en: '/turn-order'},
    '/equipos': {es: '/equipos', en: '/teams'},
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/privacidad': {es: '/privacidad', en: '/privacy'},
    '/terminos': {es: '/terminos', en: '/terms'}
  }
});

export type AppLocale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;

/**
 * Las rutas que se pueden enlazar tal cual. `/blog/[slug]` queda fuera a
 * propósito: sin el `slug` no es una dirección, y dejarla entrar aquí hace que
 * `getPathname` devuelva el corchete literal en el sitemap y en los canonical.
 */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}]`>;
