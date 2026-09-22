import {expect, test} from '@playwright/test';

/**
 * El blog es contenido estático, así que lo que hay que comprobar no es la
 * interacción sino que lo que Google y el lector reciben sea lo mismo: que el
 * índice lleve al artículo, que el artículo enlace al de al lado sin cambiar
 * de idioma, y que el marcado del FAQPage esté visible en la página. Un
 * `FAQPage` cuyas respuestas no aparecen en el texto es el error por el que
 * Google descarta este tipo de marcado.
 */

test('el índice lleva al artículo y el artículo vuelve al índice', async ({page}) => {
  await page.goto('/es/blog');

  const first = page
    .getByRole('link')
    .filter({has: page.locator('h2')})
    .first();
  const title = await first.locator('h2').innerText();
  await first.click();

  await expect(page).toHaveURL(/\/es\/blog\/[a-z0-9-]+$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText(title);

  await page.getByRole('link', {name: /Todas las guías/}).click();
  await expect(page).toHaveURL('/es/blog');
});

test('las respuestas del FAQPage están visibles en la página', async ({page}) => {
  await page.goto('/es/blog/como-hacer-un-sorteo-en-instagram');

  const graphs = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = graphs
    .map((raw) => JSON.parse(raw) as {'@graph'?: {'@type': string; mainEntity?: unknown}[]})
    .flatMap((data) => data['@graph'] ?? [])
    .find((node) => node['@type'] === 'FAQPage');

  expect(faq, 'el artículo no emite FAQPage').toBeDefined();

  const questions = (faq as {mainEntity: {name: string; acceptedAnswer: {text: string}}[]})
    .mainEntity;
  expect(questions.length).toBeGreaterThanOrEqual(2);

  const body = await page.locator('article').innerText();
  for (const question of questions) {
    expect(body, `falta la pregunta: ${question.name}`).toContain(question.name);
    expect(body, `falta la respuesta a: ${question.name}`).toContain(question.acceptedAnswer.text);
  }
});

test('los enlaces internos del artículo no se salen del idioma', async ({page}) => {
  await page.goto('/es/blog/como-hacer-un-amigo-secreto-online');

  const hrefs = await page
    .locator('article a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));

  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(href, `${href} no lleva prefijo de idioma`).toMatch(/^\/es(\/|$)/);
  }

  // Y que de verdad existan: un enlace bien formado a una página que no está
  // es exactamente igual de malo que uno mal formado.
  for (const href of hrefs.slice(0, 4)) {
    const response = await page.request.get(href);
    expect(response.status(), `${href} devuelve ${response.status()}`).toBe(200);
  }
});

test('el blog no se enlaza desde un idioma que no tiene artículos', async ({page}) => {
  await page.goto('/en');
  await expect(page.locator('a[href="/en/blog"]')).toHaveCount(0);

  const response = await page.request.get('/en/blog');
  expect(response.status()).toBe(404);
});
