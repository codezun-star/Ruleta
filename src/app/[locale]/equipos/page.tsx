import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {alternatesFor} from '@/lib/metadata';
import {BreadcrumbData} from '@/components/seo/StructuredData';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {TeamsTool} from '@/components/tools/TeamsTool';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'teams'});
  return {
    title: t('title'),
    description: t('lede'),
    alternates: alternatesFor('/equipos', locale)
  };
}

export default async function TeamsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'teams'});

  return (
    <>
      <BreadcrumbData locale={locale} href={'/equipos'} name={t('heading')} />
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-5">
          <SectionHeading as="h1" eyebrow={t('title')} title={t('heading')} lede={t('lede')} />
          <div className="mt-8">
            <TeamsTool />
          </div>
        </div>
      </section>
    </>
  );
}
