import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type Tone = 'neutral' | 'affirm' | 'alert';

const TONES: Record<Tone, string> = {
  neutral: 'text-ink-2',
  affirm: 'text-matcha-deep',
  alert: 'text-vermilion-2'
};

/**
 * Etiqueta tipo sello de inspección. El significado no descansa solo en el
 * color: cada tono lleva su propia marca delante.
 */
export function Tag({tone = 'neutral', children}: {tone?: Tone; children: ReactNode}) {
  const mark = tone === 'affirm' ? '✓' : tone === 'alert' ? '✕' : null;

  return (
    <span
      className={cn(
        'clipped-tag inline-flex items-center gap-1.5 border-[1.5px] border-current px-2.5 py-1',
        'text-[0.7rem] font-bold tracking-[0.14em] uppercase',
        TONES[tone]
      )}
    >
      {mark ? <span aria-hidden="true">{mark}</span> : null}
      {children}
    </span>
  );
}
