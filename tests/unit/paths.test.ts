import {describe, expect, it} from 'vitest';
import {localePath} from '@/i18n/paths';

/**
 * Los correos en inglés enlazaban a `/es/privacidad` porque el armazón traía
 * la ruta escrita a mano. Estas pruebas fijan que cada idioma reciba la suya.
 */
describe('localePath', () => {
  it('traduce la ruta, no solo el prefijo', () => {
    expect(localePath('/privacidad', 'es')).toBe('/es/privacidad');
    expect(localePath('/privacidad', 'en')).toBe('/en/privacy');
    expect(localePath('/turnos', 'en')).toBe('/en/turn-order');
  });

  it('deja las rutas que no se traducen con su prefijo', () => {
    expect(localePath('/blog', 'en')).toBe('/en/blog');
  });

  it('no deja barra de más en la raíz, que sería una redirección', () => {
    expect(localePath('/', 'es')).toBe('/es');
    expect(localePath('/', 'en')).toBe('/en');
  });

  it('cae al idioma por defecto si le llega uno que no servimos', () => {
    expect(localePath('/privacidad', 'fr')).toBe('/es/privacidad');
  });
});
