import {useTranslations} from 'next-intl';
import {SectionHeading} from '@/components/ui/SectionHeading';

const STEPS = [1, 2, 3] as const;

export function HowItWorks() {
  const t = useTranslations('home.how');

  return (
    <section id="como-funciona" className="scroll-mt-16 border-y-2 border-ink bg-paper-2 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <SectionHeading numeral="二" eyebrow={t('eyebrow')} title={t('title')} />

        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step} className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-vermilion font-head text-base font-black text-on-vermilion"
              >
                {step}
              </span>
              <div>
                <h3 className="font-head text-xl font-black">{t(`step${step}.title`)}</h3>
                <p className="mt-1 text-ink-2">{t(`step${step}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
