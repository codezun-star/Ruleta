import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {BRAND, JA_GLYPHS, SITE_URL} from '@/config/brand';
import {fontVariables} from '@/lib/fonts';
import {themeInitScript} from '@/lib/theme';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import '@/styles/globals.css';

/**
 * Subset por `text=`: pedimos a Google solo los glifos decorativos de
 * JA_GLYPHS, unos pocos KB, en vez del subset japonés completo. El resto de
 * fuentes van autoalojadas con `next/font`.
 */
const JA_FONT_HREF = `https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;700&text=${encodeURIComponent(
  JA_GLYPHS
)}&display=swap`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'meta'});

  return {
    metadataBase: new URL(SITE_URL),
    title: {default: `${BRAND.name} — ${t('title')}`, template: `%s · ${BRAND.name}`},
    description: t('description'),
    applicationName: BRAND.name,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
        'x-default': `/${routing.defaultLocale}`
      }
    },
    openGraph: {
      type: 'website',
      siteName: BRAND.name,
      locale,
      url: `/${locale}`,
      title: `${BRAND.name} — ${t('title')}`,
      description: t('description')
    },
    icons: {icon: '/favicon.svg'}
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'nav'});

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Fija el tema antes del primer pintado para que no parpadee. */}
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={JA_FONT_HREF} />
      </head>
      <body>
        <div className="paper-grain" aria-hidden="true" />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:border-2 focus:border-ink focus:bg-mustard focus:px-4 focus:py-2 focus:font-bold"
        >
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider>
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
