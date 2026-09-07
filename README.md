# Curso de Lenguajes y Compiladores (UNLaM)

Curso interactivo de Lenguajes y Compiladores (UNLaM, cód. 1124/3663), construido sobre el libro de **Aho, Lam, Sethi, Ullman** (*Compiladores: principios, técnicas y herramientas*, 2ª ed.), los apuntes de la cátedra y las transcripciones de clase.

**110 lecciones** en 16 módulos, **417 preguntas** de práctica y un **sandbox que valida tus respuestas de verdad** con 53 ejercicios y 652 casos de prueba.

Es una app **React + Vite, sin backend**: no hay servidor ni base de datos. Todo el contenido viaja con la app y el progreso de cada persona se guarda en **su propio navegador** (`localStorage`), así que al desplegarla cada quien lleva su seguimiento por separado.

---

## Qué incluye

- **Teoría** — 16 módulos que van del panorama del compilador hasta la optimización, cubriendo ambos parciales, más un módulo final que aplica todo al proyecto real de la cursada (lenguaje L1_aho, temas especiales, notación polaca inversa). Cada lección marca lo que entra al parcial (🎯) y la profundidad extra de Aho (📘).
- **Sandbox validable** — escribís tu respuesta en la notación del parcial y se ejecuta contra sets de aceptación y rechazo, incluidos los casos borde:
  - **Expresiones regulares** (26 ejercicios): compila la notación de la cátedra (`{CONJUNTO}`, `[clases]`, `"literales"`, `* + ? |`) a un motor real y prueba cada cadena.
  - **Acciones léxicas** (10): la ER define la forma y la acción valida la cota; se prueba con los valores límite (32767 vs 32768, longitud 50 vs 51…).
  - **Gramáticas** (17): un reconocedor **Earley** comprueba qué cadenas acepta tu gramática. Soporta ε y recursión a izquierda.
- **Ejercitación** — modo drill sobre las 417 preguntas, con filtros por tipo y módulo, autoevaluación (*la sabía* / *repasar*) y progreso persistente.
- **Mesa de trabajo** — teclado de símbolos, bloc monoespaciado con plantillas (tabla SLR, traza LR, tercetos, esqueleto Assembler) y constructor de árboles de derivación en SVG.
- **Transcripciones** de las clases grabadas y **enunciados** de las 6 prácticas, con buscador.

---

## Correr localmente

```bash
npm install
npm run dev       # http://localhost:5173
```

Para el build de producción:

```bash
npm run build     # regenera los datos y compila a dist/
npm run preview   # sirve dist/ para revisarlo
```

## Verificación

```bash
npm test          # cada respuesta modelo del banco acepta y rechaza lo que debe (652 casos)
npm run smoke     # todas las rutas de la app renderizan sin errores
npm run check     # las dos cosas
```

`npm test` es la red de seguridad del contenido: si un ejercicio queda mal planteado (el modelo no pasa su propio set), el test falla.

---

## Estructura

```
index.html            Entrada de Vite.
src/
  main.jsx  App.jsx   Arranque y router por hash.
  components/         Sidebar, Vistas (inicio/lección/banco/…), Ejercitar, Sandbox, Mesa.
  engines/
    regex.js          Compila la notación de ER de la cátedra a RegExp.
    earley.js         Reconocedor Earley para gramáticas libres de contexto.
    lexica.js         Acciones léxicas: atributos del lexema y comparación con la cota.
  data/
    curso.js          GENERADO por build.js desde content/. No editar a mano.
    transcripciones.js  enunciados.js
    ejercicios/       Banco del sandbox: er.js, lexicas.js, glc.js
  lib/                Hooks (router, localStorage, tema) y helpers del curso.
content/
  mod-00.js … mod-15.js   Fuente de verdad del contenido: un módulo por archivo.
public/artifacts/     Visualizadores interactivos embebidos en lecciones.
tests/                Suite del banco y smoke test de rutas.
build.js              content/ → src/data/curso.js
```

## Editar o ampliar el contenido

1. Editá el `content/mod-*.js` correspondiente (cada archivo hace `M.push({ ...módulo... })`).
2. Regenerá los datos: `npm run data` (o directamente `npm run build`, que ya lo incluye).

Para agregar ejercicios al sandbox, editá `src/data/ejercicios/*.js` y corré `npm test`: si el modelo nuevo no acepta y rechaza lo que declarás, el test lo marca.

---

## Deploy en Vercel

El proyecto es una app Vite estática, sin variables de entorno ni backend.

**Con GitHub:** subí el repo y en [vercel.com](https://vercel.com) → *Add New… → Project* → importá el repo. Vercel detecta Vite; el build es `npm run build` y la salida `dist`. Cada `git push` redespliega.

**Con la CLI:**

```bash
npm i -g vercel
vercel --prod
```

---

## Sobre el progreso

El progreso (preguntas sabidas / a repasar) y la preferencia de tema se guardan en el `localStorage` del navegador de cada persona. Es individual y privado: no viaja a ningún servidor. Un seguimiento centralizado (por ejemplo, que un docente vea el avance del grupo) requeriría autenticación y base de datos, y no forma parte de esta versión.

## Aviso sobre el contenido

Material con fines **educativos y de estudio**. Las explicaciones se apoyan en el libro de Aho, Lam, Sethi y Ullman y en el material de la cátedra de la UNLaM; **este repositorio no incluye ni redistribuye** esos PDFs con derechos de autor. El **código** se publica bajo licencia **MIT**.
