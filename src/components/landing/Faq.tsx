import {useTranslations} from 'next-intl';
import {SectionHeading} from '@/components/ui/SectionHeading';

/** Las preguntas se listan aquí para que el HTML y el JSON-LD no se separen. */
export const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const;

export function Faq() {
  const t = useTranslations('faq');

  return (
    <section
      id="preguntas"
      className="scroll-mt-16 border-t-2 border-ink bg-paper-2 py-14 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-5">
        <SectionHeading step={5} eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

        {/*
          Respuestas visibles, no plegadas: un acordeón esconde el texto justo
          del que los buscadores y los asistentes sacan la respuesta.
        */}
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {FAQ_KEYS.map((key) => (
            <article key={key}>
              <h3 className="font-head text-xl leading-snug font-black text-balance">
                {t(`${key}.q`)}
              </h3>
              {t(`${key}.a`)
                .split('\n\n')
                .map((paragraph) => (
                  <p key={paragraph} className="mt-2 text-ink-2">
                    {paragraph}
                  </p>
                ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
