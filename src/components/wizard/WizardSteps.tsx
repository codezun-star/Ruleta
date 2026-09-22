import {useTranslations} from 'next-intl';
import {cn} from '@/lib/cn';

const STEPS = ['participants', 'details', 'review'] as const;

/** Barra de progreso del asistente. El paso activo va en sello rojo. */
export function WizardSteps({current}: {current: 1 | 2 | 3}) {
  const t = useTranslations('wizard');

  return (
    <ol className="flex items-center gap-x-2 sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
      {STEPS.map((step, index) => {
        const number = index + 1;
        const done = number <= current;
        return (
          <li key={step} className="flex items-center">
            {index > 0 ? (
              <span aria-hidden="true" className="mx-2 h-0.5 w-4 bg-ink sm:mx-3 sm:w-9" />
            ) : null}
            <span
              className="flex items-center gap-2.5"
              aria-current={number === current ? 'step' : undefined}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-8 place-items-center rounded-full border-2 border-ink font-head text-sm font-black',
                  done ? 'bg-vermilion text-on-vermilion' : 'bg-paper-hi text-ink'
                )}
              >
                {number}
              </span>
              {/*
                Los tres rótulos no caben en una pantalla de teléfono y la fila
                se partía en dos. En móvil se enseña solo el del paso en curso,
                que es el único que hace falta leer; los otros siguen ahí para
                quien use un lector de pantalla.
              */}
              <span
                className={cn(
                  'text-sm font-medium',
                  number === current ? 'inline' : 'sr-only sm:not-sr-only sm:inline'
                )}
              >
                {t(step)}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
