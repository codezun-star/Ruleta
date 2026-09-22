import {expect, test} from '@playwright/test';

/**
 * Los anuncios se cargan por dominio, no por variable de entorno, así que
 * estas pruebas corren contra 127.0.0.1 y ahí no debe salir ninguno. Eso es lo
 * que las mantiene estables: sin esta puerta, cada prueba dependería de que
 * una red de terceros respondiera.
 *
 * Y de paso comprueba que la puerta funciona, que es lo que impide que un
 * despliegue de vista previa sirva anuncios.
 */

const TODAS = [
  '/es',
  '/es/sorteo',
  '/es/amigo-secreto',
  '/es/decidir',
  '/es/turnos',
  '/es/equipos',
  '/es/blog',
  '/es/blog/como-hacer-un-sorteo-en-instagram',
  '/es/privacidad',
  '/es/terminos'
];

test('fuera del dominio de producción no se carga ningún anuncio', async ({page}) => {
  const externos: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (/highrevenueformat|profitableratecpmnetwork/.test(url)) externos.push(url);
  });

  for (const ruta of TODAS) {
    await page.goto(ruta);
    await expect(page.locator('iframe[title]')).toHaveCount(0);
  }

  // Ni siquiera se pide el script: no es que el anuncio no se vea, es que no
  // se descarga.
  expect(externos).toEqual([]);
});

test('el hueco del anuncio no deja un vacío donde no hay anuncio', async ({page}) => {
  // Si el hueco se reservara siempre, en local y en un bloqueador de anuncios
  // quedaría un rectángulo en blanco en mitad del texto.
  await page.goto('/es/blog/como-hacer-un-sorteo-en-instagram');

  const huecos = await page.evaluate(
    () =>
      [...document.querySelectorAll('article div')].filter((el) => {
        const box = el.getBoundingClientRect();
        return box.height > 40 && box.width > 40 && (el.textContent ?? '').trim() === '';
      }).length
  );

  expect(huecos).toBe(0);
});
