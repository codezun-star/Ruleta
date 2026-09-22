# Tómbola

Sorteos y amigo secreto con una ruleta giratoria. Los resultados salen por
correo a cada participante y, en el amigo secreto, ni el organizador puede ver
las asignaciones.

**Producción:** https://tombola.codezun.com · **Idiomas:** español (por defecto) e inglés

---

## Estado

| Fase | Contenido                                       | Estado                   |
| ---- | ----------------------------------------------- | ------------------------ |
| 0    | Moodboard y dirección visual                    | ✅ `docs/moodboard.html` |
| 1    | Setup, sistema de diseño, i18n, layout, landing | ✅                       |
| 2    | Ruleta: física, sonido, confeti, sello          | ✅                       |
| 3    | Asistente de configuración y validaciones       | ✅                       |
| 4    | Algoritmo de asignación y tests                 | ✅                       |
| 5    | Base de datos y envío de correos                | ✅                       |
| 6    | Seguridad, rate limit, captcha, legales, cron   | ✅                       |
| 7    | Pulido, accesibilidad, SEO, AEO y GEO           | ✅                       |

## Arrancar en local

```bash
npm install
cp .env.example .env.local   # para la Fase 1 basta con NEXT_PUBLIC_SITE_URL
npm run dev
```

Abre http://localhost:3000 — redirige a `/es` o `/en` según tu navegador.

| Comando                 | Qué hace                                            |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo                              |
| `npm run build`         | Compilación de producción                           |
| `npm run start`         | Sirve la compilación                                |
| `npm run typecheck`     | TypeScript sin emitir                               |
| `npm test`              | Tests unitarios (Vitest)                            |
| `npm run test:e2e`      | Flujo completo en navegador (Playwright)            |
| `npm run test:sound`    | Mide el nivel de cada sonido y falla si no se oye   |
| `npm run check:content` | Palabras, metas y enlaces de los artículos del blog |
| `npm run format`        | Prettier                                            |
| `npm run db:generate`   | Regenera la migración desde el esquema              |
| `npm run db:migrate`    | Aplica las migraciones                              |
| `npm run email:preview` | Renderiza los correos a HTML para mirarlos          |
| `npm run email:assets`  | Regenera los PNG del correo                         |

## Cómo está montado

```
src/config/brand.ts    <- única fuente del nombre de marca, dominio y remitente
src/styles/globals.css <- tintas, tipografía y sombras; todo lo demás las usa
src/i18n/              <- rutas /es y /en, detección por Accept-Language
src/proxy.ts           <- middleware de next-intl
src/components/        <- ui · layout · landing · wheel · wizard · icons
messages/              <- es.json y en.json; nada de texto escrito en el código
```

El árbol completo y las decisiones técnicas están en
[`docs/estructura-propuesta.md`](docs/estructura-propuesta.md).

### Sistema de diseño

Las tintas se declaran como propiedades CSS en `:root` y se redefinen para el
modo noche. `@theme inline` las expone a Tailwind, así que `bg-paper` cambia de
color al cambiar de tema sin recompilar nada. **Ningún componente escribe un
color a mano.**

El tema tiene tres estados: sistema (sin marcar), claro y oscuro. Un script
síncrono en `<head>` fija `data-theme` antes del primer pintado para que no
parpadee.

### Los cinco modos

Dos con ceremonia —lista, detalles y correos— y tres que se resuelven en una
sola pantalla:

| Modo          | Ruta                               | Qué hace                                              |
| ------------- | ---------------------------------- | ----------------------------------------------------- |
| Sorteo simple | `/sorteo` · `/raffle`              | Uno o varios ganadores, sin repetir                   |
| Amigo secreto | `/amigo-secreto` · `/secret-santa` | Reparto cifrado que el organizador no ve              |
| Decidir       | `/decidir` · `/decide`             | Ruleta con opciones libres, no personas               |
| Turnos        | `/turnos` · `/turn-order`          | Orden aleatorio, uno a uno                            |
| Equipos       | `/equipos` · `/teams`              | Reparto parejo: los tamaños no difieren en más de uno |

En los cinco **el resultado se calcula antes de girar** y la ruleta solo lo
revela. En equipos eso además es lo único que garantiza que queden parejos:
si cada vuelta decidiera de verdad, saldrían repartos de 4/2/1.

### Dirección visual

