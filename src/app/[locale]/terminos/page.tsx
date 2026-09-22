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
  const t = await getTranslations({locale, namespace: 'legal.terms'});
  return {
    title: t('title'),
    description: t('intro'),
    alternates: alternatesFor('/terminos', locale)
  };
}

export default async function TermsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'legal.terms'});

  return (
    <>
      <BreadcrumbData locale={locale} href={'/terminos'} name={t('title')} />
      <LegalPage namespace="terms" />
    </>
  );
}
