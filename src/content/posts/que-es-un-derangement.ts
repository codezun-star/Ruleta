import type {Post} from './types';

export const queEsUnDerangement: Post = {
  slug: 'que-es-un-derangement',
  locale: 'es',
  title: 'Qué es un derangement y por qué tu amigo secreto necesita uno',
  seoTitle: 'Qué es un derangement y por qué lo usa el amigo secreto',
  description:
    'Un derangement es una permutación donde nadie queda en su sitio. Es exactamente lo que un amigo secreto necesita, y explica por qué barajar la lista no basta.',
  keyword: 'qué es un derangement',
  published: '2026-09-22',
  faq: [
    {
      q: '¿Qué es un derangement en matemáticas?',
      a: 'Un derangement es una permutación en la que ningún elemento queda en su posición original. En un amigo secreto es exactamente el reparto en el que nadie se regala a sí mismo: cada persona aparece una sola vez como quien regala y una sola vez como quien recibe, y nunca en la misma pareja.'
    },
    {
      q: '¿Cuántos derangements hay para 10 personas?',
      a: '1.334.961, frente a los 3.628.800 repartos posibles en total. La proporción es de aproximadamente el 36,8%, un número que se mantiene casi idéntico a partir de siete personas: es 1 dividido entre e, la constante de Euler.'
    },
    {
      q: '¿Barajar hasta que salga bien es un método válido?',
      a: 'Funciona, pero desperdicia trabajo: solo alrededor de una de cada tres barajadas da un reparto válido, y con exclusiones la proporción cae mucho más. Peor aún, si el grupo tiene restricciones imposibles, barajar no termina nunca y no sabes si es mala suerte o un problema irresoluble.'
    }
  ],
  cta: {
    href: '/amigo-secreto',
    label: 'Probar el reparto',
    blurb: 'Un reparto que cumple las tres reglas, con exclusiones y sin que el organizador lo vea.'
  },
  related: [
    'evitar-que-te-toque-tu-pareja',
    'como-hacer-un-amigo-secreto-online',
    'ruletas-que-no-son-aleatorias'
  ],
  body: `
Un **derangement** es una permutación en la que ningún elemento queda en su posición original. Aplicado a un amigo secreto: un reparto en el que **nadie se saca a sí mismo**. Es la propiedad que cualquier intercambio bien hecho tiene que cumplir, y es la razón por la que barajar la lista y emparejar por posición no funciona.

## El problema con barajar y emparejar

La forma intuitiva de repartir un amigo secreto es esta: escribes los nombres, los barajas, y le asignas a cada persona el nombre que quedó en su misma posición en la lista barajada.

Es rápido. También está mal.

El motivo es que una baraja normal no prohíbe que un nombre caiga en su propia posición. Si Ana está en el puesto 3 de la lista original y el azar la vuelve a poner en el puesto 3, Ana se regala a sí misma.

La pregunta interesante es con qué frecuencia pasa eso. La respuesta, y es de las cosas más bonitas de las matemáticas elementales, es que **casi no depende del tamaño del grupo**.

## La constante que aparece de la nada

Si barajas al azar una lista de *n* nombres, la probabilidad de que **ningún** nombre caiga en su posición original tiende a 1/e ≈ 0,3679 a medida que *n* crece. Y converge rapidísimo:

| Personas | Probabilidad de que salga bien a la primera |
| --- | --- |
| 3 | 33,3 % |
| 4 | 37,5 % |
| 5 | 36,7 % |
| 6 | 36,8 % |
| 10 | 36,79 % |
| 50 | 36,79 % |

Dicho al revés: **una baraja cualquiera falla alrededor del 63 % de las veces**, y da igual que seas cinco o cincuenta. Con cinco personas no es que tengas más suerte que con cincuenta; el número se estabiliza casi de inmediato.

> Que aparezca *e* —la base de los logaritmos naturales— en un problema sobre repartir regalos es el tipo de coincidencia que hace que las matemáticas valgan la pena. No hay ninguna exponencial en el enunciado, y sin embargo ahí está.

## Cómo se arregla

Hay dos caminos, y conviene saber en qué se diferencian.

### Barajar hasta que salga

Barajas, compruebas si alguien se sacó a sí mismo, y si sí, vuelves a barajar. Se llama *rejection sampling* y tiene una ventaja importante: **el resultado es uniforme**. Todos los derangements posibles salen con la misma probabilidad.

El coste es que, en promedio, necesitas unos 2,7 intentos (exactamente *e*). Para un grupo de cincuenta personas eso son microsegundos. Es perfectamente razonable.

El problema aparece con las exclusiones. Si además de "nadie se saca a sí mismo" pides "Ana no puede regalarle a Kenji", la probabilidad de acertar a la primera baja, y con suficientes exclusiones puedes estar barajando para siempre sin saber si es que hay mala suerte o es que **no existe ninguna solución**.

### Construir un ciclo

El otro camino es construir directamente un reparto válido. Barajas los nombres y los encadenas: el primero le regala al segundo, el segundo al tercero, y el último al primero.

Eso da siempre un derangement, en una sola pasada, sin reintentos. Y tiene un efecto secundario que a muchos grupos les gusta: como todos forman una sola cadena cerrada, **nadie se devuelve el regalo**. Si Ana le regala a Kenji, Kenji no le regala a Ana.

La contrapartida es que no cubres todos los derangements posibles: los repartos con parejas mutuas o con varios ciclos pequeños nunca salen. Si te parece mal, es rejection sampling lo que quieres. Si te parece una mejora, el ciclo.

## Qué pasa cuando hay exclusiones

Aquí es donde el problema deja de ser una curiosidad y se vuelve de verdad difícil.

Con exclusiones, la pregunta "¿existe algún reparto válido?" es equivalente a preguntar si un grafo bipartito tiene un emparejamiento perfecto. Y eso sí se puede responder con certeza, en tiempo polinómico, con algoritmos clásicos como el de Kuhn o Hopcroft-Karp.

La diferencia práctica es enorme:

- **Barajando y reintentando**, si no sale, no sabes si es mala suerte o imposibilidad. Solo puedes rendirte tras N intentos.
- **Con un emparejamiento máximo**, si no empareja a todos, puedes afirmar que **no existe ninguna asignación válida** y decírselo a quien organiza.

Esa diferencia es la que separa un mensaje útil —"estas exclusiones no tienen salida, quita una"— de uno inútil: "no se pudo, prueba otra vez".

## El caso de las tres personas

El ejemplo más pequeño donde esto se ve es también el que más desconcierta.

Con tres personas —A, B y C— solo existen **dos** derangements:

- A→B, B→C, C→A
- A→C, C→B, B→A

Fíjate en que entre los dos usan las dos direcciones de cada pareja. Así que si excluyes cualquier par, digamos A y C, el primero se cae porque contiene C→A y el segundo porque contiene A→C.

**Con tres personas, cualquier exclusión deja el sorteo sin salida.** No es un fallo de la herramienta ni mala suerte: es que no existe.

A partir de cuatro personas empieza a haber margen. Con cuatro y dos parejas excluidas entre sí, todavía hay repartos válidos: basta alternar entre las parejas.

## Cómo comprobar un reparto hecho a mano

Si repartiste a mano y quieres verificarlo antes de mandarlo, comprueba estas cuatro cosas:

1. **Nadie aparece como su propio destinatario.**
2. **Cada nombre aparece exactamente una vez como quien regala.**
3. **Cada nombre aparece exactamente una vez como quien recibe.**
4. **Ninguna pareja excluida aparece en ningún sentido.**

Las dos del medio son las que más se escapan. Es fácil acabar con alguien que recibe dos regalos y alguien que no recibe ninguno, sobre todo si parcheaste el reparto a mano porque una persona se cayó a última hora.

## Por qué esto importa aunque no te interesen las matemáticas

Porque explica dos cosas que a cualquiera que organice un intercambio le pasan:

- **Por qué la lista de nombres en un sombrero falla tanto.** No es que tu grupo tenga mala suerte. Es que el 63 % de las veces alguien se saca a sí mismo y hay que repetir.
- **Por qué a veces "no se puede".** Si el grupo es pequeño y hay parejas, puede que literalmente no exista ningún reparto que cumpla las reglas. Saberlo de antemano te ahorra media hora de intentos.

Y, de paso, deja claro por qué vale la pena que lo haga una herramienta en lugar de una persona con un papel: no porque la persona sea torpe, sino porque comprobar cuatro condiciones sobre treinta nombres es exactamente el tipo de tarea en la que la atención humana falla.
`.trim()
};
