# Design

Sistema visual de la app de Lenguajes y Compiladores. Dirección elegida: **apunte refinado** — se conserva la
identidad crema + azul que ya tenía el proyecto, y la mejora viene de tipografía, jerarquía y estados, no de
cambiar la paleta.

## Theme

Claro por defecto, oscuro real disponible, y una tercera opción "sistema" que sigue al SO. El oscuro no es un
filtro invertido: es una paleta propia, porque se leen 110 lecciones de noche.

El tema se resuelve con `data-theme="light" | "dark"` en `<html>`; sin atributo manda `prefers-color-scheme`.
Todo color se define en `:root` primero; los bloques de tema solo redefinen tokens, nunca los estrenan.

## Color

Paleta en OKLCH. El crema `#faf9f5` y el azul `#2c5aa0` vienen del proyecto original y no se tocan: son la
identidad. Lo que sí cambia es la escala de grises de texto, porque la actual no pasa contraste.

### Superficies

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--canvas` | `#faf9f5` | `#1a1a18` | Fondo de página |
| `--surface` | `#ffffff` | `#2e2e2b` | Tarjetas, paneles, campos |
| `--sunken` | `#f1efe8` | `#242422` | Sidebar, bloques de código, celdas de encabezado |
| `--hairline` | `#e6e5e3` | `#33332f` | Bordes de separación |
| `--hairline-strong` | `#cecdc9` | `#46464170` | Bordes de controles interactivos |

### Texto

| Token | Claro | Oscuro | Contraste mínimo medido |
|---|---|---|---|
| `--ink` | `#1a1a18` | `#ecebe6` | 15.1:1 |
| `--ink-2` | `#5f5e5a` | `#a8a7a0` | 5.6:1 |
| `--ink-3` | `#6d6b62` | `#98968f` | **4.6:1** |

`--ink-3` reemplaza al `--text-muted` anterior (`#8a8880` / `#6f6e69`), que daba 3.37:1 en claro y 2.67:1 en
oscuro y estaba usado en labels de campo, hints, breadcrumbs y placeholders. Ningún texto usa un gris más
claro que `--ink-3`. Los grises decorativos que no son texto viven en `--hairline`.

### Acento y semántica

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--accent` | `#2c5aa0` | `#9db8e8` | Acción primaria, selección actual, links |
| `--accent-bg` | `#e6f0fb` | `#1f2c44` | Fondo del callout 🎯 y del estado seleccionado |
| `--ok` / `--ok-bg` | `#3b6d11` / `#eaf3de` | `#97c459` / `#22331a` | Caso que pasa, ejercicio resuelto |
| `--bad` / `--bad-bg` | `#a32d2d` / `#fcebeb` | `#f09595` / `#3a1f1f` | Caso que falla, error de compilación |
| `--warn` | `#854f0b` | `#ef9f27` | Aviso de forma, ejercicio con nota |
| `--purple` | `#534ab7` | `#afa9ec` | Profundidad de Aho (📘), palabras clave del editor |

El acento se usa para acción primaria, selección y estado. Nunca para decorar. Estrategia de color:
**restrained** — el acento no pasa del 10% de la superficie.

### Estados obligatorios

