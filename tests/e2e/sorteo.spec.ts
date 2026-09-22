import {expect, test} from '@playwright/test';

/**
 * Flujo principal de punta a punta: armar la lista, configurar el premio,
 * revisar y sortear. Se corre con movimiento reducido para que el giro
 * resuelva al instante y la prueba no dependa de esperar seis segundos.
 */
test.use({reducedMotion: 'reduce'});

test('el sorteo simple saca ganadores sin repetir', async ({page}) => {
  await page.goto('/es/sorteo');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', {name: 'Pegar una lista'}).click();
  await page
    .locator('#paste-box')
    .fill(
      [
        'Ana Robles, ana@ejemplo.com',
        'Kenji Morales <kenji@ejemplo.com>',
        'Marisol Cadena; marisol@ejemplo.com',
        'Diego Restrepo'
      ].join('\n')
    );
  await page.getByRole('button', {name: 'Añadir a la lista'}).click();

  await page.getByRole('button', {name: 'Continuar'}).click();
  await page.locator('#prize').fill('Una caja de chocolates');
  await page.locator('#winners').fill('2');
  await page.getByRole('button', {name: 'Continuar'}).click();

  await expect(page.getByText('Una caja de chocolates')).toBeVisible();
  await page.getByRole('button', {name: 'Girar la ruleta'}).click();

  await page.getByRole('button', {name: 'Girar', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Girar otra vez'})).toBeVisible();
  await page.getByRole('button', {name: 'Girar otra vez'}).click();

  // El número del puesto también lleva `font-head`: hace falta un gancho propio.
  const winners = page.getByTestId('winner-name');
  await expect(winners).toHaveCount(2);

  const names = await winners.allInnerTexts();
  expect(new Set(names).size).toBe(2);

  // Un identificador con forma de boleto, sin caracteres que se confundan.
  await expect(page.locator('p.font-mono')).toHaveText(/^[A-HJ-NP-Z2-9]{3}-[A-HJ-NP-Z2-9]{4}$/);
});

test('el formulario no deja avanzar con la lista vacía', async ({page}) => {
  await page.goto('/es/sorteo');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', {name: 'Continuar'}).click();
  await expect(page.getByText('Necesitas al menos 2 personas')).toBeVisible();
  await expect(page.locator('#prize')).toHaveCount(0);
});

test('la ceremonia del amigo secreto no enseña ninguna asignación', async ({page}) => {
  await page.goto('/es/amigo-secreto');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', {name: 'Pegar una lista'}).click();
  await page
    .locator('#paste-box')
    .fill(
      [
        'Ana Robles, ana@ejemplo.com',
        'Kenji Morales, kenji@ejemplo.com',
        'Marisol Cadena, marisol@ejemplo.com'
      ].join('\n')
    );
  await page.getByRole('button', {name: 'Añadir a la lista'}).click();
  await page.getByRole('button', {name: 'Continuar'}).click();
  await page.getByRole('button', {name: 'Continuar'}).click();
  await page.getByRole('button', {name: 'Girar la ruleta'}).click();

  await page.getByRole('button', {name: 'Girar', exact: true}).click();
  for (let turn = 0; turn < 2; turn++) {
    await page.getByRole('button', {name: 'Siguiente turno'}).click();
  }

  await expect(page.getByText('Sorteo terminado')).toBeVisible();
  await expect(page.getByText('ya sabe a quién le regala')).toHaveCount(3);

  // Lo que nunca debe aparecer: un nombre presentado como destinatario.
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/le regalas? a\s+\w/i);
  expect(body).not.toMatch(/→|↦/);
});

test('las tres páginas legales y las rutas en inglés responden', async ({page}) => {
  for (const path of ['/es/privacidad', '/es/terminos', '/en/privacy', '/en/terms', '/en/raffle']) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});

/**
 * Regresión: el tambor y la campanilla vivían dentro del bucle de animación,
 * así que con movimiento reducido —que no lo ejecuta— no sonaba absolutamente
 * nada. Es común en escritorio y raro en móvil, y por eso el fallo parecía
 * cosa del PC.
 */
test.describe('sonido con movimiento reducido', () => {
  test.use({reducedMotion: 'reduce'});

  test('el resultado se anuncia también sin animación', async ({page}) => {
    await page.addInitScript(() => {
      const contador = {osciladores: 0};
      (window as unknown as {__audio: typeof contador}).__audio = contador;
      const Real = window.AudioContext;
      window.AudioContext = class extends Real {
        constructor(...args: ConstructorParameters<typeof AudioContext>) {
          super(...args);
          const crear = this.createOscillator.bind(this);
          this.createOscillator = () => {
            contador.osciladores++;
            return crear();
          };
        }
      } as typeof AudioContext;
    });

    await page.goto('/es');
    await page.getByRole('button', {name: /sonido/i}).click();
    await page.evaluate(() => {
      (window as unknown as {__audio: {osciladores: number}}).__audio.osciladores = 0;
    });

    await page.getByRole('button', {name: 'Girar', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Girar otra vez'})).toBeVisible();
    await page.waitForTimeout(600);

    // Golpe de parada y campanilla: cuatro osciladores entre los dos.
    const osciladores = await page.evaluate(
      () => (window as unknown as {__audio: {osciladores: number}}).__audio.osciladores
    );
    expect(osciladores).toBeGreaterThan(0);
  });
});
