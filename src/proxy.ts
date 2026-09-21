import createMiddleware from 'next-intl/middleware';
import {routing} from '@/i18n/routing';

/**
 * Redirige `/` al idioma que pida el navegador (Accept-Language) y mantiene
 * el prefijo `/es` o `/en` en todas las rutas.
 */
export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)'
};
