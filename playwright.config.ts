import {defineConfig, devices} from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3300);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * `CHROMIUM_PATH` permite apuntar a un Chromium ya instalado en la imagen, que
 * es lo habitual en CI y en contenedores donde no se descargan navegadores.
 */
const executablePath = process.env.CHROMIUM_PATH;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...(executablePath ? {launchOptions: {executablePath}} : {})
  },
  projects: [
    {name: 'escritorio', use: {...devices['Desktop Chrome']}},
    {name: 'movil', use: {...devices['Pixel 7']}}
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
