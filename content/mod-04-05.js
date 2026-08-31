M.push({ id:4, titulo:"Gramáticas libres de contexto", parcial:"I",
  resumen:"Qué es una gramática libre de contexto y sus cuatro componentes, las derivaciones por izquierda y por derecha (de donde salen LL y LR), el árbol de parsing, la ambigüedad y cómo se elimina de verdad, GLC contra ER, cómo la forma de las reglas codifica asociatividad y precedencia, la eliminación de la recursividad por la izquierda, la factorización, un taller de BNF de parcial y los errores sintácticos.",
  lecciones:[
  {
    id:"4.1", titulo:"Definición formal de GLC: los 4 componentes", aho:"§4.2.1 · p.197", badges:["🎯"], estado:"dictada",
    html:`
<p>Una <b>gramática libre de contexto (GLC)</b> es la herramienta con la que el <b>analizador sintáctico</b> describe la sintaxis de las construcciones <b>anidadas</b> del lenguaje: las expresiones, las instrucciones, los bloques. Donde el léxico veía una tira plana de tokens, el sintáctico ve una <b>estructura jerárquica</b>, y esa estructura la dicta la gramática.</p>

<h3>La analogía de los casilleros</h3>
<p>Pensá en una GLC como un juego de <b>plantillas para rellenar</b>. Algunos huecos son <b>categorías</b> que todavía hay que seguir abriendo (como "sujeto" o "predicado" en el análisis de una oración): esos son los <b>no terminales</b>. Otros son <b>piezas finales</b> que ya no se abren más (las palabras concretas): esos son los <b>terminales</b>. Armar una sentencia es ir reemplazando cada categoría por su contenido hasta que solo queden piezas finales.</p>

<h3>Los cuatro componentes</h3>
<p>Aho (y la cátedra) dicen que una GLC consiste en cuatro cosas:</p>
<ul>
<li><b>Terminales</b>: los <b>símbolos básicos</b> con los que se forman las cadenas. Son <b>los tokens</b> que entrega el léxico: "nombre de token" y "terminal" son sinónimos. En la gramática canónica de la cátedra, los terminales son <code>id</code>, <code>cte</code>, <code>:=</code>, <code>+</code> y <code>*</code>.</li>
<li><b>No terminales</b>: <b>variables sintácticas</b> que denotan conjuntos de cadenas. Son los que imponen la <b>estructura jerárquica</b>. En la canónica: <code>A</code> (asignación), <code>E</code> (expresión), <code>T</code> (término) y <code>F</code> (factor).</li>
<li><b>Símbolo distinguido (inicial o <i>start</i>)</b>: <b>uno</b> de los no terminales, por el que arranca todo. El conjunto de cadenas que denota es <b>el lenguaje</b> que genera la gramática. En la canónica es <code>A</code>. Por convención, sus producciones se listan <b>primero</b>.</li>
<li><b>Producciones (reglas)</b>: dicen cómo se reescribe cada no terminal. Cada una tiene un <b>encabezado</b> (lado izquierdo, un no terminal), el símbolo <code>→</code> (a veces <code>::=</code>) y un <b>cuerpo</b> (lado derecho, cero o más terminales y no terminales).</li>
</ul>

<h3>La gramática canónica de la cátedra</h3>
<p>Memorizala, porque aparece en todo el Parcial I:</p>
<pre><code>1. A → id := E
2. E → E + T
3. E → T
4. T → T * F
5. T → F
6. F → id
7. F → cte</code></pre>
<p>Ahí <code>A</code> es el distinguido; <code>id</code>, <code>cte</code>, <code>:=</code>, <code>+</code>, <code>*</code> son terminales; <code>A</code>, <code>E</code>, <code>T</code>, <code>F</code> son no terminales; y las 7 líneas son las producciones.</p>

<div class="callout tgt"><span class="lab">🎯 lo que más se pregunta: qué se define y qué no</span>Los <b>terminales NO se definen</b>: son átomos que ya vienen reconocidos del léxico (los tokens). Los <b>no terminales SÍ se definen</b>, con reglas que los reescriben usando terminales y otros no terminales. Además, las reglas son <b>declarativas</b> (no importa el orden en que las escribís) y <b>pueden ser recursivas</b> (un no terminal puede aparecer en su propio cuerpo, como <code>E → E + T</code>) — algo que las definiciones regulares del léxico tenían <b>prohibido</b>.</div>

<div class="callout aho"><span class="lab">📘 por qué los no terminales son "la clave"</span>Aho remarca que los no terminales <b>imponen una estructura jerárquica</b> sobre el lenguaje, y que esa jerarquía es la clave para el <b>análisis sintáctico</b> y para la <b>traducción</b> posterior. El cuerpo de una producción puede tener <b>cero</b> símbolos: ese es el caso de la producción vacía (<code>A → ε</code>), que sirve para expresar "esto puede no estar". Y aunque una GLC describe casi toda la sintaxis, hay cosas que <b>no</b> puede: por ejemplo, exigir que una variable se declare antes de usarse; eso queda para el análisis semántico.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Los <b>4 componentes</b>: terminales, no terminales, símbolo distinguido y producciones.</li>
<li>🎯 Los <b>terminales no se definen</b> (son los tokens del léxico); los <b>no terminales sí</b>.</li>
<li>Las reglas son <b>declarativas</b> (el orden no cambia el lenguaje) y <b>pueden ser recursivas</b>.</li>
<li>El <b>símbolo distinguido</b> es el no terminal por el que empieza todo; sus reglas se listan primero.</li>
</ul>`,
    qa:[
      {q:"Nombrá los cuatro componentes de una gramática libre de contexto e indicá cuáles se definen y cuáles no.",
       a:`<p>Los cuatro componentes son: <b>terminales</b>, <b>no terminales</b>, <b>símbolo distinguido</b> (inicial) y <b>producciones</b> (reglas). Se <b>definen</b> únicamente los <b>no terminales</b>, mediante las reglas que los reescriben. Los <b>terminales no se definen</b>: son los <b>tokens</b> que ya reconoció el analizador léxico, átomos a partir de los cuales se arma todo. El símbolo distinguido es simplemente uno de los no terminales, el elegido como punto de arranque, y el lenguaje que genera la gramática es el conjunto de cadenas de terminales derivables desde él.</p>`},
      {q:"En la gramática canónica A→id:=E, E→E+T|T, T→T*F|F, F→id|cte, clasificá cada símbolo y decí cuál es el distinguido.",
       a:`<p><b>Terminales</b> (vienen del léxico, no se definen): <code>id</code>, <code>cte</code>, <code>:=</code>, <code>+</code>, <code>*</code>. <b>No terminales</b> (se definen con reglas): <code>A</code>, <code>E</code>, <code>T</code>, <code>F</code>. El <b>símbolo distinguido</b> es <code>A</code> (la asignación): sus producciones se listan primero, y el lenguaje de la gramática es el conjunto de cadenas derivables desde <code>A</code>. Fijate que la gramática es <b>recursiva a la izquierda</b> en <code>E</code> y <code>T</code> (<code>E → E + T</code>), algo perfectamente válido en una GLC.</p>`},
      {q:"V/F justificando: «Si cambio el orden en que escribo las reglas de una gramática, cambia el lenguaje que genera.»",
       a:`<p><b>Falso.</b> Las producciones de una GLC son <b>declarativas</b>: describen qué combinaciones son válidas, no una secuencia de pasos. El lenguaje generado depende del <b>conjunto</b> de reglas, no del orden en que se listan. La única convención es que las reglas del <b>símbolo distinguido</b> se escriben primero, pero eso es para identificar el arranque, no porque afecte el lenguaje. (Distinto es el caso de una herramienta como Flex o Bison, donde el orden puede desempatar conflictos, pero eso es una decisión de implementación, no de la gramática en sí.)</p>`},
      {q:"¿Por qué los terminales no se definen y los no terminales sí?",
       a:`<p>Porque los <b>terminales son los tokens</b>: unidades ya reconocidas por el léxico (<code>id</code>, <code>cte</code>, <code>+</code>…), que para el sintáctico son <b>indivisibles</b> — no hay nada dentro que describir. Los <b>no terminales</b>, en cambio, son <b>variables sintácticas</b> que representan construcciones compuestas (una expresión, un término): hay que decir <b>de qué están hechas</b>, y eso es exactamente lo que hace una producción. Definir un terminal sería como pedir la "definición" de la letra A: es un átomo del alfabeto de entrada, no una estructura.</p>`}
    ]
  },
  {
    id:"4.2", titulo:"Derivaciones por izquierda y por derecha", aho:"§4.2.3 · p.199", badges:["🎯"], estado:"dictada",
    html:`
<p>Una <b>derivación</b> es la forma precisa de decir "esta sentencia pertenece al lenguaje". Se arranca del <b>símbolo distinguido</b> y, paso a paso, se reemplaza un no terminal por el <b>cuerpo</b> de una de sus producciones, hasta que no quedan más no terminales (solo terminales: la sentencia). Cada paso se escribe con <code>⇒</code>, que se lee "deriva en un paso".</p>

<h3>La analogía del presupuesto</h3>
<p>Derivar es como <b>desglosar un presupuesto</b>. Arrancás con un rubro grande, "Total", y lo vas abriendo: "Total = Materiales + Mano de obra", después abrís "Materiales", después "Mano de obra", hasta llegar a <b>números concretos</b>. En cada paso tenés que decidir <b>qué rubro</b> desglosás y <b>por cuál desglose</b> lo reemplazás. Esas son, justamente, las dos elecciones de toda derivación.</p>

<h3>Las dos elecciones, y las dos disciplinas</h3>
<p>Aho señala que en cada paso hay que elegir <b>dos</b> cosas: (1) <b>qué</b> no terminal reemplazar, y (2) <b>qué producción</b> usar para reemplazarlo. Si nos disciplinamos siempre igual en la elección (1), aparecen dos tipos de derivación:</p>
<ul>
<li><b>Derivación por la izquierda</b> (<i>leftmost</i>): en cada paso se reemplaza el no terminal <b>más a la izquierda</b>.</li>
<li><b>Derivación por la derecha</b> (<i>rightmost</i> o <b>canónica</b>): en cada paso se reemplaza el <b>más a la derecha</b>.</li>
</ul>

<h3>Las dos derivaciones de <code>id := id + id</code></h3>
<p>Con la gramática canónica, mirá cómo la <b>misma</b> sentencia sale de dos maneras. Por la <b>izquierda</b> (subrayo el no terminal que toco):</p>
<pre><code>A ⇒ id := E
  ⇒ id := E + T      (aplico E → E + T)
  ⇒ id := T + T      (aplico E → T sobre la E izquierda)
  ⇒ id := F + T      (T → F)
  ⇒ id := id + T     (F → id)
  ⇒ id := id + F     (T → F)
  ⇒ id := id + id    (F → id)</code></pre>
<p>Por la <b>derecha</b>, la misma sentencia:</p>
<pre><code>A ⇒ id := E
  ⇒ id := E + T      (E → E + T)
  ⇒ id := E + F      (toco la T de la derecha: T → F)
  ⇒ id := E + id     (F → id)
  ⇒ id := T + id     (E → T)
  ⇒ id := F + id     (T → F)
  ⇒ id := id + id    (F → id)</code></pre>
<p>Llegan al mismo lado, pero el <b>orden</b> en que se aplicaron las reglas es distinto.</p>

<div class="callout tgt"><span class="lab">🎯 de acá salen LL y LR (no es una mnemotecnia arbitraria)</span>Los nombres de los dos grandes métodos de parsing codifican <b>qué derivación</b> construyen: <b>LL</b> = lee la entrada de izquierda a derecha (<b>L</b>eft-to-right) y produce una derivación por la i<b>z</b>quierda (<b>L</b>eftmost) — es el <b>descendente</b>. <b>LR</b> = lee de izquierda a derecha (<b>L</b>eft-to-right) y produce una derivación por la de<b>R</b>echa (<b>R</b>ightmost)… <b>pero en reversa</b> — es el <b>ascendente</b>. No son dos formas de decir lo mismo: son <b>dos derivaciones distintas</b> de la misma sentencia.</div>

<div class="callout aho"><span class="lab">📘 por qué "en reversa" en el ascendente</span>El descendente <b>expande</b>: va del distinguido hacia la sentencia, y si lo hace tomando siempre el no terminal izquierdo, construye directamente una derivación por la izquierda. El ascendente hace lo <b>opuesto</b>: parte de la <b>sentencia</b> y va <b>reduciendo</b> (reemplazando cuerpos por sus encabezados) hasta llegar al distinguido. Si anotás las reducciones y las <b>leés al revés</b>, obtenés una derivación por la <b>derecha</b>. Por eso Aho dice que el análisis ascendente "se relaciona con las derivaciones de más a la derecha". Esa lista de reglas leída al revés <b>es</b> la derivación canónica.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Una <b>derivación</b> va del <b>distinguido</b> a la <b>sentencia</b>, reemplazando un no terminal por el cuerpo de una producción en cada paso (<code>⇒</code>).</li>
<li><b>Por izquierda</b>: siempre el no terminal más a la izquierda. <b>Por derecha</b> (canónica): siempre el más a la derecha.</li>
<li>🎯 <b>LL</b> (descendente) construye una derivación por <b>izquierda</b>; <b>LR</b> (ascendente) construye una por <b>derecha en reversa</b>.</li>
<li>Son <b>dos derivaciones distintas</b> de la misma sentencia, no dos nombres de lo mismo.</li>
</ul>`,
    qa:[
      {q:"¿Qué es una derivación por la izquierda y una por la derecha? Mostrá la diferencia con un ejemplo.",
       a:`<p>Ambas parten del símbolo distinguido y reemplazan no terminales hasta llegar a la sentencia; se diferencian en <b>cuál</b> no terminal tocan en cada paso. La <b>por izquierda</b> reemplaza siempre el <b>más a la izquierda</b>; la <b>por derecha</b> (o canónica), el <b>más a la derecha</b>. Ejemplo con <code>id := id + id</code>: por izquierda hago <code>A ⇒ id := E ⇒ id := E + T ⇒ id := T + T ⇒ id := F + T ⇒ id := id + T ⇒ …</code> (ataco primero la <code>E</code> de la izquierda); por derecha hago <code>A ⇒ id := E ⇒ id := E + T ⇒ id := E + F ⇒ id := E + id ⇒ …</code> (ataco primero la <code>T</code> de la derecha). Llegan a la misma sentencia con distinto orden de reglas.</p>`},
      {q:"¿Qué relación hay entre el parsing descendente y ascendente y las derivaciones por izquierda/derecha?",
       a:`<p>El <b>descendente (LL)</b> construye una <b>derivación por la izquierda</b>: expande el no terminal más a la izquierda avanzando del distinguido hacia la sentencia. El <b>ascendente (LR)</b> construye una <b>derivación por la derecha en reversa</b>: parte de la sentencia y va <b>reduciendo</b> (reemplaza cuerpos por encabezados) hasta el distinguido; la lista de reducciones, leída al revés, es una derivación por la derecha. Son dos recorridos opuestos y dos derivaciones distintas: por eso los nombres <b>LL</b> y <b>LR</b> codifican, respectivamente, "left-to-right / leftmost" y "left-to-right / rightmost".</p>`},
      {q:"Escribí una derivación por la izquierda de id := id * id con la gramática canónica.",
       a:`<pre><code>A ⇒ id := E
  ⇒ id := T          (E → T)
  ⇒ id := T * F      (T → T * F)
  ⇒ id := F * F      (T → F, sobre la T izquierda)
  ⇒ id := id * F     (F → id)
  ⇒ id := id * id    (F → id)</code></pre><p>En cada paso reemplacé el no terminal <b>más a la izquierda</b>. Notá que primero bajé de <code>E</code> a <code>T</code> (porque no hay <code>+</code>), después abrí la multiplicación con <code>T → T * F</code>, y recién ahí fui resolviendo los factores de izquierda a derecha.</p>`},
      {q:"¿Por qué se dice que el análisis ascendente construye la derivación «por la derecha en reversa» y no simplemente «por la derecha»?",
       a:`<p>Porque el ascendente no <b>expande</b> (del distinguido hacia afuera), sino que <b>reduce</b> (de la sentencia hacia adentro). Va reconociendo cuerpos de reglas y reemplazándolos por sus encabezados, empezando por lo más concreto del programa. La secuencia de reducciones que produce, si la <b>invertís</b>, coincide exactamente con los pasos de una derivación por la derecha. Es decir: el parser genera la derivación canónica <b>de atrás para adelante</b>. Por eso lo que devuelve es una <b>lista de reglas</b> que hay que leer al revés para ver la derivación por la derecha.</p>`}
    ]
  },
  {
    id:"4.3", titulo:"Árbol de parsing y su relación con las derivaciones", aho:"§4.2.4 · p.201", badges:["🎯"], estado:"dictada",
    html:`
<p>El <b>árbol de parsing</b> (o de análisis sintáctico, o de derivación) es la <b>representación gráfica</b> de una derivación que <b>filtra</b> —es decir, ignora— el orden en que se aplicaron las producciones. Muestra la <b>estructura</b> de la sentencia sin comprometerse con "primero toqué esta, después aquella".</p>

<h3>La analogía del análisis de la oración</h3>
<p>Es el mismo árbol que hacías en la primaria para una oración: arriba "oración", que se abre en "sujeto" y "predicado", que a su vez se abren, hasta llegar abajo a las <b>palabras concretas</b>. No importa si analizaste primero el sujeto o primero el predicado: el árbol final es el mismo. Ese "no importa el orden" es la idea central.</p>

<h3>Cómo se lee un árbol de parsing</h3>
<ul>
<li>La <b>raíz</b> es el <b>símbolo distinguido</b>.</li>
<li>Cada <b>nodo interior</b> es un <b>no terminal</b>, y representa <b>la aplicación de una regla</b>: el nodo se etiqueta con el encabezado y sus <b>hijos</b>, de izquierda a derecha, son los símbolos del cuerpo.</li>
<li>Las <b>hojas</b>, leídas de izquierda a derecha, forman la <b>sentencia</b> (Aho la llama el <i>producto</i> o <i>frontera</i> del árbol).</li>
<li>Entre un <b>padre y sus hijos</b> debe coincidir <b>exactamente una regla</b> de la gramática.</li>
</ul>
<p>Para <code>id := id + id</code> con la canónica, el árbol tiene a <code>A</code> en la raíz, con hijos <code>id</code>, <code>:=</code> y <code>E</code>; esa <code>E</code> se abre en <code>E + T</code>; la <code>E</code> izquierda baja a <code>T</code> y a <code>F</code> y a <code>id</code>; la <code>T</code> derecha baja a <code>F</code> y a <code>id</code>. Leyendo las hojas: <code>id := id + id</code>.</p>

<div class="callout tgt"><span class="lab">🎯 la regla de armado que corrigen en el parcial</span>Entre un nodo <b>padre</b> y el conjunto de sus <b>hijos</b> tiene que existir <b>exactamente una</b> producción de la gramática cuyo lado izquierdo sea el padre y cuyo lado derecho sea, en orden, los hijos. Si dibujás un padre <code>E</code> con hijos que no forman ningún cuerpo de <code>E</code>, el árbol está <b>mal</b>. Y ojo: para <b>toda</b> sentencia del lenguaje existe <b>al menos un</b> árbol (si existieran dos, la gramática es ambigua: lección 4.4).</div>

<div class="callout aho"><span class="lab">📘 varios a uno, y uno a uno</span>Entre <b>derivaciones</b> y <b>árboles</b> hay una relación de <b>varios a uno</b>: muchas derivaciones distintas (mezclando el orden en que tocás los no terminales) producen el <b>mismo</b> árbol, porque el árbol abstrae ese orden. Pero si te restringís a las derivaciones <b>por izquierda</b> (o a las <b>por derecha</b>), la relación pasa a ser <b>uno a uno</b>: todo árbol tiene <b>una única</b> derivación por izquierda y <b>una única</b> por derecha. Por eso los parsers trabajan con esas derivaciones disciplinadas: reconstruyen el árbol sin ambigüedad de orden.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El árbol de parsing es la <b>derivación dibujada</b>, que <b>ignora el orden</b> en que se aplicaron las reglas.</li>
<li>🎯 <b>Raíz</b> = distinguido; <b>interiores</b> = no terminales; <b>hojas</b> (de izq. a der.) = la sentencia; y entre <b>padre e hijos coincide exactamente una regla</b>.</li>
<li>Relación <b>varios a uno</b> derivaciones→árbol; pero <b>uno a uno</b> entre árbol y derivación por izquierda (o por derecha).</li>
<li>Para toda sentencia del lenguaje existe <b>al menos un</b> árbol.</li>
</ul>`,
    qa:[
      {q:"¿Qué debe cumplirse entre un nodo padre y sus hijos en un árbol de parsing?",
       a:`<p>Debe existir <b>exactamente una</b> producción de la gramática cuyo <b>lado izquierdo</b> sea el no terminal del padre y cuyo <b>lado derecho</b> sea, <b>en orden</b>, la secuencia de símbolos de los hijos (de izquierda a derecha). Dicho de otro modo, cada nodo interior <b>es</b> la aplicación de una regla. Si un padre <code>T</code> tiene hijos que no forman ningún cuerpo de <code>T</code> en la gramática, el árbol es inválido. Es la forma de garantizar que el árbol representa una derivación legal.</p>`},
      {q:"¿Qué relación hay entre las derivaciones y los árboles de parsing?",
       a:`<p>Es de <b>varios a uno</b>: muchas derivaciones distintas (que difieren solo en el <b>orden</b> en que se reemplazan los no terminales) dan el <b>mismo</b> árbol, porque el árbol <b>filtra</b> ese orden. Sin embargo, si te limitás a las derivaciones <b>por la izquierda</b> —o a las <b>por la derecha</b>—, la relación se vuelve <b>uno a uno</b>: cada árbol tiene exactamente una derivación por izquierda y una por derecha. Por eso, para reconstruir el árbol sin ambigüedades, los métodos de parsing eligen una de esas dos disciplinas.</p>`},
      {q:"Identificá la raíz, los nodos interiores y las hojas del árbol de id := id + id (gramática canónica).",
       a:`<p><b>Raíz</b>: el símbolo distinguido <code>A</code>. <b>Nodos interiores</b>: los no terminales <code>A</code>, <code>E</code>, <code>T</code>, <code>F</code> (cada uno es la aplicación de una regla). <b>Hojas</b>: los terminales <code>id</code>, <code>:=</code>, <code>id</code>, <code>+</code>, <code>id</code>, que leídos de izquierda a derecha reconstruyen la sentencia. Concretamente: <code>A</code> se abre en <code>id := E</code>; esa <code>E</code> en <code>E + T</code>; la <code>E</code> izquierda baja por <code>T</code> y <code>F</code> hasta <code>id</code>, y la <code>T</code> derecha por <code>F</code> hasta el otro <code>id</code>.</p>`},
      {q:"V/F justificando: «Un mismo árbol de parsing puede corresponder a más de una derivación.»",
       a:`<p><b>Verdadero.</b> El árbol <b>abstrae el orden</b> en que se aplican las producciones, así que <b>varias</b> derivaciones —que difieren solo en si reemplazaste antes un no terminal o el otro— colapsan en el <b>mismo</b> árbol (relación varios a uno). Lo que <b>no</b> puede pasar en una gramática no ambigua es que un mismo árbol tenga dos derivaciones <b>por la izquierda</b> distintas: esa correspondencia es uno a uno. La multiplicidad viene solo de mezclar el orden, no de que haya dos estructuras.</p>`}
    ]
  },
  {
    id:"4.4", titulo:"Ambigüedad: dos árboles para la misma sentencia", aho:"§4.2.5 + §4.3.2 · p.203", badges:["🎯"], estado:"dictada",
    html:`
<p>Una gramática es <b>ambigua</b> si existe <b>alguna</b> sentencia que tiene <b>dos árboles de parsing distintos</b> (equivalentemente: dos derivaciones por la izquierda distintas, o dos por la derecha). No hace falta que <b>todas</b> las sentencias sean ambiguas: con que <b>una</b> lo sea, la gramática ya es ambigua.</p>

<h3>La analogía de la frase con doble sentido</h3>
<p>En castellano, "Vi al hombre con el telescopio" tiene <b>dos lecturas</b>: ¿el telescopio lo tenía yo o el hombre? La <b>misma</b> secuencia de palabras admite dos <b>estructuras</b>. Una gramática ambigua es exactamente eso: una misma tira de tokens que se puede <b>armar</b> de dos formas distintas.</p>

<h3>El caso clásico: <code>id + id * id</code></h3>
<p>Tomá esta gramática "plana", que trata a <code>+</code> y <code>*</code> por igual:</p>
<pre><code>E → E + E | E * E | id</code></pre>
<p>La sentencia <code>id + id * id</code> tiene <b>dos</b> árboles:</p>
<ul>
<li>Uno agrupa <code>(id + id) * id</code> — la suma primero.</li>
<li>Otro agrupa <code>id + (id * id)</code> — la multiplicación primero.</li>
</ul>
<p>El segundo respeta la <b>precedencia</b> habitual (<code>*</code> antes que <code>+</code>); el primero no. Pero la gramática, como está escrita, <b>permite los dos</b>: es ambigua.</p>

<div class="callout tgt"><span class="lab">🎯 la solución correcta: cambiar las reglas (no elegir un árbol)</span>La ambigüedad se resuelve <b>reescribiendo la gramática</b>, estratificando en <b>niveles</b> que codifican precedencia y asociatividad — <b>no</b> "eligiendo uno de los dos árboles a mano". La versión no ambigua es la canónica de la cátedra:<pre><code>E → E + T | T      (+ en el nivel de E)
T → T * F | F      (* en el nivel de T, más profundo)
F → id | cte</code></pre>Como <code>*</code> vive en un nivel <b>más abajo</b> (<code>T</code>), se agrupa <b>antes</b> que <code>+</code>: la ambigüedad desaparece porque ahora <code>id + id * id</code> tiene un <b>único</b> árbol. 🎯 Y acordate del vínculo con el Parcial I: una gramática <b>ambigua</b> produce <b>conflictos</b> en la tabla SLR (desplazar/reducir o reducir/reducir), así que "es ambigua" y "no es SLR / da conflicto" van de la mano.</div>

<div class="callout aho"><span class="lab">📘 el «else colgante» y el atajo de Yacc</span>La otra fuente clásica de ambigüedad (Aho §4.3.2) es el <b>else colgante</b>: en <code>if E then if E then S else S</code>, el <code>else</code> podría colgar del <code>if</code> externo o del interno. La regla estándar es "asociar cada <code>else</code> con el <code>then</code> más cercano no relacionado", y se puede volcar a la gramática reescribiéndola con no terminales tipo <b>instrucción-relacionada</b> / <b>instrucción-abierta</b>. Aho admite que a veces conviene <b>quedarse</b> con la gramática ambigua (es más corta) y agregarle <b>reglas de desambiguación</b>; eso es lo que hace Yacc/Bison con <code>%left</code>/<code>%right</code>/precedencias. Pero ojo con la <b>divergencia</b>: en el parcial la respuesta que puntúa es "<b>se cambian las reglas</b>", porque el parche del generador deja la <b>gramática igual de ambigua</b>.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Ambigua = <b>alguna</b> sentencia tiene <b>dos árboles</b> (o dos derivaciones por izquierda) distintos.</li>
<li>🎯 Se corrige <b>cambiando las reglas</b> (estratificar en niveles E/T/F), <b>no</b> eligiendo un árbol.</li>
<li>El caso típico es <code>E → E+E | E*E | id</code> sobre <code>id + id * id</code>; el else colgante es el otro.</li>
<li>🎯 Gramática ambigua ⇒ <b>conflictos</b> en la tabla SLR (no es SLR).</li>
</ul>`,
    qa:[
      {q:"¿Cuándo una gramática es ambigua y cómo se corrige?",
       a:`<p>Es ambigua cuando <b>existe al menos una sentencia con dos árboles de parsing distintos</b> (equivalente: dos derivaciones por la izquierda distintas). Se corrige <b>reescribiendo las reglas</b>, típicamente <b>estratificando en niveles</b> (<code>E</code>, <code>T</code>, <code>F</code>) que codifican precedencia y asociatividad, de modo que cada sentencia tenga un <b>único</b> árbol. <b>No</b> se corrige "eligiendo uno de los árboles": eso no cambia la gramática. Si no se corrige, un analizador ascendente mostrará <b>conflictos</b> en la tabla (la gramática no es SLR).</p>`},
      {q:"V/F justificando: «Para desambiguar una gramática alcanza con que el parser elija siempre el primer árbol.»",
       a:`<p><b>Falso.</b> Que el generador (Yacc/Bison) resuelva el conflicto por defecto —o con declaraciones de precedencia— hace que <b>compile</b>, pero la <b>gramática sigue siendo ambigua</b>: la misma sentencia todavía tiene dos árboles posibles, solo que la herramienta descarta uno. La solución conceptual que pide la cátedra es <b>cambiar las reglas</b> (introducir niveles E/T/F) para que la ambigüedad <b>no exista</b>, y entonces haya un único árbol por construcción.</p>`},
      {q:"Mostrá los dos árboles de id + id * id con E → E+E | E*E | id e indicá cuál respeta la precedencia.",
       a:`<p>Con esa gramática plana, <code>id + id * id</code> se puede armar de dos formas: (1) agrupando <b>la suma primero</b>, <code>(id + id) * id</code> — el nodo raíz es un <code>*</code> cuyo hijo izquierdo es <code>id + id</code>; y (2) agrupando <b>la multiplicación primero</b>, <code>id + (id * id)</code> — el nodo raíz es un <code>+</code> cuyo hijo derecho es <code>id * id</code>. El que <b>respeta la precedencia</b> habitual es el <b>(2)</b>, porque <code>*</code> liga más fuerte que <code>+</code>. Que ambos árboles sean posibles es la prueba de que la gramática es ambigua; se arregla pasando a <code>E → E+T | T</code>, <code>T → T*F | F</code>, <code>F → id</code>.</p>`},
      {q:"¿Qué relación hay entre la ambigüedad de una gramática y los conflictos en un parser LR/SLR?",
       a:`<p>Una gramática <b>ambigua</b> se manifiesta como un <b>conflicto</b> en la tabla del parser ascendente: en una misma celda caen dos acciones incompatibles, ya sea <b>desplazamiento-reducción</b> (podría desplazar o reducir) o <b>reducción-reducción</b> (dos reglas distintas para reducir). El else colgante es el ejemplo canónico de conflicto desplazamiento-reducción. Por eso, en el parcial, si al armar la tabla SLR te aparece un conflicto, la conclusión correcta es declarar que la <b>gramática no es SLR</b> (habitualmente porque es ambigua), y no forzar una celda.</p>`}
    ]
  },
  {
    id:"4.5", titulo:"GLC vs ER: qué puede una y la otra no", aho:"§4.2.7 · p.205", badges:["🎯"], estado:"dictada",
    html:`
<p>Las <b>expresiones regulares</b> describen lenguajes <b>regulares</b>; las <b>gramáticas libres de contexto</b> describen lenguajes <b>libres de contexto</b>, que son un <b>superconjunto</b>. En criollo: toda ER se puede reescribir como GLC, pero <b>no</b> al revés. Cada lenguaje regular es libre de contexto; no cada libre de contexto es regular.</p>

<h3>La analogía de la memoria</h3>
<p>Una ER equivale a un <b>autómata finito</b>: una máquina con una cantidad <b>fija</b> de estados, o sea, con <b>memoria acotada</b>. Es como alguien que puede seguir una lista plana pero <b>no sabe llevar la cuenta</b> de cuántas cosas abrió. Una GLC, en cambio, admite <b>recursión</b>, que es como tener una <b>pila</b>: puede recordar "abrí un paréntesis, y otro, y otro" para exigir que se cierren todos. Por eso se dice que <b>los autómatas finitos no pueden contar</b>.</p>

<h3>Lo que una ER no puede: contar y aparear</h3>
<p>El ejemplo prototípico es el lenguaje <code>aⁿbⁿ</code> (la misma cantidad de <code>a</code> que de <code>b</code>, con n ≥ 1) y su primo, los <b>paréntesis balanceados</b>. Ninguna ER los describe: harían falta infinitos estados para recordar un contador arbitrario. Una GLC sí:</p>
<pre><code>S → ( S ) S | ε        (paréntesis balanceados)
S → a S b | a b        (a elevado a n, b elevado a n)</code></pre>
<p>La <b>recursión</b> del cuerpo (<code>S</code> dentro de <code>S</code>) es la que aporta la "memoria" que a la ER le falta.</p>

<h3>Por qué el léxico usa ER y el sintáctico GLC</h3>
<p>La <b>estructura léxica</b> (identificadores, constantes, palabras reservadas, blancos) es <b>plana</b>: se describe cómodo con ER, y encima se compila a autómatas <b>muy eficientes</b>. La <b>estructura sintáctica</b> (expresiones con paréntesis, bloques <code>begin</code>/<code>end</code>, <code>if</code>/<code>then</code>/<code>else</code>) es <b>anidada</b>: necesita el poder de las GLC. Por eso el compilador reparte el trabajo así, y no al revés.</p>

<div class="callout tgt"><span class="lab">🎯 por qué los paréntesis balanceados no son regulares</span>Para aceptar paréntesis balanceados hay que <b>contar</b> cuántos se abrieron y exigir que se cierren igual. Un autómata finito (equivalente a una ER) tiene una cantidad <b>fija</b> de estados: no puede llevar un contador que crezca sin límite. Con más de esa cantidad de aperturas, el autómata <b>repite estado</b> y ya no distingue niveles. Por eso se necesita una GLC recursiva, <code>P → ( P ) | P P | ε</code>, que sí "recuerda" el anidamiento.</div>

<div class="callout aho"><span class="lab">📘 «puede contar dos, pero no tres»</span>Aho da una construcción <b>mecánica</b> de ER (o AFN) a GLC: un no terminal por cada estado, una producción <code>Ai → a Aj</code> por cada transición, <code>Ai → ε</code> si el estado acepta. Eso prueba que todo lenguaje regular es libre de contexto. Y la frase que conviene recordar: "los autómatas finitos no pueden contar" (no aceptan <code>aⁿbⁿ</code>), mientras que "una <b>gramática</b> puede contar <b>dos</b> elementos pero <b>no tres</b>": <code>aⁿbⁿ</code> sí tiene GLC, pero <code>aⁿbⁿcⁿ</code> <b>no</b> es libre de contexto. Hay una jerarquía de poder, y cada nivel tiene su techo.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>ER ⊂ GLC</b>: los regulares son un <b>subconjunto</b> de los libres de contexto. Toda ER se pasa a GLC; no al revés.</li>
<li>🎯 Lo que una ER <b>no puede</b>: contar/aparear (<code>aⁿbⁿ</code>, paréntesis balanceados). Necesitan <b>recursión</b>.</li>
<li>El <b>léxico</b> (estructura plana) usa <b>ER</b>; el <b>sintáctico</b> (estructura anidada) usa <b>GLC</b>.</li>
<li>"Los autómatas finitos no pueden contar"; una GLC cuenta <b>dos</b> pero no <b>tres</b> (<code>aⁿbⁿcⁿ</code> no es libre de contexto).</li>
</ul>`,
    qa:[
      {q:"¿Por qué los paréntesis balanceados no se pueden describir con una expresión regular?",
       a:`<p>Porque para aceptarlos hay que <b>contar</b> cuántos paréntesis se abrieron y exigir la misma cantidad de cierres, y una ER equivale a un <b>autómata finito</b>, que tiene un número <b>fijo</b> de estados: no puede mantener un contador que crezca sin cota. Si la entrada abre más paréntesis que estados tiene el autómata, este forzosamente <b>repite un estado</b> y pierde la cuenta del nivel de anidamiento. Se necesita una <b>GLC</b>, que con recursión (<code>P → ( P ) | P P | ε</code>) sí recuerda cuántos niveles hay abiertos.</p>`},
      {q:"¿Qué relación de inclusión hay entre los lenguajes regulares y los libres de contexto? Justificá.",
       a:`<p>Los <b>lenguajes regulares</b> son un <b>subconjunto propio</b> de los <b>libres de contexto</b>: todo lenguaje regular es libre de contexto, pero no al revés. Justificación: se puede construir <b>mecánicamente</b> una GLC que reconoce lo mismo que un autómata finito (un no terminal por estado, una producción por transición), así que cualquier cosa describible por una ER lo es por una GLC. En cambio, hay lenguajes libres de contexto —como <code>aⁿbⁿ</code> o los paréntesis balanceados— que <b>ninguna</b> ER puede describir, porque requieren contar. Por eso la inclusión es estricta.</p>`},
      {q:"¿Por qué el analizador léxico usa expresiones regulares y el sintáctico usa gramáticas?",
       a:`<p>Porque describen <b>estructuras de distinta complejidad</b>. La estructura <b>léxica</b> (identificadores, constantes, palabras reservadas, blancos) es <b>plana</b>: alcanza con ER, que además se compilan a autómatas finitos muy <b>eficientes</b>. La estructura <b>sintáctica</b> (expresiones con paréntesis, bloques <code>begin-end</code>, <code>if-then-else</code>) es <b>anidada/recursiva</b>: excede a las ER y exige el poder de las <b>GLC</b>. Repartir así el trabajo mantiene cada fase simple y rápida; usar GLC para los tokens sería un cañón para matar un mosquito, y usar ER para las expresiones sería directamente imposible.</p>`},
      {q:"¿Qué significa la frase «los autómatas finitos no pueden contar» y cuál es su límite en las gramáticas?",
       a:`<p>Significa que un autómata finito (o sea, una ER) <b>no puede llevar un contador ilimitado</b>: no acepta lenguajes como <code>aⁿbⁿ</code>, donde hay que recordar cuántas <code>a</code> vinieron para exigir igual número de <code>b</code>. Las <b>GLC</b> sí pueden contar y aparear <b>dos</b> cosas (<code>aⁿbⁿ</code> tiene gramática, gracias a la recursión que actúa como pila), pero tienen su propio techo: <b>no</b> pueden aparear <b>tres</b> a la vez. El lenguaje <code>aⁿbⁿcⁿ</code> (mismo número de <code>a</code>, <code>b</code> y <code>c</code>) <b>no es libre de contexto</b>. Es una jerarquía: cada formalismo cuenta un poco más que el anterior, pero ninguno cuenta todo.</p>`}
    ]
  },
  {
    id:"4.6", titulo:"Asociatividad y precedencia en la forma de las reglas", aho:"§2.2.5–2.2.6 · p.48", badges:["🎯"], estado:"dictada",
    html:`
<p>Este es uno de los puntos más finos y más preguntados: la <b>forma</b> en que escribís las reglas <b>codifica</b> dos cosas semánticas de las expresiones — la <b>asociatividad</b> (hacia qué lado se agrupan operadores iguales) y la <b>precedencia</b> (qué operador se resuelve antes cuando son distintos). No se declaran aparte: <b>están en la gramática</b>.</p>

<h3>Asociatividad: la codifica el lado de la recursión</h3>
<p>Por convención, <code>9 - 5 - 2</code> es <code>(9 - 5) - 2</code>: el <code>-</code> <b>asocia a la izquierda</b>. Cuando un operando tiene operadores a ambos lados, hay que decidir a cuál "pertenece". Y eso lo dicta la <b>forma de la recursión</b>:</p>
<ul>
<li><b>Recursiva a la izquierda</b> (<code>E → E + T</code>): el operador asocia <b>a la izquierda</b>. El árbol crece hacia abajo-izquierda. Los cuatro operadores aritméticos son así.</li>
<li><b>Recursiva a la derecha</b> (<code>D → letra = D</code>): asocia <b>a la derecha</b>. El árbol crece hacia abajo-derecha. Es el caso de la <b>asignación</b> <code>=</code> (en C, <code>a=b=c</code> es <code>a=(b=c)</code>) y de la <b>exponenciación</b>.</li>
</ul>

<h3>Precedencia: la codifican los niveles</h3>
<p>Ahora <code>9 + 5 * 2</code>: ¿es <code>(9 + 5) * 2</code> o <code>9 + (5 * 2)</code>? La asociatividad no ayuda acá (son operadores <b>distintos</b>). Lo resuelve la <b>precedencia</b>, y en la gramática se codifica con <b>niveles estratificados</b>: el operador que está en un nivel <b>más profundo</b> (más cerca del <code>F</code>, el factor) se agrupa <b>primero</b>, o sea, tiene <b>más precedencia</b>.</p>
<pre><code>A → id := E
E → E + T | T      (+ vive en el nivel de E: menor precedencia)
T → T * F | F      (* vive en el nivel de T, más profundo: mayor precedencia)
F → id | cte</code></pre>
<p>Como <code>*</code> vive "más abajo", <code>id + id * id</code> agrupa la multiplicación antes que la suma, sin que tengas que aclararlo en ningún lado.</p>

<div class="callout tgt"><span class="lab">🎯 la pregunta exacta del parcial</span>Con <code>E → E + T</code>, <code>T → T * F</code>, <code>F → id</code>: <b>¿por qué <code>*</code> se resuelve antes que <code>+</code>?</b> Porque <code>*</code> está en un nivel <b>más profundo</b> (<code>T</code>), y lo profundo se agrupa primero. <b>¿Por qué <code>+</code> asocia a la izquierda?</b> Porque su regla es <b>recursiva a la izquierda</b> (<code>E → E + T</code>): al derivar, el término de más a la izquierda queda anidado más abajo. Las dos respuestas están <b>en la forma de las reglas</b>, no en una declaración aparte.</div>

<div class="callout aho"><span class="lab">📘 construir la gramática desde una tabla de precedencia</span>Aho (Ejemplo 2.6) da la receta inversa: partís de una <b>tabla</b> con los operadores de <b>menor a mayor</b> precedencia (una fila por nivel; misma fila = misma precedencia y asociatividad) y armás la gramática. Para <b>n niveles</b> de precedencia necesitás <b>n + 1</b> no terminales: uno por nivel más el <b>factor</b>, que es lo que "no se puede separar" (un operando suelto o una expresión entre paréntesis, que los paréntesis protegen). Cada nivel tiene una regla con su operador más una salida al nivel <b>superior</b> siguiente. La canónica de la cátedra es exactamente este esquema con dos niveles (<code>+</code> y <code>*</code>).</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La <b>asociatividad</b> la codifica el <b>lado de la recursión</b>: izquierda (<code>E→E+T</code>) ⇒ asocia a izquierda; derecha (<code>D→letra=D</code>) ⇒ a derecha.</li>
<li>La <b>precedencia</b> la codifican los <b>niveles</b>: el operador del nivel <b>más profundo</b> (cerca de <code>F</code>) se agrupa <b>primero</b>.</li>
<li>🎯 En la canónica, <code>*</code> gana a <code>+</code> por estar en <code>T</code> (más abajo), y <code>+</code> asocia a izquierda por ser <code>E → E + T</code>.</li>
<li>Para <b>n niveles</b> de precedencia, <b>n + 1</b> no terminales (Aho).</li>
</ul>`,
    qa:[
      {q:"En E→E+T, T→T*F, F→id, ¿por qué * se resuelve antes que + y por qué + asocia a la izquierda?",
       a:`<p><code>*</code> se resuelve <b>antes</b> porque está en un nivel <b>más profundo</b> de la gramática (<code>T</code>, más cerca del factor <code>F</code>), y lo que está más abajo se agrupa primero: eso <b>es</b> tener mayor precedencia. Y <code>+</code> asocia a la <b>izquierda</b> porque su regla es <b>recursiva a la izquierda</b> (<code>E → E + T</code>): al derivar, la parte izquierda vuelve a ser una <code>E</code> que se anida más abajo, de modo que en <code>a + b + c</code> se agrupa <code>(a + b) + c</code>. Ambas propiedades salen de la <b>forma</b> de las reglas, no de una declaración externa.</p>`},
      {q:"¿Cómo escribirías una regla para un operador asociativo a la derecha, como la asignación = o la exponenciación?",
       a:`<pre><code>D → letra = D | letra
letra → a | b | ... | z</code></pre><p>La clave es hacer la regla <b>recursiva a la derecha</b>: el no terminal se repite del <b>lado derecho</b> del operador (<code>D → letra = D</code>). Así <code>a = b = c</code> se agrupa como <code>a = (b = c)</code> y el árbol crece hacia abajo-derecha. Es el caso del operador de asignación <code>=</code> en C y de la exponenciación. Contrastá con la suma, que al ser recursiva a izquierda (<code>E → E + T</code>) agrupa <code>(a + b) + c</code>.</p>`},
      {q:"¿Cuál es la diferencia entre asociatividad y precedencia? Ilustrá con 9-5-2 y 9+5*2.",
       a:`<p>La <b>asociatividad</b> resuelve qué pasa con <b>operadores iguales</b> (o de la misma precedencia) alrededor de un operando: en <code>9 - 5 - 2</code>, como <code>-</code> asocia a izquierda, se lee <code>(9 - 5) - 2</code>. La <b>precedencia</b> resuelve qué pasa con operadores <b>distintos</b>: en <code>9 + 5 * 2</code>, como <code>*</code> tiene mayor precedencia que <code>+</code>, se lee <code>9 + (5 * 2)</code>. La asociatividad <b>no</b> alcanza para <code>9 + 5 * 2</code> porque los operadores son diferentes; ahí manda la precedencia. En la gramática, la asociatividad la da el lado de la recursión y la precedencia la dan los niveles.</p>`},
      {q:"Según Aho, ¿cuántos no terminales necesitás para una gramática de expresiones con n niveles de precedencia?",
       a:`<p>Necesitás <b>n + 1</b> no terminales: <b>uno por cada nivel</b> de precedencia, más el <b>factor</b>, que representa las unidades básicas que "no se pueden separar" (un operando suelto o una expresión entre paréntesis). Cada no terminal de nivel tiene una producción con el operador de ese nivel y una salida al nivel inmediatamente <b>superior</b> (de mayor precedencia). La gramática canónica de la cátedra es este esquema con <b>dos</b> niveles (<code>+</code> en <code>E</code>, <code>*</code> en <code>T</code>) más el factor <code>F</code>: 2 + 1 = 3 no terminales de expresión.</p>`}
    ]
  },
  {
    id:"4.7", titulo:"Eliminación de la recursividad por la izquierda", aho:"§4.3.3 · p.212", badges:["🎯"], estado:"dictada",
    html:`
<p>Acá empieza la "cocina" que prepara una gramática para el <b>parsing descendente</b> (módulo 5). El primer problema: el descendente <b>entra en bucle infinito</b> con reglas <b>recursivas a la izquierda</b>. Hay que eliminarlas <b>sin cambiar el lenguaje</b>.</p>

<h3>Por qué el descendente muere</h3>
<p>Con <code>E → E + T</code>, el descendente, para reconocer una <code>E</code>, arranca aplicando <code>E → E + T</code>… y lo primero que tiene que reconocer es otra <code>E</code>, así que vuelve a aplicar <code>E → E + T</code>, y otra vez, <b>sin consumir ningún token</b>. Es una función que se llama a sí misma sin avanzar: recursión infinita.</p>

<h3>La analogía de la fila mal ordenada</h3>
<p>Recursión izquierda es como decir "yo soy: <b>toda la fila</b>, y atrás mío una persona más". Para saber quién sos, primero tenés que resolver "toda la fila"… que otra vez es "toda la fila y uno más". No termina nunca. La transformación lo <b>da vuelta</b>: "yo soy: <b>una persona</b>, y después el <b>resto</b> de la fila", donde el resto puede estar <b>vacío</b>. Ahora sí arrancás por algo concreto.</p>

<h3>La transformación (regla general de Aho)</h3>
<p>El par recursivo a izquierda</p>
<pre><code>A → A α | β</code></pre>
<p>se reescribe con un no terminal nuevo <code>A'</code> y una salida por <code>ε</code>:</p>
<pre><code>A  → β A'
A' → α A' | ε</code></pre>
<p>Aplicado a la canónica, <code>E → E + T | T</code> y <code>T → T * F | F</code> quedan:</p>
<pre><code>A  → id := E
E  → T E'
E' → + T E' | ε
T  → F T'
T' → * F T' | ε
F  → id | cte</code></pre>
<p>Esta es la gramática que vas a usar para todo el módulo 5. Genera <b>exactamente el mismo lenguaje</b> que la canónica; solo cambió la <b>forma</b>. (La cátedra suele escribir la vacía como <b>λ</b> en vez de <b>ε</b>: es lo mismo.)</p>

<div class="callout tgt"><span class="lab">🎯 lo que no tenés que confundir</span>La transformación <b>no cambia el lenguaje</b> ni la semántica: sigue siendo suma y multiplicación asociativas a izquierda. Solo la <b>reescribís</b> para que el descendente pueda arrancar por algo concreto (<code>T</code>) y no por sí misma. Y acordate del contraste con el <b>ascendente</b>: al parsing <b>LR le da igual</b> la recursividad (izquierda o derecha); esta cocina es <b>exclusiva del descendente</b>.</div>

<div class="callout aho"><span class="lab">📘 recursión indirecta y el caso general</span>La regla de arriba borra la recursión <b>inmediata</b> (<code>A → A α</code>). Pero hay recursión <b>indirecta</b>, de dos o más pasos: por ejemplo <code>S → A a | b</code>, <code>A → A c | S d | ε</code>, donde <code>S ⇒ A a ⇒ S d a</code> es recursiva a izquierda sin que se vea a simple vista. Para esos casos Aho da el <b>Algoritmo 4.19</b>: ordenar los no terminales y sustituir sistemáticamente cada <code>Ai → Aj γ</code> (con j &lt; i) por las producciones de <code>Aj</code>, y recién ahí borrar la inmediata. La cátedra se queda con el caso inmediato, que es el que aparece en la canónica.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El descendente <b>cicla</b> con recursión izquierda (<code>A → A α</code>): la regla se llama a sí misma sin consumir entrada.</li>
<li>Transformación: <code>A → A α | β</code> se vuelve <code>A → β A'</code> y <code>A' → α A' | ε</code>.</li>
<li>🎯 <b>Conserva el lenguaje</b>; solo cambia la forma. Al <b>ascendente</b> no le hace falta (le da igual la recursividad).</li>
<li>La canónica transformada: <code>E → T E'</code>, <code>E' → + T E' | ε</code>, <code>T → F T'</code>, <code>T' → * F T' | ε</code>, <code>F → id | cte</code>.</li>
</ul>`,
    qa:[
      {q:"Eliminá la recursividad por la izquierda de E → E + T | T.",
       a:`<pre><code>E  → T E'
E' → + T E' | ε</code></pre><p>Aplico la regla general <code>A → A α | β</code> ⟶ <code>A → β A'</code>, <code>A' → α A' | ε</code>, con <code>α = + T</code> (la parte recursiva) y <code>β = T</code> (la no recursiva). La recursión se muda a un no terminal nuevo <code>E'</code>, que repite <code>+ T</code> cero o más veces y sale por <code>ε</code>. El lenguaje generado es idéntico: sigue siendo una lista de términos separados por <code>+</code>.</p>`},
      {q:"¿Por qué el parsing descendente no puede manejar una gramática recursiva por la izquierda?",
       a:`<p>Porque en el descendente hay un procedimiento por cada no terminal, y ante <code>A → A α</code> el procedimiento de <code>A</code> se <b>invoca a sí mismo de inmediato</b>, <b>sin haber consumido ningún token</b> de entrada. No hay avance entre una llamada y la siguiente, así que la recursión <b>nunca toca fondo</b>: bucle infinito. Incluso con rastreo hacia atrás sigue ciclando. Por eso, antes de aplicar cualquier método descendente, hay que <b>eliminar</b> la recursividad por la izquierda reescribiendo las reglas.</p>`},
      {q:"La transformación que elimina la recursividad izquierda, ¿cambia el lenguaje generado? Justificá.",
       a:`<p><b>No</b>, genera exactamente el <b>mismo lenguaje</b>. Lo único que cambia es la <b>forma</b> de las reglas: donde antes decías "una <code>E</code> es una <code>E</code> seguida de <code>+ T</code>", ahora decís "una <code>E</code> es una <code>T</code> seguida de cero o más <code>+ T</code>" (<code>E → T E'</code>, <code>E' → + T E' | ε</code>). Las cadenas que se derivan son idénticas —listas de términos separados por <code>+</code>— y hasta la asociatividad a izquierda se conserva. Se reescribe solo para que el descendente pueda arrancar por algo concreto en vez de por sí misma.</p>`},
      {q:"¿Al parsing ascendente le hace falta eliminar la recursividad por la izquierda? ¿Por qué?",
       a:`<p><b>No.</b> Al ascendente (LR/SLR) le es <b>indiferente</b> que la gramática sea recursiva a izquierda o a derecha: puede parsear las dos. La eliminación de recursividad izquierda es una preparación <b>exclusiva del descendente</b>, que sí cicla con ella. De hecho, para el ascendente conviene la recursión <b>a izquierda</b> porque mantiene la pila más corta. Por eso en el módulo de SLR se trabaja con la canónica <b>tal cual</b> (recursiva a izquierda), y solo acá, para el descendente, la transformamos.</p>`}
    ]
  },
  {
    id:"4.8", titulo:"Factorización por la izquierda", aho:"§4.3.4 · p.214", badges:["🎯"], estado:"dictada",
    html:`
<p>El segundo arreglo para el descendente <b>predictivo</b>: si dos producciones del mismo no terminal <b>empiezan igual</b>, el parser —que decide mirando <b>un solo token</b>— no sabe cuál elegir. La <b>factorización por la izquierda</b> saca el prefijo común y <b>difiere</b> la decisión hasta tener más información.</p>

<h3>La analogía de la bifurcación</h3>
<p>Imaginá dos rutas que arrancan <b>por el mismo tramo</b> y recién se separan más adelante. No tiene sentido pedirte que elijas en la esquina inicial, donde todavía se ven iguales: caminás el <b>tramo común</b> y decidís en la <b>bifurcación</b>, cuando ya se distinguen. Factorizar es exactamente eso con las reglas.</p>

<h3>La transformación</h3>
<p>Dos producciones con prefijo común <code>α</code>:</p>
<pre><code>A → α β1 | α β2</code></pre>
<p>se reescriben sacando <code>α</code> a un no terminal nuevo <code>A'</code>:</p>
<pre><code>A  → α A'
A' → β1 | β2</code></pre>
<p>Ejemplo mínimo: <code>A → a b C | a b D</code> se factoriza como <code>A → a b A'</code>, <code>A' → C | D</code>. Reconocés <code>a b</code> primero, y recién ahí decidís entre <code>C</code> y <code>D</code>.</p>

<h3>El caso emblemático: <code>if-then</code> vs <code>if-then-else</code></h3>
<p>Estas dos reglas comparten un prefijo enorme:</p>
<pre><code>S → if E then S | if E then S else S</code></pre>
<p>Al ver <code>if</code>, el predictivo no puede saber cuál es. Factorizando el prefijo <code>if E then S</code>:</p>
<pre><code>S  → if E then S S'
S' → else S | ε</code></pre>
<p>Ahora reconocés <code>if E then S</code> y, cuando llegás al final, mirás si viene un <code>else</code> (regla <code>S' → else S</code>) o no (<code>S' → ε</code>).</p>

<div class="callout tgt"><span class="lab">🎯 por qué es requisito de LL(1)</span>El predictivo LL(1) elige la producción mirando <b>un</b> token de anticipación. Si dos alternativas de un no terminal empiezan con el <b>mismo</b> token, ese token no alcanza para decidir: hay conflicto. Factorizar por la izquierda <b>elimina los prefijos comunes</b>, condición necesaria (junto con no tener recursión izquierda) para que una gramática sea <b>LL(1)</b>. Regla práctica: primero eliminás recursión izquierda (4.7), después factorizás (4.8).</div>

<div class="callout aho"><span class="lab">📘 factorizar NO elimina la ambigüedad</span>Cuidado con una confusión típica: la gramática factorizada del <code>if</code> <b>sigue siendo ambigua</b> (es el else colgante). Con la entrada <code>else</code>, el no terminal <code>S'</code> tiene <b>dos</b> caminos posibles (<code>S' → else S</code> o <code>S' → ε</code>), y ahí la tabla predictiva queda con dos producciones en la misma celda. Factorizar solo saca <b>prefijos comunes</b>; la <b>ambigüedad</b> es otro problema, y se resuelve por convención eligiendo <code>S' → else S</code> (asociar el <code>else</code> al <code>then</code> más cercano). O sea: factorización y desambiguación son dos arreglos distintos.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Si dos reglas del mismo no terminal comparten prefijo, el predictivo (un token) no puede elegir: hay que <b>factorizar</b>.</li>
<li>Transformación: <code>A → α β1 | α β2</code> se vuelve <code>A → α A'</code>, <code>A' → β1 | β2</code>.</li>
<li>🎯 Es <b>requisito para LL(1)</b>, junto con no tener recursión izquierda. Orden: primero desrecursivizar, después factorizar.</li>
<li>📘 Factorizar <b>no</b> elimina la ambigüedad (el else colgante sigue ambiguo).</li>
</ul>`,
    qa:[
      {q:"Factorizá por la izquierda A → a b C | a b D.",
       a:`<pre><code>A  → a b A'
A' → C | D</code></pre><p>Saco el prefijo común <code>a b</code> a un no terminal nuevo <code>A'</code> y dejo la decisión (<code>C</code> o <code>D</code>) para después de haberlo reconocido. Así el predictivo no tiene que elegir en el arranque, cuando ambas alternativas se ven iguales, sino recién en la bifurcación, cuando ya hay información suficiente para distinguir.</p>`},
      {q:"¿Por qué hace falta factorizar una gramática para poder construir un parser predictivo?",
       a:`<p>Porque el predictivo (LL(1)) decide qué producción aplicar mirando <b>un solo token</b> de anticipación. Si dos producciones del mismo no terminal <b>empiezan con el mismo símbolo</b>, ese token es <b>ambiguo</b>: no distingue entre ellas, y el parser no puede elegir sin adivinar o retroceder. Factorizar por la izquierda saca el <b>prefijo común</b> y difiere la decisión hasta que las alternativas se separan, momento en el cual un token sí alcanza. Por eso, junto con la eliminación de recursividad izquierda, es un requisito para que la gramática sea LL(1).</p>`},
      {q:"Factorizá S → if E then S | if E then S else S.",
       a:`<pre><code>S  → if E then S S'
S' → else S | ε</code></pre><p>El prefijo común es <code>if E then S</code>; lo saco y meto la diferencia (tener <code>else</code> o no) en un no terminal nuevo <code>S'</code>, que va por <code>else S</code> o por <code>ε</code>. Así el parser reconoce primero <code>if E then S</code> y recién al final decide, según venga o no un <code>else</code>. Nota: esta gramática factorizada <b>sigue siendo ambigua</b> (else colgante), lo que se resuelve aparte eligiendo la alternativa <code>S' → else S</code>.</p>`},
      {q:"V/F justificando: «Factorizar por la izquierda elimina la ambigüedad de una gramática.»",
       a:`<p><b>Falso.</b> Factorizar solo elimina los <b>prefijos comunes</b> entre las alternativas de un no terminal; es un arreglo para que el predictivo pueda decidir con un token. La <b>ambigüedad</b> es un problema distinto (dos árboles para una misma sentencia) y puede <b>persistir</b> después de factorizar: el caso típico es el <b>else colgante</b>, cuya gramática factorizada (<code>S → if E then S S'</code>, <code>S' → else S | ε</code>) todavía admite dos análisis para el <code>else</code>. Esa ambigüedad se resuelve por convención (asociar el <code>else</code> al <code>then</code> más cercano), no factorizando.</p>`}
    ]
  },
  {
    id:"4.9", titulo:"Taller: escribir BNF desde un enunciado", aho:"Parcial 2016", badges:["⚙️","🎯"], estado:"dictada",
    html:`
<p>Esta es la lección-taller del módulo: dado un <b>enunciado en castellano</b>, escribir una <b>gramática en BNF</b> que reconozca ese lenguaje. Es un ejercicio real del Parcial 2016 y aparece seguido. La clave no es "saber la respuesta", sino tener un <b>método</b>.</p>

<h3>Qué es BNF (para nombrarlo bien)</h3>
<p><b>BNF</b> (Backus-Naur Form) es el <b>metalenguaje</b> que propuso <b>John Backus</b>, usando las reglas generativas de <b>Chomsky</b>, para definir la sintaxis de ALGOL. Es, ni más ni menos, la notación de las GLC: no terminales (a veces entre <code>&lt; &gt;</code>), terminales, el <code>→</code> (o <code>::=</code>) y la barra <code>|</code> para alternativas. Recordá: los <b>terminales no se definen</b>.</p>

<h3>La consigna (Parcial 2016)</h3>
<p>"Escribir una gramática que reconozca <b>listas</b> que pueden contener <b>nodos</b> (un <code>NUM</code> o un <code>SYM</code>) o <b>listas anidadas</b>, encerradas entre <b>paréntesis</b>, y que <b>pueden estar vacías</b>. Un programa es una o más líneas."</p>
<p>Ejemplos válidos: <code>NUM</code> · <code>( NUM SYM )</code> · <code>( SYM ( ) NUM ( NUM SYM ) )</code>.</p>

<h3>El método, paso a paso</h3>
<ul>
<li><b>Identificá los terminales</b> (los tokens): <code>NUM</code>, <code>SYM</code>, <code>(</code> y <code>)</code>.</li>
<li><b>Detectá lo "uno o más"</b>: un programa es una o más líneas ⟶ <b>recursión</b> (<code>PROG → PROG LINEA | LINEA</code>).</li>
<li><b>Detectá lo anidado</b>: una lista puede contener otras listas ⟶ la regla de la lista se usa <b>a sí misma</b> (vía <code>LINEA</code>).</li>
<li><b>Detectá lo "vacío"</b>: una lista puede estar vacía ⟶ una alternativa <code>( )</code>.</li>
</ul>

<h3>La resolución</h3>
<pre><code>PROG  → PROG LINEA | LINEA
LINEA → NODO | LISTA
LISTA → ( ELEM ) | ( )
ELEM  → ELEM LINEA | LINEA
NODO  → NUM | SYM</code></pre>
<p>Verificá con el ejemplo grande <code>( SYM ( ) NUM ( NUM SYM ) )</code>: es una <code>LISTA</code> = <code>( ELEM )</code>, donde <code>ELEM</code> son cuatro líneas: <code>SYM</code> (nodo), <code>( )</code> (lista vacía), <code>NUM</code> (nodo) y <code>( NUM SYM )</code> (otra lista). Cierra: la gramática lo genera.</p>

<div class="callout tgt"><span class="lab">⚙️🎯 las tres claves y cómo cerrar el ejercicio</span>Casi todo enunciado de BNF se arma con tres piezas: <b>recursión</b> para "uno o más" (<code>PROG → PROG LINEA</code>), una <b>alternativa vacía</b> para "puede no estar" (<code>LISTA → ( )</code>, o directamente <code>X → ... | ε</code>), y la <b>autorreferencia</b> para el <b>anidamiento</b> (<code>ELEM</code> contiene <code>LINEA</code>, que puede ser <code>LISTA</code>). Para <b>cerrar</b>: agarrá <b>cada ejemplo válido</b> del enunciado y mostrá que se deriva; si alguno no sale, te faltó una regla. Como es para el Parcial I (ascendente), la <b>recursión a izquierda no molesta</b>.</div>

<div class="callout aho"><span class="lab">📘 dónde poner la vacía: adentro o afuera</span>Ojo con <b>qué</b> puede estar vacío. Si lo vacío es la <b>lista</b>, la vacía va <b>adentro</b> (<code>LISTA → ( )</code>). Si lo que puede faltar es <b>toda</b> una construcción (por ejemplo "una lista de identificadores separados por coma que puede ser vacía"), la vacía va en el <b>tope</b> de esa construcción: <code>L → id R | ε</code> con <code>R → , id R | ε</code>. Poner la <code>ε</code> en el lugar equivocado cambia el lenguaje: puede colar cadenas que no querías (como comas sueltas) o rechazar la cadena vacía que sí debías aceptar.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>BNF</b> = metalenguaje de <b>Backus</b> (reglas de <b>Chomsky</b>) para ALGOL; es la notación de las GLC.</li>
<li>⚙️ Método: terminales ⟶ "uno o más" con <b>recursión</b> ⟶ anidamiento con <b>autorreferencia</b> ⟶ vacío con <b>alternativa <code>ε</code></b>.</li>
<li>La lista vacía sale de <code>LISTA → ( )</code>; el anidamiento, de que <code>ELEM</code>/<code>LINEA</code> puedan volver a ser una <code>LISTA</code>.</li>
<li>🎯 <b>Cerrá</b> el ejercicio verificando que <b>todos</b> los ejemplos del enunciado se derivan.</li>
</ul>`,
    qa:[
      {q:"Escribí una BNF: un programa es una o más líneas; cada línea es un nodo (NUM o SYM) o una lista; una lista va entre paréntesis y puede estar vacía o contener líneas.",
       a:`<pre><code>PROG  → PROG LINEA | LINEA
LINEA → NODO | LISTA
LISTA → ( ELEM ) | ( )
ELEM  → ELEM LINEA | LINEA
NODO  → NUM | SYM</code></pre><p>El "una o más líneas" sale de la recursión <code>PROG → PROG LINEA | LINEA</code>. La <b>lista vacía</b> sale de la alternativa <code>LISTA → ( )</code>. El <b>anidamiento</b> (listas dentro de listas) sale de que <code>ELEM</code> contiene <code>LINEA</code> y <code>LINEA</code> puede ser <code>LISTA</code>. Los terminales <code>NUM</code>, <code>SYM</code>, <code>(</code> y <code>)</code> no se definen.</p>`},
      {q:"En esa gramática, ¿qué reglas concretas logran «puede estar vacía» y «listas anidadas»?",
       a:`<p><b>Puede estar vacía</b>: la alternativa <code>LISTA → ( )</code>, un par de paréntesis sin contenido adentro. <b>Listas anidadas</b>: la <b>autorreferencia</b> indirecta — <code>LISTA → ( ELEM )</code>, <code>ELEM</code> está hecho de <code>LINEA</code>, y <code>LINEA → LISTA</code>; entonces una lista puede contener otra lista, en cualquier profundidad. Si sacaras <code>LINEA → LISTA</code>, perderías el anidamiento; si sacaras <code>LISTA → ( )</code>, no podrías aceptar la lista vacía.</p>`},
      {q:"¿Qué es BNF y de dónde viene?",
       a:`<p><b>BNF</b> (Backus-Naur Form) es el <b>metalenguaje</b> con el que se escribe la sintaxis de un lenguaje: no terminales, terminales, el símbolo <code>→</code> (o <code>::=</code>) y la barra <code>|</code> para las alternativas. Lo propuso <b>John Backus</b>, apoyándose en las <b>reglas generativas de Chomsky</b>, para definir la sintaxis de <b>ALGOL</b>. Es, en la práctica, la notación de las gramáticas libres de contexto: cuando te piden "escribí la BNF", te están pidiendo la GLC de ese lenguaje. Recordá que en BNF los <b>terminales no se definen</b>.</p>`},
      {q:"Escribí una gramática para una lista de identificadores separados por coma que admita la lista vacía.",
       a:`<pre><code>L → id R | ε
R → , id R | ε</code></pre><p>El caso <b>vacío</b> lo cubre <code>L → ε</code> (la lista puede no tener ningún <code>id</code>). Si hay al menos uno, va <code>id</code> seguido de <code>R</code>, el "resto", que agrega cero o más <code>, id</code> y cierra con <code>ε</code>. Así se aceptan la cadena vacía, <code>id</code>, <code>id , id</code>, etc., pero <b>no</b> cadenas mal formadas como una coma suelta o <code>id ,</code>. Fijate que la <code>ε</code> de la vacía va en el <b>tope</b> (<code>L</code>), no adentro, porque lo que puede faltar es <b>toda</b> la lista.</p>`}
    ]
  },
  {
    id:"4.10", titulo:"Errores sintácticos: detección y recuperación", aho:"§4.1.3–4.1.4 · p.194", badges:["🎯"], estado:"dictada",
    html:`
<p>El sintáctico es, de todas las fases, la que <b>más</b> errores atrapa. Detecta un error cuando el flujo de tokens que le manda el léxico <b>no puede seguir analizándose</b> según la gramática: no hay ninguna regla (ni acción en la tabla) que aplique al token actual.</p>

<h3>La analogía de la lectura en voz alta</h3>
<p>Leés una oración y de golpe la gramática "no cierra": falta un verbo, sobra una coma. Ahí frenás. Si sos prolijo, no abandonás todo el párrafo: <b>saltás hasta el próximo punto</b> y seguís leyendo, para no perderte el resto. Esa es la esencia de la <b>recuperación</b>: detectar el error, avisar, y <b>reengancharse</b> para poder encontrar más.</p>

<h3>Los cuatro niveles de error (Aho)</h3>
<p>Conviene tener claro qué es "sintáctico" y qué no:</p>
<table>
<tr><th>Nivel</th><th>Ejemplo</th><th>Quién lo atrapa</th></tr>
<tr><td>Léxico</td><td>identificador mal escrito, comillas sin cerrar</td><td>autómata del léxico</td></tr>
<tr><td>Sintáctico</td><td>falta un <code>;</code>, llaves de más o de menos, <code>case</code> sin <code>switch</code></td><td>analizador sintáctico</td></tr>
<tr><td>Semántico</td><td>conflicto de tipos, <code>return</code> con valor en un método <code>void</code></td><td>análisis semántico</td></tr>
<tr><td>Lógico</td><td>usar <code>=</code> en vez de <code>==</code> (compila, pero no hace lo que querías)</td><td>nadie: el programa está "bien formado"</td></tr>
</table>

<h3>Detección temprana: la propiedad de prefijo viable</h3>
<p>Los métodos <b>LL</b> y <b>LR</b> detectan el error <b>lo antes posible</b>: tienen la <b>propiedad de prefijo viable</b>, o sea, se dan cuenta apenas ven un <b>prefijo</b> de la entrada que <b>ya no</b> puede completarse para formar una cadena válida. No siguen de largo acumulando; frenan en el primer token imposible.</p>

<h3>Las estrategias de recuperación (Aho §4.1.4)</h3>
<ul>
<li><b>Modo pánico</b>: al detectar el error, <b>descartar tokens</b> hasta encontrar uno de un conjunto de <b>sincronización</b> (típicamente delimitadores claros como <code>;</code> o <code>}</code>). Es la más simple y <b>nunca cicla infinito</b>, aunque puede saltear bastante entrada sin revisar.</li>
<li><b>A nivel de frase</b>: hacer una <b>corrección local</b> — sustituir una coma por un <code>;</code>, borrar un <code>;</code> de más, insertar uno que falta. Cuidado con no meter un bucle infinito (insertar siempre algo delante del token actual).</li>
<li><b>Producciones de error</b>: <b>aumentar la gramática</b> con reglas que generan los errores <b>comunes</b>, para dar un diagnóstico bien preciso cuando se usan.</li>
<li><b>Corrección global</b>: buscar la <b>mínima</b> cantidad de cambios (inserciones, borrados, sustituciones) que vuelven válida la entrada. Es óptima pero <b>demasiado cara</b> en tiempo y espacio: solo interés teórico.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 la trampa del = vs == y del «parece sintáctico»</span>Dos finezas de parcial. Primero: <code>if (a = b)</code> en C (asignación en vez de comparación) es un error <b>lógico</b>, no sintáctico: el programa está <b>bien formado</b>, compila, pero no hace lo que pretendías; ninguna fase lo "detecta". Segundo: Aho advierte que <b>muchos errores parecen sintácticos</b> aunque su causa sea otra, porque <b>salen a la luz</b> cuando el parsing no puede continuar. El <code>case</code> sin <code>switch</code>, por ejemplo, a veces lo <b>acepta</b> el sintáctico y lo atrapa una fase posterior.</div>

<div class="callout aho"><span class="lab">📘 los objetivos del manejo de errores</span>Aho fija tres metas, fáciles de enunciar y difíciles de cumplir: (1) <b>reportar</b> los errores con claridad y precisión (como mínimo, <b>dónde</b> se detectó — de ahí que el léxico cuente las líneas); (2) <b>recuperarse</b> rápido para poder detectar los <b>siguientes</b>; (3) agregar <b>sobrecarga mínima</b> al procesar programas correctos. Y una nota práctica: si los errores se apilan, más vale que el compilador <b>desista</b> tras cierto límite antes que largar una avalancha de errores "falsos" en cascada.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El sintáctico detecta el error cuando <b>ninguna regla/acción aplica</b> al token actual (celda vacía en la tabla).</li>
<li>🎯 <b>Niveles</b>: léxico, <b>sintáctico</b>, semántico, <b>lógico</b> (<code>=</code> por <code>==</code> es lógico, no sintáctico).</li>
<li><b>Prefijo viable</b>: LL y LR detectan el error <b>lo antes posible</b>.</li>
<li>Estrategias: <b>modo pánico</b>, <b>nivel de frase</b>, <b>producciones de error</b>, <b>corrección global</b>.</li>
</ul>`,
    qa:[
      {q:"¿Cómo detecta el analizador sintáctico un error y en qué consiste la recuperación en modo pánico?",
       a:`<p>Detecta un error cuando, con el <b>token actual</b>, <b>no hay ninguna regla ni acción aplicable</b> según la gramática (en la tabla del parser, la celda correspondiente está vacía): el flujo de tokens ya no puede seguir analizándose. El <b>modo pánico</b> es la recuperación más simple: se <b>descartan tokens</b> de la entrada, uno a uno, hasta encontrar un token de un <b>conjunto de sincronización</b> (habitualmente delimitadores claros como <code>;</code> o <code>}</code>), y desde ahí se continúa. Es fácil de implementar y tiene la garantía de <b>no entrar en bucle infinito</b>, aunque puede saltear un tramo de entrada sin revisarlo.</p>`},
      {q:"Clasificá cada uno en léxico, sintáctico, semántico o lógico: (a) identificador mal escrito; (b) falta un punto y coma; (c) return con valor en un método void; (d) usar = en vez de ==.",
       a:`<p>(a) <b>Léxico</b>: el mal tipeo de un identificador (o comillas sin cerrar) lo maneja el autómata del léxico. (b) <b>Sintáctico</b>: falta un <code>;</code> o hay llaves desbalanceadas — la secuencia de tokens no encaja en ninguna regla. (c) <b>Semántico</b>: un <code>return</code> con valor en un método <code>void</code> es un conflicto de tipos, se detecta consultando la información de tipos. (d) <b>Lógico</b>: usar <code>=</code> (asignación) donde querías <code>==</code> (comparación); el programa está <b>bien formado</b> y compila, pero no refleja tu intención — <b>ninguna</b> fase lo detecta.</p>`},
      {q:"¿Qué es la propiedad de prefijo viable y qué ventaja da?",
       a:`<p>Es la propiedad de los métodos <b>LL</b> y <b>LR</b> por la cual detectan un error <b>tan pronto</b> como leen un <b>prefijo</b> de la entrada que <b>ya no puede</b> completarse para formar una cadena válida del lenguaje. La ventaja es la <b>detección temprana</b>: el parser frena en el <b>primer</b> token imposible, en vez de arrastrar el error y reportarlo lejos de donde ocurrió. Eso hace que el mensaje de error apunte a un lugar <b>cercano</b> a la causa real, que es justo lo que necesita el programador para corregir.</p>`},
      {q:"Nombrá las estrategias de recuperación de errores sintácticos y decí cuál es la más simple y cuál la más costosa.",
       a:`<p>Son cuatro: <b>modo pánico</b> (descartar tokens hasta un token de sincronización), <b>a nivel de frase</b> (corrección local: insertar/borrar/sustituir un token), <b>producciones de error</b> (aumentar la gramática con reglas para los errores comunes) y <b>corrección global</b> (hallar el mínimo número de cambios que vuelven válida la entrada). La <b>más simple</b> es el <b>modo pánico</b> —y además tiene la ventaja de no ciclar—; la <b>más costosa</b> es la <b>corrección global</b>, que es óptima en teoría pero demasiado cara en tiempo y espacio, por lo que en la práctica no se usa.</p>`}
    ]
  }
]});

