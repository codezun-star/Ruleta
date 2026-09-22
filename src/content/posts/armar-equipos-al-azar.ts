import type {Post} from './types';

export const equiposAlAzar: Post = {
  slug: 'como-armar-equipos-al-azar',
  locale: 'es',
  title: 'Cómo armar equipos al azar que queden parejos',
  seoTitle: 'Cómo armar equipos al azar parejos (sin que sobre nadie)',
  description:
    'Dividir un grupo en equipos al azar parece trivial hasta que quedan desparejos. Cómo repartir para que los tamaños no difieran ni cuando sobra gente.',
  keyword: 'cómo armar equipos al azar',
  published: '2026-09-22',
  faq: [
    {
      q: '¿Cómo armo equipos al azar que queden parejos?',
      a: 'Baraja la lista completa y reparte de uno en uno a cada equipo, como quien reparte cartas. Con ese método los tamaños nunca se diferencian en más de una persona. Asignar a cada quien un equipo al azar por separado no controla los tamaños y produce repartos como 5-1-1.'
    },
    {
      q: '¿Qué hago si el número de personas no se divide entre los equipos?',
      a: 'Aceptar la diferencia de uno, que es lo mejor posible. Con siete personas en tres equipos salen 3-2-2 y no hay forma de hacerlo mejor. Si necesitas equipos exactamente iguales, lo que hay que ajustar es el número de equipos, no el reparto.'
    },
    {
      q: '¿Conviene sortear los equipos cuando hay niveles muy distintos?',
      a: 'No siempre. Si en el grupo hay tres personas que juegan mucho mejor que el resto, el azar puede meterlas en el mismo equipo y arruinar el partido. Ahí funciona mejor separar por nivel y sortear dentro de cada mitad: sigue siendo azar, pero acotado.'
    }
  ],
  cta: {
    href: '/equipos',
    label: 'Armar los equipos',
    blurb:
      'Escribe la lista, di cuántos equipos y reparte. Los tamaños no se diferencian en más de uno.'
  },
  related: [
    'como-sortear-en-vivo-sin-que-nadie-dude',
    'ruleta-de-nombres-o-papelitos',
    'ruletas-que-no-son-aleatorias'
  ],
  body: `
Para armar equipos al azar que queden parejos hay que **barajar la lista y repartir de uno en uno**, como quien reparte cartas. Así los tamaños nunca se diferencian en más de una persona. Si en cambio asignas a cada quien un equipo al azar de forma independiente, tarde o temprano te salen siete personas repartidas en 4, 2 y 1.

## Por qué el método obvio falla

El método que casi todo el mundo intenta primero es: para cada persona, elige un equipo al azar.

Es justo en el sentido de que cada persona tiene la misma probabilidad de caer en cada equipo. Pero no controla los tamaños en absoluto. Con siete personas y tres equipos, ese método produce repartos como 5-1-1 con una frecuencia incómoda.

Y cuando eso pasa en una clase o en un partido, no vale decir "es que salió así": hay que volver a repartir, y entonces el azar ya no era azar.

## El método que sí funciona

Barajar y repartir por turnos:

1. Baraja la lista completa de personas.
2. Recorre la lista repartiendo una persona a cada equipo, en orden, y vuelve a empezar al llegar al último.

Con siete personas y tres equipos, eso da siempre 3-2-2. Con diez y tres, 4-3-3. Con doce y cuatro, 3-3-3-3.

La propiedad que te da es exacta: **la diferencia entre el equipo más grande y el más pequeño nunca pasa de uno**, porque el resto se reparte una persona por equipo entre los primeros.

Y sigue siendo azar de verdad: quién cae en qué equipo lo decide la baraja, que es donde tiene que estar la aleatoriedad.

## Cuántas personas por equipo

| Personas | 2 equipos | 3 equipos | 4 equipos |
| --- | --- | --- | --- |
| 7 | 4-3 | 3-2-2 | 2-2-2-1 |
| 10 | 5-5 | 4-3-3 | 3-3-2-2 |
| 12 | 6-6 | 4-4-4 | 3-3-3-3 |
| 15 | 8-7 | 5-5-5 | 4-4-4-3 |
| 23 | 12-11 | 8-8-7 | 6-6-6-5 |

Una regla práctica: si quieres equipos exactamente iguales, elige un número de equipos que divida al total. Si no puede ser, acepta la diferencia de uno; es lo mejor posible.

## Cuando el azar puro no es lo que quieres

Conviene ser honesto: hay situaciones donde el azar no es la respuesta correcta, aunque lo parezca.

**En deportes con niveles muy distintos.** Si en el grupo hay tres personas que juegan muy bien y siete que no, el azar puede meter a las tres en el mismo equipo y el partido se arruina. Ahí lo que se quiere es repartir por nivel, no al azar. Una solución intermedia: separa al grupo en dos mitades por nivel y sortea dentro de cada una.

**En trabajos de clase con roles.** Si cada equipo necesita a alguien que sepa hacer X, el azar puede dejar equipos sin esa persona. Mismo remedio: sortea dentro de cada grupo de rol.

**Cuando hay conflictos conocidos.** Si dos personas no pueden trabajar juntas, eso es una restricción, no algo que el azar deba resolver.

El azar es la herramienta correcta cuando **no tienes ningún criterio mejor** y lo que quieres es que nadie pueda protestar por el reparto. Si sí tienes un criterio, úsalo.

## Cómo hacerlo en vivo sin que parezca arbitrario

Repartir equipos delante del grupo tiene el mismo problema de confianza que cualquier sorteo: si el resultado no gusta, alguien sospecha.

Lo que funciona:

- **Di el número de equipos antes de repartir**, no después de ver cómo queda.
- **Reparte de una persona a la vez**, en vez de mostrar los equipos ya hechos. Se entiende mejor y da tiempo a asimilar.
- **Enseña la lista completa antes de empezar.**
- **No repitas.** Si repartes de nuevo porque el resultado no gustó, ya no estás sorteando.

Ese último punto es el más importante y el más difícil de sostener cuando a alguien le tocó un equipo que no quería.

## Nombres de equipo

Un detalle menor que mejora bastante el momento: pon nombres a los equipos en lugar de números. Colores, animales, lo que sea. "Estás en el equipo 3" se olvida; "estás en los Rojos" se recuerda.

Si el grupo es de niños, dejar que cada equipo elija su nombre después del reparto es cinco minutos bien invertidos.

## Qué hacer con quien llega tarde

Decide antes de empezar:

- **Si llega antes de repartir:** entra en la lista, sin más.
- **Si llega después:** va al equipo más pequeño. Es la única opción que mantiene los tamaños parejos y no requiere volver a sortear.

Volver a repartir todo porque llegó una persona es lo que hace que la gente pierda la confianza en el método.

## El resumen

- Baraja y reparte por turnos: los tamaños quedan parejos por construcción.
- Asignar equipos de forma independiente a cada persona no controla los tamaños.
- Si tienes un criterio mejor que el azar —nivel, rol, conflictos—, úsalo.
- El número de equipos se dice antes, no después de ver el resultado.
- Quien llega tarde entra al equipo más pequeño.
`.trim()
};
