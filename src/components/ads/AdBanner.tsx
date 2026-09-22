'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {BANNERS, type BannerName} from '@/config/ads';
import {bannerMarkup} from '@/lib/adMarkup';
import {AdFrame} from './AdFrame';

export function AdBanner({unit, className}: {unit: BannerName; className?: string}) {
  const t = useTranslations('ads');
  const {width, height} = BANNERS[unit];

  return (
    <AdFrame
      html={bannerMarkup(unit)}
      width={width}
      height={height}
      label={t('label')}
      className={className}
    />
  );
}

/**
 * El par cabecera/móvil. Se elige uno y solo se carga ese: pintar los dos y
 * esconder uno con CSS descarga dos anuncios y cobra por uno.
 */
export function AdLeaderboard({className}: {className?: string}) {
  const [wide, setWide] = useState<boolean | null>(null);

  useEffect(() => {
    // Si alguien gira el teléfono no se recarga: cambiar el anuncio a media
    // lectura molesta más que enseñar el formato que ya estaba.
    setWide(window.matchMedia(`(min-width: ${BANNERS.leaderboard.width + 40}px)`).matches);
  }, []);

  if (wide === null) return null;
  return <AdBanner unit={wide ? 'leaderboard' : 'mobile'} className={className} />;
}
