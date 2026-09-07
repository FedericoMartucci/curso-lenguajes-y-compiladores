M.push({ id:15, titulo:"Tu proyecto 2C2026 — L1_aho aplicado", parcial:"I y II", resumen:"La teoría llevada a tu compilador real: tokens, temas especiales y cómo se evalúa.", lecciones:[
  {
    id:"15.1", titulo:"El lenguaje L1_aho: tokens, cotas y el analizador léxico", aho:"Tu Lexico.l · Práctica 1", badges:["🎯"], estado:"dictada",
    html:`
<p>Este módulo agarra todo lo que venías estudiando y lo aplica a <b>tu</b> compilador: grupo 1, lenguaje <b>L1_aho</b>, notación intermedia <b>polaca inversa</b>, temas especiales <b>matchPatterns</b> y <b>powerSpaceship</b>. El parcial no toma flex/bison, pero sí pregunta <i>conceptualmente</i> sobre el proyecto ("¿en qué regla pondrías tal validación?"), así que dominar tu propio lenguaje es estudiar para el parcial.</p>

<h3>Dónde estamos en la cadena</h3>
<p>Arrancamos por el principio del pipeline: <b>caracteres → (léxico) → tokens</b>, con la <b>tabla de símbolos</b> al costado. Todo lo del Módulo 1, 2 y 3, pero con los tokens concretos de L1_aho.</p>

<h3>Los tokens de tu lenguaje</h3>
<p>Tu <code>Lexico.l</code> define estos elementos léxicos:</p>
<ul>
<li><b>Constantes</b>: <code>CTE_INT</code> = <code>{DIGITO}+</code> · <code>CTE_FLOAT</code> = <code>{DIGITO}+"."{DIGITO}+</code> · <code>CTE_STRING</code> = <code>"</code>…<code>"</code> con letras o dígitos.</li>
<li><b>Identificador</b>: <code>ID</code> = <code>{LETRA}({LETRA}|{DIGITO})*</code>.</li>
<li><b>Operadores</b>: <code>+ - * /</code>, comparadores <code>== != &lt; &gt; &lt;= &gt;=</code>, asignación <code>:=</code>, y los dos especiales <code>**</code> (potencia) y <code>&lt;=&gt;</code> (spaceship), más <code>..</code> (rango).</li>
<li><b>Delimitadores</b>: <code>( ) { } : ,</code>.</li>
<li><b>Comentarios</b>: <code>#+ ... +#</code> — se descartan, no generan token.</li>
<li><b>Palabras reservadas</b>: <code>init, Int, Float, String, AND, OR, NOT, if, else, while, read, write, when, is, in</code>.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 la palabra reservada pasa por el estado del identificador</span>
Mirá cómo lo resuelve tu léxico: la regla <code>{ID}</code> reconoce el lexema y <b>después</b> llama a <code>buscar_reservada(yytext)</code>. Si el lexema coincide con una reservada, devuelve ese token; si no, devuelve <code>ID</code>. Es exactamente lo que vimos en la lección 3.1: <b>una palabra reservada se reconoce con el mismo autómata que un identificador</b>, y recién en el estado final se decide. Por eso las reservadas <b>no</b> van a la tabla de símbolos.</div>

<h3>Las cotas van en la acción léxica, no en la ER</h3>
<p>Este es el concepto de la lección 2.5 y del Módulo 1, aplicado a tus cotas reales:</p>
<ul>
<li><code>CTE_INT</code>: la ER <code>{DIGITO}+</code> acepta cualquier número. La <b>acción léxica</b> chequea <code>valor &gt; 32767</code> → error léxico "fuera de cota".</li>
<li><code>CTE_FLOAT</code>: la acción chequea contra <code>3.4028235e38</code> (el máximo de un float).</li>
<li><code>CTE_STRING</code>: la acción chequea que la <b>longitud</b> (sin las comillas) no supere <b>50</b> caracteres.</li>
</ul>
<div class="callout tgt"><span class="lab">🎯 pregunta de parcial</span>
"¿Por qué la cota de una constante no se pone en la expresión regular?" → Porque la ER describe la <b>forma</b> (una secuencia de dígitos), no el <b>valor</b>. Una ER que enumere exactamente hasta 32767 sería impracticable, y el valor es una condición semántica del lexema. Se valida en la <b>acción léxica</b>, y ese error ocurre en <b>tiempo de compilación</b>, en la etapa léxica. Practicá esto en el Sandbox (solapa Acciones léxicas → "Constante entera con cota").</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>L1_aho: constantes Int (≤32767), Float, String (≤50), ID, operadores incluidos <code>**</code> y <code>&lt;=&gt;</code>, comentarios <code>#+ +#</code>.</li>
<li>🎯 Reservadas: se reconocen por el camino del ID y se descartan de la tabla de símbolos.</li>
<li>🎯 Las cotas (valor, longitud) van en la <b>acción léxica</b>, no en la ER, y su error es de compilación (etapa léxica).</li>
<li>A la tabla de símbolos van <b>identificadores y constantes</b> con sus atributos (tipo, valor, longitud), sin duplicados.</li>
</ul>`,
    qa:[
      {q:"En tu léxico, la regla del identificador reconoce «if» y «while». ¿Cómo hace para devolver el token IF y no ID, y por qué esas palabras no van a la tabla de símbolos?",
       a:`<p>La regla <code>{ID}</code> reconoce el lexema con el autómata de identificadores y, al llegar al estado final, llama a <code>buscar_reservada(yytext)</code>. Si el lexema está en la tabla de palabras reservadas, devuelve ese token (<code>IF</code>, <code>WHILE</code>); si no, devuelve <code>ID</code>. No van a la tabla de símbolos porque tienen <b>un único lexema</b> fijo: no hay atributos que recordar. A la tabla solo van los tokens que pueden representar más de un lexema (identificadores y constantes).</p>`},
      {q:"¿En qué momento y en qué etapa se dispara el error cuando alguien escribe la constante entera 40000 en tu lenguaje? Justificá.",
       a:`<p>En <b>tiempo de compilación</b>, en la etapa <b>léxica</b>, dentro de la <b>acción léxica</b> de <code>CTE_INT</code>. La expresión regular <code>{DIGITO}+</code> reconoce la forma (llega al estado final), pero la acción compara el valor contra la cota 32767 y, como 40000 la supera, corta con "error léxico: fuera de cota". La cota es una validación de la acción, no de la ER.</p>`},
      {q:"V/F justificando: «El comentario #+ hola +# genera un token que el analizador sintáctico recibe.»",
       a:`<p><b>Falso.</b> En tu <code>Lexico.l</code> la regla del comentario tiene una acción <b>vacía</b>: reconoce el patrón <code>#+ ... +#</code> y <b>lo descarta</b>, no hace <code>return</code> de ningún token. Igual que los blancos y saltos de línea, el comentario nunca llega al sintáctico.</p>`}
    ]
  },
  {
    id:"15.2", titulo:"Tema especial matchPatterns (when): gramática y acciones", aho:"TE1 · Práctica 2/3", badges:["🎯","⚙️"], estado:"dictada",
    html:`
<p>Tu primer tema especial es <b>matchPatterns</b>: una selección por patrones al estilo del <code>when</code> de Kotlin. Es, para el parcial, un "comando inventado" — exactamente el tipo de ejercicio del Parcial II (como <code>OPLIST</code> o <code>ALTERLIST</code>), pero es el tuyo.</p>

<h3>Qué hace</h3>
<p>Evalúa una expresión de control <b>una sola vez</b> y ejecuta el bloque de la <b>primera rama</b> cuyo patrón la satisfaga. En L1_aho:</p>
<pre><code>when (nota)
{
    is 10      { write("Perfecto") }
    in 4..9    { write("Aprobado") }
    is &lt; 4     { write("Desaprobado") }
    else       { write("Nota invalida") }
}</code></pre>
<p>Tres tipos de patrón: <b>valor exacto</b> (<code>is 10</code>), <b>rango</b> (<code>in 4..9</code>, ambos extremos inclusive) y <b>guarda</b> (<code>is &lt; 4</code>, con un comparador). Más una rama <b>else</b> opcional al final.</p>

<h3>La gramática (esto es GLC — Módulo 4)</h3>
<p>Pensala como la cátedra: un no terminal para la sentencia, uno para la lista de ramas, uno por cada tipo de patrón. Un esqueleto posible:</p>
<pre><code>WHEN    -&gt; when ( E ) { RAMAS ELSEOPT }
RAMAS   -&gt; RAMAS RAMA | RAMA
RAMA    -&gt; PATRON { PROG }
PATRON  -&gt; is cte | in cte .. cte | is OPREL cte
ELSEOPT -&gt; else { PROG } | lambda</code></pre>
<p>Fijate que <code>in cte .. cte</code> usa tu token <code>..</code>, y <code>is OPREL cte</code> reusa los comparadores de los temas comunes.</p>

<div class="callout tgt"><span class="lab">🎯 dónde va cada validación (pregunta típica de parcial)</span>
La consigna del tema te da la tabla, y es oro para el parcial:
<ul>
<li><b>Sintáctico</b>: que haya al menos una rama · que los valores de los patrones sean <b>constantes</b> (no variables ni expresiones) · que el <code>else</code> no se repita ni aparezca antes de otra rama.</li>
<li><b>Semántico</b>: que el tipo de los patrones coincida con el de la expresión de control · que en un rango el límite inferior sea ≤ al superior · que no haya dos ramas con el mismo valor exacto.</li>
</ul>
Cuando en el parcial te pregunten "¿en qué etapa/regla incorporás la validación de que el rango esté bien ordenado?", la respuesta es: <b>semántico</b>, en la acción de la regla del patrón de rango (comparás las dos constantes).</div>

<h3>Acciones semánticas → polaca inversa</h3>
<p>Como tu notación asignada es <b>polaca inversa</b>, el <code>when</code> se traduce parecido a una cadena de <code>if</code>: evaluás la expresión de control una vez, la guardás en un auxiliar, y por cada rama generás una comparación con un salto por falso (<code>BF</code>) a la rama siguiente, más un salto incondicional (<code>BI</code>) al final cuando una rama se cumple. Es el mecanismo de <b>pila de celdas / backpatching</b> del Módulo 11, aplicado a varias ramas en cadena.</p>
<div class="callout tgt"><span class="lab">🎯 la semántica del orden</span>
Como los patrones pueden solaparse (un rango <code>1..9</code> y una guarda <code>&gt; 5</code>), el <b>orden de las ramas importa</b>: se evalúan en orden y se sale con la primera que da verdadero. Eso se refleja en la traducción: cada rama salta al final apenas se cumple, sin evaluar las siguientes.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>matchPatterns evalúa la expresión una vez y ejecuta la primera rama que matchea; el orden es semántico.</li>
<li>Tres patrones: valor exacto (<code>is cte</code>), rango (<code>in cte..cte</code>), guarda (<code>is OPREL cte</code>).</li>
<li>🎯 Validaciones sintácticas (al menos una rama, patrones constantes, else único y al final) vs semánticas (tipos, rango ordenado, sin valores repetidos).</li>
<li>En polaca se traduce como cadena de comparaciones con <code>BF</code>/<code>BI</code> y pila de celdas.</li>
</ul>`,
    qa:[
      {q:"En matchPatterns, ¿en qué etapa y en qué regla incorporarías la validación de que los valores de los patrones sean constantes y no variables? Justificá.",
       a:`<p>En la etapa <b>sintáctica</b>, en las reglas de los patrones. La gramática misma se escribe para que el patrón derive <b>cte</b> (constante) y no un identificador ni una expresión: <code>PATRON → is cte | in cte .. cte | is OPREL cte</code>. Al forzar el terminal <code>cte</code> en esas reglas, cualquier intento de poner una variable directamente no encaja en ninguna regla y el parser lo rechaza. Es una validación estructural: la resuelve la propia forma de la gramática.</p>`},
      {q:"¿Por qué el orden de las ramas del when forma parte de la semántica, y cómo se refleja eso en la traducción a polaca?",
       a:`<p>Porque los patrones pueden <b>solaparse</b> (ej. un rango <code>1..9</code> y una guarda <code>&gt; 5</code> aceptan ambos el valor 7). La regla es "la primera rama que se satisface gana", así que cambiar el orden cambia qué bloque se ejecuta. En la traducción a polaca se refleja en que cada rama, apenas su comparación da verdadero, ejecuta su bloque y <b>salta al final</b> con un <code>BI</code>, sin evaluar las ramas siguientes — igual que un <code>if/else if</code> encadenado.</p>`},
      {q:"Taller: escribí las validaciones (con su etapa) que pondrías para la rama de rango «in 9..4».",
       a:`<p><b>in 9..4</b> tiene el límite inferior (9) mayor que el superior (4). Esa validación es <b>semántica</b>: va en la acción de la regla del patrón de rango, comparando las dos constantes (<code>if(cte_inf &gt; cte_sup) error</code>). No se puede hacer en sintáctico porque ahí solo se ve la forma <code>in cte .. cte</code>, no los valores. Además, en semántico, el tipo de ambas constantes debe coincidir con el tipo de la expresión de control.</p>`}
    ]
  },
  {
    id:"15.3", titulo:"Tema especial powerSpaceship: precedencia, asociatividad y tipos", aho:"TE3 · Módulos 4 y 10", badges:["🎯"], estado:"dictada",
    html:`
<p>Tu segundo tema especial suma dos operadores binarios: <b>potencia</b> <code>**</code> y <b>comparación de tres vías</b> <code>&lt;=&gt;</code> (el "spaceship"). Cada uno toca un tema distinto de la teoría: uno la <b>precedencia y asociatividad</b> en la gramática (Módulo 4), el otro la <b>comprobación de tipos</b> (Módulo 10).</p>

<h3>Potencia ** — el único asociativo a derecha</h3>
<p>Dos propiedades lo hacen especial, y las dos se codifican en la <b>forma de la gramática</b> (lección 4.6):</p>
<ul>
<li><b>Precedencia más alta</b> de todo el lenguaje: mayor que <code>*</code> y <code>/</code>. Por eso <code>2 * 3 ** 2</code> se agrupa como <code>2 * (3 ** 2)</code> = 18. En la gramática, va en un nivel <b>más profundo</b> que el término.</li>
<li><b>Asociativo a derecha</b> (todos los demás son a izquierda). <code>2 ** 3 ** 2</code> = <code>2 ** (3 ** 2)</code> = 512. En la gramática, eso se logra con una regla <b>recursiva a derecha</b>: <code>P → F ** P | F</code> (a diferencia de <code>T → T * F</code>, que es recursiva a izquierda).</li>
</ul>
<div class="callout tgt"><span class="lab">🎯 acá se ve para qué sirve lo de la lección 4.6</span>
La precedencia se codifica con los <b>niveles</b> de la gramática (más profundo = más precedencia) y la asociatividad con el <b>lado de la recursión</b> (a izquierda = asocia izquierda; a derecha = asocia derecha). La potencia junta las dos cosas: nivel más profundo (más precedencia que <code>*</code>) y recursión a derecha (asocia a derecha). Es el ejemplo perfecto de por qué la forma de las reglas <i>es</i> la semántica.</div>

<h4>Validaciones de la potencia (semántico)</h4>
<ul>
<li>El <b>exponente</b> debe ser de tipo <b>entero</b>.</li>
<li>El exponente no puede ser una constante <b>negativa</b>.</li>
<li>El tipo del resultado es el tipo de la <b>base</b> (base entera → resultado entero).</li>
<li>El resultado debe respetar las <b>cotas</b> del tipo de la base (semántico/ejecución).</li>
</ul>

<h3>Spaceship &lt;=&gt; — colapsa tres comparaciones</h3>
<p>Compara dos expresiones y devuelve <b>−1, 0 o 1</b> según el primero sea menor, igual o mayor. Sus propiedades:</p>
<ul>
<li><b>Precedencia más baja</b> de los aritméticos: menor que <code>+</code> y <code>−</code>. Así <code>a + 1 &lt;=&gt; b * 2</code> compara los <b>resultados</b> de ambos lados.</li>
<li><b>No asociativo</b>: encadenar dos sin paréntesis (<code>a &lt;=&gt; b &lt;=&gt; c</code>) es <b>error de sintaxis</b>. En la gramática se logra con una regla <b>no recursiva</b> para ese operador (no se puede volver a aplicar sin paréntesis).</li>
<li>El resultado es siempre <b>entero</b> (−1/0/1), así que se puede asignar a una variable entera o usar en una condición: <code>(a &lt;=&gt; b) == 0</code> pregunta si son iguales.</li>
</ul>
<div class="callout tgt"><span class="lab">🎯 validaciones del spaceship (semántico y sintáctico)</span>
<b>Sintáctico</b>: encadenar dos <code>&lt;=&gt;</code> sin paréntesis es error (lo garantiza la gramática no asociativa). <b>Semántico</b>: los dos operandos deben ser del <b>mismo tipo</b>; ninguno puede ser <b>string</b>; y el resultado (entero) solo se puede asignar a una <b>variable entera</b>. La comprobación de tipos usa la <b>tabla de síntesis</b> (Módulo 10).</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>🎯 <code>**</code>: precedencia más alta + asociativo a <b>derecha</b> (recursión a derecha en la gramática). Exponente entero ≥ 0; resultado del tipo de la base.</li>
<li>🎯 <code>&lt;=&gt;</code>: precedencia más baja + <b>no asociativo</b> (regla no recursiva). Resultado entero −1/0/1; operandos del mismo tipo, no string; solo se asigna a variable entera.</li>
<li>Precedencia = nivel en la gramática; asociatividad = lado de la recursión.</li>
</ul>`,
    qa:[
      {q:"¿Cómo se codifica en la gramática que ** tenga la precedencia más alta y sea asociativo a derecha? Mostralo con una regla.",
       a:`<p>La <b>precedencia más alta</b> se codifica poniendo la potencia en el nivel <b>más profundo</b> de la gramática (por debajo del término), para que se agrupe antes que <code>*</code> y <code>/</code>. La <b>asociatividad a derecha</b> se codifica con una regla <b>recursiva a derecha</b>: <code>P → F ** P | F</code> (el no terminal se repite del lado derecho). Comparalo con <code>T → T * F</code>, que es recursiva a izquierda y por eso <code>*</code> asocia a izquierda. Así <code>2 ** 3 ** 2</code> deriva como <code>2 ** (3 ** 2)</code>.</p>`},
      {q:"V/F justificando: «a <=> b <=> c es una expresión válida en tu lenguaje.»",
       a:`<p><b>Falso.</b> El operador <code>&lt;=&gt;</code> es <b>no asociativo</b>: encadenar dos comparaciones de tres vías sin paréntesis es un <b>error de sintaxis</b>. La gramática se escribe con una regla no recursiva para ese operador, de modo que no puede volver a aplicarse sin paréntesis. Sí sería válido <code>(a &lt;=&gt; b) &lt;=&gt; c</code>, porque el paréntesis reinicia una expresión.</p>`},
      {q:"En qué etapa detectás cada error: (a) el exponente de ** es un float; (b) escribir a <=> b sin paréntesis dos veces; (c) el resultado de a**b se pasa de 32767 con base entera.",
       a:`<p>(a) <b>Semántico</b>: el tipo del exponente se chequea con la tabla de síntesis; debe ser entero. (b) <b>Sintáctico</b>: el encadenamiento sin paréntesis no encaja en la gramática no asociativa. (c) <b>Semántico o ejecución</b>: si base y exponente son constantes, el compilador puede detectar el desborde de cota en compilación; si dependen de variables, recién se conoce en ejecución.</p>`}
    ]
  },
  {
    id:"15.4", titulo:"Cómo se evalúa: las 3 entregas y la checklist de autocorrección", aho:"Consigna TP 2C2026", badges:["🎯"], estado:"dictada",
    html:`
<p>Cerramos con el mapa de tu evaluación, que además es un checklist de estudio buenísimo: si podés explicar cada ítem, entendés toda la materia.</p>

<h3>Las tres entregas (siguen la cadena del compilador)</h3>
<ol>
<li><b>Entrega 1 — AL y AS (autocorrección)</b>: analizador léxico + sintáctico + tabla de símbolos. Es el <b>front-end</b> (Módulos 1 a 7).</li>
<li><b>Entrega 2 — GCI</b>: generación de código intermedio en tu notación (polaca inversa). Módulos 8, 9 y 11.</li>
<li><b>Entrega 3 — Assembler y binario</b>: código final con coprocesador. Módulo 12.</li>
</ol>
<p>Más un <b>coloquio grupal</b>. Fijate que las entregas son literalmente las fases del compilador en orden: front-end → intermedia → back-end.</p>

<h3>La checklist de autocorrección (Entrega 1)</h3>
<p>La cátedra te da exactamente qué mira. Cada ítem es un tema de la materia:</p>
<ul>
<li><b>Léxico</b>: validación de longitud de strings, cotas de INT y FLOAT, error de carácter inválido, comentarios. → Módulos 1–3 y lección 15.1.</li>
<li><b>Tabla de símbolos</b>: guardar identificadores y constantes, su tipo y longitud, y <b>omitir duplicados</b>. → lección 1.3.</li>
<li><b>Sintáctico</b>: declaración de variables (incluida la de varias en una línea), condiciones simples y compuestas (AND/OR/NOT), WRITE, READ, IF con y sin ELSE, IF anidado, WHILE. → Módulos 4–7 y 11.</li>
<li><b>Temas especiales</b>: matchPatterns y powerSpaceship. → lecciones 15.2 y 15.3.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 por qué esto te sirve para el parcial</span>
La consigna oficial dice que el parcial evalúa "relacionar los conceptos con el desarrollo del proyecto compilador". Traducido: te pueden pedir "¿en qué etapa detectás que se declara dos veces la misma variable?" (semántico, consultando la tabla de símbolos) o "¿en qué regla incorporás el WHILE?" (en la gramática del sintáctico, con su acción semántica que arma el salto). Tener el checklist claro es tener media respuesta.</div>

<h3>La cadena completa, con tu proyecto</h3>
<pre><code>tu programa .txt en L1_aho
   │  Léxico (Flex): tokens + cotas + tabla de símbolos
   ▼  tokens
   │  Sintáctico (Bison): gramática + when/**/&lt;=&gt; + validaciones
   ▼  lista de reglas
   │  Acciones semánticas: polaca inversa (tu notación)
   ▼  código intermedio
   │  Generación: Assembler + coprocesador
   ▼  binario</code></pre>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Tres entregas = las fases del compilador en orden: front-end → GCI → Assembler, más coloquio.</li>
<li>🎯 La checklist de autocorrección es el temario aplicado: cada ítem es un concepto (cotas, tabla de símbolos, IF anidado, WHILE, temas especiales).</li>
<li>El parcial relaciona la teoría con el proyecto: preparate para "¿en qué etapa/regla…?" sobre tu propio lenguaje.</li>
</ul>`,
    qa:[
      {q:"¿En qué etapa y con qué estructura detectás que un programa declara dos veces la misma variable? (ítem «se omiten duplicados en TS»)",
       a:`<p>En la etapa <b>semántica</b> (durante el análisis, al procesar las declaraciones), consultando la <b>tabla de símbolos</b>: antes de dar de alta un identificador se verifica si ya existe. Si ya está, no se agrega de nuevo (se omite el duplicado) o se reporta según la consigna. La tabla de símbolos es la estructura que hace posible esa detección; el léxico solo la crea, el semántico la consulta.</p>`},
      {q:"Relacioná cada entrega del TP con las fases del compilador y con los módulos de teoría.",
       a:`<p><b>Entrega 1 (AL + AS + tabla de símbolos)</b> = front-end: análisis léxico, sintáctico y semántico → Módulos 1–7. <b>Entrega 2 (GCI)</b> = generación de código intermedio en polaca inversa → Módulos 8, 9 y 11. <b>Entrega 3 (Assembler + binario)</b> = back-end con coprocesador → Módulo 12. Son las fases de la cadena del compilador en orden.</p>`},
      {q:"El parcial pregunta: «¿en qué regla de la gramática incorporarías el manejo del WHILE y qué genera su acción semántica?» Respondé.",
       a:`<p>En la <b>regla del sintáctico que reconoce el while</b> (algo como <code>WHILE → while ( C ) { PROG }</code>). Su <b>acción semántica</b> arma, en polaca inversa, el ciclo con la <b>pila de celdas</b> (Módulo 11): apila la celda de comienzo (a dónde volver), evalúa la condición, apila la celda del salto de salida (<code>BF</code>), y al cerrar el ciclo rellena hacia atrás el salto de salida y agrega el salto incondicional de vuelta al comienzo. Es el mecanismo de backpatching aplicado al while.</p>`}
    ]
  }
]});
