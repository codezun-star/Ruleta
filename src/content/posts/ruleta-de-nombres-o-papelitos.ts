import type {Post} from './types';

export const ruletaOPapelitos: Post = {
  slug: 'ruleta-de-nombres-o-papelitos',
  locale: 'es',
  title: 'Ruleta de nombres o papelitos en una bolsa: cuál es más justa',
  seoTitle: 'Ruleta de nombres o papelitos: cuál es más justa de verdad',
  description:
    'Comparamos los dos métodos clásicos para sortear: qué sesgos tiene cada uno, cuándo conviene el papel, cuándo la pantalla y qué comprobar en ambos casos.',
  keyword: 'ruleta de nombres o papelitos',
  published: '2026-09-22',
  faq: [
    {
      q: '¿Es más justa una ruleta de nombres o unos papelitos?',
      a: 'Ninguno de los dos es justo por naturaleza. Los papelitos fallan por lo físico —doblados distintos, mal revueltos, la mano que elige— y la ruleta falla por lo que no se ve: porciones desiguales o un resultado decidido de antemano. La diferencia real es qué puedes comprobar de cada uno.'
    },
    {
      q: '¿Cómo hago un sorteo con papelitos que sí sea justo?',
      a: 'Papeles del mismo tamaño y doblados igual, revueltos fuera de la bolsa y no solo dentro, y que saque el papel alguien que no participe y sin mirar. Si vas a sacar varios, sácalos todos de una vez en lugar de uno, mirar el resultado y volver a meter la mano.'
    },
    {
      q: '¿Por qué las ruletas online giran tanto tiempo?',
      a: 'Por espectáculo, no por azar. El resultado ya está decidido cuando empieza la animación: girar más tiempo no lo hace más aleatorio. Lo que sí aporta el giro es que todo el mundo mira la misma pantalla a la vez, que es justo lo que hace que un sorteo se acepte.'
    }
  ],
  cta: {
    href: '/sorteo',
    label: 'Probar la ruleta',
    blurb: 'Lista visible, ganadores uno a uno y un identificador que queda.'
  },
  related: [
    'como-sortear-en-vivo-sin-que-nadie-dude',
    'ruletas-que-no-son-aleatorias',
    'que-es-un-derangement'
  ],
  body: `
Los papelitos en una bolsa son perfectamente justos **si se hacen bien**, y casi nunca se hacen bien. Una ruleta de nombres en pantalla es justa **si está bien programada**, y muchas no lo están. La diferencia real no está en el método sino en qué puedes comprobar de cada uno.

## Los sesgos del papel

La bolsa de papelitos parece el método más honesto porque es físico y todo el mundo lo entiende. Tiene problemas reales, y ninguno es teórico:

**Los papeles no son iguales.** Si alguien dobló el suyo en cuatro y otro en dos, el primero es más grande al tacto. Con la mano dentro de la bolsa, la diferencia se nota aunque no quieras notarla.

**El orden importa.** Los últimos papeles en entrar quedan arriba. Si no se revuelve mucho —y casi nunca se revuelve lo suficiente— salen antes.

**La mano elige.** Aunque no mires, la mano tiende a coger del centro, o del borde, o el que está suelto. No es trampa consciente; es que una mano no es un generador aleatorio.

**Los papeles se pegan.** Dos papeles doblados juntos salen juntos, y entonces alguien tiene que decidir cuál cuenta.

Nada de esto invalida el método. Un sorteo con papelitos entre amigos está bien. Pero decir que es "más justo por ser físico" no se sostiene.

## Los sesgos de la pantalla

Una ruleta digital elimina todos los problemas anteriores y añade unos propios:

**El generador puede estar mal.** Muchas ruletas usan el generador por defecto del navegador, que no está pensado para sorteos. Peor: algunas hacen **valor módulo número de opciones**, lo que reparte el resto entre las primeras opciones y les da una ventaja pequeña pero real.

**La animación puede decidir el resultado.** Hay ruletas donde el giro se calcula con una velocidad aleatoria y el ganador es "donde quedó". Suena inocente y no lo es: la física de la animación no está diseñada para ser uniforme, y el resultado depende de la tasa de refresco de la pantalla.

**No ves nada.** Con los papelitos, al menos ves la bolsa. Con una ruleta, confías en un código que no puedes revisar.

Lo desarrollamos en [por qué muchas ruletas "aleatorias" no lo son](/blog/ruletas-que-no-son-aleatorias).

## La comparación, punto por punto

| | Papelitos | Ruleta en pantalla |
| --- | --- | --- |
| Uniformidad real | Dudosa, depende del doblado | Perfecta si está bien hecha |
| Se puede observar | Sí, la bolsa está ahí | No, el código es opaco |
| Queda constancia | Ninguna | Depende de la herramienta |
| Grupos grandes | Incómodo desde 20 | Igual de fácil con 50 |
| A distancia | Imposible | Natural |
| Repetir a escondidas | Difícil, hay testigos | Trivial, si nadie mira |
| Ambiente | Insuperable | Depende de la animación |

## Cuándo conviene cada uno

**Usa papelitos si:** el grupo está junto, son menos de quince, el premio es simbólico y lo que buscas es el momento. El ritual de meter la mano en la bolsa tiene un valor que ninguna pantalla iguala.

**Usa una ruleta si:** hay gente que no está presente, el grupo pasa de veinte, el premio tiene valor real, o necesitas que quede constancia de lo que pasó.

**Usa las dos** si quieres: sortea con la herramienta y anuncia el resultado sacando el papel correspondiente. Suena absurdo y funciona muy bien en fiestas.

## Cómo hacer bien los papelitos

Si te decides por el papel, estas cinco cosas eliminan casi todos los sesgos:

1. **Papeles idénticos.** Recorta del mismo pliego, mismo tamaño, mismo doblado. Si puedes, dóblalos todos tú.
2. **Un recipiente opaco y hondo.** Una bolsa de tela es mejor que un bol.
3. **Revuelve más de lo que crees necesario.** Veinte segundos, no dos.
4. **Que saque alguien que no participa.** O con los ojos cerrados y el brazo estirado.
5. **Saca todos los papeles, no solo el ganador.** Así el orden completo queda a la vista y nadie puede dudar del que salió primero.

El punto cinco es el que casi nadie hace y el que más confianza da.

## Cómo elegir una ruleta que no te engañe

Si te vas a lo digital, esto es lo que conviene mirar:

- **Que diga cómo elige.** Si no explica su método, asúmelo malo.
- **Que el resultado no dependa de la animación.** Una ruleta honesta decide primero y anima después.
- **Que muestre la lista completa** mientras gira.
- **Que deje algo escrito** al terminar: resultado, hora, identificador.
- **Que no repita ganadores** cuando sacas varios.

## El criterio que de verdad importa

Al final, la pregunta no es "cuál es más aleatorio" sino **"cuál puedo defender si alguien protesta"**.

Con papelitos bien hechos y testigos, puedes defenderlo señalando la bolsa. Con una ruleta que explica su método y deja un registro, puedes defenderlo señalando el registro. Con papelitos mal doblados o con una ruleta opaca, no puedes defender nada, y da igual que el resultado haya sido perfectamente honesto.
`.trim()
};
