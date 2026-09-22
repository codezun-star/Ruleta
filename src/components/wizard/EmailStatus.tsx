'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {StampButton} from '@/components/ui/StampButton';
import {Tag} from '@/components/ui/Tag';
import {retryDeliveries, type DeliverySummary} from '@/lib/api/draws';

export function EmailStatus({
  drawId,
  initial
}: {
  drawId: string;
  initial: DeliverySummary;
}) {
  const t = useTranslations('delivery');
  const [summary, setSummary] = useState(initial);
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    setRetrying(true);
    const result = await retryDeliveries(drawId);
    if (result) {
      setSummary((previous) => ({
        total: previous.total,
        sent: previous.sent + result.sent,
        failed: result.failed
      }));
    }
    setRetrying(false);
  };

  return (
    <div className="flex flex-col gap-3 border-2 border-ink bg-paper-2 p-5" aria-live="polite">
      <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ink-2 uppercase">{t('title')}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Tag tone="affirm">{t('sent', {count: summary.sent})}</Tag>
        {summary.failed > 0 ? <Tag tone="alert">{t('failed', {count: summary.failed})}</Tag> : null}
      </div>

      {summary.failed > 0 ? (
        <>
          <p className="text-sm text-ink-2">{t('someFailed')}</p>
          <StampButton size="sm" className="self-start" onClick={retry} disabled={retrying}>
            {retrying ? t('retrying') : t('retry')}
          </StampButton>
        </>
      ) : (
        <p className="text-sm text-ink-2">{t('allSent')}</p>
      )}
    </div>
  );
}
