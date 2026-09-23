import {BRAND} from './brand';

/**
 * Unidades de Adsterra. Las claves no son secretas —viajan al navegador en
 * cualquier caso— así que viven aquí y no en variables de entorno: tenerlas a
 * la vista permite revisar de un vistazo qué formatos hay y dónde se usan.
 *
 * Las mismas claves están escritas en `public/ads/banner.html`, que es un
 * archivo estático y no puede importar de aquí. `tests/unit/ads.test.ts`
 * compara los dos sitios para que no se separen.
 */
export const BANNERS = {
  /** Cabecera de escritorio. */
  leaderboard: {key: 'b3cc6f1ea67e030bc0750c8f85c64ad7', width: 728, height: 90},
  /** El equivalente en móvil. Nunca se pintan los dos. */
  mobile: {key: '568d8d99d4e94b8319554b7ab4ead93f', width: 320, height: 50},
  /** El rectángulo de siempre: el que mejor rinde dentro de un texto. */
  rectangle: {key: '31bb45b342d6c7c2d0935b88b494104a', width: 300, height: 250},
  /** Intermedio, para huecos donde 728 no cabe y 320 se queda corto. */
  banner: {key: '9f899daf28c6bb4fccf7f7b3aba8a341', width: 468, height: 60},
  /** Rascacielos de columna lateral. */
  skyscraper: {key: '41dfababba2d5066eab3cf79fb0349b6', width: 160, height: 600},
  halfSkyscraper: {key: '61eea303bccd8fcab8d556b25e0d461c', width: 160, height: 300}
} as const;

export type BannerName = keyof typeof BANNERS;

const INVOKE_HOST = 'https://www.highrevenueformat.com';

export function bannerSrc(key: string): string {
  return `${INVOKE_HOST}/${key}/invoke.js`;
}

/**
 * La escalera de formatos horizontales, de mayor a menor. La cabecera elige en
 * tiempo de ejecución el más grande que quepa: 728 en escritorio, 468 en
 * tabletas estrechas y 320 en un teléfono.
 *
 * El margen de 40px es el aire que el hueco necesita a los lados; sin él, un
 * teléfono de 468px de ancho pediría el banner de 468 y se saldría.
 */
export const HORIZONTAL = [
  'leaderboard',
  'banner',
  'mobile'
] as const satisfies readonly BannerName[];
export const HORIZONTAL_GUTTER = 40;

/**
 * Por debajo de 360px no cabe entero ni el más estrecho, y ahí se usa igual:
 * un banner recortado por los lados se ve mejor que un hueco vacío.
 */
export const NARROWEST: BannerName = 'mobile';

/**
 * Los rascacielos laterales solo salen cuando sobra ancho de verdad. El
 * contenido más ancho del sitio mide 1152px (`max-w-6xl`): con dos columnas de
 * 160px más su aire hacen falta 1560px antes de que dejen de pisarlo. El
 * mínimo de alto evita que en una pantalla apaisada y baja el rascacielos de
 * 600px salga cortado por arriba y por abajo.
 */
export const RAIL_MIN_WIDTH = 1560;
export const RAIL_MIN_HEIGHT = 720;

/**
 * Banner nativo: se integra con el texto y es el formato que menos molesta,
 * así que es el que más se repite.
 *
 * El contenedor lleva un id fijo que impone la red, así que **solo puede haber
 * uno por página**. Dos contenedores con el mismo id y la red rellena uno.
 */
export const NATIVE = {
  key: '806f6a39527e80d0f59b790fbf261d4d',
  src: 'https://pl31465659.profitableratecpmnetwork.com/806f6a39527e80d0f59b790fbf261d4d/invoke.js'
} as const;

/**
 * Los dos formatos que no son banners. Adsterra los entrega como un script
 * suelto sin nada que los identifique, y por su forma son Social Bar y
 * Popunder: el primero flota sobre la página, el segundo abre una ventana
 * detrás al primer clic.
 *
 * Por eso solo se cargan en los artículos del blog, que es donde alguien está
 * leyendo y no en mitad de un sorteo. Un popunder mientras se reparte un amigo
 * secreto cuesta el sorteo entero.
 */
export const OVERLAY = {
  socialBar:
    'https://pl31465660.profitableratecpmnetwork.com/52/5c/dd/525cdd12776abed180526d57ab7cf7d5.js',
  popunder:
    'https://pl31465668.profitableratecpmnetwork.com/a4/22/d0/a422d0fa893721605f731b09a24414f3.js'
} as const;

/** Enlace directo de Adsterra, por si algún día se monetiza un botón. */
export const DIRECT_LINK =
  'https://www.profitableratecpmnetwork.com/s425fsses?key=10ed44a413da0ed72f40676635fd28d3';

/**
 * Los anuncios solo se cargan en el dominio de producción.
 *
 * Se mira el host en el navegador en vez de una variable de entorno porque
 * `NEXT_PUBLIC_*` se incrusta al compilar: con una variable, el mismo
 * compilado no podría llevar anuncios en producción y no llevarlos en las
 * pruebas. Así además quedan fuera los despliegues de vista previa, que a las
 * redes de anuncios no les gustan, y las pruebas de punta a punta, que corren
 * contra 127.0.0.1 y se volverían inestables con red de terceros de por medio.
 *
 * `www.` cuenta como el mismo sitio: si algún día el dominio se sirve con
 * prefijo, los anuncios no deben apagarse solos sin que nadie lo note.
 */
export function adsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location?.hostname ?? '';
  return host === BRAND.domain || host === `www.${BRAND.domain}`;
}
