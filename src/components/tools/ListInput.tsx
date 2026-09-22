'use client';

import {useTranslations} from 'next-intl';
import {controlClass, ErrorText} from '@/components/ui/Field';

/** Una línea, un elemento. Se quitan las vacías y los espacios de los lados. */
export function parseLines(text: string, max: number): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function ListInput({
  id,
  value,
  onChange,
  placeholder,
  min,
  max,
  showError
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  min: number;
  max: number;
  showError: boolean;
}) {
  const t = useTranslations('tools');
  const items = parseLines(value, max + 1);

  const error =
    !showError || items.length === 0
      ? null
      : items.length < min
        ? t('tooFew', {min})
        : items.length > max
          ? t('tooMany', {max})
          : null;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase"
      >
        {t('listLabel')}
      </label>
      <textarea
        id={id}
        rows={8}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`${controlClass} font-sans`}
      />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-ink-2">{t('listHint')}</p>
        <p className="text-sm font-medium text-ink-2 tabular-nums" aria-live="polite">
          {t('count', {count: Math.min(items.length, max)})}
        </p>
      </div>
      {error ? <ErrorText>{error}</ErrorText> : null}
      {showError && items.length === 0 ? <ErrorText>{t('tooFew', {min})}</ErrorText> : null}
    </div>
  );
}
