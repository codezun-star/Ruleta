import {useTranslations} from 'next-intl';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {StampLink} from '@/components/ui/StampButton';
import {Icon, type IconName} from '@/components/icons/Icons';
import type {AppPathname} from '@/i18n/routing';

/** Los dos modos con ceremonia: lista, detalles y correos. */
const CEREMONIES = [
  {key: 'raffle', href: '/sorteo', icon: 'wheel'},
  {key: 'secretSanta', href: '/amigo-secreto', icon: 'gift'}
] as const satisfies readonly {key: string; href: AppPathname; icon: IconName}[];

/** Los tres que se resuelven de una sentada. */
const QUICK = [
  {namespace: 'decide', href: '/decidir', icon: 'dice'},
  {namespace: 'turns', href: '/turnos', icon: 'calendar'},
  {namespace: 'teams', href: '/equipos', icon: 'people'}
] as const satisfies readonly {namespace: string; href: AppPathname; icon: IconName}[];

export function Modes() {
  const t = useTranslations('home.modes');
  const decide = useTranslations('decide');
  const turns = useTranslations('turns');
  const teams = useTranslations('teams');
  const quickCopy = {decide, turns, teams};

  return (
    <section id="modos" className="scroll-mt-16 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <SectionHeading step={1} eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {CEREMONIES.map((mode) => (
            <article
              key={mode.key}
              className="double-frame flex flex-col gap-4 bg-paper-hi p-6"
              style={{['--surface' as string]: 'var(--paper-hi)'}}
            >
              <Icon name={mode.icon} size={40} className="text-vermilion" />
              <h3 className="font-head text-2xl font-black">{t(`${mode.key}.title`)}</h3>
              <p className="text-ink-2">{t(`${mode.key}.body`)}</p>
              <ul className="flex flex-col gap-2">
                {([1, 2, 3] as const).map((n) => (
                  <li key={n} className="flex gap-2.5 text-sm">
                    <span aria-hidden="true" className="text-matcha-deep">
                      ✓
                    </span>
                    {t(`${mode.key}.point${n}`)}
                  </li>
                ))}
              </ul>
              <StampLink href={mode.href} size="sm" className="mt-auto self-start">
                {t(`${mode.key}.cta`)}
              </StampLink>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="font-head text-2xl font-black">{t('quickTitle')}</h3>
          <p className="mt-1.5 text-ink-2">{t('quickLede')}</p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {QUICK.map((tool) => {
              const copy = quickCopy[tool.namespace];
              return (
                <article
                  key={tool.namespace}
                  className="flex flex-col gap-3 border-2 border-ink bg-paper-hi p-5 shadow-hard-sm"
                >
                  <Icon name={tool.icon} size={30} className="text-matcha-deep" />
                  <h4 className="font-head text-lg font-black">{copy('title')}</h4>
                  <p className="text-sm text-ink-2">{copy('lede')}</p>
                  <StampLink
                    href={tool.href}
                    variant="ghost"
                    size="sm"
                    className="mt-auto self-start"
                  >
                    {copy('cta')}
                  </StampLink>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