M.push({ id:5, titulo:"Parsing descendente", parcial:"I",
  resumen:"El parsing descendente (top-down, LL): descenso recursivo y por qué muere con la recursividad por la izquierda, cómo se calculan PRIMERO y SIGUIENTE, qué es una gramática LL(1), la tabla predictiva con pila explícita y la recuperación de errores en el predictivo.",
  lecciones:[
  {
    id:"5.1", titulo:"Descendente, descenso recursivo y por qué muere con recursión izquierda", aho:"§4.4.1 · p.219", badges:["🎯"], estado:"dictada",
    html:`
<p>El <b>parsing descendente (top-down)</b> construye el árbol <b>desde la raíz</b> (el símbolo distinguido) <b>hacia las hojas</b>, creando los nodos en <b>preorden</b>. Visto de otra forma, es <b>buscar una derivación por la izquierda</b> para la entrada. Se lo llama <b>LL</b>.</p>

<h3>La analogía del diseño top-down</h3>
<p>Es como resolver un problema grande <b>partiéndolo en subproblemas</b>: "para reconocer una asignación, primero un <code>id</code>, después un <code>:=</code>, después una expresión". Cada no terminal es una <b>función</b> que "sabe reconocerse a sí misma" llamando a las funciones de sus componentes. Vas <b>de arriba hacia abajo</b>: del todo a las partes.</p>

<h3>Descenso recursivo</h3>
<p>La forma más directa del descendente es el <b>descenso recursivo</b>: un <b>procedimiento por cada no terminal</b>. La ejecución arranca con el procedimiento del <b>símbolo inicial</b> y termina con éxito si se consumió toda la entrada. El esqueleto (Aho) es:</p>
<pre><code>void A() {
   elegir una produccion A → X1 X2 ... Xk;
   for ( i = 1 a k ) {
      if ( Xi es no terminal )  llamar al procedimiento Xi();
      else if ( Xi coincide con el token actual )  avanzar la entrada;
      else  error();
   }
}</code></pre>
<p>En su forma general puede requerir <b>rastreo hacia atrás</b> (backtracking): probar una producción, y si falla, <b>restaurar el puntero de entrada</b> y probar otra. En la práctica casi no se usa: es ineficiente, y las construcciones de los lenguajes de programación se dejan analizar sin retroceso. El caso especial <b>sin</b> backtracking es el <b>predictivo</b> (lecciones 5.2 a 5.5).</p>

<div class="callout tgt"><span class="lab">🎯 por qué muere con recursión izquierda</span>Si la gramática tiene <code>A → A α</code>, el procedimiento <code>A()</code> arranca eligiendo esa producción y su primer paso es… <b>llamar a <code>A()</code></b>, sin haber consumido ningún token. Y ese <code>A()</code> vuelve a llamar a <code>A()</code>, y así: <b>recursión infinita</b>. Ni siquiera el backtracking lo salva (nunca avanza para poder fallar). Por eso, <b>antes</b> de aplicar cualquier método descendente, hay que <b>eliminar la recursividad por la izquierda</b> (lección 4.7). Es la limitación estrella del descendente, y el contraste con el ascendente, al que la recursividad le da igual.</div>

<div class="callout aho"><span class="lab">📘 el ejemplo del backtracking</span>Aho ilustra el retroceso con <code>S → c A d</code>, <code>A → a b | a</code> y la entrada <code>c a d</code>: el parser expande <code>A</code> por <code>a b</code>, matchea la <code>a</code>, pero la <code>b</code> choca con la <code>d</code> de la entrada; entonces <b>retrocede</b>, <b>restaura el puntero</b> a la posición donde estaba <code>A</code>, y prueba <code>A → a</code>, que sí funciona. Para poder retroceder, el procedimiento tiene que <b>guardar el puntero de entrada</b> en una variable local. Este retroceso es lo que el predictivo elimina: decide bien de una, mirando el próximo token. Históricamente, Wirth usó descendente predictivo para Pascal.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Descendente = de la <b>raíz</b> a las <b>hojas</b>, en <b>preorden</b>; equivale a una <b>derivación por izquierda</b>. Se llama <b>LL</b>.</li>
<li><b>Descenso recursivo</b>: un procedimiento por no terminal; puede necesitar <b>backtracking</b> (casi no se usa).</li>
<li>🎯 <b>Muere con recursión izquierda</b> (<code>A → A α</code>): se llama a sí mismo sin consumir entrada ⟶ bucle infinito.</li>
<li>El caso sin retroceso es el <b>predictivo</b>; hay que <b>eliminar recursión izquierda</b> primero.</li>
</ul>`,
    qa:[
      {q:"¿Por qué el parsing descendente no soporta gramáticas recursivas por la izquierda?",
       a:`<p>Porque en el descenso recursivo hay un procedimiento por no terminal, y con una regla <code>A → A α</code> el procedimiento <code>A()</code> se <b>invoca a sí mismo de inmediato</b>, <b>antes de consumir ningún token</b> de entrada. Como no hay avance entre llamada y llamada, la recursión <b>no toca fondo</b>: bucle infinito. Ni el rastreo hacia atrás lo evita, porque nunca llega a fallar (no avanza). Por eso hay que <b>eliminar la recursividad por la izquierda</b> antes de aplicar cualquier método descendente.</p>`},
      {q:"¿Qué es el descenso recursivo y cómo se organiza?",
       a:`<p>Es la forma directa del parsing descendente: se escribe <b>un procedimiento por cada no terminal</b> de la gramática. Cada procedimiento elige una producción del no terminal y recorre su cuerpo de izquierda a derecha: si el símbolo es <b>no terminal</b>, <b>llama</b> al procedimiento correspondiente; si es <b>terminal</b>, verifica que <b>coincida</b> con el token actual y avanza la entrada; si no coincide, es error. La ejecución arranca con el procedimiento del <b>símbolo inicial</b> y tiene éxito si consume toda la entrada. Es la traducción casi literal de la gramática a código.</p>`},
      {q:"¿Qué es el rastreo hacia atrás (backtracking) en el descendente y por qué casi no se usa?",
       a:`<p>Es la capacidad de <b>probar una producción</b> para un no terminal y, si lleva a un choque con la entrada, <b>deshacer</b> lo hecho —restaurando el puntero de entrada a donde estaba— y <b>probar otra</b> producción. Requiere guardar el puntero en una variable local en cada procedimiento. Casi no se usa porque es <b>ineficiente</b> (puede reexplorar la entrada muchas veces) y porque las construcciones de los lenguajes de programación se pueden analizar <b>sin</b> retroceso, con el descendente <b>predictivo</b>, que decide la producción correcta mirando un solo token de anticipación.</p>`},
      {q:"¿Con qué tipo de derivación y qué recorrido del árbol se corresponde el parsing descendente?",
       a:`<p>Se corresponde con una <b>derivación por la izquierda</b> y con la construcción del árbol en <b>preorden</b> (primero la raíz, después los subárboles de izquierda a derecha). El descendente parte del <b>símbolo distinguido</b> (la raíz) y va expandiendo siempre el no terminal <b>más a la izquierda</b>, avanzando hacia las hojas; esa secuencia de expansiones <b>es</b> una derivación por la izquierda de la sentencia. Por eso la primera "L" de LL es leer de izquierda a derecha y la segunda "L" es producir la derivación <i>leftmost</i>.</p>`}
    ]
  },
  {
    id:"5.2", titulo:"PRIMERO (FIRST): cómo se calcula", aho:"§4.4.2 · p.220", badges:["🎯"], estado:"dictada",
    html:`
<p><b>PRIMERO(α)</b> es el conjunto de <b>terminales</b> con los que pueden <b>empezar</b> las cadenas derivables desde <code>α</code>. Si desde <code>α</code> se puede derivar la cadena vacía, entonces <b>ε también está en PRIMERO(α)</b>. Es la herramienta con la que el predictivo decide <b>qué regla aplicar mirando el próximo token</b>.</p>

<h3>La analogía del "¿con qué empieza?"</h3>
<p>Cuando ves cómo arranca un texto, sabés de qué se trata: "Estimado…" es una carta formal, "Había una vez…" es un cuento. El predictivo hace lo mismo: mira el <b>primer token</b> de lo que viene y lo compara con los conjuntos <b>PRIMERO</b> de las alternativas, para elegir sin dudar. PRIMERO responde: "¿con qué terminales puede empezar esto?".</p>

<h3>Las reglas de cálculo (Aho)</h3>
<ul>
<li>Si <code>X</code> es <b>terminal</b>: <code>PRIMERO(X) = { X }</code>.</li>
<li>Si <code>X → Y1 Y2 ... Yk</code>: se agrega <code>PRIMERO(Y1)</code> (sin ε). Si <code>Y1</code> puede derivar <code>ε</code>, también se agrega <code>PRIMERO(Y2)</code>; si <code>Y2</code> también deriva <code>ε</code>, se sigue con <code>Y3</code>, y así. Si <b>todos</b> los <code>Yi</code> derivan <code>ε</code>, se agrega <code>ε</code> a <code>PRIMERO(X)</code>.</li>
<li>Si <code>X → ε</code> es una producción: se agrega <code>ε</code> a <code>PRIMERO(X)</code>.</li>
</ul>

<h3>Cálculo sobre la canónica ya transformada</h3>
<p>Trabajamos con la gramática <b>sin recursión izquierda</b> (la de 4.7), que es la que se parsea descendente:</p>
<pre><code>A  → id := E
E  → T E'
E' → + T E' | ε
T  → F T'
T' → * F T' | ε
F  → id | cte</code></pre>
<table>
<tr><th>Símbolo</th><th>PRIMERO</th><th>Por qué</th></tr>
<tr><td><code>F</code></td><td>{ id, cte }</td><td>sus dos producciones empiezan con esos terminales</td></tr>
<tr><td><code>T</code></td><td>{ id, cte }</td><td><code>T → F T'</code>, y <code>F</code> no deriva ε ⟶ hereda PRIMERO(F)</td></tr>
<tr><td><code>E</code></td><td>{ id, cte }</td><td><code>E → T E'</code> ⟶ hereda PRIMERO(T)</td></tr>
<tr><td><code>E'</code></td><td>{ +, ε }</td><td>una alternativa empieza con <code>+</code>, la otra es <code>ε</code></td></tr>
<tr><td><code>T'</code></td><td>{ *, ε }</td><td>una empieza con <code>*</code>, la otra es <code>ε</code></td></tr>
<tr><td><code>A</code></td><td>{ id }</td><td><code>A → id := E</code> empieza con <code>id</code></td></tr>
</table>

<div class="callout tgt"><span class="lab">🎯 la herencia y la trampa del ε</span>Regla de oro: si <code>X</code> empieza con un <b>no terminal</b> <code>Y</code>, entonces <code>PRIMERO(Y) ⊆ PRIMERO(X)</code> (hereda sus primeros). Y la trampa: si <code>Y</code> puede <b>desaparecer</b> (derivar <code>ε</code>), no alcanza con mirar <code>Y</code>: hay que <b>seguir</b> con el símbolo que le sigue, porque también podría ser el primero. Solo cuando <b>todos</b> los símbolos del cuerpo pueden desaparecer, <code>ε</code> entra en el PRIMERO del encabezado.</div>

<div class="callout aho"><span class="lab">📘 PRIMERO de una cadena, y para qué más sirve</span>PRIMERO no se calcula solo de un símbolo: también de una <b>cadena</b> <code>X1 X2 ... Xn</code> (mismo método, arrastrando el ε de izquierda a derecha). Y no es solo para el descendente: los conjuntos PRIMERO y SIGUIENTE <b>también se usan en el análisis ascendente</b> (en SLR, SIGUIENTE decide dónde van las reducciones). O sea que la cocina de PRIMERO/SIGUIENTE te sirve para los dos mundos del Parcial I.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>PRIMERO(α)</b> = terminales con los que puede <b>empezar</b> lo derivable de <code>α</code> (más <code>ε</code> si <code>α</code> puede desaparecer).</li>
<li>Terminal: <code>PRIMERO(X)={X}</code>. No terminal: hereda el PRIMERO del primer símbolo del cuerpo…</li>
<li>🎯 …y si ese símbolo deriva <code>ε</code>, hay que <b>seguir</b> con el siguiente.</li>
<li>En la canónica transformada: <code>PRIMERO(E)=PRIMERO(T)=PRIMERO(F)={id,cte}</code>, <code>PRIMERO(E')={+,ε}</code>, <code>PRIMERO(T')={*,ε}</code>.</li>
</ul>`,
    qa:[
      {q:"Calculá PRIMERO para la canónica sin recursión izquierda: E→TE', E'→+TE'|ε, T→FT', T'→*FT'|ε, F→id|cte.",
       a:`<p><code>PRIMERO(F) = { id, cte }</code> (sus dos producciones empiezan con esos terminales). <code>PRIMERO(T) = { id, cte }</code>, porque <code>T → F T'</code> y <code>F</code> no deriva <code>ε</code>, así que hereda el de <code>F</code>. <code>PRIMERO(E) = { id, cte }</code>, análogo (<code>E → T E'</code>). <code>PRIMERO(E') = { +, ε }</code>: una alternativa empieza con <code>+</code> y la otra es <code>ε</code>. <code>PRIMERO(T') = { *, ε }</code>, igual. Y si incluís la regla de arranque, <code>PRIMERO(A) = { id }</code> (<code>A → id := E</code>).</p>`},
      {q:"Definí PRIMERO(X) y explicá para qué lo usa el parser predictivo.",
       a:`<p><b>PRIMERO(X)</b> es el conjunto de <b>terminales que pueden aparecer al comienzo</b> de alguna cadena derivable desde <code>X</code>; si <code>X</code> puede derivar la cadena vacía, además <code>ε ∈ PRIMERO(X)</code>. El predictivo lo usa para <b>elegir qué producción aplicar</b> mirando <b>un solo token</b> de anticipación: cuando tiene que expandir un no terminal <code>A</code> con alternativas <code>A → α | β</code>, elige <code>α</code> si el token actual está en <code>PRIMERO(α)</code>, y <code>β</code> si está en <code>PRIMERO(β)</code>. Para que esto funcione sin ambigüedad, esos conjuntos deben ser <b>disjuntos</b>.</p>`},
      {q:"¿Qué pasa con el cálculo de PRIMERO(X) cuando X → Y1 Y2 ... y Y1 puede derivar ε?",
       a:`<p>Cuando <code>Y1</code> puede <b>desaparecer</b> (derivar <code>ε</code>), no alcanza con tomar <code>PRIMERO(Y1)</code>: hay que <b>seguir</b> y agregar también <code>PRIMERO(Y2)</code>, porque si <code>Y1</code> se esfuma, la cadena podría empezar con lo que arranca <code>Y2</code>. Si <code>Y2</code> también deriva <code>ε</code>, se continúa con <code>Y3</code>, y así. Solo si <b>todos</b> los <code>Yi</code> del cuerpo pueden derivar <code>ε</code> se agrega <code>ε</code> a <code>PRIMERO(X)</code>. En cada paso se toman los primeros "sin el ε" y se decide si hay que mirar el símbolo siguiente.</p>`},
      {q:"Justificá por qué PRIMERO(E') = {+, ε} y PRIMERO(T') = {*, ε} en la gramática transformada.",
       a:`<p><code>E'</code> tiene dos producciones: <code>E' → + T E'</code> y <code>E' → ε</code>. La primera empieza con el terminal <code>+</code>, así que <code>+ ∈ PRIMERO(E')</code>; la segunda es directamente la vacía, así que <code>ε ∈ PRIMERO(E')</code>. Resultado: <code>{ +, ε }</code>. Con <code>T'</code> pasa lo mismo pero con <code>*</code>: <code>T' → * F T'</code> aporta <code>*</code>, y <code>T' → ε</code> aporta <code>ε</code>, dando <code>{ *, ε }</code>. El <code>ε</code> en ambos refleja que estos no terminales (el "resto" de la expresión y del término) pueden <b>no estar</b>.</p>`}
    ]
  },
  {
    id:"5.3", titulo:"SIGUIENTE (FOLLOW): cómo se calcula", aho:"§4.4.2 · p.221", badges:["🎯"], estado:"dictada",
    html:`
<p><b>SIGUIENTE(A)</b> es el conjunto de <b>terminales</b> que pueden aparecer <b>inmediatamente a la derecha</b> del no terminal <code>A</code> en alguna forma sentencial. Y si <code>A</code> puede quedar al <b>final</b> de todo (ser el símbolo más a la derecha), entonces el <b>delimitador <code>$</code></b> también está en SIGUIENTE(A).</p>

<h3>La analogía del "¿qué viene después?"</h3>
<p>Así como PRIMERO preguntaba "¿con qué empieza esto?", SIGUIENTE pregunta "<b>¿qué puede venir justo después?</b>". Es como saber que después de "el" viene un sustantivo y no un verbo. Sirve, sobre todo, para decidir cuándo un no terminal que <b>puede desaparecer</b> (derivar <code>ε</code>) "ya terminó": si el token que viene está en su SIGUIENTE, es señal de que corresponde aplicar la producción vacía.</p>

<h3>Las reglas de cálculo (Aho)</h3>
<ul>
<li><b>Regla 1</b>: <code>$ ∈ SIGUIENTE(S)</code>, siendo <code>S</code> el símbolo inicial (<code>$</code> = fin de entrada).</li>
<li><b>Regla 2</b>: si hay una producción <code>B → α A β</code>, entonces todo <code>PRIMERO(β)</code> <b>salvo <code>ε</code></b> va a <code>SIGUIENTE(A)</code>.</li>
<li><b>Regla 3</b>: si hay <code>B → α A</code> (A al final), o <code>B → α A β</code> con <code>ε ∈ PRIMERO(β)</code>, entonces todo <code>SIGUIENTE(B)</code> va a <code>SIGUIENTE(A)</code>.</li>
</ul>

<h3>Cálculo sobre la canónica transformada</h3>
<pre><code>A  → id := E
E  → T E'
E' → + T E' | ε
T  → F T'
T' → * F T' | ε
F  → id | cte</code></pre>
<table>
<tr><th>No terminal</th><th>SIGUIENTE</th><th>Por qué</th></tr>
<tr><td><code>A</code></td><td>{ $ }</td><td>es el símbolo inicial</td></tr>
<tr><td><code>E</code></td><td>{ $ }</td><td>cierra <code>A → id := E</code> ⟶ hereda SIGUIENTE(A)</td></tr>
<tr><td><code>E'</code></td><td>{ $ }</td><td>cierra <code>E → T E'</code> y <code>E' → + T E'</code> ⟶ hereda SIGUIENTE(E)</td></tr>
<tr><td><code>T</code></td><td>{ +, $ }</td><td>en <code>E → T E'</code>: PRIMERO(E') sin ε aporta <code>+</code>; como E' deriva ε, hereda SIGUIENTE(E)={$}</td></tr>
<tr><td><code>T'</code></td><td>{ +, $ }</td><td>cierra <code>T → F T'</code> y <code>T' → * F T'</code> ⟶ hereda SIGUIENTE(T)</td></tr>
<tr><td><code>F</code></td><td>{ *, +, $ }</td><td>en <code>T → F T'</code>: PRIMERO(T') sin ε aporta <code>*</code>; como T' deriva ε, hereda SIGUIENTE(T)={+,$}</td></tr>
</table>

<div class="callout tgt"><span class="lab">🎯 las dos reglas que más caen</span>Primero: <b><code>$</code> siempre está en SIGUIENTE del símbolo distinguido</b> (después de todo el programa viene el fin de archivo). Segundo: si un no terminal <b>cierra</b> el lado derecho de una regla (queda al final), <b>hereda</b> los SIGUIENTE del no terminal del encabezado. Y ojo con la dependencia de la <b>forma</b>: estos conjuntos se calculan sobre la gramática <b>factorizada</b> (la del descendente) y por eso dan distinto que los del <b>SLR</b>, que se calculan sobre la gramática recursiva a izquierda. Mismo concepto, otra gramática, otros números.</div>

<div class="callout aho"><span class="lab">📘 para qué sirve, además</span>SIGUIENTE cumple dos roles: (1) en la <b>tabla predictiva</b>, ubica las producciones que derivan <code>ε</code> — una regla <code>A → α</code> con <code>ε ∈ PRIMERO(α)</code> se coloca en las columnas de <code>SIGUIENTE(A)</code>; (2) en la <b>recuperación de errores en modo pánico</b>, los tokens de <code>SIGUIENTE(A)</code> se usan como <b>conjunto de sincronización</b> (lección 5.6). En SLR cumple un rol análogo: ubica las <b>reducciones</b> solo en las columnas de SIGUIENTE del no terminal reducido.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>SIGUIENTE(A)</b> = terminales que pueden ir <b>inmediatamente a la derecha</b> de <code>A</code> (más <code>$</code> si <code>A</code> puede cerrar).</li>
<li>🎯 <b><code>$ ∈ SIGUIENTE(inicial)</code></b> siempre; y un no terminal que <b>cierra</b> una regla <b>hereda</b> los SIGUIENTE del encabezado.</li>
<li>Con <code>A → α B β</code>: entra <code>PRIMERO(β)</code> sin ε; y si <code>β</code> deriva ε (o B está al final), entra <code>SIGUIENTE(A)</code>.</li>
<li>Se calculan sobre la gramática <b>factorizada</b>: dan <b>distinto</b> que los del SLR.</li>
</ul>`,
    qa:[
      {q:"¿Por qué $ siempre pertenece a SIGUIENTE del símbolo distinguido?",
       a:`<p>Porque el símbolo distinguido genera <b>toda</b> la entrada, y por convención se asume que después de la entrada completa viene el <b>delimitador de fin de archivo</b>, que se anota <code>$</code>. Es decir, el distinguido siempre puede quedar como el símbolo <b>más a la derecha</b> de la forma sentencial, y lo único que puede aparecer a su derecha es el fin de la tira. Por eso la primera regla de cálculo de SIGUIENTE es, directamente, colocar <code>$</code> en <code>SIGUIENTE(S)</code>. Es también lo que le indica al parser que llegó al final y puede aceptar.</p>`},
      {q:"Calculá SIGUIENTE para la gramática transformada A→id:=E, E→TE', E'→+TE'|ε, T→FT', T'→*FT'|ε, F→id|cte.",
       a:`<p><code>SIGUIENTE(A) = { $ }</code> (es el inicial). <code>SIGUIENTE(E) = { $ }</code>: <code>E</code> cierra <code>A → id := E</code>, así que hereda SIGUIENTE(A). <code>SIGUIENTE(E') = { $ }</code>: cierra <code>E → T E'</code> y <code>E' → + T E'</code>, hereda SIGUIENTE(E). <code>SIGUIENTE(T) = { +, $ }</code>: en <code>E → T E'</code>, PRIMERO(E') sin ε aporta <code>+</code>, y como E' deriva ε, hereda SIGUIENTE(E)={$}. <code>SIGUIENTE(T') = { +, $ }</code>: cierra <code>T → F T'</code> y <code>T' → * F T'</code>, hereda SIGUIENTE(T). <code>SIGUIENTE(F) = { *, +, $ }</code>: en <code>T → F T'</code>, PRIMERO(T') sin ε aporta <code>*</code>, y como T' deriva ε, hereda SIGUIENTE(T)={+,$}.</p>`},
      {q:"¿Qué SIGUIENTE hereda un no terminal que aparece al final del lado derecho de una regla?",
       a:`<p>Hereda los <b>SIGUIENTE del no terminal del encabezado</b> de esa regla. Si tenés <code>B → α A</code> (con <code>A</code> cerrando el cuerpo), entonces lo que pueda venir después de <code>B</code> también puede venir después de <code>A</code>, porque al reducir <code>A</code> queda en la posición de <code>B</code>: por eso <code>SIGUIENTE(B) ⊆ SIGUIENTE(A)</code>. Lo mismo vale si <code>A</code> va seguido de una cola <code>β</code> que puede <b>desaparecer</b> (<code>ε ∈ PRIMERO(β)</code>): en ese caso <code>A</code> también puede quedar "al final" efectivamente, y hereda SIGUIENTE(B).</p>`},
      {q:"¿Por qué los conjuntos SIGUIENTE de la gramática del descendente dan distinto que los del SLR?",
       a:`<p>Porque se calculan sobre <b>gramáticas de forma distinta</b>. El descendente usa la gramática <b>factorizada y sin recursión izquierda</b> (con <code>E'</code>, <code>T'</code> y producciones <code>ε</code>), mientras que el SLR usa la <b>canónica recursiva a izquierda</b> (<code>E → E + T</code>). Como los SIGUIENTE dependen de <b>dónde aparece</b> cada no terminal en los cuerpos, y esa ubicación cambia al reescribir la gramática, los conjuntos cambian: por ejemplo, <code>SIGUIENTE(T)</code> en la transformada es <code>{+, $}</code>, porque <code>T</code> va seguido de <code>E'</code> (que aporta <code>+</code> y hereda <code>$</code>). Es el mismo <b>concepto</b>, aplicado a otra gramática.</p>`}
    ]
  },
  {
    id:"5.4", titulo:"Gramáticas LL(1)", aho:"§4.4.3 · p.222", badges:["🎯"], estado:"dictada",
    html:`
<p>Una gramática es <b>LL(1)</b> si se puede parsear con un descendente <b>predictivo</b> —sin rastreo hacia atrás— mirando <b>un solo token</b> de anticipación en cada paso. Es la clase de gramáticas para las que el descendente funciona limpio.</p>

<h3>Qué significan las letras y el número</h3>
<ul>
<li>La primera <b>L</b>: se lee la entrada de <b>izquierda a derecha</b> (<i>Left-to-right</i>).</li>
<li>La segunda <b>L</b>: se produce una derivación por la <b>izquierda</b> (<i>Leftmost</i>).</li>
<li>El <b>1</b>: se usa <b>un</b> token de anticipación para decidir cada acción.</li>
</ul>

<h3>La analogía del GPS sin volver atrás</h3>
<p>Un parser LL(1) es como un GPS que decide cada giro mirando <b>solo la esquina que tenés adelante</b>, sin necesidad de "andá, fijate y si no, volvé". En cada bifurcación, un único cartel (el próximo token) le alcanza para elegir bien. Si en alguna esquina ese cartel <b>no distingue</b> los caminos, la gramática <b>no</b> es LL(1).</p>

<h3>La condición formal (Aho)</h3>
<p>Para cada par de producciones distintas <code>A → α | β</code>:</p>
<ul>
<li><code>PRIMERO(α)</code> y <code>PRIMERO(β)</code> deben ser <b>disjuntos</b> (no comparten ningún terminal).</li>
<li><b>A lo sumo una</b> de <code>α</code>, <code>β</code> puede derivar <code>ε</code>.</li>
<li>Si <code>β</code> deriva <code>ε</code>, entonces <code>PRIMERO(α)</code> y <code>SIGUIENTE(A)</code> deben ser disjuntos (y simétricamente).</li>
</ul>
<p>En criollo: mirando el token de adelante, <b>nunca</b> puede haber dos alternativas posibles. Por eso hacen falta las dos transformaciones del módulo 4: <b>sin recursión izquierda</b> (4.7) y <b>factorizada</b> (4.8). Ninguna gramática recursiva a izquierda o ambigua puede ser LL(1). (La cátedra suele escribir la vacía como <b>λ</b>; es la misma <code>ε</code>.)</p>

<div class="callout tgt"><span class="lab">🎯 dos requisitos y un límite duro</span>Para ser LL(1) una gramática tiene que estar <b>sin recursividad por la izquierda</b> y <b>factorizada por la izquierda</b>. Las construcciones con <b>palabras clave distintivas</b> (<code>if</code>, <code>while</code>, <code>{</code>) suelen cumplir LL(1), porque la palabra clave te dice de una cuál es la única alternativa posible. Pero hay gramáticas —como la natural de <b>C</b>— que <b>ninguna</b> transformación vuelve LL(1) (no son factorizables). Por eso, históricamente, desde C se pasó al <b>parsing ascendente</b>. Este es el "por qué" de que el ascendente sea el rey del Parcial I.</div>

<div class="callout aho"><span class="lab">📘 LL(1) y la tabla</span>La condición LL(1) es exactamente lo que garantiza que la <b>tabla predictiva</b> (lección 5.5) tenga <b>a lo sumo una producción por celda</b>. Si la gramática no es LL(1), al llenar la tabla alguna celda <code>M[A,a]</code> queda con <b>dos</b> producciones (entrada con "múltiples definiciones"), y ahí el parser no puede decidir. Aho lo muestra con el else colgante: la celda <code>M[S', else]</code> queda con <code>S' → else S</code> y <code>S' → ε</code> a la vez. Se puede "arreglar" eligiendo una, pero la gramática sigue sin ser LL(1) de verdad.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>LL(1)</b>: descendente predictivo, sin backtracking, con <b>1</b> token de anticipación. L = left-to-right, L = leftmost, 1 = un token.</li>
<li>🎯 Requiere gramática <b>sin recursión izquierda</b> y <b>factorizada</b>. Ninguna recursiva a izquierda o ambigua es LL(1).</li>
<li>Condición: para <code>A → α | β</code>, <code>PRIMERO(α)</code> y <code>PRIMERO(β)</code> disjuntos (y con ε, mirar SIGUIENTE(A)).</li>
<li>🎯 <b>C no es LL(1)</b> (no factorizable) ⟶ por eso se usa parsing ascendente.</li>
</ul>`,
    qa:[
      {q:"¿Qué significan las dos letras L y el 1 en LL(1)?",
       a:`<p>La <b>primera L</b> indica que la entrada se lee de <b>izquierda a derecha</b> (<i>Left-to-right</i>). La <b>segunda L</b> indica que el parser produce una <b>derivación por la izquierda</b> (<i>Leftmost</i>), o sea que va expandiendo siempre el no terminal más a la izquierda. El <b>1</b> indica que usa <b>un</b> símbolo de <b>anticipación</b> (un token de <i>lookahead</i>) para decidir qué producción aplicar en cada paso. En conjunto: leer de izquierda a derecha, armar la derivación izquierda, decidiendo con un solo token por delante.</p>`},
      {q:"¿Qué dos transformaciones necesita una gramática para poder ser LL(1) y qué se mira para elegir la producción?",
       a:`<p>Necesita estar <b>sin recursividad por la izquierda</b> (si no, el descendente cicla) y <b>factorizada por la izquierda</b> (si no, dos alternativas empiezan igual y un token no alcanza para decidir). Para <b>elegir la producción</b> se mira <b>un token</b> de anticipación y se lo compara con los conjuntos <b>PRIMERO</b> de las alternativas —que deben ser <b>disjuntos</b>— y, cuando alguna alternativa puede derivar <code>ε</code>, también con el <b>SIGUIENTE</b> del no terminal. Si con ese token nunca hay dos opciones posibles, la gramática es LL(1).</p>`},
      {q:"Enunciá la condición formal de LL(1) para dos producciones A → α | β.",
       a:`<p>Se pide que: (1) <code>PRIMERO(α)</code> y <code>PRIMERO(β)</code> sean <b>disjuntos</b> —ningún terminal en común, así el token decide sin ambigüedad—; (2) <b>a lo sumo una</b> de las dos alternativas pueda derivar la cadena vacía <code>ε</code> (no las dos); y (3) si una de ellas, digamos <code>β</code>, deriva <code>ε</code>, entonces <code>PRIMERO(α)</code> y <code>SIGUIENTE(A)</code> también deben ser disjuntos (y simétricamente si la que deriva ε es <code>α</code>). Las tres condiciones juntas garantizan que, con un solo token de anticipación, el parser nunca dude entre <code>α</code> y <code>β</code>.</p>`},
      {q:"¿Por qué la gramática natural de C no se puede parsear con LL(1) y qué se usa en su lugar?",
       a:`<p>Porque tiene construcciones que <b>no son factorizables</b> a LL(1): mirando un solo token de anticipación no se puede decidir siempre qué producción aplicar, y ninguna reescritura (eliminar recursión izquierda + factorizar) lo resuelve del todo. Cuando una gramática no entra en LL(1), se recurre al <b>parsing ascendente</b> (LR/SLR/LALR), que es más potente: le da igual la recursividad, maneja más construcciones y es el que usan herramientas como Yacc/Bison. Por eso, desde C en adelante, el estándar pasó a ser el análisis ascendente, que es justamente el corazón del Parcial I.</p>`}
    ]
  },
  {
    id:"5.5", titulo:"Tabla predictiva y parser no recursivo con pila", aho:"§4.4.4 · p.226", badges:["📘"], estado:"dictada",
    html:`
<p>Esta lección es <b>📘 de profundidad</b>: la cátedra centra el Parcial I en el <b>ascendente</b> (SLR), así que el predictivo con tabla no suele tomarse a fondo. Pero verlo cierra el módulo y aclara cómo se implementa un LL(1) "a mano".</p>

<h3>La idea: reemplazar la recursión por una pila explícita</h3>
<p>En vez de un procedimiento por no terminal (que usa la pila de <b>llamadas</b> del lenguaje), el parser predictivo <b>no recursivo</b> mantiene <b>su propia pila</b> y una <b>tabla</b> <code>M[A, a]</code> (no terminal × terminal) que dice qué producción aplicar. Imita, paso a paso, una derivación por la izquierda. La pila arranca con <code>$</code> abajo y el símbolo inicial arriba.</p>

<h3>Cómo se llena la tabla (Aho, Algoritmo 4.31)</h3>
<p>Para cada producción <code>A → α</code>:</p>
<ul>
<li>Para cada terminal <code>a ∈ PRIMERO(α)</code>: poner <code>A → α</code> en <code>M[A, a]</code>.</li>
<li>Si <code>ε ∈ PRIMERO(α)</code>: para cada <code>b ∈ SIGUIENTE(A)</code>, poner <code>A → α</code> en <code>M[A, b]</code> (incluido <code>$</code> si está en SIGUIENTE(A)).</li>
</ul>
<p>Las celdas que quedan vacías son <b>error</b>. La tabla para la canónica transformada queda así (filas = no terminales, columnas = terminales y <code>$</code>):</p>
<table>
<tr><th> </th><th>id</th><th>cte</th><th>:=</th><th>+</th><th>*</th><th>$</th></tr>
<tr><td><code>A</code></td><td>A→id:=E</td><td> </td><td> </td><td> </td><td> </td><td> </td></tr>
<tr><td><code>E</code></td><td>E→TE'</td><td>E→TE'</td><td> </td><td> </td><td> </td><td> </td></tr>
<tr><td><code>E'</code></td><td> </td><td> </td><td> </td><td>E'→+TE'</td><td> </td><td>E'→ε</td></tr>
<tr><td><code>T</code></td><td>T→FT'</td><td>T→FT'</td><td> </td><td> </td><td> </td><td> </td></tr>
<tr><td><code>T'</code></td><td> </td><td> </td><td> </td><td>T'→ε</td><td>T'→*FT'</td><td>T'→ε</td></tr>
<tr><td><code>F</code></td><td>F→id</td><td>F→cte</td><td> </td><td> </td><td> </td><td> </td></tr>
</table>
<p>Como cada celda tiene <b>a lo sumo una</b> producción, la gramática es LL(1). (Fijate que <code>E' → ε</code> y <code>T' → ε</code> se ubicaron en las columnas de sus <b>SIGUIENTE</b>: por eso hacía falta calcularlos.)</p>

<h3>Cómo trabaja el parser (Aho, fig. 4.20)</h3>
<p>Con <code>X</code> = tope de la pila y <code>a</code> = token actual:</p>
<ul>
<li>Si <code>X</code> es un <b>terminal</b> igual a <code>a</code>: se <b>desapila</b> y se avanza la entrada.</li>
<li>Si <code>X</code> es un <b>terminal</b> distinto de <code>a</code>: <b>error</b>.</li>
<li>Si <code>X</code> es un <b>no terminal</b>: se consulta <code>M[X, a]</code>. Si es <code>X → Y1 ... Yk</code>, se <b>emite</b> esa producción, se desapila <code>X</code> y se apilan <code>Yk ... Y1</code> (con <code>Y1</code> arriba). Si la celda está vacía: <b>error</b>.</li>
</ul>
<p>Termina (acepta) cuando la pila queda en <code>$</code> y la entrada también. Traza abreviada de <code>id := id + cte</code>: se expande <code>A</code>, se matchean <code>id</code> y <code>:=</code>, se expande <code>E</code> a <code>T E'</code>, se reconoce el primer <code>id</code> (vía <code>T → F T'</code>, <code>F → id</code>, <code>T' → ε</code>), se expande <code>E'</code> a <code>+ T E'</code> al ver el <code>+</code>, se reconoce <code>cte</code>, y con <code>$</code> se aplican <code>T' → ε</code> y <code>E' → ε</code>: acepta.</p>

<div class="callout aho"><span class="lab">📘 la pila explícita es la pila de llamadas «desenrollada»</span>El parser no recursivo hace <b>exactamente el mismo trabajo</b> que el descenso recursivo, pero llevando la pila <b>a mano</b> en vez de apoyarse en las llamadas recursivas: lo que en el recursivo eran funciones llamándose, acá es apilar/desapilar símbolos. La ventaja es que no dependés de la pila del lenguaje anfitrión. Y el criterio de LL(1) reaparece: si al llenar <code>M</code> una celda quedara con <b>dos</b> producciones, la gramática <b>no es LL(1)</b> y este parser no serviría.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El predictivo no recursivo usa una <b>tabla <code>M[A,a]</code></b> y una <b>pila explícita</b> (<code>$</code> abajo, inicial arriba).</li>
<li>Llenado: <code>A → α</code> va en <code>M[A,a]</code> para <code>a ∈ PRIMERO(α)</code>; si <code>α</code> deriva <code>ε</code>, va en las columnas de <code>SIGUIENTE(A)</code>.</li>
<li>Con el tope: si es terminal, se matchea; si es no terminal, se expande según <code>M</code>. Acepta con pila y entrada en <code>$</code>.</li>
<li>📘 Si una celda tiene <b>dos</b> producciones, la gramática <b>no es LL(1)</b>.</li>
</ul>`,
    qa:[
      {q:"¿Cómo se sabe, al llenar la tabla de análisis predictivo, que una gramática no es LL(1)?",
       a:`<p>Se sabe cuando, al ubicar las producciones, una <b>celda <code>M[A, a]</code> queda con más de una producción</b> (una entrada con "múltiples definiciones"). Eso significa que, estando por expandir <code>A</code> y viendo el token <code>a</code>, el parser <b>no puede decidir</b> de forma única qué regla aplicar: hay un conflicto. Y ese conflicto es la firma de que la gramática <b>no es LL(1)</b> (típicamente porque es recursiva a izquierda, no está factorizada o es ambigua). En una gramática LL(1), cada celda tiene <b>a lo sumo una</b> producción o está vacía (error).</p>`},
      {q:"¿Cómo se decide en qué celdas M[A,a] va la producción A → α?",
       a:`<p>Con PRIMERO y SIGUIENTE. Primero: para cada <b>terminal <code>a</code> en <code>PRIMERO(α)</code></b>, se pone <code>A → α</code> en <code>M[A, a]</code> (con ese token de adelante, esa producción puede empezar). Segundo: si <code>α</code> puede derivar <code>ε</code> (la producción "puede desaparecer"), entonces para cada <b>terminal <code>b</code> en <code>SIGUIENTE(A)</code></b> se pone <code>A → α</code> en <code>M[A, b]</code>, incluido <code>$</code> si pertenece a SIGUIENTE(A). Las celdas que queden sin nada son entradas de <b>error</b>. Por eso, para armar la tabla, primero hay que calcular PRIMERO y SIGUIENTE.</p>`},
      {q:"En el parser predictivo con pila, ¿qué hace el algoritmo según el tope sea un terminal o un no terminal?",
       a:`<p>Si el <b>tope</b> es un <b>terminal</b>: se compara con el token de entrada actual; si <b>coinciden</b>, se desapila el símbolo y se avanza la entrada; si <b>no</b> coinciden, es error. Si el tope es un <b>no terminal</b> <code>X</code>: se consulta la tabla <code>M[X, a]</code> con el token actual <code>a</code>; si hay una producción <code>X → Y1 ... Yk</code>, se emite esa producción (es parte de la salida), se desapila <code>X</code> y se apilan sus símbolos <code>Yk, ..., Y1</code> con <code>Y1</code> en el tope; si la celda está vacía, es error. El proceso repite hasta que la pila y la entrada queden en <code>$</code>: ahí acepta.</p>`},
      {q:"¿Qué tienen en común el parser predictivo con pila explícita y el descenso recursivo?",
       a:`<p>Hacen <b>exactamente el mismo trabajo</b>: ambos construyen una <b>derivación por la izquierda</b> de la entrada, decidiendo cada producción con un token de anticipación. La diferencia es <b>dónde llevan la pila</b>: el descenso recursivo la lleva <b>implícita</b>, en la pila de <b>llamadas</b> de las funciones (una por no terminal); el no recursivo la lleva <b>explícita</b>, apilando y desapilando símbolos gramaticales a mano. Convertir uno en otro es "desenrollar" la recursión. Por eso ambos sirven para las mismas gramáticas: las LL(1).</p>`}
    ]
  },
  {
    id:"5.6", titulo:"Recuperación de errores en el predictivo", aho:"§4.4.5 · p.228", badges:["📘"], estado:"dictada",
    html:`
<p>Última lección del módulo, también <b>📘 de profundidad</b> (el Parcial I se centra en SLR). Vemos cómo un parser predictivo <b>se recupera</b> de un error para poder seguir y reportar varios en una sola pasada.</p>

<h3>Cuándo se detecta el error</h3>
<p>En el predictivo controlado por tabla, hay error en dos situaciones: (1) el <b>terminal</b> del tope de la pila <b>no coincide</b> con el token de entrada; o (2) el tope es un no terminal <code>A</code>, el token es <code>a</code>, y <code>M[A, a]</code> está <b>vacía</b> (entrada de error). En cualquiera de los dos, el parser no puede seguir "como si nada": tiene que recuperarse.</p>

<h3>La analogía de reengancharse en la lectura</h3>
<p>Si leyendo te perdés, buscás un <b>punto de referencia</b> claro —el final de la oración, un punto y aparte— y arrancás de nuevo desde ahí. Los <b>conjuntos de sincronización</b> son esos puntos de referencia: tokens en los que el parser "sabe dónde está parado" y puede retomar.</p>

<h3>Modo pánico predictivo: las heurísticas (Aho)</h3>
<ul>
<li><b>SIGUIENTE como sincronización</b>: poner en el conjunto de sincronización de <code>A</code> los tokens de <code>SIGUIENTE(A)</code>. Si aparece uno, se <b>desapila <code>A</code></b> (se asume que "terminó") y se sigue.</li>
<li><b>Agregar niveles superiores</b>: SIGUIENTE(A) solo no alcanza; conviene sumar los tokens que <b>empiezan construcciones de nivel más alto</b> (p. ej., palabras clave que empiezan instrucciones), para no comerse una instrucción entera si falta un <code>;</code>.</li>
<li><b>Agregar PRIMERO(A)</b>: si en la entrada aparece un token de <code>PRIMERO(A)</code>, se puede <b>retomar</b> el análisis de <code>A</code>.</li>
<li><b>Usar la producción <code>ε</code> por defecto</b>: si un no terminal puede derivar <code>ε</code>, usarla como salida pospone la detección sin saltearse errores.</li>
<li><b>Terminal que no matchea</b>: sacarlo de la pila, avisar "se insertó el terminal" y seguir (como si el token faltante se hubiera puesto).</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 el conjunto de sincronización más usado</span>El candidato natural para sincronizar cuando el no terminal <code>A</code> está en el tope es <b>SIGUIENTE(A)</b>: son los tokens que <b>legalmente</b> podrían venir después de <code>A</code>, así que al verlos tiene sentido dar por cerrado <code>A</code> (desapilarlo) y continuar. Es el mismo criterio de sincronización que reaparece, con otra maquinaria, en el ascendente. Por eso SIGUIENTE no era solo para llenar la tabla: también manda en la recuperación.</div>

<div class="callout aho"><span class="lab">📘 objetivos y equilibrio</span>La meta es <b>reportar varios errores en una pasada</b> sin caer en una avalancha de errores "falsos". La efectividad depende de <b>elegir bien</b> el conjunto de sincronización: demasiado chico y el parser saltea mucho; demasiado grande y no se recupera con precisión. Aho también recuerda lo esencial: el mensaje de error debe <b>señalar el lugar</b> donde se detectó (de ahí que el léxico venga contando las líneas desde el módulo 1). El modo pánico tiene, además, la garantía de <b>no ciclar</b>.</p></div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Error en el predictivo: el <b>terminal del tope no coincide</b>, o <code>M[A,a]</code> está <b>vacía</b>.</li>
<li>🎯 Conjunto de sincronización natural = <b>SIGUIENTE</b> del no terminal del tope: al ver uno, se <b>desapila</b> y se sigue.</li>
<li>SIGUIENTE solo no alcanza: se le suman <b>PRIMERO(A)</b> y los tokens que <b>empiezan construcciones de nivel superior</b>.</li>
<li>Si un terminal del tope no matchea: <b>sacarlo</b>, avisar y continuar. La meta es reportar <b>varios</b> errores por pasada.</li>
</ul>`,
    qa:[
      {q:"¿Qué conjunto se suele usar como sincronización para recuperar errores en un parser predictivo, y cómo?",
       a:`<p>Se usan los <b>SIGUIENTE</b> del no terminal que está en el <b>tope de la pila</b>. La idea: al detectar el error, se <b>descartan tokens</b> de la entrada hasta encontrar uno que pertenezca a <code>SIGUIENTE(A)</code>; como ese token podría <b>legalmente</b> aparecer después de <code>A</code>, se asume que <code>A</code> "ya terminó", se lo <b>desapila</b> y se continúa el análisis desde ahí. Es el conjunto de sincronización más natural porque marca justamente dónde <code>A</code> puede cerrar, y permite retomar sin quedar desalineado.</p>`},
      {q:"¿En qué dos situaciones detecta un error un parser predictivo controlado por tabla?",
       a:`<p>Primera: cuando el <b>terminal</b> que está en el <b>tope de la pila no coincide</b> con el token de entrada actual (esperaba, por ejemplo, un <code>;</code> y vino otra cosa). Segunda: cuando el tope es un <b>no terminal <code>A</code></b>, el token de entrada es <code>a</code>, y la celda <code>M[A, a]</code> de la tabla está <b>vacía</b> (es una entrada de error, no hay ninguna producción aplicable). En ambos casos el análisis no puede continuar de forma normal y hay que activar la recuperación (por ejemplo, modo pánico).</p>`},
      {q:"¿Por qué usar solo SIGUIENTE(A) como conjunto de sincronización no siempre alcanza?",
       a:`<p>Porque puede hacer que el parser <b>saltee demasiada entrada</b>. Aho da el caso de un <code>;</code> faltante: si el conjunto de sincronización de las expresiones es solo su SIGUIENTE, las palabras clave que <b>empiezan la siguiente instrucción</b> podrían no estar ahí, y el parser se comería esa instrucción entera buscando sincronizar. Por eso conviene <b>agregar</b> al conjunto los tokens que <b>empiezan construcciones de nivel más alto</b> (palabras clave de instrucciones, bloques), aprovechando la estructura jerárquica del lenguaje, e incluso <b>PRIMERO(A)</b> para poder retomar el propio <code>A</code>. Así la recuperación es más precisa.</p>`},
      {q:"En modo pánico predictivo, ¿qué se hace si el terminal del tope de la pila no coincide con la entrada?",
       a:`<p>Una estrategia simple es <b>sacar ese terminal de la pila</b>, <b>emitir un mensaje</b> avisando que "se insertó el terminal" (como si el token que faltaba se hubiera colocado) y <b>continuar</b> el análisis. En efecto, se hace de cuenta que el símbolo esperado estaba, para no trabarse. Esto equivale a que el conjunto de sincronización de un token sea "todos los demás". La alternativa, cuando el problema es un no terminal con celda vacía, es descartar tokens de entrada hasta un token de sincronización (los SIGUIENTE) y desapilar el no terminal. Ambas apuntan a lo mismo: seguir para detectar más errores.</p>`}
    ]
  }
]});
