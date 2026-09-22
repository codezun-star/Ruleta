import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {alternatesFor} from '@/lib/metadata';
import {BreadcrumbData} from '@/components/seo/StructuredData';
import {LegalPage} from '@/components/legal/LegalPage';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'legal.privacy'});
  return {
    title: t('title'),
    description: t('intro'),
    alternates: alternatesFor('/privacidad', locale)
  };
}

export default async function PrivacyPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'legal.privacy'});

  return (
    <>
      <BreadcrumbData locale={locale} href={'/privacidad'} name={t('title')} />
      <LegalPage namespace="privacy" />
    </>
  );
}
