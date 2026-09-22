import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

/**
 * Cabecera de sección: número dentro de un sello rojo, rótulo en versalitas y
 * titular. El número codifica el orden real de lectura de la página.
 */
export function SectionHeading({
  step,
  eyebrow,
  title,
  lede,
  className,
  /** `h1` cuando la cabecera es el título de la página, no de una sección. */
  as: Heading = 'h2'
}: {
  step?: number;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={cn('max-w-[62ch]', className)}>
      <p className="flex flex-wrap items-center gap-2.5 text-[0.72rem] font-bold tracking-[0.22em] text-vermilion-2 uppercase">
        {step ? (
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center rounded-full bg-vermilion font-head text-[0.7rem] font-black text-on-vermilion"
          >
            {String(step).padStart(2, '0')}
          </span>
        ) : null}
        {eyebrow}
        <span className="h-0 flex-[1_0_24px] border-t border-hairline" />
      </p>
      <Heading className="mt-3.5 font-head text-3xl leading-[1.1] font-black tracking-tight text-balance sm:text-4xl">
        {title}
      </Heading>
      {lede ? <p className="mt-2.5 text-lg text-ink-2">{lede}</p> : null}
    </div>
  );
}
