import {BANNERS, NATIVE, bannerSrc, type BannerName} from '@/config/ads';

/**
 * Permisos del marco de cada anuncio.
 *
 * Lo que **no** está es lo que importa: sin `allow-same-origin`, el script del
 * anuncio corre en un origen opaco y no puede tocar el `localStorage` de la
 * página, donde vive el borrador del asistente con los nombres y los correos
 * de los participantes.
 *
 * `allow-popups` y `allow-popups-to-escape-sandbox` sí hacen falta: sin ellos
 * el anuncio se ve pero no se puede pulsar, que es lo mismo que no tenerlo.
 */
export const AD_SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms';

export function adDocument(body: string): string {
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>',
    '</head><body>',
    body,
    '</body></html>'
  ].join('');
}

/**
 * Adsterra configura cada banner escribiendo `atOptions` en `window` y luego
 * cargando su script, que lo lee al ejecutarse. De ahí las dos etiquetas en
 * este orden, y de ahí que cada anuncio necesite su propio documento: con dos
 * en la misma página, el segundo pisa al primero antes de que llegue a leerlo.
 */
export function bannerMarkup(unit: BannerName): string {
  const {key, width, height} = BANNERS[unit];
  const options = JSON.stringify({key, format: 'iframe', height, width, params: {}});
  return `<script>window.atOptions=${options};</script><script src="${bannerSrc(key)}"></script>`;
}

export function nativeMarkup(): string {
  return [
    `<script async data-cfasync="false" src="${NATIVE.src}"></script>`,
    `<div id="container-${NATIVE.key}"></div>`
  ].join('');
}
