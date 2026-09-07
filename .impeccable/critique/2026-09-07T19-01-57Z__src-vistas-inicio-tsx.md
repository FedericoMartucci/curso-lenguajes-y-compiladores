---
target: hoy
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
target_identity: "file:/Users/federicomartucci/Desktop/UNLaM/Lenguajes y Compiladores/Curso Web LyC/src/vistas/Inicio.tsx"
target_fingerprint: "sha256:98a13560a2da8970d33c4c44c44589a377c0614e786475052abf263a26820bdc"
target_path: /Users/federicomartucci/Desktop/UNLaM/Lenguajes y Compiladores/Curso Web LyC/src/vistas/Inicio.tsx
timestamp: 2026-09-07T19-01-57Z
slug: src-vistas-inicio-tsx
---
Method: dual-agent (A: revisión de diseño · B: detector + evidencia de navegador)

## Design Health Score — 23/40 (Acceptable)

| # | Heurística | Score | Hallazgo |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | La barra bajo "Leer hoy · 3 lecciones" mide la semana (6/14). Dos denominadores, una barra, sin rótulo visible. |
| 2 | Correspondencia con el mundo real | 2 | "Semana 5" nunca se reconcilia con el calendario. Instalación nueva = "Semana 1 del 17 de agosto" un 7 de septiembre. |
| 3 | Control y libertad | 2 | "Cerrar la semana" cambia tu posición en el plan sin confirmación ni deshacer. |
| 4 | Consistencia | 3 | Sistema real y respetado. Resta: el panel de logro usa `panel--plano` (hundido) mientras los comunes son elevados: énfasis invertido. |
| 5 | Prevención de errores | 2 | La semana no se autocorrige; "Resolver" sugiere siempre el backlog más viejo. |
| 6 | Reconocer antes que recordar | 2 | 🎯 a 13px con `title`: sin mouse no hay forma de saber qué significa. |
| 7 | Flexibilidad y eficiencia | 2 | La insignia `e` del CTA primario no dispara nada; el atajo real es `g` `e`. |
| 8 | Estética y minimalismo | 3 | Las tres tarjetas de "Tu avance" no habilitan acción y cierran la página en 0/417. |
| 9 | Diagnóstico y recuperación | 2 | Dos estados vacíos que dicen "no hay nada", y uno miente. |
| 10 | Ayuda y documentación | 2 | La bajada de arranque desaparece al leer la primera lección y nunca explica qué significa "se valida ejecutándose". |

## Veredicto de especificidad

El contenido es de este producto; el diseño no. La fila de lección (`6.7 · Construcción de la tabla SLR · §4.6.4 · p.252`) sólo la construye alguien con el apunte abierto. Lo que la contiene —título, grilla 2-up, grilla 3-up de estadísticas— es un dashboard SaaS genérico. La pantalla es estructuralmente idéntica la semana del Parcial I y una semana común: `semana.clase` existe en `plan.ts` y `Inicio.tsx` nunca lo lee.

Detector: file-mode limpio sobre `.tsx`/`.css`, pero eso NO cubre contraste (necesita render). URL-mode: `flat-type-hierarchy` (h1 14px < h2 30px), `monotonous-spacing` (4px en 70% de los casos), `line-length` ~90cpl en estado vacío.

## Problemas prioritarios

### P0 — La app no sabe en qué semana estás y nunca lo va a saber
`progreso.semana` arranca en 1 y sólo avanza manualmente. `plan.ts` ya trae `cuando: 'del 17 de agosto'` para las 16 semanas: el mapeo existe y no se usa. Un compañero que entra hoy ve "Semana 1 · Arranque · Lunes feriado", tres semanas atrás.
Fix: derivar la semana del calendario, dejar `progreso.semana` como override, y cuando difieran decirlo en una línea. Nunca elegir en silencio.

### P1 — El tema guardado se ignora en todas las rutas menos /ajustes
`useTheme()` se importa sólo en `Ajustes.tsx:2`. Verificado por las dos evaluaciones B de forma independiente: con `lyc-tema = "dark"` y SO en claro, `/` renderiza claro. Rompe el requisito de accesibilidad de PRODUCT.md.
Fix: subir `useTheme()` a `App.tsx` + script inline en `index.html` antes del primer pintado.

### P1 — A 390px la pantalla de aterrizaje desborda 164px
Medido: `scrollWidth` 554 vs `clientWidth` 390. `.hoy__meta` es grid sin `grid-template-columns`, el track implícito tiene piso min-content, y `.meta-item__t` es `nowrap`: el piso es el título completo sin truncar. `min-width: 0` está en `__cuerpo` (item flex), no en el track del grid.
Fix: `.hoy__meta { grid-template-columns: minmax(0, 1fr) }`.

### P1 — La insignia del atajo miente y "Resolver" muestra el backlog, no hoy
(a) `tecla="e"` se dibuja y nunca se ata; `Boton` sólo la renderiza. (b) `pendientes.slice(0,3)` toma de `TODOS_LOS_EJERCICIOS`, ordenado er→lex→glc→…: en semana 5, con la Práctica 3 recién liberada, recomienda "Patente Mercosur".
Fix: atar `tecla` dentro de `Boton` o eliminar la prop; ordenar pendientes por semana de liberación descendente.

### P1 — El repaso no tiene techo mientras la lectura sí
`meta` es `slice(0, ritmo)` = 3 lecciones. `vencidas` no tiene tope: 100 con 10 lecciones leídas, 215 con los módulos 0-7. La frase dice "que tocan hoy" y 215 no es un día. Leer agranda el número.
Fix: aplicar el mismo ritmo. "20 para hoy · 215 vencidas en total".

### P2 — Insignia de tecla bajo contraste
`.btn__tecla { opacity: 0.7 }` sobre botón primario: 4.28:1 claro, 4.16:1 oscuro. El texto declarado es blanco puro; la opacidad lo hunde. Afecta Hoy, el Validar del sandbox y el drill. Subir a 0.8 da 5.03/5.31.

### P2 — 31 paradas de foco invisibles antes del contenido, a 390px
El drawer cerrado (`translateX(-300px)`) no es `inert`. `App.tsx` marca `.columna` como inert al ABRIR, pero nada marca `.lateral` mientras está cerrado. El primer control del contenido es la parada #35.

### P3 — Los dos vacíos dicen "no hay nada" y uno es falso
"Resolviste todo lo que se liberó hasta la semana 1" se le muestra a alguien que resolvió cero.

## Banderas rojas por persona

**El compañero que entra por el link.** Aterriza en Semana 1 · 17 de agosto, tres semanas atrás. Ningún botón primario en la pantalla. La mitad derecha son dos callejones grises, uno felicitándolo por haber resuelto todo. Abajo 0/110 · 0/417 · 0/98. Lo único que lo haría quedarse —una ER que compila contra casos reales— no es alcanzable desde Hoy.

**Federico, notebook de noche.** Su tema oscuro guardado no carga. Cierra la semana de un clic y no hay deshacer.

**Cualquiera con el celular en el aula.** La pantalla de aterrizaje scrollea en horizontal; las flechas y los 🎯 quedan fuera del viewport. El 🎯 es un emoji de 13px con tooltip que un teléfono no muestra.

## Observaciones menores
- `Pill` importado sin usar en `Inicio.tsx:10`.
- El único `h1` del documento es el de la barra lateral (14px); el título de página es `h2` a 30px.
- Las migas "Semana 5 · C3 · Parsing" son spans planos; "Semana 5" debería llevar a /plan.
- "C3" no se expande en ningún lado.
- `calcularAvance().pct` se calcula y no se renderiza.
