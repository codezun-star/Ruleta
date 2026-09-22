'use client';

import {useTranslations} from 'next-intl';
import {useWizard} from './WizardProvider';
import {ExclusionEditor} from './ExclusionEditor';
import {Field, controlClass} from '@/components/ui/Field';
import {CURRENCIES, LIMITS} from '@/lib/validation/limits';
import {secretSantaSchema} from '@/lib/validation/draw';

export function SecretSantaDetailsStep() {
  const t = useTranslations('secretSantaForm');
  const tv = useTranslations('validation');
  const {state, dispatch} = useWizard();

  const budgetError =
    state.budget.trim() !== '' && !(Number(state.budget) > 0) ? tv('budgetPositive') : undefined;
  const organizerError =
    state.organizerEmail.trim() !== '' &&
    !secretSantaSchema.shape.organizerEmail.safeParse(state.organizerEmail.trim()).success
      ? tv('emailInvalid')
      : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <Field id="budget" label={t('budget')} error={budgetError}>
          <input
            id="budget"
            type="number"
            inputMode="decimal"
            min={0}
            value={state.budget}
            placeholder={t('budgetPlaceholder')}
            aria-invalid={budgetError ? true : undefined}
            onChange={(event) =>
              dispatch({type: 'setField', field: 'budget', value: event.target.value})
            }
            className={`${controlClass} tabular-nums`}
          />
        </Field>
        <Field id="currency" label={t('currency')}>
          <select
            id="currency"
            value={state.currency}
            onChange={(event) =>
              dispatch({
                type: 'setField',
                field: 'currency',
                value: event.target.value as (typeof CURRENCIES)[number]
              })
            }
            className={controlClass}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="date" label={t('date')}>
          <input
            id="date"
            type="date"
            value={state.date}
            onChange={(event) =>
              dispatch({type: 'setField', field: 'date', value: event.target.value})
            }
            className={controlClass}
          />
        </Field>
        <Field id="place" label={t('place')}>
          <input
            id="place"
            type="text"
            maxLength={LIMITS.maxPlaceLength}
            value={state.place}
            placeholder={t('placePlaceholder')}
            onChange={(event) =>
              dispatch({type: 'setField', field: 'place', value: event.target.value})
            }
            className={controlClass}
          />
        </Field>
      </div>

      <Field id="message" label={t('message')}>
        <textarea
          id="message"
          rows={3}
          maxLength={LIMITS.maxMessageLength}
          value={state.message}
          placeholder={t('messagePlaceholder')}
          onChange={(event) =>
            dispatch({type: 'setField', field: 'message', value: event.target.value})
          }
          className={controlClass}
        />
      </Field>

      <ExclusionEditor />

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
