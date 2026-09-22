'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useWizard} from './WizardProvider';
import {namedParticipants} from './wizardState';
import {formatDate, formatMoney} from '@/lib/format';

function Row({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-dotted border-hairline py-2.5 last:border-b-0">
      <dt className="min-w-36 text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase">
        {label}
      </dt>
      <dd className="flex-1 text-base">{children}</dd>
    </div>
  );
}

export function ReviewStep() {
  const t = useTranslations('review');
  const tr = useTranslations('raffleForm');
  const locale = useLocale();
  const {state} = useWizard();
  const people = namedParticipants(state);

  const budget =
    state.budget.trim() !== '' && Number(state.budget) > 0
      ? formatMoney(Number(state.budget), state.currency, locale)
      : t('none');
  const date = formatDate(state.date, locale) ?? t('none');
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? '';

  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-col">
        <Row label={t('people')}>
          <span className="tabular-nums">{people.length}</span>
          <span className="mt-1 block text-sm text-ink-2">
            {people
              .map((person) => (person.email ? person.name : `${person.name} (${t('noEmail')})`))
              .join(' · ')}
          </span>
        </Row>

        {state.mode === 'raffle' ? (
          <>
            <Row label={t('prize')}>{state.prize.trim() || t('none')}</Row>
            <Row label={t('winners')}>
              <span className="tabular-nums">{state.winnerCount}</span>
            </Row>
            <Row label={t('notify')}>
              {tr(`notify${state.notify.charAt(0).toUpperCase()}${state.notify.slice(1)}`)}
            </Row>
          </>
        ) : (
          <>
            <Row label={t('budget')}>{budget}</Row>
            <Row label={t('date')}>{date}</Row>
            <Row label={t('place')}>{state.place.trim() || t('none')}</Row>
            <Row label={t('message')}>{state.message.trim() || t('none')}</Row>
            <Row label={t('exclusions')}>
              {state.exclusions.length === 0
                ? t('none')
                : state.exclusions.map(([a, b]) => `${nameOf(a)} ↮ ${nameOf(b)}`).join(' · ')}
            </Row>
          </>
        )}

        <Row label={t('organizer')}>{state.organizerEmail.trim() || t('none')}</Row>
      </dl>

      {state.mode === 'secretSanta' ? (
        <p className="flex items-start gap-2.5 border-2 border-ink bg-paper-2 p-4 text-sm">
          <span aria-hidden="true" className="text-vermilion">
            ✱
          </span>
          {t('privacy')}
        </p>
      ) : null}

    </div>
  );
}
