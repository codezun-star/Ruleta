'use client';

import {useCallback, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useWizard, clearWizardDraft} from './WizardProvider';
import {namedParticipants, type WizardStep} from './wizardState';
import {WizardSteps} from './WizardSteps';
import {ParticipantsStep} from './ParticipantsStep';
import {RaffleDetailsStep} from './RaffleDetailsStep';
import {SecretSantaDetailsStep} from './SecretSantaDetailsStep';
import {ReviewStep} from './ReviewStep';
import {RaffleDraw} from './RaffleDraw';
import {SecretSantaCeremony} from './SecretSantaCeremony';
import {EmailStatus} from './EmailStatus';
import {TurnstileWidget, isTurnstileEnabled} from '@/components/ui/TurnstileWidget';
import {ErrorText} from '@/components/ui/Field';
import {StampButton} from '@/components/ui/StampButton';
import {createDraw, type DrawResponse} from '@/lib/api/draws';
import {LIMITS} from '@/lib/validation/limits';
import {validateParticipants} from '@/lib/validation/participants';
import {raffleSchema} from '@/lib/validation/draw';
import {checkFeasible} from '@/lib/draw/derangement';
import type {WizardState} from './wizardState';
import type {DrawConfig} from '@/lib/validation/draw';

/** Traduce el estado del formulario a lo que entiende el servidor. */
function toDrawConfig(state: WizardState, locale: string): DrawConfig {
  const participants = namedParticipants(state);
  if (state.mode === 'raffle') {
    return {
      mode: 'raffle',
      participants,
      prize: state.prize.trim(),
      winnerCount: Math.min(state.winnerCount, participants.length),
      notify: state.notify,
      organizerEmail: state.organizerEmail.trim(),
      locale
    };
  }
  return {
    mode: 'secretSanta',
    participants,
    budget: state.budget.trim() === '' ? '' : Number(state.budget),
    currency: state.currency,
    date: state.date,
    place: state.place.trim(),
    message: state.message.trim(),
    exclusions: state.exclusions,
    organizerEmail: state.organizerEmail.trim(),
    locale
  };
}

type Stage =
  | {kind: 'server'; result: Extract<DrawResponse, {status: 'ok'}>}
  /** Sin base de datos ni Resend, el sorteo se hace aquí y no se guarda. */
  | {kind: 'local'; reason: 'notConfigured' | 'error'};

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
    const feasible = checkFeasible(
      people.map((person) => person.id),
      state.exclusions
    );
    return budgetOk && feasible.ok;
  }

  return true;
}

export function Wizard() {
  const t = useTranslations('wizard');
  const tReview = useTranslations('review');
  const tDelivery = useTranslations('delivery');
  const locale = useLocale();
  const {state, dispatch, restored} = useWizard();
  const [stage, setStage] = useState<Stage | null>(null);
  const [starting, setStarting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<{
    reason: 'rateLimited' | 'captcha';
    minutes?: number;
  } | null>(null);
  const onToken = useCallback((token: string | null) => setCaptchaToken(token), []);

  const people = namedParticipants(state);

  if (stage) {
    const restart = () => {
      clearWizardDraft(state.mode);
      dispatch({type: 'reset'});
      setStage(null);
    };

    const status =
      stage.kind === 'server' ? (
        <EmailStatus drawId={stage.result.drawId} initial={stage.result.deliveries} />
      ) : (
        <p className="border-2 border-dashed border-vermilion-2 p-4 text-sm text-ink-2">
          {stage.reason === 'notConfigured' ? tDelivery('localOnly') : tDelivery('serverError')}
        </p>
      );

    return state.mode === 'raffle' ? (
      <RaffleDraw
        participants={people}
        winnerCount={state.winnerCount}
        onRestart={restart}
        serverWinners={stage.kind === 'server' ? stage.result.winners : undefined}
        drawId={stage.kind === 'server' ? stage.result.shortId : undefined}
        emailStatus={status}
      />
    ) : (
      <SecretSantaCeremony
        participants={people}
        exclusions={state.exclusions}
        onRestart={restart}
        serverDrawn={stage.kind === 'server'}
        drawId={stage.kind === 'server' ? stage.result.shortId : undefined}
        emailStatus={status}
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

  /**
   * El sorteo lo decide el servidor. Si todavía no hay base de datos ni
   * Resend, se hace aquí para no dejar la pantalla muerta, y se dice.
   */
  const start = async () => {
    if (!stepIsComplete(state)) {
      dispatch({type: 'attempt'});
      return;
    }
    setStarting(true);
    setBlocked(null);
    const response = await createDraw(toDrawConfig(state, locale), captchaToken);
    setStarting(false);

    if (response.status === 'ok') {
      setStage({kind: 'server', result: response});
    } else if (response.status === 'notConfigured') {
      setStage({kind: 'local', reason: 'notConfigured'});
    } else if (response.status === 'rateLimited') {
      // Aquí no hay repliegue local: el límite existe justamente para frenar.
      setBlocked({reason: 'rateLimited', minutes: Math.ceil(response.retryAfter / 60)});
    } else if (response.status === 'captcha') {
      setBlocked({reason: 'captcha'});
    } else {
      setStage({kind: 'local', reason: 'error'});
    }
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
          state.mode === 'raffle' ? (
            <RaffleDetailsStep />
          ) : (
            <SecretSantaDetailsStep />
          )
        ) : null}
        {state.step === 3 ? <ReviewStep /> : null}
      </div>

      {state.step === 3 && isTurnstileEnabled() ? (
        <div className="flex flex-col gap-2">
          <TurnstileWidget onToken={onToken} />
        </div>
      ) : null}

      {blocked ? (
        <ErrorText>
          {blocked.reason === 'captcha'
            ? tDelivery('captchaFailed')
            : tDelivery('rateLimited', {minutes: blocked.minutes ?? 1})}
        </ErrorText>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {state.step > 1 ? (
          <StampButton variant="ghost" onClick={() => goTo((state.step - 1) as WizardStep)}>
            {t('back')}
          </StampButton>
        ) : null}

        {state.step < 3 ? (
          <StampButton onClick={() => goTo((state.step + 1) as WizardStep)}>
            {t('next')}
          </StampButton>
        ) : (
          <StampButton onClick={start} disabled={starting}>
            {starting ? tDelivery('sending') : tReview('start')}
          </StampButton>
        )}
      </div>
    </div>
  );
}
