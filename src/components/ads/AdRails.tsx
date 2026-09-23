'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {RAIL_MIN_HEIGHT, RAIL_MIN_WIDTH, adsAllowed} from '@/config/ads';
import {AdBanner} from './AdBanner';

/**
 * Los dos rascacielos de los lados.
 *
 * Solo en pantallas donde sobra sitio de verdad: por debajo de 1560px una
 * columna de 160px se comería el margen del contenido, y con menos de 720px de
 * alto el de 600 sale cortado. Se decide una vez, al montar, y no se recalcula
 * al redimensionar: quitar y volver a poner el anuncio arrastrando el borde de
 * la ventana es pedirlo dos veces.
 */
export function AdRails() {
  const t = useTranslations('ads');
  const [room, setRoom] = useState(false);

  useEffect(() => {
    if (!adsAllowed()) return;
    setRoom(
      window.matchMedia(`(min-width: ${RAIL_MIN_WIDTH}px) and (min-height: ${RAIL_MIN_HEIGHT}px)`)
        .matches
    );
  }, []);

  if (!room) return null;

  return (
    <>
      <aside aria-label={t('label')} className="fixed top-1/2 left-2.5 z-30 -translate-y-1/2">
        <AdBanner unit="halfSkyscraper" />
      </aside>
      <aside aria-label={t('label')} className="fixed top-1/2 right-2.5 z-30 -translate-y-1/2">
        <AdBanner unit="skyscraper" />
      </aside>
    </>
  );
}
