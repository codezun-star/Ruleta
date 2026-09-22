'use client';

import {useTranslations} from 'next-intl';
import {nativeMarkup} from '@/lib/adMarkup';
import {AdFrame} from './AdFrame';

/**
 * Banner nativo: una rejilla de recomendaciones que se lee como parte del
 * texto. Es el formato que menos interrumpe, así que es el que más se repite.
 *
 * El alto se reserva a ojo porque la rejilla no dice cuánto va a medir. Se
 * queda corto antes que largo: un hueco vacío de más se ve peor que un anuncio
 * recortado por abajo.
 */
export function AdNative({className}: {className?: string}) {
  const t = useTranslations('ads');

  return <AdFrame html={nativeMarkup()} height={260} label={t('label')} className={className} />;
}
