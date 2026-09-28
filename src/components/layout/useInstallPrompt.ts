'use client';

import {useCallback, useEffect, useState} from 'react';
import {INSTALL_READY_EVENT} from '@/lib/install';

/**
 * - `installed`: ya se abre como app, no hay nada que ofrecer.
 * - `available`: Chrome o Edge guardaron el aviso y se puede lanzar.
 * - `ios`: Safari no tiene aviso; solo se puede explicar dónde está la opción.
 * - `unavailable`: ni lo uno ni lo otro, o todavía no se sabe.
 */
export type InstallState = 'installed' | 'available' | 'ios' | 'unavailable';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari de iOS no implementó `display-mode` hasta tarde; esto sí.
    (navigator as Navigator & {standalone?: boolean}).standalone === true
  );
}

function isIos(): boolean {
  // El iPad se presenta como un Mac de escritorio desde iPadOS 13; lo delata
  // la pantalla táctil.
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function readState(): InstallState {
  if (isStandalone()) return 'installed';
  if (window.__installPrompt) return 'available';
  return isIos() ? 'ios' : 'unavailable';
}

export function useInstallPrompt() {
  // En el servidor no se sabe nada: se empieza sin ofrecer instalación y se
  // decide ya en el cliente, para que la hidratación no discrepe.
  const [state, setState] = useState<InstallState>('unavailable');

  useEffect(() => {
    const sync = () => setState(readState());
    const installed = () => {
      window.__installPrompt = undefined;
      setState('installed');
    };

    sync();
    window.addEventListener(INSTALL_READY_EVENT, sync);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener(INSTALL_READY_EVENT, sync);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const install = useCallback(async () => {
    const prompt = window.__installPrompt;
    if (!prompt) return;

    await prompt.prompt();
    const {outcome} = await prompt.userChoice;
    // Cada aviso sirve una sola vez: aceptado o no, el navegador ya no deja
    // volver a lanzarlo hasta que emita otro.
    window.__installPrompt = undefined;
    setState(outcome === 'accepted' ? 'installed' : readState());
  }, []);

  return {state, install};
}
