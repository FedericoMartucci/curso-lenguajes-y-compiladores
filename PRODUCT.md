# Product

## Register

product

## Platform

web

## Users

Estudiantes de Lenguajes y Compiladores (UNLaM, 1124/3663) cursando la materia, no repasándola de lejos.
El usuario primario es Federico, que cursa 2C2026 y construyó el contenido; la audiencia secundaria son sus
compañeros de la cátedra, que reciben el link y entran sin haber visto nunca la app.

Se usa en dos situaciones físicas, y son distintas:

**Notebook en casa, de noche.** Sesiones largas: leer teoría antes de la clase, o sentarse un fin de semana
a resolver la práctica en el sandbox. Luz baja, tiempo, pantalla grande. Acá la app se lee.

**En el aula, durante la clase.** El profesor nombra un tema y hay que llegar a él en dos segundos, con la
clase en curso. Acá la app se opera, no se lee.

El trabajo a resolver cambia según la semana del cuatrimestre: leer la teoría antes de la clase, resolver la
práctica que se liberó, o preparar el parcial. Ninguna de las tres manda sobre las otras.

## Product Purpose

Que la teoría, la práctica que se corrige sola y el cronograma real de la cursada vivan en un mismo lugar, y
que al abrir la app sepas qué te toca hoy sin tener que decidirlo vos.

Hoy el material está repartido: el apunte por un lado, las seis prácticas en PDF por otro, el cronograma en un
tercero, y nada te dice si vas al día. La app junta las tres cosas y las cruza contra las 16 semanas de la
cursada.

Éxito es llegar al Parcial I con las prácticas 1 a 3 resueltas y validadas, no leídas.

## Positioning

El único lugar donde la práctica de compiladores se corrige ejecutándose de verdad —tu expresión regular se
compila, tu gramática se reconoce, tu polaca inversa se interpreta— y donde eso está enganchado al cronograma
real de la cátedra.

## Brand Personality

Prolijo, tranquilo y cercano: un apunte bien hecho, no un producto. Habla en español rioplatense, de vos, con
el vocabulario exacto de la cátedra —mango, cota, celda, terceto, acción léxica— y nunca con el de una
plataforma de e-learning. Cuando corrige, corrige derecho y muestra el caso que falló; no felicita de más ni
dramatiza el error.

## Anti-references

**Plataforma de cursos (Coursera, Udemy).** Nada de cards con thumbnails, "tu ruta de aprendizaje", porcentajes
de completitud decorando cada esquina ni vocabulario de marketing educativo.

**Documentación seca (readthedocs).** Nada de paredes de texto sin jerarquía, cero contraste tipográfico, todo
igual de importante y navegación de árbol infinita. Hoy el sidebar con 110 lecciones siempre desplegadas está
exactamente acá.

## Design Principles

**El validador es la promesa.** La app nunca dice que corrige algo que el motor no corrige. El campo `nota` de
los ejercicios de gramáticas —que le avisa al alumno que se valida el lenguaje y no la forma del árbol— es el
modelo a seguir en toda la interfaz, no la excepción.

**El plan sugiere, nunca bloquea.** El plan de estudio puede decirte qué toca esta semana y qué quedó atrás.
No puede impedirte abrir nada: en el aula necesitás buscar cualquier tema en cualquier momento.

**Dos velocidades, y cada pantalla sabe en cuál está.** Leer es lento, largo y de noche: medida de línea
acotada, jerarquía tipográfica, nada que parpadee. Operar es rápido y con el profesor hablando: teclado,
paleta de comandos, foco visible, cero clics de más.

**Un solo estado de estudio.** No puede haber tres progresos distintos en tres secciones. Lo que sabés, lo que
resolviste y en qué semana vas es una sola cosa, y se ve entera de una.

**Medir al alumno, no al contenido.** La barra de progreso mide lo que estudió el que la mira. Nunca cuánto
material escribió el que la armó.

## Accessibility & Inclusion

No se fijó un nivel WCAG formal. Lo que sí está determinado por el contexto de uso:

- Tema oscuro real, no un filtro: se lee de noche durante horas.
- Todo alcanzable con teclado, con foco siempre visible: en el aula se navega sin mouse.
- Contraste de cuerpo de texto ≥ 4.5:1 en ambos temas, incluidos los placeholders.
- `prefers-reduced-motion` respetado en toda animación.
