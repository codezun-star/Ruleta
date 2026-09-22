import type {Post} from './types';

export const ruletasQueNoSonAleatorias: Post = {
  slug: 'ruletas-que-no-son-aleatorias',
  locale: 'es',
  title: 'Ruletas que no son aleatorias: cómo saber si un sorteo online está trucado',
  seoTitle: '¿La ruleta online está trucada? Cómo comprobarlo tú mismo',
  description:
    'Hay ruletas que no son aleatorias y se ven igual de limpias girando. Las tres formas de amañar un sorteo online y qué puedes comprobar tú desde fuera.',
  keyword: 'ruletas que no son aleatorias',
  published: '2026-09-22',
  faq: [
    {
      q: '¿Cómo sé si una ruleta online está trucada?',
      a: 'Desde fuera solo puedes comprobar tres cosas: que los nombres estén completos, que el número de porciones coincida con el de participantes y que el giro sea uno solo y en directo. Para saber si reparte parejo hace falta girarla unas cuarenta veces y contar cuántas sale cada nombre.'
    },
    {
      q: '¿Las ruletas online eligen el ganador antes de girar?',
      a: 'Casi todas, y es correcto: es lo único que garantiza que la flecha caiga en el centro de una porción y no en una frontera discutible, y que el resultado no dependa de los fotogramas por segundo del dispositivo. Lo que no se puede es demostrarlo desde la pantalla.'
    },
    {
      q: '¿Importa qué generador de azar use una ruleta?',
      a: 'Menos de lo que suele decirse. El generador criptográfico del navegador es mejor que el básico y no cuesta nada usarlo, pero cambiarlo no arregla el problema real: si quien controla la pantalla vuelve a girar hasta que salga lo que quiere, el generador da igual.'
    }
  ],
  cta: {
    href: '/sorteo',
    label: 'Girar una ruleta',
    blurb:
      'El resultado se decide con el generador criptográfico del navegador y la animación solo lo enseña.'
  },
  related: [
    'ruleta-de-nombres-o-papelitos',
    'como-sortear-en-vivo-sin-que-nadie-dude',
    'que-es-un-derangement'
  ],
  body: `
Hay ruletas que no son aleatorias aunque lo parezcan: se puede trucar un sorteo online de tres maneras distintas, y **ninguna de las tres se nota girando la rueda una sola vez**. Ese es el problema de fondo: la animación es exactamente igual de convincente cuando el sorteo es limpio que cuando no lo es. Lo que sí puedes hacer es comprobar unas pocas cosas concretas antes de confiar en una, y saber cuáles son imposibles de verificar desde fuera.

## Las tres maneras de trucar una ruleta

### 1. Segmentos que no miden lo mismo

La más burda y la más fácil de detectar. Si el sorteo tiene diez nombres, cada porción debería ocupar 36 grados. Una ruleta amañada le da a un nombre 40 y a otro 32, y a simple vista nadie lo nota porque el ojo humano es malísimo comparando ángulos.

Se detecta mirando: pon todos los nombres con la misma longitud de texto y fíjate si las porciones se ven iguales. O cuenta cuántos nombres hay y comprueba que la rueda esté dividida en ese número exacto de partes.

### 2. El resultado se decide antes, con el dedo en la balanza

Esta es la que de verdad se usa. Casi todas las ruletas bien hechas —la nuestra incluida— **eligen al ganador antes de empezar a girar** y luego calculan la animación para que la flecha caiga ahí. Es la única forma de que la animación termine limpia en el borde de un segmento en vez de en una frontera ambigua.

El problema es que ese paso es invisible. Si en vez de elegir al azar entre los diez nombres el código elige "el nombre que el organizador marcó", la animación se ve idéntica. No hay nada en pantalla que distinga un caso del otro.

### 3. El regiro silencioso

La más sucia. La ruleta sortea de verdad, pero si el resultado no le conviene a quien la controla, se vuelve a girar y ya está. Nadie ve el primer giro.

Esto no requiere código trucado: se hace con cualquier herramienta honesta, simplemente cerrando la pestaña. Es, con diferencia, la forma más común de que un sorteo no sea limpio, y no tiene nada que ver con la tecnología.

## Math.random no es lo que hay que mirar

Hay mucho artículo por ahí que te dice que desconfíes de las ruletas que usan la función de azar básica del navegador porque "no es criptográficamente segura". Es verdad, pero en este contexto casi no importa.

Esa función tiene un defecto real: alguien que observe muchos resultados seguidos puede, en teoría, reconstruir el estado interno y predecir los siguientes. Para un casino eso es fatal. Para sortear quién trae el postre, es un ataque que nadie va a montar.

El generador criptográfico del navegador es mejor y no cuesta nada usarlo —nosotros lo usamos—, pero **cambiarlo no arregla ninguno de los tres problemas de arriba**. Una ruleta con el mejor generador del mundo sigue estando trucada si alguien regira hasta que salga su sobrino.

## Lo que sí puedes comprobar desde fuera

Sin mirar el código, esto es lo que está a tu alcance:

- **Que los nombres estén completos y bien escritos.** Un nombre mal copiado es un participante que no entra.
- **Que el número de porciones coincida con el número de participantes.**
- **Que el resultado se vea en pantalla, no en un pantallazo.** Una captura se edita en treinta segundos.
- **Que el giro se haga una sola vez**, delante de quien tenga que verlo.
- **Que las reglas se digan antes.** Qué se sortea, quién participa, qué pasa si el ganador no aparece.

Esa última es la que más sorteos salva. La mayoría de las peleas no son porque la ruleta esté trucada: son porque nadie dijo de antemano qué contaba.

## La prueba que sí sirve, si tienes cinco minutos

Si de verdad quieres saber si una ruleta reparte parejo, hay una prueba casera que funciona: **gírala muchas veces con los mismos nombres y cuenta**.

Con cuatro nombres y cuarenta giros, esperarías unas diez apariciones de cada uno. No van a salir diez exactas —eso sería sospechoso— pero sí algo entre siete y trece. Si un nombre sale veintidós veces de cuarenta, no es mala suerte.

La regla rápida: con muchos giros, la diferencia entre lo que sale y lo que esperabas debería quedarse cerca de la raíz cuadrada de lo esperado. Si esperas 10 apariciones, una desviación de 3 es normal; una de 12 no lo es.

| Nombres | Giros | Esperado por nombre | Rango normal |
| --- | --- | --- | --- |
| 2 | 40 | 20 | 14 a 26 |
| 4 | 40 | 10 | 5 a 15 |
| 4 | 200 | 50 | 36 a 64 |
| 10 | 200 | 20 | 11 a 29 |

Es tedioso, pero es la única comprobación que no depende de creerle a nadie.

## Por qué nosotros también decidimos el resultado antes

Conviene decirlo sin rodeos, porque es exactamente el punto 2 de arriba: en Tómbola el ganador se elige antes de que la rueda empiece a moverse.

Lo hacemos porque es lo único que garantiza que la flecha caiga en el centro de una porción y no en una frontera discutible, y porque así el resultado no depende de cuántos fotogramas por segundo dé tu teléfono. La elección se hace con el generador criptográfico del navegador y con rechazo por módulo, que es el detalle aburrido que evita que los primeros nombres de la lista salgan un pelín más que los últimos.

Lo que no podemos hacer es demostrarte eso desde la pantalla. Ninguna ruleta puede. Puedes leer el código, puedes hacer la prueba de los cuarenta giros, o puedes usar papelitos. No hay una cuarta opción.

## Lo que ninguna herramienta puede arreglar

El regiro. Si la persona que controla la pantalla quiere repetir hasta que salga lo que quiere, va a poder, use lo que use.

Contra eso solo hay costumbre: girar delante de todos, [en vivo y una sola vez](/blog/como-sortear-en-vivo-sin-que-nadie-dude). Si el sorteo importa de verdad —dinero, un premio grande, algo que alguien pueda reclamar—, grábalo entero desde antes de escribir los nombres.

## El resumen

- Hay tres formas de trucar una ruleta: porciones desiguales, resultado dirigido y regiro. Solo la primera se ve.
- El generador de azar importa menos de lo que dicen; el regiro importa muchísimo más.
- Comprueba nombres, número de porciones, y que el giro sea uno solo y en directo.
- Para saber si reparte parejo de verdad: cuarenta giros y a contar.
- Casi todas las ruletas serias eligen el ganador antes de animar. Es correcto, y también es invisible.
`.trim()
};
