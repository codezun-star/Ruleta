import {storageKey} from '@/config/brand';

export const THEME_STORAGE_KEY = storageKey('theme');

export type Theme = 'light' | 'dark';

/**
 * El color de la barra de estado del teléfono, que es el de la cabecera
 * (`--paper-2`). Vive aquí porque lo leen tres sitios —el `viewport` del
 * layout, el manifiesto y el cambio de tema en el cliente— y si se
 * desincronizan, la barra de estado deja de fundirse con la app.
 */
export const THEME_COLORS: Record<Theme, string> = {
  light: '#e7d9bc',
  dark: '#0d161f'
};

/**
 * Se inyecta de forma síncrona en el <head> para que el tema quede fijado
 * antes del primer pintado y no haya un parpadeo de papel crema en modo noche.
 */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})()`;
