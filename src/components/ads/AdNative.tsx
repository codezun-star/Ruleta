'use client';

import {useEffect} from 'react';
import {NATIVE} from '@/config/ads';
import {cn} from '@/lib/cn';
import {useAdSlot} from './useAdSlot';

/**
 * Banner nativo: una rejilla de recomendaciones que se lee como parte del
 * texto. Es el formato que menos interrumpe.
 *
 * IMPORTANTE: el contenedor lleva un id fijo que impone la red, así que solo
 * puede haber UNO por página. Dos en la misma página y la red rellena uno.
 *
 * Su script no va dentro de un iframe —a diferencia de los banners— porque lo
 * que hace es buscar su contenedor en el documento y escribir dentro. Aislado
 * no encontraría nada.
 *
 * No se reserva alto: la rejilla no dice cuánto va a medir, y un hueco vacío
 * del tamaño equivocado se ve peor que el empujón al rellenarse, que además
 * ocurre fuera de pantalla porque el anuncio se pide con antelación.
 */
export function AdNative({className}: {className?: string}) {
  const {ref, allowed, near} = useAdSlot();

  useEffect(() => {
    if (!near) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = NATIVE.src;
    document.body.appendChild(script);

    // Quitar la etiqueta no deshace lo que el script ya pintó, pero evita que
    // se acumule una copia por cada página que se visita sin recargar.
    return () => script.remove();
  }, [near]);

  if (!allowed) return null;

  return (
    <div ref={ref} className={cn(className)}>
      <div id={`container-${NATIVE.key}`} />
    </div>
  );
}
