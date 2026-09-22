'use client';

import {useEffect, useRef} from 'react';
import {useLocale} from 'next-intl';

const SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type Turnstile = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'error-callback': () => void;
      'expired-callback': () => void;
      theme: 'light' | 'dark';
      language: string;
    }
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let loader: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Turnstile'));
    document.head.appendChild(script);
  });
  return loader;
}

/**
 * Captcha ligero antes de mandar correos. Si no hay clave pública no se
 * renderiza nada: el sitio tiene que funcionar sin Cloudflare configurado.
 */
export function TurnstileWidget({onToken}: {onToken: (token: string | null) => void}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!siteKey) return;
    const container = containerRef.current;
    if (!container) return;

    let widgetId: string | null = null;
    let disposed = false;

    loadScript()
      .then(() => {
        if (disposed || !window.turnstile) return;
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          callback: (token) => onToken(token),
          'error-callback': () => onToken(null),
          'expired-callback': () => onToken(null),
          theme: dark ? 'dark' : 'light',
          language: locale
        });
      })
      .catch(() => onToken(null));

    return () => {
      disposed = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, locale, onToken]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="min-h-[65px]" />;
}

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}
