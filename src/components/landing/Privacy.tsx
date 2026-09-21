import {useTranslations} from 'next-intl';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {Icon} from '@/components/icons/Icons';

const POINTS = [1, 2, 3] as const;

export function Privacy() {
  const t = useTranslations('home.privacy');

  return (
    <section className="border-y-2 border-ink bg-paper-2 py-14 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <SectionHeading numeral="四" eyebrow={t('eyebrow')} title={t('title')} />
        <ul className="flex flex-col gap-3">
          {POINTS.map((n) => (
            <li key={n} className="flex items-start gap-3 border-b border-dotted border-hairline pb-3 last:border-b-0">
              <Icon name="shield" size={22} className="mt-0.5 shrink-0 text-vermilion" />
              <span className="text-ink-2">{t(`point${n}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
