import type {ReactNode} from 'react';

/**
 * El layout raíz solo deja pasar a `[locale]/layout.tsx`, que es quien
 * conoce el idioma y por tanto puede emitir `<html lang>`.
 */
export default function RootLayout({children}: {children: ReactNode}) {
  return children;
}
