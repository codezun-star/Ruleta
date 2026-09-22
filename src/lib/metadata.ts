import {getPathname} from '@/i18n/navigation';
import {routing, type AppPathname} from '@/i18n/routing';

/**
 * Con rutas traducidas, los `hreflang` no se pueden inventar concatenando el
 * idioma: `/en/privacidad` no existe, existe `/en/privacy`. `getPathname`
 * devuelve el que toca en cada idioma.
 */
export function alternatesFor(href: AppPathname, locale: string) {
  return {
    canonical: getPathname({href, locale}),
    languages: {
      ...Object.fromEntries(
        routing.locales.map((other) => [other, getPathname({href, locale: other})])
      ),
      'x-default': getPathname({href, locale: routing.defaultLocale})
    }
  };
}
