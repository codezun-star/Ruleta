'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {BANNERS, adsAllowed, type BannerName} from '@/config/ads';
import {storageKey} from '@/config/brand';
import {horizontalUnit} from '@/lib/adFrame';
import {Icon} from '@/components/icons/Icons';
import {AdBanner, viewportWidth} from './AdBanner';

/** Se recuerda solo mientras dure la pestaña: cerrarlo no es darse de baja. */
const DISMISSED = storageKey('anchor');

/** El hueco que el `<body>` reserva en el pie mientras la barra está puesta. */
const HEIGHT_VAR = '--ad-anchor-h';

/** Lo que el banner suma de borde y aire por encima y por debajo. */
const CHROME = 12;

function dismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISSED) === 'off';
  } catch {
    // Con cookies de terceros bloqueadas `sessionStorage` lanza en vez de
    // devolver nulo. Sin memoria, la barra vuelve a salir: es lo de menos.
    return false;
  }
}

/**
 * Barra de anuncio fija en el pie, descartable.
 *
 * En móvil se monta **encima** de la barra de pestañas, nunca sobre ella: los
 * cinco modos son la navegación del sitio y tienen que seguir pulsándose. El
 * alto de las dos cosas lo reserva el `<body>` con `--ad-anchor-h`, así que el
 * pie tampoco queda tapado.
 */
export function AdAnchor() {
  const t = useTranslations('ads');
  const [unit, setUnit] = useState<BannerName | null>(null);

  useEffect(() => {
    if (!adsAllowed() || dismissed()) return;
    setUnit(horizontalUnit(viewportWidth()));
  }, []);

  useEffect(() => {
    if (!unit) return;

    const root = document.documentElement;
    root.style.setProperty(HEIGHT_VAR, `${BANNERS[unit].height + CHROME}px`);
    return () => {
      root.style.removeProperty(HEIGHT_VAR);
    };
  }, [unit]);

  if (!unit) return null;

  const close = () => {
    setUnit(null);
    try {
      sessionStorage.setItem(DISMISSED, 'off');
    } catch {
      // Sin memoria volverá a salir en la siguiente página. Cerrarla aquí y
      // ahora, que es lo que se ha pedido, funciona igual.
    }
  };

  return (
    <aside
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom,0px))] z-40 flex justify-center border-t-2 border-ink bg-paper-2 py-1 md:bottom-0"
    >
      <button
        type="button"
        onClick={close}
        aria-label={t('close')}
        className="absolute -top-3.5 right-2 flex size-7 items-center justify-center border-2 border-ink bg-paper text-ink"
      >
        <Icon name="close" size={14} />
      </button>
      <AdBanner unit={unit} />
    </aside>
  );
}
