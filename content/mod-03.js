M.push({ id:3, titulo:"Autómatas: cómo funciona Flex por dentro", parcial:"I",
  resumen:"El pipeline que Flex ejecuta por dentro, paso a paso: diagramas de transición, AFN y AFD, la construcción de Thompson (ER→AFN), la de subconjuntos (AFN→AFD), el camino directo ER→AFD con anulable/primerapos/siguientepos, la minimización de estados, y cómo se arma el .l y se resuelven los conflictos.",
  lecciones:[
  {
    id:"3.1", titulo:"Diagramas de transición · por qué estado pasa una palabra reservada", aho:"§3.4.1–3.4.2 · p.130", badges:["🎯"], estado:"dictada",
    html:`
<p>Un <b>diagrama de transición de estados</b> es un mapa dibujado del analizador léxico: un grafo donde los <b>nodos</b> son estados, las <b>flechas</b> están rotuladas con caracteres, hay un <b>estado inicial</b> (marcado con una flecha suelta que dice «inicio») y uno o más <b>estados de aceptación</b> o <b>finales</b> (dibujados con doble círculo). El AL empieza en el estado inicial y va <b>consumiendo caracteres</b>, saltando de estado en estado por la flecha que coincide con el carácter que leyó. Cuando cae en un estado de aceptación, reconoció un lexema y devuelve el token.</p>

<h3>La analogía del subte</h3>
<p>Pensá el diagrama como una <b>red de subte</b>. Estás parado en una estación (un estado). El próximo carácter de entrada es tu <b>boleto</b>: te dice qué combinación tomar. Vas encadenando viajes carácter por carácter. Algunas estaciones tienen un <b>cartel de salida</b> (doble círculo): si llegás ahí, «bajaste» — reconociste un token. Aho dice que un estado es «un resumen de todo lo que necesitás saber sobre los caracteres que viste» hasta ese punto: no te acordás del camino exacto, solo de en qué estación estás.</p>

<h3>Las tres convenciones de Aho</h3>
<ul>
<li><b>Doble círculo = estado de aceptación.</b> Ahí se cuelga la acción (por lo general «devolver tal token con tal atributo»).</li>
<li><b>Un asterisco <code>*</code> junto al estado de aceptación = retroceso.</b> Significa que el carácter que te llevó hasta ahí <b>no</b> forma parte del lexema, así que hay que devolverlo a la entrada (lo vemos a fondo en 3.2).</li>
<li><b>La flecha «inicio»</b> señala el estado por el que se arranca antes de leer nada.</li>
</ul>

<h3>Ejemplo 1: el operador de comparación (oprel)</h3>
<p>Aho arma el diagrama que reconoce <code>&lt;</code>, <code>&lt;=</code>, <code>&lt;&gt;</code>, <code>=</code>, <code>&gt;</code> y <code>&gt;=</code>. Descrito como tabla de transiciones (el <code>*</code> marca retroceso):</p>
<pre><code>ESTADO   ENTRADA   →  DESTINO   ACCIÓN
0        &lt;         →  1
1        =         →  2         return(oprel, LE)
1        &gt;         →  3         return(oprel, NE)
1        otro      →  4 *       return(oprel, LT)   (retroceso)
0        =         →  5         return(oprel, EQ)
0        &gt;         →  6
6        =         →  7         return(oprel, GE)
6        otro      →  8 *       return(oprel, GT)   (retroceso)</code></pre>
<p>Fijate el estado 1: leíste <code>&lt;</code> pero todavía no sabés si el lexema es <code>&lt;</code>, <code>&lt;=</code> o <code>&lt;&gt;</code>. Tenés que mirar <b>un carácter más</b>. Si es «otro» (ni <code>=</code> ni <code>&gt;</code>), el lexema era <code>&lt;</code> solo, y ese «otro» hay que devolverlo: por eso el estado 4 lleva <code>*</code>.</p>

<h3>Ejemplo 2: identificadores y palabras reservadas (el que te toman)</h3>
<p>El diagrama del identificador es simple:</p>
<pre><code>ESTADO   ENTRADA          →  DESTINO
9        letra            →  10
10       letra o dígito   →  10   (bucle: se queda comiendo letras y dígitos)
10       otro             →  11 * (retroceso) → obtenerToken() + instalarID()</code></pre>
<p>El problema: este <b>mismo</b> diagrama también reconoce <code>if</code>, <code>then</code>, <code>else</code>, porque una palabra reservada tiene exactamente la forma de un identificador. Aho da <b>dos maneras</b> de manejarlo:</p>
<ul>
<li><b>Método 1 (el que se usa):</b> instalar las palabras reservadas en la tabla de símbolos <b>desde el arranque</b>, marcadas como «esto no es un id común, es la palabra clave tal». Cuando el autómata acepta un identificador en el estado 11, la función <code>obtenerToken()</code> mira la entrada en la tabla: si el lexema estaba precargado como reservada, devuelve ese token; si no, devuelve <code>id</code>.</li>
<li><b>Método 2:</b> hacer un diagrama <b>separado</b> por cada palabra clave (uno para <code>then</code>: estados t→h→e→n→«no letra ni dígito»). Requiere darle <b>prioridad</b> a esos diagramas sobre el de id. Aho no lo usa.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 ¿por qué estado pasa una palabra reservada?</span>
La respuesta que espera la cátedra: <b>por el estado de los identificadores</b>. No hay un camino especial para <code>if</code>. La palabra reservada recorre el mismo autómata que cualquier id, y <b>recién al llegar al estado final</b> se compara el lexema contra la lista de reservadas; si coincide, se emite el token de la reservada en lugar de <code>id</code>. Corolario que también cae en el parcial: <code>if</code> se reconoce con el mismo autómata que <code>ifx</code>; lo único que los diferencia es esa consulta final a la tabla.</div>

<h3>El caso borde: prefijos propios</h3>
<p>¿Por qué el método 2 necesita ese «no letra ni dígito» al final de <code>then</code>? Por palabras como <code>thenextValue</code>, que tienen a <code>then</code> como <b>prefijo propio</b>. Si aceptaras apenas ves <code>then</code>, cortarías mal y devolverías la palabra clave <code>THEN</code> seguida de <code>extValue</code>, cuando el token correcto era el identificador entero <code>thenextValue</code>. El autómata tiene que confirmar que la palabra <b>terminó</b> antes de decidir. Esto es la semilla de la regla del <b>lexema más largo</b> (3.2).</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Un <b>diagrama de transición</b> es el grafo del léxico: estados (nodos), transiciones (flechas rotuladas), estado inicial y estados de <b>aceptación</b> (doble círculo).</li>
<li>El <code>*</code> junto a un estado de aceptación significa <b>retroceso</b>: el último carácter no era parte del lexema.</li>
<li>🎯 Una <b>palabra reservada pasa por el estado de los identificadores</b>; al aceptar, se consulta la lista de reservadas y se decide el token. No hay camino propio para <code>if</code>.</li>
<li>Dos técnicas para reservadas: precargarlas en la tabla (la usada) o hacer un diagrama por palabra con prioridad.</li>
</ul>`,
    qa:[
      {q:"¿Por qué las palabras reservadas se reconocen con el mismo camino del autómata que los identificadores?",
       a:`<p>Porque léxicamente <b>tienen la misma forma</b>: letra seguida de letras o dígitos. El autómata las lleva por el <b>estado de los identificadores</b>, igual que a cualquier variable. Recién <b>al llegar al estado de aceptación</b> se consulta la lista (o tabla) de palabras reservadas y, si el lexema coincide, se emite ese token en lugar de <code>id</code>. La ventaja es que no hace falta un camino separado por cada palabra clave: con un solo diagrama de id y una consulta final alcanza. Por eso <code>if</code> se reconoce con el mismísimo camino que <code>ifx</code>.</p>`},
      {q:"Aho da dos formas de manejar las palabras reservadas que «parecen» identificadores. ¿Cuáles son?",
       a:`<p><b>Forma 1 (la que se usa):</b> instalar las reservadas en la tabla de símbolos <b>desde el principio</b>, con un campo que diga qué token representan. Al aceptar un identificador, <code>obtenerToken()</code> revisa la tabla: si el lexema estaba precargado como reservada, devuelve ese token; si no, es un <code>id</code> común. <b>Forma 2:</b> construir un <b>diagrama de transición separado por cada palabra clave</b> (por ejemplo t→h→e→n para <code>then</code>), terminando en una prueba de «no letra ni dígito», y darles <b>prioridad</b> sobre el diagrama de id. Aho adopta la primera en su ejemplo.</p>`},
      {q:"¿Qué indica el asterisco (*) dibujado junto a un estado de aceptación?",
       a:`<p>Indica que hay que hacer <b>retroceso</b>: el carácter que provocó la llegada al estado de aceptación <b>no forma parte del lexema</b>, así que se devuelve una posición el puntero <code>avance</code> para no consumirlo. Ejemplo: en el diagrama de <code>id</code>, seguís comiendo letras y dígitos hasta que aparece «otro» carácter (un espacio, un <code>=</code>); ese «otro» te confirma que el identificador terminó, pero no es parte de él, así que se retrocede. Aho aclara que en su ejemplo nunca hace falta retroceder más de una posición.</p>`},
      {q:"En el diagrama del oprel, ¿por qué al leer «&lt;» el autómata no devuelve enseguida el token del operador «menor»?",
       a:`<p>Porque desde <code>&lt;</code> todavía pueden salir <b>tres</b> lexemas distintos: <code>&lt;</code>, <code>&lt;=</code> o <code>&lt;&gt;</code>. El autómata pasa al estado 1 y <b>mira un carácter más</b>: si es <code>=</code> reconoce <code>&lt;=</code> (LE), si es <code>&gt;</code> reconoce <code>&lt;&gt;</code> (NE), y solo si es «otro» concluye que el lexema era <code>&lt;</code> solo (LT) y hace retroceso de ese «otro». Devolver el token apenas ve <code>&lt;</code> le impediría reconocer los operadores de dos caracteres.</p>`}
    ]
  },
  {
    id:"3.2", titulo:"AL a mano · retroceso y el lexema más largo", aho:"§3.4.3–3.4.4 · p.133", badges:["🎯"], estado:"dictada",
    html:`
<p>Ya sabemos dibujar un diagrama por token. Ahora hay que <b>implementar</b> el analizador léxico a mano, juntando todos esos diagramas en un solo programa. Ahí aparecen dos problemas prácticos que la cátedra pregunta seguido: el <b>lexema más largo</b> y el <b>retroceso</b>.</p>

<h3>La arquitectura: una variable «estado» y un switch</h3>
<p>Aho lo dice claro: sin importar la estrategia, <b>cada estado se representa con un pedazo de código</b>. Tenés una variable <code>estado</code> con el número del estado actual, y un <code>switch</code> que, según su valor, salta al código de ese estado. El código de cada estado lee el próximo carácter y decide a qué estado ir. Es, literalmente, el grafo traducido a un <code>switch</code> gigante.</p>
<pre><code>estado = 0;
while (true) {
   switch (estado) {
      case 0:  c = leer();  if (c == '&lt;') estado = 1;
               else if (c == '=') estado = 5;  ...
      case 1:  c = leer();  if (c == '=') estado = 2;  ...
      case 2:  retorna(oprel, LE);
      ...
   }
}</code></pre>

<h3>El diagrama del número: por qué es el más complejo</h3>
<p>El reconocedor de constantes numéricas es el diagrama más grande de Aho porque un número tiene <b>partes opcionales</b>: parte entera, después una fracción opcional (<code>.</code> y más dígitos), después un exponente opcional (<code>E</code>, un signo opcional, más dígitos). Descrito en palabras:</p>
<pre><code>12  --dígito--&gt;  13 (bucle de dígitos)
13  --otro (ni dígito ni punto)--&gt;  entero: return(numero)   *
13  --.--&gt;  14  --dígito--&gt;  15 (bucle)
15  --otro (no E, no dígito)--&gt;  real sin exponente          *
15  --E--&gt;  16  --signo? dígito+--&gt;  ...  return(numero)      *</code></pre>
<p>En el estado 13, si ves algo que no es dígito ni punto, ya tenés un entero como <code>123</code> y devolvés; pero si ves un punto, tenés que <b>espiar</b> hacia adelante para ver si hay fracción. Cada bifurcación exige mirar un carácter más, y varios de los estados de aceptación llevan <code>*</code> (retroceso).</p>

<h3>El retroceso, en detalle</h3>
<p><b>Retroceso</b> = devolver a la entrada el carácter que leíste de más. Pasa siempre que para <b>confirmar</b> que un lexema terminó tuviste que leer el carácter <b>siguiente</b>. Ejemplo: para saber que <code>123</code> terminó, leíste el espacio (o la letra, o el <code>+</code>) que venía después; ese carácter no es parte del número, así que retrocedés el puntero <code>avance</code> una posición para que el próximo token empiece ahí. El <code>*</code> del diagrama es justamente el recordatorio de «acá retrocedé».</p>

<div class="callout tgt"><span class="lab">🎯 la regla del lexema más largo</span>
Ante varias coincidencias posibles, el AL toma <b>siempre la más larga</b>. Por eso, al leer <code>&gt;=</code>, no devuelve <code>&gt;</code> apenas lo ve: sigue leyendo mientras pueda <b>extender</b> una coincidencia válida, y como <code>&gt;=</code> es más largo que <code>&gt;</code>, lo prefiere. Recién corta cuando el próximo carácter ya no extiende ningún patrón — y ahí, si leyó de más, hace retroceso. Segunda regla (desempate): si dos patrones casan el <b>mismo</b> largo, gana el que se <b>listó primero</b>. Estas dos reglas son las mismas que usa Flex (3.9).</div>

<h3>Cómo se combinan los diagramas de todos los tokens</h3>
<p>Tenés un diagrama para <code>oprel</code>, otro para <code>id</code>, otro para <code>numero</code>, otro para los espacios. ¿Cómo los unís? Aho menciona dos estrategias:</p>
<ul>
<li><b>Probarlos en secuencia:</b> arrancás el primer diagrama desde <code>inicioLexema</code>; si falla, <b>volvés el puntero</b> a <code>inicioLexema</code> y probás el siguiente diagrama. Simple, pero repetís lecturas.</li>
<li><b>Correrlos en paralelo:</b> avanzás por todos los diagramas a la vez con el mismo carácter. Esto es más eficiente y es, ni más ni menos, la idea de <b>simular un autómata no determinista</b> — el puente hacia todo lo que viene después (3.3 en adelante).</li>
</ul>

<h3>El caso del espacio en blanco</h3>
<p>El diagrama de los blancos (espacios, tabs, saltos de línea) reconoce «uno o más delimitadores», llega a su estado de aceptación… y <b>no devuelve nada al sintáctico</b>: reinicia el proceso para buscar el próximo lexema. Los blancos nunca llegan al sintáctico; en el autómata son un bucle que vuelve al estado inicial. (También ahí hay retroceso del primer carácter no-blanco.)</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El AL a mano es una variable <code>estado</code> + un <code>switch</code>: cada estado es un pedazo de código que lee un carácter y salta.</li>
<li>🎯 <b>Lexema más largo</b>: se toma la coincidencia más larga (<code>&gt;=</code> antes que <code>&gt;</code>). Desempate: gana el patrón listado primero.</li>
<li><b>Retroceso</b>: como para confirmar el fin del lexema hay que leer el carácter siguiente, si ese carácter no es parte del lexema se devuelve a la entrada (el <code>*</code> del diagrama).</li>
<li>Los diagramas de todos los tokens se combinan probándolos en secuencia o corriéndolos en paralelo (esto último lleva a los autómatas).</li>
</ul>`,
    qa:[
      {q:"Ante la entrada «&gt;=», ¿por qué el AL no devuelve el token «&gt;» apenas lo lee?",
       a:`<p>Por la regla del <b>lexema más largo</b>: el AL sigue leyendo mientras pueda <b>extender</b> una coincidencia válida. Como <code>&gt;=</code> es un token más largo que <code>&gt;</code>, lo prefiere. Concretamente, tras leer <code>&gt;</code> pasa a un estado donde espía el próximo carácter: si es <code>=</code>, reconoce <code>&gt;=</code> (GE); si es cualquier «otro», recién ahí concluye que el lexema era <code>&gt;</code> (GT) y hace <b>retroceso</b> de ese carácter sobrante. Devolver <code>&gt;</code> apenas se lo ve rompería el reconocimiento de los operadores de dos caracteres.</p>`},
      {q:"¿Qué es el retroceso en el analizador léxico y por qué es necesario?",
       a:`<p><b>Retroceso</b> es devolver a la entrada el carácter que se leyó de más, retrocediendo una posición el puntero <code>avance</code>. Es necesario porque para <b>confirmar</b> que un lexema terminó, casi siempre hay que leer el carácter <b>siguiente</b>: no sabés que <code>123</code> terminó hasta ver el carácter que viene después (un espacio, una letra). Ese carácter <b>no forma parte</b> del número, así que hay que devolverlo para que el próximo token empiece ahí. En los diagramas se señala con un <code>*</code> junto al estado de aceptación.</p>`},
      {q:"¿De qué dos maneras se pueden combinar los diagramas de transición de todos los tokens en un solo analizador léxico?",
       a:`<p><b>En secuencia:</b> se prueba el primer diagrama desde <code>inicioLexema</code>; si no reconoce, se <b>vuelve el puntero</b> a <code>inicioLexema</code> y se prueba el diagrama siguiente, y así. Es simple pero repite lecturas de los mismos caracteres. <b>En paralelo:</b> se avanza por todos los diagramas a la vez alimentándolos con el mismo carácter, y se ve cuál llega a aceptación (con lexema más largo). Esta segunda estrategia es, en esencia, <b>simular un autómata no determinista</b>, y es la que abre el camino a los AFN/AFD y a lo que hace Flex por dentro.</p>`},
      {q:"¿Por qué el diagrama del número sin signo es el más complejo, y qué pasa con los blancos al aceptar?",
       a:`<p>El del <b>número</b> es el más complejo porque tiene <b>partes opcionales</b> encadenadas: parte entera, una fracción opcional (<code>.</code> más dígitos) y un exponente opcional (<code>E</code>, signo opcional, dígitos). En cada punto hay que espiar el carácter siguiente para decidir si el número siguió o terminó, y varios estados de aceptación llevan retroceso. En cambio, el diagrama de los <b>blancos</b> reconoce uno o más delimitadores y, al aceptar, <b>no devuelve token</b> al sintáctico: descarta lo leído y reinicia la búsqueda del próximo lexema. Los blancos nunca cruzan al sintáctico; son un bucle que vuelve al estado inicial.</p>`}
    ]
  },
  {
    id:"3.3", titulo:"AFN y AFD (DFA/NDFA)", aho:"§3.6 · p.147", badges:["🎯"], estado:"dictada",
    html:`
<p>Un <b>autómata finito</b> es la versión formal y matemática del diagrama de transición. Aho lo define como un <b>reconocedor</b>: una máquina que ante una cadena solo dice «sí» (la acepto) o «no». Hay dos tipos, y la diferencia entre ellos es el corazón de este módulo.</p>

<h3>La analogía del laberinto</h3>
<p>Imaginá un laberinto con salas (estados) y puertas rotuladas con letras (transiciones). Recorrés el laberinto gastando una letra de tu cadena por cada puerta que cruzás.</p>
<ul>
<li>En un <b>AFD</b> (determinista), cada sala tiene <b>exactamente una</b> puerta por cada letra: no hay que elegir, el camino está forzado.</li>
<li>En un <b>AFN</b> (no determinista), una sala puede tener <b>varias</b> puertas con la misma letra (elegís cualquiera) e incluso <b>pasadizos secretos ε</b> que cruzás <b>sin gastar</b> ninguna letra.</li>
</ul>
<p>El AFN es como poder <b>clonarte</b> en cada bifurcación y explorar todos los caminos a la vez.</p>

<h3>AFN: la definición formal (cinco piezas)</h3>
<p>Un <b>autómata finito no determinista (AFN / NDFA)</b> consiste en:</p>
<ul>
<li>Un conjunto finito de <b>estados</b> S.</li>
<li>Un <b>alfabeto</b> de entrada Σ (la cadena vacía ε nunca es parte de Σ).</li>
<li>Una <b>función de transición</b> que a cada estado y cada símbolo de Σ ∪ {ε} le asigna un <b>conjunto</b> de estados siguientes.</li>
<li>Un <b>estado inicial</b> s0.</li>
<li>Un conjunto <b>F</b> de estados de <b>aceptación</b> (finales).</li>
</ul>
<p>Las dos rarezas que lo hacen «no determinista»: (a) el <b>mismo símbolo</b> puede etiquetar flechas hacia <b>varios</b> estados distintos; (b) puede haber flechas rotuladas con <b>ε</b>, que se cruzan sin consumir símbolo.</p>

<h3>AFD: el caso disciplinado</h3>
<p>Un <b>autómata finito determinista (AFD / DFA)</b> es un caso especial del AFN donde: <b>no hay transiciones ε</b>, y para <b>cada</b> estado y <b>cada</b> símbolo hay <b>exactamente una</b> transición de salida. En una tabla de transición del AFD, cada casilla es <b>un solo estado</b> (no un conjunto). Aho lo resume: el AFN es una representación abstracta de un algoritmo de reconocimiento; el AFD <b>es</b> el algoritmo concreto y directo — es el que en realidad se implementa.</p>

<h3>Cuándo un autómata acepta una cadena</h3>
<p>Un AFN <b>acepta</b> la cadena x si existe <b>algún</b> camino del estado inicial a algún estado de aceptación cuyas etiquetas deletreen x (las ε se ignoran, no aportan símbolo). Basta que exista <b>un</b> camino ganador; que haya otros caminos que terminen en estados de no-aceptación es irrelevante.</p>

<h3>El ejemplo canónico: (a|b)*abb</h3>
<p>Esta ER — «cadenas de <code>a</code> y <code>b</code> que terminan en <code>abb</code>» — la vamos a usar en toda la sección. Su <b>AFN</b> (tabla de transición; → marca el inicial, <code>*</code> el de aceptación):</p>
<pre><code>          a          b
→ 0       {0, 1}     {0}
  1       ∅          {2}
  2       ∅          {3}
* 3       ∅          ∅</code></pre>
<p>En el estado 0 hay <b>no determinismo</b>: con <code>a</code> podés quedarte en 0 <b>o</b> irte a 1. La cadena <code>aabb</code> se acepta por el camino 0→0→1→2→3, aunque también exista el camino 0→0→0→0→0 que no acepta. Con que exista <b>uno</b> que acepte, alcanza.</p>
<p>El <b>AFD</b> equivalente para el mismo lenguaje (cada casilla, un único estado):</p>
<pre><code>          a     b
→ 0       1     0
  1       1     2
  2       1     3
* 3       1     0</code></pre>
<p>Con <code>ababb</code>, el AFD recorre la secuencia forzada 0,1,2,1,2,3 y responde «sí». No hay que adivinar nada.</p>

<h3>Simular un AFD: el algoritmo entero en cuatro líneas</h3>
<pre><code>s = s0;
c = sigCar();
while (c != eof) { s = mover(s, c); c = sigCar(); }
if (s está en F) return "sí"; else return "no";</code></pre>
<p><code>mover(s, c)</code> devuelve el único estado al que va la flecha. Por eso el AFD es tan rápido: un paso por carácter, sin exploración.</p>

<div class="callout tgt"><span class="lab">🎯 el mismo poder, distinto costo</span>
Dato que cae en el parcial: <b>AFN y AFD reconocen exactamente los mismos lenguajes</b> — los <b>lenguajes regulares</b>, los mismos que describen las expresiones regulares. No hay un lenguaje que un AFN pueda reconocer y un AFD no. Difieren en <b>tamaño y velocidad</b>, no en poder. ¿Cuál conviene para <b>ejecutar</b>? El <b>AFD</b>: es determinista, un solo camino, tiempo lineal. El AFN es más fácil de <b>construir</b> desde una ER, pero más caro de <b>simular</b>. Todo el resto del módulo es cómo pasar de la ER cómoda al AFD rápido.</div>

<h3>El caso borde: el estado muerto</h3>
<p>Formalmente, un AFD necesita una transición por cada estado y cada símbolo. Cuando desde un estado no hay a dónde ir con cierto símbolo, se agrega un <b>estado muerto ∅</b> que se transfiere a sí mismo con todo y del que no se sale nunca. En los dibujos se lo suele omitir, pero en un analizador léxico es <b>importante</b>: caer en el estado muerto es la señal de que «ya no hay ningún lexema más largo posible», que es cuando el léxico corta y retrocede (lo vemos en 3.10).</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>AFN</b>: para un estado y símbolo puede haber <b>cero, uno o varios</b> siguientes, y hay transiciones <b>ε</b> (sin consumir símbolo). Fácil de construir desde una ER.</li>
<li><b>AFD</b>: para cada estado y símbolo, <b>exactamente uno</b>; <b>sin ε</b>. Es el algoritmo concreto que se implementa.</li>
<li>Un AFN <b>acepta</b> si existe <b>algún</b> camino del inicial a un final que deletree la cadena.</li>
<li>🎯 Los dos reconocen los mismos <b>lenguajes regulares</b>; para <b>ejecutar rápido</b> conviene el <b>AFD</b> (tiempo lineal, sin exploración).</li>
</ul>`,
    qa:[
      {q:"¿Cuál es la diferencia entre AFD y AFN, y cuál conviene para ejecutar rápido?",
       a:`<p>En un <b>AFD</b> cada par (estado, símbolo) tiene <b>un único</b> estado siguiente y <b>no hay transiciones ε</b>. En un <b>AFN</b> puede haber <b>cero, uno o varios</b> siguientes para el mismo símbolo, y se permiten transiciones <b>ε</b> (que se cruzan sin consumir símbolo). Los dos reconocen exactamente los mismos lenguajes: los <b>regulares</b>. Para <b>ejecutar rápido</b> conviene el <b>AFD</b>, porque es determinista: se sigue un solo camino, un paso por carácter, sin explorar alternativas (tiempo lineal en la longitud de la entrada).</p>`},
      {q:"¿Cuándo un AFN acepta una cadena de entrada?",
       a:`<p>Un AFN acepta la cadena x cuando existe <b>al menos un</b> camino desde el estado inicial hasta <b>algún</b> estado de aceptación, tal que las etiquetas de las flechas de ese camino deletreen x (las transiciones ε se ignoran, porque no aportan símbolo). La clave del no determinismo es que basta con que <b>exista un</b> camino ganador: que haya otros caminos etiquetados por la misma cadena que terminen en estados de no-aceptación es <b>irrelevante</b>. Ejemplo: en el AFN de <code>(a|b)*abb</code>, la cadena <code>aabb</code> se acepta por 0→0→1→2→3, aunque también exista 0→0→0→0→0 que no acepta.</p>`},
      {q:"Enumerá los cinco componentes de un AFN según la definición formal de Aho.",
       a:`<p>(1) un conjunto finito de <b>estados</b> S; (2) un <b>alfabeto</b> de entrada Σ (donde ε nunca es miembro); (3) una <b>función de transición</b> que a cada estado y cada símbolo de Σ ∪ {ε} le asigna un <b>conjunto</b> de estados siguientes; (4) un <b>estado inicial</b> s0; y (5) un conjunto <b>F</b> de estados de <b>aceptación</b> (finales). Lo que lo vuelve «no determinista» está en el punto 3: la transición devuelve un <b>conjunto</b> (puede haber varios destinos con el mismo símbolo) y admite el símbolo <b>ε</b>.</p>`},
      {q:"V/F justificando: «Hay lenguajes que un AFN puede reconocer pero ningún AFD puede.»",
       a:`<p><b>Falso.</b> Los AFN y los AFD reconocen <b>exactamente el mismo conjunto de lenguajes</b>: los <b>lenguajes regulares</b>, que son los mismos que describen las expresiones regulares. De hecho, todo AFN se puede convertir en un AFD equivalente mediante la construcción de subconjuntos (lección 3.5). La diferencia no es de <b>poder</b> sino de <b>economía</b>: el AFN suele tener menos estados y es más fácil de construir desde una ER, mientras que el AFD puede tener más estados pero se simula mucho más rápido.</p>`}
    ]
  },
  {
    id:"3.4", titulo:"Construcción de Thompson: ER → AFN", aho:"§3.7.4 · p.159", badges:["📘"], estado:"dictada",
    html:`
<p>Esta lección es <b>📘 de Aho</b>: la cátedra no la toma en el parcial, pero es <b>el primer eslabón</b> de lo que Flex hace por dentro. Cuando le das a Flex una expresión regular, lo primero que arma es un AFN, y lo arma con este algoritmo. Entenderlo explica por qué «al llegar al estado final el léxico ya reconoció el token».</p>

<p>La <b>construcción de Thompson</b> (nombre completo: McNaughton-Yamada-Thompson) convierte cualquier <b>expresión regular</b> en un <b>AFN</b> que reconoce el mismo lenguaje. Es <b>dirigida por sintaxis</b>: recorre el árbol sintáctico de la ER de abajo hacia arriba, y por cada pieza arma un pequeño autómata, pegándolos con transiciones ε.</p>

<h3>La analogía de los bloques de Lego</h3>
<p>Cada símbolo de la ER es una <b>pieza básica</b> de Lego (un autómata de dos estados). Cada operador — unión, concatenación, clausura — es una <b>forma de ensamblar</b> piezas más chicas en una más grande. Como los encastres siempre son compatibles (cada pieza tiene <b>un</b> enchufe de entrada y <b>un</b> enchufe de salida), podés construir el autómata de una ER enorme apilando bloques sin que nunca «no cierre».</p>

<h3>Las piezas básicas</h3>
<pre><code>Para ε:            inicio → (i) --ε--&gt; ((f))
Para un símbolo a: inicio → (i) --a--&gt; ((f))</code></pre>
<p>Cada aparición de un símbolo estrena <b>estados nuevos</b>: si <code>a</code> aparece dos veces en la ER, se construyen dos autómatas distintos.</p>

<h3>Las tres reglas inductivas</h3>
<p>Suponé que ya tenés N(s) y N(t), los AFN de las subexpresiones s y t.</p>
<ul>
<li><b>Unión r = s|t:</b> un nuevo inicial <code>i</code> con <b>dos ramas ε</b> hacia los iniciales de N(s) y N(t); los finales de N(s) y N(t) se unen con <b>ε</b> a un nuevo final <code>f</code>. Como todo camino de <code>i</code> a <code>f</code> pasa por <b>una</b> de las dos ramas, N(r) acepta L(s) ∪ L(t).</li>
<li><b>Concatenación r = st:</b> se <b>fusiona</b> el estado de aceptación de N(s) con el estado inicial de N(t). El camino cruza primero N(s) y después N(t), así que la etiqueta empieza con una cadena de L(s) y termina con una de L(t): acepta L(s)L(t).</li>
<li><b>Clausura r = s*:</b> un nuevo inicial <code>i</code> y un nuevo final <code>f</code>, con cuatro ε: de <code>i</code> a <code>f</code> directo (para aceptar la cadena vacía), de <code>i</code> al inicial de N(s), del final de N(s) de vuelta a su inicial (para repetir) y del final de N(s) a <code>f</code>. Así N(r) acepta cero o más repeticiones de L(s).</li>
</ul>

<h3>Tres propiedades que valen oro</h3>
<ul>
<li><b>Tamaño acotado:</b> N(r) tiene <b>a lo sumo el doble</b> de estados que operadores y operandos hay en r. El AFN nunca «explota».</li>
<li><b>Un único estado de aceptación</b>, sin transiciones de salida. Y el estado inicial no tiene transiciones de entrada.</li>
<li>Cada estado no-aceptante tiene <b>una</b> transición sobre un símbolo, <b>o</b> dos transiciones ε. Nunca más.</li>
</ul>

<h3>Armando (a|b)*abb paso a paso</h3>
<p>El árbol de la ER se recorre de las hojas a la raíz. A grandes rasgos:</p>
<pre><code>1) piezas básicas para 'a' y para 'b'
2) unión  →  N(a|b)          (nuevo inicial con dos ramas ε)
3) clausura → N((a|b)*)      (bucle ε alrededor de N(a|b))
4) concatenar con 'a', luego 'b', luego 'b'  →  N((a|b)*abb)</code></pre>
<p>El resultado es un AFN de 11 estados (0 a 10) con muchas transiciones ε: exactamente el que vamos a convertir a AFD en la lección 3.5. Fijate que el <b>único</b> estado de aceptación es el 10, y solo se llega ahí tras deletrear <code>...abb</code>.</p>

<div class="callout aho"><span class="lab">📘 dónde encaja en Flex (no es de parcial)</span>
Esto no te lo van a tomar, pero es el <b>paso 1</b> de Flex: ER → AFN. Los pasos siguientes son AFN → AFD (subconjuntos, 3.5) y la minimización (3.8). Ver Thompson aclara la frase de la cátedra «si el autómata llegó al estado final, ya reconoció el lexema»: el estado de aceptación de N(r) es, por construcción, el punto exacto donde se completó una cadena de L(r). Las transiciones ε explican por qué el AFN «espía» sin consumir caracteres.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Thompson convierte una <b>ER en un AFN</b> (con transiciones ε), recorriendo el árbol de la ER de abajo hacia arriba.</li>
<li>Piezas básicas (símbolo, ε) + tres ensambles: <b>unión</b> (dos ramas ε), <b>concatenación</b> (fusionar final con inicial) y <b>clausura</b> (bucle ε).</li>
<li>El AFN resultante tiene <b>a lo sumo el doble</b> de estados que el tamaño de la ER, y <b>un único</b> estado de aceptación sin salidas.</li>
<li>Es el <b>primer paso</b> del pipeline de Flex: ER → AFN → AFD → AFD mínimo.</li>
</ul>`,
    qa:[
      {q:"¿Qué produce la construcción de Thompson y a partir de qué?",
       a:`<p>Produce un <b>AFN</b> (con transiciones ε) a partir de una <b>expresión regular</b>, de modo que el AFN reconozca exactamente el mismo lenguaje L(r). Lo hace de forma <b>dirigida por sintaxis</b>: recorre el árbol sintáctico de la ER desde las hojas hacia la raíz, construyendo un pequeño autómata por cada símbolo y combinándolos con las reglas de unión, concatenación y clausura. Es el <b>primer paso</b> del pipeline que usa Flex: ER → AFN → AFD → AFD minimizado.</p>`},
      {q:"Explicá las tres reglas inductivas de Thompson (unión, concatenación y clausura).",
       a:`<p><b>Unión (s|t):</b> se crea un estado inicial nuevo con <b>dos ramas ε</b> hacia los iniciales de N(s) y N(t), y los finales de ambos se conectan con <b>ε</b> a un final nuevo; todo camino pasa por una sola de las ramas, así que acepta L(s) ∪ L(t). <b>Concatenación (st):</b> se <b>fusiona</b> el estado de aceptación de N(s) con el estado inicial de N(t), de modo que el camino cruza primero N(s) y después N(t): acepta L(s)L(t). <b>Clausura (s*):</b> se agregan un inicial y un final nuevos con transiciones ε que permiten (a) saltar directo del inicial al final (cadena vacía) y (b) volver del final de N(s) a su inicial para repetir: acepta cero o más copias de L(s).</p>`},
      {q:"¿Cuántos estados tiene, como máximo, el AFN que produce Thompson, y por qué importa esa cota?",
       a:`<p>Tiene <b>a lo sumo el doble</b> de estados que la cantidad de operadores y operandos de la expresión regular (o sea, es lineal en el tamaño de la ER). Importa porque garantiza que la construcción <b>no explota</b>: convertir la ER en AFN es barato y el AFN queda chico. La cota sale de que cada paso del algoritmo agrega a lo sumo dos estados nuevos. Además, el AFN tiene un <b>único</b> estado de aceptación (sin transiciones de salida) y un inicial sin transiciones de entrada, lo que hace muy prolijo el pegado de piezas.</p>`},
      {q:"¿Por qué la construcción de Thompson usa transiciones ε si el AFD final no las tiene?",
       a:`<p>Las <b>ε</b> son el «pegamento» que permite ensamblar sub-autómatas sin preocuparse por cómo encajan sus estados: sirven para ofrecer <b>opciones</b> (las dos ramas de una unión), para <b>repetir</b> (el bucle de la clausura) y para saltar sin consumir símbolo (aceptar la cadena vacía). Gracias a ellas cada pieza mantiene un solo enchufe de entrada y uno de salida. El precio es el <b>no determinismo</b>, que es incómodo de simular; por eso, después, la construcción de subconjuntos (3.5) elimina las ε y produce un AFD sin ellas. Thompson prioriza la <b>facilidad de construcción</b>; el AFD prioriza la <b>velocidad de ejecución</b>.</p>`}
    ]
  },
  {
    id:"3.5", titulo:"Construcción de subconjuntos: AFN → AFD", aho:"§3.7.1 · p.152", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, no de parcial</b>, pero es <b>el paso 2</b> de Flex y la idea más importante del módulo. Thompson (3.4) te dio un AFN cómodo de construir pero incómodo de simular (hay que seguir varios caminos a la vez). La <b>construcción de subconjuntos</b> lo convierte en un AFD determinista, que se corre de un saque.</p>

<h3>La idea de una sola frase</h3>
<p>Cada estado del AFD es un <b>conjunto de estados del AFN</b>: exactamente el conjunto de estados en los que el AFN <b>podría estar simultáneamente</b> después de haber leído la misma entrada. En vez de clonarte y explorar caminos paralelos (AFN), llevás la cuenta de «en qué salas del laberinto del AFN podría estar parado ahora mismo», y ese conjunto <b>es</b> un único estado del AFD.</p>

<h3>La analogía del rastreador</h3>
<p>Sos un detective siguiendo a un sospechoso por una ciudad de túneles (el AFN) donde, en cada cruce, puede tomar varios túneles a la vez. No sabés cuál eligió, así que marcás en un mapa <b>todos</b> los lugares donde podría estar. Cada vez que el sospechoso da un paso (lee un símbolo), actualizás el conjunto de posiciones posibles. Ese «conjunto de posiciones posibles» es tu estado mental — y es un <b>único</b> estado del AFD.</p>

<h3>Las tres operaciones que hacen falta</h3>
<ul>
<li><b>ε-cerradura(s):</b> todos los estados del AFN alcanzables desde <code>s</code> siguiendo <b>solo</b> transiciones ε (incluye a <code>s</code> mismo).</li>
<li><b>ε-cerradura(T):</b> lo mismo pero partiendo de un <b>conjunto</b> T de estados (la unión de las ε-cerraduras de cada uno).</li>
<li><b>mover(T, a):</b> el conjunto de estados a los que se llega desde algún estado de T <b>consumiendo el símbolo a</b>.</li>
</ul>
<p>La combinación clave es <b>ε-cerradura(mover(T, a))</b>: «desde donde podría estar (T), doy un paso con <code>a</code>, y después dejo que se cuelen todos los estados alcanzables por ε». Eso da el próximo estado del AFD.</p>

<h3>El algoritmo</h3>
<pre><code>estado inicial del AFD = ε-cerradura(s0)
while (hay un estado T sin marcar) {
   marcar T;
   for (cada símbolo a) {
      U = ε-cerradura(mover(T, a));
      if (U es nuevo) agregarlo sin marcar;
      Dtran[T, a] = U;
   }
}</code></pre>
<p>Los estados de aceptación del AFD son los conjuntos que contienen <b>al menos un</b> estado de aceptación del AFN.</p>

<h3>Ejemplo trabajado: el AFN de (a|b)*abb → AFD</h3>
<p>Partimos del AFN de 11 estados (0..10) que armó Thompson en 3.4. El estado inicial del AFD es <b>A = ε-cerradura(0) = {0,1,2,4,7}</b> (todo lo alcanzable desde 0 sin consumir nada). Ahora calculamos transiciones. Por ejemplo, <code>mover(A, a) = {3,8}</code> (los que consumen <code>a</code>), y su ε-cerradura es <code>{1,2,3,4,6,7,8}</code> = B. La tabla completa:</p>
<pre><code>CONJUNTO DE ESTADOS AFN      AFD    a    b
{0, 1, 2, 4, 7}              A      B    C
{1, 2, 3, 4, 6, 7, 8}       B      B    D
{1, 2, 4, 5, 6, 7}          C      B    C
{1, 2, 4, 5, 6, 7, 9}       D      B    E
{1, 2, 3, 5, 6, 7, 10}      E      B    C</code></pre>
<p>El AFN de 11 estados colapsó en un AFD de <b>5</b> estados (A..E). El único de aceptación es <b>E</b>, porque es el único conjunto que contiene el estado 10 (el aceptante del AFN). Notá que A y C tienen las mismas transiciones (B con <code>a</code>, C con <code>b</code>): son candidatos a fusionarse, y eso es justo lo que hará la minimización (3.8).</p>

<div class="callout aho"><span class="lab">📘 la explosión exponencial (y por qué no asusta en Flex)</span>
En el <b>peor caso</b>, un AFN de n estados puede dar un AFD de hasta <b>2ⁿ</b> estados (porque hay 2ⁿ subconjuntos posibles). Suena catastrófico, y es la razón por la que a veces conviene <b>no</b> construir el AFD (3.6). Pero Aho aclara que <b>para los lenguajes reales</b> — los patrones de tokens de un lenguaje de programación — el AFN y el AFD terminan teniendo <b>aproximadamente la misma cantidad</b> de estados, y la explosión exponencial no aparece. Por eso Flex se permite construir el AFD tranquilo. No es de parcial, pero es el «porqué» de que la técnica sea práctica.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La construcción de subconjuntos convierte un <b>AFN en un AFD</b> equivalente, eliminando el no determinismo.</li>
<li>Cada <b>estado del AFD</b> es un <b>conjunto de estados del AFN</b>: aquellos en los que el AFN podría estar a la vez tras leer la misma entrada.</li>
<li>Herramientas: <b>ε-cerradura</b> (alcanzables por ε) y <b>mover(T,a)</b>. El próximo estado es <b>ε-cerradura(mover(T, a))</b>.</li>
<li>Estado inicial del AFD = ε-cerradura(s0); aceptan los conjuntos que contengan un aceptante del AFN. En el peor caso hay 2ⁿ estados, pero en lenguajes reales no.</li>
</ul>`,
    qa:[
      {q:"En la construcción de subconjuntos, ¿qué representa un estado del AFD?",
       a:`<p>Representa un <b>conjunto de estados del AFN</b>: todos los estados en los que el AFN <b>podría estar simultáneamente</b> después de haber consumido la misma cadena de entrada. En lugar de seguir varios caminos en paralelo (como haría el AFN), el AFD lleva la cuenta de ese conjunto de «posiciones posibles» y lo trata como <b>un único</b> estado. La <b>ε-cerradura</b> se encarga de agregar al conjunto todos los estados alcanzables por transiciones ε, con lo cual desaparece el no determinismo.</p>`},
      {q:"¿Qué es la ε-cerradura de un conjunto de estados y para qué se usa en el algoritmo?",
       a:`<p>La <b>ε-cerradura(T)</b> es el conjunto de todos los estados del AFN alcanzables desde algún estado de T siguiendo <b>únicamente</b> transiciones ε (incluye a los propios estados de T). Se usa porque, tras dar un paso real con un símbolo, el AFN puede además «colarse» por transiciones ε sin consumir nada; hay que incluir todos esos estados en el conjunto actual. Por eso el próximo estado del AFD se calcula como <b>ε-cerradura(mover(T, a))</b>: primero movés con el símbolo <code>a</code>, y después cerrás por ε.</p>`},
      {q:"¿Cómo se determina el estado inicial del AFD y cuáles son sus estados de aceptación?",
       a:`<p>El <b>estado inicial</b> del AFD es la <b>ε-cerradura del estado inicial del AFN</b>, ε-cerradura(s0): todo lo alcanzable desde s0 sin consumir ningún símbolo. Los <b>estados de aceptación</b> del AFD son todos los conjuntos que contengan <b>al menos un</b> estado de aceptación del AFN. Ejemplo: en el AFD de <code>(a|b)*abb</code>, el estado inicial es {0,1,2,4,7} y el único de aceptación es {1,2,3,5,6,7,10}, porque es el único que incluye el estado 10, que era el aceptante del AFN.</p>`},
      {q:"¿Es cierto que el AFD siempre tiene muchísimos más estados que el AFN? Justificá.",
       a:`<p>En el <b>peor caso teórico</b> sí: un AFN de n estados puede producir un AFD de hasta <b>2ⁿ</b> estados, porque cada estado del AFD es un subconjunto de los n estados del AFN y hay 2ⁿ subconjuntos posibles. <b>Pero en la práctica no.</b> Aho remarca que para los lenguajes reales (los patrones de tokens de un lenguaje de programación), el AFN y el AFD terminan teniendo <b>aproximadamente la misma cantidad</b> de estados, y el comportamiento exponencial no aparece. Por eso los generadores como Flex pueden construir el AFD sin problema. El caso exponencial existe (lección 3.6) pero es raro y evitable.</p>`}
    ]
  },
  {
    id:"3.6", titulo:"Simular AFN vs AFD: tiempo vs espacio", aho:"§3.7.2–3.7.3 · p.156", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, no de parcial.</b> Ya vimos que se puede construir el AFD (3.5) o quedarse con el AFN. Esta lección responde <b>cuándo conviene cada uno</b>: es el clásico compromiso <b>tiempo vs espacio</b>, y explica por qué Flex elige AFD pero <code>grep</code> a veces no.</p>

<h3>Se puede simular el AFN sin convertirlo</h3>
<p>No estás obligado a construir el AFD. Podés simular el AFN <b>directamente</b>, manteniendo «sobre la marcha» el conjunto de estados actuales — que es la construcción de subconjuntos hecha en vivo, sin guardar la tabla:</p>
<pre><code>S = ε-cerradura(s0);
c = sigCar();
while (c != eof) { S = ε-cerradura(mover(S, c)); c = sigCar(); }
if (S ∩ F ≠ ∅) return "sí"; else return "no";</code></pre>
<p>En cada carácter recalculás el conjunto <code>S</code>. Funciona, pero cada paso cuesta más que en un AFD, porque hay que recorrer todos los estados activos.</p>

<h3>La analogía del buffet vs el ítem à la carte</h3>
<ul>
<li><b>AFD = buffet:</b> cocinás <b>todo</b> antes de abrir (construir el AFD es caro y ocupa lugar), pero después servís a cada comensal al instante (cada cadena se procesa rapidísimo, tiempo lineal).</li>
<li><b>AFN = à la carte:</b> no cocinás nada de antemano (barato de preparar), pero cada plato lleva su tiempo (cada cadena cuesta más de procesar).</li>
</ul>
<p>Si vas a atender <b>miles</b> de comensales (un compilador que corre el léxico sobre programas enteros), te conviene el buffet. Si viene <b>uno</b> solo (buscar un patrón en un archivo con <code>grep</code>), à la carte.</p>

<h3>Los números de Aho</h3>
<p>Sea |r| el tamaño de la ER y |x| la longitud de la cadena a reconocer. Aho resume las opciones:</p>
<pre><code>AUTÓMATA              COSTO INICIAL     COSTO POR CADENA
AFN                   O(|r|)            O(|r| × |x|)
AFD (caso típico)     O(|r|³)           O(|x|)
AFD (peor caso)       O(|r|² · 2^|r|)   O(|x|)</code></pre>
<p>Lectura: el AFN es <b>baratísimo de armar</b> pero <b>lento por cadena</b> (cada carácter cuesta proporcional al tamaño del autómata). El AFD es <b>caro de armar</b> (y en el peor caso, exponencial) pero <b>rapidísimo por cadena</b> (tiempo lineal, independiente de |r|).</p>

<h3>El caso patológico que hace explotar al AFD</h3>
<p>Aho da la familia <code>Lₙ = (a|b)*a(a|b)ⁿ⁻¹</code>: «cadenas donde el n-ésimo carácter desde la derecha es una <code>a</code>». El AFN necesita solo <b>n+1</b> estados, pero <b>cualquier</b> AFD para ese lenguaje necesita <b>al menos 2ⁿ</b> estados. Ahí el buffet es inviable. Por suerte, este tipo de patrón <b>casi nunca</b> aparece en análisis léxico.</p>

<div class="callout aho"><span class="lab">📘 la estrategia mixta (DFA perezoso)</span>
Hay un punto medio que es casi tan bueno como lo mejor de cada mundo: simular el AFN, pero <b>ir recordando</b> (memoizar) los conjuntos de estados y las transiciones a medida que se calculan. Antes de recalcular una transición, se revisa si ya se computó y se reutiliza. Es un AFD que se construye <b>bajo demanda</b>, solo los estados que la entrada realmente visita. Muchos motores de expresiones regulares reales usan esta idea. No es de parcial, pero es la respuesta elegante al dilema tiempo/espacio.</div>

<h3>Por qué Flex elige AFD</h3>
<p>Un analizador léxico se construye <b>una vez</b> y después corre sobre <b>muchísimos</b> caracteres (todos los programas que compila). En esa ecuación, el costo inicial de construir el AFD se paga una sola vez y se amortiza sobradamente contra el ahorro por carácter. Por eso <b>domina el costo por cadena</b> y gana el AFD. <code>grep</code>, que arma el autómata y lo corre sobre un solo archivo, muchas veces prefiere simular el AFN.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Se puede <b>simular el AFN directo</b> (conjunto de estados «sobre la marcha») o <b>construir el AFD</b> y simularlo.</li>
<li><b>Compromiso tiempo/espacio:</b> el AFD es rápido por cadena (O(|x|)) pero caro y a veces exponencial de construir; el AFN es barato de armar pero lento por cadena (O(|r|·|x|)).</li>
<li>Flex usa <b>AFD</b> porque el léxico corre muchas veces y domina el costo por carácter; <code>grep</code> a veces usa AFN.</li>
<li>La <b>estrategia mixta</b> (memoizar los estados del AFD sobre la marcha) combina lo mejor de ambos.</li>
</ul>`,
    qa:[
      {q:"¿Cuál es el compromiso entre simular un AFN y simular un AFD?",
       a:`<p>Es un compromiso <b>tiempo vs espacio</b>. El <b>AFD</b> corre en <b>tiempo lineal</b> sobre la entrada (un paso por carácter, O(|x|)), pero <b>construirlo</b> es caro y en el peor caso puede tener una cantidad <b>exponencial</b> de estados (mucha memoria). El <b>AFN</b> ocupa poco y es baratísimo de armar (O(|r|)), pero <b>cada paso de la simulación cuesta más</b>, porque hay que mantener y recorrer el conjunto de estados activos (O(|r|·|x|) por cadena). En resumen: el AFD paga por adelantado para correr rápido; el AFN no paga por adelantado pero corre más lento.</p>`},
      {q:"¿Por qué Flex construye un AFD y en cambio grep muchas veces simula el AFN directamente?",
       a:`<p>Porque cambia <b>cuántas veces se corre</b> el autómata. Un <b>analizador léxico</b> se genera <b>una sola vez</b> y después procesa <b>enormes</b> cantidades de caracteres (todos los programas que se compilan): ahí <b>domina el costo por cadena</b>, así que conviene pagar el costo alto de construir el AFD una vez y disfrutar del O(|x|) por siempre. <b>grep</b>, en cambio, arma el autómata y lo corre sobre <b>un solo</b> archivo (a veces chico): el costo inicial no se amortiza, así que suele ser más eficiente <b>simular el AFN directamente</b> y ahorrarse la conversión.</p>`},
      {q:"Dá un ejemplo de lenguaje donde el AFD explota exponencialmente respecto del AFN.",
       a:`<p>La familia de Aho <b>Lₙ = (a|b)*a(a|b)ⁿ⁻¹</b>: las cadenas de <code>a</code> y <code>b</code> en las que el <b>n-ésimo carácter contando desde la derecha</b> es una <code>a</code>. Para reconocerlo, un <b>AFN</b> necesita apenas <b>n+1</b> estados (se queda en el inicial hasta que decide que «esta a es la buena» y cuenta n-1 posiciones más). Pero <b>cualquier AFD</b> para ese lenguaje necesita <b>al menos 2ⁿ</b> estados, porque debe recordar los últimos n caracteres leídos para saber cuál era el n-ésimo desde el final. Es el caso patológico del compromiso; por suerte no aparece en el análisis léxico real.</p>`},
      {q:"¿En qué consiste la estrategia mixta (o «AFD perezoso») para reconocer expresiones regulares?",
       a:`<p>Consiste en <b>simular el AFN</b> pero <b>recordando</b> (memoizando) los conjuntos de estados del AFN — es decir, los estados del AFD — y sus transiciones <b>a medida que se calculan</b>. Antes de procesar un conjunto de estados con un símbolo, se verifica si esa transición ya se computó antes; si sí, se reutiliza en vez de recalcularla. En la práctica se va construyendo el AFD <b>bajo demanda</b>, solo con los estados que la entrada realmente visita, evitando la explosión exponencial de construir todo el AFD por adelantado. Combina lo barato de armar del AFN con lo rápido por cadena del AFD.</p>`}
    ]
  },
  {
    id:"3.7", titulo:"ER → AFD directo: anulable, primerapos, siguientepos", aho:"§3.9.2–3.9.5 · p.175", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, no de parcial.</b> Hasta ahora el camino fue ER → AFN → AFD (dos pasos). Esta lección muestra un <b>atajo</b>: ir de la ER <b>directo</b> al AFD, <b>sin</b> construir el AFN intermedio. Es la técnica que usa el compilador de Lex y suele dar un AFD con menos estados de arranque.</p>

<h3>La idea: leer la estructura de la ER, no simularla</h3>
<p>En vez de armar autómatas, se trabaja sobre el <b>árbol sintáctico</b> de la expresión regular y se calculan cuatro funciones que responden preguntas sobre <b>posiciones</b> (los símbolos de la ER, numerados). El AFD sale de combinar esas funciones.</p>

<h3>El truco del marcador final #</h3>
<p>Primero se <b>aumenta</b> la ER concatenándole un marcador <code>#</code>: se trabaja con <code>(r)#</code>. ¿Para qué? El <code>#</code> ocupa una posición, y <b>llegar a la posición del <code>#</code> equivale a aceptar</b>. Así te olvidás de rastrear estados de aceptación durante toda la construcción: al final, cualquier estado que contenga la posición del <code>#</code> es de aceptación.</p>

<h3>Numerar las posiciones</h3>
<p>Cada hoja del árbol (cada símbolo del alfabeto) recibe un número único: su <b>posición</b>. Un mismo símbolo puede tener varias posiciones. Para <code>(a|b)*abb#</code>:</p>
<pre><code>posición 1 → a  (la a de (a|b))
posición 2 → b  (la b de (a|b))
posición 3 → a  (la a de abb)
posición 4 → b  (la primera b de abb)
posición 5 → b  (la segunda b de abb)
posición 6 → #  (marcador final)</code></pre>

<h3>Las cuatro funciones</h3>
<ul>
<li><b>anulable(n):</b> ¿la subexpresión del nodo <code>n</code> puede generar la cadena vacía ε? (Por ejemplo, <code>s*</code> siempre es anulable.)</li>
<li><b>primerapos(n):</b> el conjunto de posiciones que pueden ser el <b>primer</b> símbolo de alguna cadena generada por <code>n</code>.</li>
<li><b>ultimapos(n):</b> las posiciones que pueden ser el <b>último</b> símbolo.</li>
<li><b>siguientepos(p):</b> para una posición <code>p</code>, qué posiciones pueden venir <b>inmediatamente después</b> de <code>p</code> en alguna cadena.</li>
</ul>

<h3>Cómo se calculan (las reglas clave)</h3>
<p><b>anulable y primerapos</b> se calculan de las hojas a la raíz:</p>
<pre><code>NODO n              anulable(n)                primerapos(n)
hoja ε              true                       ∅
hoja posición i     false                      {i}
o (c1|c2)           anulable(c1) OR (c2)       primerapos(c1) ∪ primerapos(c2)
concat (c1 c2)      anulable(c1) AND (c2)      si anulable(c1): unir ambos
                                               si no: solo primerapos(c1)
asterisco (c1*)     true                       primerapos(c1)</code></pre>
<p><b>ultimapos</b> es idéntico a primerapos pero intercambiando los hijos en el nodo-concat. Y <b>siguientepos</b> sale de dos reglas:</p>
<ul>
<li><b>Regla de concatenación:</b> si <code>n</code> es un nodo-concat con hijos c1 y c2, entonces para cada posición <code>i</code> de ultimapos(c1), todas las de primerapos(c2) están en siguientepos(i). (Lo que termina la parte izquierda puede ser seguido por lo que empieza la derecha.)</li>
<li><b>Regla de clausura:</b> si <code>n</code> es un nodo-asterisco, para cada <code>i</code> de ultimapos(n), todas las de primerapos(n) están en siguientepos(i). (Lo que termina una repetición puede ser seguido por lo que empieza la siguiente.)</li>
</ul>

<h3>Ejemplo trabajado: (a|b)*abb#</h3>
<p>Aplicando las reglas, la tabla de <b>siguientepos</b> queda:</p>
<pre><code>POSICIÓN   siguientepos
1          {1, 2, 3}
2          {1, 2, 3}
3          {4}
4          {5}
5          {6}
6          ∅</code></pre>
<p>Ahora el AFD: el <b>estado inicial</b> es primerapos(raíz) = <b>{1,2,3}</b>. Para la transición con <code>a</code>, se toman las posiciones de {1,2,3} que <b>corresponden a <code>a</code></b> (la 1 y la 3) y se unen sus siguientepos: siguientepos(1) ∪ siguientepos(3) = {1,2,3} ∪ {4} = {1,2,3,4}. Repitiendo para cada estado y símbolo:</p>
<pre><code>             a         b
→ {1,2,3}    {1,2,3,4} {1,2,3}
  {1,2,3,4}  {1,2,3,4} {1,2,3,5}
  {1,2,3,5}  {1,2,3,4} {1,2,3,6}
* {1,2,3,6}  {1,2,3,4} {1,2,3}</code></pre>
<p>Los estados que contienen la posición 6 (el <code>#</code>) son de aceptación: acá, {1,2,3,6}. Salió un AFD de <b>4 estados</b> — <b>uno menos</b> que los 5 que dio el camino por AFN + subconjuntos (3.5). De hecho, este ya es el AFD <b>mínimo</b>.</p>

<div class="callout aho"><span class="lab">📘 por qué esto no es de parcial pero suma</span>
La cátedra no toma anulable/primerapos/siguientepos. Pero esta técnica es <b>literalmente</b> la que usa el compilador de Lex para armar el AFD, y muestra algo lindo: siguientepos, dibujado como grafo, es <b>casi un AFN sin transiciones ε</b>. Verlo cierra la idea de que una ER «ya contiene» su autómata: no hace falta simular nada, solo leer la estructura del árbol. Es el «porqué» profundo de que Flex sea determinista y veloz.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Se puede ir de la ER al AFD <b>sin AFN intermedio</b>, trabajando sobre el árbol de la ER <b>aumentada</b> con <code>#</code>.</li>
<li>El <code>#</code> marca la aceptación: los estados que contienen su posición son finales.</li>
<li>Cuatro funciones: <b>anulable</b> (¿genera ε?), <b>primerapos</b> (primeros símbolos), <b>ultimapos</b> (últimos), <b>siguientepos</b> (quién puede seguir a quién).</li>
<li>El AFD: estado inicial = primerapos(raíz); Dtran[S,a] = unión de siguientepos de las posiciones de S que sean <code>a</code>. Suele salir más chico que por AFN.</li>
</ul>`,
    qa:[
      {q:"¿Qué información captura la función siguientepos(n)?",
       a:`<p>Captura el conjunto de posiciones que pueden <b>seguir inmediatamente</b> a la posición <code>n</code> en alguna cadena generada por la expresión regular. En otras palabras: si en una cadena válida el símbolo de la posición <code>n</code> aparece, ¿qué posiciones podrían venir justo después? Es la función que define las <b>transiciones</b> del AFD: desde un estado (que es un conjunto de posiciones), con un símbolo <code>a</code>, se va a la unión de los siguientepos de las posiciones de ese estado que correspondan a <code>a</code>. Se calcula con dos reglas: la de concatenación (ultimapos del hijo izquierdo → primerapos del derecho) y la de clausura (ultimapos → primerapos del propio nodo asterisco).</p>`},
      {q:"¿Para qué sirve aumentar la expresión regular con el marcador # (trabajar con (r)#)?",
       a:`<p>El marcador <code>#</code> se concatena al final de la ER para <b>marcar la aceptación</b> con una posición propia. Como <code>#</code> ocupa la última posición, <b>llegar a esa posición equivale a haber reconocido una cadena completa del lenguaje</b>. La ventaja práctica: durante toda la construcción del AFD te podés <b>olvidar</b> de rastrear cuáles estados son de aceptación; al terminar, son de aceptación exactamente los estados (conjuntos de posiciones) que <b>contienen la posición del <code>#</code></b>. Es un truco para simplificar el algoritmo.</p>`},
      {q:"¿Cuándo es anulable un nodo-concatenación y cuándo un nodo-asterisco? ¿Por qué?",
       a:`<p>Un <b>nodo-asterisco</b> (<code>c1*</code>) es <b>siempre anulable</b>, porque la clausura incluye «cero repeticiones», que es la cadena vacía ε. Un <b>nodo-concatenación</b> (<code>c1 c2</code>) es anulable <b>solo si sus dos hijos lo son</b> (anulable(c1) AND anulable(c2)): para que el todo pueda ser vacío, tanto la parte izquierda como la derecha tienen que poder desaparecer. En cambio, un <b>nodo-unión</b> (<code>c1|c2</code>) es anulable si <b>alguno</b> de los dos lo es (OR), porque basta elegir la rama que genera ε. Una hoja con un símbolo nunca es anulable; la hoja ε sí.</p>`},
      {q:"En la construcción directa, ¿cómo se obtiene el estado inicial del AFD y cómo se calcula una transición?",
       a:`<p>El <b>estado inicial</b> del AFD es <b>primerapos(raíz)</b>: el conjunto de posiciones que pueden ser el primer símbolo de alguna cadena de la ER aumentada. Una <b>transición</b> Dtran[S, a] se calcula así: de las posiciones del estado <code>S</code>, se toman las que <b>corresponden al símbolo <code>a</code></b>, y se hace la <b>unión de sus siguientepos</b>; ese conjunto es el estado destino (si es nuevo, se agrega). Ejemplo con <code>(a|b)*abb#</code>: el inicial es {1,2,3}; con <code>a</code> se toman las posiciones 1 y 3 (que son <code>a</code>) y se unen siguientepos(1)={1,2,3} y siguientepos(3)={4}, dando {1,2,3,4}. Los estados que contengan la posición del <code>#</code> son de aceptación.</p>`}
    ]
  },
  {
    id:"3.8", titulo:"Minimización de un AFD", aho:"§3.9.6 · p.180", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, no de parcial.</b> Es el <b>último paso</b> del pipeline de Flex. Un AFD puede tener estados «de más» que se comportan idéntico; la minimización los fusiona y produce el AFD con la <b>menor cantidad de estados</b> posible. Menos estados = tabla de transiciones más chica en el léxico generado.</p>

<h3>Estados equivalentes: la idea central</h3>
<p>Dos estados son <b>equivalentes</b> si, para <b>toda</b> cadena imaginable, arrancar desde uno u otro lleva al <b>mismo veredicto</b> (ambos aceptan o ambos rechazan). Si dos estados «se comportan igual hacia el futuro» pase lo que pase, son el mismo estado disfrazado, y se pueden fusionar.</p>
<p>Al revés: una cadena <code>x</code> <b>diferencia</b> el estado <code>s</code> del <code>t</code> si, siguiendo <code>x</code> desde cada uno, <b>solo uno</b> termina en aceptación. Si existe alguna cadena que los diferencie, no son equivalentes.</p>

<h3>La analogía de agrupar por comportamiento</h3>
<p>Imaginá que tenés que agrupar empleados que hacen «exactamente el mismo trabajo». Empezás con una división gruesa: los que <b>atienden público</b> y los que <b>no</b>. Después, dentro de cada grupo, buscás alguna <b>tarea</b> que dos de ellos hagan distinto; si la encontrás, los separás en subgrupos. Repetís hasta que dentro de cada grupo <b>nadie</b> se comporta distinto de sus compañeros ante <b>ninguna</b> tarea. Esos grupos finales son los «roles» reales. En el AFD, «atender público» = ser aceptante, y «las tareas» = los símbolos de entrada.</p>

<h3>El algoritmo (partición por refinamiento)</h3>
<pre><code>1. Partición inicial: DOS grupos → {aceptantes} y {no aceptantes}.
2. Refinar: para cada grupo, mirar a dónde va cada estado con cada símbolo.
   Si dos estados del grupo van a GRUPOS DISTINTOS con algún símbolo,
   se parte el grupo separándolos.
3. Repetir el paso 2 hasta que ningún grupo se pueda partir más.
4. Cada grupo final = UN estado del AFD mínimo (se elige un representante).</code></pre>
<p>Por qué arranca con {aceptantes}{no aceptantes}: la <b>cadena vacía ε</b> ya diferencia a cualquier aceptante de cualquier no-aceptante (uno acepta «ya», el otro no), así que esos dos nunca pueden estar juntos.</p>

<h3>Ejemplo trabajado: minimizar el AFD de 5 estados de (a|b)*abb</h3>
<p>Tomamos el AFD (A..E) que salió de la construcción de subconjuntos en 3.5:</p>
<pre><code>        a    b
→ A     B    C
  B     B    D
  C     B    C
  D     B    E
* E     B    C</code></pre>
<pre><code>Partición inicial:   {A, B, C, D} {E}
Ronda 1 (símbolo b): D va a E (otro grupo); A,B,C se quedan dentro.
                     → se parte:  {A, B, C} {D} {E}
Ronda 2 (símbolo b): B va a D (otro grupo); A,C van dentro de {A,B,C}.
                     → se parte:  {A, C} {B} {D} {E}
Ronda 3: {A,C} no se puede partir (con a ambos → B, con b ambos → C).
                     → ESTABLE:   {A, C} {B} {D} {E}</code></pre>
<p>Resultado: 4 estados. <b>A y C se fusionan</b> (eran los sospechosos que ya notamos en 3.5: tenían transiciones idénticas). El AFD mínimo coincide, estado por estado, con el que la construcción directa (3.7) había producido de una — que ya era mínimo.</p>

<h3>El caso borde: el estado muerto</h3>
<p>A veces la minimización deja un <b>estado muerto</b> (no aceptante, que se transfiere a sí mismo con todo símbolo). Técnicamente un AFD lo necesita, pero en un <b>analizador léxico</b> conviene <b>eliminarlo</b>: caer en él es la señal de «ya no hay ningún lexema más largo posible», que es cuando el léxico corta y aplica retroceso. Un léxico real omite el estado muerto y trata las transiciones faltantes como «terminá el reconocimiento».</p>

<div class="callout aho"><span class="lab">📘 la vuelta de tuerca para el léxico (no es de parcial)</span>
Cuando el AFD reconoce <b>varios tokens</b> (no solo acepta/rechaza), la partición inicial no es «aceptantes vs no aceptantes» sino más fina: se agrupan juntos los estados que reconocen <b>el mismo token</b>, y aparte los que no anuncian ninguno. Así la minimización nunca fusiona un estado que dice «esto es un <code>id</code>» con uno que dice «esto es un <code>numero</code>». Es el ajuste que hace Lex para no perder la información de qué patrón matcheó cada estado.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Dos estados son <b>equivalentes</b> si ninguna cadena los <b>diferencia</b> (ambos siempre aceptan o ambos siempre rechazan). Los equivalentes se fusionan.</li>
<li>El AFD mínimo es <b>único</b> para cada lenguaje regular.</li>
<li>Algoritmo: partición inicial <b>{aceptantes}{no aceptantes}</b>, y se <b>refina</b> separando estados que van a grupos distintos con algún símbolo, hasta estabilizar.</li>
<li>En un léxico con varios tokens, la partición inicial agrupa por <b>token reconocido</b>, y el <b>estado muerto</b> se suele eliminar.</li>
</ul>`,
    qa:[
      {q:"¿Cuándo son equivalentes dos estados de un AFD?",
       a:`<p>Dos estados son <b>equivalentes</b> cuando <b>no existe ninguna cadena que los distinga</b>: para toda entrada posible, arrancar desde uno u otro conduce al <b>mismo resultado</b> (ambos llevan a aceptación, o ambos a rechazo). Dicho al revés, una cadena <code>x</code> <b>diferencia</b> a <code>s</code> de <code>t</code> si al seguir <code>x</code> desde cada uno, <b>solo uno</b> de los dos termina en un estado de aceptación; si no hay ninguna cadena así, los estados son equivalentes y se pueden <b>fusionar</b>. La minimización agrupa todos los estados equivalentes y deja uno solo por grupo.</p>`},
      {q:"¿Cuál es la partición inicial del algoritmo de minimización y por qué se arranca de ahí?",
       a:`<p>Se arranca con <b>dos grupos</b>: los <b>estados de aceptación</b> (F) por un lado y los <b>de no aceptación</b> (S − F) por el otro. Se arranca así porque la <b>cadena vacía ε</b> ya <b>diferencia</b> a cualquier aceptante de cualquier no-aceptante: parada en un aceptante, la respuesta con ε es «sí»; parada en un no-aceptante, es «no». Como esos dos tipos de estado nunca pueden ser equivalentes, tiene sentido separarlos desde el vamos y después ir <b>refinando</b> cada grupo. En un analizador léxico con varios tokens, esta partición inicial se afina más: se agrupan los estados que reconocen el <b>mismo token</b>.</p>`},
      {q:"¿Qué significa que una cadena «diferencie» dos estados, con un ejemplo?",
       a:`<p>Una cadena <code>x</code> <b>diferencia</b> los estados <code>s</code> y <code>t</code> si, al procesarla desde cada uno, <b>exactamente uno</b> de los dos caminos termina en un estado de aceptación y el otro no. La existencia de <b>alguna</b> cadena diferenciadora prueba que los estados <b>no</b> son equivalentes. Ejemplo (AFD de <code>(a|b)*abb</code> con estados A..E): la cadena <code>bb</code> diferencia A de B, porque desde A la <code>bb</code> lleva a un estado de <b>no</b> aceptación (C), mientras que desde B lleva al estado de <b>aceptación</b> E. Por lo tanto A y B no pueden quedar en el mismo grupo.</p>`},
      {q:"Si el AFD reconoce varios tokens distintos (no solo acepta/rechaza), ¿cómo cambia la minimización?",
       a:`<p>Cambia la <b>partición inicial</b>. En vez de arrancar con solo dos grupos (aceptantes / no aceptantes), se arranca agrupando juntos <b>todos los estados que reconocen el mismo token</b> — un grupo para los que anuncian <code>id</code>, otro para los que anuncian <code>numero</code>, etc. — más un grupo con los estados que <b>no</b> anuncian ningún token. El resto del refinamiento es igual. Esto es imprescindible en un léxico: garantiza que la minimización <b>nunca fusione</b> un estado que reconoce un token con otro que reconoce un token distinto, porque se perdería la información de qué patrón matcheó. También se agrega y luego se elimina el estado muerto.</p>`}
    ]
  },
  {
    id:"3.9", titulo:"Lex/Flex: estructura del .l y resolución de conflictos", aho:"§3.5 · p.140", badges:["🎯"], estado:"dictada",
    html:`
<p>Volvemos al terreno del parcial 🎯. Ya sabés cómo se ve el autómata por dentro; ahora, cómo se lo <b>especifica</b> con la herramienta. <b>Lex</b> (o <b>Flex</b>, la versión moderna) es un <b>generador de analizadores léxicos</b>: le describís los tokens con expresiones regulares y él te <b>genera el código</b> del léxico. Es un metacompilador: un programa que produce un programa.</p>

<h3>El flujo de la herramienta</h3>
<pre><code>lex.l  --(Lex)--&gt;  lex.yy.c  --(compilador C)--&gt;  a.out
                                                    │
                            flujo de caracteres ---&gt; a.out ---&gt; secuencia de tokens</code></pre>
<p>Escribís <code>lex.l</code> en «lenguaje Lex». Lex lo transforma en un programa C (<code>lex.yy.c</code>) que <b>simula el autómata</b>. Ese C se compila y queda un léxico funcional. En la práctica se usa como <b>subrutina del analizador sintáctico</b>: es la función <code>yylex()</code> que el sintáctico llama para pedir el próximo token (¿te acordás?, el léxico <b>no</b> devuelve una lista, devuelve de a uno a pedido).</p>

<h3>Las tres secciones del .l</h3>
<p>Un programa Lex tiene <b>tres secciones separadas por <code>%%</code></b>:</p>
<pre><code>declaraciones
%%
reglas de traducción
%%
funciones auxiliares</code></pre>
<ul>
<li><b>Declaraciones:</b> variables, constantes (los nombres de tokens) y <b>definiciones regulares</b> (el bloque CONJUNTO de la cátedra). Lo que va entre <code>%{ ... %}</code> se copia tal cual al C generado (ahí van los <code>#include</code> y los <code>#define</code>).</li>
<li><b>Reglas de traducción:</b> pares <code>patrón { acción }</code>. El patrón es una ER (puede usar las definiciones); la acción es un fragmento de C (acá va la <b>acción léxica</b>: cotas, longitud, <code>return</code> del token).</li>
<li><b>Funciones auxiliares:</b> código C que usás en las acciones (por ejemplo <code>instalarID()</code>). Se copia tal cual.</li>
</ul>

<h3>El .l canónico de Aho (adaptado)</h3>
<pre><code>%{  /* constantes: LT, LE, EQ, NE, GT, GE, IF, THEN, ELSE, ID, NUMERO, OPREL */  %}

/* definiciones regulares  (= bloque CONJUNTO) */
delim   [ \\t\\n]
ws      {delim}+
letra   [A-Za-z]
digito  [0-9]
id      {letra}({letra}|{digito})*
numero  {digito}+(\\.{digito}+)?(E[+\\-]?{digito}+)?

%%

{ws}      { /* sin acción y sin retorno: se busca otro lexema */ }
if        { return(IF); }
then      { return(THEN); }
else      { return(ELSE); }
{id}      { yylval = (int) instalarID();  return(ID); }
{numero}  { yylval = (int) instalarNum(); return(NUMERO); }
"&lt;"       { yylval = LT; return(OPREL); }
"&lt;="      { yylval = LE; return(OPREL); }
"="       { yylval = EQ; return(OPREL); }
"&lt;&gt;"      { yylval = NE; return(OPREL); }
"&gt;"       { yylval = GT; return(OPREL); }
"&gt;="      { yylval = GE; return(OPREL); }

%%

int instalarID()  { /* mete el lexema (yytext, yyleng) en la tabla de símbolos
                       y devuelve un puntero a la entrada */ }
int instalarNum() { /* idem, pero en una tabla de constantes aparte */ }</code></pre>
<p>Dos variables que Lex te da gratis: <b>yytext</b> (puntero al comienzo del lexema, como <code>inicioLexema</code>) y <b>yyleng</b> (su longitud). El atributo del token viaja al sintáctico por la variable global <b>yylval</b>. (La <code>yy</code> es por Yacc, el generador de parsers que suele ir de la mano — lección de otro módulo.)</p>

<h3>Las dos reglas de resolución de conflictos (esto se toma)</h3>
<p>¿Qué pasa cuando un prefijo de la entrada casa con <b>varios</b> patrones? Lex decide con dos reglas, en este orden:</p>
<ul>
<li><b>1. Prefijo (lexema) más largo.</b> Se prefiere siempre la coincidencia más larga. Por eso <code>&lt;=</code> se toma como <b>un</b> lexema y no como <code>&lt;</code> seguido de <code>=</code>; y por eso se siguen comiendo letras y dígitos para formar el identificador más largo.</li>
<li><b>2. Ante igual longitud, gana el patrón listado primero.</b> Si dos patrones casan un prefijo del mismo largo, se elige el que aparece <b>antes</b> en el archivo.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 por qué las reservadas van ANTES que {id}</span>
Pregunta típica: en el <code>.l</code>, ¿por qué <code>if</code>, <code>then</code>, <code>else</code> se listan <b>antes</b> que <code>{id}</code>? Porque <code>if</code> casa <b>los dos</b> patrones (es palabra clave y también es un identificador válido), y con la <b>misma longitud</b>. La regla 2 dice: gana el <b>primero listado</b>. Si pusieras <code>{id}</code> arriba, <code>if</code> se reconocería como identificador y <b>nunca</b> saldría el token <code>IF</code>. Por eso las reservadas van primero. (La alternativa, ya vista en 3.1, es una sola regla <code>{id}</code> que consulte una tabla de reservadas en su acción.)</div>

<h3>El operador de preanálisis /</h3>
<p>A veces un patrón solo vale si <b>lo sigue</b> cierto contexto. El operador <code>/</code> de Lex sirve para eso: en <code>r1/r2</code>, se reconoce <code>r1</code> <b>solo si</b> viene seguido de <code>r2</code>, pero <code>r2</code> <b>no forma parte del lexema</b>. El ejemplo de Aho es Fortran, donde las palabras clave no son reservadas: <code>IF(I,J)=3</code> usa <code>IF</code> como arreglo, pero <code>IF(cond)THEN</code> lo usa como palabra clave. Con <code>IF / \\( .* \\) {letra}</code> se distingue el caso. Es material fino, pero muestra que el «mirar adelante» del léxico se puede especificar explícitamente.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Lex/Flex <b>genera</b> el léxico (<code>yylex()</code>) a partir de un <code>.l</code> con expresiones regulares.</li>
<li>Tres secciones separadas por <code>%%</code>: <b>declaraciones</b> (CONJUNTO), <b>reglas</b> (<code>patrón { acción }</code>) y <b>funciones auxiliares</b>.</li>
<li>🎯 Resolución de conflictos: (1) <b>lexema más largo</b>; (2) ante empate, <b>el patrón listado primero</b>. Por eso las reservadas van antes que <code>{id}</code>.</li>
<li><b>yytext</b> = el lexema, <b>yyleng</b> = su longitud, <b>yylval</b> = el atributo que viaja al sintáctico.</li>
</ul>`,
    qa:[
      {q:"En un .l, la regla de {id} viene antes que la de if. ¿Qué problema hay y cómo lo resuelve Flex?",
       a:`<p>El problema: <code>if</code> casa <b>dos</b> patrones a la vez —la palabra clave <code>if</code> y el patrón <code>{id}</code>— y con la <b>misma longitud</b>. Ante empate de longitud, Flex aplica su segunda regla: gana el patrón <b>listado primero</b>. Si <code>{id}</code> está antes, <code>if</code> se reconocería como <b>identificador</b> y el token <code>IF</code> <b>nunca</b> se emitiría. Se resuelve poniendo las <b>palabras reservadas antes</b> que <code>{id}</code> en el archivo (o, alternativamente, dejando una sola regla <code>{id}</code> que dentro de su acción consulte una <b>tabla de reservadas</b> y devuelva el token correspondiente). Es la contracara, del lado de la herramienta, de «la palabra reservada pasa por el estado de los identificadores».</p>`},
      {q:"¿Cuáles son las tres secciones de un archivo .l y qué va en cada una?",
       a:`<p>Van separadas por <code>%%</code>. <b>(1) Declaraciones:</b> variables, constantes (los nombres de token) y las <b>definiciones regulares</b> — el bloque CONJUNTO de la cátedra, tipo <code>digito [0-9]</code>. Lo encerrado entre <code>%{ ... %}</code> se copia tal cual al C generado (ahí van <code>#include</code> y <code>#define</code>). <b>(2) Reglas de traducción:</b> pares <code>patrón { acción }</code>, donde el patrón es una expresión regular y la acción es código C — ahí vive la <b>acción léxica</b> (validar cotas y longitud, y el <code>return</code> del token). <b>(3) Funciones auxiliares:</b> el código C de apoyo que usan las acciones (por ejemplo <code>instalarID()</code>), que también se copia tal cual.</p>`},
      {q:"¿Cuáles son las dos reglas con las que Lex resuelve conflictos cuando un prefijo casa varios patrones?",
       a:`<p><b>Regla 1 — lexema más largo:</b> ante varios prefijos posibles, Lex prefiere siempre el <b>más largo</b>. Por eso trata <code>&lt;=</code> como un único lexema (y no <code>&lt;</code> y <code>=</code> por separado), y sigue leyendo letras y dígitos para formar el identificador más largo. <b>Regla 2 — orden de listado:</b> si el prefijo más largo casa <b>dos o más patrones con la misma longitud</b>, gana el patrón que aparece <b>primero</b> en el programa Lex. La regla 1 desempata por longitud; la regla 2 desempata los empates de longitud por posición en el archivo. Juntas son las mismas reglas del «lexema más largo» y «primero listado» que se aplican al hacer el AL a mano.</p>`},
      {q:"¿Qué son yytext, yyleng y yylval, y para qué sirve el operador de preanálisis «/»?",
       a:`<p><b>yytext</b> es un puntero al <b>comienzo del lexema</b> reconocido (análogo a <code>inicioLexema</code>); <b>yyleng</b> es su <b>longitud</b>; <b>yylval</b> es la variable global por la que el léxico le pasa al sintáctico el <b>valor del atributo</b> del token (un código, o un puntero a la tabla de símbolos). El operador <b>/</b> (preanálisis) sirve para condicionar un patrón a su contexto derecho: en <code>r1/r2</code> se reconoce <code>r1</code> <b>solo si</b> viene seguido de <code>r2</code>, pero <code>r2</code> <b>no</b> forma parte del lexema. Aho lo ejemplifica con Fortran, donde <code>IF</code> es palabra clave solo en cierto contexto; <code>IF / \\( .* \\) {letra}</code> distingue ese caso del <code>IF</code> usado como arreglo.</p>`}
    ]
  },
  {
    id:"3.10", titulo:"Cómo Lex construye el analizador", aho:"§3.8 · p.166", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, no de parcial</b>, pero es la lección que <b>junta todo</b>: acá se ve el pipeline completo de Flex trabajando sobre varios patrones a la vez. Es donde encajan Thompson (3.4), subconjuntos (3.5), minimización (3.8), lexema más largo (3.2) y resolución de conflictos (3.9).</p>

<h3>El pipeline completo</h3>
<p>Lex toma tu <code>.l</code> con muchas reglas y hace, en orden:</p>
<ol>
<li>Convierte <b>cada patrón</b> en un AFN con la construcción de Thompson.</li>
<li><b>Combina todos los AFN en uno solo</b>: agrega un <b>nuevo estado inicial</b> con una transición <b>ε</b> hacia el inicial de cada patrón. Así, arrancar en ese estado equivale a «probar todos los patrones a la vez».</li>
<li>Convierte ese AFN combinado en un <b>AFD</b> (construcción de subconjuntos).</li>
<li><b>Minimiza</b> el AFD.</li>
</ol>

<h3>La clave: cada estado de aceptación recuerda su patrón</h3>
<p>Al combinar varios patrones, un estado de aceptación del AFN «se acuerda» de <b>qué regla</b> (qué patrón) le dio origen. Y si un estado del AFD contiene <b>varios</b> estados de aceptación de distintos patrones, se le asigna el patrón <b>listado primero</b> (regla 2 de Flex). Así, cuando la simulación acepta, sabe <b>qué acción</b> ejecutar.</p>

<h3>La simulación con lexema más largo</h3>
<p>Al correr, el autómata no para en el primer estado de aceptación que ve: sigue avanzando, y va <b>recordando el último estado de aceptación visitado</b> (y en qué posición de la entrada fue). Sigue hasta que <b>no hay próximo estado</b> (cae en el estado muerto). Ahí <b>retrocede</b> hasta el último estado de aceptación recordado, ese es el <b>lexema más largo</b>, y ejecuta su acción. La ausencia de transición es la señal de «acá se acabó lo reconocible».</p>

<h3>Ejemplo trabajado: los patrones a, abb, a*b+</h3>
<p>Aho usa tres reglas con conflictos a propósito:</p>
<pre><code>a       { acción A1 }
abb     { acción A2 }
a*b+    { acción A3 }</code></pre>
<p>Se arman los tres AFN, se combinan con un estado inicial 0 y tres ε, y se convierte a AFD. Estados del AFD (cada uno es un conjunto de estados del AFN) y qué token anuncia cada uno:</p>
<pre><code>ESTADO AFD   a       b      ANUNCIA
→ 0137       247     8      —
  247        7       58     a      (patrón 1)
  8          —       8      a*b+   (patrón 3)
  58         —       68     a*b+   (patrón 3)
  68         —       8      abb    (patrón 2)   ← ver abajo</code></pre>
<p>El estado <b>68</b> = {6,8} contiene <b>dos</b> aceptantes: el 6 (patrón <code>abb</code>) y el 8 (patrón <code>a*b+</code>). Como <code>abb</code> se listó <b>antes</b>, ese estado anuncia <code>abb</code>. Con la entrada <code>abba</code>, el AFD recorre 0137 → 247 → 58 → 68, y en la <code>a</code> final no hay transición: retrocede a 68, que acepta <code>abb</code>. El lexema reconocido es <code>abb</code> (la <code>a</code> sobrante queda para el próximo token).</p>

<h3>Dos detalles finos</h3>
<ul>
<li><b>Arquitectura AFN o AFD:</b> el léxico generado tiene un simulador de autómata <b>fijo</b> + una <b>tabla de transición</b> + las <b>acciones</b>. Se puede simular el AFN combinado (retrocediendo por la secuencia de conjuntos de estados hasta hallar uno con aceptante) o el AFD (más parecido a la salida real de Lex).</li>
<li><b>El operador de preanálisis <code>/</code></b> se implementa tratando el <code>/</code> como una transición ε: el final del lexema no es donde el autómata acepta, sino donde cruza ese ε imaginario.</li>
</ul>

<div class="callout aho"><span class="lab">📘 el módulo entero, en una imagen</span>
No es de parcial, pero si entendés esta lección entendés <b>qué hace Flex por dentro</b> de punta a punta: tu <code>.l</code> → un AFN por patrón (Thompson, 3.4) → un AFN combinado con ε → un AFD (subconjuntos, 3.5) → un AFD mínimo (3.8), que se simula con <b>lexema más largo</b> (3.2) y desempata por <b>orden de listado</b> (3.9). Todo lo 🎯 que sí se toma (por qué la reservada pasa por el estado del id, el lexema más largo, el estado final que «ya reconoció») son consecuencias visibles de esta maquinaria.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Lex <b>combina</b> los AFN de todos los patrones en uno solo (nuevo inicial + ε a cada uno), lo pasa a <b>AFD</b> y lo <b>minimiza</b>.</li>
<li>Cada <b>estado de aceptación recuerda qué patrón</b> lo generó; si hay varios, gana el <b>listado primero</b>.</li>
<li>La simulación aplica <b>lexema más largo</b>: sigue avanzando, recuerda el último estado de aceptación, y al caer en el estado muerto retrocede a él.</li>
<li>Es el pipeline completo: Thompson + subconjuntos + minimización + lexema más largo + resolución de conflictos.</li>
</ul>`,
    qa:[
      {q:"¿Cómo sabe el AFD generado por Lex qué acción ejecutar si varios patrones se combinaron en un solo autómata?",
       a:`<p>Cada <b>estado de aceptación</b> del autómata lleva marcada la <b>regla (patrón)</b> que lo originó. Cuando Lex combina todos los patrones en un solo AFN y luego lo pasa a AFD, un estado del AFD puede contener <b>varios</b> estados de aceptación de distintos patrones; en ese caso se le asigna el patrón <b>listado primero</b> en el <code>.l</code> (la regla 2 de resolución de conflictos). Al correr, la simulación reconoce el lexema más largo y mira el <b>último estado de aceptación</b> alcanzado: ejecuta la acción del patrón asociado a ese estado. Así, aunque físicamente haya un único autómata, cada aceptación «sabe» a qué regla pertenece.</p>`},
      {q:"¿Cómo combina Lex los autómatas de todos los patrones en uno solo?",
       a:`<p>Primero convierte <b>cada patrón</b> del <code>.l</code> en su propio AFN con la construcción de Thompson. Después crea un <b>nuevo estado inicial</b> y le agrega una transición <b>ε</b> hacia el estado inicial de <b>cada</b> uno de esos AFN. De ese modo, arrancar en el nuevo estado inicial equivale a «estar probando todos los patrones simultáneamente» (las ε meten al autómata en todos los sub-autómatas sin consumir símbolo). Ese AFN combinado se convierte luego a AFD (subconjuntos) y se minimiza. Es el mismo truco de la unión de Thompson, pero aplicado a nivel de todas las reglas del léxico.</p>`},
      {q:"¿Cómo implementa la simulación la regla del lexema más largo?",
       a:`<p>El autómata <b>no se detiene</b> en el primer estado de aceptación que encuentra. Sigue avanzando y consumiendo caracteres, pero va <b>recordando cuál fue el último estado de aceptación</b> que visitó y en qué posición de la entrada ocurrió. Continúa hasta que <b>no hay ningún estado siguiente</b> (cae en el estado muerto, que es la señal de que ya no puede reconocer un prefijo más largo). En ese momento <b>retrocede</b> el puntero hasta el último estado de aceptación recordado: ese es el <b>lexema más largo</b>, y se ejecuta la acción asociada. Los caracteres leídos de más (entre el último aceptante y el estado muerto) se devuelven a la entrada.</p>`},
      {q:"En el ejemplo con los patrones a, abb y a*b+, el estado {6,8} puede reconocer dos tokens. ¿Cuál gana y por qué?",
       a:`<p>El estado <b>{6,8}</b> contiene dos estados de aceptación del AFN: el 6, que pertenece al patrón <b>abb</b>, y el 8, que pertenece al patrón <b>a*b+</b>. Gana <b>abb</b>, porque en el programa Lex el patrón <code>abb</code> está <b>listado antes</b> que <code>a*b+</code>, y la regla de desempate ante igual longitud es «el patrón que aparece primero». Por eso, con la entrada <code>abba</code>, el AFD recorre 0137 → 247 → 58 → 68 y, al no poder avanzar con la <code>a</code> final, retrocede al estado 68 y reporta el token de <b>abb</b> (la <code>a</code> sobrante queda para el siguiente lexema).</p>`}
    ]
  }
]});
