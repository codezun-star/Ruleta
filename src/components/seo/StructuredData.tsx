import {getTranslations} from 'next-intl/server';
import {getPathname, type PathnameHref} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {BRAND, SITE_URL} from '@/config/brand';
import {FAQ_KEYS} from '@/components/landing/Faq';
import {LIMITS} from '@/lib/validation/limits';

/** `<` dentro del JSON cerraría el `<script>` antes de tiempo. */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

const absolute = (path: string) => `${SITE_URL}${path}`;

/**
 * Datos estructurados de la portada. El FAQPage y el HowTo salen de las mismas
 * traducciones que se pintan en la página: si el texto cambia, cambian los dos
 * a la vez y nunca se contradicen, que es lo que penaliza Google.
 */
export async function StructuredData({locale}: {locale: string}) {
  const meta = await getTranslations({locale, namespace: 'meta'});
  const faq = await getTranslations({locale, namespace: 'faq'});
  const how = await getTranslations({locale, namespace: 'home.how'});
  const modes = await getTranslations({locale, namespace: 'home.modes'});
  const decide = await getTranslations({locale, namespace: 'decide'});
  const turns = await getTranslations({locale, namespace: 'turns'});
  const teams = await getTranslations({locale, namespace: 'teams'});

  const home = absolute(getPathname({href: '/', locale}));

  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: BRAND.name,
      description: meta('description'),
      inLanguage: routing.locales,
      publisher: {'@id': `${SITE_URL}/#organization`}
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: BRAND.name,
      url: SITE_URL,
      logo: {'@type': 'ImageObject', url: absolute('/email/sello.png'), width: 220, height: 220},
      email: `${BRAND.mailbox}@${BRAND.domain}`
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: BRAND.name,
      url: home,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      inLanguage: locale,
      description: meta('description'),
      isAccessibleForFree: true,
      offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'},
      featureList: [
        modes('raffle.title'),
        modes('secretSanta.title'),
        decide('title'),
        turns('title'),
        teams('title'),
        modes('secretSanta.point1'),
        modes('secretSanta.point2'),
        modes('secretSanta.point3'),
        modes('raffle.point3')
      ],
      publisher: {'@id': `${SITE_URL}/#organization`}
    },
    {
      '@type': 'HowTo',
      '@id': `${SITE_URL}/#howto`,
      name: faq('q1.q'),
      description: faq('q1.a').split('\n\n')[0],
      inLanguage: locale,
      totalTime: 'PT3M',
      supply: {'@type': 'HowToSupply', name: `${LIMITS.minSecretSanta}–${LIMITS.max}`},
      step: [1, 2, 3].map((index) => ({
        '@type': 'HowToStep',
        position: index,
        name: how(`step${index}.title`),
        text: how(`step${index}.body`),
        url: `${home}#como-funciona`
      }))
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      inLanguage: locale,
      mainEntity: FAQ_KEYS.map((key) => ({
        '@type': 'Question',
        name: faq(`${key}.q`),
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq(`${key}.a`).replace(/\n\n/g, ' ')
        }
      }))
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJson({'@context': 'https://schema.org', '@graph': graph})
      }}
    />
  );
}

type Crumb = {href: PathnameHref; name: string};

/** Migas para las páginas interiores: le dice a Google dónde encaja cada una. */
export async function BreadcrumbData({
  locale,
  href,
  name,
  /** Nivel intermedio, para los artículos que cuelgan del blog. */
  parent
}: {
  locale: string;
  href: PathnameHref;
  name: string;
  parent?: Crumb;
}) {
  const meta = await getTranslations({locale, namespace: 'meta'});

  const trail: Crumb[] = [
    {href: '/', name: meta('title')},
    ...(parent ? [parent] : []),
    {href, name}
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJson({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: trail.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: absolute(getPathname({href: crumb.href, locale}))
          }))
        })
      }}
    />
  );
}
