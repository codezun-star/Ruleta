'use client';

import {frameSrc, type AdSize} from '@/lib/adFrame';
import {cn} from '@/lib/cn';
import {useAdSlot} from './useAdSlot';

/**
 * Un banner, dentro de un iframe hacia `/ads/banner.html`.
 *
 * Cada unidad necesita su propia ventana porque Adsterra configura el banner
 * escribiendo `atOptions` en `window`: con dos en la misma página, el segundo
 * pisa al primero antes de que su script llegue a leerlo. El documento que
 * hospeda cada uno está en `public/ads/banner.html`, junto al porqué completo.
 *
 * El iframe apunta a un archivo del propio dominio y no lleva `sandbox`. Con
 * `srcdoc` y un `sandbox` sin `allow-same-origin` el anuncio queda en un
 * origen opaco: `localStorage` lanza al leerlo, las peticiones salen con
 * `Origin: null` y la red no reconoce el dominio de la zona, así que el marco
 * se quedaba vacío. El precio de tener anuncios es que su script comparte
 * origen con la página; para aislarlo de verdad haría falta servir este
 * archivo desde otro dominio, no desde otra carpeta.
 */
export function AdFrame({
  size,
  width,
  height,
  label,
  className
}: {
  size: AdSize;
  /** Sin ancho, el hueco ocupa el del contenedor. */
  width?: number;
  height: number;
  label: string;
  className?: string;
}) {
  const {ref, allowed, near} = useAdSlot();

  if (!allowed) return null;

  return (
    <div
      ref={ref}
      className={cn('mx-auto flex justify-center', className)}
      // El alto se reserva desde el principio: si el hueco creciera al llegar
      // el anuncio, empujaría el texto que se está leyendo.
      style={{height, maxWidth: width ? `${width}px` : undefined}}
    >
      {near ? (
        <iframe
          title={label}
          src={frameSrc(size)}
          scrolling="no"
          width={width}
          height={height}
          className="block border-0"
          style={{width: width ? `${width}px` : '100%', height}}
        />
      ) : null}
    </div>
  );
}
