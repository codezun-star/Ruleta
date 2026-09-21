import {setRequestLocale} from 'next-intl/server';
import {Hero} from '@/components/landing/Hero';
import {Modes} from '@/components/landing/Modes';
import {HowItWorks} from '@/components/landing/HowItWorks';
import {Fairness} from '@/components/landing/Fairness';
import {Privacy} from '@/components/landing/Privacy';
import {FinalCta} from '@/components/landing/FinalCta';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Modes />
      <HowItWorks />
      <Fairness />
      <Privacy />
      <FinalCta />
    </>
  );
}
