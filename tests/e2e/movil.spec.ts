import {expect, test} from '@playwright/test';

/**
 * Lo que hace que la app se sienta instalada y no una página abierta en el
 * navegador. Son comprobaciones de medida, no de aspecto: el aspecto se mira
 * con los ojos, pero un objetivo táctil de 34px se cuela en cualquier revisión
 * visual y solo se ve fallando al pulsarlo con el pulgar.
 *
 * El teléfono lo pone el proyecto `movil` de la configuración. No se declara
 * aquí con `devices[...]`: esos descriptores traen su propio `defaultBrowserType`
 * —el del iPhone pide WebKit— y arrastran el lanzamiento a un navegador que
 * esta imagen no tiene.
 */
test.describe.configure({mode: 'parallel'});

test.describe('disposición de móvil', () => {
  /**
   * Todo esto solo existe por debajo de `md`. En el proyecto de escritorio se
   * salta en vez de fallar: un test rojo que solo dice «aquí no aplica» acaba
   * ignorándose, y entonces deja de avisar cuando sí importa.
   */
  test.skip(({isMobile}) => !isMobile, 'Solo aplica a la disposición de móvil');

  const PAGES = ['/es', '/es/sorteo', '/es/decidir', '/es/blog'];

  test('ningún control queda por debajo de los 44px táctiles', async ({page}) => {
    for (const path of PAGES) {
      await page.goto(path);

      const small = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('button, a[href], input, select')) {
          const box = el.getBoundingClientRect();
          // El enlace de saltar al contenido está oculto hasta recibir el foco.
          if (box.width < 2 && box.height < 2) continue;

          // `.touch-target` agranda el área sensible con un pseudoelemento, que
          // no entra en el rectángulo del elemento.
          const grown = el.classList.contains('touch-target');
          const width = grown ? Math.max(box.width, 44) : box.width;
          const height = grown ? Math.max(box.height, 44) : box.height;

          if (width < 44 || height < 44) {
            out.push(
              `${el.tagName} "${(el.textContent ?? '').trim().slice(0, 24)}" ${Math.round(width)}x${Math.round(height)}`
            );
          }
        }
        return out;
      });

      expect(small, `${path} tiene controles pequeños`).toEqual([]);
    }
  });

  test('la barra de pestañas lleva a los cinco modos y marca el actual', async ({page}) => {
    await page.goto('/es/decidir');

    const tabs = page.getByRole('navigation', {name: 'Modos de sorteo'});
    await expect(tabs).toBeVisible();
    await expect(tabs.getByRole('link')).toHaveCount(5);

    // El modo en curso se marca para lectores de pantalla, no solo con color.
    await expect(tabs.getByRole('link', {name: 'Decidir'})).toHaveAttribute('aria-current', 'page');

    await tabs.getByRole('link', {name: 'Equipos'}).click();
    await expect(page).toHaveURL('/es/equipos');
    await expect(tabs.getByRole('link', {name: 'Equipos'})).toHaveAttribute('aria-current', 'page');
  });

  test('la barra de pestañas no tapa el final de la página', async ({page}) => {
    await page.goto('/es/decidir');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.locator('footer');
    const tabs = page.getByRole('navigation', {name: 'Modos de sorteo'});

    const footerBox = await footer.boundingBox();
    const tabsBox = await tabs.boundingBox();
    expect(footerBox).not.toBeNull();
    expect(tabsBox).not.toBeNull();

    // El pie tiene que terminar por encima de donde empieza la barra.
    expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(tabsBox!.y + 1);
  });
});

test('en escritorio no hay barra de pestañas', async ({browser, baseURL}) => {
  const page = await browser.newPage({viewport: {width: 1280, height: 800}});
  await page.goto(`${baseURL}/es/decidir`);
  await expect(page.getByRole('navigation', {name: 'Modos de sorteo'})).toBeHidden();
  await page.close();
});

test('los campos no hacen que iOS amplíe la página al enfocarlos', async ({page}) => {
  await page.goto('/es/sorteo');

  const sizes = await page.evaluate(() =>
    [...document.querySelectorAll('input, textarea, select')].map((el) =>
      parseFloat(getComputedStyle(el).fontSize)
    )
  );

  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) expect(size).toBeGreaterThanOrEqual(16);
});
