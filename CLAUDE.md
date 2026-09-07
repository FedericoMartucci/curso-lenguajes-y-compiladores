# CLAUDE.md — contexto del proyecto

App de estudio de **Lenguajes y Compiladores** (UNLaM, cód. 1124/3663). React 19 + Vite + TypeScript
estricto. Tres cosas en un solo lugar:

- **Teoría**: 110 lecciones y 417 preguntas escritas sobre Aho y los apuntes de la cátedra.
- **Sandbox que valida de verdad**: 98 ejercicios y 926 casos, ejecutando lo que escribe el alumno.
- **Plan de estudio**: las 16 semanas del cronograma real de la cursada.

El progreso vive en `localStorage` y se sincroniza con una cuenta de Google (Supabase).
Estrategia **local-first**: el navegador es la fuente de verdad mientras usás la app.

La estrategia de producto y las decisiones de diseño están en **`PRODUCT.md`** y **`DESIGN.md`**.
Leelos antes de cambiar la interfaz: ahí está el porqué de cada cosa.

## Comandos

```bash
npm install
npm run dev       # servidor de desarrollo
npm run data      # regenera src/data/{indice,contenido}.ts desde content/
npm run build     # npm run data + vite build -> dist/
npm run tipos     # tsc --noEmit
npm test          # valida el banco de ejercicios (1456 casos) y la fusión de progreso
npm run contraste # verifica los pares de color contra tokens.css
npm run smoke     # renderiza las 27 rutas para detectar errores de componentes
npm run check     # tipos + test + contraste + smoke  ← correr SIEMPRE antes de commitear
```

## Arquitectura

```
index.html                 Entrada de Vite.
src/main.tsx  App.tsx      Arranque, shell, atajos globales y despacho de rutas.
src/tipos/                 Tipos del dominio: curso, ejercicios, motores, plan, progreso.
src/lib/
  router.ts                Router por History API. Rutas reales, sin hash.
  fusion.ts                Fusión de dos versiones del progreso. Lógica pura, testeada aparte.
  curso.ts                 Índice del curso + carga diferida del contenido.
  contenido.ts             Hooks para el contenido diferido (useCuerpo, useBanco).
  ejercicios.ts            Índice único de los 98 ejercicios, decorados.
  plan.ts                  Las 16 semanas del cronograma de la cátedra.
  hoy.ts                   Qué te toca hoy: cruza el plan con el progreso.
  progreso.tsx             Store único de estudio + fusión entre pestañas y con el servidor.
  srs.ts                   Repetición espaciada (SM-2 simplificado, tres calificaciones).
  sesion.tsx  supabase.ts  sync.ts    Cuenta con Google y sincronización.
  comparar.ts              Compara la respuesta escrita con el modelo (motor o conceptos).
  hooks.ts                 localStorage, tema, Escape, reduced-motion.
src/ui/                    Primitivas: Boton, Pill, Campo, Progreso, Cargando, Icono.
src/componentes/           BarraLateral, PaletaComandos, Enlace, CodeEditor, Casos, Teclado.
src/vistas/                Una por pantalla. sandbox/ tiene un panel por solapa.
src/engines/               Lógica pura, sin React. Testeable desde node.
TODO.md                    Lo postergado a propósito, con el porqué.
src/estilos/               tokens, base, ui, shell, vistas. Un archivo por capa.
src/data/                  Contenido generado y bancos de ejercicios.
content/mod-00..15.js      FUENTE DE VERDAD de la teoría. Sigue en JS a propósito.
public/fonts/              IBM Plex Sans y Mono, autoalojadas.
public/artifacts/          Visualizadores embebidos por iframe en lecciones.
supabase/esquema.sql       Tabla de progreso y políticas RLS.
tests/                     run.ts (banco), fusion.ts (merge), contraste.ts (color) y smoke.tsx.
build.js                   content/ -> src/data/{indice,contenido}.ts
```

