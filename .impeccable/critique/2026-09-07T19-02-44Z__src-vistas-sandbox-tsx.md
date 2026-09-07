---
target: sandbox
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 4
target_identity: "file:/Users/federicomartucci/Desktop/UNLaM/Lenguajes y Compiladores/Curso Web LyC/src/vistas/Sandbox.tsx"
target_fingerprint: "sha256:d567005b685d7d59e94b8a7e6170acc99adc951658a96a024c75e0ebc3b3fd67"
target_path: /Users/federicomartucci/Desktop/UNLaM/Lenguajes y Compiladores/Curso Web LyC/src/vistas/Sandbox.tsx
timestamp: 2026-09-07T19-02-44Z
slug: src-vistas-sandbox-tsx
---
Method: dual-agent (A: revisión de diseño · B: detector + evidencia de navegador)

## Design Health Score — 24/40 (Acceptable)

| # | Heurística | Score | Hallazgo |
|---|---|---|---|
| 1 | Visibilidad del estado | 2 | Apretás ⌘↵ y no pasa nada visible: el veredicto nace en y=931 con viewport de 900. A 390px, en y=1686. |
| 2 | Correspondencia con el mundo real | 3 | La píldora "13 casos" en parsing son estados LR(0). El ejercicio no tiene casos. |
| 3 | Control y libertad | 2 | "Volver a la plantilla" borra 16 líneas de Assembler sin confirmación, en estilo ghost, pegado al primario. |
| 4 | Consistencia | 2 | Validar deshabilitado con campo vacío en ER, habilitado en parsing. GLC muestra sus casos antes de validar; ER los esconde. Lex usa CodeEditor; ASM un textarea pelado. |
| 5 | Prevención de errores | 2 | Tab dentro del editor de Assembler saca el foco al botón Validar. En Assembler se indenta todo el tiempo. |
| 6 | Reconocer antes que recordar | 3 | La chuleta de notación y el teclado de símbolos están muy bien. En parsing hay que retipear los no terminales sin scaffold. |
| 7 | Flexibilidad y eficiencia | 3 | ⌘↵ anda y está rotulado. Pero el índice mete 32 enlaces tabulables antes del primer campo. |
| 8 | Estética y minimalismo | 2 | Acertar produce 20 filas verdes de ~730px que hay que scrollear para llegar al "Siguiente ejercicio". |
| 9 | Diagnóstico y recuperación | 2 | Seis filas idénticas "debe aceptarla, pero la rechaza". Dos filas que se leen igual (espacio adelante vs atrás). Cero explicación del porqué. |
| 10 | Ayuda y documentación | 3 | PanelGLC es el único panel sin caja de honestidad, y es el tipo con la limitación más documentada del proyecto. Sólo 3 de 22 ejercicios traen nota. |

## Veredicto de especificidad

Específica en el lenguaje, genérica en la mecánica. El "Acá no hay respuesta guardada" del panel de parsing es diseño de producto: le cuenta al usuario la arquitectura porque la arquitectura es la razón para confiar. Pero un producto cuyo posicionamiento entero es "se corrige ejecutándose de verdad" resuelve el resultado de esa ejecución como 20 filas apiladas, sin diagnóstico, fuera de pantalla. El motor es la promesa; la interfaz del resultado es la parte menos diseñada. Está al revés.

Detector: file-mode limpio (verificado con canario sintético que sí dispara). URL-mode inalcanzable: el servidor de Vite bindea sólo IPv6 y el socket de HMR impide que el detector alcance su condición de carga.

## Problemas prioritarios

### P0 — El resultado de la validación nace fuera de pantalla
Medido: veredicto en y=931 con viewport 900 (1440×900); en y=1686 con viewport 844 (390×844). Sin scrollIntoView ni movimiento de foco. La única señal de que el motor corrió está fuera de cuadro.
Fix: `scrollIntoView({block:'center'})` + foco en el `.veredicto` (ya tiene `role="status"`). Complementario: barra de acciones sticky con resumen compacto (`✗ 7/20`).

### P0 — Los casos que fallan no explican nada, y dos son indistinguibles
` 1234` y `1234 ` (espacio adelante y atrás) se renderizan idénticos: `muestra()` no los revela y el HTML colapsa el de adelante. Es exactamente el borde que el ejercicio quiere enseñar, y es el único que la interfaz no puede mostrar. Seis filas repiten la misma frase. `z: esperaba 5, dio —` no se puede interpretar.
Fix: envolver en «» y sustituir espacios de borde por ␣; colapsar los que pasan detrás de "13 pasan ▸"; diagnóstico por caso (prefijo más largo que matchea; "tu programa nunca escribió z").

