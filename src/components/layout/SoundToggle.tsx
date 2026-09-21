'use client';

import {useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {hydrateSoundPreference, setSoundEnabled, useSoundEnabled} from '@/lib/soundPreference';
import {unlockAudio} from '@/components/wheel/sounds';
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
        // Solo se puede desbloquear el audio dentro del gesto que lo activa.
        if (next) unlockAudio();
      }}
      className="grid size-[34px] place-items-center border-2 border-ink transition-colors hover:bg-mustard hover:text-ink"
    >
      <Icon name={enabled ? 'sound' : 'mute'} size={18} />
    </button>
  );
}