## Invariantes — no romper

1. **`src/data/indice.ts` y `src/data/contenido.ts` son GENERADOS.** Nunca editarlos a mano. Se edita
   `content/mod-*.js` y se corre `npm run data`. Están commiteados a propósito para que el deploy no
   dependa de un paso extra. `content/` sigue en JS porque lo ejecuta un `vm` de Node y son literales
   de HTML: compilarlo antes no agregaría seguridad de tipos real.
2. **El contenido va partido en dos.** El índice (21 kB) viaja siempre porque lo necesita la
   navegación; el contenido (719 kB) se carga con `import()` dinámico. Si necesitás el cuerpo de una
   lección o una respuesta, usá `useCuerpo` / `useBanco`, nunca un import estático de `contenido.ts`.
3. **Todo ejercicio del sandbox debe tener una respuesta modelo que pase su propio set de casos.**
   `npm test` lo verifica. Es la red de seguridad principal del proyecto: no la desactives.
4. **Todo ejercicio necesita entrada en `src/data/ejercicios/meta.ts`** (`grupo`, `num`, `orden`).
   El test falla si queda alguno sin numerar. El `num` **solo se muestra si tiene un dígito**
   (`numeroVisible` en `lib/ejercicios.ts`): en las prácticas 1 y 2 es un identificador real de la
   cátedra (`1a`, `4c`), pero en las 3 a 6, que no vienen numeradas, es un apodo que repite el
   título. Si agregás un ejercicio con un apodo descriptivo, no hace falta que lo acortes: no se va
   a mostrar.
5. **Local-first, no online-first.** El navegador es la fuente de verdad mientras usás la app; la
   cuenta es una copia que se fusiona por marca de tiempo. Ninguna acción del alumno puede quedar
   esperando a la red. Sin `VITE_SUPABASE_*` la app arranca en modo local, que es lo que permite
   desarrollar y correr los tests sin credenciales.
6. **La fusión de progreso es el único lugar donde un bug pierde datos en silencio.**
   `src/lib/fusion.ts` resuelve los conflictos entre pestañas y contra el servidor. Tiene que
   distinguir dos cosas que se ven igual —la ausencia de una clave—: una entrada que el otro lado
   todavía no vio, y una que el otro lado BORRÓ. Lo hace con las marcas de tiempo por entrada.
   Si agregás un campo al progreso, agregalo también ahí **y sumá su caso a `tests/fusion.ts`**.
7. **Rutas reales, no hash.** El rewrite está en `vercel.json`. Todo enlace interno usa el componente
   `Enlace`, que renderiza un `<a href>` real: se llega con Tab, se abre en otra pestaña y se copia
   el link. Nunca un `<a onClick>` sin href.
8. **El plan sugiere, nunca bloquea.** Todas las lecciones y todos los ejercicios están siempre
   accesibles. El plan puede decir qué conviene; no puede impedir nada.
9. **La barra de progreso mide al alumno, no al contenido.** La cobertura del contenido
   (`coberturaContenido`) solo se muestra en Ajustes.
10. **Ningún texto usa un gris más claro que `--ink-3`** (4.6:1 como piso, medido contra cada
    superficie en ambos temas). Los grises decorativos que no son texto viven en `--hairline`.
    Nunca un color literal fuera de `src/estilos/tokens.css`.
11. **Los iconos se dibujan, no se escriben.** `src/ui/Icono.tsx` es el set: misma grilla de 16,
    trazo 1.5 y `currentColor`. Nada de `→ ✓ ✗ ☰ ⌕` como iconos. La excepción son los glifos del
    teclado de la Mesa y los badges 🎯📘⚙️, que son notación y contenido de la materia, no interfaz.
