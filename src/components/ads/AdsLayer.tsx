import {AdAnchor} from './AdAnchor';
import {AdRails} from './AdRails';

/**
 * Los anuncios que no pertenecen a ninguna página en concreto: la barra del
 * pie y los dos rascacielos laterales. Se monta una sola vez, en el layout, y
 * por eso alcanza a todo el sitio.
 *
 * El Social Bar, que flota sobre el contenido, **no** está aquí a propósito:
 * vive en `AdOverlay`, que solo se usa en los artículos del blog.
 */
export function AdsLayer() {
  return (
    <>
      <AdAnchor />
      <AdRails />
    </>
  );
}
