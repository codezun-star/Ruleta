import {useTranslations} from 'next-intl';
import {SectionHeading} from '@/components/ui/SectionHeading';

/** Los apartados se numeran para poder citarlos: "el punto 4 de privacidad". */
const SECTIONS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'] as const;

export function LegalPage({namespace}: {namespace: 'privacy' | 'terms'}) {
  const t = useTranslations(`legal.${namespace}`);

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-3xl px-5">
        <SectionHeading eyebrow={t('updated')} title={t('title')} lede={t('intro')} />

        <div className="mt-10 flex flex-col gap-8">
          {SECTIONS.map((key, index) => {
            // Privacidad tiene ocho apartados y términos siete.
            if (namespace === 'terms' && key === 's8') return null;
            return (
              <article key={key} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper-hi font-head text-xs font-black"
                >
                  {index + 1}
                </span>
                <div>
                  <h2 className="font-head text-xl font-black">{t(`${key}.title`)}</h2>
                  {t(`${key}.body`)
                    .split('\n\n')
                    .map((paragraph) => (
                      <p key={paragraph} className="mt-2 whitespace-pre-line text-ink-2">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
