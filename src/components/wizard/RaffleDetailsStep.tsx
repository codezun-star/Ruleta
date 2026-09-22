'use client';

import {useTranslations} from 'next-intl';
import {useWizard} from './WizardProvider';
import {namedParticipants} from './wizardState';
import {Field, controlClass} from '@/components/ui/Field';
import {LIMITS} from '@/lib/validation/limits';
import {NOTIFY_OPTIONS, raffleSchema} from '@/lib/validation/draw';

export function RaffleDetailsStep() {
  const t = useTranslations('raffleForm');
  const tv = useTranslations('validation');
  const {state, dispatch} = useWizard();

  const people = namedParticipants(state);
  const maxWinners = Math.min(LIMITS.maxWinners, Math.max(1, people.length - 1));

  const prizeError = state.attempted && state.prize.trim() === '' ? tv('prizeRequired') : undefined;
  const organizerError =
    state.organizerEmail.trim() !== '' &&
    !raffleSchema.shape.organizerEmail.safeParse(state.organizerEmail.trim()).success
      ? tv('emailInvalid')
      : undefined;

  return (
    <div className="flex flex-col gap-5">
      <Field id="prize" label={t('prize')} error={prizeError}>
        <input
          id="prize"
          type="text"
          value={state.prize}
          placeholder={t('prizePlaceholder')}
          aria-invalid={prizeError ? true : undefined}
          onChange={(event) =>
            dispatch({type: 'setField', field: 'prize', value: event.target.value})
          }
          className={controlClass}
        />
      </Field>

      <Field id="winners" label={t('winners')} hint={t('winnersHint')}>
        <input
          id="winners"
          type="number"
          min={1}
          max={maxWinners}
          value={state.winnerCount}
          onChange={(event) =>
            dispatch({
              type: 'setField',
              field: 'winnerCount',
              value: Math.min(maxWinners, Math.max(1, Number(event.target.value) || 1))
            })
          }
          className={`${controlClass} max-w-28 tabular-nums`}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase">
          {t('notify')}
        </legend>
        {NOTIFY_OPTIONS.map((option) => (
          <label key={option} className="flex items-center gap-2.5 text-base">
            <input
              type="radio"
              name="notify"
              value={option}
              checked={state.notify === option}
              onChange={() => dispatch({type: 'setField', field: 'notify', value: option})}
              className="size-4 accent-[var(--vermilion)]"
            />
            {t(`notify${option.charAt(0).toUpperCase()}${option.slice(1)}`)}
          </label>
        ))}
      </fieldset>

      <Field id="organizer" label={t('organizer')} hint={t('organizerHint')} error={organizerError}>
        <input
          id="organizer"
          type="email"
          inputMode="email"
          value={state.organizerEmail}
          aria-invalid={organizerError ? true : undefined}
          onChange={(event) =>
            dispatch({type: 'setField', field: 'organizerEmail', value: event.target.value})
          }
          className={controlClass}
        />
      </Field>
    </div>
  );
}
