export const THEME_STORAGE_KEY = 'kuji-theme';

export type Theme = 'light' | 'dark';

/**
 * Se inyecta de forma síncrona en el <head> para que el tema quede fijado
 * antes del primer pintado y no haya un parpadeo de papel crema en modo noche.
 */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})()`;
