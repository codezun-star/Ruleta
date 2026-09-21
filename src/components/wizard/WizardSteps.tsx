import {useTranslations} from 'next-intl';
import {cn} from '@/lib/cn';

const STEPS = ['participants', 'details', 'review'] as const;

/** Barra de progreso del asistente. El paso activo va en sello rojo. */
export function WizardSteps({current}: {current: 1 | 2 | 3}) {
  const t = useTranslations('wizard');

  return (
    <ol className="flex flex-wrap items-center gap-y-2">
      {STEPS.map((step, index) => {
        const number = index + 1;
        const done = number <= current;
        return (
          <li key={step} className="flex items-center">
            {index > 0 ? <span aria-hidden="true" className="mx-3 h-0.5 w-5 bg-ink sm:w-9" /> : null}
            <span className="flex items-center gap-2.5" aria-current={number === current ? 'step' : undefined}>
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-8 place-items-center rounded-full border-2 border-ink font-head text-sm font-black',
                  done ? 'bg-vermilion text-on-vermilion' : 'bg-paper-hi text-ink'
                )}
              >
                {number}
              </span>
              <span className="text-sm font-medium">{t(step)}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
