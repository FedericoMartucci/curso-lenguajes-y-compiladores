/* =================== MÓDULO 6 =================== */
M.push({
  id:6, titulo:"Parsing ascendente y SLR", parcial:"I",
  resumen:"El tema estrella del Parcial I, en profundidad: reducir y podar mangos, el parser desplazamiento-reducción con su pila y sus 4 acciones, los conflictos, los ítems LR(0), la gramática aumentada, CLOSURE y GOTO, el autómata LR(0) y los prefijos viables, el algoritmo de la tabla ACCION/IR_A, la construcción SLR (por qué la reducción va en SIGUIENTE), y dos talleres completos sobre la gramática canónica de la cátedra hasta la lista de reglas.",
  lecciones:[
  {
    id:"6.1", titulo:"Reducciones, mango (handle) y poda de mangos", aho:"§4.5.1–4.5.2 · p.234", badges:["🎯"], estado:"dictada",
    html:`
<p>El <b>parsing ascendente (bottom-up)</b> hace el camino inverso al descendente: en vez de partir del símbolo distinguido y bajar hasta el programa, <b>arranca del programa</b> (las hojas) y va <b>subiendo</b> hasta la raíz. Sube <b>reduciendo</b>: cada vez que en la entrada aparece un grupo de símbolos que coincide con el <b>lado derecho</b> de una regla, lo reemplaza por el <b>no terminal del lado izquierdo</b>. Se llama <b>LR</b>: la <b>L</b> es porque lee el programa de i<b>z</b>quierda a derecha (Left), y la <b>R</b> es porque construye una derivación por la de<b>R</b>echa… pero <b>en reversa</b> (Right).</p>

<h3>La analogía de analizar una oración en el pizarrón</h3>
<p>Acordate de cuando en la primaria analizabas oraciones. Tenías «El perro corre rápido» y no empezabas por «esto es una oración»; empezabas <b>por las palabras</b>. Veías «El perro» y decías «esto es un <b>sujeto</b>». Veías «corre rápido» y decías «esto es un <b>predicado</b>». Y recién al final: «sujeto + predicado = <b>oración</b>». Eso <b>es</b> parsing ascendente: fuiste agrupando de abajo hacia arriba, reemplazando grupos de palabras por su categoría, hasta llegar al concepto más general. Cada uno de esos reemplazos («esto es un sujeto») es una <b>reducción</b>.</p>

<h3>La gramática con la que vamos a trabajar todo el módulo</h3>
<p>Es la <b>gramática canónica de la cátedra</b>. La vas a ver hasta en la sopa, memorizala (a la izquierda uso las letras cortas A, E, T, F; son lo mismo que ASIG, EXPRESION, TERMINO, FACTOR):</p>
<pre><code>1.  A → id := E
2.  E → E + T
3.  E → T
4.  T → T * F
5.  T → F
6.  F → id
7.  F → cte</code></pre>
<p>Programa de referencia: <code>id1 := id2 * cte1 + cte2</code>. Al terminar el parsing ascendente, la salida va a ser la <b>lista de reglas</b> <code>6 5 7 4 3 7 5 2 1</code> (y la 0 al aceptar). No te preocupes todavía por cómo sale esa lista; lo armamos entero en 6.9.</p>

<h3>Reducir es lo inverso de derivar</h3>
<p>Una <b>derivación</b> reemplaza un no terminal por el cuerpo de una de sus reglas (va «para adelante»: de A hacia el programa). Una <b>reducción</b> hace exactamente lo contrario: reemplaza el cuerpo de una regla por su no terminal (va «para atrás»: del programa hacia A). Por eso Aho dice que el parsing ascendente <b>construye una derivación por la derecha en forma inversa</b>: la secuencia de reducciones, leída al revés, es una derivación por la derecha del programa.</p>
<p>Veámoslo con un pedacito del programa, la subexpresión <code>id2 * cte1</code>. Las reducciones, en orden, son:</p>
<pre><code>id2 * cte1     --(F → id, regla 6)-->     F * cte1
F * cte1       --(T → F, regla 5)-->      T * cte1
T * cte1       --(F → cte, regla 7)-->    T * F
T * F          --(T → T * F, regla 4)-->  T</code></pre>

<h3>El mango (handle): la subcadena que SÍ se puede reducir</h3>
<p>Acá está la sutileza que la cátedra y Aho remarcan. Un <b>mango (handle)</b> no es «cualquier subcadena que coincida con el lado derecho de una regla». Un mango es la subcadena que coincide con un lado derecho <b>y</b> cuya reducción es un paso <b>legítimo</b> de la derivación por la derecha en reversa. Dicho fácil: es el grupo que te toca reducir <b>en este preciso momento</b> para no romper el análisis.</p>
<p>El ejemplo de Aho es preciso: en la forma <code>T * id2</code>, la <code>T</code> del principio coincide con el cuerpo de la regla <code>E → T</code>. ¿La reducimos? <b>No.</b> Si reemplazaras esa <code>T</code> por <code>E</code> quedaría <code>E * id2</code>, y esa cadena <b>no se puede derivar</b> desde el símbolo distinguido con esta gramática. O sea: <code>T</code> coincide con un lado derecho, pero <b>no es un mango</b> ahí. El mango en <code>T * id2</code> es el <code>id2</code> (que se reduce con <code>F → id</code>). <b>Coincidir con un lado derecho es necesario, pero no alcanza.</b></p>

<h3>Podar mangos</h3>
<p><b>Podar mangos (handle pruning)</b> es el proceso completo: localizás el mango, lo reducís, localizás el siguiente mango en la cadena que quedó, lo reducís, y así hasta que la cadena entera se convierte en el <b>símbolo distinguido</b>. Ahí anunciás que el análisis terminó con éxito. Todo el desafío del parsing ascendente es uno solo: <b>saber cuál es el mango en cada paso</b>. Las lecciones 6.4 a 6.7 son, en el fondo, la maquinaria para encontrar el mango automáticamente.</p>

<h3>El caso borde: gramáticas ambiguas</h3>
<p>Aho es cuidadoso y dice «<b>un</b> mango», no «<b>el</b> mango». ¿Por qué? Porque si la gramática es <b>ambigua</b>, una misma forma puede tener <b>más de una</b> derivación por la derecha, y entonces más de un mango posible: el parser no sabría cuál reducir. Si la gramática <b>no</b> es ambigua, cada forma sentencial derecha tiene <b>exactamente un</b> mango, y ahí el método funciona sin dudar. Por eso el parsing ascendente <b>exige gramática no ambigua</b> (lo formalizamos como «conflictos» en 6.3).</p>

<div class="callout tgt"><span class="lab">🎯 qué devuelve el parser ascendente</span>
No devuelve un árbol: devuelve una <b>lista de reglas</b> (los números de las producciones usadas en las reducciones, en orden). Esa lista, leída al revés, <b>es</b> una derivación por la derecha, y por eso «contiene» el árbol sin construirlo. Cuando en el parcial te pregunten «¿qué produce el analizador sintáctico?», la respuesta es <b>la lista de reglas</b>. Y recordá el significado de LR: <b>L</b>ee de izquierda a derecha, arma la derivación por la de<b>R</b>echa en reversa.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Ascendente = bottom-up = LR</b>: del programa al start, <b>reduciendo</b> (reemplazar un lado derecho por su no terminal).</li>
<li>La secuencia de reducciones, al revés, es una <b>derivación por la derecha</b>.</li>
<li>Un <b>mango</b> coincide con un lado derecho <b>y</b> reducirlo es un paso válido de esa derivación inversa. Coincidir con un lado derecho <b>no alcanza</b> (la <code>T</code> en <code>T * id</code> no es mango).</li>
<li><b>Podar mangos</b> = reducir mango tras mango hasta llegar al símbolo distinguido. Si la gramática no es ambigua, hay <b>un solo</b> mango por paso.</li>
</ul>`,
    qa:[
      {q:"¿Qué es un mango (handle) y por qué no basta con «coincidir con el lado derecho de una regla»?",
       a:`<p>Un <b>mango</b> es la subcadena que hay que <b>reducir en ese paso</b>: coincide con el lado derecho de una producción <b>y</b> su reducción reconstruye un paso de una derivación por la derecha en reversa. No basta con coincidir con un lado derecho porque puede haber coincidencias que, si las reducís, te dejan en una cadena <b>imposible de derivar</b> desde el símbolo distinguido. El ejemplo de Aho: en <code>T * id</code>, la <code>T</code> coincide con el cuerpo de <code>E → T</code>, pero <b>no es un mango</b>, porque reducirla daría <code>E * id</code>, que no deriva de la gramática. El mango ahí es el <code>id</code> (regla <code>F → id</code>). Por eso «coincidir» es necesario pero no suficiente.</p>`},
      {q:"¿Qué significa «podar mangos» y con qué termina el proceso?",
       a:`<p><b>Podar mangos</b> es el ciclo del parsing ascendente: localizar el mango en la cadena actual, <b>reducirlo</b> (reemplazarlo por el no terminal de su regla), y repetir sobre la cadena resultante. Termina cuando la cadena se redujo por completo al <b>símbolo distinguido</b> (el start): en ese momento se anuncia que el análisis se completó con éxito. La lista de reducciones aplicadas, leída al revés, es una derivación por la derecha del programa de entrada.</p>`},
      {q:"¿Por qué se dice que el análisis ascendente construye «una derivación por la derecha en reversa»?",
       a:`<p>Porque <b>reducir</b> es la operación inversa de <b>derivar</b>. Una derivación por la derecha parte del símbolo distinguido y, en cada paso, expande el no terminal <b>más a la derecha</b> hasta llegar al programa. El parser ascendente hace justo lo contrario: parte del programa y va <b>reduciendo</b>, deshaciendo esos pasos <b>en orden inverso</b>. Por eso la lista de reglas que emite, si la leés de atrás para adelante, es exactamente una derivación por la derecha. Y de ahí sale la sigla <b>LR</b>: Left-to-right en la lectura, Rightmost derivation en reversa.</p>`},
      {q:"Reducí a mano <code>id * cte</code> con la gramática canónica y anotá las reglas usadas.",
       a:`<p>Paso a paso: <code>id</code> se reduce con <b>F → id</b> (regla 6) → queda <code>F * cte</code>; <code>F</code> se reduce con <b>T → F</b> (regla 5) → <code>T * cte</code>; <code>cte</code> se reduce con <b>F → cte</b> (regla 7) → <code>T * F</code>; y <code>T * F</code> se reduce con <b>T → T * F</b> (regla 4) → <code>T</code>. La lista de reglas de este fragmento es <b>6 5 7 4</b>, que son justamente las cuatro primeras del programa completo <code>id1 := id2 * cte1 + cte2</code>.</p>`}
    ]
  },
  {
    id:"6.2", titulo:"El parser desplazamiento-reducción: la pila y las 4 acciones", aho:"§4.5.3 · p.236", badges:["🎯"], estado:"dictada",
    html:`
<p>Ya sabemos <b>qué</b> hace el parsing ascendente (podar mangos). Ahora, <b>cómo</b> lo implementa. La forma estándar se llama <b>análisis de desplazamiento-reducción (shift-reduce)</b> y usa dos estructuras: una <b>pila</b> (donde se van juntando los símbolos ya leídos) y un <b>búfer de entrada</b> (el resto del programa por leer). Se usa el símbolo <code>$</code> para marcar <b>el fondo de la pila</b> y también <b>el final de la entrada</b>.</p>

<h3>La analogía de la mesa de armado</h3>
<p>Imaginá que tenés una <b>cinta</b> con piezas que vienen de a una (la entrada) y una <b>mesita</b> a tu lado donde vas apoyando piezas (la pila). Tu regla de trabajo es simple: vas <b>corriendo piezas de la cinta a la mesita</b> (eso es <b>desplazar</b>) hasta que las últimas que apoyaste forman un grupo reconocible; ahí las <b>cambiás por su etiqueta</b> (eso es <b>reducir</b>). Seguís así hasta que en la mesita queda una sola cosa: el producto terminado. Lo lindo es que <b>el grupo a reducir siempre queda arriba de todo en la mesita</b>, nunca enterrado; por eso una simple pila alcanza.</p>

<h3>Las cuatro acciones (esto se toma)</h3>
<ul>
<li><b>Desplazar (shift):</b> tomar el próximo token de la entrada y <b>meterlo en la pila</b>. En la notación de la cátedra se escribe <code>D</code> seguido de un número de estado (<code>D7</code>, <code>D10</code>); «se consume el token de entrada y se pasa al estado indicado».</li>
<li><b>Reducir (reduce):</b> cuando arriba de la pila hay un <b>mango</b> (el lado derecho de una regla), se lo <b>saca</b> y se mete en su lugar el no terminal del lado izquierdo. Se escribe <code>R</code> seguido del número de regla (<code>R4</code>, <code>R6</code>).</li>
<li><b>Aceptar:</b> la pila quedó con el símbolo distinguido y la entrada está en <code>$</code>. Se anuncia «compilación/análisis exitoso».</li>
<li><b>Error:</b> no hay ninguna acción válida para la combinación actual. Se llama a la rutina de recuperación de errores.</li>
</ul>
<p>En una frase: <b>desplazá hasta reconocer un mango, entonces reducí; repetí hasta aceptar</b>.</p>

<h3>Una traza completa (todavía sin estados)</h3>
<p>Para ver el mecanismo puro, sigamos la subexpresión <code>id * cte</code> como si el símbolo distinguido fuera <code>E</code>. La parte superior de la pila se dibuja a la <b>derecha</b> (convención de Aho para ascendente):</p>
<pre><code>PILA        ENTRADA        ACCIÓN
$           id * cte $     desplazar
$ id        * cte $        reducir  F → id   (6)
$ F         * cte $        reducir  T → F    (5)
$ T         * cte $        desplazar
$ T *       cte $          desplazar
$ T * cte   $              reducir  F → cte  (7)
$ T * F     $              reducir  T → T * F (4)
$ T         $              reducir  E → T    (3)
$ E         $              aceptar</code></pre>
<p>Fijate el patrón: se desplaza <code>id</code>, pero <b>no</b> se lo deja como <code>id</code>: apenas está arriba de la pila y no se puede seguir armando nada más largo, se reduce. Y cuando aparece <code>T</code> arriba con un <code>*</code> por venir, el parser <b>no</b> reduce <code>T</code> a <code>E</code> todavía (sabe que viene un <code>*</code> y que <code>T * F</code> es un mango más grande): desplaza el <code>*</code>. Esa decisión «¿reduzco ahora o sigo desplazando?» es la que resuelve la <b>tabla</b> (6.6).</p>

<h3>Por qué una pila alcanza: el mango siempre está arriba</h3>
<p>Aho lo demuestra mirando dos pasos seguidos de una derivación por la derecha: pase lo que pase, después de una reducción el parser solo tiene que <b>desplazar cero o más símbolos</b> para volver a poner el próximo mango <b>arriba de todo</b>. <b>Nunca</b> tiene que ir a buscar el mango <i>adentro</i> de la pila. Ese es el hecho que justifica usar una estructura tan simple como una pila: el mango es siempre lo último que entró y que forma un grupo.</p>

<div class="callout tgt"><span class="lab">🎯 las 4 acciones, palabra por palabra</span>
<b>Desplazar</b> (mover un token de la entrada a la pila), <b>reducir</b> (cambiar un mango del tope por su no terminal), <b>aceptar</b> (pila = start, entrada = <code>$</code>) y <b>error</b> (no hay acción). La entrada es una <b>lista de tokens</b> (viene del léxico) y la salida es la <b>lista de reglas</b> de las reducciones. Ojo con un detalle de la cátedra: el analizador léxico <b>no</b> mandó blancos ni saltos de línea (los descartó con su loop al estado 0), así que la pila nunca ve espacios.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El shift-reduce usa una <b>pila</b> + <b>entrada</b>; <code>$</code> marca fondo de pila y fin de entrada.</li>
<li>Cuatro acciones: <b>desplazar</b> (<code>D n</code>), <b>reducir</b> (<code>R n</code>), <b>aceptar</b>, <b>error</b>.</li>
<li>Estrategia: desplazar hasta que el tope sea un mango, entonces reducir; repetir hasta aceptar.</li>
<li>El <b>mango siempre aparece arriba de la pila</b>, nunca adentro: por eso una pila alcanza.</li>
</ul>`,
    qa:[
      {q:"Nombrá las cuatro acciones de un parser de desplazamiento-reducción y decí qué hace cada una.",
       a:`<p><b>Desplazar (shift):</b> mueve el próximo token de la entrada a la pila (notación <code>D n</code>: consume el token y pasa al estado n). <b>Reducir (reduce):</b> cuando el tope de la pila es un mango (un lado derecho), lo reemplaza por el no terminal del lado izquierdo (notación <code>R n</code>, por número de regla). <b>Aceptar:</b> la pila contiene el símbolo distinguido y la entrada está en <code>$</code>, así que anuncia éxito. <b>Error:</b> no existe acción válida para el estado y el token actuales, y se dispara la recuperación de errores.</p>`},
      {q:"¿Por qué al análisis de desplazamiento-reducción le alcanza con una pila (y no necesita buscar el mango en el medio)?",
       a:`<p>Porque, por la forma en que se encadenan los pasos de una derivación por la derecha, <b>el mango siempre termina apareciendo en la parte superior de la pila</b>, nunca enterrado. Aho lo prueba analizando los dos casos posibles de dos reducciones sucesivas: tras cada reducción, al parser solo le hace falta <b>desplazar cero o más símbolos</b> para dejar el próximo mango arriba de todo. Como nunca hay que hurgar dentro de la pila, una pila (LIFO) es exactamente la estructura correcta.</p>`},
      {q:"En la entrada <code>T</code> con un <code>*</code> por venir, ¿por qué el parser NO reduce <code>T</code> a <code>E</code> enseguida?",
       a:`<p>Porque reducir ahí sería un error: <code>T</code> por sí sola no es el mango cuando lo que sigue es <code>*</code>. La gramática dice que <code>T</code> puede crecer con <code>T → T * F</code>, así que el mango correcto es más grande (<code>T * F</code>). El parser entonces <b>desplaza</b> el <code>*</code> y sigue armando, en vez de reducir prematuramente. Esta es la decisión clave «desplazar vs reducir» que el autómata y la tabla LR resuelven mirando el estado del tope de la pila y el próximo token.</p>`},
      {q:"¿Qué recibe como entrada y qué produce como salida un parser shift-reduce?",
       a:`<p><b>Entrada:</b> la <b>lista de tokens</b> que le va pidiendo al analizador léxico (sin blancos ni comentarios, que el léxico ya descartó). <b>Salida:</b> la <b>lista de reglas</b> aplicadas en las reducciones, en orden. Esa lista es lo que representa —de forma abstracta— el árbol de parsing; no se construye un árbol físico. Internamente el parser se apoya en una pila y en la tabla LR para decidir, en cada paso, si desplaza, reduce, acepta o marca error.</p>`}
    ]
  },
  {
    id:"6.3", titulo:"Conflictos desplazamiento-reducción y reducción-reducción", aho:"§4.5.4 · p.238", badges:["🎯"], estado:"dictada",
    html:`
<p>Hay gramáticas para las que el método shift-reduce <b>no funciona</b>: en algún momento el parser, aun conociendo <b>todo</b> el contenido de la pila y el <b>próximo token</b>, <b>no puede decidir</b> qué hacer. A esa situación se la llama <b>conflicto</b>, y hay dos tipos.</p>

<h3>La analogía de la bifurcación con el mapa incompleto</h3>
<p>Venís manejando y llegás a una <b>Y</b> en el camino. Tu GPS (la pila más el próximo token) debería decirte «izquierda» o «derecha», pero se queda mudo: con la información que tiene, <b>las dos opciones parecen válidas</b>. Eso es un conflicto. No es que el camino no exista; es que <b>este</b> método de decisión no tiene suficiente info para elegir. Y si te quedás trabado en la bifurcación, no podés seguir viaje.</p>

<h3>Conflicto desplazamiento-reducción (shift-reduce)</h3>
<p>En una misma celda de la tabla, el parser <b>podría desplazar o podría reducir</b>, y ambas parecen legítimas. El caso emblemático es el <b>else colgante</b>. Con la gramática de condicionales, si la pila tiene <code>if expr then instr</code> y el próximo token es <code>else</code>, el parser no sabe si:</p>
<ul>
<li><b>reducir</b> <code>if expr then instr</code> a una instrucción (cerrar el if corto), o</li>
<li><b>desplazar</b> el <code>else</code> para seguir armando <code>if expr then instr else instr</code>.</li>
</ul>
<p>Las dos son gramaticalmente posibles: por eso hay conflicto. (Cómo se lo resuelve en la práctica lo vemos en 7.3.)</p>

<h3>Conflicto reducción-reducción (reduce-reduce)</h3>
<p>Acá el parser <b>sabe</b> que tiene un mango arriba de la pila, pero <b>no sabe con cuál de dos reglas reducirlo</b>. El ejemplo de Aho: un lenguaje donde tanto las <b>llamadas a procedimientos</b> como las <b>referencias a arreglos</b> se escriben igual, <code>p(i,j)</code>, y el léxico devuelve <code>id</code> para todos los nombres. Con la pila <code>… id ( id</code> y un <code>,</code> por venir, ese <code>id</code> del tope hay que reducirlo… ¿por <code>parametro → id</code> (si <code>p</code> es procedimiento) o por <code>expr → id</code> (si <code>p</code> es arreglo)? La pila no lo dice. Dos reducciones posibles en la misma celda: conflicto reduce-reduce.</p>

<h3>Qué significa un conflicto (y qué hacer en el parcial)</h3>
<p>Un conflicto quiere decir que <b>la gramática no es SLR</b>. Muy seguido la causa de fondo es que <b>la gramática es ambigua</b> (y ninguna gramática ambigua es LR). Pero atención al matiz fino: hay gramáticas <b>no ambiguas</b> que <b>igual</b> generan conflictos en SLR porque el método es «corto de vista» (no recuerda suficiente contexto); esas se arreglan con métodos más potentes como LR(1)/LALR (módulo 7).</p>

<div class="callout tgt"><span class="lab">🎯 hay que declararlo explícitamente</span>
En el parcial, si al armar la tabla te queda una celda con <b>una D y una R</b> (shift-reduce) o con <b>dos R</b> (reduce-reduce), <b>no lo dejes pasar en silencio</b>: escribí «celda [estado, símbolo] tiene un conflicto desplazamiento-reducción, por lo tanto la gramática <b>no es SLR</b> (es ambigua)». Perdés puntos si la tabla está bien pero no marcás el conflicto. Un caso típico que dan: <code>E → E : E | E + E | id | ( E )</code> es ambigua → conflicto asegurado.</div>

<h3>El caso borde: no ambigua pero tampoco SLR</h3>
<p>Aho da la gramática <code>S → L = R | R</code>, <code>L → * R | id</code>, <code>R → L</code> (l-values y r-values). <b>No es ambigua</b>, pero el estado que reconoce <code>L</code> tiene a la vez «desplazar <code>=</code>» y «reducir <code>R → L</code>», porque <code>=</code> está en SIGUIENTE(R). SLR se confunde. No es que la gramática esté mal: es que SLR no alcanza. Es la mejor motivación para LR(1)/LALR (7.1–7.2), que sí la resuelven.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Un <b>conflicto</b> es cuando el parser, con la pila y un token de anticipación, <b>no puede decidir</b>.</li>
<li><b>Desplazamiento-reducción</b>: una celda admite <b>D y R</b> (ejemplo: else colgante).</li>
<li><b>Reducción-reducción</b>: una celda admite <b>dos R</b> (ejemplo: <code>id(id,id)</code> proc vs arreglo).</li>
<li>Conflicto ⇒ la gramática <b>no es SLR</b> (a menudo por ambigüedad). En el parcial, <b>declararlo explícitamente</b>.</li>
</ul>`,
    qa:[
      {q:"¿Qué es un conflicto en un parser shift-reduce y qué dos tipos hay?",
       a:`<p>Un <b>conflicto</b> ocurre cuando el parser, conociendo todo el contenido de la pila y el próximo símbolo de entrada, <b>no puede decidir</b> su próximo movimiento. Hay dos tipos: <b>desplazamiento-reducción</b> (en la misma celda podría desplazar o reducir; el <b>else colgante</b> es el caso clásico) y <b>reducción-reducción</b> (hay un mango, pero podría reducirse por <b>dos reglas distintas</b>; el caso de <code>id(id,id)</code> que puede ser llamada a procedimiento o referencia a arreglo). Cualquiera de los dos indica que la gramática <b>no es SLR</b>.</p>`},
      {q:"En el parcial aparece una celda con una D y una R. ¿Qué tenés que escribir?",
       a:`<p>Que esa celda tiene un <b>conflicto desplazamiento-reducción</b> y que, por lo tanto, la <b>gramática no es SLR</b> (habitualmente porque es <b>ambigua</b>). Hay que <b>declararlo de forma explícita</b>, indicando el estado y el símbolo donde aparece; no alcanza con dejar la tabla dibujada. La cátedra evalúa que <b>reconozcas</b> el conflicto y digas qué implica sobre la gramática, no solo que llenes la tabla.</p>`},
      {q:"¿Es cierto que todo conflicto se debe a que la gramática es ambigua?",
       a:`<p>No del todo. Es cierto que <b>ninguna gramática ambigua es LR</b>, así que una gramática ambigua <b>siempre</b> produce conflictos. Pero al revés no vale: hay gramáticas <b>no ambiguas</b> que <b>igual</b> dan conflictos en SLR, porque el método SLR es limitado (decide las reducciones mirando SIGUIENTE, que a veces es demasiado grosero). El ejemplo de Aho es <code>S → L = R | R</code>, <code>L → *R | id</code>, <code>R → L</code>: no es ambigua, pero no es SLR. Esas gramáticas se pueden analizar con métodos más potentes (LR(1) o LALR).</p>`},
      {q:"Explicá el conflicto reduce-reduce del ejemplo <code>id(id,id)</code> de Aho.",
       a:`<p>Si el lenguaje escribe igual las llamadas a procedimiento y las referencias a arreglos, y el léxico devuelve <code>id</code> para todos los nombres, entonces con la pila <code>… id ( id</code> y un <code>,</code> a la vista, el <code>id</code> del tope <b>hay que reducirlo</b>, pero no se sabe con cuál regla: <code>parametro → id</code> (si el primer nombre es un procedimiento) o <code>expr → id</code> (si es un arreglo). Ambas reducciones caen en la misma celda: es un <b>conflicto reducción-reducción</b>. Aho lo resuelve haciendo que el léxico consulte la tabla de símbolos y devuelva un token distinto (<code>procid</code>) para los procedimientos, pero eso ya escapa a lo que puede hacer una gramática SLR pura.</p>`}
    ]
  },
  {
    id:"6.4", titulo:"Ítems LR(0), gramática aumentada, CLOSURE y GOTO", aho:"§4.6.2 · p.242", badges:["🎯"], estado:"dictada",
    html:`
<p>Toda la lección anterior dejó una pregunta abierta: ¿<b>cómo</b> sabe el parser, en cada paso, si desplazar o reducir (o sea, dónde está el mango)? La respuesta de Aho: el parser mantiene <b>estados</b> que resumen «en qué punto del análisis estoy». Y para armar esos estados hace falta una herramienta nueva: los <b>ítems</b>.</p>

<h3>El ítem LR(0): un punto que marca el grado de avance</h3>
<p>Un <b>ítem LR(0)</b> es una regla de la gramática con un <b>punto</b> (·) metido en alguna posición del lado derecho. El punto marca <b>cuánto llevás reconocido</b> de esa regla. Por ejemplo, la regla <code>A → id := E</code> genera estos ítems:</p>
<pre><code>A → · id := E      (todavía no reconocí nada; espero ver id := E)
A → id · := E      (ya vi id; espero := E)
A → id := · E      (ya vi id :=; espero E)
A → id := E ·      (ya vi todo el cuerpo; es hora de reducir por esta regla)</code></pre>

<h3>La analogía del bookmark en la receta</h3>
<p>Pensá cada regla como una <b>receta</b> y el punto como el <b>señalador (bookmark)</b> que marca hasta dónde llegaste. <code>A → id · := E</code> es «ya puse el <code>id</code>, me falta <code>:= E</code>». Cuando el señalador llega <b>al final</b> (<code>A → id := E ·</code>), la receta está <b>completa</b>: ese ítem te dice «ya tenés el mango, reducí». Un <b>estado</b> del parser va a ser un <b>conjunto de ítems</b>: todas las recetas en las que podrías estar avanzando <b>a la vez</b>, con sus señaladores.</p>

<h3>La gramática aumentada: por qué se agrega S' → S</h3>
<p>Antes de armar nada, se <b>aumenta</b> la gramática: se inventa un símbolo distinguido nuevo, <code>A'</code>, con <b>una sola</b> regla, la <b>regla 0</b>:</p>
<pre><code>0.  A' → A
1.  A  → id := E
2.  E  → E + T
3.  E  → T
4.  T  → T * F
5.  T  → F
6.  F  → id
7.  F  → cte</code></pre>
<p>¿<b>Por qué</b> se hace esto? Porque el algoritmo pone un punto delante de <b>toda</b> la gramática (el estado 0 arranca con <code>A' → · A</code>), y necesita un <b>criterio limpio de fin</b>. Con una única regla del start, cuando el punto llega al final de esa regla 0 (<code>A' → A ·</code>) y además viene el <code>$</code>, el parser sabe <b>con certeza</b> que reconoció todo el programa y que puede <b>aceptar</b>. Sin aumentar, el símbolo distinguido podría aparecer en varias reglas y no habría un único punto donde decir «terminé». En resumen: la gramática aumentada garantiza <b>un único estado de aceptación</b>.</p>

<h3>CLOSURE (cerradura): cuando el punto queda antes de un no terminal</h3>
<p><b>CLOSURE(I)</b> completa un conjunto de ítems con esta regla: si un ítem tiene el punto <b>justo antes de un no terminal</b> <code>B</code> (o sea <code>A → α · B β</code>), entonces hay que agregar los ítems <code>B → · γ</code> de <b>todas</b> las reglas de <code>B</code>, con el punto al principio. Y se repite: si esos ítems nuevos también tienen un no terminal después del punto, se expanden también.</p>
<p>Siguiendo la analogía: si tu señalador quedó justo antes de «hacé un postre» (un no terminal), y todavía no empezaste ningún postre, tenés que <b>poner sobre la mesa todas las recetas de postre posibles</b>, porque cualquiera de ellas podría ser la que se está por armar. Ejemplo, el <b>estado 0</b>:</p>
<pre><code>Arranco con:  A' → · A
El punto está antes de A (no terminal) → agrego las reglas de A:
              A  → · id := E
El punto de A → · id := E queda antes de id (terminal): no se expande más.
ESTADO 0 = { A' → · A ,  A → · id := E }</code></pre>
<p>Un estado más jugoso es el que sale después de leer <code>id :=</code> (lo llamaremos estado 3):</p>
<pre><code>Arranco con:  A → id := · E
El punto está antes de E → agrego reglas de E:  E → · E + T ,  E → · T
Ahora hay puntos antes de E y de T → agrego reglas de T:  T → · T * F ,  T → · F
Ahora hay puntos antes de T y de F → agrego reglas de F:  F → · id ,  F → · cte
ESTADO 3 = { A → id := · E , E → · E+T , E → · T , T → · T*F , T → · F , F → · id , F → · cte }</code></pre>

<h3>GOTO: avanzar el punto sobre un símbolo</h3>
<p><b>GOTO(I, X)</b> es «desde el conjunto de ítems <code>I</code>, ¿a qué estado voy si leo el símbolo <code>X</code>?». Se toman todos los ítems de <code>I</code> que tengan el punto <b>justo antes de X</b>, se <b>corre el punto</b> al otro lado de <code>X</code>, y al conjunto resultante se le hace CLOSURE. Es, literalmente, avanzar el señalador un casillero. Ejemplo desde el estado 0:</p>
<pre><code>GOTO(0, id): en el estado 0, el ítem A → · id := E tiene el punto antes de id.
Corro el punto:  A → id · := E.  (no hay no terminal después del punto, no cierro nada)
Ese es el ESTADO 2 = { A → id · := E }.</code></pre>

<div class="callout tgt"><span class="lab">🎯 la pregunta de parcial: ¿por qué se aumenta la gramática?</span>
Respuesta esperada, casi textual del apunte: en el parsing ascendente vamos del programa al start mirando el lado derecho de las reglas; el método pone un punto <b>delante de toda la gramática</b> y necesita saber cuándo terminó. Al crear un <b>único</b> símbolo distinguido con <b>una sola regla</b> (<code>A' → A</code>), se garantiza que hay <b>un único estado de aceptación</b>: cuando el punto llega al final de esa regla (<code>A' → A ·</code>) y se consume <code>$</code>, se sabe que el parseo terminó bien.</div>

<div class="callout aho"><span class="lab">📘 «SLR o LR(0)»: la cátedra los usa como sinónimos, pero…</span>
Los <b>ítems</b> y el <b>autómata</b> que estamos armando son <b>LR(0)</b> (el 0 es «cero símbolos de anticipación»: los ítems no llevan lookahead). La <b>tabla SLR</b> que armaremos en 6.7 usa esos mismos estados LR(0) pero decide las reducciones con SIGUIENTE. Por eso la cátedra dice «SLR o LR(0)» como si fueran lo mismo, y para el parcial lo son; pero técnicamente <b>los ítems son LR(0)</b> y <b>la tabla es SLR</b>. Tenerlo claro te salva en las preguntas finas.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Un <b>ítem LR(0)</b> es una regla con un <b>punto</b> que marca el grado de avance (<code>A → id · := E</code>).</li>
<li>La <b>gramática aumentada</b> agrega <code>A' → A</code> (regla 0) para tener <b>un único estado de aceptación</b>: cuando <code>A' → A ·</code> se completa con <code>$</code>, se acepta.</li>
<li><b>CLOSURE</b>: si el punto está antes de un no terminal <code>B</code>, se agregan todos los <code>B → · γ</code> (y se repite).</li>
<li><b>GOTO(I, X)</b>: correr el punto sobre <code>X</code> en los ítems de <code>I</code> y cerrar; define las transiciones del autómata.</li>
</ul>`,
    qa:[
      {q:"¿Por qué se aumenta la gramática antes de construir el autómata LR?",
       a:`<p>Para tener un <b>único</b> símbolo distinguido con una <b>única regla</b> (<code>A' → A</code>, la regla 0) y, con eso, un <b>único estado de aceptación</b>. El algoritmo arranca poniendo el punto delante de toda la gramática (<code>A' → · A</code>); cuando ese punto llega al final (<code>A' → A ·</code>) y se consume el <code>$</code>, el parser sabe con certeza que reconoció el programa entero y acepta. Sin aumentar, el start symbol podría aparecer en varias reglas y no habría un criterio limpio y único de «terminó bien».</p>`},
      {q:"¿Qué hace CLOSURE y por qué es necesaria?",
       a:`<p>Si en un conjunto de ítems hay uno con el punto <b>justo antes de un no terminal</b> <code>B</code> (<code>A → α · B β</code>), CLOSURE agrega los ítems <code>B → · γ</code> de <b>todas</b> las reglas de <code>B</code> (con el punto al principio), y repite el proceso con los que aparezcan. Es necesaria porque, para reconocer <code>B</code>, el parser tiene que estar preparado para empezar <b>cualquiera</b> de las producciones de <code>B</code>; el estado representa todas esas posibilidades a la vez. Sin la cerradura, el estado no «sabría» por dónde puede empezar el no terminal esperado.</p>`},
      {q:"¿Qué representa el punto en un ítem, y qué significa que el punto esté al final del cuerpo?",
       a:`<p>El punto marca el <b>grado de avance</b> en el reconocimiento de esa regla: lo que está a la <b>izquierda</b> del punto ya se reconoció, y lo que está a la <b>derecha</b> es lo que el parser <b>espera ver</b>. Por ejemplo, <code>A → id · := E</code> significa «ya vi <code>id</code>, espero <code>:= E</code>». Cuando el punto llega <b>al final del cuerpo</b> (<code>A → id := E ·</code>), quiere decir que se reconoció el cuerpo completo: hay un <b>mango</b> arriba de la pila y probablemente sea hora de <b>reducir</b> por esa regla.</p>`},
      {q:"¿Qué calcula GOTO(I, X) y para qué sirve?",
       a:`<p>GOTO(I, X) calcula el <b>estado al que se llega</b> desde el conjunto de ítems <code>I</code> al leer el símbolo gramatical <code>X</code>. Se toman los ítems de <code>I</code> que tengan el punto <b>justo antes de X</b>, se <b>corre el punto</b> al otro lado de <code>X</code>, y al conjunto resultante se le aplica CLOSURE. Sirve para definir las <b>transiciones del autómata LR(0)</b>: si <code>X</code> es un terminal, esa transición será un <b>desplazamiento</b>; si es un no terminal, será una entrada de <b>IR_A (GOTO)</b>. Por ejemplo, GOTO(estado 0, <code>id</code>) da el estado <code>{ A → id · := E }</code>.</p>`}
    ]
  },
  {
    id:"6.5", titulo:"El autómata LR(0) y los prefijos viables", aho:"§4.6.2 + §4.6.5 · p.243", badges:["🎯"], estado:"dictada",
    html:`
<p>Con CLOSURE y GOTO ya podemos armar <b>todos</b> los estados y todas sus transiciones. El resultado —los estados (conjuntos de ítems) más las flechas GOTO— es el <b>autómata LR(0)</b>: el «cerebro» que le dice al parser, en cada momento, qué mangos puede reconocer.</p>

<h3>La analogía del mapa de subte con carteles-resumen</h3>
<p>Es como el mapa de subte del léxico (módulo 3), pero acá cada <b>estación</b> (estado) tiene un cartel que resume <b>todo lo que legalmente podría haber en la pila</b> si llegaste hasta ahí. No te acordás del camino exacto que hiciste; solo importa <b>en qué estación estás</b>, porque esa estación ya condensa «estas son las reglas que podría estar reconociendo y cuánto llevo de cada una». Por eso la pila, en la práctica, guarda <b>estados</b> (estaciones), no símbolos: el estado ya lleva adentro toda la info útil.</p>

<h3>El autómata LR(0) completo de la gramática canónica</h3>
<p>Este es el mapa que vas a usar en los talleres 6.8 y 6.9. Son 13 estados (0 a 12). Cada uno es un conjunto de ítems:</p>
<pre><code>I0:  A' → · A          I1:  A' → A ·            (aceptar con $)
     A  → · id := E
                       I2:  A → id · := E
I3:  A → id := · E      I4:  A → id := E ·
     E → · E + T             E → E · + T
     E → · T
     T → · T * F        I5:  E → T ·
     T → · F                 T → T · * F
     F → · id
     F → · cte          I6:  T → F ·

I7:  F → id ·           I8:  F → cte ·

I9:  E → E + · T        I10: T → T * · F
     T → · T * F             F → · id
     T → · F                 F → · cte
     F → · id
     F → · cte          I11: E → E + T ·
                             T → T · * F
I12: T → T * F ·</code></pre>
<p>Y las transiciones GOTO (así se anota en el apunte: «ESTADO destino (origen, símbolo)»):</p>
<pre><code>(0, A) = 1     (0, id) = 2
(2, :=) = 3
(3, E) = 4     (3, T) = 5     (3, F) = 6     (3, id) = 7     (3, cte) = 8
(4, +) = 9
(5, *) = 10
(9, T) = 11    (9, F) = 6     (9, id) = 7    (9, cte) = 8
(10, F) = 12   (10, id) = 7   (10, cte) = 8
(11, *) = 10</code></pre>
<p>El algoritmo termina cuando <b>no quedan estados abiertos</b> (todo GOTO cae en un estado ya existente). Fijate que estados como el 6, 7 y 8 «no generan nuevos estados»: sus ítems tienen el punto al final (son de <b>reducción</b>).</p>

<h3>Prefijos viables: lo que legalmente puede haber en la pila</h3>
<p>Acá viene el concepto teórico que da sentido a todo. Un <b>prefijo viable</b> es un prefijo de una forma sentencial derecha <b>que no se pasa del extremo derecho del mango</b>. En criollo: es <b>un contenido de pila legal</b>, uno al que todavía se le pueden agregar terminales para completar una forma válida. La pila de un parser shift-reduce <b>siempre</b> contiene un prefijo viable.</p>
<p>Ejemplo de Aho (adaptado): si estás analizando algo que deriva <code>( E ) * id</code>, en distintos momentos la pila puede tener <code>(</code>, <code>( E</code> o <code>( E )</code>, pero <b>nunca</b> <code>( E ) *</code>, porque <code>( E )</code> es un mango que hay que reducir a <code>F</code> <b>antes</b> de desplazar el <code>*</code>. O sea: <code>( E ) *</code> <b>no es un prefijo viable</b>.</p>

<div class="callout tgt"><span class="lab">🎯 qué reconoce el autómata LR(0)</span>
El autómata LR(0) <b>reconoce exactamente los prefijos viables</b>. Mientras la pila sea un prefijo viable, el autómata «no se cae» y el parse puede seguir. Cada <b>estado</b> es un conjunto de ítems que resume, para ese prefijo viable, <b>todas</b> las reglas y grados de avance posibles. Por eso el estado del tope de la pila, más el próximo token, alcanza para decidir desplazar o reducir: el estado ya contiene todo el «contexto izquierdo» útil.</div>

<div class="callout aho"><span class="lab">📘 los ítems como estados de un AFN (por qué esto es viejo conocido)</span>
Aho muestra algo elegante y no es de parcial: si tratás cada <b>ítem</b> como un estado de un AFN (con transiciones sobre símbolos y transiciones ε de <code>A → α · B β</code> hacia <code>B → · γ</code>), entonces <b>CLOSURE es la ε-cerradura</b> y <b>GOTO es la construcción de subconjuntos</b> (¡las mismas de Flex, módulo 3!). O sea: armar el autómata LR(0) es <i>el mismo</i> algoritmo AFN→AFD que ya viste, aplicado a los ítems. El parsing y el léxico comparten la misma maquinaria por debajo.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El <b>autómata LR(0)</b> son los estados (conjuntos de ítems) + las transiciones GOTO. La gramática canónica da <b>13 estados</b> (0–12).</li>
<li>Cada <b>estado</b> resume «en qué punto de qué reglas podría estar» el parser; por eso la pila guarda <b>estados</b>.</li>
<li>Un <b>prefijo viable</b> es un contenido de pila legal (no se pasó del mango). El autómata LR(0) reconoce <b>exactamente</b> los prefijos viables.</li>
<li>Estados con ítems de punto al final (6, 7, 8, 11, 12…) son de <b>reducción</b> y no generan estados nuevos.</li>
</ul>`,
    qa:[
      {q:"¿Qué reconoce el autómata LR(0) y qué representa cada uno de sus estados?",
       a:`<p>Reconoce <b>exactamente los prefijos viables</b> de la gramática, es decir, los contenidos de pila que son legales durante un análisis shift-reduce (los que no se pasaron del extremo derecho del mango). Cada <b>estado</b> es un <b>conjunto de ítems LR(0)</b> que resume, para ese prefijo viable, todas las reglas que el parser podría estar reconociendo y el grado de avance (dónde está el punto) en cada una. Por eso el estado del tope de la pila condensa todo el «contexto izquierdo» que se necesita para decidir el próximo movimiento.</p>`},
      {q:"¿Qué es un prefijo viable? Dá un ejemplo de algo que NO lo sea.",
       a:`<p>Un <b>prefijo viable</b> es un prefijo de una forma sentencial derecha que <b>no se extiende más allá del mango</b>: representa un contenido de pila válido, al que todavía se le pueden agregar terminales para llegar a una forma legal. Ejemplo de lo que <b>no</b> es viable: analizando algo que deriva <code>( E ) * id</code>, la pila puede tener <code>(</code>, <code>( E</code> o <code>( E )</code>, pero <b>nunca</b> <code>( E ) *</code>, porque <code>( E )</code> es un mango que debe reducirse a <code>F</code> antes de desplazar el <code>*</code>. Por eso <code>( E ) *</code> no es prefijo viable.</p>`},
      {q:"¿Por qué la pila del parser guarda estados y no símbolos gramaticales?",
       a:`<p>Porque cada <b>estado</b> del autómata LR(0) ya <b>sintetiza</b> toda la información útil del prefijo viable que hay debajo: qué reglas se están reconociendo y cuánto se avanzó en cada una. El símbolo gramatical se puede recuperar del estado (cada estado, salvo el 0, tiene un único símbolo asociado con el que se llega a él), así que guardar el estado es <b>más informativo</b> que guardar el símbolo. Con el estado del tope y el próximo token, el parser consulta la tabla y decide; no necesita mirar el resto de la pila.</p>`},
      {q:"¿Cuándo termina el algoritmo de generación de estados, y qué caracteriza a estados como el 6, 7 u 8?",
       a:`<p>Termina cuando <b>no quedan estados abiertos</b>: cada transición GOTO de cada estado ya cae en un estado que existe, así que no se crean estados nuevos. Los estados como el 6 (<code>T → F ·</code>), 7 (<code>F → id ·</code>) y 8 (<code>F → cte ·</code>) tienen su ítem con el <b>punto al final del cuerpo</b>: son estados de <b>reducción</b> (indican que hay un mango completo y hay que reducir por esa regla) y <b>no generan estados nuevos</b>, porque no hay nada después del punto que permita un GOTO.</p>`}
    ]
  },
  {
    id:"6.6", titulo:"El algoritmo de análisis LR: tabla ACCION/IR_A", aho:"§4.6.3 · p.248", badges:["🎯"], estado:"dictada",
    html:`
<p>El autómata LR(0) es el cerebro; la <b>tabla LR</b> es ese cerebro escrito como una grilla que el parser consulta mecánicamente. Todos los parsers LR usan el <b>mismo programa controlador</b>; lo único que cambia de una gramática a otra es la <b>tabla</b>.</p>

<h3>La analogía del GPS que obedecés sin pensar</h3>
<p>La tabla es un <b>GPS</b>. Vos (el parser) solo sabés dos cosas: <b>en qué estado estás</b> (el del tope de la pila) y <b>cuál es el próximo token</b>. Con esos dos datos consultás la tabla y ella te ordena: «desplazá al estado 7», «reducí por la regla 4», «aceptá». No razonás, <b>obedecés</b>. Toda la inteligencia se calculó antes, al construir la tabla.</p>

<h3>Las dos partes de la tabla</h3>
<ul>
<li><b>ACCION[estado, terminal]</b> (la parte de terminales, más la columna <code>$</code>): dice qué hacer con el próximo <b>token</b>. Puede ser <b>desplazar n</b> (<code>D n</code>), <b>reducir n</b> (<code>R n</code>), <b>aceptar</b> o <b>error</b> (celda en blanco).</li>
<li><b>IR_A[estado, no terminal]</b> (la parte de no terminales; también llamada GOTO): dice a qué estado ir <b>después de una reducción</b>, cuando en el tope queda un no terminal. Sale directo de las transiciones GOTO del autómata: <code>ESTADO 1 (0, A)</code> se escribe como «fila 0, columna A = 1».</li>
</ul>

<h3>El programa controlador (siempre el mismo)</h3>
<pre><code>a = primer token de la entrada (con $ al final)
repetir:
  s = estado en el tope de la pila
  si ACCION[s, a] = desplazar t:
        meter t en la pila;  a = siguiente token
  si ACCION[s, a] = reducir A → β:
        sacar |β| estados de la pila           (tantos como símbolos tiene β)
        t = estado que quedó ahora en el tope
        meter IR_A[t, A] en la pila
        emitir la regla A → β                  (esto va a la lista de reglas)
  si ACCION[s, a] = aceptar:  fin
  si no:  error</code></pre>
<p>Tres detalles finos que se preguntan: (1) la pila guarda <b>estados</b>, no símbolos; (2) al reducir por <code>A → β</code> se <b>sacan tantos estados como símbolos tenga β</b> (porque cada símbolo del cuerpo metió un estado), y recién ahí se consulta <b>IR_A</b> con el estado que quedó expuesto; (3) la <b>salida</b> del parser se genera <b>en cada reducción</b>: es la <b>lista de reglas</b>.</p>

<h3>La tabla SLR de la gramática canónica</h3>
<p>Con los estados de 6.5 y SIGUIENTE (que calculamos en detalle en 6.7), la tabla queda así. <code>D n</code> = desplazar al estado n; <code>R n</code> = reducir por la regla n; <code>acc</code> = aceptar; en blanco = error:</p>
<pre><code>         A C C I O N (terminales)              I R _ A (no term.)
ESTADO   id    :=    +     *     cte   $        A    E    T    F
  0      D2                            .        1
  1                              .     acc
  2             D3
  3      D7                     D8              .    4    5    6
  4                   D9
  5                   R3    D10        R3
  6                   R5    R5         R5
  7                   R6    R6         R6
  8                   R7    R7         R7
  9      D7                     D8              .         11   6
 10      D7                     D8              .              12
 11                   R2    D10        R2
 12                   R4    R4         R4</code></pre>
<p>La celda de <b>aceptación</b> es <code>[1, $] = acc</code>: llegar al estado 1 (que es <code>A' → A ·</code>) con el <code>$</code> es «parseó bien». Eso coincide, palabra por palabra, con la respuesta de la cátedra a «¿cuándo termina bien un parsing?»: <b>se llega al estado 1 y se consume el <code>$</code></b>.</p>

<h3>Un pedacito de la traza (la completa va en 6.9)</h3>
<pre><code>PILA(estados)   SÍMBOLOS   ENTRADA                 ACCIÓN
0               $          id := id * cte + cte $  ACCION[0,id]=D2 → desplazar
0 2             id         := id * cte + cte $     ACCION[2,:=]=D3 → desplazar
0 2 3           id :=      id * cte + cte $        ACCION[3,id]=D7 → desplazar
0 2 3 7         id := id   * cte + cte $           ACCION[7,*]=R6 → reducir F→id (emite 6)</code></pre>
<p>Al reducir por <code>F → id</code> (cuerpo de 1 símbolo) se saca <b>1</b> estado (el 7), queda expuesto el estado 3, y se mete <code>IR_A[3, F] = 6</code>. La pila pasa a <code>0 2 3 6</code>. Así, mecánicamente, hasta aceptar.</p>

<div class="callout tgt"><span class="lab">🎯 la salida es la lista de reglas</span>
El parser LR <b>no arma un árbol</b>: cada vez que reduce, <b>emite el número de la regla</b>. Esa secuencia de números <b>es</b> la salida del analizador sintáctico. Para <code>id1 := id2 * cte1 + cte2</code> la lista termina siendo <code>6 5 7 4 3 7 5 2 1</code> (más la 0 al aceptar). El árbol de parsing es <b>abstracto</b>: se expresa a través de esa lista, no se construye físicamente.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La tabla tiene dos partes: <b>ACCION</b>[estado, terminal] (desplazar/reducir/aceptar/error) e <b>IR_A</b>[estado, no terminal] (a dónde ir tras reducir).</li>
<li>El controlador es <b>siempre el mismo</b>; solo cambia la tabla.</li>
<li>Al <b>reducir por A → β</b>: sacar <b>|β|</b> estados, mirar el estado expuesto, meter <b>IR_A[ese estado, A]</b>, y <b>emitir la regla</b>.</li>
<li>La pila guarda <b>estados</b>. La <b>salida</b> es la <b>lista de reglas</b>. Se <b>acepta</b> en <code>[1, $]</code>.</li>
</ul>`,
    qa:[
      {q:"¿Para qué sirven las dos partes de la tabla LR, ACCION e IR_A?",
       a:`<p><b>ACCION[estado, terminal]</b> decide <b>qué hacer con el próximo token</b>: desplazar (meter un estado y avanzar la entrada), reducir por una regla, aceptar o marcar error. Trabaja sobre las columnas de <b>terminales</b> más <code>$</code>. <b>IR_A[estado, no terminal]</b> (o GOTO) dice <b>a qué estado moverse después de una reducción</b>, cuando en el tope de la pila queda un no terminal; trabaja sobre las columnas de <b>no terminales</b>. Una maneja los terminales de la entrada; la otra, los no terminales que aparecen al reducir. Sale directo de las transiciones GOTO del autómata (<code>(0, A) = 1</code> → fila 0, columna A = 1).</p>`},
      {q:"Explicá, paso a paso, qué hace el parser cuando ACCION dice «reducir A → β».",
       a:`<p>(1) <b>Saca de la pila tantos estados como símbolos tenga β</b> (|β| estados), porque cada símbolo del cuerpo, al reconocerse, había metido un estado. (2) Mira el <b>estado que quedó expuesto</b> en el nuevo tope. (3) Consulta <b>IR_A[ese estado, A]</b> y <b>mete ese estado</b> en la pila (así el no terminal <code>A</code> queda representado por su estado). (4) <b>Emite la regla</b> <code>A → β</code>, que se agrega a la lista de reglas de salida. Importante: el <b>token de entrada no se consume</b> en una reducción (solo se consume al desplazar).</p>`},
      {q:"¿Cuándo acepta el parser, y cómo se relaciona con la respuesta de la cátedra sobre «cuándo termina bien un parsing»?",
       a:`<p>Acepta cuando la celda <b>ACCION[estado, $]</b> vale <b>aceptar</b>. En la gramática canónica eso ocurre en <b>ACCION[1, $]</b>, porque el estado 1 es <code>A' → A ·</code> (la regla aumentada completa) y el <code>$</code> confirma que no queda entrada. Coincide exactamente con la respuesta de parcial: <b>técnicamente</b>, un parsing termina bien cuando <b>se llega al estado 1 y se consume el símbolo <code>$</code></b> (gráficamente: se llegó a la raíz del árbol; teóricamente: se llegó al símbolo distinguido).</p>`},
      {q:"¿Qué produce el parser en cada reducción y qué es, entonces, la salida completa del análisis?",
       a:`<p>En cada reducción, el parser <b>emite el número de la regla</b> por la que redujo. La salida completa es, por lo tanto, la <b>lista de reglas</b> aplicadas, en orden. No se construye ningún árbol físico: el árbol de parsing es <b>abstracto</b> y queda representado por esa lista (que, leída al revés, es una derivación por la derecha). Para <code>id1 := id2 * cte1 + cte2</code> la lista es <code>6 5 7 4 3 7 5 2 1</code>, y la regla 0 se «usa» al aceptar.</p>`}
    ]
  },
  {
    id:"6.7", titulo:"Construcción de la tabla SLR: por qué la reducción va en FOLLOW", aho:"§4.6.4 · p.252", badges:["🎯"], estado:"dictada",
    html:`
<p>Ya tenemos los estados (6.5) y sabemos cómo se usa la tabla (6.6). Falta lo más preguntado: <b>cómo se decide qué va en cada celda</b>, y en particular <b>por qué las reducciones van solo en las columnas de SIGUIENTE</b>. Ese detalle es lo que convierte un autómata LR(0) «crudo» en una tabla <b>SLR</b> (LR simple) que anda.</p>

<h3>Primero, PRIMERO y SIGUIENTE de la gramática canónica</h3>
<p><b>PRIMERO(X)</b> = los terminales con los que puede <b>empezar</b> algo derivado de <code>X</code>. <b>SIGUIENTE(X)</b> = los terminales que pueden aparecer <b>inmediatamente a la derecha</b> de <code>X</code> en alguna derivación. Para la canónica:</p>
<pre><code>PRIMERO(A) = { id }                    (A empieza con id, por la regla 1)
PRIMERO(E) = PRIMERO(T) = PRIMERO(F) = { id, cte }
             (E empieza por T, T por F, F por id o cte)

SIGUIENTE(A) = { $ }                    ($ siempre está en SIGUIENTE del start)
SIGUIENTE(E) = { $, + }                 (por regla 1, $ ; por regla 2, + le sigue a E)
SIGUIENTE(T) = { $, +, * }              (hereda de E por reglas 2 y 3 ; y * por regla 4)
SIGUIENTE(F) = { $, +, * }              (hereda de T por reglas 4 y 5)</code></pre>

<h3>Las reglas para llenar la tabla (algoritmo SLR de Aho)</h3>
<p>Para cada estado <code>i</code> (con su conjunto de ítems <code>Ii</code>):</p>
<ol>
<li><b>Desplazamientos.</b> Si el ítem <code>A → α · a β</code> está en <code>Ii</code> (con <code>a</code> terminal) y <code>GOTO(Ii, a) = Ij</code>, entonces <code>ACCION[i, a] = desplazar j</code>.</li>
<li><b>Reducciones.</b> Si el ítem completo <code>A → α ·</code> está en <code>Ii</code>, entonces <code>ACCION[i, a] = reducir A → α</code> para <b>toda <code>a</code> en SIGUIENTE(A)</b> (y solo ahí). Ojo: <code>A</code> no puede ser el start aumentado <code>A'</code>.</li>
<li><b>Aceptación.</b> Si <code>A' → A ·</code> está en <code>Ii</code>, entonces <code>ACCION[i, $] = aceptar</code>.</li>
<li><b>IR_A.</b> Para cada no terminal: si <code>GOTO(Ii, A) = Ij</code>, entonces <code>IR_A[i, A] = j</code>.</li>
<li>Lo que quede sin llenar es <b>error</b>. Si una celda recibe <b>dos acciones</b>, hay <b>conflicto</b> → la gramática no es SLR.</li>
</ol>

<h3>La analogía: reducir es «cerrar una caja», y solo se cierra si lo que viene encaja</h3>
<p>Reducir <code>β</code> a <code>A</code> es como <b>cerrar una caja</b> y etiquetarla «<code>A</code>». ¿Cuándo tiene sentido cerrarla? Solo si <b>lo que viene después</b> puede ir legítimamente pegado a una <code>A</code>. Y «lo que puede ir pegado a la derecha de <code>A</code>» es, por definición, <b>SIGUIENTE(A)</b>. Si el próximo token no está en SIGUIENTE(A), cerrar la caja ahora sería un error: mejor no reducir. Por eso la reducción <code>A → β</code> se escribe <b>únicamente</b> en las columnas de SIGUIENTE(A).</p>

<div class="callout tgt"><span class="lab">🎯 por qué la reducción va en SIGUIENTE (y no en todas las columnas)</span>
Después de reducir un mango a <code>A</code>, el <b>único</b> terminal que puede aparecer a continuación de forma legal es alguno de <b>SIGUIENTE(A)</b>. Poner la reducción en cualquier otra columna provocaría <b>reducciones inválidas</b> (reducir cuando en realidad había que desplazar, o cuando la entrada estaba mal). Restringirla a SIGUIENTE(A) evita esos errores <b>y</b> elimina un montón de conflictos. Esta es <i>la</i> idea de SLR.</div>

<h3>La diferencia con LR(0) puro (dato fino que suma)</h3>
<p><b>LR(0) puro</b> es más bruto: si un estado tiene un ítem completo <code>A → α ·</code>, escribe la reducción en <b>todas</b> las columnas de terminales, sin mirar el lookahead. <b>SLR</b> usa SIGUIENTE(A) para reducir <b>solo donde tiene sentido</b>. Mismos estados, distinta tabla. Y la diferencia se ve <b>concretamente</b> en el estado 5 de nuestra gramática:</p>
<pre><code>ESTADO 5 = { E → T · ,  T → T · * F }
  - E → T ·  es ítem completo → reduce R3 (E→T) en SIGUIENTE(E) = { $, + }
  - T → T · * F  tiene el punto antes de * → desplaza D10 en la columna *

¿Hay conflicto en la columna * ?  NO, porque * NO está en SIGUIENTE(E).
  Con SLR:      columna * = D10  (solo desplazar) → limpio
  Con LR(0) puro: columna * = D10 Y R3 a la vez → ¡conflicto shift-reduce!</code></pre>
<p>O sea: SLR, al meter la reducción <b>solo</b> en <code>{ $, + }</code>, deja libre la columna <code>*</code> para el desplazamiento y <b>evita un conflicto</b> que LR(0) puro sí tendría. Ese es el valor de usar SIGUIENTE.</p>

<h3>La receta para el parcial (memorizá el orden)</h3>
<ol>
<li><b>Aumentar</b> la gramática (regla 0).</li>
<li><b>PRIMERO</b> de cada no terminal.</li>
<li><b>SIGUIENTE</b> de cada no terminal.</li>
<li><b>Estados</b> (ítems LR(0) con CLOSURE).</li>
<li><b>GOTO</b> (transiciones).</li>
<li><b>Desplazamientos</b> (GOTO con terminal → <code>D n</code>).</li>
<li><b>IR_A</b> (GOTO con no terminal → número de estado).</li>
<li><b>Reducciones</b> (ítem completo <code>A → β ·</code> → <code>R n</code> en las columnas de SIGUIENTE(A)).</li>
<li><b>Conflictos</b>: revisá cada celda; declará los que haya o afirmá «no hay conflictos, la gramática es SLR».</li>
</ol>

<div class="callout aho"><span class="lab">📘 SLR no es el más potente: hay gramáticas no ambiguas que se le escapan</span>
Usar SIGUIENTE es un criterio <b>simple pero grosero</b>: pone la reducción en <b>todo</b> SIGUIENTE(A), aunque en <i>ese</i> estado puntual algunos de esos terminales no puedan aparecer de verdad. Por eso ciertas gramáticas <b>no ambiguas</b> (como <code>S → L = R | R</code> de 6.3) igual dan conflicto en SLR. Los métodos LR(1) y LALR (7.1–7.2) afinan esto llevando el lookahead <b>estado por estado</b> en vez de usar el SIGUIENTE global. La cátedra calcula SLR; que sepas que existe algo más fino es lo que te blinda en las preguntas conceptuales.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La reducción <code>A → β</code> se escribe <b>solo en las columnas de SIGUIENTE(A)</b>, porque tras reducir a <code>A</code> lo único que puede seguir es algo de SIGUIENTE(A).</li>
<li><b>SLR = ítems LR(0) + SIGUIENTE</b> para ubicar las reducciones. <b>LR(0) puro</b> reduce en <b>todas</b> las columnas → más conflictos.</li>
<li>PRIMERO(A)={id}; PRIMERO(E)=PRIMERO(T)=PRIMERO(F)={id,cte}. SIGUIENTE(A)={$}, SIGUIENTE(E)={$,+}, SIGUIENTE(T)=SIGUIENTE(F)={$,+,*}.</li>
<li>Receta: aumentar → primeros → siguientes → estados → GOTO → desplazamientos → IR_A → reducciones (en SIGUIENTE) → conflictos.</li>
</ul>`,
    qa:[
      {q:"¿Por qué en SLR la reducción A → β se pone solo en las columnas de SIGUIENTE(A)?",
       a:`<p>Porque, después de reducir un mango al no terminal <code>A</code>, el <b>único</b> terminal que puede aparecer a continuación de manera legal es uno que pueda <b>seguir a <code>A</code></b> en alguna derivación, es decir, un elemento de <b>SIGUIENTE(A)</b>. Colocar la reducción en otras columnas habilitaría <b>reducciones inválidas</b>: el parser reduciría con un token que en realidad no puede venir después de <code>A</code>. Restringir la reducción a SIGUIENTE(A) es lo que hace correcta la tabla y, además, elimina muchos conflictos que aparecerían si se redujera en todas las columnas.</p>`},
      {q:"¿En qué se diferencian LR(0) puro y SLR si los estados son exactamente los mismos ítems LR(0)?",
       a:`<p>En <b>dónde ubican las reducciones</b>. Ante un ítem completo <code>A → α ·</code>, <b>LR(0) puro</b> escribe la reducción en <b>todas</b> las columnas de terminales del estado, sin mirar el lookahead. <b>SLR</b> usa <b>SIGUIENTE(A)</b> y escribe la reducción <b>solo</b> en esas columnas. Los estados son idénticos, pero la tabla no: SLR genera menos conflictos. Por eso la cátedra dice «SLR o LR(0)» como sinónimos, pero técnicamente los <b>ítems/estados</b> son LR(0) y la <b>tabla</b> es SLR.</p>`},
      {q:"En el estado 5 = { E → T· , T → T·*F }, mostrá por qué SLR no tiene conflicto en la columna *.",
       a:`<p>El estado 5 tiene dos ítems. El completo <code>E → T ·</code> pide <b>reducir por E→T (R3)</b>, pero <b>solo</b> en las columnas de <b>SIGUIENTE(E) = { $, + }</b>. El otro, <code>T → T · * F</code>, tiene el punto antes de <code>*</code>, así que pide <b>desplazar (D10)</b> en la columna <code>*</code>. Como <code>*</code> <b>no</b> pertenece a SIGUIENTE(E), la reducción R3 <b>no</b> se escribe en la columna <code>*</code>: ahí queda solo el D10. No hay conflicto. En cambio, <b>LR(0) puro</b> pondría R3 en todas las columnas, incluida <code>*</code>, y ahí chocaría con D10 → conflicto shift-reduce. Ese es el beneficio concreto de usar SIGUIENTE.</p>`},
      {q:"Calculá SIGUIENTE(E), SIGUIENTE(T) y SIGUIENTE(F) de la gramática canónica y justificá.",
       a:`<p><b>SIGUIENTE(E) = { $, + }.</b> Por la regla 1 (<code>A → id := E</code>), lo que sigue a <code>A</code> sigue a <code>E</code>, y SIGUIENTE(A)={$}. Por la regla 2 (<code>E → E + T</code>), a <code>E</code> le sigue <code>+</code>. <b>SIGUIENTE(T) = { $, +, * }.</b> En las reglas 2 y 3, <code>T</code> cierra el lado derecho de una <code>E</code>, así que hereda SIGUIENTE(E)={$,+}; y por la regla 4 (<code>T → T * F</code>) a <code>T</code> le sigue <code>*</code>. <b>SIGUIENTE(F) = { $, +, * }.</b> En las reglas 4 y 5, <code>F</code> cierra el lado derecho de una <code>T</code>, así que hereda SIGUIENTE(T)={$,+,*}. Regla general aplicada: si un no terminal cierra el cuerpo de una regla, hereda los SIGUIENTE del no terminal de la izquierda; y el <code>$</code> arranca en SIGUIENTE del start.</p>`}
    ]
  },
  {
    id:"6.8", titulo:"Taller: tabla SLR con orden de columnas impuesto", aho:"Parcial 2024", badges:["⚙️","🎯"], estado:"dictada",
    html:`
<p>Este es el ejercicio 2 típico del Parcial I (el molde exacto es el 2do cuatrimestre 2024). Te dan una gramática y te piden <b>todo el circuito</b>, muchas veces con un <b>orden de columnas impuesto</b> que tenés que respetar sí o sí. Acá va una consigna real y su <b>resolución modelo</b> completa.</p>

<h3>Consigna</h3>
<div class="callout tgt"><span class="lab">🎯 enunciado</span>
Dada la gramática <code>A → id := E</code> · <code>E → E + T</code> · <code>E → T</code> · <code>T → T * F</code> · <code>T → F</code> · <code>F → id</code> · <code>F → cte</code>: (a) <b>aumentala</b>; (b) calculá <b>PRIMERO</b> y <b>SIGUIENTE</b> de cada no terminal; (c) construí los <b>estados</b> LR(0) y la función <b>GOTO</b>; (d) armá los <b>desplazamientos</b> y las <b>reducciones</b>; (e) completá la <b>tabla SLR</b> respetando el orden de columnas <code>id  :=  +  *  cte  $ | A  E  T  F</code>; (f) indicá si hay <b>conflictos</b>.</div>

<h3>(a) Gramática aumentada</h3>
<pre><code>0.  A' → A
1.  A  → id := E     3.  E → T         5.  T → F         7.  F → cte
2.  E  → E + T       4.  T → T * F     6.  F → id</code></pre>

<h3>(b) PRIMERO y SIGUIENTE</h3>
<pre><code>PRIMERO(A) = { id }        SIGUIENTE(A) = { $ }
PRIMERO(E) = { id, cte }   SIGUIENTE(E) = { $, + }
PRIMERO(T) = { id, cte }   SIGUIENTE(T) = { $, +, * }
PRIMERO(F) = { id, cte }   SIGUIENTE(F) = { $, +, * }</code></pre>

<h3>(c) Estados LR(0) y GOTO</h3>
<pre><code>I0:  A' → ·A          (0,A)=1   (0,id)=2
     A  → ·id := E
I1:  A' → A·          → aceptar con $
I2:  A → id·:= E      (2,:=)=3
I3:  A → id := ·E     (3,E)=4  (3,T)=5  (3,F)=6  (3,id)=7  (3,cte)=8
     E → ·E + T
     E → ·T
     T → ·T * F
     T → ·F
     F → ·id
     F → ·cte
I4:  A → id := E·     (4,+)=9
     E → E·+ T
I5:  E → T·           (5,*)=10
     T → T·* F
I6:  T → F·
I7:  F → id·
I8:  F → cte·
I9:  E → E + ·T       (9,T)=11  (9,F)=6  (9,id)=7  (9,cte)=8
     T → ·T * F
     T → ·F
     F → ·id
     F → ·cte
I10: T → T * ·F       (10,F)=12  (10,id)=7  (10,cte)=8
     F → ·id
     F → ·cte
I11: E → E + T·       (11,*)=10
     T → T·* F
I12: T → T * F·</code></pre>

<h3>(d) Desplazamientos y reducciones</h3>
<ul>
<li><b>Desplazamientos</b> (GOTO con terminal): (0,id)→D2 · (2,:=)→D3 · (3,id)→D7 · (3,cte)→D8 · (4,+)→D9 · (5,*)→D10 · (9,id)→D7 · (9,cte)→D8 · (10,id)→D7 · (10,cte)→D8 · (11,*)→D10.</li>
<li><b>Reducciones</b> (ítem completo → en SIGUIENTE del no terminal izquierdo): I6 <code>T→F</code>=R5 en {$,+,*} · I7 <code>F→id</code>=R6 en {$,+,*} · I8 <code>F→cte</code>=R7 en {$,+,*} · I5 <code>E→T</code>=R3 en {$,+} · I11 <code>E→E+T</code>=R2 en {$,+} · I12 <code>T→T*F</code>=R4 en {$,+,*} · I4 <code>A→id:=E</code>=R1 en {$}.</li>
<li><b>Aceptación</b>: I1 con <code>$</code> → acc.</li>
</ul>

<h3>(e) Tabla SLR (en el orden pedido)</h3>
<pre><code>         id    :=    +     *     cte   $   |  A    E    T    F
  0      D2                            .   |  1
  1                              .     acc |
  2             D3                         |
  3      D7                     D8         |       4    5    6
  4                   D9                   |
  5                   R3    D10        R3  |
  6                   R5    R5         R5  |
  7                   R6    R6         R6  |
  8                   R7    R7         R7  |
  9      D7                     D8         |            11   6
 10      D7                     D8         |                 12
 11                   R2    D10        R2  |
 12                   R4    R4         R4  |</code></pre>

<h3>(f) Conflictos</h3>
<p>Revisamos celda por celda: en ningún casillero cae más de una acción. En el estado 5, la columna <code>*</code> tiene <b>solo</b> D10 (la reducción R3 va a <code>{ $, + }</code>, y <code>*</code> no está ahí); en el estado 11, igual. <b>No hay conflictos: la gramática es SLR.</b></p>

<div class="callout tgt"><span class="lab">🎯 cómo no perder puntos en este ejercicio</span>
Tres cosas: (1) <b>respetá el orden de columnas</b> que te imponen, aunque no sea el «natural» — si lo cambiás, te bajan nota aunque el contenido esté bien. (2) Escribí las reducciones <b>solo</b> en las columnas de SIGUIENTE del no terminal de la izquierda (error clásico: ponerlas en todas). (3) <b>Cerrá</b> con la frase explícita «no hay conflictos, la gramática es SLR» (o listá los que haya). Un ejercicio sin conclusión sobre conflictos queda incompleto.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El ejercicio se resuelve en <b>orden fijo</b>: aumentar → primeros → siguientes → estados → GOTO → desplazamientos → IR_A → reducciones (en SIGUIENTE) → conflictos.</li>
<li>Respetá el <b>orden de columnas impuesto</b> por el enunciado.</li>
<li>La gramática canónica <b>es SLR</b>: su tabla no tiene conflictos.</li>
<li>Terminá siempre con la <b>conclusión explícita</b> sobre conflictos.</li>
</ul>`,
    qa:[
      {q:"Enumerá, en orden, los pasos para resolver un parsing SLR completo de parcial.",
       a:`<p>(1) <b>Aumentar</b> la gramática (regla 0, <code>A' → A</code>). (2) <b>PRIMERO</b> de cada no terminal. (3) <b>SIGUIENTE</b> de cada no terminal. (4) <b>Estados</b> LR(0) con CLOSURE. (5) <b>GOTO</b> (transiciones entre estados). (6) <b>Desplazamientos</b> (GOTO con terminal → <code>D n</code>). (7) <b>IR_A</b> (GOTO con no terminal → número de estado). (8) <b>Reducciones</b> (ítem completo <code>A → β ·</code> → <code>R n</code>, solo en las columnas de SIGUIENTE(A)). (9) <b>Tabla</b> completa respetando el orden de columnas pedido. (10) <b>Conflictos</b>: declararlos o afirmar que no hay. Cerrar es parte del ejercicio.</p>`},
      {q:"¿Por qué el estado 5 no genera un conflicto shift-reduce en la columna del *?",
       a:`<p>Porque en el estado 5 conviven <code>E → T ·</code> (que pide reducir R3) y <code>T → T · * F</code> (que pide desplazar en <code>*</code>). La reducción R3 se coloca <b>solo</b> en las columnas de <b>SIGUIENTE(E) = { $, + }</b>, y <code>*</code> <b>no</b> pertenece a ese conjunto. Entonces la columna <code>*</code> recibe únicamente el desplazamiento D10: no hay dos acciones en la misma celda, no hay conflicto. Es la ventaja de SLR sobre LR(0) puro, que sí pondría la reducción en la columna <code>*</code> y generaría el choque.</p>`},
      {q:"¿Qué significa que el enunciado imponga un «orden de columnas» y por qué importa respetarlo?",
       a:`<p>Significa que la tabla debe dibujarse con las columnas en el orden exacto que da la consigna (por ejemplo <code>id := + * cte $</code> y después los no terminales <code>A E T F</code>), en vez del orden que a uno le resulte cómodo. Importa porque la cátedra corrige comparando contra ese formato: si cambiás el orden, aunque las acciones estén bien ubicadas conceptualmente, se considera que <b>no cumpliste la consigna</b> y se descuenta. Es un requisito de forma, pero se evalúa.</p>`},
      {q:"¿La gramática canónica de la cátedra es SLR? ¿Cómo lo justificás en el parcial?",
       a:`<p><b>Sí, es SLR.</b> Se justifica mostrando que, al completar la tabla, <b>ninguna celda recibe más de una acción</b>: no hay celdas con dos reducciones (reduce-reduce) ni con un desplazamiento y una reducción juntos (shift-reduce). Los puntos «sospechosos» son los estados 5 y 11 (donde un ítem pide reducir y otro desplazar en <code>*</code>), pero como la reducción va solo a SIGUIENTE(E)={$,+} y el desplazamiento va a <code>*</code>, no se pisan. Por lo tanto la tabla queda sin conflictos y se concluye explícitamente: «la gramática es SLR».</p>`}
    ]
  },
  {
    id:"6.9", titulo:"Taller: traza completa → lista de reglas", aho:"Apunte", badges:["⚙️","🎯"], estado:"dictada",
    html:`
<p>La otra mitad del ejercicio de parsing: ya tenés la tabla (6.8), ahora te dan un <b>programa</b> y tenés que hacer la <b>traza</b> pila/entrada/acción hasta aceptar, y entregar la <b>lista de reglas</b>. Lo hacemos entero con el programa estrella de la cátedra.</p>

<h3>Consigna</h3>
<div class="callout tgt"><span class="lab">🎯 enunciado</span>
Con la tabla SLR de la gramática canónica, analizá el programa <code>id1 := id2 * cte1 + cte2</code> (que el léxico entrega como la tira de tokens <code>id := id * cte + cte</code>). Mostrá la traza completa de la pila de estados, la entrada y la acción en cada paso, y dá la <b>lista de reglas</b> resultante.</div>

<h3>La traza, paso a paso</h3>
<p>La pila guarda <b>estados</b> (la columna SÍMBOLOS es solo una ayuda visual). En cada línea se consulta <code>ACCION[tope, próximo token]</code>:</p>
<pre><code>#   PILA(estados)    SÍMBOLOS       ENTRADA                 ACCIÓN
1   0                $              id := id * cte + cte $  ACCION[0,id]=D2  → desplazar
2   0 2              id             := id * cte + cte $     ACCION[2,:=]=D3  → desplazar
3   0 2 3            id :=          id * cte + cte $        ACCION[3,id]=D7  → desplazar
4   0 2 3 7          id := id       * cte + cte $           ACCION[7,*]=R6   → reducir F→id     [6]
5   0 2 3 6          id := F        * cte + cte $           ACCION[6,*]=R5   → reducir T→F      [5]
6   0 2 3 5          id := T        * cte + cte $           ACCION[5,*]=D10  → desplazar
7   0 2 3 5 10       id := T *      cte + cte $             ACCION[10,cte]=D8→ desplazar
8   0 2 3 5 10 8     id := T * cte  + cte $                 ACCION[8,+]=R7   → reducir F→cte    [7]
9   0 2 3 5 10 12    id := T * F    + cte $                 ACCION[12,+]=R4  → reducir T→T*F    [4]
10  0 2 3 5          id := T        + cte $                 ACCION[5,+]=R3   → reducir E→T      [3]
11  0 2 3 4          id := E        + cte $                 ACCION[4,+]=D9   → desplazar
12  0 2 3 4 9        id := E +      cte $                   ACCION[9,cte]=D8 → desplazar
13  0 2 3 4 9 8      id := E + cte  $                       ACCION[8,$]=R7   → reducir F→cte    [7]
14  0 2 3 4 9 6      id := E + F    $                       ACCION[6,$]=R5   → reducir T→F      [5]
15  0 2 3 4 9 11     id := E + T    $                       ACCION[11,$]=R2  → reducir E→E+T    [2]
16  0 2 3 4          id := E        $                       ACCION[4,$]=R1   → reducir A→id:=E  [1]
17  0 1              A              $                       ACCION[1,$]=acc  → aceptar          [0]</code></pre>

<h3>Cómo se lee una reducción en la traza</h3>
<p>Mirá el paso 9, <b>reducir T → T * F</b>. El cuerpo <code>T * F</code> tiene <b>3 símbolos</b>, así que se sacan <b>3 estados</b> de la pila (el 12, el 10 y el 5). Queda expuesto el estado 3; se consulta <code>IR_A[3, T] = 5</code> y se mete el 5. La pila pasa de <code>0 2 3 5 10 12</code> a <code>0 2 3 5</code>. Y se <b>emite la regla 4</b>. Ese mecanismo (sacar |β|, mirar el estado expuesto, meter IR_A, emitir) es idéntico en cada reducción.</p>

<h3>La lista de reglas</h3>
<pre><code>Reducciones en orden:  6  5  7  4  3  7  5  2  1     (y la 0 al aceptar)</code></pre>
<p>Coincide exactamente con la lista canónica de la cátedra. Y verificá la magia: si tomás esa lista <b>al revés</b> (0, 1, 2, 5, 7, 3, 4, 7, 5, 6) y aplicás las reglas desde <code>A'</code>, reconstruís una <b>derivación por la derecha</b> del programa. La lista de reglas <b>es</b> el árbol, comprimido.</p>

<div class="callout tgt"><span class="lab">🎯 lo que devuelve el parser</span>
El resultado del parsing ascendente <b>es la lista de reglas</b> <code>6 5 7 4 3 7 5 2 1</code>, <b>no</b> un árbol dibujado. El árbol de parsing es <b>abstracto</b>: se expresa a través de esa lista, leída como una derivación por la derecha en reversa. En el Parcial II, esa misma lista es la <b>entrada</b> para generar el código intermedio (árbol, polaca o tercetos): por eso conviene que te salga sin dudar.</div>

<div class="callout aho"><span class="lab">📘 chequeo de coherencia (te sirve para no equivocarte)</span>
Contá: el programa tiene <b>2 id</b> y <b>2 cte</b> (4 hojas). Cada hoja se reduce a <code>F</code> con una regla 6 o 7, así que en la lista tiene que haber <b>4</b> reducciones de tipo <code>F→…</code>: efectivamente hay <b>una 6 y dos 7</b>… y falta una: no, contá bien: <code>id2</code>→6, <code>cte1</code>→7, <code>cte2</code>→7. Son 3 hojas de expresión (id2, cte1, cte2), porque el <code>id1</code> de la izquierda <b>no</b> se reduce a F: es el <code>id</code> de <code>A → id := E</code>. Ese tipo de conteo (cuántas 6/7, cuántas 5, etc.) te deja verificar la traza sin rehacerla entera.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La traza es una tabla <b>pila(estados) / símbolos / entrada / acción</b>; en cada paso consultás <code>ACCION[tope, token]</code>.</li>
<li>Al <b>reducir A → β</b>: sacás <b>|β|</b> estados, mirás el expuesto, metés <b>IR_A[expuesto, A]</b> y <b>emitís la regla</b>.</li>
<li>Para <code>id1 := id2 * cte1 + cte2</code> la lista es <b><code>6 5 7 4 3 7 5 2 1</code></b> (más la 0 al aceptar).</li>
<li>Esa lista <b>es</b> la salida del parser (el árbol es abstracto) y es la <b>entrada</b> de la generación de código en el Parcial II.</li>
</ul>`,
    qa:[
      {q:"¿Qué devuelve concretamente el parser ascendente y cómo se relaciona con el árbol de parsing?",
       a:`<p>Devuelve la <b>lista de reglas</b> aplicadas en las reducciones, en orden (para el programa canónico, <code>6 5 7 4 3 7 5 2 1</code>). Esa lista, leída <b>al revés</b>, es una <b>derivación por la derecha</b> del programa, así que describe el árbol de parsing <b>sin construirlo físicamente</b>. Por eso se dice que «el árbol es abstracto»: toda su información está en la lista de reglas. En el Parcial II esa lista es, además, el punto de partida para generar el código intermedio.</p>`},
      {q:"En la traza, cuando reducís por T → T * F, ¿cuántos estados sacás de la pila y qué metés?",
       a:`<p>Sacás <b>3 estados</b>, porque el cuerpo <code>T * F</code> tiene 3 símbolos (cada símbolo del cuerpo había metido un estado al reconocerse). En el ejemplo se sacan el 12, el 10 y el 5, y queda expuesto el estado 3. Después consultás <b>IR_A[3, T] = 5</b> y metés el estado 5. La pila pasa de <code>0 2 3 5 10 12</code> a <code>0 2 3 5</code>, y se <b>emite la regla 4</b>. La regla general: sacar <b>|β|</b> estados, mirar el estado expuesto, meter <b>IR_A[expuesto, cabeza]</b> y emitir la regla.</p>`},
      {q:"Para el programa id1 := id2 * cte1 + cte2, ¿cuál es la lista de reglas y en qué paso se «usa» la regla 0?",
       a:`<p>La lista es <b><code>6 5 7 4 3 7 5 2 1</code></b>. La <b>regla 0</b> (<code>A' → A</code>) se «usa» al <b>aceptar</b>: cuando la pila llega al estado 1 (que representa <code>A' → A ·</code>) con el <code>$</code> en la entrada, la acción es <b>aceptar</b>, lo que equivale a completar la regla 0. Por eso a veces se anota la lista como <code>6 5 7 4 3 7 5 2 1 0</code>: el 0 marca el cierre exitoso del análisis.</p>`},
      {q:"¿Cuándo, exactamente, el parser de la traza anuncia aceptación?",
       a:`<p>Cuando, tras reducir todo el programa a <code>A</code> y llegar al estado 1 con la pila <code>0 1</code>, el próximo (y último) token es <code>$</code> y la tabla dice <b>ACCION[1, $] = aceptar</b>. En términos de la cátedra: <b>se llegó al estado 1 y se consumió el símbolo <code>$</code></b> (gráficamente, se llegó a la raíz del árbol; teóricamente, se llegó al símbolo distinguido). Ese es el criterio único de «parseó bien», y es la razón por la que se aumentó la gramática.</p>`}
    ]
  }
]});

