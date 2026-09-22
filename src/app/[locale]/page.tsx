import {setRequestLocale} from 'next-intl/server';
import {Hero} from '@/components/landing/Hero';
import {Modes} from '@/components/landing/Modes';
import {HowItWorks} from '@/components/landing/HowItWorks';
import {Fairness} from '@/components/landing/Fairness';
import {Privacy} from '@/components/landing/Privacy';
import {Faq} from '@/components/landing/Faq';
import {AdLeaderboard} from '@/components/ads/AdBanner';
import {FinalCta} from '@/components/landing/FinalCta';
import {StructuredData} from '@/components/seo/StructuredData';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Modes />
      {/* Uno solo en la portada, y por debajo del pliegue: es la página que
          decide si alguien se queda, y no se le recibe con publicidad. */}
      <AdLeaderboard className="my-4 px-5" />
      <HowItWorks />
      <Fairness />
      <Privacy />
      <Faq />
      <FinalCta />
      <StructuredData locale={locale} />
    </>
  );
}
