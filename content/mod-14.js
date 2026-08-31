M.push({ id:14, titulo:"Cierre y simulacros", parcial:"—", resumen:"Simulacros cronometrados de ambos parciales y repaso de trampas.", lecciones:[
  {
    id:"14.1", titulo:"Simulacro Parcial I completo", aho:"Parciales 2016/2018/2024", badges:["⚙️"], estado:"dictada",
    html:`
<p>Este es un <b>simulacro cronometrado</b> del Parcial I. Hacelo con reloj, sin mirar el material, y recién después corregí contra las lecciones de los módulos 1 a 7. La idea no es que “te salga”, sino <b>detectar dónde te trabás</b>.</p>

<h3>Cómo se arma el Parcial I (verificado en parciales viejos)</h3>
<ol>
<li><b>Expresiones regulares + acción léxica</b> de un formato inventado (código postal, patente, coordenadas <code>99:45%33:27#</code>): bloque CONJUNTO, tabla TOKEN/EXP.REG., y la acción léxica con la validación de cotas/longitud.</li>
<li><b>Escribir una gramática / BNF</b> desde un enunciado en palabras (listas anidadas con paréntesis, admitiendo vacía).</li>
<li><b>Parsing ascendente SLR completo</b>: aumentar → primeros → siguientes → estados → GOTO → desplazamientos → reducciones → tabla (con el orden de columnas que te den) → decir si hay conflictos.</li>
<li><b>Preguntas conceptuales a justificar</b>: “¿en qué etapa se detecta X?”, “¿es posible que el léxico llegue a estado final y arroje ‘char inválido’?”, “¿por qué se aumenta la gramática?”.</li>
</ol>

<div class="callout tgt"><span class="lab">🎯 checklist de cierre — no perder puntos por incompleto</span>
Dibujá la <b>tabla SLR entera</b> (no “las celdas importantes”). Marcá la <b>celda de aceptación</b>. Escribí explícitamente <b>“no hay conflictos”</b> (o cuáles hay y de qué tipo). En las ER, que la <b>cota/longitud</b> esté en la acción léxica, no en la expresión. Y cada V/F, <b>justificado</b> nombrando la etapa o la estructura de datos.</div>

<h3>Enunciado de práctica</h3>
<p>Date 90 minutos:</p>
<ul>
<li><b>Ej. 1.</b> Definí con ER un token <code>HORA</code> con formato <code>hh:mm</code> (00 a 23 / 00 a 59), con acción léxica que rechace fuera de rango.</li>
<li><b>Ej. 2.</b> Gramática para expresiones de suma y producto con paréntesis, no ambigua, que respete precedencia y asociatividad izquierda.</li>
<li><b>Ej. 3.</b> Para <code>S → L E fin; L → L , id | id; E → := exp</code>: aumentá, calculá primeros/siguientes, armá los estados y la tabla SLR, y decí si hay conflictos.</li>
<li><b>Ej. 4.</b> ¿En qué etapa se detecta: (a) un identificador de 40 caracteres cuando el máximo es 32; (b) usar una variable sin declarar; (c) un paréntesis sin cerrar?</li>
</ul>`,
    qa:[
      {q:"Antes de entregar el Parcial I, ¿qué cuatro cosas revisás para no perder puntos por incompletitud?",
       a:`<p>(1) La <b>tabla SLR completa</b>, con la celda de aceptación marcada. (2) Declarar explícitamente <b>“no hay conflictos”</b> o cuáles hay y de qué tipo (D-R / R-R). (3) En las ER, que la <b>cota o longitud</b> esté en la <b>acción léxica</b>, no en la expresión regular. (4) Cada respuesta conceptual <b>justificada</b> nombrando etapa/estructura, no solo “sí/no”.</p>`},
      {q:"Resolvé el Ej. 4: ¿en qué etapa se detecta cada error?",
       a:`<p>(a) Identificador demasiado largo → <b>léxico</b> (acción léxica, en compilación). (b) Variable sin declarar → <b>semántico</b> (se consulta la tabla de símbolos, en compilación). (c) Paréntesis sin cerrar → <b>sintáctico</b> (ninguna regla completa la estructura, en compilación).</p>`},
      {q:"En el Ej. 3, ¿por qué el primer paso es aumentar la gramática y qué significa que «no haya conflictos»?",
       a:`<p>Se <b>aumenta</b> agregando <code>S' → S</code> para tener una única regla del símbolo distinguido y así un único criterio de aceptación (punto al final de <code>S'</code> con <code>$</code>). <b>No hay conflictos</b> significa que ninguna celda de la tabla tiene a la vez un desplazamiento y una reducción (D-R) ni dos reducciones (R-R): con cada estado y token el parser sabe qué hacer de forma única, o sea la gramática es SLR.</p>`}
    ]
  },
  {
    id:"14.2", titulo:"Simulacro Parcial II completo", aho:"Parciales 2021/2023/2024", badges:["⚙️"], estado:"dictada",
    html:`
<p>Simulacro cronometrado del Parcial II. El corazón es siempre el mismo: te dan un <b>comando inventado</b> con su gramática y tenés que generar la <b>notación intermedia asignada</b> con sus acciones semánticas, y responder preguntas de tipos y optimización.</p>

<h3>Cómo se arma el Parcial II</h3>
<ol>
<li><b>Acciones semánticas</b> de un comando nuevo (<code>OPLIST</code>, <code>PerformList</code>, <code>ALTERLIST</code>, <code>SWAP</code>…): dar el <b>pseudocódigo</b> equivalente, la <b>lista de reglas</b> de un ejemplo, las <b>acciones</b> que generan la notación (polaca / tercetos / árbol) y el <b>dibujo</b> de la notación numerada.</li>
<li><b>Traducción a Assembler</b> de esa intermedia, con el <b>coprocesador</b> (<code>FLD</code>, <code>FADD</code>, <code>FSTP @aux</code>, <code>FCOMP</code> + <code>FSTSW AX</code> + <code>SAHF</code>).</li>
<li><b>Tipos</b>: compatibilidad, conversiones implícitas/explícitas, tabla de síntesis, y “¿en qué regla incorporarías el chequeo de tipos?”.</li>
<li><b>Optimización</b>: los <b>tres momentos</b> (a la entrada / en la intermedia / a la salida), redundancia sobre tercetos, “¿es posible detectar en compilación el caso X?”.</li>
</ol>

<div class="callout tgt"><span class="lab">🎯 el orden que evita perderse</span>
En el ejercicio de acciones semánticas, resolvé en este orden: (1) <b>pseudocódigo</b> del comando; (2) <b>lista de reglas</b> del ejemplo; (3) <b>en qué regla</b> va cada acción y qué genera; (4) <b>dibujo</b> de la notación con celdas numeradas. Si arrancás dibujando sin el pseudocódigo, te perdés.</div>

<h3>Enunciado de práctica</h3>
<p>Date 90 minutos con el comando <code>SWAP(a, b)</code> que intercambia dos variables:</p>
<ul>
<li><b>Ej. 1.</b> Escribí el pseudocódigo, la gramática, y las acciones semánticas que generan la <b>polaca</b> (con la celda auxiliar del intercambio).</li>
<li><b>Ej. 2.</b> Pasá esa polaca a Assembler con el coprocesador.</li>
<li><b>Ej. 3.</b> ¿Hace falta contemplar conversiones implícitas <b>dentro</b> del comando SWAP? Justificá.</li>
<li><b>Ej. 4.</b> Para <code>a := 2*3*4*z</code>, aplicá reducción simple y decí en cuál de los tres momentos conviene.</li>
</ul>`,
    qa:[
      {q:"En un ejercicio de acciones semánticas para un comando nuevo, ¿en qué orden conviene resolver?",
       a:`<p>(1) El <b>pseudocódigo</b> equivalente del comando; (2) la <b>lista de reglas</b> de un ejemplo concreto; (3) <b>en qué regla</b> va cada acción semántica y qué genera; (4) el <b>dibujo</b> de la notación intermedia (polaca/tercetos/árbol) con celdas numeradas. Ese orden evita empezar a dibujar sin entender qué hace el comando.</p>`},
      {q:"Resolvé el Ej. 3: ¿hace falta contemplar conversiones implícitas dentro del comando SWAP?",
       a:`<p><b>No.</b> Las conversiones implícitas las gestiona el <b>compilador</b> como parte de las reglas <b>generales</b> de expresiones y asignación, así que valen para <b>todo el lenguaje</b>, no para un comando puntual. <code>SWAP</code> solo intercambia valores; a lo sumo importarían en una <b>asignación posterior</b>, no en el intercambio en sí.</p>`},
      {q:"Resolvé el Ej. 4: reducción simple de a := 2*3*4*z y momento recomendado.",
       a:`<p><code>a := 2*3*4*z → a := 24*z</code>: se resuelven en compilación las operaciones <b>entre constantes</b> (constant folding). Conviene hacerlo <b>a la entrada</b> (dentro de la acción semántica, antes de escribir la notación), porque además <b>habilita</b> la optimización por redundancia que se aplica después sobre la intermedia (enhebrado).</p>`}
    ]
  },
  {
    id:"14.3", titulo:"Repaso de trampas + tanda «¿en qué etapa?»", aho:"temario-resumen", badges:["⚙️"], estado:"dictada",
    html:`
<p>Repaso relámpago de las trampas de V/F más frecuentes. Leé cada una y tapá la explicación: tenés que poder justificar la palabra exacta que la hace verdadera o falsa.</p>

<h3>Las trampas que más se repiten</h3>
<ul>
<li>El AL entrega tokens <b>a pedido</b>, no una lista completa.</li>
<li>Las <b>palabras reservadas no van</b> a la tabla de símbolos (solo lo que tiene más de un lexema).</li>
<li>Si el autómata llegó al <b>estado final</b>, ya reconoció el token: no puede tirar “char inválido” (eso lo tira la acción léxica por cota/longitud).</li>
<li><b>Dos árboles</b> para una sentencia ⇒ gramática ambigua ⇒ se corrige <b>cambiando las reglas</b>.</li>
<li>El <b>descendente</b> no soporta recursión izquierda; <b>LL(1)</b> exige factorizar.</li>
<li>El <b>ascendente</b> exige gramática <b>aumentada</b>; las reducciones van en las columnas de <b>SIGUIENTE</b>.</li>
<li>Una celda con D y R (o dos R) ⇒ <b>conflicto</b> ⇒ no es SLR.</li>
<li>El parser devuelve la <b>lista de reglas</b>, no un árbol.</li>
<li><b>INORDER</b> del árbol = programa; <b>POSTORDER</b> = polaca.</li>
<li><b>Las declaraciones no generan código intermedio</b>, pero actualizan el tipo en la tabla de símbolos.</li>
<li><code>generaAssembler()</code> se invoca <b>una sola vez</b>, desde la regla del start.</li>
<li>El coprocesador <b>no hace FLD de una constante literal</b> ⇒ se declara como variable (<code>_25 dd 25</code>).</li>
<li>Las conversiones <b>implícitas valen para todo el lenguaje</b>; un <b>truncamiento no es una conversión</b>.</li>
<li>En polaca <b>no se borran celdas</b> al optimizar (baja lógica), o se rompen los saltos.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 el patrón de las preguntas «¿en qué etapa?»</span>
Léxico (carácter/comentario/cota), sintáctico (la forma no encaja en ninguna regla), semántico/GCI (tipos, variable no declarada — consulta la tabla de símbolos), Assembler (cuestiones de la máquina), ejecución (lo que depende de un dato, como dividir por una variable que vale 0). La clave es siempre: <b>¿qué información tiene disponible cada etapa?</b></div>`,
    qa:[
      {q:"¿En qué etapa se detecta: (a) identificador demasiado largo; (b) paréntesis sin cerrar; (c) sumar un entero con un puntero; (d) división por cero con divisor variable?",
       a:`<p>(a) <b>Léxico</b> (acción léxica, compilación). (b) <b>Sintáctico</b> (compilación). (c) <b>Semántico</b> (chequeo de tipos, compilación). (d) <b>Ejecución</b> (el divisor solo se conoce corriendo el programa).</p>`},
      {q:"V/F justificando: «El resultado del análisis sintáctico ascendente es el árbol sintáctico ya construido en memoria.»",
       a:`<p><b>Falso.</b> El ascendente devuelve la <b>lista de reglas</b> reducidas; el árbol es <b>abstracto</b> y solo se construye si vos lo armás en las acciones semánticas con <code>crear_nodo</code>/<code>crear_hoja</code>. El parser por sí solo no deja un árbol en memoria.</p>`},
      {q:"V/F justificando: «Una gramática ambigua se arregla eligiendo siempre el árbol de la izquierda.»",
       a:`<p><b>Falso.</b> Elegir un árbol es un parche del generador (Yacc lo hace con precedencias), pero la <b>gramática sigue siendo ambigua</b>. La solución conceptual es <b>reescribir las reglas</b> —típicamente estratificando en niveles E, T, F— para que cada sentencia tenga un único árbol.</p>`}
    ]
  }
]});
