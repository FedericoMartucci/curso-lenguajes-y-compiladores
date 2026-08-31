M.push({ id:13, titulo:"Optimización", parcial:"II",
  resumen:"Qué significa optimizar sin romper la semántica (el contraejemplo a=b/b), de dónde sale la redundancia y el catálogo completo de transformaciones: subexpresiones comunes, propagación de copias y de constantes, código muerto, movimiento de código invariante, variables de inducción y reducción por fuerza, la reducción simple (constant folding) con los tres momentos de aplicación, la redundancia sobre tercetos con baja lógica y dónde cortar, el enhebrado, la optimización de mirilla (peephole) y —para saber que existe— el análisis de flujo de datos.",
  lecciones:[
  {
    id:"13.1", titulo:"Qué es optimizar; el contraejemplo a=b/b", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p><b>Optimizar</b> es el conjunto de fases de un compilador que transforman un fragmento de código en <b>otro fragmento equivalente</b> pero más <b>eficiente</b>. Dos palabras cargan todo el peso: <b>equivalente</b> (hace exactamente lo mismo) y <b>eficiente</b> (gasta menos <b>memoria</b> o menos <b>tiempo de ejecución</b>). Optimizar no cambia <i>qué</i> hace el programa; cambia <i>cómo</i> lo hace.</p>

<h3>La analogía de la receta</h3>
<p>Pensá una receta que dice «picá la cebolla, después picá la misma cebolla otra vez, después sumá 2 + 3 + 4 tazas de harina». Un buen cocinero la reescribe: «picá la cebolla una vez; sumá 9 tazas». El plato que sale a la mesa es <b>idéntico</b> (misma semántica), pero se cocina en menos pasos y con menos ollas sucias (más eficiente). Eso es optimizar. Lo que <b>no</b> puede hacer el cocinero es cambiar el plato: si le pediste una tortilla, no te puede traer un revuelto porque «sale más rápido». La equivalencia es sagrada.</p>

<h3>Por qué existe: la historia en una línea</h3>
<p>En los <b>primeros tiempos de la informática</b>, el propio programador se encargaba de la <b>asignación de registros</b> del procesador, del <b>almacenamiento de los datos</b> y del <b>acceso a memoria</b>. Era carísimo de desarrollar y de mantener. La evolución fue <b>abstraer la plataforma</b>: el programador escribe en alto nivel, cómodo, y el <b>compilador</b> se hace cargo de exprimir la máquina. La optimización es justamente ese trabajo que antes hacías a mano y ahora hace el compilador por vos.</p>

<div class="callout tgt"><span class="lab">🎯 cuidado con la equivalencia: el contraejemplo a=b/b</span>
<code>a = b/b</code> parece que se puede optimizar a <code>a = 1</code> (total, algo dividido por sí mismo da 1). Pero eso vale <b>solo si b ≠ 0</b>. Si <code>b</code> puede valer <b>0</b>, el código original lanzaría una <b>división por cero</b> (un error en ejecución) y el «optimizado» no: <b>ya no son equivalentes</b>. La equivalencia semántica es la condición <b>no negociable</b>; ninguna mejora de eficiencia justifica cambiar lo que el programa calcula (o el error que produce). El mismo cuidado aplica a <code>x/1 → x</code> (ese sí siempre es válido) o a <code>x*0 → 0</code> (válido para enteros, pero ojo con punto flotante y NaN).</div>

<h3>El caso borde: qué NO puede optimizar el compilador</h3>
<p>Una vez que elegiste e implementaste un <b>algoritmo</b>, el compilador <b>no lo va a cambiar por otro</b>: no va a transformar tu ordenamiento burbuja en un quicksort. No entiende «lo suficiente» tu intención. Solo aplica transformaciones semánticas de <b>bajo nivel</b> (lo vemos en 13.2). Por eso la optimización mejora el <b>código generado</b>, no rediseña tu solución.</p>

<h3>Contexto de la cátedra</h3>
<p>La <b>generación de código sin optimizar</b> es relativamente <b>sencilla</b>. La <b>optimización</b>, en cambio, es el campo donde <b>más se investiga</b> hoy en los compiladores, todavía no está «terminado», existen muchísimas formas y <b>cada autor la clasifica distinto</b>. Nosotros vamos a ver un subconjunto: código muerto, bucles, propagación de constantes, reducción simple, redundancia y enhebrado.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Optimizar</b> = transformar un fragmento en otro con <b>semántica equivalente</b> y mayor <b>eficiencia</b> (menos memoria o menos tiempo de ejecución).</li>
<li>🎯 La <b>equivalencia</b> es la condición irrenunciable: <code>a=b/b → a=1</code> <b>solo si b ≠ 0</b>; si no, cambia la semántica.</li>
<li>El compilador aplica transformaciones de <b>bajo nivel</b>; <b>no</b> reemplaza tu algoritmo por otro.</li>
<li>La optimización nació de <b>abstraer la plataforma</b>: lo que antes hacía el programador a mano (registros, memoria) hoy lo hace el compilador. Es el área donde más se investiga.</li>
</ul>`,
    qa:[
      {q:"¿Qué es la optimización de código y cuáles son sus dos condiciones?",
       a:`<p>Es el <b>conjunto de fases</b> que transforman un fragmento de código en otro fragmento. Las dos condiciones: (1) <b>semántica equivalente</b> — el código optimizado debe hacer <b>exactamente lo mismo</b> que el original; y (2) mayor <b>eficiencia</b> — debe gastar menos <b>memoria</b> o menos <b>tiempo de ejecución</b>. La primera es innegociable: si una «mejora» cambia lo que el programa calcula, no es una optimización válida. Ejemplo de mejora legítima: <code>a := 2*3 → a := 6</code> (mismo resultado, menos trabajo en ejecución).</p>`},
      {q:"¿Por qué a=b/b → a=1 puede violar la equivalencia y cuándo es válida?",
       a:`<p>Porque <code>b/b</code> da 1 <b>solo si b ≠ 0</b>. Si <code>b</code> puede valer <b>0</b>, el código original produce una <b>división por cero</b> (error en tiempo de ejecución) y el optimizado <code>a=1</code> no: los dos programas se comportan distinto, así que <b>no son equivalentes</b>. La optimización solo es correcta si el compilador puede <b>garantizar</b> que <code>b</code> nunca es cero en ese punto. Es el contraejemplo clásico de la cátedra para mostrar que la eficiencia jamás puede pasar por encima de la equivalencia.</p>`},
      {q:"¿Puede el compilador reemplazar tu algoritmo por uno más eficiente al optimizar?",
       a:`<p><b>No.</b> Una vez que el programador eligió e implementó un algoritmo (por ejemplo, un ordenamiento burbuja), el compilador <b>no comprende lo suficiente</b> la intención como para sustituirlo por otro distinto (un quicksort). Solo aplica transformaciones semánticas de <b>bajo nivel</b>: identidades algebraicas (<code>i+0 = i</code>), reutilizar un cálculo ya hecho, plegar constantes, sacar código de un bucle. Mejora el <b>código generado</b>, no rediseña la solución. Por eso elegir un buen algoritmo sigue siendo tarea del programador.</p>`},
      {q:"¿Por qué se dice que la optimización es el área donde más se investiga, a diferencia de la generación de código?",
       a:`<p>Porque generar código <b>sin optimizar</b> es relativamente <b>sencillo</b>: hay recetas directas para pasar de la notación intermedia a Assembler. La <b>optimización</b>, en cambio, es un problema <b>abierto</b>: no se ha terminado de desarrollar, existen muchísimas técnicas, dependen de la arquitectura destino y <b>cada autor la clasifica distinto</b>. Además muchas mejoras interactúan entre sí (el enhebrado, lección 13.10), lo que la vuelve un terreno fértil de investigación. Históricamente surgió de <b>abstraer la plataforma</b>: trasladar al compilador el trabajo de registros y memoria que antes hacía el programador.</p>`}
    ]
  },
  {
    id:"13.2", titulo:"Fuentes de redundancia; transformaciones que preservan semántica", aho:"§9.1.1–9.1.3 · p.584", badges:["📘"], estado:"dictada",
    html:`
<p>Esta lección es <b>📘 de Aho</b>: da el marco teórico de <b>de dónde sale</b> el código optimizable y <b>qué clase</b> de transformaciones puede aplicar un compilador. La cátedra lo resume distinto (habla de «redundancia» sobre tercetos, 13.9), pero entender a Aho acá te explica el <b>por qué</b>.</p>

<p>Regla de oro de Aho: la optimización debe <b>preservar la semántica</b> del programa original. Salvo casos muy especiales, el compilador solo sabe aplicar transformaciones semánticas de <b>nivel bajo</b>, apoyándose en <b>hechos generales</b>: identidades algebraicas como <code>i + 0 = i</code>, o el hecho de que <b>hacer la misma operación sobre los mismos valores produce el mismo resultado</b>. Ese segundo hecho es la semilla de casi todo.</p>

<h3>De dónde viene la redundancia (la sorpresa)</h3>
<p>Uno pensaría que el código repetido lo escribe un programador descuidado. A veces sí (recalcula algo por comodidad). Pero <b>la mayor parte de la redundancia la genera el propio compilador</b>. En lenguajes de alto nivel accedés a un arreglo o a un campo con <code>A[i][j]</code> o <code>X → f1</code>. Al compilar, <b>cada uno de esos accesos se expande</b> en un montón de operaciones aritméticas de bajo nivel: calcular la dirección del elemento (i, j)-ésimo, multiplicar el índice por el tamaño, sumar el desplazamiento. Y accesos distintos a la misma estructura <b>comparten</b> muchas de esas operaciones.</p>

<h3>La analogía del GPS</h3>
<p>Es como pedirle al GPS la ruta a un edificio y, dos cuadras después, volver a pedirle la ruta al <b>mismo</b> edificio: recalcula todo desde cero aunque el trayecto no cambió. El programador escribió <code>a[i]</code> dos veces sin pensar en la aritmética de direcciones que hay debajo; el compilador la generó dos veces. <b>El programador no puede eliminar esa redundancia</b> porque está <i>por debajo</i> del nivel del lenguaje fuente. Y está bien que sea así: desde la ingeniería de software, es <b>preferible</b> que accedas por nombre de alto nivel (más fácil de escribir y de mantener). Si el compilador elimina la redundancia, tenés <b>lo mejor de los dos mundos</b>: código eficiente y a la vez legible.</p>

<h3>Las cuatro transformaciones que preservan la semántica</h3>
<p>Aho las llama <b>transformaciones que preservan las funciones</b> (o la semántica). Son la base del capítulo:</p>
<ul>
<li><b>Eliminación de subexpresiones comunes</b> — no recalcular algo ya calculado (13.3).</li>
<li><b>Propagación de copias</b> — tras <code>x = y</code>, usar <code>y</code> en vez de <code>x</code> (13.3).</li>
<li><b>Eliminación de código muerto</b> — borrar lo que nunca se usa (13.4).</li>
<li><b>Cálculo previo de constantes</b> — resolver en compilación lo que ya es constante (esto es la reducción simple / constant folding de la cátedra, 13.8).</li>
</ul>

<h3>El caso de estudio: quicksort</h3>
<p>Aho usa un fragmento del <b>quicksort</b> como hilo conductor de todo el capítulo 9. Primero <b>descompone</b> las operaciones con direcciones en aritmética de tres direcciones (usando temporales <code>t1, t2, ...</code>) para <b>exponer</b> las redundancias, y arma el <b>grafo de flujo</b> (bloques básicos B1..B6). Verás aparecer una y otra vez <code>t2 = 4*i</code> y <code>t4 = 4*j</code>: multiplicaciones que el programador nunca pidió, pero que la traducción de <code>a[i]</code> y <code>a[j]</code> generó. Ese es el material sobre el que trabajan las lecciones 13.3 a 13.6.</p>

<div class="callout aho"><span class="lab">📘 lo que el compilador NO puede</span>
Aho es tajante: el compilador <b>no puede</b> mirar tu programa y decir «esto sería más rápido con otro algoritmo». No entiende tu intención de alto nivel. Solo dispone de dos armas: <b>identidades algebraicas</b> (<code>i+0=i</code>, <code>x*1=x</code>) y el principio de que <b>la misma operación sobre los mismos valores da el mismo resultado</b> (de ahí que pueda reutilizar cálculos). Todo lo que veas en este módulo es una consecuencia de esas dos ideas humildes.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La <b>mayor parte de la redundancia la genera el compilador</b>, no el programador: los accesos <code>A[i][j]</code> se expanden en aritmética de direcciones de bajo nivel que se repite.</li>
<li>Conviene acceder por <b>nombre de alto nivel</b> (legible, mantenible) y dejar que el compilador <b>elimine</b> la redundancia: lo mejor de los dos mundos.</li>
<li>El compilador solo aplica transformaciones de <b>bajo nivel</b> apoyadas en <b>identidades algebraicas</b> y en «misma operación + mismos valores = mismo resultado».</li>
<li>Cuatro transformaciones que <b>preservan la semántica</b>: subexpresiones comunes, propagación de copias, código muerto y cálculo previo de constantes.</li>
</ul>`,
    qa:[
      {q:"¿De dónde viene la mayor parte del código redundante que optimiza un compilador?",
       a:`<p>No del programador, sino del <b>propio compilador</b>. En un lenguaje de alto nivel accedés a datos con <code>A[i][j]</code> o <code>X → f1</code>; al compilar, cada acceso se <b>expande</b> en varias operaciones aritméticas de bajo nivel (calcular la dirección del elemento, multiplicar el índice por el tamaño, sumar el desplazamiento). Accesos repetidos a la misma estructura <b>comparten</b> muchas de esas operaciones, y el programador no puede evitarlas porque están por debajo del nivel del lenguaje. Por eso el compilador es el que tiene que detectarlas y eliminarlas.</p>`},
      {q:"¿Qué clase de transformaciones puede aplicar un compilador al optimizar, y en qué se apoya?",
       a:`<p>Solo transformaciones semánticas de <b>bajo nivel</b>, que preservan lo que el programa calcula. Se apoya en dos hechos generales: (1) <b>identidades algebraicas</b> como <code>i + 0 = i</code> o <code>x * 1 = x</code>; y (2) el principio de que <b>realizar la misma operación sobre los mismos valores produce el mismo resultado</b>, que le permite <b>reutilizar</b> un cálculo previo en lugar de repetirlo. Lo que <b>no</b> puede hacer es cambiar tu algoritmo por otro distinto: no comprende tu intención de alto nivel.</p>`},
      {q:"Nombrá las cuatro transformaciones que preservan la semántica según Aho.",
       a:`<p>(1) <b>Eliminación de subexpresiones comunes</b>: reutilizar un valor ya calculado en vez de recalcularlo. (2) <b>Propagación de copias</b>: después de una copia <code>x = y</code>, usar <code>y</code> en lugar de <code>x</code>. (3) <b>Eliminación de código muerto</b>: borrar instrucciones cuyo resultado nunca se usa. (4) <b>Cálculo previo de constantes</b>: deducir en compilación que una expresión es constante y usar esa constante (es la <b>reducción simple / constant folding</b> de la cátedra). Las cuatro mejoran el código <b>sin cambiar</b> la función que calcula.</p>`},
      {q:"Desde la ingeniería de software, ¿por qué conviene acceder por nombre de alto nivel aunque eso genere redundancia?",
       a:`<p>Porque los programas escritos con accesos de alto nivel (<code>a[i]</code>, <code>obj.campo</code>) son mucho más <b>fáciles de escribir, de entender y de mantener</b> que si el programador manejara a mano las direcciones. La redundancia de bajo nivel que esto genera <b>no es un problema</b>, porque el compilador la elimina al optimizar. Así se obtiene <b>lo mejor de los dos mundos</b>: código <b>legible y mantenible</b> en la fuente y código <b>eficiente</b> en el destino. Sacrificar legibilidad para «ayudar» al compilador sería un mal negocio.</p>`}
    ]
  },
  {
    id:"13.3", titulo:"Subexpresiones comunes y propagación de copias (la «redundancia»)", aho:"§9.1.4–9.1.5 · p.588", badges:["🎯","📘"], estado:"dictada",
    html:`
<p>Esta es la <b>optimización por redundancia</b> de la cátedra vista con lupa (🎯), apoyada en el detalle de Aho (📘). Dos transformaciones que van de la mano: <b>eliminar subexpresiones comunes</b> y <b>propagar copias</b>.</p>

<h3>Subexpresión común: no recalcular lo ya calculado</h3>
<p>Una ocurrencia de una expresión <code>E</code> es una <b>subexpresión común</b> si <code>E</code> <b>ya se calculó antes</b> y los <b>valores de las variables de E no cambiaron</b> desde ese cálculo. En ese caso, en vez de volver a evaluar <code>E</code>, reusás el valor guardado. La condición es exactamente la de 13.2: «misma operación sobre los mismos valores = mismo resultado».</p>

<h3>La analogía del anotador</h3>
<p>Estás resolviendo un problema largo y en el paso 3 calculaste <code>4 × i = 20</code>. En el paso 9 vuelve a aparecer <code>4 × i</code>. Si <b>nadie tocó</b> <code>i</code> en el medio, no rehacés la cuenta: mirás el anotador y escribís 20. Pero si en el paso 6 hiciste <code>i = i + 1</code>, el anotador <b>ya no sirve</b>: <code>4 × i</code> vale otra cosa y hay que recalcular. Esa es toda la lógica de la redundancia.</p>

<h3>El ejemplo de Aho (quicksort)</h3>
<p>En el bloque B5, el código recalcula <code>4*i</code> y <code>4*j</code> aunque el programador nunca los pidió:</p>
<pre><code>ANTES (B5):              DESPUÉS:
t6 = 4*i                 t6 = 4*i
x  = a[t6]               x  = a[t6]
t7 = 4*i    &lt;-- igual    t8 = 4*j
t8 = 4*j                 t9 = a[t8]
t9 = a[t8]               a[t6] = t9
a[t7] = t9               a[t8] = x
t10 = 4*j   &lt;-- igual    goto B2
a[t10] = x
goto B2</code></pre>
<p><code>t7 = 4*i</code> es una subexpresión común de <code>t6</code>: se elimina y se usa <code>t6</code>. <code>t10 = 4*j</code> es común con <code>t8</code>: se usa <code>t8</code>. Cuando el reúso cruza <b>de un bloque a otro</b> (por ejemplo tomar el <code>t4 = 4*j</code> que se calculó en B3 y usarlo en B5), Aho lo llama <b>subexpresión común global</b>.</p>

<div class="callout tgt"><span class="lab">🎯 la redundancia de la cátedra</span>
El ejemplo canónico: <code>z := a*b + c + a*b*d</code>. Ahí <code>a*b</code> aparece <b>dos veces</b>. Se puede optimizar calculando <code>a*b</code> <b>una sola vez</b> y reutilizándolo: no hace falta hacer <b>dos veces la misma multiplicación en tiempo de ejecución</b>. Es «similar al cálculo del factor común». La cátedra la implementa <b>sobre tercetos</b> (lección 13.9), no sobre polaca ni árbol.</div>

<h3>El caso borde de los arreglos (por qué NO siempre es común)</h3>
<p>Cuidado: <code>a[t1]</code> calculada en B1 <b>no</b> es subexpresión común con <code>a[t1]</code> en B6, aunque <code>t1</code> sea el mismo. ¿Por qué? Porque entre B1 y B6 el control puede pasar por B5, donde <b>hay asignaciones a elementos de <code>a</code></b>. Si el arreglo cambió, <code>a[t1]</code> ya no vale lo mismo. <b>No basta con que el índice no cambie</b>: para reusar <code>a[i]</code> tampoco tiene que haberse modificado el <b>contenido</b> del arreglo en el medio. La redundancia exige que <b>nada</b> de lo que interviene haya cambiado.</p>

<h3>Propagación de copias</h3>
<p>Una <b>copia</b> es una instrucción de la forma <code>u = v</code> (asignar una variable a otra, sin operación). La <b>propagación de copias</b> consiste en usar <code>v</code> en lugar de <code>u</code> siempre que se pueda después de esa copia. Ejemplo: si tenés <code>x = t3</code> y más abajo <code>a[t4] = x</code>, lo reescribís como <code>a[t4] = t3</code>.</p>
<pre><code>x = t3            x = t3          (queda huérfana)
a[t2] = t5   -->  a[t2] = t5
a[t4] = x         a[t4] = t3</code></pre>
<p>A primera vista no parece una mejora (¡seguís teniendo la copia!). Pero es un <b>habilitador</b>: al reemplazar <code>x</code> por <code>t3</code> en todos sus usos, la asignación <code>x = t3</code> queda sin lectores y se vuelve <b>código muerto</b>, que la próxima optimización elimina (13.4). Por eso van juntas: <b>propagación de copias + eliminación de código muerto</b> borran la copia por completo.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>🎯 <b>Subexpresión común</b>: expresión ya calculada cuyos operandos <b>no cambiaron</b>. Se reusa el valor en vez de recalcular. Es la <b>redundancia</b> (<code>a*b + c + a*b*d</code> → calcular <code>a*b</code> una vez).</li>
<li><b>Global</b> cuando el reúso cruza de un bloque a otro (Aho); <b>local</b> dentro de un bloque.</li>
<li>Caso borde de arreglos: <code>a[i]</code> solo es reusable si <b>ni el índice ni el contenido del arreglo</b> cambiaron en el medio.</li>
<li><b>Propagación de copias</b>: tras <code>u = v</code>, usar <code>v</code> por <code>u</code>. No mejora sola, pero <b>habilita</b> la eliminación de código muerto (borra la copia).</li>
</ul>`,
    qa:[
      {q:"¿Qué es una subexpresión común y qué condición debe cumplirse para reutilizarla?",
       a:`<p>Es una expresión (por ejemplo <code>a*b</code> o <code>4*i</code>) que <b>ya se calculó antes</b> en el programa. Se puede <b>reutilizar</b> su valor —en vez de recalcularla— siempre que los <b>valores de sus variables no hayan cambiado</b> entre el cálculo anterior y el nuevo uso. Si alguna se reasignó en el medio (por ejemplo un <code>i = i+1</code>), deja de ser la misma subexpresión y hay que recalcular. Reutilizar ahorra <b>tiempo de ejecución</b> sin alterar el resultado, porque «la misma operación sobre los mismos valores da el mismo resultado».</p>`},
      {q:"La cátedra da z := a*b + c + a*b*d. ¿Cómo se optimiza por redundancia y dónde se implementa?",
       a:`<p>La subexpresión <code>a*b</code> aparece <b>dos veces</b>. Se calcula <b>una sola vez</b> y se reutiliza su valor en ambos lugares, evitando hacer <b>dos veces la misma multiplicación</b> en tiempo de ejecución (es análogo a sacar factor común). La cátedra remarca que esta optimización se implementa <b>bien sobre tercetos</b> —buscando dos tercetos iguales y redirigiendo referencias (lección 13.9)— y que resulta <b>dificultosa en polaca inversa y en árbol binario</b>. La condición es que las variables <code>a</code> y <code>b</code> no cambien de valor entre los dos usos.</p>`},
      {q:"¿Por qué a[t1] en el bloque B1 no siempre puede tratarse como subexpresión común en B6, aunque t1 sea el mismo?",
       a:`<p>Porque entre B1 y B6 el control puede pasar por un bloque (B5) que contiene <b>asignaciones a elementos del arreglo <code>a</code></b>. Aunque el índice <code>t1</code> no cambie, el <b>contenido</b> de <code>a</code> pudo modificarse, así que <code>a[t1]</code> quizá ya no vale lo mismo al llegar a B6. Es el caso borde clave: para reutilizar un acceso a arreglo <code>a[i]</code> no alcanza con que <b>el índice</b> no cambie; tampoco debe haberse tocado <b>el arreglo</b> en el camino. Si no se puede garantizar, no es seguro tratarlo como subexpresión común.</p>`},
      {q:"¿Qué es la propagación de copias y por qué se dice que no mejora por sí sola pero es útil?",
       a:`<p>Una <b>copia</b> es una instrucción <code>u = v</code> (asignar una variable a otra). La <b>propagación de copias</b> reemplaza los usos de <code>u</code> por <code>v</code> después de esa copia (por ejemplo, <code>a[t4] = x</code> pasa a <code>a[t4] = t3</code> si antes había <code>x = t3</code>). Por sí sola no reduce instrucciones —la copia sigue ahí—, pero es un <b>habilitador</b>: al quitarle todos los lectores a <code>u</code>, la copia <code>u = v</code> se convierte en <b>código muerto</b> y la eliminación de código muerto (13.4) la borra. Por eso las dos optimizaciones se aplican encadenadas.</p>`}
    ]
  },
  {
    id:"13.4", titulo:"Eliminación de código muerto (DCE)", aho:"§9.1.6 · p.591", badges:["🎯"], estado:"dictada",
    html:`
<p><b>Eliminación de código muerto</b> (DCE, <i>Dead Code Elimination</i>) es borrar instrucciones que <b>no aportan nada</b> al resultado del programa. Para definirla bien primero hay que entender qué significa que una variable esté <b>viva</b> o <b>muerta</b>.</p>

<h3>Variable viva vs. muerta</h3>
<p>Una variable está <b>viva</b> en un punto del programa si su valor <b>puede usarse más adelante</b>. Está <b>muerta</b> si no. El <b>código muerto</b> (o inútil) son las instrucciones que <b>calculan valores que nunca se usan</b>: le asignás algo a una variable muerta.</p>

<h3>Las dos formas de estar muerto</h3>
<ul>
<li><b>Nunca se ejecuta</b> (código inalcanzable): un fragmento al que el flujo del programa jamás llega.</li>
<li><b>Se ejecuta pero su resultado nunca se usa</b>: la instrucción corre, produce un valor, y ese valor no lo lee nadie antes de que se pise o se descarte.</li>
</ul>

<h3>La analogía del ingrediente que no va</h3>
<p>Imaginá que picás y salteás una cebolla, la ponés en un bol… y ese bol nunca entra a la receta final. Trabajaste al pedo. Eso es código muerto del segundo tipo: la operación se hizo, pero el resultado no se usa. El primer tipo es una <b>página de la receta que nadie va a leer</b> porque está después de un «FIN»: es inalcanzable. En ambos casos, tirarla a la basura <b>no cambia el plato</b>.</p>

<h3>Ejemplo simple</h3>
<pre><code>x = 5;      &lt;-- muerta: se pisa antes de leerse
x = 8;
usar(x);</code></pre>
<p>Si entre <code>x = 5</code> y <code>x = 8</code> nadie lee <code>x</code>, la primera asignación es <b>código muerto</b>: se elimina sin efecto sobre la semántica. <code>x</code> estaba <b>muerta</b> en el punto donde se le asignó 5, porque ese valor nunca se usa.</p>

<h3>El ejemplo de Aho: la variable debug</h3>
<p>Es raro que un programador escriba código muerto <b>a propósito</b>; suele <b>aparecer como consecuencia de otras optimizaciones</b>. Aho lo ilustra con:</p>
<pre><code>debug = FALSE
...
if (debug) print ...</code></pre>
<p>Si el compilador deduce que <code>debug</code> siempre vale <code>FALSE</code> al llegar al <code>if</code> (mediante <b>propagación de constantes</b>), sustituye <code>debug</code> por <code>FALSE</code>; entonces la condición nunca se cumple y el <code>print</code> queda <b>inalcanzable</b> → se elimina, junto con la evaluación. Este «deducir en compilación que una expresión es constante y aprovecharla» es el <b>cálculo previo de constantes</b>.</p>

<div class="callout tgt"><span class="lab">🎯 cómo lo pide la cátedra</span>
En el apunte, el DCE se define con dos viñetas casi textuales: «fragmentos de código que <b>nunca son ejecutados</b>» y «si se ejecutan, su <b>producción nunca se utiliza</b>». El compilador puede <b>descartar</b> esa instrucción. Y ojo con el encadenamiento: la <b>propagación de copias</b> (13.3) a menudo <b>convierte una copia en código muerto</b>, así que DCE se corre <i>después</i> para barrer lo que quedó. Es un ejemplo concreto de <b>enhebrado</b> (13.10).</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Una variable está <b>viva</b> si su valor puede usarse después; <b>muerta</b> si no.</li>
<li>🎯 <b>Código muerto</b> = instrucciones que (a) <b>nunca se ejecutan</b> o (b) <b>su resultado no se usa</b>. Se eliminan sin afectar la semántica.</li>
<li>Casi nunca lo escribe el programador: <b>aparece por otras optimizaciones</b> (típicamente después de propagar copias o constantes).</li>
<li>Ejemplo de Aho: si <code>debug</code> es constante <code>FALSE</code>, el <code>if (debug) print</code> se vuelve inalcanzable y se borra (cálculo previo de constantes + DCE).</li>
</ul>`,
    qa:[
      {q:"¿Qué diferencia hay entre una variable viva y una muerta?",
       a:`<p>Una variable está <b>viva</b> en un punto del programa si su <b>valor puede utilizarse más adelante</b> (hay algún camino de ejecución donde se lee antes de reasignarse). Está <b>muerta</b> si su valor <b>no se va a usar</b> más. La distinción es clave para el DCE: si en el punto donde le asignás un valor la variable ya está muerta, esa asignación es <b>código muerto</b> y se puede borrar. Ejemplo: en <code>x=5; x=8; usar(x);</code>, <code>x</code> está muerta en la línea <code>x=5</code> porque ese 5 nunca se lee.</p>`},
      {q:"¿Qué es el código muerto y cuáles son sus dos formas?",
       a:`<p>Es un conjunto de instrucciones que <b>no aportan al resultado</b> del programa. Dos formas: (1) <b>código inalcanzable</b> —fragmentos que <b>nunca se ejecutan</b> porque el flujo jamás llega a ellos—; y (2) <b>código inútil</b> —instrucciones que <b>se ejecutan pero cuyo resultado nunca se usa</b>—. En ambos casos se pueden <b>eliminar sin cambiar la semántica</b>. Ejemplo del segundo tipo: <code>x = 5; x = 8;</code> donde nadie lee <code>x</code> entre las dos: la primera asignación es código muerto.</p>`},
      {q:"¿Por qué se dice que el código muerto suele aparecer por otras optimizaciones y no por el programador?",
       a:`<p>Porque es <b>poco probable</b> que alguien escriba a propósito una instrucción cuyo resultado nunca use. En cambio, aparece de forma <b>natural como subproducto</b> de otras transformaciones. El caso típico: la <b>propagación de copias</b> (13.3) reemplaza los usos de <code>u</code> por <code>v</code>; entonces la copia <code>u = v</code> queda sin lectores y se convierte en código muerto. Por eso el DCE se aplica <b>después</b>, para barrer lo que las otras optimizaciones dejaron inservible. Es un caso claro de <b>enhebrado</b>: una optimización habilita a la siguiente.</p>`},
      {q:"Explicá el ejemplo de la variable debug de Aho.",
       a:`<p>Hay código <code>debug = FALSE</code> y más adelante <code>if (debug) print ...</code>. Si el compilador logra deducir (por <b>propagación de constantes</b>) que al llegar al <code>if</code> el valor de <code>debug</code> es siempre <code>FALSE</code>, reemplaza <code>debug</code> por <code>FALSE</code>. Entonces la condición <b>nunca</b> se cumple y el bloque del <code>print</code> se vuelve <b>inalcanzable</b>: se puede <b>eliminar</b> tanto la evaluación de la condición como la impresión. Ese razonamiento de «deducir en tiempo de compilación que una expresión es constante y aprovecharla» es el <b>cálculo previo de constantes</b>, que habilita el DCE.</p>`}
    ]
  },
  {
    id:"13.5", titulo:"Movimiento de código: sacar el invariante del bucle", aho:"§9.1.7 · p.592", badges:["🎯"], estado:"dictada",
    html:`
<p>Los <b>bucles</b> —sobre todo los <b>internos</b>— son donde el programa pasa la <b>mayor parte de su tiempo</b>. Por eso reducir aunque sea <b>una</b> instrucción dentro de un ciclo interno vale muchísimo, <b>incluso si eso agrega código afuera</b>. Esa es la idea del <b>movimiento de código</b>.</p>

<h3>Código invariante de ciclo</h3>
<p>Un cálculo es <b>invariante de ciclo</b> si produce <b>el mismo resultado sin importar cuántas veces</b> se ejecute el bucle: sus operandos no cambian entre iteraciones. El <b>movimiento de código</b> toma esa expresión y la <b>evalúa una sola vez, antes del bucle</b>, en lugar de recalcularla en cada vuelta.</p>

<h3>La analogía de la caja pesada</h3>
<p>Entrás y salís de una habitación 100 veces y cada vez cargás una caja pesada de un lado a otro, aunque la caja <b>siempre</b> termina en el mismo lugar. Lo lógico es dejarla <b>junto a la puerta una sola vez</b> antes de empezar. La caja es el cálculo invariante; «junto a la puerta» es el bloque de <b>entrada</b> al bucle. Hacés el esfuerzo <b>una vez</b> en lugar de 100.</p>

<h3>El ejemplo de Aho</h3>
<pre><code>ANTES:
while (i &lt;= limite-2)   // el cuerpo no cambia limite
   ...

DESPUÉS (movimiento de código):
t = limite-2
while (i &lt;= t)          // el cuerpo no cambia limite ni t
   ...</code></pre>
<p><code>limite-2</code> no depende de la iteración: es invariante. Si el bucle da <b>n</b> vueltas, antes se calculaba <code>limite-2</code> unas <b>n+1</b> veces; ahora se calcula <b>una sola</b>, antes de entrar. Fijate el detalle: para «sacar antes del bucle» hace falta que exista un <b>bloque de entrada</b> (un lugar único al que llegan todos los saltos que entran al ciclo) donde depositar el cálculo.</p>

<div class="callout tgt"><span class="lab">🎯 cómo lo dice la cátedra</span>
«Optimización de bucles: se <b>quitan las operaciones fuera de un bucle</b>» (el código invariante). Y un matiz que suele preguntarse: lo que sacaste <b>podría quedar dentro de otro bucle más externo</b>. Entonces el proceso se <b>repite</b>: volvés a mirar si ese cálculo es invariante respecto del bucle de afuera y lo seguís empujando hacia afuera, «siempre y cuando saquemos código invariante».</p></div>

<h3>El caso borde: no todo lo que parece invariante lo es</h3>
<p>Ojo: para mover un cálculo hay que estar <b>seguro</b> de que sus operandos no se modifican <b>en ninguna</b> iteración. Si dentro del cuerpo hubiera un <code>limite = limite - 1</code>, entonces <code>limite-2</code> <b>cambia</b> cada vuelta y <b>no</b> es invariante: sacarlo rompería la semántica. Por eso Aho aclara «instrucción que no cambia el límite». La invarianza es una <b>condición a verificar</b>, no una suposición.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>🎯 <b>Movimiento de código</b>: sacar del bucle un cálculo <b>invariante</b> (mismo resultado en cada iteración) y evaluarlo <b>una vez, antes</b> del ciclo.</li>
<li>Se justifica porque el programa vive en los <b>bucles internos</b>: sacar una instrucción de adentro compensa aunque agregue código afuera.</li>
<li>Requiere un <b>bloque de entrada</b> al bucle donde colocar el cálculo movido.</li>
<li>Puede quedar dentro de un <b>bucle más externo</b> → el proceso se <b>repite</b> hacia afuera. Y siempre hay que <b>verificar</b> que los operandos no cambian.</li>
</ul>`,
    qa:[
      {q:"¿Qué es un cálculo invariante de ciclo y qué se hace con él?",
       a:`<p>Es un cálculo dentro de un bucle cuyo <b>resultado no cambia entre iteraciones</b>, porque sus operandos no se modifican en el cuerpo (por ejemplo <code>limite-2</code> si <code>limite</code> no cambia). Con él se hace <b>movimiento de código</b>: se lo <b>saca fuera del bucle</b> y se lo evalúa <b>una sola vez, antes</b> de entrar, en lugar de recalcularlo en cada vuelta. Si el bucle itera <code>n</code> veces, se pasa de unas <code>n+1</code> evaluaciones a <b>una</b>, sin alterar el resultado.</p>`},
      {q:"¿Por qué conviene el movimiento de código aunque agregue instrucciones fuera del bucle?",
       a:`<p>Porque los programas invierten <b>la mayor parte de su tiempo</b> en los <b>bucles internos</b>. Una instrucción dentro de un ciclo que da un millón de vueltas se ejecuta un millón de veces; la misma instrucción <b>afuera</b> se ejecuta una sola. Por eso <b>reducir instrucciones dentro del ciclo</b> es muy rentable, <b>aunque</b> eso implique sumar alguna instrucción en el bloque de entrada, que corre una única vez. El tiempo total baja porque lo que importa es cuántas veces se ejecuta cada instrucción, no cuántas instrucciones hay en el texto.</p>`},
      {q:"En el ejemplo while (i <= limite-2), ¿qué se optimiza y cómo queda?",
       a:`<p><code>limite-2</code> es <b>invariante</b> (el cuerpo no modifica <code>limite</code>), así que se saca del bucle: <code>t = limite-2</code> antes del <code>while</code>, y el ciclo pasa a ser <code>while (i &lt;= t)</code>. Antes, con <code>n</code> iteraciones, <code>limite-2</code> se calculaba <b>n+1</b> veces; ahora se calcula <b>una sola vez</b> antes de entrar. Requiere que exista un <b>bloque de entrada</b> al ciclo (un punto único por donde se entra) donde colocar la asignación de <code>t</code>. El resultado del bucle es idéntico.</p>`},
      {q:"¿Qué pasa si el cálculo que sacaste del bucle sigue estando dentro de otro bucle más externo?",
       a:`<p>El <b>proceso se repite</b>. Cuando movés un invariante fuera del bucle interno, puede caer todavía dentro de un <b>bucle más externo</b>; si respecto de ese bucle externo también es invariante, se lo <b>vuelve a sacar</b>, empujándolo hacia afuera. La cátedra lo enuncia como que la optimización de bucles «podría repetirse siempre y cuando saquemos código invariante». Eso sí: en cada paso hay que <b>verificar</b> que los operandos no cambian en ese nivel de bucle; si cambian, el cálculo ya no es invariante y no se puede mover.</p>`}
    ]
  },
  {
    id:"13.6", titulo:"Variables de inducción y reducción por fuerza", aho:"§9.1.8 · p.592", badges:["📘"], estado:"dictada",
    html:`
<p>Lección <b>📘 de Aho</b>: es la maquinaria fina detrás de la «optimización de bucles». La cátedra no la detalla, pero explica <i>cómo</i> se abaratan de verdad los ciclos. Dos conceptos que van juntos: <b>variables de inducción</b> y <b>reducción por fuerza</b>.</p>

<h3>Variable de inducción</h3>
<p>Una variable <code>x</code> es una <b>variable de inducción</b> si existe una <b>constante c</b> (positiva o negativa) tal que <b>cada vez que se le asigna</b>, su valor <b>aumenta en c</b>. Es una variable que «avanza a paso fijo» con el bucle. El caso más típico es el <b>índice</b>: <code>i</code> que hace <code>i = i + 1</code> en cada vuelta. Estas variables se pueden calcular con <b>un solo incremento (suma o resta) por iteración</b>.</p>

<h3>Reducción por fuerza: cambiar una operación cara por una barata</h3>
<p>La <b>reducción por fuerza</b> (<i>strength reduction</i>) sustituye una operación <b>costosa</b> por una <b>más económica</b> equivalente. La estrella: reemplazar una <b>multiplicación</b> ligada al índice por una <b>suma</b> incremental.</p>

<h3>La analogía de las escaleras</h3>
<p>Estás subiendo una escalera y en cada escalón querés saber «altura = 4 × número de escalón». Podés <b>multiplicar</b> cada vez (4×1, 4×2, 4×3…) o, mucho más barato, llevar un <b>acumulador</b> y <b>sumarle 4</b> en cada escalón. El resultado es idéntico, pero la suma es más barata que la multiplicación en casi todas las máquinas. Eso es reducción por fuerza sobre una variable de inducción.</p>

<h3>El ejemplo de Aho (quicksort)</h3>
<p>En el bucle de B3, <code>j</code> se decrementa de a 1 y se usa <code>t4 = 4*j</code>. Como <code>t4</code> siempre vale <code>4*j</code> y <code>j</code> baja de a 1, entonces <code>t4</code> baja de a 4:</p>
<pre><code>ANTES (en B3):          DESPUÉS (reducción por fuerza):
j  = j-1                j  = j-1
t4 = 4*j    (multipl.)  t4 = t4-4   (resta)
t5 = a[t4]              t5 = a[t4]

+ inicializar t4 = 4*j UNA vez, antes del bucle</code></pre>
<p>La multiplicación <code>4*j</code> en cada iteración se convierte en una <b>resta</b> <code>t4 = t4-4</code>. Hay que <b>inicializar</b> <code>t4</code> antes de entrar (para que tenga valor la primera vez): se agrega una instrucción que corre <b>una sola vez</b>, a cambio de abaratar <b>todas</b> las iteraciones.</p>

<h3>Eliminar variables de inducción</h3>
<p>Cuando en un ciclo hay <b>dos o más</b> variables de inducción «en paso bloqueado» (que avanzan juntas, como <code>i</code> con <code>t2=4*i</code> y <code>j</code> con <code>t4=4*j</code>), a menudo se puede <b>eliminar todas menos una</b>. Ejemplo: la prueba <code>if i &gt;= j</code> se puede reescribir como <code>if t2 &gt;= t4</code> (porque <code>t2=4*i</code> y <code>t4=4*j</code> conservan el orden). Al hacerlo, <code>i</code> y <code>j</code> dejan de usarse → se vuelven <b>muertas</b> → sus asignaciones se borran por <b>DCE</b> (13.4). Se conviene trabajar los ciclos de <b>adentro hacia afuera</b>.</p>

<div class="callout aho"><span class="lab">📘 por qué la resta y no la multiplicación</span>
La ganancia depende de la máquina: la reducción por fuerza rinde <b>si la multiplicación es más cara que la suma o la resta</b>, como ocurre en la mayoría de los procesadores. Es una optimización <b>importantísima</b> para lenguajes de uso común, porque los accesos a arreglos (que generan esas multiplicaciones de índice) están por todas partes. No la toma la cátedra, pero es el «cómo» concreto de abaratar un bucle.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Variable de inducción</b>: en cada asignación aumenta en una <b>constante fija c</b> (típicamente el índice, <code>i=i+1</code>). Se calcula con un solo incremento por iteración.</li>
<li>📘 <b>Reducción por fuerza</b>: cambiar una operación <b>cara</b> (multiplicación) por otra <b>barata</b> (suma/resta): <code>t4 = 4*j</code> pasa a <code>t4 = t4-4</code>, inicializando <code>t4</code> antes del bucle.</li>
<li>Con varias variables de inducción se pueden <b>eliminar todas menos una</b> (reescribir la prueba <code>i&gt;=j</code> como <code>t2&gt;=t4</code>); las que quedan sin uso mueren y las barre el <b>DCE</b>.</li>
<li>Los ciclos se optimizan de <b>adentro hacia afuera</b>, y la ganancia real depende de que la multiplicación sea más cara que la suma en la máquina.</li>
</ul>`,
    qa:[
      {q:"¿Qué es una variable de inducción?",
       a:`<p>Es una variable <code>x</code> para la que existe una <b>constante c</b> (positiva o negativa) tal que <b>cada vez que se le asigna un valor, éste aumenta en c</b>. Es decir, avanza a <b>paso fijo</b> con el bucle. El ejemplo más común es el <b>índice</b> de un ciclo (<code>i = i + 1</code>, con c=1), pero también lo son las temporales ligadas a él, como <code>t2 = 4*i</code>, que avanza de a 4. Su ventaja: pueden actualizarse con <b>un solo incremento (suma o resta) por iteración</b>, lo que habilita la reducción por fuerza.</p>`},
      {q:"¿Qué es la reducción por fuerza (strength reduction)? Dá un ejemplo.",
       a:`<p>Es sustituir una operación <b>costosa</b> por una <b>equivalente más barata</b>, típicamente una <b>multiplicación</b> ligada al índice por una <b>suma o resta</b> incremental. Ejemplo de Aho: en un bucle donde <code>j</code> baja de a 1 y se usa <code>t4 = 4*j</code>, como <code>t4</code> siempre vale <code>4*j</code>, se reemplaza la multiplicación por <code>t4 = t4-4</code> (una resta), inicializando <code>t4 = 4*j</code> <b>una vez</b> antes del bucle. Se agrega una instrucción que corre una sola vez a cambio de abaratar <b>todas</b> las iteraciones, lo que conviene siempre que la multiplicación sea más cara que la resta.</p>`},
      {q:"¿Cómo se eliminan variables de inducción cuando hay más de una en el ciclo?",
       a:`<p>Cuando dos variables de inducción avanzan «en paso bloqueado» (juntas), como <code>i</code> con <code>t2=4*i</code> y <code>j</code> con <code>t4=4*j</code>, se puede <b>eliminar todas menos una</b>. La clave es reescribir los <b>usos</b> en términos de la que se conserva: la prueba <code>if i &gt;= j</code> se cambia por <code>if t2 &gt;= t4</code>, porque <code>t2</code> y <code>t4</code> mantienen el mismo orden que <code>i</code> y <code>j</code>. Tras esa sustitución, <code>i</code> y <code>j</code> ya no se usan: quedan <b>muertas</b> y sus asignaciones se eliminan por <b>DCE</b>. Así el bucle queda con menos operaciones por iteración.</p>`},
      {q:"¿Por qué conviene procesar los ciclos de adentro hacia afuera?",
       a:`<p>Porque los <b>ciclos internos</b> son los que más se ejecutan, así que optimizarlos primero da la mayor ganancia; y porque las transformaciones del ciclo interno (reducción por fuerza, eliminación de variables de inducción) <b>cambian</b> qué variables quedan vivas y qué cálculos son invariantes en el ciclo <b>externo</b>. Trabajando «de adentro hacia afuera» se llega al bucle circundante ya con la información actualizada, y ahí se pueden eliminar variables que en el interior todavía se usaban. Es también coherente con el <b>enhebrado</b>: cada paso habilita el siguiente.</p>`}
    ]
  },
  {
    id:"13.7", titulo:"Propagación de constantes", aho:"§9.4 · p.632", badges:["🎯"], estado:"dictada",
    html:`
<p><b>Propagación de constantes</b> (<i>constant propagation</i>): si a una variable se le asignó un <b>valor constante</b> y ese valor <b>no se altera</b>, se <b>reemplaza la variable por su valor</b> en las instrucciones posteriores, todo <b>durante la compilación</b>.</p>

<h3>La analogía del apodo</h3>
<p>Si en una charla decís «llamemos <b>N</b> a 100» y después usás <code>N</code> por todos lados, y <b>nadie</b> redefine <code>N</code>, entonces cada vez que aparece <code>N</code> podés escribir directamente <b>100</b>. Reemplazás el apodo por el valor real. Pero si en el medio alguien dijo «ahora <code>N</code> es otra cosa» o <code>N</code> depende de un dato que se lee por teclado, ya <b>no</b> podés: perdiste la certeza de que vale 100.</p>

<h3>Qué es y qué la condiciona</h3>
<p>Ejemplo: <code>pi = 3.14; ... area = pi * r * r;</code>. Como <code>pi</code> es constante y no cambia, se propaga: <code>area = 3.14 * r * r</code>. La <b>condición</b> es exactamente la del apunte: el valor de la variable <b>no debe ser alterado en el medio</b> entre la asignación y el uso. Si hay una reasignación intermedia, no se puede propagar.</p>

<h3>Diferencia con la reducción simple (no las confundas)</h3>
<p>Son parientes pero distintas:</p>
<ul>
<li><b>Propagación de constantes</b>: reemplaza una <b>variable</b> por su <b>valor constante</b> (<code>pi</code> → <code>3.14</code>).</li>
<li><b>Reducción simple / constant folding</b> (13.8): resuelve una <b>operación entre constantes</b> (<code>3.14 * 2</code> → <code>6.28</code>).</li>
</ul>
<p>Trabajan encadenadas: primero <b>propagás</b> (dejás las constantes a la vista) y después <b>plegás</b> (resolvés las cuentas entre ellas). Es otro caso de <b>enhebrado</b>.</p>

<div class="callout aho"><span class="lab">📘 cómo lo formaliza Aho: NAC y UNDEF</span>
Aho modela la propagación como un <b>problema de flujo de datos hacia adelante</b> (13.12), donde cada variable, en cada punto, toma un valor de un <b>semi-retículo</b> con tres capas: una <b>constante</b> concreta, <b>UNDEF</b> («indefinido»: todavía no vi ninguna definición, no sé nada) arriba, y <b>NAC</b> («<i>Not A Constant</i>»: sé que <b>no</b> es constante) abajo. Una variable cae en <b>NAC</b> si recibió un valor de entrada, si deriva de otra que no es constante, o si le llegaron <b>distintas constantes por distintos caminos</b>. Regla clave del punto de encuentro: dos constantes <b>distintas</b> se combinan en NAC (<code>c1 ∧ c2 = NAC</code>).</div>

<div class="callout aho"><span class="lab">📘 por qué NO es distributivo (el ejemplo de las 5)</span>
Caso famoso de Aho: en un camino <code>x=2, y=3</code>; en otro camino <code>x=3, y=2</code>; después ambos caminos se juntan y hacen <code>z = x+y</code>. Vos «sabés» que <code>z</code> vale <b>5 siempre</b> (2+3 o 3+2). Pero el algoritmo iterativo <b>no lo descubre</b>: al unir los caminos, ve que <code>x</code> puede ser 2 o 3 → <code>x = NAC</code>, y lo mismo <code>y = NAC</code>; y <code>NAC + NAC = NAC</code>, así que concluye <code>z = NAC</code>. El resultado es <b>seguro pero impreciso</b>: no pierde correctitud (nunca optimiza de más), solo se pierde una oportunidad, porque no rastrea la <b>correlación</b> entre <code>x</code> e <code>y</code>. Eso es que el marco <b>no es distributivo</b>.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>🎯 <b>Propagación de constantes</b>: reemplazar una <b>variable</b> por su <b>valor constante</b> en los usos posteriores, en compilación.</li>
<li>La <b>condición</b>: que el valor <b>no se altere en el medio</b> (sin reasignaciones entre la asignación y el uso).</li>
<li>No confundir con <b>reducción simple</b>: propagar reemplaza variable→valor; plegar resuelve constante∘constante. Van encadenadas.</li>
<li>📘 Aho: valores <b>UNDEF</b> (no sé nada) y <b>NAC</b> (no es constante); dos constantes distintas por caminos distintos dan <b>NAC</b>. El marco es <b>seguro pero no distributivo</b> (el ejemplo <code>z=x+y</code> que da 5 pero el algoritmo marca NAC).</li>
</ul>`,
    qa:[
      {q:"¿En qué consiste la propagación de constantes y qué condición requiere?",
       a:`<p>Consiste en <b>reemplazar una variable por su valor constante</b> en las instrucciones que la usan más adelante, cuando a esa variable se le asignó una constante. Todo ocurre <b>en tiempo de compilación</b>. Ejemplo: si <code>pi = 3.14</code> y luego <code>area = pi*r*r</code>, se propaga a <code>area = 3.14*r*r</code>. La <b>condición</b> imprescindible es que el valor de la variable <b>no sea alterado en el medio</b>: si entre la asignación de la constante y su uso hay una reasignación (o depende de un dato leído), ya no se puede propagar porque se perdió la certeza del valor.</p>`},
      {q:"¿Qué diferencia hay entre propagación de constantes y reducción simple (constant folding)?",
       a:`<p>La <b>propagación de constantes</b> reemplaza una <b>variable</b> por su <b>valor</b> constante (<code>pi</code> → <code>3.14</code>). La <b>reducción simple / constant folding</b> resuelve una <b>operación entre constantes</b> (<code>3.14 * 2</code> → <code>6.28</code>). Son complementarias y se aplican <b>encadenadas</b>: primero se propagan las constantes (para que queden a la vista) y después se pliegan las operaciones entre ellas. Confundirlas es un error típico: una sustituye nombres por valores; la otra ejecuta cuentas en compilación.</p>`},
      {q:"📘 En el marco de Aho, ¿qué significan UNDEF y NAC?",
       a:`<p>Son los dos valores especiales del semi-retículo con que Aho modela cada variable en cada punto. <b>UNDEF</b> («indefinido») es el elemento de <b>arriba</b>: significa «todavía no vi ninguna definición de la variable, no puedo afirmar nada». <b>NAC</b> («<i>Not A Constant</i>») es el de <b>abajo</b>: significa «sé con certeza que <b>no</b> es constante». Son <b>opuestos</b>: UNDEF es «demasiado poca información», NAC es «demasiada» (vi muchas formas de definirla). Una variable cae en NAC si recibió entrada del usuario, si deriva de una no-constante, o si le llegan <b>constantes distintas por caminos distintos</b> (<code>c1 ∧ c2 = NAC</code>).</p>`},
      {q:"📘 En z = x+y, si por un camino x=2,y=3 y por otro x=3,y=2, z siempre vale 5. ¿Por qué el algoritmo no lo detecta?",
       a:`<p>Porque el análisis, al <b>unir</b> los dos caminos antes de <code>z=x+y</code>, evalúa cada variable por separado: <code>x</code> llegó como 2 y como 3 → distintas constantes → <code>x = NAC</code>; ídem <code>y = NAC</code>. Y como <code>NAC + NAC = NAC</code>, concluye <code>z = NAC</code>, aunque de hecho siempre da 5. El motivo es que el algoritmo <b>no rastrea la correlación</b> entre <code>x</code> e <code>y</code> (que cuando una es 2 la otra es 3). El resultado es <b>seguro</b> (nunca optimiza de más, no rompe nada) pero <b>impreciso</b> (se pierde la oportunidad). Formalmente, esto muestra que el marco de propagación de constantes <b>no es distributivo</b>.</p>`}
    ]
  },
  {
    id:"13.8", titulo:"Reducción simple (constant folding) y los tres momentos", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p>La <b>reducción simple</b> (también <b>constant folding</b>, «plegamiento de constantes» o «ejecución en compilación») es resolver <b>en tiempo de compilación</b> las operaciones aritméticas <b>entre constantes</b>, para no repetirlas en cada ejecución.</p>

<h3>El ejemplo canónico</h3>
<pre><code>a := 2 * 3 * 4 * z;      -->      a := 24 * z;</code></pre>
<p><code>2 * 3 * 4</code> son todas constantes: da <b>24</b>, y eso se resuelve <b>una vez</b> mientras compilás, no un millón de veces mientras el programa corre. La operación con <code>z</code> queda, porque <code>z</code> es variable. Es «una operación aritmética <b>entre constantes</b>».</p>

<h3>La analogía de la lista del súper</h3>
<p>Si la lista dice «comprá 2 + 3 + 4 manzanas», antes de salir de tu casa la reescribís como «comprá 9 manzanas». Hiciste la cuenta <b>una vez</b>, en tu casa (compilación), en lugar de estar sumando en la verdulería cada vez que vas (ejecución). No cambia lo que comprás; cambia cuándo hacés la cuenta.</p>

<div class="callout tgt"><span class="lab">🎯 los tres momentos de aplicación (te lo preguntan así)</span>
Una optimización se puede aplicar en <b>tres momentos</b> distintos del proceso de compilación:
<br><b>1) A la entrada</b> — <b>dentro de la acción semántica</b>, <b>antes</b> de escribir en la notación intermedia. Ejemplo: en <code>T → T*F</code>, justo antes de <code>crearTerceto(*, Tind, Find)</code>, preguntás «¿<code>Tind</code> y <code>Find</code> son constantes?»; si lo son, <b>no generás el terceto</b>: resolvés la cuenta y guardás el resultado.
<br><b>2) En la representación intermedia</b> — recorriendo la notación <b>ya construida</b>. Son <b>dos recorridos</b>: uno de <b>optimización</b> (encontrás operandos constantes y los reemplazás por el resultado) y otro de <b>generación de código</b>.
<br><b>3) A la salida</b> — durante la <b>traducción a Assembler</b>, evitando emitir instrucciones para operaciones entre constantes (resolvés la cuenta antes de escribir el código final).</div>

<div class="callout tgt"><span class="lab">🎯 el detalle que distingue a los que estudiaron</span>
El momento «<b>a la entrada</b>» es un <b>invento didáctico de la cátedra</b>: <b>no está en Aho</b>. Aho trabaja siempre sobre la representación intermedia ya construida o sobre el código final. La idea de meter la optimización <b>dentro de la acción semántica, antes de escribir la notación</b>, es la forma en que la cátedra te hace pensar el problema desde la traducción dirigida por sintaxis. Si te preguntan «¿dónde está esto en Aho?», la respuesta honesta es: el «a la entrada» no; los otros dos, sí.</div>

<h3>Cómo se ve en cada notación (a la entrada)</h3>
<ul>
<li><b>Árbol</b>: en <code>T → T*F</code>, antes de <code>crearNodo(*, T, F)</code>, si <b>ambas hojas son constantes</b>, se <b>elimina la hoja derecha</b> y se coloca el resultado en la hoja izquierda.</li>
<li><b>Tercetos</b>: en <code>T → T*F</code>, antes de <code>crearTerceto(*, Tind, Find)</code>, si <code>Tind</code> y <code>Find</code> son constantes, <b>no se genera el terceto</b>: se hace la operación y se propaga el resultado.</li>
<li><b>Polaca</b>: si lo próximo a escribir es un <b>operador</b> y sus <b>dos operandos anteriores</b> son constantes, se resuelve y se sustituyen los tres por el resultado.</li>
</ul>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>🎯 <b>Reducción simple / constant folding</b>: resolver en <b>compilación</b> las operaciones <b>entre constantes</b> (<code>2*3*4*z → 24*z</code>).</li>
<li>🎯 <b>Los tres momentos</b>: <b>a la entrada</b> (en la acción semántica, antes de escribir la notación), <b>en la representación intermedia</b> (recorriendo la notación ya armada: un recorrido optimiza y otro genera código) y <b>a la salida</b> (durante la generación de Assembler).</li>
<li>🎯 El «<b>a la entrada</b>» es <b>invento de la cátedra</b>, <b>no está en Aho</b>; los otros dos sí.</li>
<li>A la entrada, en árbol: si ambas hojas son constantes se elimina la derecha y el resultado va en la izquierda; en tercetos: no se crea el terceto, se resuelve la cuenta.</li>
</ul>`,
    qa:[
      {q:"¿Qué es la reducción simple (constant folding) y con qué ejemplo se la reconoce?",
       a:`<p>Es resolver <b>en tiempo de compilación</b> las operaciones aritméticas <b>entre constantes</b>, para no repetirlas en cada ejecución. El ejemplo canónico de la cátedra: <code>a := 2*3*4*z</code> se transforma en <code>a := 24*z</code>, porque <code>2*3*4</code> son todas constantes y dan 24 (la parte con <code>z</code> queda, porque <code>z</code> es variable). También se la llama «plegamiento de constantes» o «ejecución en compilación». Ahorra <b>tiempo de ejecución</b>: la cuenta entre constantes se hace una sola vez al compilar, no en cada corrida del programa.</p>`},
      {q:"¿Cuáles son los tres momentos en que se puede aplicar una optimización? Definí cada uno.",
       a:`<p>(1) <b>A la entrada</b>: <b>dentro de la acción semántica</b>, <b>antes</b> de escribir en la notación intermedia; por ejemplo, antes de <code>crearTerceto(*, Tind, Find)</code> se verifica si ambos operandos son constantes y, si lo son, se resuelve la cuenta en vez de generar el terceto. (2) <b>En la representación intermedia</b>: recorriendo la notación <b>ya construida</b>, con dos recorridos —uno de optimización y otro de generación de código—. (3) <b>A la salida</b>: durante la <b>traducción a Assembler</b>, evitando generar instrucciones para operaciones entre constantes. Es la clasificación que la cátedra pregunta textualmente.</p>`},
      {q:"¿Cuál de los tres momentos es invento de la cátedra y no aparece en Aho?",
       a:`<p>El momento «<b>a la entrada</b>», es decir, aplicar la optimización <b>dentro de la acción semántica, antes de escribir la notación intermedia</b>. Aho siempre optimiza sobre la <b>representación intermedia ya construida</b> o sobre el <b>código final</b>, nunca «mientras se genera» desde la acción semántica. La cátedra agrega ese momento como recurso <b>didáctico</b>, para conectar la optimización con la traducción dirigida por sintaxis. Los otros dos momentos (en la intermedia y a la salida) sí tienen correlato directo en Aho.</p>`},
      {q:"A la entrada, ¿cómo se implementa la reducción simple en el árbol y en los tercetos?",
       a:`<p>En el <b>árbol</b>, en una regla como <code>T → T*F</code>, <b>antes</b> de llamar a <code>crearNodo(*, T, F)</code> se verifica si <b>ambas hojas son constantes</b>; si lo son, se <b>elimina la hoja derecha</b> y se coloca el <b>resultado de la operación en la hoja izquierda</b> (el nodo del operador no se crea). En los <b>tercetos</b>, antes de <code>crearTerceto(*, Tind, Find)</code> se pregunta «¿<code>Tind</code> y <code>Find</code> son constantes?»; si lo son, <b>no se genera el terceto</b>: se realiza la operación y se propaga el resultado. En ambos casos la idea es idéntica: interceptar en la acción semántica y resolver la cuenta antes de escribir la notación.</p>`}
    ]
  },
  {
    id:"13.9", titulo:"Redundancia sobre tercetos: baja lógica, cuándo cortar", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p>La <b>optimización por redundancia</b> (13.3) —calcular una subexpresión <b>una sola vez</b>— se puede <i>pensar</i> en cualquier notación, pero <b>solo se implementa cómoda en tercetos</b>. Esta lección es el «cómo» que la cátedra pide con detalle.</p>

<h3>Por qué en tercetos y no en polaca ni en árbol</h3>
<p>Un terceto se identifica por su <b>número</b> <code>[n]</code>, y los tercetos se referencian entre sí por ese número. Eso hace <b>facilísimo</b> detectar dos tercetos iguales y <b>redirigir</b> las referencias del segundo hacia el primero. En cambio:</p>
<ul>
<li>En la <b>polaca inversa</b>, las celdas se referencian por posición y los <b>saltos</b> apuntan a números de celda: mover o borrar rompe todo.</li>
<li>En el <b>árbol binario</b>, encontrar dos subárboles idénticos y «coserlos» es engorroso.</li>
</ul>
<p>Por eso el apunte concluye: la redundancia «se realiza en forma <b>eficiente sobre la representación intermedia</b>» pero es <b>dificultosa en polaca inversa y árbol binario</b>, «por lo que su aplicación se realiza principalmente en <b>tercetos</b>».</p>

<h3>El procedimiento, paso a paso</h3>
<pre><code>Buscando en la lista de tercetos:
[40] (*, a, b)      &lt;-- primer cálculo de a*b
...
[42] (*, a, b)      &lt;-- IGUAL a [40]

1) Se detecta que [42] = [40].
2) Se da de BAJA LÓGICA el terceto [42].
3) Toda referencia a [42] se REDIRIGE a [40].</code></pre>
<p>Se busca <b>dos tercetos iguales</b> (mismo operador, mismos argumentos), se elimina <b>lógicamente</b> el segundo y se <b>alteran las referencias</b> para que quien usaba <code>[42]</code> ahora use <code>[40]</code>. Resultado: <code>a*b</code> se calcula <b>una sola vez</b> en ejecución.</p>

<div class="callout tgt"><span class="lab">🎯 hasta dónde se busca: la zona de aplicación</span>
No podés reutilizar <code>[40]</code> si en el medio <b>cambió</b> alguno de sus operandos: la zona donde se puede aplicar la redundancia debe <b>garantizar que las variables no cambiaron de valor</b>. Por eso la búsqueda de un terceto igual <b>finaliza en la primera asignación</b> a alguna de las variables involucradas. Y también <b>se detiene cuando hay alias</b> (dos nombres que pueden apuntar al mismo dato: no podés estar seguro de que no se modificó). Pasada esa frontera, <code>a*b</code> podría valer otra cosa y ya no sería redundante.</div>

<div class="callout tgt"><span class="lab">🎯 baja lógica: en polaca no se borran celdas</span>
Clave de parcial: cuando optimizás <b>polaca</b>, <b>no se pueden perder celdas</b>. Si borraras una celda y corrieras la numeración, se <b>romperían las referencias de los saltos condicionales</b> (que apuntan a números de celda). Por eso se hace una <b>baja lógica</b>: la celda se marca como <b>inactiva</b> pero <b>no se elimina</b>, preservando los índices. El mismo criterio aplica al «desactivar» un terceto redundante: se da de baja lógica, no se borra físicamente reordenando.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>🎯 La <b>redundancia se implementa sobre TERCETOS</b>: se buscan <b>dos tercetos iguales</b>, se da <b>baja lógica</b> al segundo y se <b>redirigen las referencias</b>. En polaca y árbol es dificultoso.</li>
<li>🎯 La búsqueda del terceto igual <b>termina en la primera asignación</b> a una variable involucrada (o si hay <b>alias</b>): así se garantiza que las variables no cambiaron.</li>
<li>🎯 <b>Baja lógica</b> = marcar como inactiva sin borrar. En <b>polaca no se borran celdas</b> porque se romperían las referencias de los <b>saltos</b>.</li>
<li>Es la contraparte de implementación de la «subexpresión común» de 13.3: <code>a*b + c + a*b*d</code> → un solo <code>a*b</code>.</li>
</ul>`,
    qa:[
      {q:"¿Por qué la optimización por redundancia se implementa sobre tercetos y no sobre polaca o árbol?",
       a:`<p>Porque cada terceto se identifica por un <b>número</b> <code>[n]</code> y los tercetos se referencian entre sí por ese número, lo que hace muy fácil <b>detectar dos tercetos iguales</b> y <b>redirigir</b> las referencias del segundo al primero. En la <b>polaca inversa</b>, en cambio, las celdas se referencian por posición y los <b>saltos</b> apuntan a números de celda, así que tocar la estructura rompe las referencias; y en el <b>árbol binario</b> encontrar y fusionar dos subárboles idénticos es engorroso. Por eso el apunte dice que la redundancia se hace de forma eficiente sobre tercetos y es dificultosa en polaca y árbol.</p>`},
      {q:"Describí el procedimiento de eliminación de redundancia sobre tercetos.",
       a:`<p>Se recorre la lista de tercetos <b>buscando dos tercetos iguales</b> (mismo operador y mismos argumentos), por ejemplo <code>[40] (*, a, b)</code> y más adelante <code>[42] (*, a, b)</code>. Al encontrarlos: (1) se da de <b>baja lógica</b> el segundo (<code>[42]</code>), (2) se <b>alteran las referencias</b> para que todo lo que usaba <code>[42]</code> pase a usar <code>[40]</code>. Así la operación <code>a*b</code> se calcula <b>una sola vez</b> en tiempo de ejecución en lugar de dos. Es la implementación concreta de reutilizar una <b>subexpresión común</b>.</p>`},
      {q:"¿Hasta dónde se busca un terceto igual y por qué se corta ahí?",
       a:`<p>La búsqueda <b>finaliza en la primera asignación</b> a alguna de las <b>variables involucradas</b> en el terceto, y también <b>si hay alias</b>. El motivo: para reutilizar un cálculo hay que <b>garantizar que sus operandos no cambiaron de valor</b>. Si más adelante hay un <code>a = ...</code> o un <code>b = ...</code>, a partir de ahí <code>a*b</code> podría valer otra cosa, así que ya no sería redundante y no se puede reutilizar. El <b>alias</b> (dos nombres que pueden referirse al mismo dato) obliga a cortar también, porque no se puede asegurar que una asignación por un nombre no haya modificado el valor accedido por el otro.</p>`},
      {q:"¿Qué es la baja lógica y por qué en polaca no se borran celdas al optimizar?",
       a:`<p>La <b>baja lógica</b> es marcar una celda (o un terceto) como <b>inactiva</b> sin <b>eliminarla físicamente</b>: sigue ocupando su lugar y su número, pero no se genera código para ella. En <b>polaca</b> es obligatorio hacerlo así porque los <b>saltos condicionales referencian números de celda</b>: si se borrara una celda y se corriera la numeración, esos saltos apuntarían a la celda equivocada y se <b>rompería la semántica</b>. Por eso «no se pueden perder celdas»: se desactivan lógicamente para preservar los índices y las referencias de los saltos.</p>`}
    ]
  },
  {
    id:"13.10", titulo:"Enhebrado", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p>El <b>enhebrado de optimizaciones</b> es <b>encadenar</b> optimizaciones porque <b>una habilita a la otra</b>: al aplicar la primera, aparecen oportunidades que antes no existían para la segunda.</p>

<h3>La analogía de ordenar el placard</h3>
<p>Primero <b>doblás</b> toda la ropa (una optimización). Recién cuando está doblada y a la vista <b>notás que tenés tres remeras negras iguales</b> y podés <b>descartar</b> las repetidas (otra optimización). Si hubieras intentado buscar repetidos con todo hecho un bollo, no los habrías visto. El orden importa: una tarea <b>revela</b> el trabajo de la otra. Eso es enhebrar.</p>

<h3>El caso concreto de la cátedra: reducción simple → redundancia</h3>
<p>El enhebrado «lleva a pensar que la <b>reducción simple</b> está relacionada con la <b>redundancia</b>». Mirá por qué:</p>
<pre><code>ANTES:
x := 2 * 3 * a;
y := 6 * a;

Paso 1 - REDUCCIÓN SIMPLE (pliega 2*3 = 6):
x := 6 * a;
y := 6 * a;      &lt;-- ahora son IDÉNTICAS

Paso 2 - REDUNDANCIA (6*a aparece dos veces):
t := 6 * a;
x := t;
y := t;          &lt;-- 6*a se calcula UNA vez</code></pre>
<p>Antes de plegar, <code>2*3*a</code> y <code>6*a</code> <b>no se veían</b> como la misma subexpresión. Después de la <b>reducción simple</b>, las dos son <code>6*a</code>: <b>ahora sí</b> la <b>redundancia</b> las puede unificar. La primera optimización <b>creó las condiciones</b> para la segunda.</p>

<div class="callout tgt"><span class="lab">🎯 el orden y los momentos que recomienda la cátedra</span>
De ahí se deduce la receta: conviene aplicar <b>primero la reducción simple «a la entrada»</b> (en la acción semántica, mientras se genera la notación) y <b>después la redundancia sobre la representación intermedia</b> (recorriendo los tercetos ya armados). En ese orden, cuando la redundancia recorre los tercetos, las constantes <b>ya están plegadas</b> y quedan muchos más tercetos <b>idénticos</b> para unificar. Al revés (redundancia primero) se perderían oportunidades.</div>

<h3>Un matiz</h3>
<p>El enhebrado no es exclusivo de este par. En Aho lo viste implícito todo el tiempo: <b>propagación de copias</b> → genera <b>código muerto</b> → lo barre el <b>DCE</b> (13.4); <b>propagación de constantes</b> → vuelve <b>constante</b> una condición → habilita <b>DCE</b> del bloque inalcanzable (13.4); <b>reducción por fuerza</b> → deja variables <b>muertas</b> → DCE (13.6). Casi todas las optimizaciones se potencian entre sí; enhebrarlas en el orden correcto (y a veces repetir pasadas) es parte del arte de optimizar.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>🎯 <b>Enhebrado</b> = <b>encadenar</b> optimizaciones porque una <b>habilita</b> a la otra (crea oportunidades nuevas).</li>
<li>🎯 Caso central: la <b>reducción simple</b> habilita la <b>redundancia</b> (al plegar <code>2*3</code> a <code>6</code>, <code>2*3*a</code> y <code>6*a</code> se vuelven idénticas y se pueden unificar).</li>
<li>🎯 Orden recomendado: <b>reducción simple a la entrada</b> primero, <b>redundancia sobre la intermedia</b> después.</li>
<li>El principio es general: propagar copias/constantes habilita el <b>DCE</b>; muchas optimizaciones se potencian entre sí.</li>
</ul>`,
    qa:[
      {q:"¿Qué es el enhebrado de optimizaciones?",
       a:`<p>Es <b>encadenar</b> varias optimizaciones aprovechando que <b>una habilita a la otra</b>: al aplicar la primera, aparecen en el código oportunidades para la segunda que antes no estaban a la vista. No es simplemente «hacer varias»; es hacerlas en un <b>orden</b> tal que cada una prepare el terreno de la siguiente (y a veces repetir pasadas). El ejemplo central de la cátedra es que la <b>reducción simple</b> habilita la <b>optimización por redundancia</b>.</p>`},
      {q:"¿Por qué la reducción simple habilita la redundancia? Dá un ejemplo.",
       a:`<p>Porque al <b>plegar constantes</b>, expresiones que se veían distintas quedan <b>idénticas</b> y recién ahí la redundancia las puede unificar. Ejemplo: <code>x := 2*3*a; y := 6*a;</code>. Antes de optimizar, <code>2*3*a</code> y <code>6*a</code> no parecen la misma subexpresión. Tras la <b>reducción simple</b> (<code>2*3 → 6</code>), ambas son <code>6*a</code>; entonces la <b>redundancia</b> calcula <code>6*a</code> una sola vez (<code>t := 6*a; x := t; y := t;</code>). La primera optimización <b>creó la coincidencia</b> que la segunda necesitaba.</p>`},
      {q:"¿En qué orden y en qué momento recomienda la cátedra aplicar reducción simple y redundancia?",
       a:`<p>Recomienda hacer <b>primero la reducción simple «a la entrada»</b> (dentro de la acción semántica, mientras se construye la notación intermedia) y <b>después la redundancia sobre la representación intermedia</b> (recorriendo los tercetos ya armados). La razón es el enhebrado: si las constantes ya están <b>plegadas</b> cuando la redundancia recorre los tercetos, van a quedar muchos más tercetos <b>idénticos</b> para unificar. Aplicarlas al revés desaprovecharía coincidencias que solo aparecen después de plegar.</p>`},
      {q:"Dá otros ejemplos de enhebrado además de reducción simple → redundancia.",
       a:`<p>El principio es general y aparece por todo Aho: (1) la <b>propagación de copias</b> reemplaza <code>u</code> por <code>v</code> y deja la copia <code>u=v</code> sin uso → se vuelve <b>código muerto</b> que el <b>DCE</b> elimina; (2) la <b>propagación de constantes</b> puede volver <b>constante</b> la condición de un <code>if</code> (por ejemplo <code>debug=FALSE</code>) → el bloque se vuelve inalcanzable → lo borra el <b>DCE</b>; (3) la <b>reducción por fuerza</b> permite reescribir una prueba en términos de temporales, dejando el índice original <b>muerto</b> → DCE. En todos, una optimización <b>genera el residuo</b> que otra limpia: esa es la esencia del enhebrado.</p>`}
    ]
  },
  {
    id:"13.11", titulo:"Optimización de mirilla (peephole)", aho:"§8.7 · p.549", badges:["📘"], estado:"dictada",
    html:`
<p>Lección <b>📘 de Aho</b>. La cátedra no la toma, pero es una familia clásica de optimizaciones que encaja justo en el momento «<b>a la salida</b>» (sobre el código final). La <b>optimización de mirilla</b> (<i>peephole</i>) mejora el código destino <b>mirando de a poquito</b>.</p>

<h3>La idea y la analogía</h3>
<p>En vez de razonar sobre todo el programa, la mirilla es una <b>ventana pequeña y deslizante</b> (la «mirilla») que recorre las instrucciones del código destino, y <b>sustituye</b> secuencias cortas por otras <b>más cortas o más rápidas</b>. Es como <b>corregir un texto con una lupa</b>, leyendo de a dos o tres palabras: no entendés la novela entera, pero cazás al vuelo cada «de de», cada «que que», y lo arreglás. El código en la mirilla <b>no tiene por qué ser contiguo</b> (aunque algunas implementaciones lo exigen), y cada mejora puede <b>abrir</b> nuevas: por eso se hacen <b>varias pasadas</b>.</p>

<h3>Las cuatro familias de transformaciones (con ejemplos de Aho)</h3>
<h4>1. Eliminación de cargas/almacenamientos redundantes</h4>
<pre><code>LD  a, R0      ; carga a en R0
ST  R0, a      ; guarda R0 en a  &lt;-- REDUNDANTE</code></pre>
<p>El <code>ST</code> sobra: <code>a</code> ya está en <code>R0</code>. <b>Ojo con el caso borde</b>: solo se elimina si las dos instrucciones están en el <b>mismo bloque básico</b>. Si el <code>ST</code> tuviera una <b>etiqueta</b>, podría llegarse a él por otro camino sin haber pasado por el <code>LD</code>, y ya no sería seguro borrarlo.</p>
<h4>2. Optimizaciones de flujo de control (saltos sobre saltos)</h4>
<pre><code>    goto L1              se convierte en    goto L2
    ...                                     ...
L1: goto L2                             L1: goto L2</code></pre>
<p>Un salto que lleva a otro salto se «acorta» apuntando directo al destino final. Igual con <code>if a &lt; b goto L1 ... L1: goto L2</code> → <code>if a &lt; b goto L2</code>. También se elimina el <b>código inalcanzable</b> (una instrucción sin etiqueta justo después de un <code>goto</code> incondicional no se puede alcanzar).</p>
<h4>3. Simplificaciones algebraicas y reducción por fuerza</h4>
<pre><code>x = x + 0      -->   (se elimina)
x = x * 1      -->   (se elimina)
x ** 2         -->   x * x        (potencia por multiplicación)</code></pre>
<p>Usa identidades algebraicas (<code>x+0=x</code>, <code>x*1=x</code>) para borrar instrucciones inútiles, y cambia operaciones caras por baratas (un cuadrado como producto; dividir por una potencia de dos como un desplazamiento).</p>
<h4>4. Uso de características específicas de la máquina</h4>
<p>Aprovechar instrucciones de hardware, como los modos de <b>autoincremento/autodecremento</b> (sumar o restar 1 a un operando al usarlo), ideales para <code>x = x + 1</code> o para meter/sacar datos de la pila al pasar parámetros.</p>

<div class="callout aho"><span class="lab">📘 dónde encaja respecto de la cátedra</span>
La mirilla trabaja sobre el <b>código destino</b> (o sobre la intermedia justo después de generarla): es la versión «industrial» del momento <b>a la salida</b> (13.8). Divergencia clave: es <b>local</b> (solo mira su ventanita) y <b>dependiente de la máquina</b> (aprovecha instrucciones concretas), mientras que las optimizaciones del capítulo 9 (subexpresiones, código muerto, bucles) son <b>globales</b> e <b>independientes de la máquina</b>. Su nombre «optimización» es medio tramposo: no garantiza un código óptimo, solo <b>mejoras locales</b> —pero baratas y sorprendentemente efectivas—.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>📘 <b>Mirilla (peephole)</b>: una <b>ventana chica y deslizante</b> sobre el código destino que reemplaza secuencias por otras más cortas o rápidas; local, dependiente de la máquina, y se aplican <b>varias pasadas</b>.</li>
<li>Cuatro familias: <b>carga/almacenamiento redundante</b> (<code>LD a,R0 / ST R0,a</code>), <b>flujo de control</b> (saltos sobre saltos, código inalcanzable), <b>simplificación algebraica / reducción por fuerza</b> (<code>x+0</code>, <code>x*1</code>, <code>x**2 → x*x</code>) y <b>características de máquina</b> (autoincremento).</li>
<li>Caso borde: el <code>ST</code> redundante solo se borra si está en el <b>mismo bloque básico</b> (sin etiqueta) que el <code>LD</code>.</li>
<li>Encaja en el momento <b>a la salida</b>; es <b>local</b> frente a las optimizaciones <b>globales</b> del cap. 9.</li>
</ul>`,
    qa:[
      {q:"¿Qué es la optimización de mirilla (peephole)?",
       a:`<p>Es una técnica de optimización <b>local</b> que desliza una <b>ventana pequeña</b> (la «mirilla») sobre las instrucciones del <b>código destino</b> y <b>sustituye</b> secuencias cortas por otras <b>más cortas o más rápidas</b>, cada vez que es posible. También puede aplicarse a la representación intermedia recién generada. No razona sobre el programa entero: solo mira unas pocas instrucciones a la vez (que no necesariamente son contiguas). Como cada mejora puede habilitar otras, se realizan <b>varias pasadas</b>. Es simple y barata, aunque no garantiza un código «óptimo».</p>`},
      {q:"Dá un ejemplo de cada familia de optimización de mirilla.",
       a:`<p>(1) <b>Carga/almacenamiento redundante</b>: <code>LD a,R0</code> seguido de <code>ST R0,a</code> → se elimina el <code>ST</code> (<code>a</code> ya está en <code>R0</code>). (2) <b>Flujo de control</b>: <code>goto L1 ... L1: goto L2</code> → <code>goto L2</code> (salto sobre salto); también se borra el código inalcanzable tras un <code>goto</code> incondicional. (3) <b>Simplificación algebraica / reducción por fuerza</b>: <code>x = x + 0</code> y <code>x = x * 1</code> se eliminan; <code>x**2</code> se implementa como <code>x*x</code>. (4) <b>Características de máquina</b>: usar modos de <b>autoincremento/autodecremento</b> para <code>x = x + 1</code> o para push/pop de la pila.</p>`},
      {q:"¿Por qué la optimización de mirilla necesita varias pasadas sobre el código?",
       a:`<p>Porque <b>cada mejora puede engendrar nuevas oportunidades</b> de mejora. Al sustituir una secuencia por otra más corta, la ventana puede quedar mostrando una nueva combinación optimizable que antes no existía. Por ejemplo, eliminar un salto puede volver <b>inalcanzable</b> el código siguiente, que en la próxima pasada se elimina; o propagar una constante puede habilitar una simplificación algebraica. Por eso, para obtener el <b>beneficio máximo</b>, se recorre el código <b>varias veces</b> hasta que ya no haya nada más que reemplazar.</p>`},
      {q:"¿Por qué el ST redundante solo puede eliminarse si está en el mismo bloque básico que el LD?",
       a:`<p>Porque eliminar el <code>ST R0, a</code> es seguro <b>solo si se garantiza</b> que el <code>LD a, R0</code> siempre se ejecutó justo antes (dejando <code>a</code> en <code>R0</code>). Si el <code>ST</code> tuviera una <b>etiqueta</b>, podría llegarse a él por un <b>salto</b> desde otro lugar del programa, sin haber pasado por el <code>LD</code>; en ese camino, <code>R0</code> podría no contener el valor de <code>a</code>, y borrar el <code>ST</code> rompería la semántica. Estar en el <b>mismo bloque básico</b> (sin etiquetas intermedias) asegura que el flujo pasó por el <code>LD</code> antes del <code>ST</code>, y por eso la transformación es válida.</p>`}
    ]
  },
  {
    id:"13.12", titulo:"Qué es el análisis de flujo de datos (para saber que existe)", aho:"§9.2.1–9.2.2 · p.597", badges:["📘"], estado:"dictada",
    html:`
<p>Lección <b>📘 de Aho</b>, y de las que la cátedra <b>no toma</b>: alcanza con <b>saber que existe</b> y qué problema resuelve. Es la maquinaria formal que hay <b>debajo</b> de casi todas las optimizaciones del capítulo 9.</p>

<h3>Qué es</h3>
<p>El <b>análisis de flujo de datos</b> es un conjunto de técnicas que <b>derivan información sobre cómo circulan los datos</b> a lo largo de los caminos de ejecución de un programa. Todas las optimizaciones globales de 13.3 a 13.6 <b>dependen</b> de él: para eliminar una subexpresión común hay que saber si dos expresiones dan el mismo valor por todos los caminos; para borrar código muerto hay que saber si un resultado se usa después; etc.</p>

<h3>La analogía de la red de cañerías</h3>
<p>Pensá el programa como una <b>red de cañerías</b> (el <b>grafo de flujo</b>: bloques conectados por flechas). En cada empalme querés responder preguntas como «¿qué fuentes pudieron haber llenado esta cañería?» o «¿el agua que llega acá se va a usar más adelante?». No podés rastrear <b>cada gota</b> (cada valor posible en cada corrida) porque hay <b>infinitos caminos</b> y de largo ilimitado (los bucles). Entonces <b>abstraés</b>: en lugar de estados completos, guardás solo un <b>conjunto finito de hechos</b> relevantes para la pregunta que te interesa.</p>

<h3>El esquema (ENT y SAL, funciones de transferencia)</h3>
<p>A cada instrucción <code>s</code> se le asocian dos valores de flujo de datos: <b>ENT[s]</b> (lo que vale <i>antes</i>) y <b>SAL[s]</b> (lo que vale <i>después</i>). El problema es resolver un sistema de <b>restricciones</b> con dos orígenes:</p>
<ul>
<li><b>Funciones de transferencia</b> — vienen de la <b>semántica</b> de cada instrucción. Hacia adelante: <code>SAL[s] = f_s(ENT[s])</code>. Hacia atrás: <code>ENT[s] = f_s(SAL[s])</code>. Ejemplo: si antes de <code>b = a</code> la variable <code>a</code> vale <code>v</code>, después <code>a</code> y <code>b</code> valen <code>v</code>.</li>
<li><b>Restricciones de flujo de control</b> — vienen de las <b>flechas</b> del grafo. Ejemplo típico: lo que <b>entra</b> a un bloque es la <b>unión</b> de lo que <b>sale</b> de todos sus predecesores: <code>ENT[B] = union de SAL[P]</code> para cada predecesor <code>P</code>.</li>
</ul>

<h3>El ejemplo estrella: definiciones de alcance</h3>
<p>El esquema más común es el de <b>definiciones de alcance</b> (<i>reaching definitions</i>): saber qué <b>definiciones</b> (asignaciones a una variable) pueden <b>llegar</b> a cada punto del programa. Con eso el compilador sabe, por ejemplo, si <code>x</code> es <b>constante</b> en el punto <code>p</code> (si la única definición que llega le asigna una constante), o un depurador sabe si <code>x</code> podría estar <b>indefinida</b>. Otros análisis del mismo estilo: <b>variables vivas</b> (para el DCE) y <b>expresiones disponibles</b> (para subexpresiones comunes).</p>

<div class="callout aho"><span class="lab">📘 lo único que te tenés que llevar</span>
No entra en el parcial. Lo que importa: el análisis de flujo de datos es <b>el motor</b> que hace posible optimizar <b>más allá de un bloque básico</b> (globalmente), porque calcula, de forma segura, qué se puede afirmar en cada punto sin ejecutar el programa. Como es imposible seguir <b>todos</b> los caminos (infinitos), se <b>abstrae</b> a un conjunto finito de hechos y se resuelve iterando. La <b>propagación de constantes</b> (13.7), con sus valores UNDEF/NAC, es un caso particular de este framework.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>📘 <b>Análisis de flujo de datos</b>: técnicas que derivan cómo <b>circulan los datos</b> por el grafo de flujo; es la base de las optimizaciones <b>globales</b> (subexpresiones comunes, código muerto, bucles).</li>
<li>Como hay <b>infinitos caminos</b>, no se rastrean estados completos: se <b>abstrae</b> a un <b>conjunto finito de hechos</b>.</li>
<li>Se modela con <b>ENT[s]/SAL[s]</b>, <b>funciones de transferencia</b> (semántica, hacia adelante o atrás) y <b>restricciones de flujo de control</b> (unión de los predecesores).</li>
<li>Esquema estrella: <b>definiciones de alcance</b>. La cátedra <b>no lo toma</b>: alcanza con <b>saber que existe</b>.</li>
</ul>`,
    qa:[
      {q:"¿Para qué sirve el análisis de flujo de datos?",
       a:`<p>Sirve para <b>derivar información</b> sobre cómo circulan los datos a lo largo de los caminos de ejecución de un programa, recorriendo su <b>grafo de flujo</b>. Esa información es la que <b>habilita las optimizaciones globales</b> (las que cruzan bloques básicos): para eliminar una <b>subexpresión común</b> hay que saber si dos expresiones dan el mismo valor por todos los caminos; para el <b>DCE</b>, si un resultado se usa después; para la <b>propagación de constantes</b>, si una variable es constante en un punto. Es, en resumen, el <b>motor formal</b> detrás del capítulo de optimizaciones. La cátedra no lo toma; basta con saber que existe.</p>`},
      {q:"¿Por qué no se pueden rastrear todos los estados del programa y qué se hace en su lugar?",
       a:`<p>Porque un programa tiene, en general, un número <b>infinito</b> de caminos de ejecución posibles, sin cota superior de longitud (por los <b>bucles</b>), y cada camino produce muchos estados. Rastrear cada valor posible en cada punto sería inabordable. En su lugar, el análisis <b>abstrae</b>: no diferencia por qué camino se llegó a un punto y no guarda estados completos, sino solo un <b>conjunto finito de hechos</b> relevantes para la pregunta concreta (por ejemplo, «qué definiciones pueden llegar acá» o «qué variables están vivas»). Distintos análisis abstraen información distinta según su objetivo.</p>`},
      {q:"¿Qué son ENT[s] y SAL[s] y las funciones de transferencia?",
       a:`<p><b>ENT[s]</b> y <b>SAL[s]</b> son los valores de flujo de datos <b>antes</b> y <b>después</b> de cada instrucción <code>s</code>. Las <b>funciones de transferencia</b> expresan cómo la <b>semántica</b> de la instrucción relaciona esos dos valores: en un problema <b>hacia adelante</b>, <code>SAL[s] = f_s(ENT[s])</code> (por ejemplo, tras <code>b = a</code>, si <code>a</code> valía <code>v</code>, ahora <code>a</code> y <code>b</code> valen <code>v</code>); en uno <b>hacia atrás</b>, <code>ENT[s] = f_s(SAL[s])</code>. Junto con las <b>restricciones de flujo de control</b> (que combinan la información de los bloques vecinos, típicamente <code>ENT[B]</code> = unión de los <code>SAL</code> de sus predecesores), forman el sistema que el análisis resuelve.</p>`},
      {q:"¿Qué son las definiciones de alcance (reaching definitions) y para qué sirven?",
       a:`<p>Una <b>definición</b> es una instrucción que asigna (o puede asignar) un valor a una variable. Se dice que una definición <code>d</code> <b>llega</b> (alcanza) a un punto <code>p</code> si hay un camino desde <code>d</code> hasta <code>p</code> a lo largo del cual <code>d</code> no es «pisada» por otra definición de la misma variable. El análisis de <b>definiciones de alcance</b> calcula, para cada punto, qué definiciones pueden llegar. Sirve para muchísimo: saber si una variable es <b>constante</b> en <code>p</code> (habilita propagación de constantes), si podría estar <b>indefinida</b> (útil para depurar), etc. Es uno de los esquemas de flujo de datos más comunes; junto con <b>variables vivas</b> (para el DCE) y <b>expresiones disponibles</b> (para subexpresiones comunes) cubre las optimizaciones globales.</p>`}
    ]
  }
]});
