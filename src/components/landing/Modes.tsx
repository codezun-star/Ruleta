import {useTranslations} from 'next-intl';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {StampLink} from '@/components/ui/StampButton';
import {Icon, type IconName} from '@/components/icons/Icons';

const MODES = [
  {key: 'raffle', href: '/sorteo', icon: 'wheel'},
  {key: 'secretSanta', href: '/amigo-secreto', icon: 'gift'}
] as const satisfies readonly {key: string; href: '/sorteo' | '/amigo-secreto'; icon: IconName}[];

export function Modes() {
  const t = useTranslations('home.modes');

  return (
    <section id="modos" className="scroll-mt-16 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <SectionHeading step={1} eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {MODES.map((mode) => (
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
      </div>
    </section>
  );
}