**Feria**: cartelería de rifa y tómbola latinoamericana. Tintas planas de
imprenta offset, sombras duras desplazadas, trama de puntos en lugar de
degradados, papel picado y tira de bombillas. El moodboard de la Fase 0
(`docs/moodboard.html`) partía de una referencia japonesa que se descartó: la
paleta y el lenguaje de impresión siguen valiendo, los signos gráficos no.

### Tipografía

`next/font` autoaloja las tres familias, así que no hay ni una petición a
Google Fonts en tiempo de ejecución:

| Rol       | Familia  | Dónde                                       |
| --------- | -------- | ------------------------------------------- |
| Titulares | Fraunces | `font-head` — h1, h2, números de sección    |
| Cartel    | Bevan    | `font-display` — botones y rótulos de sello |
| Interfaz  | DM Sans  | `font-sans` — párrafos y formularios        |

### La ruleta

Se dibuja en Canvas 2D (`src/components/wheel/`) fuera del ciclo de render de
React: el bucle de animación no provoca re-renders y se detiene solo cuando la
ruleta queda en reposo.

**El resultado no sale de la animación.** `<Wheel>` acepta `resolveWinner`, que
devuelve el índice ganador; `planSpin()` calcula _hacia atrás_ el ángulo que
hay que recorrer para acabar justo en ese segmento. Hoy la demo lo sortea en el
cliente con `randomInt()` (`crypto.getRandomValues` con rechazo de módulo, sin
sesgo); en la Fase 5 se sustituye por la llamada al servidor sin tocar una
línea de la animación.

| Pieza                                             | Archivo          |
| ------------------------------------------------- | ---------------- |
| Dibujo del disco, aro, bombillas y puntero        | `drawWheel.ts`   |
| Frenada, rebote final y muelle del puntero        | `spinPhysics.ts` |
| Papel picado que cae al ganar                     | `confetti.ts`    |
| Clac, golpe y campanilla (WebAudio, sin archivos) | `sounds.ts`      |
| Bucle, estado y accesibilidad                     | `Wheel.tsx`      |

El sonido viene apagado por defecto y se guarda en `localStorage`. Solo se
desbloquea el `AudioContext` dentro del gesto que lo activa, que es lo único
que aceptan los navegadores.

Dos detalles que conviene recordar al tocarla:

- `ctx.font` **no** resuelve `var(--font-*)`. La familia se resuelve en
  `readWheelLabelFont()` antes de pasarla al canvas.
- El canvas tampoco cascadea: al cambiar `data-theme` hay que releer las tintas.
  Lo hace un `MutationObserver`.

### Validación

Los esquemas de Zod viven en `src/lib/validation/` y **los mensajes son claves
de traducción, no texto**: el mismo esquema corre en el navegador y en el
servidor, y cada lado las resuelve en su idioma. `validateParticipants()`
devuelve todos los problemas a la vez, no solo el primero, para poder marcar
cada fila en su sitio.

Los errores de "esto está vacío" solo aparecen al intentar avanzar; los de
formato (correo mal escrito, duplicado) aparecen en cuanto hay algo escrito.

El asistente guarda el borrador en `localStorage` por modo, y lo recupera
después de montar —nunca durante el render— para no descuadrar la hidratación.

### El reparto del amigo secreto

`assignSecretSanta()` (`src/lib/draw/derangement.ts`) garantiza que nadie se
saca a sí mismo, que cada quien da una vez y recibe una vez, y que se respetan
las exclusiones. Funciona en dos tiempos:

1. **Emparejamiento bipartito máximo** (Kuhn). Es lo único que permite
   _afirmar con certeza_ que un sorteo es imposible: si el máximo no empareja a
   todos, no existe ninguna asignación válida.
2. **Ciclo hamiltoniano aleatorio** con backtracking y heurística de Warnsdorff,
   para que salga una sola cadena y nadie se devuelva el regalo. Si el
   presupuesto de pasos se agota, se usa el emparejamiento, que ya sabemos que
   existe.

Sin exclusiones no hace falta buscar nada: barajar y encadenar es O(n), siempre
válido y uniforme entre todos los ciclos posibles.

> **Un caso que sorprende:** con tres personas, _cualquier_ exclusión deja el
> sorteo sin salida. Solo hay dos repartos posibles y los dos usan esa pareja.
> Por eso el formulario comprueba la viabilidad con `checkFeasible()`, que corre
> el mismo emparejamiento: mirar solo si a alguien le quedan cero candidatos se
> queda corto.

El organizador **nunca** ve las asignaciones: la ceremonia gira por cada
participante y solo marca de quién es el turno.

### Base de datos y correos