12. **Español rioplatense** en todo el texto de la interfaz y del contenido, tratando de "vos".
13. **Dependencias acotadas.** Hoy: `react`, `react-dom`, `@supabase/supabase-js`, `vite`,
    `@vitejs/plugin-react`, `vite-plugin-pwa`, `typescript`. Antes de agregar una, evaluar si vale.
14. **Ninguna credencial que no sea pública lleva prefijo `VITE_`.** Lo que tiene ese prefijo entra
    al bundle y es público, punto. La anon key de Supabase puede ir ahí porque RLS la limita.
15. **Dos niveles de certeza y se dicen distinto.** El motor ejecuta y su veredicto es un hecho
    (verde/rojo). La comparación por conceptos es una ayuda que NO dice si está bien (neutra).
    Nunca darle a la segunda la voz de la primera: es la promesa central del proyecto. Se evaluó
    meter un modelo de lenguaje para juzgar la prosa y se descartó a propósito — la app anda sin
    conexión, sin cuenta y sin que nadie pague nada, y eso vale más que un veredicto opinable.
16. **Dos fondos que significan cosas opuestas se separan en LUMINANCIA, no sólo en tono.**
    `--ok-bg` contra `--bad-bg`, `--accent-bg` contra las superficies. `npm run contraste` lo
    verifica leyendo `tokens.css`; también compara los dos bloques del tema oscuro, que están
    escritos por duplicado y se pueden ir de sincronía.

## Contratos de los motores

Todos exportan funciones puras y se pueden probar desde node sin navegador.

- **`regex.ts`** — compila la notación de ER de la cátedra a `RegExp`.
  Sintaxis: `{CONJUNTO}` (referencia), `[a-z]` (clase), `"texto"` (literal exacto), `* + ? | ( )`,
  concatenación por yuxtaposición, espacios ignorados. `testER(expr, conjuntos, aceptar, rechazar)`.
- **`lexica.ts`** — atributos del lexema (`valor`, `valor_abs`, `longitud`,
  `longitud_sin_comillas`, `cant_guiones_bajos`, `cant_guiones`) y comparación con la cota.
- **`accionLexica.ts`** — parsea el **pseudocódigo** que escribe el alumno (`if ( … ) return …; else error(…)`),
  extrae la condición y devuelve un predicado. Acepta `and`/`or`, paréntesis, el número de cualquier
  lado y llamadas tipo `len(yytext)`, `val()`, `abs(valor)`. También exporta `resaltar()` para el editor.
- **`earley.ts`** — reconocedor Earley. Soporta ε y recursión a izquierda.
  Formato de gramática: `NoTerminal -> símbolos | alternativa`, símbolos separados por espacios,
  no terminal = todo lo que aparece a la izquierda alguna vez, start = LHS de la primera regla.
- **`parsing.ts`** — gramática aumentada, PRIMEROS/SIGUIENTES, ítems LR(0), CLOSURE/GOTO y tabla SLR
  con conflictos. `validarConjuntos()` corrige lo que carga el alumno.
- **`arbol.ts`** — árbol sintáctico, la tercera notación. Padre, hijo izquierdo, hijo derecho.
  In-orden reconstruye el programa; post-orden da la polaca. Sin saltos ni etiquetas: un `if` lleva
  la condición a la izquierda y la acción a la derecha. Los nodos conectores (`M`) son dummy.
  **Valida por ejecución**, igual que polaca y tercetos.
- **`polaca.ts`** — intérprete de polaca inversa y de tercetos. **Valida por ejecución.**
  Convención: celdas separadas por espacios, **numeradas desde 1**; `BF` salta si es falso y `BI` es
  incondicional, con la **celda destino en la posición siguiente al salto**. Admite las dos
  convenciones de asignación (`valor destino :=` y `destino valor :=`). Corta si detecta ciclo infinito.
- **`coprocesador.ts`** — simulador del 8087. `FADD/FSUB/FMUL/FDIV` hacen `ST(1) := ST(1) op ST(0)` y
  pop. `FLD` de una constante literal es error a propósito (es la trampa que toma la cátedra).

