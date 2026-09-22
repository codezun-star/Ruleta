'use client';

import {useEffect} from 'react';
import {OVERLAY, adsAllowed} from '@/config/ads';

/**
 * Social Bar y Popunder. Estos **no** pueden vivir en un iframe: su trabajo es
 * flotar sobre la página y abrir ventanas, y aislados no harían ninguna de las
 * dos cosas. Eso significa que sí corren en nuestro origen, y por eso se
 * limitan a un sitio.
 *
 * Solo en los artículos del blog. Nunca en la portada, nunca en los cinco
 * modos y nunca en las páginas legales: un popunder en mitad de un amigo
 * secreto —con la lista a medio escribir y el asistente abierto— cuesta el
 * sorteo entero y a esa persona no vuelve.
 *
 * Se cargan al desmontar la página, no antes: quien entra a un artículo desde
 * un buscador tiene que poder leer el primer párrafo sin que le salte nada.
 */
export function AdOverlay() {
  useEffect(() => {
    if (!adsAllowed()) return;

    const added: HTMLScriptElement[] = [];
    // Un retardo corto para que el texto llegue antes que el anuncio. No es
    // cosmético: si el Social Bar aparece durante la carga, tapa el titular
    // justo cuando se está decidiendo si quedarse.
    const timer = window.setTimeout(() => {
      for (const src of Object.values(OVERLAY)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
        added.push(script);
      }
    }, 4000);

    return () => {
      window.clearTimeout(timer);
      // Quitar la etiqueta no deshace lo que el script ya montó, pero evita
      // que se acumule una copia por cada artículo que se visita.
      for (const script of added) script.remove();
    };
  }, []);

  return null;
}
