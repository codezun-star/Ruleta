import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  BANNERS,
  DIRECT_LINK,
  HORIZONTAL,
  NARROWEST,
  NATIVE,
  OVERLAY,
  RAIL_MIN_HEIGHT,
  RAIL_MIN_WIDTH,
  adsAllowed,
  bannerSrc
} from '@/config/ads';
import {BRAND} from '@/config/brand';
import {AD_HOST, frameSrc, horizontalUnit, sizeOf} from '@/lib/adFrame';

afterEach(() => vi.unstubAllGlobals());

const HOST_FILE = readFileSync(
  fileURLToPath(new URL('../../public/ads/banner.html', import.meta.url)),
  'utf8'
);

describe('adsAllowed', () => {
  const at = (hostname: string) => {
    vi.stubGlobal('window', {location: {hostname}});
    return adsAllowed();
  };

  it('solo carga anuncios en el dominio de producción', () => {
    expect(at(BRAND.domain)).toBe(true);
    expect(at(`www.${BRAND.domain}`)).toBe(true);
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
    expect(at(`wwww.${BRAND.domain}`)).toBe(false);
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

  it('todas las direcciones son https', () => {
    const urls = [
      bannerSrc(BANNERS.leaderboard.key),
      NATIVE.src,
      DIRECT_LINK,
      ...Object.values(OVERLAY)
    ];
    for (const url of urls) expect(url.startsWith('https://')).toBe(true);
  });

  /**
   * El contenido más ancho del sitio mide 1152px. Sin sitio para las dos
   * columnas de 160px y su aire, los rascacielos lo pisarían.
   */
  it('los rascacielos piden más ancho del que ocupa el contenido', () => {
    const rails = BANNERS.skyscraper.width + BANNERS.halfSkyscraper.width;
    expect(RAIL_MIN_WIDTH).toBeGreaterThan(1152 + rails);
    expect(RAIL_MIN_HEIGHT).toBeGreaterThanOrEqual(BANNERS.skyscraper.height);
  });
});

describe('la escalera de la cabecera', () => {
  it('va de mayor a menor, que es el orden en que se prueba', () => {
    const widths = HORIZONTAL.map((unit) => BANNERS[unit].width);
    expect([...widths].sort((a, b) => b - a)).toEqual(widths);
  });

  it('el último recurso es el último de la escalera', () => {
    expect(HORIZONTAL[HORIZONTAL.length - 1]).toBe(NARROWEST);
  });

  it('en escritorio cabe el grande', () => {
    expect(horizontalUnit(1280)).toBe('leaderboard');
  });

  it('en una tableta estrecha baja al intermedio', () => {
    expect(horizontalUnit(600)).toBe('banner');
  });

  it('en un teléfono baja al pequeño', () => {
    expect(horizontalUnit(390)).toBe('mobile');
  });

  /**
   * El formato tiene que caber con aire a los lados. Un banner de 728 en una
   * ventana de 740 se sale o recorta el contenido.
   */
  it('nunca elige un formato más ancho que la pantalla', () => {
    for (const width of [320, 360, 414, 480, 500, 700, 760, 1024, 1920]) {
      expect(BANNERS[horizontalUnit(width)].width).toBeLessThanOrEqual(width);
    }
  });

  it('en una pantalla imposible se queda con el más estrecho', () => {
    expect(horizontalUnit(200)).toBe('mobile');
  });
});

describe('el marco del anuncio', () => {
  it('apunta al documento propio, no a un dominio de fuera', () => {
    expect(frameSrc('300x250').startsWith(AD_HOST)).toBe(true);
  });

  it('pide el tamaño de la unidad', () => {
    expect(sizeOf('leaderboard')).toBe('728x90');
    expect(frameSrc(sizeOf('rectangle'))).toBe(`${AD_HOST}?s=300x250`);
  });

  it('cada unidad pide un tamaño distinto', () => {
    const sizes = (Object.keys(BANNERS) as (keyof typeof BANNERS)[]).map(sizeOf);
    expect(new Set(sizes).size).toBe(sizes.length);
  });
});

/**
 * `public/ads/banner.html` es un archivo estático: no puede importar de
 * `config/ads.ts`, así que las claves están escritas dos veces. Esto es lo que
 * impide que se separen sin que nadie lo note —y una clave que no coincida es
 * un hueco que no rellena nada, o peor, que rellena la unidad equivocada—.
 */
describe('el documento que hospeda cada banner', () => {
  const declared = new Map(
    [...HOST_FILE.matchAll(/'(\d+x\d+)':\s*'([0-9a-f]{32})'/g)].map(([, size, key]) => [size, key])
  );

  it('declara exactamente las unidades de banner que existen', () => {
    const sizes = (Object.keys(BANNERS) as (keyof typeof BANNERS)[]).map(sizeOf);
    expect([...declared.keys()].sort()).toEqual([...sizes].sort());
  });

  it('cada tamaño lleva la clave de su unidad', () => {
    for (const name of Object.keys(BANNERS) as (keyof typeof BANNERS)[]) {
      expect(declared.get(sizeOf(name))).toBe(BANNERS[name].key);
    }
  });

  /**
   * La URL del script se construye con la clave que sale del mapa, nunca con
   * el texto de la query string: si el tamaño no está declarado, no se carga
   * nada. Eso es lo que hace que un enlace a `/ads/banner.html?s=<lo que sea>`
   * no pueda ejecutar código de terceros.
   */
  it('valida el tamaño contra su propio mapa antes de cargar nada', () => {
    expect(HOST_FILE).toContain('hasOwnProperty.call(UNITS, size)');
    expect(HOST_FILE).toContain('if (!key) return;');
  });

  it('carga el script desde el mismo sitio que el resto de banners', () => {
    const host = new URL(bannerSrc('x')).origin;
    expect(HOST_FILE).toContain(host);
  });

  it('no deja que lo indexen: es un marco, no una página', () => {
    expect(HOST_FILE).toContain('noindex');
  });
});
