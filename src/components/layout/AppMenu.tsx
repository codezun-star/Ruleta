'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {BRAND} from '@/config/brand';
import {Icon, type IconName} from '@/components/icons/Icons';
import {SealMark} from '@/components/ui/SealMark';
import {cn} from '@/lib/cn';
import {haptic} from '@/lib/haptics';
import {prefersReducedMotion} from '@/lib/prefersReducedMotion';
import {hydrateSoundPreference, useSoundEnabled} from '@/lib/soundPreference';
import {LocaleSwitcher} from './LocaleSwitcher';
import {switchSound} from './SoundToggle';
import {applyTheme, useTheme} from './ThemeToggle';
import {useInstallPrompt} from './useInstallPrompt';

/** Lo que hay que arrastrar la hoja hacia abajo para que se cierre al soltar. */
const DISMISS_FRACTION = 0.28;
/** O lo rápido que hay que lanzarla, en px/ms: un gesto corto y seco también vale. */
const DISMISS_VELOCITY = 0.55;
const CLOSE_MS = 220;

const ROW =
  'flex min-h-13 w-full items-center gap-3.5 px-4 text-left font-semibold transition-colors active:bg-paper-3';

type Href = ComponentProps<typeof Link>['href'];

/** Un arrastre en curso: de dónde salió y a qué velocidad va, en px/ms. */
type Drag = {startY: number; lastY: number; lastT: number; velocity: number};

/**
 * Menú de móvil: una hoja que sube desde abajo, como la de cualquier app.
 *
 * Es un `<dialog>` modal y no un `<div>` con `z-index`: el navegador ya mete
 * el foco dentro, lo devuelve al botón al cerrar, cierra con Escape o con el
 * gesto de atrás de Android, deja el resto de la página inerte para lectores
 * de pantalla y lo pinta en la capa superior, por encima de la barra de
 * pestañas y del anuncio ancla sin pelearse con sus `z-index`.
 *
 * Aquí viven los ajustes que en escritorio van en la cabecera —idioma y
 * tema—, los enlaces de la portada y del pie, y la opción de instalar.
 */
