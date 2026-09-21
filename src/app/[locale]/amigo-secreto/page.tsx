import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {WizardShell} from '@/components/wizard/WizardShell';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'secretSanta'});
  return {title: t('title'), description: t('lede')};
}

export default async function SecretSantaPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <WizardShell namespace="secretSanta" numeral="二" />;
}
