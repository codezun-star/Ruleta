'use client';

import {useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {hydrateSoundPreference, setSoundEnabled, useSoundEnabled} from '@/lib/soundPreference';
import {playChime, unlockAudio} from '@/components/wheel/sounds';
import {Icon} from '@/components/icons/Icons';

/**
 * Enciende o apaga el sonido. Tiene que llamarse dentro del gesto del usuario:
 * es lo único que desbloquea el `AudioContext`.
 */
export function switchSound(next: boolean) {
  setSoundEnabled(next);
  if (next) {
    // Una campanilla es la única forma de que quien lo activa sepa que
    // funciona: si no, no vuelve a saber nada hasta el primer giro.
    unlockAudio();
    playChime();
  }
}

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
      onClick={() => switchSound(!enabled)}
      className="touch-target inline-flex h-9 items-center justify-center gap-2 border-2 border-ink px-2.5 transition-colors active:bg-mustard active:text-ink sm:hover:bg-mustard sm:hover:text-ink"
    >
      <Icon name={enabled ? 'sound' : 'mute'} size={18} />
      <span className="hidden text-xs font-bold tracking-[0.12em] uppercase sm:inline">
        {t('label')}
      </span>
    </button>
  );
}
