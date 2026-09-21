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
| 3 | Asistente de configuración y validaciones | ⏳ |
| 4 | Algoritmo de asignación y tests | ⏳ |
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
