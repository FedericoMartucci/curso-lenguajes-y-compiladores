# CLAUDE.md — contexto del proyecto

App de estudio de **Lenguajes y Compiladores** (UNLaM, cód. 1124/3663). React + Vite, **sin backend**:
todo el contenido viaja con el bundle y el progreso del usuario vive en `localStorage`.
Dos partes: **teoría** (110 lecciones, 417 preguntas) y un **sandbox que valida ejercicios de verdad**
(98 ejercicios, 926 casos) ejecutando lo que escribe el alumno.

## Comandos

```bash
npm install
npm run dev      # servidor de desarrollo
npm run data     # regenera src/data/curso.js desde content/
npm run build    # npm run data + vite build -> dist/
npm test         # valida el banco de ejercicios (926 casos)
npm run smoke    # renderiza las 13 rutas para detectar errores de componentes
npm run check    # test + smoke  ← correr SIEMPRE antes de commitear
```

## Arquitectura

```
index.html                Entrada de Vite.
src/main.jsx  App.jsx     Arranque y router por hash (sin react-router).
src/lib/hooks.js          useHashRoute, useLocalStorage, useTheme.
src/lib/curso.js          Aplana lecciones, arma el banco de preguntas, búsqueda.
src/components/
  Sidebar.jsx             Navegación, progreso, buscador.
  Vistas.jsx              Inicio, Leccion, Banco, Buscar, Transcripciones, Enunciados.
  Ejercitar.jsx           Drill de preguntas con autoevaluación.
  Sandbox.jsx             Contenedor + solapas ER / acciones léxicas / gramáticas.
  SandboxAvanzado.jsx     Solapas parsing SLR / código intermedio / Assembler.
  CodeEditor.jsx          Editor con resaltado (overlay <pre> + <textarea>).
  Mesa.jsx                Teclado de símbolos, bloc y constructor de árboles SVG.
src/engines/              Lógica pura, sin React. Testeable desde node.
src/data/                 Contenido y bancos de ejercicios.
content/mod-00..15.js     FUENTE DE VERDAD de la teoría.
public/artifacts/         Visualizadores embebidos por iframe en lecciones.
tests/                    run.js (banco) y smoke.js (rutas).
build.js                  content/ -> src/data/curso.js
```

## Invariantes — no romper

1. **`src/data/curso.js` es GENERADO.** Nunca editarlo a mano. Se edita `content/mod-*.js` y se corre
   `npm run data`. Está commiteado a propósito para que el deploy no dependa de un paso extra.
2. **Todo ejercicio del sandbox debe tener una respuesta modelo que pase su propio set de casos.**
   `npm test` lo verifica; si agregás un ejercicio con un modelo incorrecto, el test falla. Es la red
   de seguridad principal del proyecto: no la desactives.
3. **Todo ejercicio necesita entrada en `src/data/ejercicios/meta.js`** (`grupo`, `num`, `orden`).
   El test falla si queda alguno sin numerar.
4. **Sin backend y offline-first.** Nada de fetch a servicios, ni variables de entorno, ni base de
   datos. El estado del usuario va en `localStorage` con `useLocalStorage` (que degrada a memoria si
   falla, para modo privado).
5. **Router por hash.** No usar rutas con `/` reales: evita configurar rewrites y permite abrir el
   `dist/` desde el sistema de archivos. `vite.config.js` usa `base: './'` por lo mismo.
6. **Dependencias mínimas.** Hoy son solo `react`, `react-dom`, `vite` y `@vitejs/plugin-react`.
   Antes de agregar una, evaluar si vale: el bundle ya pesa ~1.36 MB (395 kB gzip).
7. **Tema claro y oscuro.** Usar siempre las variables CSS de `src/styles.css`
   (`--surface-*`, `--text-*`, `--ok`, `--bad`…). Nunca colores hardcodeados.
8. **Español rioplatense** en todo el texto de la interfaz y del contenido, tratando de "vos".

## Contratos de los motores

Todos exportan funciones puras y se pueden probar desde node sin navegador.

- **`regex.js`** — compila la notación de ER de la cátedra a `RegExp`.
  Sintaxis: `{CONJUNTO}` (referencia), `[a-z]` (clase), `"texto"` (literal exacto), `* + ? | ( )`,
  concatenación por yuxtaposición, espacios ignorados. `testER(expr, conjuntos, aceptar, rechazar)`.