## Cómo agregar cosas

**Una lección de teoría:** editar el `content/mod-NN.js` que corresponda (cada archivo hace
`M.push({ id, titulo, parcial, resumen, lecciones: [...] })`). Cada lección lleva
`{ id, titulo, aho, badges, estado: 'dictada', html, qa: [{q, a}] }`. El `html` usa las clases
`callout tgt` (🎯 lo que entra al parcial) y `callout aho` (📘 profundidad de Aho). Después
`npm run data`. Si la lección pertenece a un módulo nuevo, agregalo también a una semana en
`src/lib/plan.ts`: si no, no aparece en el plan.

**Un ejercicio del sandbox:** agregarlo al archivo de su tipo en `src/data/ejercicios/`, sumar su
entrada en `meta.ts` y correr `npm test`. Campos por tipo:

| Tipo | Archivo | Campos propios |
|---|---|---|
| ER | `er.ts` | `cj` (conjuntos), `m` (modelo), `ac`, `rc` |
| Acciones léxicas | `lexicas.ts` | `cj`, `mER`, `atr`, `op`, `cota`, `tests:[{v, ok, por}]` |
| Gramáticas | `glc.ts` | `m`, `ac`, `rc`, `nota` (opcional) |
| Parsing | `parsing.ts` | `gramatica`, `etapas: (aumentada\|primeros\|siguientes\|tabla\|conflictos)[]` |
| Código intermedio | `gci.ts` | `notaciones: (polaca\|tercetos\|arbol)[]`, `programa`, `m: {por notación}`, `casos` |
| Assembler | `asm.ts` | `plantilla`, `m`, `casos:[{inicial, esperado}]` |

En parsing **no se guarda la respuesta**: la calcula el motor, así siempre es consistente con la
gramática. Los tipos de `src/tipos/ejercicios.ts` hacen que un ejercicio mal formado no compile.

**Una pantalla nueva:** agregar el caso a `Ruta` y a `parsear`/`aHref` en `src/lib/router.ts`, el
caso en `Vista` (que vive a nivel de módulo en `App.tsx`, **nunca adentro de otro componente**), y
la ruta a la lista de `tests/smoke.tsx`.

## Limitaciones conocidas (no son bugs)

- **El validador de gramáticas comprueba el LENGUAJE, no la forma del árbol.** La precedencia y la
  asociatividad no cambian qué cadenas se aceptan, así que en esos ejercicios hay un campo `nota` que
  se lo aclara al alumno. No prometer en la UI que se valida la precedencia.
- Los ejercicios de GCI y Assembler se validan por ejecución: cualquier solución que dé los mismos
  resultados pasa, aunque no coincida con el modelo. Es intencional.
- El plan reparte las 110 lecciones siguiendo el ritmo real de la cátedra, que es desparejo: la
  semana 12 tiene 19 lecciones. No se maquilla para que quede prolijo; las semanas 1, 9 y 15 son
  feriado y quedan de colchón.
- La repetición espaciada usa días de calendario real, que no tienen nada que ver con las semanas
  del plan. Una cosa es cuándo conviene volver a ver una pregunta y otra en qué semana vas.

## Trampas que ya costaron caro

- **Un componente declarado adentro de otro se remonta en cada render.** `Vista` estaba dentro de
  `Contenido` y React perdía todo el estado local del árbol cada vez que cambiaba el progreso: el
  resultado de una validación desaparecía al instante. Los componentes van a nivel de módulo.
- **Un `<span>` dentro de un contenedor de layout necesita `display: block`.** Es el bug más
  recurrente del proyecto: apareció cinco veces (paginador, lista de metas, paleta de comandos,
  material y las tarjetas de dato). Dos síntomas, una causa:
  `text-overflow: ellipsis` no hace nada en un inline, y dos spans apilados quedan en la misma línea.
