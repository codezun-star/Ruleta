'use client';

import {useCallback, useMemo, useState, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {Wheel} from '@/components/wheel/Wheel';
import {StampButton} from '@/components/ui/StampButton';
import {AdLeaderboard} from '@/components/ads/AdBanner';
import {Tag} from '@/components/ui/Tag';
import {Icon} from '@/components/icons/Icons';
import {assignSecretSanta} from '@/lib/draw/derangement';
import {randomTicketId} from '@/lib/draw/audit';
import type {Participant} from '@/lib/validation/participants';

export function SecretSantaCeremony({
  participants,
  exclusions,
  onRestart,
  serverDrawn = false,
  drawId,
  emailStatus
}: {
  participants: Participant[];
  exclusions: [string, string][];
  onRestart: () => void;
  /** El servidor ya repartió y cifró: aquí no se calcula ni se ve nada. */
  serverDrawn?: boolean;
  drawId?: string;
  emailStatus?: ReactNode;
}) {
  const t = useTranslations('ceremony');
  const labels = useMemo(() => participants.map((person) => person.name), [participants]);

  /**
   * El reparto se calcula una sola vez, **antes** de la primera vuelta: la
   * ruleta es ceremonia, no sorteo. Y no se enseña en ningún momento, ni al
   * organizador: solo marcamos de quién es el turno.
   */
  const [result] = useState(() =>
    serverDrawn
      ? ({ok: true} as const)
      : assignSecretSanta(
          participants.map((person) => person.id),
          exclusions
        )
  );
  const [localId] = useState(randomTicketId);
  const ticket = drawId ?? localId;
  const [turn, setTurn] = useState(0);

  const total = participants.length;
  const finished = turn >= total;

  // La ruleta se para en quien tiene el turno; no decide nada.
  const resolveWinner = useCallback(() => Math.min(turn, total - 1), [turn, total]);

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-4">
        <p className="border-2 border-vermilion-2 p-4 text-vermilion-2">{t('failed')}</p>
        <StampButton variant="ghost" className="self-start" onClick={onRestart}>
          {t('restart')}
        </StampButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-sm font-medium text-ink-2" aria-live="polite">
        {finished
          ? t('finished')
          : `${t('turn', {current: turn + 1, total})} · ${t('spinFor', {name: labels[turn] ?? ''})}`}
      </p>

      <Wheel
        labels={labels}
        ambient={false}
        disabled={finished}
        resolveWinner={resolveWinner}
        onResult={() => setTurn((previous) => previous + 1)}
        copy={{again: t('nextTurn'), caption: t('caption'), seal: t('sealWord')}}
      />

      {turn > 0 ? (
        <div
          className="double-frame bg-paper-hi p-5"
          style={{['--surface' as string]: 'var(--paper-hi)'}}
        >
          <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase">
            {t('ready')}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {labels.slice(0, turn).map((name, index) => (
              <li
                key={participants[index]?.id ?? name}
                className="flex flex-wrap items-center gap-3"
              >
                <Icon name="mail" size={22} className="shrink-0 text-matcha-deep" />
                <span className="font-head text-lg font-black">{name}</span>
                <span className="text-sm text-ink-2">{t('knows')}</span>
                <Tag tone="affirm">{t('sealed')}</Tag>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="flex items-start gap-2.5 border-2 border-ink bg-paper-2 p-4 text-sm">
        <span aria-hidden="true" className="text-vermilion">
          ✱
        </span>
        {t('privacy')}
      </p>

      {finished ? (
        <div className="flex flex-col gap-3 border-2 border-ink bg-paper-2 p-5">
          <p className="font-mono text-xl tracking-widest tabular-nums">{ticket}</p>
          {serverDrawn ? null : <p className="text-sm text-ink-2">{t('clientNote')}</p>}
          <StampButton variant="ghost" size="sm" className="self-start" onClick={onRestart}>
            {t('restart')}
          </StampButton>
        </div>
      ) : null}

      {finished ? emailStatus : null}

      {/* Con el reparto ya enviado. Nunca durante la ceremonia: ahí la pantalla
          está prometiendo que nadie ve las asignaciones. */}
      {finished ? <AdLeaderboard className="mt-4" /> : null}
    </div>
  );
}