- **`lexica.js`** — atributos del lexema (`valor`, `valor_abs`, `longitud`,
  `longitud_sin_comillas`, `cant_guiones_bajos`, `cant_guiones`) y comparación con la cota.
- **`accionLexica.js`** — parsea el **pseudocódigo** que escribe el alumno (`if ( … ) return …; else error(…)`),
  extrae la condición y devuelve un predicado. Acepta `and`/`or`, paréntesis, el número de cualquier
  lado y llamadas tipo `len(yytext)`, `val()`, `abs(valor)`. También exporta `resaltar()` para el editor.
- **`earley.js`** — reconocedor Earley. Soporta ε y recursión a izquierda.
  Formato de gramática: `NoTerminal -> símbolos | alternativa`, símbolos separados por espacios,
  no terminal = todo lo que aparece a la izquierda alguna vez, start = LHS de la primera regla.
- **`parsing.js`** — gramática aumentada, PRIMEROS/SIGUIENTES, ítems LR(0), CLOSURE/GOTO y tabla SLR
  con conflictos. `validarConjuntos()` corrige lo que carga el alumno.
- **`polaca.js`** — intérprete de polaca inversa y de tercetos. **Valida por ejecución.**
  Convención: celdas separadas por espacios, **numeradas desde 1**; `BF` salta si es falso y `BI` es
  incondicional, con la **celda destino en la posición siguiente al salto**. Admite las dos
  convenciones de asignación (`valor destino :=` y `destino valor :=`). Corta si detecta ciclo infinito.
- **`coprocesador.js`** — simulador del 8087. `FADD/FSUB/FMUL/FDIV` hacen `ST(1) := ST(1) op ST(0)` y
  pop. `FLD` de una constante literal es error a propósito (es la trampa que toma la cátedra).

## Cómo agregar cosas

**Una lección de teoría:** editar el `content/mod-NN.js` que corresponda (cada archivo hace
`M.push({ id, titulo, parcial, resumen, lecciones: [...] })`). Cada lección lleva
`{ id, titulo, aho, badges, estado: 'dictada', html, qa: [{q, a}] }`. El `html` usa las clases
`callout tgt` (🎯 lo que entra al parcial) y `callout aho` (📘 profundidad de Aho). Después `npm run data`.

**Un ejercicio del sandbox:** agregarlo al archivo de su tipo en `src/data/ejercicios/`, sumar su
entrada en `meta.js` y correr `npm test`. Campos por tipo:

| Tipo | Archivo | Campos propios |
|---|---|---|
| ER | `er.js` | `cj` (conjuntos), `m` (modelo), `ac`, `rc` |
| Acciones léxicas | `lexicas.js` | `cj`, `mER`, `atr`, `op`, `cota`, `tests:[{v, ok, por}]` |
| Gramáticas | `glc.js` | `m`, `ac`, `rc`, `nota` (opcional) |
| Parsing | `parsing.js` | `gramatica`, `pedir: primeros\|siguientes\|ambos\|conflictos` |
| Código intermedio | `gci.js` | `modo: polaca\|tercetos`, `programa`, `m`, `casos:[{inicial, esperado}]` |
| Assembler | `asm.js` | `plantilla`, `m`, `casos:[{inicial, esperado}]` |

En parsing **no se guarda la respuesta**: la calcula el motor, así siempre es consistente con la gramática.

## Limitaciones conocidas (no son bugs)

- **El validador de gramáticas comprueba el LENGUAJE, no la forma del árbol.** La precedencia y la
  asociatividad no cambian qué cadenas se aceptan, así que en esos ejercicios hay un campo `nota` que
  se lo aclara al alumno. No prometer en la UI que se valida la precedencia.
- Los ejercicios de GCI y Assembler se validan por ejecución: cualquier solución que dé los mismos
  resultados pasa, aunque no coincida con el modelo. Es intencional.
- El bundle es un solo chunk grande. Si molesta, la teoría (`curso.js`, ~750 kB) es la candidata
  natural a cargarse con `import()` dinámico.

## Antes de commitear

```bash
npm run check
```

Los tests son la fuente de verdad sobre si el banco está sano. Si tocás un motor, corré también un
caso a mano en node para ver el comportamiento real, no solo el verde del test.
