import type {MetadataRoute} from 'next';
import {BRAND} from '@/config/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — sorteos y amigo secreto`,
    short_name: BRAND.name,
    description: 'Sorteos y amigo secreto con una ruleta giratoria.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f1e6cf',
    theme_color: '#c8382b',
    icons: [
      {src: '/icon-192.png', sizes: '192x192', type: 'image/png'},
      {src: '/icon-512.png', sizes: '512x512', type: 'image/png'},
      {src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'}
    ]
  };
}
