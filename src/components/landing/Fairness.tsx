import {useTranslations} from 'next-intl';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {Icon, type IconName} from '@/components/icons/Icons';

const POINTS = [
  {key: 'point1', icon: 'dice'},
  {key: 'point2', icon: 'shield'},
  {key: 'point3', icon: 'lock'}
] as const satisfies readonly {key: string; icon: IconName}[];

export function Fairness() {
  const t = useTranslations('home.fairness');

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <SectionHeading step={3} eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {POINTS.map((point) => (
            <article
              key={point.key}
              className="double-frame-flat bg-paper-hi p-5"
              style={{['--surface' as string]: 'var(--paper-hi)'}}
            >
              <Icon name={point.icon} size={32} className="text-matcha-deep" />
              <h3 className="mt-3 font-head text-lg font-black">{t(`${point.key}.title`)}</h3>
              <p className="mt-1.5 text-sm text-ink-2">{t(`${point.key}.body`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
