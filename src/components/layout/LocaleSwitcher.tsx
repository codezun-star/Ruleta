'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';
import {useTransition} from 'react';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {cn} from '@/lib/cn';

/**
 * Cambia de idioma conservando la ruta actual. next-intl reescribe el prefijo
 * `/es` o `/en` y mantiene los parámetros dinámicos.
 */
export function LocaleSwitcher() {
  const t = useTranslations('common.locale');
  const active = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center border-2 border-ink" role="group" aria-label={t('label')}>
      {routing.locales.map((locale) => {
        const current = locale === active;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-current={current ? 'true' : undefined}
            disabled={isPending || current}
            onClick={() => {
              startTransition(() => {
                router.replace(
                  // @ts-expect-error -- la ruta actual siempre es válida para el otro idioma
                  {pathname, params},
                  {locale}
                );
              });
            }}
            className={cn(
              'touch-target flex h-9 items-center px-2.5 text-xs font-bold tracking-[0.12em] uppercase transition-colors',
              current
                ? 'bg-ink text-paper'
                : 'active:bg-mustard active:text-ink sm:hover:bg-mustard sm:hover:text-ink',
              isPending && !current && 'opacity-60'
            )}
          >
            {t(locale)}
          </button>
        );
      })}
    </div>
  );
}
