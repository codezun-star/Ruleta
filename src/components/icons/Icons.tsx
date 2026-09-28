/**
 * Set propio, trazo de 2.2px con extremos redondeados y una leve
 * imperfección deliberada. Sin librerías de iconos.
 */
type IconProps = {size?: number; className?: string};

const PATHS = {
  wheel:
    'M24 42a16 16 0 1 1 0-32 16 16 0 0 1 0 32ZM24 10v32M8 26h32M12.7 14.7l22.6 22.6M35.3 14.7 12.7 37.3',
  mail: 'M7 13h34v24H7zM7 15l17 13 17-13',
  people:
    'M18 23a6 6 0 1 1 0-12 6 6 0 0 1 0 12ZM32 25a5 5 0 1 1 0-10 5 5 0 0 1 0 10M8 39c1.6-7.4 6-11 10-11s8.4 3.6 10 11M29 39c1-5.4 4.2-8.6 7-8.6s5.4 2.2 6.4 6.4',
  gift: 'M9 21h30v19H9zM6 14h36v7H6zM24 14v26M24 14c-4.5-6.5-13-6-13-1.4S19.5 15 24 14ZM24 14c4.5-6.5 13-6 13-1.4S28.5 15 24 14Z',
  calendar: 'M7 12h34v29H7zM7 21h34M16 7v9M32 7v9M16 29h4M23 29h4M30 29h4',
  lock: 'M11 22h26v18H11zM17 22v-6a7 7 0 0 1 14 0v6M24 29v5',
  dice: 'M10 14h28v28H10zM18 22h.01M30 22h.01M18 34h.01M30 34h.01M24 28h.01',
  shield: 'M24 6l16 6v12c0 9-7 15.5-16 18-9-2.5-16-9-16-18V12l16-6ZM17 24l5 5 10-10',
  sound: 'M8 19h6l9-7v24l-9-7H8zM29 19a9 9 0 0 1 0 10M35 15a16 16 0 0 1 0 18',
  mute: 'M8 19h6l9-7v24l-9-7H8zM30 19l10 10M40 19l-10 10',
  close: 'M14 14 34 34M34 14 14 34',
  menu: 'M9 15h30M9 24.2h30M9 33h30',
  back: 'M29 10.5 15.5 24 29 37.5',
  chevron: 'M19 12.5 30.5 24 19 35.5',
  home: 'M8 22.5 24 9l16 13.5M12.5 19.5V40h23V19.5M20.5 40V29.5h7V40',
  help: 'M24 42a18 18 0 1 1 0-36 18 18 0 0 1 0 36ZM18.6 19a5.8 5.8 0 0 1 11.2 2.1c0 4-5.8 4.7-5.8 8.6M24 35.2h.01',
  book: 'M24 13.5c-5-3.6-10.4-4-16-2.6v25.6c5.6-1.4 11-1 16 2.6 5-3.6 10.4-4 16-2.6V10.9c-5.6-1.4-11-1-16 2.6ZM24 13.5V39',
  moon: 'M38.5 29.5A15.5 15.5 0 1 1 20.2 9.8a12.5 12.5 0 0 0 18.3 19.7Z',
  globe:
    'M24 42a18 18 0 1 1 0-36 18 18 0 0 1 0 36ZM6.5 24h35M24 6.2c4.6 4.9 7 10.9 7 17.8s-2.4 12.9-7 17.8M24 6.2c-4.6 4.9-7 10.9-7 17.8s2.4 12.9 7 17.8',
  install: 'M24 8v21.5M15 21l9 9 9-9M9 38.5h30',
  doc: 'M12 6.5h16.5L37 15v26.5H12ZM28.5 6.5V15H37M18 24h13M18 31h13'
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({name, size = 28, className}: IconProps & {name: IconName}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
