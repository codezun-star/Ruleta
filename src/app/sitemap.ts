import type {MetadataRoute} from 'next';
import {getPathname, type PathnameHref} from '@/i18n/navigation';
import {routing, type StaticPathname} from '@/i18n/routing';
import {SITE_URL} from '@/config/brand';
import {postsFor} from '@/content/posts';

const PAGES: {
  href: StaticPathname;
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
}[] = [
  {href: '/', priority: 1, changeFrequency: 'weekly'},
  {href: '/sorteo', priority: 0.9, changeFrequency: 'monthly'},
  {href: '/amigo-secreto', priority: 0.9, changeFrequency: 'monthly'},
  {href: '/decidir', priority: 0.8, changeFrequency: 'monthly'},
  {href: '/turnos', priority: 0.8, changeFrequency: 'monthly'},
  {href: '/equipos', priority: 0.8, changeFrequency: 'monthly'},
  {href: '/blog', priority: 0.7, changeFrequency: 'weekly'},
  {href: '/privacidad', priority: 0.3, changeFrequency: 'yearly'},
  {href: '/terminos', priority: 0.3, changeFrequency: 'yearly'}
];

type Entry = {
  href: PathnameHref;
  locale: string;
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
  /** Los artículos traen su propia fecha; las páginas, la del despliegue. */
  lastModified: Date;
  /** Un artículo solo existe en su idioma, así que no declara alternativas. */
  translated: boolean;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const deployed = new Date();

  /** Las páginas: una entrada por idioma, cada una declarando sus alternativas. */
  const pages: Entry[] = PAGES.flatMap((page) =>
    routing.locales
      // El índice del blog solo existe donde hay artículos: en los demás
      // idiomas devuelve 404 y listarlo sería mandar a Google a una página rota.
      .filter((locale) => page.href !== '/blog' || postsFor(locale).length > 0)
      .map((locale) => ({
        href: page.href,
        locale,
        priority: page.priority,
        changeFrequency: page.changeFrequency,
        lastModified: deployed,
        // Sin traducción del blog, el índice tampoco puede declarar alternativas.
        translated: page.href !== '/blog'
      }))
  );

  /** Los artículos: solo aparecen en el idioma en el que están escritos. */
  const posts: Entry[] = routing.locales.flatMap((locale) =>
    postsFor(locale).map((post) => ({
      href: {pathname: '/blog/[slug]' as const, params: {slug: post.slug}},
      locale,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
      lastModified: new Date(post.updated ?? post.published),
      translated: false
    }))
  );

  return [...pages, ...posts].map((entry) => ({
    url: `${SITE_URL}${getPathname({href: entry.href, locale: entry.locale})}`,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    ...(entry.translated
      ? {
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((other) => [
                other,
                `${SITE_URL}${getPathname({href: entry.href, locale: other})}`
              ])
            )
          }
        }
      : {})
  }));
}
