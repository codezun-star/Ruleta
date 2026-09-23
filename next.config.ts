import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * `/ads/banner.html` es el documento que hospeda cada banner, y va dentro de
 * un `<iframe>` de nuestras propias páginas. Con las cabeceras del resto del
 * sitio —`X-Frame-Options: DENY` y `frame-ancestors 'none'`— el navegador se
 * niega a pintarlo: DENY no distingue entre otro sitio y este mismo. De ahí
 * que la regla general excluya `/ads/` y que esa carpeta tenga la suya.
 */
const ADS_PATH = 'ads/';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: `/:path((?!${ADS_PATH}).*)`,
        headers: [
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
          {key: 'X-Frame-Options', value: 'DENY'},
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            // Sin `script-src`: Next inyecta scripts en línea propios y
            // restringirlos pide nonces por petición, que es otra tarea.
            // Estas tres sí se pueden cerrar hoy sin romper nada.
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
          }
        ]
      },
      {
        // El banner solo puede ir dentro de una página nuestra, y el anuncio
        // no puede salirse de su marco para llevarse la pestaña entera.
        source: `/${ADS_PATH}:path*`,
        headers: [
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
          {key: 'Content-Security-Policy', value: "frame-ancestors 'self'"}
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