/* =================== MÓDULO 7 =================== */
M.push({
  id:7, titulo:"LR potentes y generadores", parcial:"I",
  resumen:"Lo que viene después de SLR: los ítems LR(1) con símbolo de anticipación, la fusión LALR (lo que usa Yacc/Bison), las gramáticas ambiguas útiles y el else colgante, la estructura del .y y la resolución de conflictos por defecto, y cómo se enganchan Lex y Yacc en tu TP.",
  lecciones:[
  {
    id:"7.1", titulo:"Ítems LR(1) canónicos", aho:"§4.7.1–4.7.3 · p.260", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, no de parcial.</b> La cátedra calcula SLR; LR(1) y LALR solo «se nombran». Pero entender LR(1) explica <b>por qué</b> SLR a veces falla y por qué Yacc/Bison usan algo más potente. Vale la pena tenerlo claro para las preguntas conceptuales.</p>

<h3>El problema que arrastra SLR</h3>
<p>En 6.3 y 6.7 vimos que SLR pone la reducción <code>A → α</code> en <b>todo</b> SIGUIENTE(A). Eso es grosero: usa un SIGUIENTE <b>global</b>, igual para todos los estados. Pero puede pasar que en <b>un estado puntual</b>, después de reconocer <code>α</code>, cierto terminal de SIGUIENTE(A) <b>no</b> pueda aparecer de verdad. SLR reduce igual (porque el terminal está en el SIGUIENTE global) y ahí se arma un conflicto que en realidad no debería existir.</p>

<h3>La idea de LR(1): pegarle a cada ítem su lookahead</h3>
<p>Un <b>ítem LR(1)</b> es un ítem LR(0) con un <b>segundo componente</b>: un terminal de anticipación (lookahead). Se escribe <code>[A → α · β , a]</code>. El <code>a</code> dice: «este ítem solo pide <b>reducir</b> por <code>A → α</code> si el próximo token es <b>exactamente</b> <code>a</code>». Ya no es «todo SIGUIENTE(A)», sino «este terminal, en este contexto». El «1» es por <b>un</b> símbolo de anticipación.</p>

<h3>La analogía del portero con lista de invitados por sala</h3>
<p>SLR es como un portero que tiene <b>una sola</b> lista de invitados para <b>todo</b> el edificio: si tu nombre está en la lista general, entrás a cualquier sala. LR(1) es un portero por <b>cada sala</b>, con una lista <b>específica</b> de quién puede entrar <b>a esa sala</b>. Es mucho más preciso: rechaza combinaciones que la lista global dejaría pasar. El precio: hace falta <b>un portero (y una lista) por sala</b> → <b>muchos más estados</b>.</p>

<h3>Qué cambia en el cálculo</h3>
<p>La única diferencia técnica está en CLOSURE. Cuando expandís <code>[A → α · B β , a]</code>, los ítems nuevos de <code>B</code> llevan como lookahead <b>PRIMERO(β a)</b> (lo que puede venir después de <code>B</code> en <i>ese</i> contexto), no el SIGUIENTE global de <code>B</code>. Eso es lo que hace que los lookaheads sean <b>precisos por estado</b>. El resto (GOTO, armado de la tabla) es igual, pero ahora la reducción <code>[A → α · , a]</code> se escribe <b>solo</b> en la columna <code>a</code>.</p>

<div class="callout aho"><span class="lab">📘 el ejemplo que SLR no puede y LR(1) sí</span>
La gramática <code>S → L = R | R</code>, <code>L → * R | id</code>, <code>R → L</code> (la de 6.3): <b>no es ambigua</b> pero <b>no es SLR</b>, porque en el estado que reconoce <code>L</code> conviven «desplazar <code>=</code>» y «reducir <code>R → L</code>» (ya que <code>=</code> está en SIGUIENTE(R) global). LR(1) mira el lookahead <b>real</b> de <i>ese</i> estado, se da cuenta de que ahí <code>R → L</code> no debe reducirse con <code>=</code>, y <b>elimina el conflicto</b>. Ese poder extra es la razón de ser de LR(1).</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Un <b>ítem LR(1)</b> es <code>[A → α · β , a]</code>: un ítem LR(0) más un <b>terminal de anticipación</b>.</li>
<li>La reducción <code>[A → α · , a]</code> se hace <b>solo si el próximo token es <code>a</code></b> (un subconjunto de SIGUIENTE(A), no todo).</li>
<li>Resuelve conflictos que SLR no puede (gramáticas no ambiguas pero no-SLR), a costa de <b>muchos más estados</b>.</li>
<li>Diferencia de cálculo: en CLOSURE, los lookaheads salen de <b>PRIMERO(β a)</b>, precisos por estado.</li>
</ul>`,
    qa:[
      {q:"¿Qué le agrega LR(1) a un ítem LR(0) y qué gana con eso?",
       a:`<p>Le agrega un <b>símbolo de anticipación</b> (lookahead): el ítem pasa de <code>A → α · β</code> a <code>[A → α · β , a]</code>. Con eso, la reducción por <code>A → α</code> se hace <b>solo</b> cuando el próximo token es <b>exactamente <code>a</code></b>, en vez de para todo SIGUIENTE(A) como en SLR. Gana <b>poder</b>: distingue contextos que SLR confunde y resuelve conflictos en gramáticas no ambiguas que no son SLR. Lo paga con <b>muchos más estados</b>, porque el mismo ítem LR(0) puede aparecer con distintos lookaheads en estados separados.</p>`},
      {q:"¿Por qué SLR falla en gramáticas donde LR(1) funciona, si usan los mismos ítems de base?",
       a:`<p>Porque SLR decide las reducciones con el <b>SIGUIENTE global</b> del no terminal, que es el mismo para todos los estados. Ese conjunto puede incluir terminales que, en <b>un estado concreto</b>, no pueden aparecer realmente después del mango; SLR reduce igual y genera un conflicto artificial. LR(1) lleva el lookahead <b>calculado estado por estado</b> (con PRIMERO(β a) en la cerradura), así que en cada estado sabe con precisión qué tokens habilitan la reducción y evita esos conflictos. Mismos ítems de base, pero información de anticipación mucho más fina.</p>`},
      {q:"¿Cuál es la desventaja práctica de LR(1) frente a SLR?",
       a:`<p>El <b>tamaño</b>. Como cada ítem lleva su lookahead, un mismo conjunto de ítems LR(0) puede dar lugar a <b>varios</b> estados LR(1) distintos (que difieren solo en el segundo componente). Eso multiplica la cantidad de estados y, por lo tanto, el tamaño de la tabla, que para un lenguaje real puede ser enorme. Por eso en la práctica no se usa LR(1) canónico «puro», sino <b>LALR</b> (lección 7.2), que recupera casi todo el poder de LR(1) con una tabla del tamaño de SLR.</p>`}
    ]
  },
  {
    id:"7.2", titulo:"LALR: fusionar estados con el mismo núcleo", aho:"§4.7.4 · p.266", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, no de parcial</b>, pero es <b>el método que usan Yacc y Bison</b>, así que es el que corre en tu TP por debajo. Es el equilibrio perfecto entre SLR y LR(1).</p>

<h3>La observación clave</h3>
<p>Al construir los estados LR(1), aparece un patrón: muchos estados tienen <b>exactamente los mismos ítems LR(0)</b> (el mismo «núcleo» o corazón) y difieren <b>solo</b> en los lookaheads. Por ejemplo, dos estados con <code>{ C → c · C , C → · c C , C → · d }</code> que en uno llevan lookahead <code>c/d</code> y en otro <code>$</code>. El núcleo es idéntico; cambia la etiqueta de anticipación.</p>

<h3>La idea de LALR: fusionar por núcleo</h3>
<p><b>LALR</b> (Look-Ahead LR) toma todos los estados LR(1) con el <b>mismo núcleo</b> y los <b>fusiona en uno solo</b>, <b>uniendo</b> sus lookaheads. Resultado: una tabla con <b>tantos estados como SLR</b> (o LR(0)), pero con la información de anticipación <b>por estado</b> de LR(1). Casi todo el poder de LR(1), al tamaño de SLR.</p>

<h3>La analogía de tirar la pared entre dos oficinas gemelas</h3>
<p>Tenés dos oficinas con <b>exactamente los mismos muebles</b> (mismo núcleo) pero <b>distinta lista de gente autorizada</b> (distintos lookaheads). En vez de mantener las dos, <b>tirás la pared</b> y hacés una sola oficina, y <b>juntás las dos listas</b> de autorizados. Ahorrás la mitad del espacio y casi no perdés control de acceso.</p>

<div class="callout aho"><span class="lab">📘 el precio de fusionar: posibles conflictos reduce-reduce</span>
Fusionar núcleos <b>nunca</b> crea conflictos <b>desplazamiento-reducción</b> nuevos (el desplazamiento depende del núcleo, que es igual en los dos). Pero <b>puede</b>, en casos raros, crear un conflicto <b>reducción-reducción</b> que en LR(1) puro no existía, porque al unir los lookaheads dos reducciones distintas pueden terminar pidiendo la misma columna. Es infrecuente y las gramáticas de lenguajes reales lo evitan. Por eso LALR es «el método de elección en la mayoría de las situaciones» (Aho).</div>

<h3>La jerarquía completa, en una línea</h3>
<pre><code>LR(0) puro  ⊂  SLR  ⊂  LALR  ⊂  LR(1) canónico
 (más débil)                    (más potente)
 tabla chica                    tabla enorme
                LALR: tabla chica + casi todo el poder</code></pre>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>LALR</b> fusiona los estados LR(1) con <b>igual núcleo</b> (mismos ítems LR(0)), <b>uniendo</b> sus lookaheads.</li>
<li>Resultado: tabla del <b>tamaño de SLR</b> con casi el <b>poder de LR(1)</b>.</li>
<li>La fusión no crea conflictos shift-reduce nuevos, pero <b>puede</b> crear algún reduce-reduce (raro).</li>
<li>Es el método que usan <b>Yacc y Bison</b>: el que corre en tu TP.</li>
</ul>`,
    qa:[
      {q:"¿Qué hace LALR y por qué es el método preferido por Yacc/Bison?",
       a:`<p>LALR toma los estados LR(1) que tienen el <b>mismo núcleo</b> (los mismos ítems LR(0), ignorando el lookahead) y los <b>fusiona</b> en un solo estado, <b>uniendo</b> sus símbolos de anticipación. Así obtiene una tabla del <b>tamaño de SLR</b> (o LR(0)) pero con casi todo el <b>poder de LR(1)</b>. Ese equilibrio entre tamaño manejable y potencia es lo que lo vuelve práctico, y por eso Yacc y Bison lo eligen para generar sus parsers.</p>`},
      {q:"¿Qué significa que dos estados LR(1) tengan «el mismo núcleo»?",
       a:`<p>Que tienen <b>exactamente los mismos ítems LR(0)</b> —las mismas reglas con el punto en la misma posición— y difieren <b>únicamente</b> en el <b>lookahead</b> (el segundo componente de cada ítem). El núcleo es el conjunto de ítems «sin la etiqueta de anticipación». LALR detecta esos estados con núcleo idéntico y los junta en uno, combinando los lookaheads de ambos. Es común que aparezcan pares así al construir la colección LR(1) de una gramática.</p>`},
      {q:"¿Qué riesgo introduce la fusión de estados en LALR y qué tipo de conflicto NO puede crear?",
       a:`<p>La fusión <b>puede</b> introducir, en casos raros, un conflicto <b>reducción-reducción</b>: al unir los lookaheads de dos estados, dos reducciones distintas pueden terminar reclamando la misma columna, algo que en LR(1) puro no ocurría. En cambio, <b>nunca</b> crea un conflicto <b>desplazamiento-reducción</b> nuevo, porque las acciones de desplazamiento dependen del núcleo, que es idéntico en los estados fusionados. En gramáticas de lenguajes reales el riesgo reduce-reduce prácticamente no aparece, por eso LALR es tan usado.</p>`}
    ]
  },
  {
    id:"7.3", titulo:"Gramáticas ambiguas útiles y el else colgante", aho:"§4.8 · p.278", badges:["🎯","📘"], estado:"dictada",
    html:`
<p>Vimos que ninguna gramática ambigua es LR. Y sin embargo, <b>algunas gramáticas ambiguas son tan cómodas</b> que conviene usarlas igual y <b>resolver los conflictos con reglas extra</b>. El caso 🎯 que sí puede caer en el parcial es el <b>else colgante</b>.</p>

<h3>Por qué a veces conviene una gramática ambigua</h3>
<p>La gramática <code>E → E + E | E * E | ( E ) | id</code> es <b>ambigua</b> (no fija precedencia ni asociatividad), pero es <b>más corta y natural</b> que la versión desambiguada con niveles <code>E/T/F</code>. Aho da dos ventajas: (1) podés cambiar precedencia y asociatividad <b>sin tocar</b> las producciones ni agregar estados; (2) el parser <b>no pierde tiempo</b> en reducciones «de trámite» como <code>E → T</code> y <code>T → F</code>, que en la gramática desambiguada solo existen para imponer precedencia. La contra: hay que <b>agregar reglas de desambiguación</b> aparte, y usarlas con cuidado.</p>

<h3>El else colgante (dangling else)</h3>
<p>La gramática clásica de condicionales:</p>
<pre><code>instr → if expr then instr else instr
      | if expr then instr
      | otra</code></pre>
<p>es ambigua. El lío aparece con <code>if E then if E then S else S</code>: ¿el <code>else</code> pertenece al <code>if</code> de <b>afuera</b> o al de <b>adentro</b>?</p>

<h3>La analogía de los paréntesis mentales</h3>
<p>Es como leer «llovía cuando salí y no traje paraguas»: ¿el «no traje paraguas» va con «salí» o con toda la escena? Nuestra intuición de programadores dice: el <code>else</code> se pega al <code>if</code> <b>más cercano</b> (el de adentro), igual que un paréntesis que cierra se aparea con el que abrió <b>último</b>. Esa es la <b>regla estándar</b>: <b>el else se asocia al if más interno sin else previo</b>.</p>

<h3>Cómo se resuelve en un parser LR</h3>
<p>Aho abstrae la gramática como <code>S → i S e S | i S | a</code> (con <code>i</code>=«if expr then», <code>e</code>=«else», <code>a</code>=«otra»). Al construir los estados aparece un <b>conflicto desplazamiento-reducción</b> en el estado donde tenés <code>i S</code> en la pila y un <code>e</code> por venir: podés <b>reducir</b> <code>S → i S</code> (cerrar el if corto) o <b>desplazar</b> el <code>e</code> (seguir con el if-else).</p>
<div class="callout tgt"><span class="lab">🎯 la resolución: preferir DESPLAZAR</span>
El conflicto se resuelve <b>a favor del desplazamiento</b>: se desplaza el <code>else</code>. Eso hace, automáticamente, que el <code>else</code> quede asociado al <code>then</code> más cercano (el <code>if</code> interno), que es la semántica que todos esperamos. En términos de parcial: la gramática del if-then-else es <b>ambigua</b> → genera un conflicto shift-reduce → se resuelve <b>desplazando</b> (o reescribiendo la gramática para que el <code>else</code> se aparee con el <code>if</code> más interno).</p></div>

<div class="callout aho"><span class="lab">📘 «ambigua pero controlada» no contradice a «ninguna ambigua es LR»</span>
Las dos cosas son ciertas a la vez. Una gramática ambigua <b>no</b> produce una tabla LR sin conflictos; eso sigue valiendo. Lo que se hace es <b>tomar la tabla con conflictos y resolverlos a mano</b> con reglas fijas (precedencia, asociatividad, «preferir desplazar»). El resultado es un parser que reconoce <b>un</b> árbol por sentencia. Es una decisión de ingeniería, no una excepción al teorema. La cátedra, en cambio, en un ejercicio SLR «puro» espera que <b>marques el conflicto</b> y digas que la gramática no es SLR; la resolución por reglas es lo que hacen Yacc/Bison (7.4).</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Algunas gramáticas <b>ambiguas</b> son útiles (más cortas, menos reducciones de trámite) y se usan con <b>reglas de desambiguación</b>.</li>
<li>El <b>else colgante</b>: en <code>if E then if E then S else S</code>, ¿a qué <code>if</code> va el <code>else</code>?</li>
<li>Regla estándar: el <code>else</code> se asocia al <b>if más cercano/interno</b>.</li>
<li>En LR eso equivale a <b>resolver el conflicto shift-reduce a favor de desplazar</b> el <code>else</code>.</li>
</ul>`,
    qa:[
      {q:"¿Qué es el else colgante y cómo se resuelve el conflicto que genera en un parser LR?",
       a:`<p>Es la ambigüedad de <b>a cuál <code>if</code> pertenece un <code>else</code></b> cuando hay <code>if</code> anidados, como en <code>if E then if E then S else S</code>. La gramática natural del if-then-else es ambigua y produce un <b>conflicto desplazamiento-reducción</b>: con <code>if E then instr</code> en la pila y un <code>else</code> a la vista, el parser podría reducir (cerrar el if corto) o desplazar (seguir con el if-else). Se resuelve <b>a favor del desplazamiento</b>: desplazar el <code>else</code> lo asocia al <code>then</code>/<code>if</code> <b>más cercano</b> (el interno), que es la interpretación estándar.</p>`},
      {q:"¿Por qué a veces se prefiere una gramática ambigua para las expresiones, si no es LR?",
       a:`<p>Por comodidad y eficiencia. La gramática ambigua <code>E → E+E | E*E | (E) | id</code> es <b>más corta y natural</b> que la desambiguada con niveles <code>E/T/F</code>. Ventajas concretas: (1) se puede fijar la precedencia y la asociatividad con <b>declaraciones aparte</b>, sin tocar las producciones ni agregar estados al parser; (2) se <b>evitan reducciones de trámite</b> como <code>E → T</code> y <code>T → F</code>, que en la gramática desambiguada solo sirven para imponer precedencia y hacen más lento el parser. La contra es que hay que <b>agregar reglas de desambiguación</b> y usarlas con cuidado.</p>`},
      {q:"¿Es contradictorio decir «ninguna gramática ambigua es LR» y a la vez usar gramáticas ambiguas con Yacc?",
       a:`<p>No, no es contradictorio. «Ninguna gramática ambigua es LR» significa que su tabla LR <b>tendrá conflictos</b> (no se puede construir un parser LR sin conflictos directamente). Lo que se hace con Yacc es <b>construir esa tabla con conflictos y resolverlos con reglas fijas</b> (precedencia, asociatividad, «preferir desplazar»), de modo que el parser final elija <b>un</b> árbol por sentencia. Es una resolución <b>manual y controlada</b> del conflicto, no una excepción al teorema. En un ejercicio SLR de la cátedra, en cambio, se espera que <b>marques el conflicto</b> y concluyas que la gramática no es SLR.</p>`}
    ]
  },
  {
    id:"7.4", titulo:"Yacc/Bison: estructura del .y y resolución por defecto", aho:"§4.9 · p.287", badges:["🎯"], estado:"dictada",
    html:`
<p>Armar una tabla LR a mano para un lenguaje real es inviable. Por eso existen los <b>generadores de analizadores sintácticos</b>: le das la gramática y te generan el parser. El clásico es <b>Yacc</b> («Yet Another Compiler-Compiler») y su versión moderna libre, <b>Bison</b>. Generan un parser <b>LALR</b> (7.2). Es el par natural de Flex: Flex hace el léxico, Bison el sintáctico.</p>

<h3>La analogía: Bison es a la gramática lo que Flex a las expresiones regulares</h3>
<p>En el módulo 3 viste que Flex toma un <code>.l</code> con expresiones regulares y te <b>genera</b> el autómata del léxico. Bison hace lo mismo un piso más arriba: toma un <code>.y</code> con una <b>gramática</b> y te <b>genera</b> el autómata LALR (la tabla + el controlador). Los dos son <b>metacompiladores</b>: programas que producen programas.</p>

<h3>Las tres secciones del .y (igual que Flex)</h3>
<pre><code>declaraciones
%%
reglas de traducción
%%
rutinas de soporte en C</code></pre>
<ul>
<li><b>Declaraciones:</b> entre <code>%{ ... %}</code> va código C tal cual (los <code>#include</code>). Después, los <b>tokens</b> con <code>%token</code>, y la <b>precedencia/asociatividad</b> con <code>%left</code>, <code>%right</code>, <code>%nonassoc</code> (¡en orden de menor a mayor precedencia!).</li>
<li><b>Reglas de traducción:</b> cada producción con su <b>acción semántica</b> en C entre llaves. Dentro, <code>$$</code> es el valor del no terminal de la cabeza y <code>$1</code>, <code>$2</code>, <code>$3</code>… los valores de los símbolos del cuerpo. La acción se ejecuta <b>cuando el parser reduce</b> por esa regla.</li>
<li><b>Rutinas de soporte:</b> código C de apoyo. Acá va (o se incluye) <code>yylex()</code>.</li>
</ul>

<h3>Ejemplo: la calculadora de escritorio de Aho</h3>
<pre><code>%{
#include &lt;ctype.h&gt;
%}
%token DIGITO
%%
linea   : expr '\\n'          { printf("%d\\n", $1); }
        ;
expr    : expr '+' term      { $$ = $1 + $3; }
        | term
        ;
term    : term '*' factor    { $$ = $1 * $3; }
        | factor
        ;
factor  : '(' expr ')'       { $$ = $2; }
        | DIGITO
        ;
%%</code></pre>
<p>Fijate <code>{ $$ = $1 + $3; }</code>: cuando reduce por <code>expr → expr + term</code>, suma el valor de la <code>expr</code> del cuerpo (<code>$1</code>) y el de <code>term</code> (<code>$3</code>) — el <code>+</code> es <code>$2</code> — y lo deja como valor de la <code>expr</code> de la cabeza (<code>$$</code>). Cuando el cuerpo tiene un solo símbolo, la acción por defecto es <code>{ $$ = $1; }</code>, así que se puede omitir.</p>

<h3>Resolución de conflictos por defecto (esto se toma)</h3>
<div class="callout tgt"><span class="lab">🎯 las dos reglas por defecto de Yacc/Bison</span>
Si la gramática genera conflictos, Yacc <b>no se planta</b>: los resuelve solo, con dos reglas fijas: (1) un conflicto <b>reducción-reducción</b> se resuelve eligiendo la <b>regla que aparece primero</b> en el archivo; (2) un conflicto <b>desplazamiento-reducción</b> se resuelve <b>a favor del desplazamiento</b> — y esa elección resuelve <b>correctamente el else colgante</b> (7.3). Yacc igual <b>avisa</b> cuántos conflictos encontró (con la opción <code>-v</code> genera <code>y.output</code> para inspeccionarlos).</div>

<h3>Controlar precedencia y asociatividad</h3>
<p>Para no depender del azar, se declaran los operadores. <code>%left '+' '-'</code> los hace <b>asociativos a la izquierda</b>; una línea más abajo, <code>%left '*' '/'</code> les da <b>mayor precedencia</b> (el orden de las declaraciones fija la precedencia, de menor a mayor). <code>%right</code> es para asociatividad a derecha (potencia), y <code>%nonassoc</code> para operadores que no se pueden encadenar. Con <code>%prec</code> se le fuerza a una regla la precedencia de un terminal dado (el truco del menos unario: <code>%prec UMENOS</code>).</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Yacc/Bison generan un parser <b>LALR</b> a partir de un <code>.y</code> con la gramática. Son el par de Flex.</li>
<li>Tres secciones (como Flex): <b>declaraciones</b> (<code>%token</code>, <code>%left</code>/<code>%right</code>/<code>%nonassoc</code>, <code>%prec</code>), <b>reglas</b> con acciones semánticas (<code>$$</code>, <code>$1</code>…), y <b>código C</b>.</li>
<li>Conflictos por defecto: shift-reduce → <b>desplazar</b>; reduce-reduce → <b>la regla listada primero</b>.</li>
<li>La precedencia/asociatividad se controla con <code>%left</code>/<code>%right</code>/<code>%nonassoc</code>/<code>%prec</code>.</li>
</ul>`,
    qa:[
      {q:"¿Cuáles son las tres secciones de un archivo .y de Yacc/Bison y qué va en cada una?",
       a:`<p>Separadas por <code>%%</code>, igual que en Flex. <b>(1) Declaraciones:</b> código C entre <code>%{ ... %}</code> (los <code>#include</code>), la declaración de <b>tokens</b> con <code>%token</code>, y la <b>precedencia/asociatividad</b> con <code>%left</code>, <code>%right</code>, <code>%nonassoc</code> (en orden de menor a mayor precedencia). <b>(2) Reglas de traducción:</b> cada producción con su <b>acción semántica</b> en C entre llaves, donde <code>$$</code> es el valor de la cabeza y <code>$1, $2, …</code> los del cuerpo; la acción se ejecuta al <b>reducir</b> por esa regla. <b>(3) Rutinas de soporte en C:</b> código auxiliar, incluido <code>yylex()</code> (o su inclusión).</p>`},
      {q:"¿Cómo resuelve Bison por defecto un conflicto shift-reduce y uno reduce-reduce?",
       a:`<p>Un conflicto <b>desplazamiento-reducción</b> lo resuelve <b>a favor del desplazamiento</b> (esa elección, además, resuelve correctamente el else colgante, asociando el <code>else</code> al <code>if</code> más cercano). Un conflicto <b>reducción-reducción</b> lo resuelve eligiendo la <b>producción que aparece primero</b> en el archivo. En ambos casos Bison <b>reporta</b> cuántos conflictos halló; con la opción <code>-v</code> genera un archivo <code>y.output</code> para ver los estados y cómo se resolvieron. Estas reglas por defecto se pueden anular declarando precedencia y asociatividad.</p>`},
      {q:"¿Qué significan $$ y $1, $3 en una acción semántica, con el ejemplo expr : expr '+' term?",
       a:`<p>En la acción de <code>expr : expr '+' term { $$ = $1 + $3; }</code>, cada símbolo del cuerpo tiene un valor: <code>$1</code> es el valor de la <code>expr</code> del cuerpo, <code>$2</code> el del <code>'+'</code> y <code>$3</code> el del <code>term</code>. <code>$$</code> es el valor que se le asigna al no terminal de la <b>cabeza</b> (la <code>expr</code> de la izquierda). La acción se dispara <b>cuando el parser reduce</b> por esa regla, y acá calcula la suma. Si el cuerpo tiene un único símbolo, la acción por defecto es <code>{ $$ = $1; }</code> (copiar el valor), por eso suele omitirse.</p>`},
      {q:"¿Cómo se controla la precedencia y la asociatividad de los operadores en un .y?",
       a:`<p>Con declaraciones en la primera sección: <code>%left</code> (asociativo a izquierda), <code>%right</code> (a derecha, como la potencia) y <code>%nonassoc</code> (no encadenable). El <b>orden</b> de las declaraciones fija la precedencia, de <b>menor a mayor</b>: si ponés <code>%left '+' '-'</code> y debajo <code>%left '*' '/'</code>, el <code>*</code> y el <code>/</code> tienen más precedencia que <code>+</code> y <code>-</code>. Con <code>%prec terminal</code> se le puede forzar a una producción la precedencia de un terminal específico (el caso típico es el menos unario, con un token ficticio <code>UMENOS</code>). Estas declaraciones anulan la resolución por defecto de los conflictos shift-reduce.</p>`}
    ]
  },
  {
    id:"7.5", titulo:"Lex + Yacc juntos: quién llama a quién (tu TP)", aho:"§4.9.3 · p.294", badges:["🎯"], estado:"dictada",
    html:`
<p>Última pieza del Parcial I y corazón de tu TP: cómo se <b>enganchan</b> el léxico (Flex) y el sintáctico (Bison) para trabajar juntos. La pregunta que cae: <b>¿quién llama a quién?</b></p>

<h3>La analogía del chef y su ayudante</h3>
<p>El <b>chef</b> (Bison) es el que dirige la cocina: sabe qué plato está armando y, cuando necesita el próximo ingrediente, se lo <b>pide</b> al <b>ayudante</b> (Flex): «pasame el próximo token». El ayudante va a la despensa (el flujo de caracteres), prepara <b>un</b> ingrediente y se lo alcanza. El ayudante nunca cocina de más ni le tira toda la despensa junta: entrega <b>de a uno, a pedido</b>. El que manda es el chef.</p>

<h3>Quién llama a quién</h3>
<p><b>Bison manda.</b> Su función <code>yyparse()</code> es la que dirige todo el proceso; cada vez que necesita el próximo token para decidir su acción (desplazar/reducir), <b>llama a <code>yylex()</code></b>, que es justamente la función que <b>genera Flex</b>. Esto conecta con lo que ya sabías del léxico: <b>el AL no devuelve una lista de tokens</b>, devuelve <b>uno por vez, cuando el sintáctico se lo pide</b>. Acá se ve por qué: el que pide es <code>yyparse()</code>.</p>
<pre><code>Bison (yyparse)  ── ¿próximo token? ──▶  Flex (yylex)
      ◀── return TIPO_DE_TOKEN, y el valor en yylval ──</code></pre>

<h3>Cómo viaja un token (tipo + valor)</h3>
<p>Cuando Flex reconoce un lexema, hace dos cosas: (1) <b><code>return</code> del <b>tipo</b> de token</b> (el nombre declarado con <code>%token</code> en el <code>.y</code>, por ejemplo <code>ID</code> o <code>CTE</code>); y (2) si ese token tiene un <b>valor</b> asociado (el lexema concreto, el número, un puntero a la tabla de símbolos), lo deja en la variable global <b><code>yylval</code></b>. Bison recibe el tipo por el <code>return</code> y lee el valor de <code>yylval</code>, que aparece como <code>$1</code>, <code>$2</code>… dentro de las acciones semánticas.</p>

<h3>Cómo se compilan juntos</h3>
<p>Para que Bison conozca los nombres de los tokens y Flex los pueda devolver, se los <b>comparte</b>: en la tercera sección del <code>.y</code> se pone <code>#include "lex.yy.c"</code>, de modo que la salida de Flex se compila <b>como parte</b> de la salida de Bison. En UNIX el flujo es:</p>
<pre><code>lex   lexico.l        (genera lex.yy.c)
yacc  sintaxis.y      (genera y.tab.c, incluye lex.yy.c)
cc    y.tab.c -ly -ll  (enlaza las bibliotecas de Yacc y Lex → ejecutable)</code></pre>

<div class="callout tgt"><span class="lab">🎯 el pipeline completo, de punta a punta</span>
<b>caracteres</b> → (Flex, <code>yylex</code>) <b>tokens</b> → (Bison, <code>yyparse</code> + tus acciones semánticas) → <b>lista de reglas</b> y, con las acciones, la <b>notación intermedia</b>. Bison es el director: pide tokens a Flex de a uno, va reduciendo, y en cada reducción ejecuta la acción semántica que vos escribiste. Ese es exactamente el esqueleto de tu TP compilador.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Bison manda</b>: <code>yyparse()</code> llama a <code>yylex()</code> (la función que genera Flex) cada vez que necesita un token.</li>
<li>El léxico devuelve <b>un token por vez, a pedido</b> del sintáctico (no una lista).</li>
<li>Flex hace <code>return</code> del <b>tipo</b> de token y deja el <b>valor</b> en <code>yylval</code> (que Bison ve como <code>$1</code>, <code>$2</code>…).</li>
<li>Se compilan juntos con <code>#include "lex.yy.c"</code>; el pipeline es caracteres → tokens → lista de reglas → notación intermedia.</li>
</ul>`,
    qa:[
      {q:"En un compilador Flex+Bison, ¿quién llama a quién y cómo viaja el valor de un token?",
       a:`<p><b>Bison llama a Flex.</b> La función <code>yyparse()</code> de Bison dirige el proceso y, cada vez que necesita el próximo token para decidir su acción, invoca <code>yylex()</code>, que es la función que genera Flex. Flex hace <code>return</code> del <b>tipo</b> de token (el nombre declarado con <code>%token</code>) y, si el token tiene un valor asociado (el número, el lexema, un puntero a la tabla de símbolos), lo deja en la variable global <b><code>yylval</code></b>. Bison recibe el tipo por el <code>return</code> y usa el valor de <code>yylval</code> como <code>$1, $2, …</code> dentro de las acciones semánticas.</p>`},
      {q:"¿Cómo se relaciona «Bison llama a yylex()» con la trampa de parcial «el AL no devuelve una lista de tokens»?",
       a:`<p>Son la misma idea vista desde la herramienta. Que el analizador léxico <b>no devuelva una lista</b> sino <b>un token por vez a pedido</b> es justamente porque el que dirige es el <b>sintáctico</b>: en Flex+Bison, <code>yyparse()</code> (Bison) llama a <code>yylex()</code> (Flex) <b>cada vez que necesita el próximo token</b>. Flex reconoce un lexema, lo devuelve, y se queda esperando el siguiente pedido. Nunca escanea todo el archivo de una para entregar una lista completa: produce de a uno, conducido por el parser.</p>`},
      {q:"¿Qué es el pipeline completo caracteres → … → notación intermedia y qué rol cumple cada herramienta?",
       a:`<p>El flujo es: <b>caracteres</b> → (Flex/<code>yylex</code>) <b>tokens</b> → (Bison/<code>yyparse</code> + acciones semánticas) <b>lista de reglas</b> y, a través de las acciones, la <b>notación intermedia</b> (árbol, polaca o tercetos). <b>Flex</b> agrupa caracteres en tokens y los entrega a pedido. <b>Bison</b> reconoce la gramática con su parser LALR, va reduciendo, y en <b>cada reducción</b> ejecuta la acción semántica que el programador escribió, que es la que construye la representación intermedia. Ese encadenamiento es el esqueleto del TP compilador.</p>`},
      {q:"¿Cómo se combinan en la práctica el archivo .l y el .y para producir un solo ejecutable?",
       a:`<p>Se comparten los nombres de tokens y se compilan juntos. En la tercera sección del <code>.y</code> se pone <code>#include "lex.yy.c"</code>, para que la salida de Flex quede incluida dentro de la salida de Bison y así <code>yylex()</code> conozca los códigos de token que Bison declaró con <code>%token</code>. El flujo típico en UNIX es: <code>lex lexico.l</code> (produce <code>lex.yy.c</code>), <code>yacc sintaxis.y</code> (produce <code>y.tab.c</code>, que incluye el anterior) y <code>cc y.tab.c -ly -ll</code>, que enlaza las bibliotecas de Yacc y Lex y genera el ejecutable del traductor.</p>`}
    ]
  }
]});
