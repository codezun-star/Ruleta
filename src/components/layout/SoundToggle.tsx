'use client';

import {useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {hydrateSoundPreference, setSoundEnabled, useSoundEnabled} from '@/lib/soundPreference';
import {playChime, unlockAudio} from '@/components/wheel/sounds';
import {Icon} from '@/components/icons/Icons';

export function SoundToggle() {
  const t = useTranslations('common.sound');
  const enabled = useSoundEnabled();

  useEffect(() => {
    hydrateSoundPreference();
  }, []);

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? t('disable') : t('enable')}
      title={enabled ? t('disable') : t('enable')}
      onClick={() => {
        const next = !enabled;
        setSoundEnabled(next);
        if (next) {
          // Solo se puede desbloquear el audio dentro del gesto que lo activa,
          // y una campanilla es la única forma de que quien lo activa sepa
          // que funciona: si no, no vuelve a saber nada hasta el primer giro.
          unlockAudio();
          playChime();
        }
      }}
      className="inline-flex items-center gap-2 border-2 border-ink px-2.5 py-1.5 transition-colors hover:bg-mustard hover:text-ink"
    >
      <Icon name={enabled ? 'sound' : 'mute'} size={18} />
      <span className="hidden text-xs font-bold tracking-[0.12em] uppercase sm:inline">
        {t('label')}
      </span>
    </button>
  );
}
