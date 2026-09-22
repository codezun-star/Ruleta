import type {ComponentProps, ReactNode} from 'react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-vermilion text-on-vermilion',
  secondary: 'bg-wood text-on-wood',
  ghost: 'bg-transparent text-ink hover:bg-mustard'
};

/**
 * `min-h` en lugar de solo relleno: el tamaño pequeño se quedaba en 34px de
 * alto, por debajo de los 44 que pide una pantalla táctil para no fallar el
 * toque. El dibujo del botón no cambia en escritorio.
 */
const SIZES: Record<Size, string> = {
  md: 'min-h-12 px-6 py-3.5 text-base',
  sm: 'min-h-11 px-4 py-2 text-sm'
};

/**
 * Botón con forma de sello: al pulsarlo se hunde 3px y pierde la sombra dura,
 * como si estampara sobre el papel.
 */
function stampClasses(variant: Variant, size: Size, className?: string) {
  return cn(
    // Bevan solo tiene peso 400: pedir `font-bold` haría que el navegador lo
    // engordase falsificando el trazo, y las letras salen emborronadas.
    'inline-flex items-center justify-center gap-2 border-2 border-ink font-display leading-none',
    'shadow-hard-sm transition-[transform,box-shadow,background-color] duration-100 ease-out',
    // El realce al pasar por encima se limita a los punteros de verdad: en una
    // pantalla táctil el `hover` se queda pegado después del toque y el botón
    // parece haberse quedado a medias.
    'sm:hover:-translate-x-px sm:hover:-translate-y-px sm:hover:shadow-hard',
    'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function StampButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type="button" className={stampClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

type LinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function StampLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: LinkProps) {
  return (
    <Link className={stampClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
