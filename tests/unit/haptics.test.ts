import {afterEach, describe, expect, it, vi} from 'vitest';
import {haptic} from '@/lib/haptics';

function setup({vibrate, reduced}: {vibrate?: unknown; reduced: boolean}) {
  const calls: unknown[] = [];
  const fn = vi.fn((pattern: unknown) => {
    calls.push(pattern);
    return true;
  });

  vi.stubGlobal('navigator', vibrate === undefined ? {vibrate: fn} : {vibrate});
  vi.stubGlobal('window', {matchMedia: () => ({matches: reduced})});
  return {fn, calls};
}

afterEach(() => vi.unstubAllGlobals());

describe('haptic', () => {
  it('vibra al salir el resultado', () => {
    const {fn} = setup({reduced: false});
    haptic('result');
    expect(fn).toHaveBeenCalledWith([14, 60, 26]);
  });

  it('el arranque del giro es un golpe corto, no un patrón', () => {
    const {fn} = setup({reduced: false});
    haptic('start');
    expect(fn).toHaveBeenCalledWith(18);
  });

  /**
   * Quien pide menos movimiento no quiere que el teléfono le tiemble en la
   * mano: es la misma preferencia que ya salta el giro y el confeti.
   */
  it('se calla con prefers-reduced-motion', () => {
    const {fn} = setup({reduced: true});
    haptic('result');
    expect(fn).not.toHaveBeenCalled();
  });

  it('no rompe nada donde la API no existe, que es todo iOS', () => {
    setup({vibrate: undefined, reduced: false});
    vi.stubGlobal('navigator', {});
    expect(() => haptic('result')).not.toThrow();
  });

  it('aguanta que el navegador la exponga y luego la bloquee', () => {
    setup({
      vibrate: () => {
        throw new Error('bloqueada por política de permisos');
      },
      reduced: false
    });
    expect(() => haptic('tap')).not.toThrow();
  });
});
