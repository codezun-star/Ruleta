'use client';

import {useCallback, useMemo, useState, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {Wheel} from '@/components/wheel/Wheel';
import {StampButton} from '@/components/ui/StampButton';
import {randomInt} from '@/lib/draw/random';
import {randomTicketId} from '@/lib/draw/audit';
import type {Participant} from '@/lib/validation/participants';

export function RaffleDraw({
  participants,
  winnerCount,
  onRestart,
  serverWinners,
  drawId,
  emailStatus
}: {
  participants: Participant[];
  winnerCount: number;
  onRestart: () => void;
  /** Ganadores ya decididos por el servidor. La ruleta solo los representa. */
  serverWinners?: {name: string; position: number}[];
  drawId?: string;
  emailStatus?: ReactNode;
}) {
  const t = useTranslations('draw');
  // Referencia estable: si cambiara en cada render, la ruleta se reconstruiría.
  const labels = useMemo(() => participants.map((person) => person.name), [participants]);
  const [won, setWon] = useState<number[]>([]);
  const [localId] = useState(randomTicketId);

  const total = serverWinners ? serverWinners.length : Math.min(winnerCount, participants.length);
  const finished = won.length >= total;
  const ticket = drawId ?? localId;

  /**
   * Los ya premiados quedan fuera del sorteo siguiente, pero siguen en la
   * ruleta: quitarlos la reconstruiría y se perdería el sello del ganador.
   */
  const resolveWinner = useCallback(() => {
    if (serverWinners) {
      // Los nombres son únicos: la validación rechaza repetidos.
      const next = serverWinners[won.length]?.name;
      const index = labels.indexOf(next ?? '');
      if (index >= 0) return index;
    }
    const remaining = labels.map((_, index) => index).filter((index) => !won.includes(index));
    return remaining[randomInt(remaining.length)] ?? 0;
  }, [labels, serverWinners, won]);

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
                <span data-testid="winner-name" className="font-head text-lg font-black">
                  {labels[index]}
                </span>
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
          <p className="font-mono text-xl tracking-widest tabular-nums">{ticket}</p>
          <p className="text-sm text-ink-2">{t('idHint')}</p>
          <StampButton variant="ghost" size="sm" className="self-start" onClick={onRestart}>
            {t('restart')}
          </StampButton>
        </div>
      ) : null}

      {finished ? emailStatus : null}
    </div>
  );
}
