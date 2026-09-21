'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useWizard, clearWizardDraft} from './WizardProvider';
import {namedParticipants, type WizardStep} from './wizardState';
import {WizardSteps} from './WizardSteps';
import {ParticipantsStep} from './ParticipantsStep';
import {RaffleDetailsStep} from './RaffleDetailsStep';
import {SecretSantaDetailsStep} from './SecretSantaDetailsStep';
import {ReviewStep} from './ReviewStep';
import {RaffleDraw} from './RaffleDraw';
import {StampButton} from '@/components/ui/StampButton';
import {LIMITS} from '@/lib/validation/limits';
import {validateParticipants} from '@/lib/validation/participants';
import {findOverConstrained, raffleSchema} from '@/lib/validation/draw';
import type {WizardState} from './wizardState';

function organizerLooksValid(state: WizardState): boolean {
  const value = state.organizerEmail.trim();
  return value === '' || raffleSchema.shape.organizerEmail.safeParse(value).success;
}

/** Misma comprobación que enseña los errores, pero resumida a sí o no. */
function stepIsComplete(state: WizardState): boolean {
  if (state.step === 1) {
    const requireEmail = state.mode === 'secretSanta';
    const min = requireEmail ? LIMITS.minSecretSanta : LIMITS.minRaffle;
    return validateParticipants(state.participants, {min, requireEmail}).length === 0;
  }

  if (state.step === 2) {
    if (!organizerLooksValid(state)) return false;
    if (state.mode === 'raffle') return state.prize.trim() !== '';
    const budgetOk = state.budget.trim() === '' || Number(state.budget) > 0;
    const people = namedParticipants(state);
    const stuck = findOverConstrained(
      people.map((person) => person.id),
      state.exclusions
    );
    return budgetOk && stuck.length === 0;
  }

  return true;
}

export function Wizard() {
  const t = useTranslations('wizard');
  const tReview = useTranslations('review');
  const {state, dispatch, restored} = useWizard();
  const [drawing, setDrawing] = useState(false);

  const people = namedParticipants(state);

  if (drawing) {
    return (
      <RaffleDraw
        participants={people}
        winnerCount={state.winnerCount}
        onRestart={() => {
          clearWizardDraft(state.mode);
          dispatch({type: 'reset'});
          setDrawing(false);
        }}
      />
    );
  }

  const goTo = (step: WizardStep) => {
    if (step > state.step && !stepIsComplete(state)) {
      dispatch({type: 'attempt'});
      return;
    }
    dispatch({type: 'goTo', step});
  };

  const start = () => {
    if (!stepIsComplete(state)) {
      dispatch({type: 'attempt'});
      return;
    }
    setDrawing(true);
  };

  return (
    <div className="flex flex-col gap-7">
      <WizardSteps current={state.step} />

      {restored ? (
        <p className="flex flex-wrap items-center gap-3 border-2 border-ink bg-paper-2 px-4 py-3 text-sm">
          {t('draftRestored')}
          <button
            type="button"
            className="font-bold text-vermilion-2 underline underline-offset-2"
            onClick={() => {
              clearWizardDraft(state.mode);
              dispatch({type: 'reset'});
            }}
          >
            {t('discardDraft')}
          </button>
        </p>
      ) : null}

      <div
        className="double-frame bg-paper-hi p-5 sm:p-7"
        style={{['--surface' as string]: 'var(--paper-hi)'}}
      >
        {state.step === 1 ? <ParticipantsStep /> : null}
        {state.step === 2 ? (
          state.mode === 'raffle' ? <RaffleDetailsStep /> : <SecretSantaDetailsStep />
        ) : null}
        {state.step === 3 ? <ReviewStep /> : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {state.step > 1 ? (
          <StampButton
            variant="ghost"
            onClick={() => goTo((state.step - 1) as WizardStep)}
          >
            {t('back')}
          </StampButton>
        ) : null}

        {state.step < 3 ? (
          <StampButton onClick={() => goTo((state.step + 1) as WizardStep)}>{t('next')}</StampButton>
        ) : state.mode === 'raffle' ? (
          <StampButton onClick={start}>{tReview('start')}</StampButton>
        ) : null}
      </div>
    </div>
  );
}
