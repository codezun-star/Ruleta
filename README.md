# Kuji

Sorteos y amigo secreto con una ruleta giratoria. Los resultados salen por
correo a cada participante y, en el amigo secreto, ni el organizador puede ver
las asignaciones.

**Producción:** https://ruleta.codezun.com · **Idiomas:** español (por defecto) e inglés

---

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Moodboard y dirección visual | ✅ `docs/moodboard.html` |
| 1 | Setup, sistema de diseño, i18n, layout, landing | ✅ |
| 2 | Ruleta: física, sonido, confeti, sello | ✅ |
| 3 | Asistente de configuración y validaciones | ✅ |
| 4 | Algoritmo de asignación y tests | ✅ |
| 5 | Base de datos y envío de correos | ⏳ |
| 6 | Seguridad, rate limit, captcha, legales, cron | ⏳ |
| 7 | Pulido, accesibilidad, SEO y despliegue | ⏳ |

## Arrancar en local

```bash
npm install
cp .env.example .env.local   # para la Fase 1 basta con NEXT_PUBLIC_SITE_URL
npm run dev
```

Abre http://localhost:3000 — redirige a `/es` o `/en` según tu navegador.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación |
| `npm run typecheck` | TypeScript sin emitir |
| `npm test` | Tests unitarios (Vitest) |

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

### Dirección visual

**Feria**: cartelería de rifa y tómbola latinoamericana. Tintas planas de
imprenta offset, sombras duras desplazadas, trama de puntos en lugar de
degradados, papel picado y tira de bombillas. El moodboard de la Fase 0
(`docs/moodboard.html`) partía de una referencia japonesa que se descartó: la
paleta y el lenguaje de impresión siguen valiendo, los signos gráficos no.

### Tipografía

`next/font` autoaloja las tres familias, así que no hay ni una petición a
Google Fonts en tiempo de ejecución:

| Rol | Familia | Dónde |
|---|---|---|
| Titulares | Fraunces | `font-head` — h1, h2, números de sección |
| Cartel | Bevan | `font-display` — botones y rótulos de sello |
| Interfaz | DM Sans | `font-sans` — párrafos y formularios |

### La ruleta

Se dibuja en Canvas 2D (`src/components/wheel/`) fuera del ciclo de render de
React: el bucle de animación no provoca re-renders y se detiene solo cuando la
ruleta queda en reposo.

**El resultado no sale de la animación.** `<Wheel>` acepta `resolveWinner`, que
devuelve el índice ganador; `planSpin()` calcula *hacia atrás* el ángulo que
hay que recorrer para acabar justo en ese segmento. Hoy la demo lo sortea en el
cliente con `randomInt()` (`crypto.getRandomValues` con rechazo de módulo, sin
sesgo); en la Fase 5 se sustituye por la llamada al servidor sin tocar una
línea de la animación.

| Pieza | Archivo |
|---|---|
| Dibujo del disco, aro, bombillas y puntero | `drawWheel.ts` |
| Frenada, rebote final y muelle del puntero | `spinPhysics.ts` |
| Papel picado que cae al ganar | `confetti.ts` |
| Clac, golpe y campanilla (WebAudio, sin archivos) | `sounds.ts` |
| Bucle, estado y accesibilidad | `Wheel.tsx` |

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
   *afirmar con certeza* que un sorteo es imposible: si el máximo no empareja a
   todos, no existe ninguna asignación válida.
2. **Ciclo hamiltoniano aleatorio** con backtracking y heurística de Warnsdorff,
   para que salga una sola cadena y nadie se devuelva el regalo. Si el
   presupuesto de pasos se agota, se usa el emparejamiento, que ya sabemos que
   existe.

Sin exclusiones no hace falta buscar nada: barajar y encadenar es O(n), siempre
válido y uniforme entre todos los ciclos posibles.

> **Un caso que sorprende:** con tres personas, *cualquier* exclusión deja el
> sorteo sin salida. Solo hay dos repartos posibles y los dos usan esa pareja.
> Por eso el formulario comprueba la viabilidad con `checkFeasible()`, que corre
> el mismo emparejamiento: mirar solo si a alguien le quedan cero candidatos se
> queda corto.

El organizador **nunca** ve las asignaciones: la ceremonia gira por cada
participante y solo marca de quién es el turno.

### Accesibilidad

Contraste verificado sobre papel crema:

| Uso | Ratio | Regla |
|---|---|---|
| Índigo sobre papel | 11.7:1 | Texto general |
| Índigo sobre mostaza | 6.6:1 | El botón mostaza siempre lleva texto índigo |
| `#FFF8EC` sobre bermellón | 4.9:1 | Texto sobre botón rojo |
| Bermellón `#C8382B` sobre papel | 4.2:1 | **Solo ≥24px.** Para texto normal, `#A82D22` |
| Índigo sobre matcha | 4.1:1 | Solo texto grande; matcha es color de superficie |

`prefers-reduced-motion` salta el giro y el confeti: la ruleta va directa al
resultado y este se anuncia igual por `aria-live`. El ganador se lee en texto,
no solo por el color del segmento.

## Licencia

Privado.
