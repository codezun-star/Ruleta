'use client';

import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {Icon, type IconName} from '@/components/icons/Icons';
import {cn} from '@/lib/cn';
import {haptic} from '@/lib/haptics';
import {prefersReducedMotion} from '@/lib/prefersReducedMotion';
import type {StaticPathname} from '@/i18n/routing';

/**
 * Las cinco pestañas. Son los cinco modos y no incluyen el blog: una barra de
 * pestañas es para lo que se hace a menudo, no para todo lo que existe. El
 * blog se llega desde el menú y desde la cabecera en escritorio.
 */
const TABS = [
  {href: '/sorteo', icon: 'wheel', label: 'raffle'},
  {href: '/amigo-secreto', icon: 'gift', label: 'secretSanta'},
  {href: '/decidir', icon: 'dice', label: 'decide'},
  {href: '/turnos', icon: 'calendar', label: 'turns'},
  {href: '/equipos', icon: 'people', label: 'teams'}
] as const satisfies readonly {href: StaticPathname; icon: IconName; label: string}[];

/**
 * Barra de pestañas de móvil. Sustituye a la navegación por anclajes de la
 * cabecera, que solo existía en la portada, y pone los cinco modos a un pulgar
 * de distancia en cualquier pantalla.
 *
 * Solo aparece por debajo de `md`: en escritorio la navegación vive arriba,
 * donde se espera encontrarla.
 */
export function TabBar() {
  const t = useTranslations('tabs');
  const pathname = usePathname();

  return (
    <nav
      aria-label={t('label')}
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-paper-2 md:hidden"
    >
      {/* El alto sale de `--tabbar-h` menos el borde, que ya pone el <nav>. */}
      <ul className="flex h-[calc(var(--tabbar-h)-2px)] items-stretch">
        {TABS.map((tab) => {
          // `usePathname` devuelve la ruta interna, no la traducida, así que
          // esto compara igual de bien en español que en inglés.
          const active = pathname === tab.href;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                onClick={(event) => {
                  haptic('tap');
                  if (!active) return;
                  // Tocar la pestaña en la que ya estás sube al principio, como
                  // en cualquier app, en vez de recargar la misma página.
                  event.preventDefault();
                  window.scrollTo({top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth'});
                }}
                className="group flex h-full flex-col items-center justify-center gap-1"
              >
                {/* La píldora marca la pestaña activa con forma y no solo con
                    color, y se hunde al pulsar: es la respuesta al toque que
                    en una web no hay. Sin `hover:` a propósito: en una
                    pantalla táctil se queda pegado tras el toque. */}
                <span
                  className={cn(
                    'flex h-7 w-13 items-center justify-center border-2 transition-[background-color,border-color,transform] duration-150 ease-out group-active:scale-90',
                    active ? 'border-ink bg-mustard text-ink' : 'border-transparent text-ink-2'
                  )}
                >
                  <Icon name={tab.icon} size={20} />
                </span>
                <span
                  className={cn(
                    'text-[0.62rem] leading-none font-bold tracking-[0.06em] uppercase',
                    active ? 'text-ink' : 'text-ink-2'
                  )}
                >
                  {t(tab.label)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
