'use client';

import {useEffect, useRef, useState} from 'react';
import {adsAllowed} from '@/config/ads';

/**
 * Se pide el anuncio antes de que el hueco entre en pantalla, no cuando ya se
 * ve: así llega pintado y cuenta como visto. Seiscientos píxeles es poco más
 * de una pantalla de móvil por delante.
 */
const ROOT_MARGIN = '600px 0px';

export type AdSlot = {
  /** Va en el contenedor del hueco: es lo que se vigila. */
  ref: React.RefObject<HTMLDivElement | null>;
  /** El dominio permite anuncios. Falso en el servidor, en local y en previews. */
  allowed: boolean;
  /** El hueco está lo bastante cerca como para pedir el anuncio. */
  near: boolean;
};

/**
 * Las dos puertas por las que pasa cualquier anuncio del sitio.
 *
 * La primera es el dominio, y se resuelve después de la hidratación porque
 * depende de `window`. Hasta entonces `allowed` es falso y el hueco no existe:
 * un rectángulo reservado que nunca se rellena —en local, o con un bloqueador
 * de anuncios— deja un agujero en mitad del texto, que se ve peor que nada.
 *
 * La segunda es la cercanía al viewport. Mientras el hueco esté lejos no se
 * pide nada, así que los anuncios no compiten con el contenido por el ancho de
 * banda de la primera pantalla.
 */
export function useAdSlot(): AdSlot {
  const ref = useRef<HTMLDivElement | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => setAllowed(adsAllowed()), []);

  useEffect(() => {
    if (!allowed || near) return;

    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setNear(true);
      },
      {rootMargin: ROOT_MARGIN}
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [allowed, near]);

  return {ref, allowed, near};
}