export function AppMenu({hasBlog}: {hasBlog: boolean}) {
  const t = useTranslations('menu');
  const id = useId();
  const pathname = usePathname();
  const locale = useLocale();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [open, setOpen] = useState(false);

  const theme = useTheme();
  const sound = useSoundEnabled();
  const {state: installState, install} = useInstallPrompt();
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    hydrateSoundPreference();
  }, []);

  const show = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    haptic('tap');
    setIosHint(false);
    dialog.showModal();
    setOpen(true);
  };

  /**
   * Cierra deslizando la hoja hacia abajo desde donde esté, que puede ser a
   * medio arrastre. El `<dialog>` se cierra de verdad al terminar: si se
   * cerrase antes, desaparecería de golpe.
   */
  const close = useCallback(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (!dialog?.open || !panel || 'closing' in dialog.dataset) return;

    if (prefersReducedMotion()) {
      dialog.close();
      return;
    }

    dialog.dataset.closing = '';
    panel.style.transition = `transform ${CLOSE_MS}ms cubic-bezier(0.4, 0, 1, 1)`;
    panel.style.transform = 'translateY(100%)';

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      panel.removeEventListener('transitionend', onEnd);
      window.clearTimeout(fallback);
      dialog.close();
    };
    // `transitionend` burbujea: el interruptor de dentro también lo lanza.
    const onEnd = (event: TransitionEvent) => {
      if (event.target === panel && event.propertyName === 'transform') finish();
    };
    // Por si la transición no llega a correr (pestaña en segundo plano).
    const fallback = window.setTimeout(finish, CLOSE_MS + 120);
    panel.addEventListener('transitionend', onEnd);
  }, []);

  /** Deja la hoja lista para la próxima vez, sin restos del cierre ni del arrastre. */
  const onClosed = () => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (dialog) delete dialog.dataset.closing;
    if (panel) {
      panel.style.transition = '';
      panel.style.transform = '';
    }
    drag.current = null;
    setOpen(false);
  };

  // Al cambiar de página o de idioma la hoja no tiene nada más que hacer. Si
  // ya se estaba cerrando por el toque en un enlace, se la deja terminar.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog?.open && !('closing' in dialog.dataset)) dialog.close();
  }, [pathname, locale]);

  /* Arrastrar para cerrar, desde el asa o la cabecera de la hoja. */

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current;
    if (!panel || event.button !== 0 || (event.target as Element).closest('button')) return;
    drag.current = {
      startY: event.clientY,
      lastY: event.clientY,
      lastT: event.timeStamp,
      velocity: 0
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    panel.style.transition = 'none';
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const panel = panelRef.current;
    if (!state || !panel) return;

    const elapsed = event.timeStamp - state.lastT;
    if (elapsed > 0) state.velocity = (event.clientY - state.lastY) / elapsed;
    state.lastY = event.clientY;
    state.lastT = event.timeStamp;

    // Hacia arriba no se mueve: la hoja ya está entera a la vista.
    const offset = Math.max(0, event.clientY - state.startY);
    panel.style.transform = `translateY(${offset}px)`;
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const panel = panelRef.current;
    drag.current = null;
    if (!state || !panel) return;

    const offset = event.clientY - state.startY;
    const dismissed =
      event.type === 'pointerup' &&
      (offset > panel.offsetHeight * DISMISS_FRACTION || state.velocity > DISMISS_VELOCITY);

    if (dismissed) {
      close();
    } else {
      panel.style.transition = 'transform 200ms cubic-bezier(0.2, 0.9, 0.3, 1)';
      panel.style.transform = '';
    }
  };

  const dark = theme === 'dark';
  const titleId = `${id}-title`;

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        aria-label={t('open')}
        className="touch-target inline-flex size-9 items-center justify-center border-2 border-ink transition-colors active:bg-mustard active:text-ink md:hidden"
      >
        <Icon name="menu" size={20} />
      </button>

      <dialog
        ref={dialogRef}
        id={id}
        aria-labelledby={titleId}
        className="app-sheet"
        onCancel={(event) => {
          // Escape y el gesto de atrás: misma salida animada que el resto.
          event.preventDefault();
          close();
        }}
        onClose={onClosed}
        onClick={(event) => {
          // La hoja ocupa todo el `<dialog>`, así que un toque que llega al
          // propio `<dialog>` solo puede venir del fondo oscurecido.
          if (event.target === event.currentTarget) close();
        }}
      >
        <div
          ref={panelRef}
          className="app-sheet-panel flex max-h-full min-h-0 flex-col border-t-2 border-ink bg-paper shadow-[0_-5px_0_var(--shadow-color)]"
        >
          <div
            className="shrink-0 cursor-grab touch-none px-4 pt-2.5 pb-3 select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          >
            <span aria-hidden="true" className="mx-auto block h-1.5 w-11 rounded-full bg-ink-3" />
            <div className="mt-3 flex items-center justify-between gap-3">
              <h2
                id={titleId}
                className="flex items-center gap-2.5 font-head text-xl font-black tracking-tight"
              >
                <SealMark size={28} />
                {BRAND.name}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label={t('close')}
                className="touch-target inline-flex size-9 items-center justify-center border-2 border-ink transition-colors active:bg-mustard active:text-ink"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]">
            <Group title={t('explore')}>
              <MenuLink href="/" icon="home" onNavigate={close}>
                {t('home')}
              </MenuLink>
              <MenuLink
                href={{pathname: '/', hash: '#como-funciona'}}
                icon="wheel"
                onNavigate={close}
              >
                {t('how')}
              </MenuLink>
              <MenuLink href={{pathname: '/', hash: '#preguntas'}} icon="help" onNavigate={close}>
                {t('faq')}
              </MenuLink>
              {hasBlog ? (
                <MenuLink href="/blog" icon="book" onNavigate={close}>
                  {t('blog')}
                </MenuLink>
              ) : null}
            </Group>

            <Group title={t('settings')}>
              <li className="flex min-h-13 items-center gap-3.5 border-b border-hairline px-4">
                <Icon name="globe" size={22} className="shrink-0 text-ink-2" />
                <span className="flex-1 font-semibold">{t('language')}</span>
                <LocaleSwitcher />
              </li>
              <li className="border-b border-hairline">
                <button
                  type="button"
                  role="switch"
                  aria-checked={dark}
                  onClick={() => {
                    haptic('tap');
                    applyTheme(dark ? 'light' : 'dark');
                  }}
                  className={ROW}
                >
                  <Icon name="moon" size={22} className="shrink-0 text-ink-2" />
                  <span className="flex-1">{t('darkMode')}</span>
                  <SwitchMark on={dark} />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  role="switch"
                  aria-checked={sound}
                  onClick={() => {
                    haptic('tap');
                    switchSound(!sound);
                  }}
                  className={ROW}
                >
                  <Icon name={sound ? 'sound' : 'mute'} size={22} className="shrink-0 text-ink-2" />
                  <span className="flex-1">{t('sound')}</span>
                  <SwitchMark on={sound} />
                </button>
              </li>
            </Group>

            {installState === 'available' || installState === 'ios' ? (
              <Group title={t('app')}>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      haptic('tap');
                      if (installState === 'available') void install();
                      else setIosHint((shown) => !shown);
                    }}
                    aria-expanded={installState === 'ios' ? iosHint : undefined}
                    className={cn(ROW, 'py-2.5')}
                  >
                    <Icon name="install" size={22} className="shrink-0 text-ink-2" />
                    <span className="flex flex-1 flex-col">
                      {t('install', {name: BRAND.name})}
                      <span className="text-sm font-normal text-ink-2">{t('installHint')}</span>
                    </span>
                  </button>
                  {installState === 'ios' && iosHint ? (
                    <p className="border-t border-hairline bg-paper-2 px-4 py-3 text-sm">
                      {t('installIos')}
                    </p>
                  ) : null}
                </li>
              </Group>
            ) : null}

            <Group title={t('legal')}>
              <MenuLink href="/privacidad" icon="lock" onNavigate={close}>
                {t('privacy')}
              </MenuLink>
              <MenuLink href="/terminos" icon="doc" onNavigate={close}>
                {t('terms')}
              </MenuLink>
            </Group>

            <p className="mt-5 px-1 text-sm text-ink-2">
              {t('retention')}
              <br />
              <span className="font-semibold">{BRAND.domain}</span>
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}

function Group({title, children}: {title: string; children: ReactNode}) {
  return (
    <section className="mt-4 first:mt-1">
      <h3 className="px-1 text-[0.68rem] font-bold tracking-[0.18em] text-ink-2 uppercase">
        {title}
      </h3>
      <ul className="mt-2 border-2 border-ink bg-paper-hi">{children}</ul>
    </section>
  );
}

function MenuLink({
  href,
  icon,
  onNavigate,
  children
}: {
  href: Href;
  icon: IconName;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <li className="border-b border-hairline last:border-b-0">
      <Link href={href} onClick={onNavigate} className={ROW}>
        <Icon name={icon} size={22} className="shrink-0 text-ink-2" />
        <span className="flex-1">{children}</span>
        <Icon name="chevron" size={16} className="shrink-0 text-ink-3" />
      </Link>
    </li>
  );
}

/** El dibujo del interruptor. El estado lo lleva `aria-checked` del botón. */
function SwitchMark({on}: {on: boolean}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 border-2 border-ink transition-colors',
        on ? 'bg-matcha' : 'bg-paper-3'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-5 border-2 border-ink bg-paper-hi transition-transform duration-200',
          on && 'translate-x-5'
        )}
      />
    </span>
  );
}
