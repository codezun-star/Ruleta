'use client';

import {useEffect, type ReactNode} from 'react';

/**
 * Si ya hubo una navegación dentro de la app. Vive en el módulo y no en el
 * estado porque la plantilla se vuelve a montar entera en cada cambio de
 * página: es justo lo que la distingue de un layout.
 */
let navigated = false;

/**
 * Cada página entra con un fundido corto, como una pantalla nueva en una app,
 * en vez de cambiarse de golpe.
 *
 * La primera página no se anima: llega pintada del servidor, y animarla solo
 * retrasaría el primer pintado —y con él el LCP— para no aportar nada.
 */
export default function Template({children}: {children: ReactNode}) {
  const animate = navigated;

  useEffect(() => {
    navigated = true;
  }, []);

  return <div className={animate ? 'page-enter' : undefined}>{children}</div>;
}
