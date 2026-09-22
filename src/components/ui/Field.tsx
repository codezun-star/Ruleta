import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

/** Campos de papelería: fondo de papel, borde de tinta y hundido interior. */
export const controlClass =
  'w-full border-2 border-ink bg-paper-hi px-3 py-2.5 text-base text-ink shadow-[inset_2px_2px_0_var(--hairline)] placeholder:text-ink-3';

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase"
      >
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-sm text-ink-2">{hint}</p> : null}
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : null}
    </div>
  );
}

export function ErrorText({id, children}: {id?: string; children: ReactNode}) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-vermilion-2">
      <span aria-hidden="true">✕</span>
      {children}
    </p>
  );
}
