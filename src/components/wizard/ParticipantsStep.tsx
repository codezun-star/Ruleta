'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useWizard} from './WizardProvider';
import {Field, ErrorText, controlClass} from '@/components/ui/Field';
import {StampButton} from '@/components/ui/StampButton';
import {LIMITS} from '@/lib/validation/limits';
import {parsePastedParticipants, validateParticipants} from '@/lib/validation/participants';

export function ParticipantsStep() {
  const t = useTranslations('wizard');
  const tv = useTranslations('validation');
  const {state, dispatch} = useWizard();
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState('');

  const requireEmail = state.mode === 'secretSanta';
  const min = requireEmail ? LIMITS.minSecretSanta : LIMITS.minRaffle;
  const issues = validateParticipants(state.participants, {min, requireEmail});

  // Hasta que no intentan avanzar, no se marca en rojo lo que solo está vacío.
  const fieldError = (index: number, field: 'name' | 'email') => {
    const issue = issues.find((i) => i.index === index && i.field === field);
    if (!issue) return undefined;
    const complainsAboutEmpty = issue.key === 'nameRequired' || issue.key === 'emailRequired';
    if (complainsAboutEmpty && !state.attempted) return undefined;
    return tv(issue.key, issue.params);
  };

  const listIssues = state.attempted ? issues.filter((i) => i.field === 'list') : [];
  const filled = state.participants.filter((p) => p.name.trim() !== '').length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-2" aria-live="polite">
          {t('count', {count: filled, max: LIMITS.max})}
        </p>
        <div className="flex flex-wrap gap-2">
          <StampButton variant="ghost" size="sm" onClick={() => setPasting((open) => !open)}>
            {t('paste')}
          </StampButton>
          <StampButton variant="ghost" size="sm" onClick={() => dispatch({type: 'removeEmpty'})}>
            {t('clearEmpty')}
          </StampButton>
        </div>
      </div>

      {pasting ? (
        <div className="border-2 border-ink bg-paper-2 p-4">
          <Field id="paste-box" label={t('paste')} hint={t('pasteHint')}>
            <textarea
              id="paste-box"
              rows={5}
              value={pasted}
              onChange={(event) => setPasted(event.target.value)}
              placeholder={t('pastePlaceholder')}
              className={controlClass}
            />
          </Field>
          <div className="mt-3 flex flex-wrap gap-2">
            <StampButton
              size="sm"
              onClick={() => {
                const entries = parsePastedParticipants(pasted).slice(0, LIMITS.max);
                if (entries.length > 0) dispatch({type: 'addMany', entries});
                setPasted('');
                setPasting(false);
              }}
            >
              {t('pasteAdd')}
            </StampButton>
            <StampButton variant="ghost" size="sm" onClick={() => setPasting(false)}>
              {t('pasteCancel')}
            </StampButton>
          </div>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {state.participants.map((participant, index) => {
          const nameError = fieldError(index, 'name');
          const emailError = fieldError(index, 'email');
          return (
            <li
              key={participant.id}
              className="grid items-start gap-2 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1.2fr)_auto]"
            >
              <span
                aria-hidden="true"
                className="mt-2.5 hidden size-8 place-items-center rounded-full border-2 border-ink bg-paper-hi font-head text-sm font-black sm:grid"
              >
                {index + 1}
              </span>

              <Field id={`name-${participant.id}`} label={t('nameLabel')} error={nameError}>
                <input
                  id={`name-${participant.id}`}
                  type="text"
                  autoComplete="off"
                  value={participant.name}
                  placeholder={t('namePlaceholder')}
                  aria-invalid={nameError ? true : undefined}
                  onChange={(event) =>
                    dispatch({
                      type: 'updateParticipant',
                      id: participant.id,
                      patch: {name: event.target.value}
                    })
                  }
                  className={controlClass}
                />
              </Field>

              <Field
                id={`email-${participant.id}`}
                label={requireEmail ? t('emailLabel') : t('emailOptional')}
                error={emailError}
              >
                <input
                  id={`email-${participant.id}`}
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  value={participant.email}
                  placeholder={t('emailPlaceholder')}
                  aria-invalid={emailError ? true : undefined}
                  onChange={(event) =>
                    dispatch({
                      type: 'updateParticipant',
                      id: participant.id,
                      patch: {email: event.target.value}
                    })
                  }
                  className={controlClass}
                />
              </Field>

              <StampButton
                variant="ghost"
                size="sm"
                className="justify-self-end px-3 sm:mt-[1.65rem]"
                aria-label={t('removePerson', {name: participant.name.trim() || t('unnamed')})}
                onClick={() => dispatch({type: 'removeParticipant', id: participant.id})}
              >
                <span aria-hidden="true">✕</span>
              </StampButton>
            </li>
          );
        })}
      </ul>

      <div>
        <StampButton
          variant="secondary"
          size="sm"
          disabled={state.participants.length >= LIMITS.max}
          onClick={() => dispatch({type: 'addParticipant'})}
        >
          {t('addPerson')}
        </StampButton>
      </div>

      {listIssues.map((issue) => (
        <ErrorText key={issue.key}>{tv(issue.key, issue.params)}</ErrorText>
      ))}
    </div>
  );
}
