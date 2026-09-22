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

const SIZES: Record<Size, string> = {
  md: 'px-6 py-3.5 text-base',
  sm: 'px-4 py-2 text-sm'
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
    'hover:-translate-x-px hover:-translate-y-px hover:shadow-hard',
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
