'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useWizard} from './WizardProvider';
import {namedParticipants} from './wizardState';
import {ErrorText, controlClass} from '@/components/ui/Field';
import {StampButton} from '@/components/ui/StampButton';
import {checkFeasible} from '@/lib/draw/derangement';

export function ExclusionEditor() {
  const t = useTranslations('secretSantaForm');
  const tv = useTranslations('validation');
  const {state, dispatch} = useWizard();
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [error, setError] = useState<string | null>(null);

  const people = namedParticipants(state);
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? '';

  const samePair = (a: string, b: string) => ([c, d]: [string, string]) =>
    (c === a && d === b) || (c === b && d === a);

  const add = () => {
    if (!left || !right) return;
    if (left === right) {
      setError(tv('exclusionSamePerson'));
      return;
    }
    if (state.exclusions.some(samePair(left, right))) {
      setError(tv('exclusionDuplicate'));
      return;
    }
    setError(null);
    dispatch({type: 'addExclusion', pair: [left, right]});
    setLeft('');
    setRight('');
  };

  // Se comprueba con el mismo emparejamiento que usa el algoritmo: mirar solo
  // si a alguien le quedan cero candidatos se queda corto.
  const feasible = checkFeasible(
    people.map((p) => p.id),
    state.exclusions
  );

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase">
          {t('exclusions')}
        </p>
        <p className="mt-1 text-sm text-ink-2">{t('exclusionsHint')}</p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <select
          aria-label={t('pickPerson')}
          value={left}
          onChange={(event) => setLeft(event.target.value)}
          className={`${controlClass} max-w-48`}
        >
          <option value="">{t('pickPerson')}</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <select
          aria-label={t('pickPerson')}
          value={right}
          onChange={(event) => setRight(event.target.value)}
          className={`${controlClass} max-w-48`}
        >
          <option value="">{t('pickPerson')}</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <StampButton variant="secondary" size="sm" onClick={add} disabled={!left || !right}>
          {t('exclusionAdd')}
        </StampButton>
      </div>

      {error ? <ErrorText>{error}</ErrorText> : null}

      {state.exclusions.length === 0 ? (
        <p className="text-sm text-ink-2">{t('exclusionEmpty')}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {state.exclusions.map(([a, b], index) => (
            <li
              key={`${a}-${b}`}
              className="flex items-center gap-2 border-2 border-ink bg-paper-hi px-3 py-1.5 text-sm"
            >
              {t('exclusionPair', {a: nameOf(a), b: nameOf(b)})}
              <button
                type="button"
                aria-label={t('exclusionRemove', {a: nameOf(a), b: nameOf(b)})}
                onClick={() => dispatch({type: 'removeExclusion', index})}
                className="text-vermilion-2"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!feasible.ok && state.exclusions.length > 0 ? (
        <ErrorText>
          {people.length === 3 ? tv('exclusionImpossibleThree') : tv('exclusionImpossible')}
        </ErrorText>
      ) : null}
    </div>
  );
}
