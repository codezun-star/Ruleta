'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {THEME_STORAGE_KEY, type Theme} from '@/lib/theme';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function ThemeToggle() {
  const t = useTranslations('common.theme');
  const [theme, setTheme] = useState<Theme>('light');

  // El script del <head> ya fijó el tema; aquí solo lo leemos para el rótulo.
  useEffect(() => setTheme(readTheme()), []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Navegación privada o almacenamiento bloqueado: el tema dura la sesión.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'dark' ? t('toLight') : t('toDark')}
      className="touch-target inline-flex h-9 items-center justify-center gap-2 border-2 border-ink px-2.5 text-xs font-bold tracking-[0.12em] uppercase transition-colors active:bg-mustard active:text-ink sm:px-3 sm:hover:bg-mustard sm:hover:text-ink"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {theme === 'dark' ? '☀' : '☾'}
      </span>
      {/* El rótulo desaparece en móvil: con los cinco modos ya en la barra de
          abajo, la cabecera solo tiene sitio para los símbolos. */}
      <span className="hidden sm:inline">{theme === 'dark' ? t('toLight') : t('toDark')}</span>
    </button>
  );
}
