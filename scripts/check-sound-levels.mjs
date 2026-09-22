/**
 * Mide el nivel real de cada sonido renderizándolo en un `OfflineAudioContext`
 * y falla si se sale de la banda esperada.
 *
 * Existe porque los clacs llegaron a producción a -44 dBFS —inaudibles— sin
 * que nada lo detectara: el código se ejecutaba, simplemente no sonaba.
 */
import {chromium} from '@playwright/test';
import {build} from 'esbuild';
import {mkdtempSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

/** dBFS de pico: por debajo no se oye, por encima recorta. */
const BANDS = {
  'clac suave': [-22, -8],
  'clac fuerte': [-10, -2],
  tambor: [-8, -1],
  campanilla: [-9, -2]
};

const out = join(mkdtempSync(join(tmpdir(), 'tombola-sound-')), 'sounds.mjs');
await build({
  entryPoints: ['src/components/wheel/sounds.ts'],
  bundle: true,
  format: 'esm',
  outfile: out
});

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {}
);
const page = await browser.newPage();
await page.goto('about:blank');
await page.addScriptTag({
  content: `${readFileSync(out, 'utf8')}\nwindow.S = {scheduleClack, scheduleDrum, scheduleChime};`,
  type: 'module'
});
await page.waitForFunction(() => Boolean(window.S));

const results = await page.evaluate(async () => {
  const measure = async (name, schedule, seconds) => {
    const ctx = new OfflineAudioContext(1, Math.ceil(44100 * seconds), 44100);
    schedule(ctx, 0.05);
    const rendered = await ctx.startRendering();
    const data = rendered.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
    return {name, peak, dbFS: Number((20 * Math.log10(peak || 1e-9)).toFixed(1))};
  };
  return [
    await measure('clac suave', (c, t) => window.S.scheduleClack(c, t, 0.3), 0.3),
    await measure('clac fuerte', (c, t) => window.S.scheduleClack(c, t, 1), 0.3),
    await measure('tambor', (c, t) => window.S.scheduleDrum(c, t), 0.8),
    await measure('campanilla', (c, t) => window.S.scheduleChime(c, t), 1.5)
  ];
});
await browser.close();

let failed = false;
for (const {name, dbFS} of results) {
  const [min, max] = BANDS[name];
  const ok = dbFS >= min && dbFS <= max;
  if (!ok) failed = true;
  console.log(
    `${ok ? '✓' : '✗'} ${name.padEnd(13)} ${String(dbFS).padStart(6)} dBFS  (esperado ${min}…${max})`
  );
}

if (failed) {
  console.error('\nAlgún sonido se salió de la banda audible.');
  process.exit(1);
}
console.log('\nTodos los sonidos dentro de la banda audible.');
