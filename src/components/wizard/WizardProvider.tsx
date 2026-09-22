'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode
} from 'react';
import {
  initialWizardState,
  wizardReducer,
  type WizardAction,
  type WizardMode,
  type WizardState
} from './wizardState';

type WizardContextValue = {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
  /** `true` cuando se recuperó un borrador guardado en este navegador. */
  restored: boolean;
};

const WizardContext = createContext<WizardContextValue | null>(null);

const storageKey = (mode: WizardMode) => `kuji-draft-${mode}`;

export function WizardProvider({mode, children}: {mode: WizardMode; children: ReactNode}) {
  const [state, dispatch] = useReducer(wizardReducer, mode, initialWizardState);
  const [restored, markRestored] = useReducer(() => true, false);

  // El borrador se recupera después de montar: en el servidor no existe, y
  // leerlo durante el render descuadraría la hidratación.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(mode));
      if (!raw) return;
      const parsed = JSON.parse(raw) as WizardState;
      if (parsed?.mode !== mode || !Array.isArray(parsed.participants)) return;
      dispatch({type: 'restore', state: {...parsed, step: 1, attempted: false}});
      markRestored();
    } catch {
      // Borrador corrupto o almacenamiento bloqueado: se empieza de cero.
    }
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(mode), JSON.stringify(state));
    } catch {
      // Sin almacenamiento el borrador solo dura lo que dure la pestaña.
    }
  }, [mode, state]);

  return <WizardContext value={{state, dispatch, restored}}>{children}</WizardContext>;
}

export function useWizard(): WizardContextValue {
  const value = useContext(WizardContext);
  if (!value) throw new Error('useWizard tiene que usarse dentro de <WizardProvider>');
  return value;
}

export function clearWizardDraft(mode: WizardMode) {
  try {
    localStorage.removeItem(storageKey(mode));
  } catch {
    // Nada que limpiar.
  }
}
