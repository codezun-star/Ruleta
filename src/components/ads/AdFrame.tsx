'use client';

import {useEffect, useState} from 'react';
import {adsAllowed} from '@/config/ads';
import {AD_SANDBOX, adDocument} from '@/lib/adMarkup';
import {cn} from '@/lib/cn';

/**
 * Un anuncio, siempre dentro de un iframe aislado. El porqué del aislamiento y
 * de cada permiso está en `@/lib/adMarkup`, que es donde se puede probar.
 */
export function AdFrame({
  html,
  width,
  height,
  label,
  className
}: {
  html: string;
  /** Sin ancho, el hueco ocupa el del contenedor. */
  width?: number;
  height: number;
  label: string;
  className?: string;
}) {
  // Los anuncios solo existen en el navegador y solo en producción, así que se
  // montan después de la hidratación. Antes de eso no se reserva ningún hueco:
  // un rectángulo vacío en las demás máquinas sería peor que nada.
  const [show, setShow] = useState(false);
  useEffect(() => setShow(adsAllowed()), []);

  if (!show) return null;

  return (
    <div
      className={cn('mx-auto flex justify-center', className)}
      // El alto se reserva antes de que cargue el anuncio: si el hueco creciera
      // al llegar, empujaría el texto que se está leyendo.
      style={{height, maxWidth: width ? `${width}px` : undefined}}
    >
      <iframe
        title={label}
        srcDoc={adDocument(html)}
        sandbox={AD_SANDBOX}
        loading="lazy"
        scrolling="no"
        width={width}
        height={height}
        className="block border-0"
        style={{width: width ? `${width}px` : '100%', height}}
      />
    </div>
  );
}
