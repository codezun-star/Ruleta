import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {alternatesFor} from '@/lib/metadata';
import {BreadcrumbData} from '@/components/seo/StructuredData';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {WizardProvider} from '@/components/wizard/WizardProvider';
import {Wizard} from '@/components/wizard/Wizard';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'secretSanta'});
  return {
    title: t('title'),
    description: t('lede'),
    alternates: alternatesFor('/amigo-secreto', locale)
  };
}

export default async function SecretSantaPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'secretSanta'});

  return (
    <>
      <BreadcrumbData locale={locale} href={'/amigo-secreto'} name={t('heading')} />
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-4xl px-5">
          <SectionHeading as="h1" eyebrow={t('title')} title={t('heading')} lede={t('lede')} />
          <div className="mt-8">
            <WizardProvider mode="secretSanta">
              <Wizard />
            </WizardProvider>
          </div>
        </div>
      </section>
    </>
  );
}
