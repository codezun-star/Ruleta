import type {Participant} from '@/lib/validation/participants';
import type {NotifyOption} from '@/lib/validation/draw';
import type {Currency} from '@/lib/validation/limits';

export type WizardMode = 'raffle' | 'secretSanta';
export type WizardStep = 1 | 2 | 3;

export type WizardState = {
  mode: WizardMode;
  step: WizardStep;
  /** Se enciende al intentar avanzar con errores: hasta entonces no regañamos. */
  attempted: boolean;
  participants: Participant[];
  prize: string;
  winnerCount: number;
  notify: NotifyOption;
  budget: string;
  currency: Currency;
  date: string;
  place: string;
  message: string;
  exclusions: [string, string][];
  organizerEmail: string;
};

type ScalarFields = Pick<
  WizardState,
  | 'prize'
  | 'winnerCount'
  | 'notify'
  | 'budget'
  | 'currency'
  | 'date'
  | 'place'
  | 'message'
  | 'organizerEmail'
>;

export type WizardAction =
  | {type: 'goTo'; step: WizardStep}
  | {type: 'attempt'}
  | {type: 'addParticipant'}
  | {type: 'addMany'; entries: {name: string; email: string}[]}
  | {type: 'updateParticipant'; id: string; patch: Partial<Omit<Participant, 'id'>>}
  | {type: 'removeParticipant'; id: string}
  | {type: 'removeEmpty'}
  | {
      [K in keyof ScalarFields]: {type: 'setField'; field: K; value: ScalarFields[K]};
    }[keyof ScalarFields]
  | {type: 'addExclusion'; pair: [string, string]}
  | {type: 'removeExclusion'; index: number}
  | {type: 'restore'; state: WizardState}
  | {type: 'reset'};

/**
 * Ids fijos en las filas iniciales: el proveedor también se renderiza en el
 * servidor y un `randomUUID` por render rompería la hidratación.
 */
function seedParticipants(): Participant[] {
  return [
    {id: 'seed-1', name: '', email: ''},
    {id: 'seed-2', name: '', email: ''},
    {id: 'seed-3', name: '', email: ''}
  ];
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `p-${Math.random().toString(36).slice(2, 10)}`;
}

export function initialWizardState(mode: WizardMode): WizardState {
  return {
    mode,
    step: 1,
    attempted: false,
    participants: seedParticipants(),
    prize: '',
    winnerCount: 1,
    notify: 'winners',
    budget: '',
    currency: 'MXN',
    date: '',
    place: '',
    message: '',
    exclusions: [],
    organizerEmail: ''
  };
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'goTo':
      return {...state, step: action.step, attempted: false};

    case 'attempt':
      return {...state, attempted: true};

    case 'addParticipant':
      return {...state, participants: [...state.participants, {id: newId(), name: '', email: ''}]};

    case 'addMany': {
      // Las filas vacías del principio se aprovechan en vez de dejarlas sueltas.
      const empty = state.participants.filter((p) => p.name === '' && p.email === '');
      const filled = state.participants.filter((p) => p.name !== '' || p.email !== '');
      const added = action.entries.map((entry, index) => ({
        id: empty[index]?.id ?? newId(),
        name: entry.name,
        email: entry.email
      }));
      const leftover = empty.slice(action.entries.length);
      return {...state, participants: [...filled, ...added, ...leftover]};
    }

    case 'updateParticipant':
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.id === action.id ? {...p, ...action.patch} : p
        )
      };

    case 'removeParticipant':
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== action.id),
        // Una exclusión sin las dos personas ya no significa nada.
        exclusions: state.exclusions.filter(([a, b]) => a !== action.id && b !== action.id)
      };

    case 'removeEmpty': {
      const kept = state.participants.filter((p) => p.name.trim() !== '' || p.email.trim() !== '');
      return {...state, participants: kept.length > 0 ? kept : seedParticipants()};
    }

    case 'setField':
      return {...state, [action.field]: action.value};

    case 'addExclusion':
      return {...state, exclusions: [...state.exclusions, action.pair]};

    case 'removeExclusion':
      return {...state, exclusions: state.exclusions.filter((_, i) => i !== action.index)};

    case 'restore':
      return action.state;

    case 'reset':
      return initialWizardState(state.mode);

    default:
      return state;
  }
}

/** Solo cuentan las personas con nombre: las filas vacías son andamiaje. */
export function namedParticipants(state: WizardState): Participant[] {
  return state.participants.filter((p) => p.name.trim() !== '');
}
