import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

/**
 * Cabecera de sección: numeral japonés dentro de un sello rojo, rótulo en
 * versalitas y titular. El número codifica el orden real de lectura.
 */
export function SectionHeading({
  numeral,
  eyebrow,
  title,
  lede,
  className
}: {
  numeral?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('max-w-[62ch]', className)}>
      <p className="flex flex-wrap items-center gap-2.5 text-[0.72rem] font-bold tracking-[0.22em] text-vermilion-2 uppercase">
        {numeral ? (
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center rounded-full bg-vermilion font-ja text-[0.8rem] text-on-vermilion"
            lang="ja"
          >
            {numeral}
          </span>
        ) : null}
        {eyebrow}
        <span className="h-0 flex-[1_0_24px] border-t border-hairline" />
      </p>
      <h2 className="mt-3.5 font-head text-3xl leading-[1.1] font-black tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {lede ? <p className="mt-2.5 text-lg text-ink-2">{lede}</p> : null}
    </div>
  );
}
