import {cn} from '@/lib/cn';

/**
 * Boleto premiado: el nombre en el marco y un sello redondo estampado encima,
 * ligeramente torcido, como si lo hubieran puesto a mano.
 */
export function WinnerSeal({
  name,
  caption,
  sealWord,
  className
}: {
  name: string;
  caption: string;
  sealWord: string;
  className?: string;
}) {
  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className="double-frame bg-paper-hi px-7 py-5 text-center"
        style={{['--surface' as string]: 'var(--paper-hi)'}}
      >
        <p className="text-[0.66rem] font-bold tracking-[0.2em] text-ink-2 uppercase">{caption}</p>
        <p className="mt-1 font-head text-3xl leading-tight font-black">{name}</p>
      </div>
      <span
        aria-hidden="true"
        className="animate-stamp absolute -top-5 -right-4 grid size-[4.5rem] place-items-center rounded-full border-[3px] border-ink bg-vermilion font-display text-sm text-on-vermilion"
      >
        {sealWord}
      </span>
    </div>
  );
}
