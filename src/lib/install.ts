/**
 * El aviso de instalación de Chrome y Edge (`beforeinstallprompt`). No está en
 * los tipos del DOM porque no es un estándar: Safari y Firefox no lo tienen.
 */
export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
};

declare global {
  interface Window {
    __installPrompt?: InstallPromptEvent;
  }
}

/** Se emite en `window` cuando el script del <head> ha guardado el aviso. */
export const INSTALL_READY_EVENT = 'installpromptready';

/**
 * Guarda el aviso en cuanto llega. Va en el <head> y no en un efecto de React
 * porque el navegador lo lanza una sola vez por carga, a menudo antes de que
 * hidrate nada: si nadie lo está escuchando, se pierde hasta la siguiente
 * visita. `preventDefault()` cambia la miniinfobarra de Chrome por la opción
 * del menú, que sale cuando alguien la busca y no encima de la ruleta.
 */
export const installCaptureScript = `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__installPrompt=e;window.dispatchEvent(new Event(${JSON.stringify(INSTALL_READY_EVENT)}))})`;
