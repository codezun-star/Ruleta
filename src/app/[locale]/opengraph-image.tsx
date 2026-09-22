import {ImageResponse} from 'next/og';
import {getTranslations} from 'next-intl/server';
import {BRAND} from '@/config/brand';

export const size = {width: 1200, height: 630};
export const contentType = 'image/png';
export const alt = BRAND.name;

const PAPER = '#f1e6cf';
const INK = '#1b2a41';
const INK_SOFT = '#33455e';
const VERMILION = '#c8382b';
const MUSTARD = '#e0a526';
const MATCHA = '#7a8f5a';
const SAKURA = '#e8a9a0';
const WOOD = '#c8a06a';
const CREAM = '#fff8ec';

const FLAG_COLORS = [VERMILION, MUSTARD, MATCHA, SAKURA, WOOD];
const SEGMENTS = [VERMILION, CREAM, MATCHA, SAKURA, MUSTARD, CREAM, MATCHA, SAKURA];

const CX = 190;
const CY = 190;
const R = 132;

/** Satori no entiende `conic-gradient` ni `clip-path`: todo va en SVG. */
function wedge(index: number, total: number): string {
  const step = 360 / total;
  const toPoint = (degrees: number): {x: number; y: number} => {
    const radians = ((degrees - 90) * Math.PI) / 180;
    return {x: CX + R * Math.cos(radians), y: CY + R * Math.sin(radians)};
  };
  const from = toPoint(index * step);
  const to = toPoint((index + 1) * step);
  return `M${CX} ${CY}L${from.x.toFixed(2)} ${from.y.toFixed(2)}A${R} ${R} 0 0 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}Z`;
}

export default async function OpenGraphImage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'home.hero'});
  const meta = await getTranslations({locale, namespace: 'meta'});

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: PAPER,
        color: INK
      }}
    >
      <svg width="1200" height="44" viewBox="0 0 1200 44">
        <rect x="0" y="0" width="1200" height="3" fill={INK} />
        {Array.from({length: 24}, (_, i) => {
          const x = i * 50;
          return (
            <path
              key={i}
              d={`M${x + 3} 3H${x + 47}V28L${x + 25} 42L${x + 3} 28Z`}
              fill={FLAG_COLORS[i % FLAG_COLORS.length]}
            />
          );
        })}
      </svg>

      <div style={{display: 'flex', flex: 1, alignItems: 'center', padding: '0 64px', gap: 40}}>
        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              letterSpacing: 4,
              color: '#a82d22',
              fontWeight: 700
            }}
          >
            {BRAND.domain.toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 78,
              fontWeight: 900,
              lineHeight: 1.04,
              marginTop: 16
            }}
          >
            {t('titleLine1')} {t('titleLine2')}
          </div>
          <div
            style={{display: 'flex', fontSize: 30, color: INK_SOFT, marginTop: 22, lineHeight: 1.4}}
          >
            {meta('ogLine')}
          </div>
        </div>

        <svg width="400" height="400" viewBox="0 0 400 400">
          <circle cx={CX + 10} cy={CY + 10} r={R + 22} fill={INK} />
          {SEGMENTS.map((color, index) => (
            <path
              key={index}
              d={wedge(index, SEGMENTS.length)}
              fill={color}
              stroke={INK}
              strokeWidth="2"
            />
          ))}
          <circle cx={CX} cy={CY} r={R + 11} fill="none" stroke={VERMILION} strokeWidth="20" />
          <circle cx={CX} cy={CY} r={R + 22} fill="none" stroke={INK} strokeWidth="3" />
          {Array.from({length: 16}, (_, i) => {
            const radians = ((i * 22.5 - 90) * Math.PI) / 180;
            return (
              <circle
                key={i}
                cx={CX + (R + 11) * Math.cos(radians)}
                cy={CY + (R + 11) * Math.sin(radians)}
                r="4"
                fill={CREAM}
              />
            );
          })}
          <circle cx={CX} cy={CY} r="42" fill={VERMILION} stroke={INK} strokeWidth="3" />
          <circle cx={CX} cy={CY} r="24" fill="none" stroke={CREAM} strokeWidth="4" />
          <circle cx={CX} cy={CY} r="9" fill={CREAM} />
          <path
            d={`M${CX - 22} 24H${CX + 22}L${CX} 86Z`}
            fill={VERMILION}
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx={CX} cy="24" r="22" fill={VERMILION} stroke={INK} strokeWidth="3" />
        </svg>
      </div>
    </div>,
    size
  );
}