Se despliega **sin** base de datos ni Resend: si faltan, la API responde `503
notConfigured` y el sorteo se hace en el navegador, diciéndolo en pantalla. En
cuanto se configuran, el sorteo pasa al servidor sin tocar nada más.

| Variable                                         | Para qué                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| `DATABASE_URL`                                   | Postgres (Supabase o Vercel). `npm run db:migrate` crea las tablas |
| `ASSIGNMENTS_ENCRYPTION_KEY`                     | 32 bytes en base64: `openssl rand -base64 32`                      |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | Envío. Pasos de DNS en [`docs/resend-dns.md`](docs/resend-dns.md)  |

**El organizador nunca ve las asignaciones.** Se guardan cifradas con AES-GCM,
la clave vive solo en el servidor, y las filas se borran en cuanto han salido
todos los correos. El recibo del organizador cuenta cuánta gente participó y
cuántos correos salieron, nada más.

Los correos van en lotes de 100 con espera entre ellos, porque Resend permite
2 peticiones por segundo. Si un lote entero falla tras los reintentos, se
reenvía uno a uno: la API de lotes no dice _cuál_ de los cien falló, y sin eso
no se puede ofrecer "reintentar solo los fallidos".

Las plantillas usan tablas, estilos en línea y tipografías web-safe (Georgia y
Arial), porque las webfonts no son fiables en correo. El sello y la tira de
papel picado viajan como **PNG** —Outlook no renderiza SVG— generados por
`scripts/make-email-assets.mjs` con un codificador propio sobre `zlib`, sin
dependencias.

### Seguridad

Todo lo opcional degrada solo: si falta una variable, esa pieza se apaga y el
resto sigue funcionando.

| Pieza                    | Sin configurar            | Configurada                                       |
| ------------------------ | ------------------------- | ------------------------------------------------- |
| **Rate limit** (Upstash) | No limita nada            | 5 sorteos por hora y por IP                       |
| **Captcha** (Turnstile)  | No se muestra ni se exige | Widget en el paso 3 y verificación en el servidor |
| **Cron de limpieza**     | `503`                     | Borra los correos a los 30 días, a diario         |

La única excepción es el captcha ya configurado: si Cloudflare no responde, el
sorteo **no** pasa. Dejarlo pasar anularía el captcha justo cuando más falta
hace.

El cuerpo de la petición se corta a 64 KB, se valida con el mismo esquema de
Zod que el formulario, y el cron comprueba `CRON_SECRET` **antes** de mirar si
hay base de datos, para no filtrar si existe o no.

