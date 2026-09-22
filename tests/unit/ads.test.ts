import {afterEach, describe, expect, it, vi} from 'vitest';
import {BANNERS, DIRECT_LINK, NATIVE, OVERLAY, adsAllowed, bannerSrc} from '@/config/ads';
import {BRAND} from '@/config/brand';
import {AD_SANDBOX, adDocument, bannerMarkup, nativeMarkup} from '@/lib/adMarkup';

afterEach(() => vi.unstubAllGlobals());

describe('adsAllowed', () => {
  const at = (hostname: string) => {
    vi.stubGlobal('window', {location: {hostname}});
    return adsAllowed();
  };

  it('solo carga anuncios en el dominio de producción', () => {
    expect(at(BRAND.domain)).toBe(true);
  });

  it('no los carga en desarrollo ni en las pruebas', () => {
    expect(at('localhost')).toBe(false);
    expect(at('127.0.0.1')).toBe(false);
  });

  /**
   * Los despliegues de vista previa comparten el compilado con producción. Si
   * el permiso dependiera de `NEXT_PUBLIC_*` —que se incrusta al compilar— no
   * habría forma de distinguirlos.
   */
  it('no los carga en un despliegue de vista previa', () => {
    expect(at('tombola-git-rama.vercel.app')).toBe(false);
  });

  it('no los carga en un dominio parecido', () => {
    expect(at(`malo-${BRAND.domain}`)).toBe(false);
    expect(at(`${BRAND.domain}.malo.com`)).toBe(false);
  });

  it('en el servidor no hay anuncios', () => {
    vi.stubGlobal('window', undefined);
    expect(adsAllowed()).toBe(false);
  });
});

describe('unidades', () => {
  it('cada unidad tiene una clave distinta', () => {
    const keys = Object.values(BANNERS).map((unit) => unit.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('ninguna clave de banner se repite en los otros formatos', () => {
    const keys = new Set<string>(Object.values(BANNERS).map((unit) => unit.key));
    expect(keys.has(NATIVE.key)).toBe(false);
  });

  it('las medidas son las que el anuncio espera', () => {
    expect(BANNERS.leaderboard).toMatchObject({width: 728, height: 90});
    expect(BANNERS.mobile).toMatchObject({width: 320, height: 50});
    expect(BANNERS.rectangle).toMatchObject({width: 300, height: 250});
  });

  /**
   * El par de la cabecera se elige por ancho de pantalla, así que el de móvil
   * tiene que caber donde el de escritorio no.
   */
  it('el banner de móvil cabe en la pantalla más estrecha que se usa', () => {
    expect(BANNERS.mobile.width).toBeLessThanOrEqual(320);
    expect(BANNERS.mobile.width).toBeLessThan(BANNERS.leaderboard.width);
  });

  it('todas las direcciones son https', () => {
    const urls = [
      bannerSrc(BANNERS.leaderboard.key),
      NATIVE.src,
      DIRECT_LINK,
      ...Object.values(OVERLAY)
    ];
    for (const url of urls) expect(url.startsWith('https://')).toBe(true);
  });
});

describe('el marco del anuncio', () => {
  /**
   * La propiedad que de verdad protege algo. El borrador del asistente vive en
   * `localStorage` con los nombres y los correos de los participantes: con
   * `allow-same-origin`, el script del anuncio los leería con una línea.
   *
   * Es una ausencia, y las ausencias se rompen sin que nadie lo note.
   */
  it('nunca da acceso al origen de la página', () => {
    expect(AD_SANDBOX).not.toContain('allow-same-origin');
  });

  it('deja pulsar el anuncio, que si no es como no tenerlo', () => {
    expect(AD_SANDBOX).toContain('allow-popups');
    expect(AD_SANDBOX).toContain('allow-scripts');
  });

  it('no permite navegar la pestaña entera sin tocar nada', () => {
    expect(AD_SANDBOX).not.toContain('allow-top-navigation');
  });

  it('el documento del marco es completo y no hereda estilos', () => {
    const html = adDocument('<b>x</b>');
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<b>x</b>');
    expect(html).toContain('margin:0');
  });
});

describe('bannerMarkup', () => {
  it('escribe atOptions antes de cargar el script que lo lee', () => {
    const markup = bannerMarkup('rectangle');
    expect(markup.indexOf('atOptions')).toBeLessThan(markup.indexOf('<script src='));
  });

  it('lleva la clave y las medidas de la unidad pedida', () => {
    const markup = bannerMarkup('leaderboard');
    expect(markup).toContain(BANNERS.leaderboard.key);
    expect(markup).toContain('"width":728');
    expect(markup).toContain('"height":90');
  });

  it('cada unidad produce un marcado distinto', () => {
    const all = (Object.keys(BANNERS) as (keyof typeof BANNERS)[]).map(bannerMarkup);
    expect(new Set(all).size).toBe(all.length);
  });

  it('el nativo trae su contenedor y su script', () => {
    const markup = nativeMarkup();
    expect(markup).toContain(`container-${NATIVE.key}`);
    expect(markup).toContain(NATIVE.src);
  });
});
