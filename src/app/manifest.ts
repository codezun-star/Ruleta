import type {MetadataRoute} from 'next';
import {BRAND} from '@/config/brand';
import {getPathname} from '@/i18n/navigation';
import {routing, type StaticPathname} from '@/i18n/routing';
import {THEME_COLORS} from '@/lib/theme';
// El manifiesto es uno para todo el sitio, así que habla el idioma por defecto.
import messages from '../../messages/es.json';

/**
 * Accesos directos: los cinco modos al mantener pulsado el icono de la app,
 * los mismos que la barra de pestañas y en el mismo orden.
 */
const SHORTCUTS: {href: StaticPathname; name: string; short: string}[] = [
  {href: '/sorteo', name: messages.raffle.title, short: messages.tabs.raffle},
  {href: '/amigo-secreto', name: messages.secretSanta.title, short: messages.tabs.secretSanta},
  {href: '/decidir', name: messages.decide.title, short: messages.tabs.decide},
  {href: '/turnos', name: messages.turns.title, short: messages.tabs.turns},
  {href: '/equipos', name: messages.teams.title, short: messages.tabs.teams}
];

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Fijo, para que cambiar `start_url` algún día no instale una app nueva
    // al lado de la vieja.
    id: '/',
    name: `${BRAND.name} — sorteos y amigo secreto`,
    short_name: BRAND.name,
    description: 'Sorteos y amigo secreto con una ruleta giratoria.',
    lang: routing.defaultLocale,
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // La pantalla de arranque es del color del papel y la barra de estado, del
    // de la cabecera: así la app se abre sin un fogonazo de otro color.
    background_color: '#f1e6cf',
    theme_color: THEME_COLORS.light,
    categories: ['entertainment', 'utilities', 'lifestyle'],
    icons: [
      {src: '/icon-192.png', sizes: '192x192', type: 'image/png'},
      {src: '/icon-512.png', sizes: '512x512', type: 'image/png'},
      {src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'}
    ],
    shortcuts: SHORTCUTS.map((shortcut) => ({
      name: shortcut.name,
      short_name: shortcut.short,
      url: getPathname({href: shortcut.href, locale: routing.defaultLocale}),
      icons: [{src: '/icon-192.png', sizes: '192x192', type: 'image/png'}]
    }))
  };
}