### P1 — El placeholder es la respuesta del ejercicio
`PanelER.tsx:68` tiene `placeholder="{DIGITO1}{DIGITO}{DIGITO}{DIGITO}"` y `er.ts:13` tiene el mismo string como `m`. En el ejercicio donde aterrizás, el placeholder es la solución. Lo mismo en parsing: el placeholder `E = id, cte` regala una de las cuatro filas de PRIMEROS en p3-canonica.
Fix: derivar el placeholder por ejercicio o usar una forma neutra.

### P1 — Ninguna capa entre fallar y la respuesta completa
Un solo `<details>` que en parsing despliega 3539px: gramática aumentada + conjuntos + 13 estados + tabla SLR. La distancia entre "no me sale" y "acá está todo" es un clic.
Fix: escalonar en tres —una pista, los conjuntos, la solución completa. Y sacar la nota de "puede haber varias correctas" AFUERA del details.

### P1 — A 390px la solución de parsing rompe el ancho del documento
Medido: al abrir el details, `scrollWidth` salta de 390 a 477. `.sb__layout` colapsa a `grid-template-columns: 1fr`, el `.panel` tiene `min-width: auto`, y `white-space: nowrap` en `.tabla-slr` propaga su min-content a través de `.scroll-x` (que es un bloque plano, no un item de grid).
Fix: `min-width: 0` en la columna del `.sb__layout`. Después: primera celda `position: sticky; left: 0`.

### P1 — El editor de Assembler es el peor editor de la app, en el contenido más difícil
`PanelASM.tsx:48` es un `<textarea rows={16}>` crudo: sin números de línea, sin resaltado, `white-space: pre-wrap` (las líneas largas wrapean y se pierde la estructura de columnas), Tab saca el foco. `CodeEditor` ya resuelve Tab y ⌘↵ y no se usa acá.

### P2 — Probar una cadena propia y que funcione se pinta rojo
`Casos.tsx` contempla `libre` en `explicar()` y en el conteo, pero no en la clase ni en el orden: una prueba libre que se rechaza correctamente sale como fila roja con ✗ arriba de todo, debajo de un veredicto verde.

### P2 — La cabecera miente en parsing
`casos={info?.estados.length}` produce "13 casos" donde no hay casos.

## Banderas rojas por persona

**El alumno atascado.** Apretó ⌘↵ dos veces porque la primera "no hizo nada". Ve seis filas con el mismo texto. Ve dos filas verdes que dicen `1234` y no entiende por qué el mismo string aparece dos veces. Prueba una idea propia, le funciona, y la app le pinta rojo. Le queda un solo botón: la respuesta modelo.

**El compañero que entra por el link.** Lo primero que le dice el Sandbox es una píldora ámbar "se ve en la semana 2". Lo segundo, un botón primario gris. Lo tercero, un campo con la respuesta escrita en gris. Si cae en Gramáticas, resuelve 22 ejercicios sin que nadie le diga que la precedencia no se valida.

**Federico, domingo, Práctica 6.** Tab para alinear un operando, pierde el cursor, le pega al botón. Recibe "z: esperaba 5, dio —" sin pista de si el problema es el orden de la pila o que falta el FSTP.

## Observaciones menores
- Las 6 solapas wrapean a 1440px dejando "Assembler" solo en la segunda fila.
- Los cuatro `num` `1k · decimal|octal|hexa|las tres` se truncan todos a `1k · …`: se corta la mitad que desambigua.
- Los `<summary>` miden 21px de alto (< 24px) en los cuatro paneles.
- Las teclas de símbolos miden 30×26px: la mitad del mínimo táctil, en la pantalla donde más se usan desde el celular.
- Los campos usan 13px; en iOS Safari eso fuerza zoom al enfocar.
- El error de compilación se imprime dos veces (Campo + errbox).
- La animación del veredicto se ejecuta fuera del viewport: nadie la ve nunca.
- El editor de código tiene alineación exacta (delta 0 en x/y/w/h), pero `font-variant-ligatures` difiere entre el `<pre>` y el `<textarea>`.
