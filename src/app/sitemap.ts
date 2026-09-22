import type {MetadataRoute} from 'next';
import {getPathname} from '@/i18n/navigation';
import {routing, type AppPathname} from '@/i18n/routing';
import {SITE_URL} from '@/config/brand';

const PAGES: {
  href: AppPathname;
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
}[] = [
  {href: '/', priority: 1, changeFrequency: 'weekly'},
  {href: '/sorteo', priority: 0.9, changeFrequency: 'monthly'},
  {href: '/amigo-secreto', priority: 0.9, changeFrequency: 'monthly'},
  {href: '/privacidad', priority: 0.3, changeFrequency: 'yearly'},
  {href: '/terminos', priority: 0.3, changeFrequency: 'yearly'}
];

/** Una entrada por idioma, cada una declarando sus alternativas. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PAGES.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${getPathname({href: page.href, locale})}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((other) => [
            other,
            `${SITE_URL}${getPathname({href: page.href, locale: other})}`
          ])
        )
      }
    }))
  );
}