Todo control define los siete: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`.
El foco es un anillo de 2px en `--accent` con `outline-offset: 2px`, visible en ambos temas y nunca suprimido.

## Typography

Una sola superfamilia, en dos voces: **IBM Plex Sans** para todo lo que se lee y se opera, **IBM Plex Mono**
para toda la notación (expresiones regulares, gramáticas, polaca, tercetos, tablas SLR, Assembler). Están
diseñadas juntas: comparten métricas y altura de x, así que el mono no se despega del texto cuando aparece
en línea.

Autoalojadas en `public/fonts/` como woff2, subset latin, `font-display: swap`, con fallback a system-ui.
No hay pedido a Google Fonts: la app tiene que andar sin conexión.

Pesos: Sans 400 / 500 / 600. Mono 400 / 500. Nada más.

### Escala

Fija en rem, ratio ~1.18. Nada de `clamp()` en UI de producto: el usuario mira a un DPI constante y un título
fluido dentro de un panel se ve peor, no mejor.

| Token | px | Uso |
|---|---|---|
| `--fs-xs` | 12 | Badges, meta de ejercicio, números de lección |
| `--fs-sm` | 13 | Notación en línea, celdas de tabla, hints |
| `--fs-base` | 14 | Interfaz: botones, labels, sidebar, campos |
| `--fs-md` | 15 | Cuerpo de tarjeta, consigna de ejercicio |
| `--fs-lg` | 17 | **Prosa de las lecciones** |
| `--fs-xl` | 20 | h3 dentro de una lección |
| `--fs-2xl` | 24 | h2 de sección |
| `--fs-3xl` | 30 | Título de página |

Interlineado: `--lh-tight` 1.25 en títulos, `--lh-ui` 1.5 en interfaz, `--lh-read` 1.75 en prosa.
Medida: `--measure-read` 68ch para la teoría, `--measure-ui` 75ch para el resto. La notación y las tablas
scrollean en su propio contenedor `overflow-x: auto`; el `body` nunca scrollea en horizontal.

`text-wrap: balance` en h1–h3, `text-wrap: pretty` en prosa larga.

## Spacing & shape

Escala de 4px: `--s1` 4 · `--s2` 8 · `--s3` 12 · `--s4` 16 · `--s5` 24 · `--s6` 32 · `--s7` 48 · `--s8` 64.
El ritmo vertical varía a propósito: entre bloques de una lección hay más aire que entre campos de un
formulario. Espaciado uniforme en todo = página plana.

Radios: `--r-sm` 6 (controles y campos) · `--r-md` 10 (tarjetas y paneles) · `--r-lg` 14 (paleta de comandos,
diálogos) · `--r-full` 999 (pills y chips).

Elevación: los bordes hacen el trabajo. Hay dos sombras y solo para capas que flotan de verdad —
`--shadow-pop` (dropdown, popover) y `--shadow-modal` (paleta de comandos, diálogo, drawer mobile).

Escala de z-index semántica, sin números arbitrarios:
`--z-dropdown` 100 · `--z-sticky` 200 · `--z-drawer` 300 · `--z-backdrop` 400 · `--z-modal` 500 ·
`--z-toast` 600 · `--z-tooltip` 700.

## Layout

Shell de aplicación: sidebar fijo de 288px + columna de contenido. La responsividad es estructural, no fluida.

- **≥1200px** — sidebar + contenido con medida acotada. En el sandbox, consigna y editor pueden ir a dos columnas.
- **820–1199px** — sidebar visible, contenido a una columna.
- **<820px** — el sidebar pasa a drawer con backdrop, cierre con Escape, foco atrapado y `inert` en el fondo.
  Barra superior con el título de la vista, no solo un ☰.

El sidebar no muestra 110 lecciones abiertas. Módulos colapsables, el módulo actual abierto, filtro por
parcial, y el ítem activo con `aria-current="page"`.

## Components

Vocabulario único en toda la app. Si el botón de guardar se ve distinto en dos pantallas, uno está mal.

- **Button** — `primary` / `secondary` / `ghost` / `danger`, tamaños `sm` y `md`. Con estado `loading` propio.
- **Field** — label, control, hint y error como una sola pieza; el error reemplaza al hint, no se apilan.
- **CodeEditor** — el overlay `<pre>` + `<textarea>` que ya existe, con números de línea, `⌘↵` para validar
  y `Tab` que indenta sin robarle el foco al teclado.
- **CaseList** — el resultado de una validación: veredicto arriba, casos abajo, el que falló primero y
  expandible para ver por qué. Nunca solo "✗ incorrecto".
- **Pill / Badge** — `🎯 parcial`, `📘 Aho`, `⚙️ taller`, estado de ejercicio. Texto y color, nunca solo color.
- **Progress** — barra y anillo. Siempre miden al alumno, jamás al contenido.
- **CommandPalette** — `⌘K`. Lecciones, ejercicios, prácticas y acciones en un solo índice.
- **EmptyState** — enseña la pantalla, no dice "no hay nada". Toda lista vacía tiene uno.
- **Skeleton** — para la teoría cargada con `import()` dinámico. Nunca un spinner en medio del contenido.

Estados de carga con skeleton, no con spinner. Ningún modal que pueda resolverse en línea.

## Motion

150–250 ms, `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`. La animación comunica estado: apertura de panel,
resultado de validación, cambio de semana en el plan. Nada decorativo, ninguna secuencia de entrada al cargar
la página: el usuario entra a una tarea, no a mirar cómo carga.

El resultado de una validación aparece con un desplazamiento corto y un fundido, no con un rebote. Los casos
de prueba entran escalonados de a 20ms porque son una lista con orden real; el veredicto no.

`@media (prefers-reduced-motion: reduce)` deja todo en fundido o en cambio instantáneo. No es opcional.

## Anti-patterns propios de este proyecto

- Barras de progreso que miden cuánto contenido existe en lugar de cuánto estudió el usuario.
- Un `<select>` con 32 ejercicios como única forma de navegar el sandbox.
- Texto en `--ink-3` o más claro para algo que hay que leer de verdad.
- Prometer en la interfaz una validación que el motor no hace.
- `<a onClick>` sin `href`: no llega con Tab y no se puede abrir en otra pestaña.