Cabeceras: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`,
`Permissions-Policy` y una CSP con `frame-ancestors`, `base-uri`, `form-action`
y `object-src`. Falta `script-src`, que necesita nonces por petición porque
Next inyecta scripts en línea propios: es una tarea aparte, no un olvido.

### Rutas traducidas

`/es/amigo-secreto` y `/en/secret-santa` son la misma página. Las rutas se
declaran en `src/i18n/routing.ts` y el selector de idioma traduce la ruta
actual en vez de mandarte a la portada. Los `hreflang` salen de `getPathname()`,
porque concatenar el idioma daría `/en/privacidad`, que no existe.

### El blog

Diez guías de cola larga en `src/content/posts`, una por archivo, cada una con
su palabra clave, su meta, tres preguntas frecuentes y a qué herramienta
empuja. No hay CMS ni Markdown suelto: son objetos TypeScript, así que un
enlace roto o una meta demasiado larga los caza el compilador o
`npm run check:content` antes de llegar a producción.

El cuerpo se escribe en un subconjunto de Markdown que renderiza
`src/lib/markdown.tsx` a mano, para que cada bloque salga con las clases del
sistema de diseño en lugar de un `prose` genérico. Los enlaces internos se
escriben en su forma interna —`/turnos`, `/blog/<slug>`— y
`src/content/posts/links.ts` los traduce al idioma en el que se pinta la
página: escribir `/es/turnos` a mano parece más simple y es una trampa, porque
ese enlace se queda en español dentro de un artículo en inglés.

`npm run check:content` comprueba lo que rompe el SEO en silencio: palabras
entre 700 y 1.600, meta description entre 120 y 160 caracteres, título de
pestaña de 60 como mucho, slugs sin repetir, relacionados que existan y que la
palabra clave aparezca de verdad en el texto. Ahora mismo: **10 artículos,
9.684 palabras, media de 968**.

El blog vive por idioma. Solo hay artículos en español, así que `/en/blog`
devuelve 404 a propósito y ni la cabecera, ni el pie, ni el sitemap, ni el
`llms.txt` lo enlazan: listar un índice vacío es mandar a Google a una página
rota con nuestra propia firma.

### SEO, AEO y GEO

**SEO técnico.** Sitemap con una entrada por idioma y sus alternativas —los
artículos entran con su propia fecha y sin `hreflang`, porque solo existen en
un idioma—,
`robots.txt`, manifiesto, imagen Open Graph generada con `next/og`, canonical
y `hreflang` correctos con rutas traducidas, y `max-snippet:-1` /
`max-image-preview:large` para que el buscador pueda enseñar fragmentos largos.

**AEO** (que los buscadores puedan extraer la respuesta). Diez preguntas
frecuentes con respuesta directa en el primer párrafo, marcadas con `FAQPage`
en JSON-LD, más `HowTo` para el amigo secreto y `BreadcrumbList` en las
interiores. Cada artículo del blog añade lo suyo: abre respondiendo a su
pregunta en el primer párrafo y cierra con tres preguntas más, emitidas como
`BlogPosting` + `FAQPage`. **Las respuestas se pintan visibles, no en un
acordeón**: plegarlas esconde justo el texto del que se saca la respuesta, y
Google descarta el marcado que no encuentra en la página. Hay un test e2e que
compara una a una las respuestas del JSON-LD con el texto visible.

**GEO** (que los asistentes puedan citarnos). `/llms.txt` con un resumen del
sitio, una lista de hechos verificables y las diez guías con su párrafo de
respuesta —un asistente que nos cite debería poder citar la respuesta, no solo
el titular—, y `robots.txt` con los rastreadores
de los asistentes listados a propósito. El JSON-LD y el `llms.txt` **se generan
desde las mismas traducciones que la página**, así que no pueden contradecirla.

> Conviene decirlo: la parte de SEO técnico y AEO descansa en prácticas
> documentadas por los buscadores. GEO todavía no las tiene: `llms.txt` es una
> convención emergente, no un estándar. Se ha implementado porque cuesta poco
> y el contenido que exige —hechos concretos y citables— mejora la página de
> todos modos.

### Tests

| Qué                                                                   | Dónde                                              |
| --------------------------------------------------------------------- | -------------------------------------------------- |
| Algoritmo, azar, equipos, validación, cifrado, física, Markdown, blog | `tests/unit` · Vitest · 92 tests                   |
| Flujo completo en escritorio y móvil                                  | `tests/e2e` · Playwright · 12 specs × 2            |
| Nivel audible de cada sonido                                          | `scripts/check-sound-levels.mjs`                   |
| Palabras, metas y enlaces de los artículos                            | `scripts/check-content.mts`                        |
| Accesibilidad                                                         | axe sobre 9 páginas × 2 temas, sin incumplimientos |

El sonido ha dado dos fallos y ninguno de los dos lo habría visto un test
normal, porque en los dos el código se ejecutaba sin problemas:

1. Los clacs salían a **−44 dBFS**, o sea inaudibles. De ahí
   `scripts/check-sound-levels.mjs`, que renderiza cada sonido en un
   `OfflineAudioContext` y comprueba su pico: _se ejecuta_ y _se oye_ no son
   lo mismo.
2. Con `prefers-reduced-motion` no sonaba **nada**. El tambor y la campanilla
   vivían dentro del bucle de animación, y esa preferencia lo salta entero.
   Parecía un fallo "de PC" porque en escritorio esa preferencia es común y en
   móvil casi nadie la activa. Hay un test e2e que lo cubre, y se comprobó que
   falla contra el código anterior.

### Accesibilidad

Contraste verificado sobre papel crema:

| Uso                             | Ratio  | Regla                                            |
| ------------------------------- | ------ | ------------------------------------------------ |
| Índigo sobre papel              | 11.7:1 | Texto general                                    |
| Índigo sobre mostaza            | 6.6:1  | El botón mostaza siempre lleva texto índigo      |
| `#FFF8EC` sobre bermellón       | 4.9:1  | Texto sobre botón rojo                           |
| Bermellón `#C8382B` sobre papel | 4.2:1  | **Solo ≥24px.** Para texto normal, `#A82D22`     |
| Índigo sobre matcha             | 4.1:1  | Solo texto grande; matcha es color de superficie |

`prefers-reduced-motion` salta el giro y el confeti: la ruleta va directa al
resultado y este se anuncia igual por `aria-live` **y con sonido**, porque
pedir menos movimiento no es pedir menos información. El ganador se lee en texto,
no solo por el color del segmento.

## Licencia

Privado.