- **Un item de grid o flex con contenido `nowrap` necesita `min-width: 0`.** El piso de un track
  es su min-content, así que un título `nowrap` o una tabla con celdas `nowrap` estiran el track
  más allá del viewport. Apareció en `.hoy__meta` (+164px a 390px) y en `.sb__layout` con la tabla
  SLR abierta (390 → 477). `min-width: 0` en un hijo flex NO arregla el track del grid que lo contiene.
- **Una insignia de atajo que no dispara nada es una promesa rota.** `Boton` sólo dibuja `tecla`;
  atarla es responsabilidad de quien lo usa. Sólo se pasa cuando el atajo existe de verdad.
- **Un `placeholder` copiado del modelo es la respuesta servida.** El del campo de ER era, carácter
  por carácter, la solución del ejercicio donde se aterriza.
- **Persistir en un efecto de montaje escribe basura.** `useBorrador` guardaba el borrador al montar
  y creaba entradas de ejercicios nunca intentados. Solo se persiste después de una edición real.
- **Unir dos mapas resucita lo borrado.** La primera versión de `fusionar` hacía `{...a, ...b}`, así
  que desmarcar una lección o usar "borrar lecturas" quedaba deshecho por cualquier otra pestaña.
  Una eliminación y un "todavía no lo vi" son la misma ausencia: hay que mirar las marcas de tiempo.
- **Dos colores que sólo se distinguen por tono no se distinguen.** `--ok-bg` y `--bad-bg` estuvieron
  tres versiones a 1.01:1 entre sí: cada una pasaba el contraste de TEXTO y el panel de casos era
  igual un bloque liso que no se podía skimear. `--accent-bg` estaba a 1.00:1 contra `--sunken`, o
  sea que el ítem seleccionado del sidebar era invisible salvo por el azul. Un número de contraste
  de texto no ve este error; `tests/contraste.ts` sí.
- **`opacity` sobre texto informativo no tiene valor válido.** Para que `.caso__comillas` llegara a
  4.5:1 en el tema claro hacía falta opacidad 0.91, que no se nota. O el texto importa y va opaco,
  o no importa y no va. La jerarquía la dan el tamaño, el peso y el token de color.
- **Una tabla para llenar sin líneas de grilla no se ve como una tabla.** La tabla SLR tenía
  `border-collapse: separate`, `border-spacing: 0`, `td { padding: 0 }` y `.celda { border: 0 }`:
  90 casillas sin ningún límite visible hasta que una recibía foco.
- **Un comparador que castiga el parafraseo miente.** `compararProsa` buscaba el término del
  modelo como substring exacto, así que a un alumno que escribía "simplicidad del diseño",
  "parser" y "espacios" donde el modelo decía "sencillez de diseño", "sintáctico" y "blancos"
  le daba 2 de 6 — le decía "te faltó" a alguien que lo sabía. Se arregló con raíces y una
  tabla de sinónimos de la materia. Aflojar el matching tiene el error simétrico (darle
  conceptos a quien no escribió nada), así que `tests/comparar.ts` mide **las dos**
  direcciones con piso y techo por caso, y está verificado que falla en las dos.
- **Rellenar los conceptos con "palabras largas" inventa conceptos.** Si el modelo marcó tres
  términos en negrita, ésos son los conceptos; completar hasta seis agregaba "ensucia",
  "blancos" y "durante" y se los contaba al alumno como faltantes.

## Antes de commitear

```bash
npm run check
```

`check` corre tipos, banco de ejercicios, fusión, contraste y smoke. El de contraste lee
`src/estilos/tokens.css` de verdad, así que cualquier cambio de color pasa por ahí.

Los tests son la fuente de verdad sobre si el banco está sano. Si tocás un motor, corré también un
caso a mano en node para ver el comportamiento real, no solo el verde del test. Y si tocaste la
interfaz, abrila: los tres bugs de arriba no los agarró ningún test.
