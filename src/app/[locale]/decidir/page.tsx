import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {alternatesFor} from '@/lib/metadata';
import {BreadcrumbData} from '@/components/seo/StructuredData';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {DecisionTool} from '@/components/tools/DecisionTool';
import {AdLeaderboard} from '@/components/ads/AdBanner';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'decide'});
  return {
    title: t('title'),
    description: t('lede'),
    alternates: alternatesFor('/decidir', locale)
  };
}

export default async function DecidePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'decide'});

  return (
    <>
      <BreadcrumbData locale={locale} href={'/decidir'} name={t('heading')} />
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-5">
          <SectionHeading as="h1" eyebrow={t('title')} title={t('heading')} lede={t('lede')} />
          <div className="mt-8">
            <DecisionTool />
          </div>

          {/* Debajo de la herramienta y nunca encima: quien entra aquí viene a
              girar, y un anuncio entre el titular y la ruleta lo estorba. */}
          <AdLeaderboard className="mt-12" />
        </div>
      </section>
    </>
  );
}
