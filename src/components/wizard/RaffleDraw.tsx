'use client';

import {useCallback, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Wheel} from '@/components/wheel/Wheel';
import {StampButton} from '@/components/ui/StampButton';
import {randomInt} from '@/lib/draw/random';
import type {Participant} from '@/lib/validation/participants';

/** Sin 0/O ni 1/I: un código que alguien pueda dictar por teléfono. */
const TICKET_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Identificador legible del sorteo. En la Fase 5 lo emitirá el servidor. */
function makeDrawId(): string {
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (byte) => TICKET_ALPHABET[byte % TICKET_ALPHABET.length]).join('');
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

export function RaffleDraw({
  participants,
  winnerCount,
  onRestart
}: {
  participants: Participant[];
  winnerCount: number;
  onRestart: () => void;
}) {
  const t = useTranslations('draw');
  // Referencia estable: si cambiara en cada render, la ruleta se reconstruiría.
  const labels = useMemo(() => participants.map((person) => person.name), [participants]);
  const [won, setWon] = useState<number[]>([]);
  const [drawId] = useState(makeDrawId);

  const total = Math.min(winnerCount, participants.length);
  const finished = won.length >= total;

  /**
   * Los ya premiados quedan fuera del sorteo siguiente, pero siguen en la
   * ruleta: quitarlos la reconstruiría y se perdería el sello del ganador.
   */
  const resolveWinner = useCallback(() => {
    const remaining = labels.map((_, index) => index).filter((index) => !won.includes(index));
    return remaining[randomInt(remaining.length)] ?? 0;
  }, [labels, won]);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-sm font-medium text-ink-2" aria-live="polite">
        {finished ? t('finished') : t('round', {current: won.length + 1, total})}
      </p>

      <Wheel
        labels={labels}
        ambient={false}
        disabled={finished}
        resolveWinner={resolveWinner}
        onResult={(index) => setWon((previous) => [...previous, index])}
      />

      {won.length > 0 ? (
        <div
          className="double-frame bg-paper-hi p-5"
          style={{['--surface' as string]: 'var(--paper-hi)'}}
        >
          <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase">
            {t('winners')}
          </p>
          <ol className="mt-3 flex flex-col gap-2">
            {won.map((index, position) => (
              <li key={index} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-vermilion font-head text-sm font-black text-on-vermilion"
                >
                  {position + 1}
                </span>
                <span className="font-head text-lg font-black">{labels[index]}</span>
                {participants[index]?.email ? (
                  <span className="text-sm text-ink-2">{participants[index]?.email}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {finished ? (
        <div className="flex flex-col gap-3 border-2 border-ink bg-paper-2 p-5">
          <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase">
            {t('id')}
          </p>
          <p className="font-mono text-xl tracking-widest tabular-nums">{drawId}</p>
          <p className="text-sm text-ink-2">{t('idHint')}</p>
          <p className="text-sm text-ink-2">{t('emailsSoon')}</p>
          <StampButton variant="ghost" size="sm" className="self-start" onClick={onRestart}>
            {t('restart')}
          </StampButton>
        </div>
      ) : null}
    </div>
  );
}
