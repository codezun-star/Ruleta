'use client';

import {useCallback, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ListInput, parseLines} from './ListInput';
import {Wheel} from '@/components/wheel/Wheel';
import {StampButton} from '@/components/ui/StampButton';
import {shuffle} from '@/lib/draw/random';
import {LIMITS} from '@/lib/validation/limits';

const MIN_PEOPLE = 2;

export function TurnsTool() {
  const t = useTranslations('turns');
  const tools = useTranslations('tools');
  const [text, setText] = useState('');
  const [attempted, setAttempted] = useState(false);
  /** El orden se sortea entero antes de la primera vuelta: la ruleta lo revela. */
  const [order, setOrder] = useState<number[] | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);

  const names = useMemo(() => parseLines(text, LIMITS.max), [text]);
  const ready = names.length >= MIN_PEOPLE && names.length <= LIMITS.max;

  const resolveWinner = useCallback(() => order?.[revealed.length] ?? 0, [order, revealed.length]);

  const start = () => {
    if (!ready) {
      setAttempted(true);
      return;
    }
    setOrder(shuffle(names.map((_, index) => index)));
    setRevealed([]);
  };

  const reset = () => {
    setOrder(null);
    setRevealed([]);
  };

  if (order) {
    const finished = revealed.length >= names.length;
    return (
      <div className="flex flex-col gap-6">
        <p className="text-center text-sm font-medium text-ink-2" aria-live="polite">
          {finished ? t('finished') : t('caption', {position: revealed.length + 1})}
        </p>

        <Wheel
          labels={names}
          ambient={false}
          disabled={finished}
          resolveWinner={resolveWinner}
          onResult={(index) => setRevealed((previous) => [...previous, index])}
          copy={{
            spin: t('spin'),
            again: t('again'),
            caption: t('caption', {position: revealed.length + 1}),
            seal: t('seal', {position: revealed.length + 1})
          }}
        />

        {revealed.length > 0 ? (
          <div
            className="double-frame bg-paper-hi p-5"
            style={{['--surface' as string]: 'var(--paper-hi)'}}
          >
            <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase">
              {t('order')}
            </p>
            <ol className="mt-3 flex flex-col gap-2">
              {revealed.map((index, position) => (
                <li key={index} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-vermilion font-head text-sm font-black text-on-vermilion"
                  >
                    {position + 1}
                  </span>
                  <span className="font-head text-lg font-black">{names[index]}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <StampButton variant="ghost" size="sm" className="self-center" onClick={reset}>
          {tools('edit')}
        </StampButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ListInput
        id="turnos"
        value={text}
        onChange={setText}
        placeholder={t('placeholder')}
        min={MIN_PEOPLE}
        max={LIMITS.max}
        showError={attempted}
      />
      <StampButton className="self-start" onClick={start}>
        {t('spin')}
      </StampButton>
    </div>
  );
}
