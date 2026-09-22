import type {Metadata, Viewport} from 'next';
import type {ReactNode} from 'react';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {alternatesFor} from '@/lib/metadata';
import {BRAND, SITE_URL} from '@/config/brand';
import {fontVariables} from '@/lib/fonts';
import {themeInitScript} from '@/lib/theme';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {TabBar} from '@/components/layout/TabBar';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

/**
 * `viewportFit: 'cover'` es lo que hace que `env(safe-area-inset-*)` deje de
 * valer cero: sin él la app se queda dentro del rectángulo seguro y nunca
 * llega al borde de la pantalla, que es justo lo que distingue una web de una
 * aplicación instalada.
 *
 * `maximumScale` se deja en 5: bloquear el zoom se ve más "nativo" y es una
 * barrera de accesibilidad real para quien necesita ampliar. El zoom por doble
 * toque, que sí estorba al pulsar, se desactiva con `touch-action` en el CSS.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#e7d9bc'},
    {media: '(prefers-color-scheme: dark)', color: '#0d161f'}
  ]
};

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'meta'});

  return {
    metadataBase: new URL(SITE_URL),
    // El término de búsqueda primero y la marca al final: para un sitio nuevo
    // el nombre todavía no aporta nada en el listado de resultados.
    title: {default: `${t('title')} · ${BRAND.name}`, template: `%s · ${BRAND.name}`},
    description: t('description'),
    applicationName: BRAND.name,
    keywords: t('keywords').split(', '),
    formatDetection: {telephone: false, address: false, email: false},
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1
      }
    },
    alternates: alternatesFor('/', locale),
    openGraph: {
      type: 'website',
      siteName: BRAND.name,
      locale,
      alternateLocale: routing.locales.filter((other) => other !== locale),
      url: `/${locale}`,
      title: `${t('title')} · ${BRAND.name}`,
      description: t('description')
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('title')} · ${BRAND.name}`,
      description: t('description')
    },
    icons: {icon: '/favicon.svg', apple: '/apple-icon.png'},
    // Instalada en la pantalla de inicio se abre sin barra de navegador, y la
    // barra de estado se funde con la cabecera en vez de recortarla.
    appleWebApp: {capable: true, title: BRAND.name, statusBarStyle: 'default'}
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
      </head>
      <body className="pb-[calc(env(safe-area-inset-bottom,0px)+var(--tabbar-h))] md:pb-0">
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
          <TabBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
