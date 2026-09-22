'use client';

import {useSyncExternalStore} from 'react';
import {storageKey} from '@/config/brand';

const STORAGE_KEY = storageKey('sound');

let enabled = false;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSoundEnabled(next: boolean) {
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
  } catch {
    // Navegación privada o almacenamiento bloqueado: dura la sesión.
  }
  emit();
}

/**
 * Se lee una sola vez, ya en el cliente. El valor del servidor es siempre
 * `false` —el sonido viene apagado— así que la hidratación nunca discrepa.
 */
export function hydrateSoundPreference() {
  if (hydrated) return;
  hydrated = true;
  try {
    if (localStorage.getItem(STORAGE_KEY) === 'on') {
      enabled = true;
      emit();
    }
  } catch {
    // Sin almacenamiento: se queda apagado.
  }
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => enabled,
    () => false
  );
}
