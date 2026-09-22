import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);

/**
 * Lo que `getPathname` admite: una ruta estática, o el par ruta + parámetros
 * cuando la ruta lleva corchetes. Se deriva de la propia función para que no
 * se pueda desincronizar de `routing.pathnames`.
 */
export type PathnameHref = Parameters<typeof getPathname>[0]['href'];
