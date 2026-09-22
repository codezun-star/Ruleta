'use client';

import {useCallback, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ListInput, parseLines} from './ListInput';
import {Wheel} from '@/components/wheel/Wheel';
import {StampButton} from '@/components/ui/StampButton';
import {Field, controlClass} from '@/components/ui/Field';
import {splitIntoTeams} from '@/lib/draw/teams';
import {LIMITS} from '@/lib/validation/limits';

const MIN_PEOPLE = 4;
const MAX_TEAMS = 8;

type Plan = {
  /** Índice de equipo por persona, en el orden en que se reparten. */
  teamOf: number[];
  teamNames: string[];
  order: string[];
};

export function TeamsTool() {
  const t = useTranslations('teams');
  const tools = useTranslations('tools');
  const [text, setText] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [attempted, setAttempted] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [placed, setPlaced] = useState(0);

  const names = useMemo(() => parseLines(text, LIMITS.max), [text]);
  const maxTeams = Math.min(MAX_TEAMS, Math.max(2, Math.floor(names.length / 2) || 2));
  const ready =
    names.length >= MIN_PEOPLE && names.length <= LIMITS.max && teamCount <= names.length;

  const resolveWinner = useCallback(() => plan?.teamOf[placed] ?? 0, [plan, placed]);

  const start = () => {
    if (!ready) {
      setAttempted(true);
      return;
    }
    const count = Math.min(teamCount, maxTeams);
    const teamNames = Array.from({length: count}, (_, index) =>
      t('teamLabel', {number: index + 1})
    );

    // Se reparte entero antes de la primera vuelta: la ruleta solo lo revela,
    // que es lo único que garantiza que los equipos queden parejos.
    const teams = splitIntoTeams(names, count, teamNames);
    const order: string[] = [];
    const teamOf: number[] = [];
    teams.forEach((team, index) => {
      for (const member of team.members) {
        order.push(member);
        teamOf.push(index);
      }
    });

    setPlan({teamOf, teamNames, order});
    setPlaced(0);
  };

  if (plan) {
    const finished = placed >= plan.order.length;
    const current = plan.order[placed] ?? '';

    return (
      <div className="flex flex-col gap-6">
        <p className="text-center text-sm font-medium text-ink-2" aria-live="polite">
          {finished ? t('finished') : t('caption', {name: current})}
        </p>

        <Wheel
          labels={plan.teamNames}
          ambient={false}
          disabled={finished}
          resolveWinner={resolveWinner}
          onResult={() => setPlaced((previous) => previous + 1)}
          copy={{
            spin: t('spin'),
            again: t('again'),
            caption: t('caption', {name: current}),
            seal: t('seal')
          }}
        />

        {placed > 0 ? (
          <div
            className="double-frame bg-paper-hi p-5"
            style={{['--surface' as string]: 'var(--paper-hi)'}}
          >
            <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase">
              {t('result')}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {plan.teamNames.map((teamName, teamIndex) => {
                const members = plan.order.filter(
                  (_, index) => index < placed && plan.teamOf[index] === teamIndex
                );
                return (
                  <div key={teamName} className="border-2 border-ink p-4">
                    <p className="font-head text-lg font-black">{teamName}</p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {members.map((member) => (
                        <li key={member} className="text-ink-2">
                          {member}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <StampButton
          variant="ghost"
          size="sm"
          className="self-center"
          onClick={() => setPlan(null)}
        >
          {tools('edit')}
        </StampButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ListInput
        id="equipos"
        value={text}
        onChange={setText}
        placeholder={t('placeholder')}
        min={MIN_PEOPLE}
        max={LIMITS.max}
        showError={attempted}
      />

      <Field id="numero-equipos" label={t('teamCount')} hint={t('teamCountHint', {max: maxTeams})}>
        <input
          id="numero-equipos"
          type="number"
          min={2}
          max={maxTeams}
          value={teamCount}
          onChange={(event) =>
            setTeamCount(Math.min(maxTeams, Math.max(2, Number(event.target.value) || 2)))
          }
          className={`${controlClass} max-w-28 tabular-nums`}
        />
      </Field>

      <StampButton className="self-start" onClick={start}>
        {t('spin')}
      </StampButton>
    </div>
  );
}
