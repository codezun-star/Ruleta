'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {BANNERS, type BannerName} from '@/config/ads';
import {horizontalUnit, sizeOf} from '@/lib/adFrame';
import {AdFrame} from './AdFrame';

export function AdBanner({unit, className}: {unit: BannerName; className?: string}) {
  const t = useTranslations('ads');
  const {width, height} = BANNERS[unit];

  return (
    <AdFrame
      size={sizeOf(unit)}
      width={width}
      height={height}
      label={t('label')}
      className={className}
    />
  );
}

/** El ancho de la ventana sin la barra de desplazamiento, que no es sitio útil. */
export function viewportWidth(): number {
  return document.documentElement.clientWidth || window.innerWidth || 0;
}

/**
 * La cabecera: 728, 468 o 320 según lo que quepa de verdad. Se elige uno y
 * solo se carga ese —pintar los tres y esconder dos con CSS descarga tres
 * anuncios y cobra por uno— y no se vuelve a elegir al redimensionar: cambiar
 * el anuncio a media lectura molesta más que enseñar el formato que ya estaba,
 * y para la red una segunda petición es un refresco que penaliza.
 */
export function AdLeaderboard({className}: {className?: string}) {
  const [unit, setUnit] = useState<BannerName | null>(null);

  useEffect(() => setUnit(horizontalUnit(viewportWidth())), []);

  if (!unit) return null;
  return <AdBanner unit={unit} className={className} />;
}
