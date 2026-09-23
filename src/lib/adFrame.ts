import {BANNERS, HORIZONTAL, HORIZONTAL_GUTTER, NARROWEST, type BannerName} from '@/config/ads';

/**
 * Cada banner se pinta dentro de un iframe hacia este documento, servido desde
 * el propio dominio. El porqué —`atOptions` es global y dos banners en la
 * misma ventana se pisan— está escrito en el propio archivo, que es donde se
 * puede leer junto al código que lo aprovecha.
 */
export const AD_HOST = '/ads/banner.html';

/** `728x90`, `300x250`… el formato tal y como lo espera el host del banner. */
export type AdSize = `${number}x${number}`;

export function sizeOf(unit: BannerName): AdSize {
  const {width, height} = BANNERS[unit];
  return `${width}x${height}`;
}

export function frameSrc(size: AdSize): string {
  return `${AD_HOST}?s=${size}`;
}

/**
 * El formato horizontal más grande que cabe en el ancho dado. Se decide con el
 * ancho real de la pantalla y una sola vez: repetir la petición al girar el
 * teléfono cuenta como refresco y la red lo penaliza, además de cambiar el
 * anuncio a media lectura.
 */
export function horizontalUnit(viewportWidth: number): BannerName {
  const fits = HORIZONTAL.find((unit) => viewportWidth >= BANNERS[unit].width + HORIZONTAL_GUTTER);
  return fits ?? NARROWEST;
}
