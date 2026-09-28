'use client';

import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {Icon} from '@/components/icons/Icons';
import type {StaticPathname} from '@/i18n/routing';

/**
 * A dónde lleva la flecha de cada página. Los cinco modos y la portada no
 * tienen: son la raíz de la app y se llega a ellos desde la barra de pestañas.
 *
 * Sube un nivel en vez de volver en el historial, como la flecha «arriba» de
 * Android: abierta desde un enlace compartido, una guía no tiene historial y
 * `history.back()` sacaría de la app.
 */
function parentOf(pathname: string): StaticPathname | null {
  // `usePathname` devuelve la ruta interna, así que un artículo llega como
  // `/blog/[slug]` en los dos idiomas.
  if (pathname.startsWith('/blog/')) return '/blog';
  if (pathname === '/blog' || pathname === '/privacidad' || pathname === '/terminos') return '/';
  return null;
}

export function BackButton() {
  const t = useTranslations('menu');
  const parent = parentOf(usePathname());
  if (!parent) return null;

  return (
    <Link
      href={parent}
      aria-label={t('back')}
      className="-ml-2 flex size-11 shrink-0 items-center justify-center transition-colors active:bg-paper-3 md:hidden"
    >
      <Icon name="back" size={24} />
    </Link>
  );
}
