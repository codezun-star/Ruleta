'use client';

import {useEffect, useSyncExternalStore} from 'react';
import {useTranslations} from 'next-intl';
import {usePathname} from '@/i18n/navigation';
import {THEME_COLORS, THEME_STORAGE_KEY, type Theme} from '@/lib/theme';

function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * La fuente de verdad es `data-theme` en <html>, que fija el script del
 * <head>. Se observa el atributo en vez de guardar una copia en el estado de
 * cada botón: hay dos que lo cambian —la cabecera de escritorio y el menú de
 * móvil— y con copias el segundo se quedaba con el rótulo del tema anterior.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
  return () => observer.disconnect();
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => 'light');
}

export function applyTheme(next: Theme) {
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Navegación privada o almacenamiento bloqueado: el tema dura la sesión.
  }
}

/**
 * Pinta la barra de estado del color de la cabecera del tema elegido.
 *
 * Las dos `<meta name="theme-color">` del layout siguen a la preferencia del
 * sistema, no a la de la app: con el teléfono en claro y la app en noche, la
 * barra de estado salía crema encima de una cabecera índigo. Se reescriben las
 * dos con el mismo color, y también al navegar, por si Next las vuelve a montar.
 */
export function ThemeColorSync() {
  const theme = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = THEME_COLORS[theme];
    }
  }, [theme, pathname]);

  return null;
}

export function ThemeToggle() {
  const t = useTranslations('common.theme');
  const theme = useTheme();

  return (
    <button
      type="button"
      onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'dark' ? t('toLight') : t('toDark')}
      className="touch-target inline-flex h-9 items-center justify-center gap-2 border-2 border-ink px-3 text-xs font-bold tracking-[0.12em] uppercase transition-colors active:bg-mustard active:text-ink sm:hover:bg-mustard sm:hover:text-ink"
    >
      {/* Solo se pinta en escritorio: en móvil el tema se cambia desde el
          menú, que tiene sitio para decirlo con palabras. */}
      <span aria-hidden="true" className="text-base leading-none">
        {theme === 'dark' ? '☀' : '☾'}
      </span>
      {theme === 'dark' ? t('toLight') : t('toDark')}
    </button>
  );
}
