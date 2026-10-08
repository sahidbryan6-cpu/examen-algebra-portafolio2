/**
 * Datos del examen "Portafolio 2 de Álgebra".
 *
 * Convenciones:
 * - Los textos admiten matemática en línea entre signos $...$ (se dibuja con KaTeX).
 * - `original` y `answer` están escritos para el motor (js/math-engine.js); las pruebas
 *   automáticas verifican que original ≡ answer y que cada paso con `expr` también lo es.
 * - Un paso usa `expr` (resultado parcial verificable) o `tex` (fórmula ilustrativa).
 */

/* ------------------------------------------------------------------ */
/* Temas                                                               */
/* ------------------------------------------------------------------ */
export const TOPICS = {
  T1: {
    name: 'Suma de polinomios',
    short: 'términos semejantes',
    idea: 'Sumar polinomios es juntar en un solo polinomio todo lo que tienen varios. Sirve para simplificar cualquier expresión algebraica: casi todos los ejercicios de álgebra terminan reduciendo términos semejantes.',
    formula: {
      tex: 'a\\,x^{n} + b\\,x^{n} = (a+b)\\,x^{n}',
      parts: [
        '$a$ y $b$ son los coeficientes: los números que multiplican a la letra.',
        '$x^{n}$ es la parte literal (letra con su exponente). Debe ser idéntica en los dos términos para poder sumarlos.',
        'El signo $+$ indica que solo se suman los coeficientes; el exponente $n$ se queda igual.',
      ],
    },
    commonError: 'Sumar también los exponentes ($3x^2+2x^2=5x^4$ es incorrecto; lo correcto es $5x^2$) o juntar términos que no son semejantes ($x^3$ con $x^2$). Para evitarlo, antes de sumar subraya con el mismo color los términos que tienen exactamente la misma letra y el mismo exponente.',
  },
  T2: {
    name: 'Resta de polinomios',
    short: 'cambio de signo',
    idea: 'Restar polinomios es encontrar cuánto le falta o le sobra a uno respecto de otro. Es la base para despejar ecuaciones y comparar expresiones.',
    formula: {
      tex: 'A - (B) = A + (-B)',
      parts: [
        '$A$ es el minuendo: el polinomio del que se resta (en «de A restar B», es el que va después de «de»).',
        '$B$ es el sustraendo: el polinomio que se resta.',
        'El signo $-$ delante del paréntesis multiplica por $-1$ a CADA término de $B$: los $+$ se vuelven $-$ y los $-$ se vuelven $+$.',
      ],
    },
    commonError: 'Cambiar el signo solo del primer término del sustraendo y dejar los demás igual. Para evitarlo, reescribe el sustraendo completo con todos sus signos cambiados antes de reducir.',
  },
  T3: {
    name: 'Multiplicación de polinomios',
    short: 'propiedad distributiva',
    idea: 'Multiplicar polinomios convierte un producto de paréntesis en una suma de términos. Sirve para desarrollar expresiones y es el camino inverso de factorizar.',
    formula: {
      tex: '(a+b)(c+d) = ac + ad + bc + bd \\qquad x^{m}\\cdot x^{n} = x^{m+n}',
      parts: [
        '$a, b$ son los términos del primer polinomio y $c, d$ los del segundo: cada uno del primero multiplica a cada uno del segundo.',
        'Al multiplicar términos: los coeficientes se multiplican y las potencias de la misma base suman sus exponentes ($m+n$).',
        'Ley de los signos: $(+)(+)=+$, $(-)(-)=+$, $(+)(-)=-$.',
      ],
    },
    commonError: 'Olvidar algún producto (por ejemplo, multiplicar solo «primero por primero» y «último por último»). Para evitarlo, cuenta: un binomio por un binomio da 4 productos; un binomio por un trinomio da 6.',
  },
  T4: {
    name: 'División de polinomios y suma de cubos',
    short: 'suma de cubos',
    idea: 'Dividir polinomios es encontrar el polinomio que, multiplicado por el divisor, da el dividendo. Reconocer una suma de cubos permite dividir en un solo paso.',
    formula: {
      tex: '\\dfrac{a^{3}+b^{3}}{a+b} = a^{2} - ab + b^{2}',
      parts: [
        '$a$ y $b$ son las raíces cúbicas de cada término del dividendo ($a^3$ y $b^3$).',
        'El cociente tiene el primer término al cuadrado, MENOS el producto $ab$, MÁS el segundo término al cuadrado.',
        'El signo $-$ de $ab$ es obligatorio: es lo que hace que, al multiplicar por $(a+b)$, se cancelen los términos centrales.',
      ],
    },
    commonError: 'Escribir $a^2+ab+b^2$ (signo $+$ en el término central). Ese trinomio corresponde a la diferencia de cubos $a^3-b^3$, no a la suma. Comprueba multiplicando el cociente por el divisor.',
  },
  T5: {
    name: 'Binomio al cuadrado',
    short: 'binomio al cuadrado',
    idea: 'El cuadrado de un binomio es un producto notable: se desarrolla con una fórmula fija, sin multiplicar término por término. Aparece al resolver ecuaciones cuadráticas y al completar cuadrados.',
    formula: {
      tex: '(a \\pm b)^{2} = a^{2} \\pm 2ab + b^{2}',
      parts: [
        '$a$ es el primer término del binomio y $b$ el segundo (sin su signo).',
        '$2ab$ es el doble producto: aparece porque $(a+b)(a+b)=a^2+ab+ba+b^2$ y los dos productos cruzados $ab+ba$ suman $2ab$.',
        'El signo del término central es el mismo del binomio; $b^2$ siempre es positivo.',
      ],
    },
    commonError: 'Escribir solo $a^2+b^2$ y olvidar el doble producto $2ab$. Recuerda: elevar al cuadrado NO se reparte sobre una suma; el resultado de un binomio al cuadrado siempre es un trinomio.',
  },
  T6: {
    name: 'Binomios conjugados',
    short: 'binomios conjugados',
    idea: 'Dos binomios conjugados tienen los mismos términos y solo cambian el signo del segundo. Su producto es una diferencia de cuadrados; sirve para simplificar y para racionalizar.',
    formula: {
      tex: '(a+b)(a-b) = a^{2} - b^{2}',
      parts: [
        '$a$ es el término que se repite con el mismo signo en ambos binomios.',
        '$b$ es el término que cambia de signo.',
        'No hay término central: los productos cruzados $-ab$ y $+ab$ se cancelan. El resultado siempre es «cuadrado del primero MENOS cuadrado del segundo».',
      ],
    },
    commonError: 'Agregar un término central como si fuera un binomio al cuadrado. En el producto de conjugados los términos centrales se anulan; el resultado tiene solo dos términos.',
  },
  T7: {
    name: 'Producto de binomios con término común',
    short: 'término común',
    idea: 'Cuando dos binomios comparten un término, su producto se obtiene con una fórmula rápida. Es la base para factorizar trinomios de la forma $x^2+bx+c$.',
    formula: {
      tex: '(m+p)(m+q) = m^{2} + (p+q)\\,m + pq',
      parts: [
        '$m$ es el término común (aparece igual en ambos binomios).',
        '$p$ y $q$ son los términos no comunes, cada uno con su signo.',
        '$(p+q)$ es la suma de los no comunes y multiplica al término común; $pq$ es su producto (ley de los signos).',
      ],
    },
    commonError: 'Multiplicar la suma $(p+q)$ solo por la letra y olvidar el coeficiente del término común. Si el término común es $5x^{2n}$, el término central es $(p+q)\\cdot 5x^{2n}$, no $(p+q)\\,x^{2n}$.',
  },
  T8: {
    name: 'Binomio al cubo',
    short: 'binomio al cubo',
    idea: 'El cubo de un binomio es un producto notable de cuatro términos. Permite desarrollar potencias sin multiplicar tres veces el binomio.',
    formula: {
      tex: '(a \\pm b)^{3} = a^{3} \\pm 3a^{2}b + 3ab^{2} \\pm b^{3}',
      parts: [
        '$a$ es el primer término y $b$ el segundo (sin su signo).',
        'Los exponentes de $a$ bajan $3,2,1,0$ y los de $b$ suben $0,1,2,3$; los coeficientes $1,3,3,1$ salen del triángulo de Pascal.',
        'Con $(a-b)^3$ los signos se alternan: $+,-,+,-$ (los términos con potencia impar de $b$ son negativos).',
      ],
    },
    commonError: 'Escribir solo $a^3-b^3$ y olvidar los dos términos intermedios $3a^2b$ y $3ab^2$. El cubo de un binomio siempre tiene cuatro términos.',
  },
  T9: {
    name: 'Factor común',
    short: 'factor común',
    idea: 'Factorizar por factor común es escribir un polinomio como producto, sacando lo que todos los términos comparten. Es el primer paso de cualquier factorización.',
    formula: {
      tex: 'ab + ac = a\\,(b + c)',
      parts: [
        '$a$ es el factor común: el máximo común divisor de los coeficientes y las letras que aparecen en TODOS los términos, con su menor exponente.',
        '$b$ y $c$ son lo que queda de cada término después de dividirlo entre $a$.',
        'El signo de cada término se conserva dentro del paréntesis.',
      ],
    },
    commonError: 'No dividir todos los términos (por ejemplo, olvidar el término independiente) o sacar una letra que no aparece en todos. Comprueba siempre multiplicando: debes recuperar el polinomio original.',
  },
  T10: {
    name: 'Factorización por agrupación',
    short: 'agrupación',
    idea: 'Cuando no hay un factor común a todos los términos pero sí a grupos de ellos, se agrupan para que aparezca un binomio repetido. Sirve para factorizar polinomios de cuatro términos.',
    formula: {
      tex: 'ax + ay + bx + by = a(x+y) + b(x+y) = (x+y)(a+b)',
      parts: [
        'Se forman grupos de dos términos que tengan un factor común ($a$ en el primero, $b$ en el segundo).',
        'Al sacar el factor común de cada grupo debe quedar el MISMO paréntesis $(x+y)$.',
        'Ese paréntesis repetido es ahora un factor común de toda la expresión.',
      ],
    },
    commonError: 'Quedarse en $a(x+y)+b(x+y)$: eso todavía es una suma, no un producto. Falta sacar el binomio común $(x+y)$.',
  },
};

export const TOPIC_IDS = Object.keys(TOPICS);

/* ------------------------------------------------------------------ */
/* Parte práctica (enunciados del Portafolio 2, sin cambios)            */
/* ------------------------------------------------------------------ */
export const PRACTICE = [
  {
    id: 'p1', topic: 'T1', kind: 'expand',
    statement: 'Hallar la suma: $(5x^3-7x^2+8x) + (3x^3-8x^2+3) + (8x^2+3x+2)$',
    original: '(5x^3-7x^2+8x)+(3x^3-8x^2+3)+(8x^2+3x+2)',
    answer: '8x^3-7x^2+11x+5',
    errors: [
      { id: 'exp-sumados', expr: '8x^6-7x^4+11x^2+5', msg: 'Sumaste los exponentes. En una suma solo se suman los coeficientes; la letra y su exponente se conservan.' },
      { id: 'signo-8x2', expr: '8x^3-23x^2+11x+5', msg: 'Restaste el $+8x^2$ del tercer polinomio en lugar de sumarlo. Revisa los signos al agrupar los términos semejantes.' },
      { id: 'olvido-const', expr: '8x^3-7x^2+11x+3', msg: 'Te faltó sumar el término independiente $+2$ del tercer polinomio.' },
      { id: 'olvido-const2', expr: '8x^3-7x^2+11x+2', msg: 'Te faltó sumar el término independiente $+3$ del segundo polinomio.' },
    ],
    steps: [
      { do: 'Elimino los paréntesis y copio cada término con su mismo signo.', why: 'Un paréntesis precedido de $+$ se puede quitar sin cambiar ningún signo (sumar es agregar tal cual).', for: 'Tener todos los términos sueltos para poder compararlos.', expr: '5x^3-7x^2+8x+3x^3-8x^2+3+8x^2+3x+2' },
      { do: 'Identifico los términos semejantes (misma letra con el mismo exponente). Grupo $x^3$: $5x^3$ y $3x^3$. Grupo $x^2$: $-7x^2$, $-8x^2$ y $+8x^2$. Grupo $x$: $8x$ y $3x$. Números solos: $3$ y $2$.', why: 'Las propiedades conmutativa y asociativa permiten cambiar el orden y agrupar los sumandos sin alterar el resultado.', for: 'Juntar lo que sí se puede sumar entre sí.', expr: '(5x^3+3x^3)+(-7x^2-8x^2+8x^2)+(8x+3x)+(3+2)' },
      { do: 'Sumo los coeficientes de cada grupo y conservo la letra con su exponente: $5+3=8$; $-7-8+8=-7$; $8+3=11$; $3+2=5$.', why: 'Propiedad distributiva: $5x^3+3x^3=(5+3)x^3$. Los exponentes no cambian en una suma.', for: 'Reducir cada grupo a un solo término.', expr: '8x^3-7x^2+11x+5' },
      { do: 'Reviso que no quede ningún par de términos semejantes y ordeno de mayor a menor exponente.', why: 'Un polinomio está simplificado cuando cada parte literal aparece una sola vez.', for: 'Presentar el resultado en forma estándar.', expr: '8x^3-7x^2+11x+5' },
    ],
    verifyVals: { x: 2 },
    summary: 'Para sumar polinomios se quitan los paréntesis y se suman solo los coeficientes de los términos semejantes.',
  },
  {
    id: 'p2', topic: 'T2', kind: 'expand',
    statement: 'Hallar la resta: de $3x^3-5x^2+3$ restar $-4x^3+7x^2-5$',
    original: '(3x^3-5x^2+3)-(-4x^3+7x^2-5)',
    answer: '7x^3-12x^2+8',
    errors: [
      { id: 'sin-cambio', expr: '-x^3+2x^2-2', msg: 'No cambiaste los signos del sustraendo: sumaste los polinomios en lugar de restarlos.' },
      { id: 'cambio-parcial-1', expr: '7x^3+2x^2-2', msg: 'No cambiaste todos los signos: solo cambiaste el del primer término del sustraendo. El signo menos afecta a cada término.' },
      { id: 'cambio-parcial-2', expr: '7x^3-12x^2-2', msg: 'No cambiaste todos los signos: el $-5$ del sustraendo debía pasar a $+5$.' },
      { id: 'cambio-parcial-3', expr: '-x^3-12x^2+8', msg: 'No cambiaste todos los signos: el $-4x^3$ del sustraendo debía pasar a $+4x^3$.' },
      { id: 'orden-invertido', expr: '-7x^3+12x^2-8', msg: 'Invertiste el orden: «de A restar B» es A − B, no B − A. Por eso todos tus signos salieron al revés.' },
    ],
    steps: [
      { do: 'Traduzco el enunciado: «de A restar B» significa $A-B$. El minuendo es $3x^3-5x^2+3$ y el sustraendo es $-4x^3+7x^2-5$.', why: 'Lo que va después de «de» es lo que se tiene; lo que se «resta» se quita.', for: 'Escribir la operación en el orden correcto; si se invierte, todos los signos salen al revés.', expr: '(3x^3-5x^2+3)-(-4x^3+7x^2-5)' },
      { do: 'Quito el paréntesis del sustraendo cambiando el signo de TODOS sus términos: $-4x^3\\to+4x^3$, $+7x^2\\to-7x^2$, $-5\\to+5$.', why: 'Restar es sumar el opuesto: $A-B=A+(-B)$. El signo $-$ delante del paréntesis multiplica por $-1$ cada término.', for: 'Convertir la resta en una suma, que ya sabemos reducir.', expr: '3x^3-5x^2+3+4x^3-7x^2+5' },
      { do: 'Agrupo los términos semejantes: $3x^3$ con $4x^3$; $-5x^2$ con $-7x^2$; $3$ con $5$.', why: 'Conmutativa y asociativa de la suma.', for: 'Dejar juntos los términos que se pueden reducir.', expr: '(3x^3+4x^3)+(-5x^2-7x^2)+(3+5)' },
      { do: 'Sumo los coeficientes: $3+4=7$; $-5-7=-12$ (dos negativos se suman y conservan el signo $-$); $3+5=8$.', why: 'Distributiva: $3x^3+4x^3=(3+4)x^3$.', for: 'Obtener el resultado reducido.', expr: '7x^3-12x^2+8' },
    ],
    verifyVals: { x: 2 },
    summary: 'Para restar se cambian los signos de todos los términos del sustraendo y luego se suman los términos semejantes.',
  },
  {
    id: 'p3', topic: 'T3', kind: 'expand',
    statement: 'Resolver la multiplicación de polinomios: $(5x-3)$ por $(3a+5)$',
    original: '(5x-3)(3a+5)',
    answer: '15ax+25x-9a-15',
    errors: [
      { id: 'signos', expr: '15ax+25x+9a+15', msg: 'Error de signo: $(-3)(3a)=-9a$ y $(-3)(5)=-15$; menos por más da menos.' },
      { id: 'signo-ultimo', expr: '15ax+25x-9a+15', msg: 'Error de signo en el último producto: $(-3)(5)=-15$.' },
      { id: 'solo-extremos', expr: '15ax-15', msg: 'Solo multiplicaste primero por primero y último por último. Faltan los productos cruzados $5x\\cdot5$ y $-3\\cdot3a$.' },
      { id: 'reduce-distintos', expr: '15ax+16x-15', msg: 'Juntaste $25x$ y $-9a$ como si fueran semejantes, pero $x$ y $a$ son letras distintas: no se pueden sumar.' },
    ],
    steps: [
      { do: 'Aplico la propiedad distributiva: multiplico cada término del primer binomio ($5x$ y $-3$) por cada término del segundo ($3a$ y $5$). Son $2\\times2=4$ productos.', why: 'Propiedad distributiva: $(a+b)(c+d)=ac+ad+bc+bd$.', for: 'No olvidar ningún producto.', expr: '(5x)(3a)+(5x)(5)+(-3)(3a)+(-3)(5)' },
      { do: 'Multiplico cada pareja: coeficiente por coeficiente y letra por letra. $5\\cdot3=15$ y $x\\cdot a=ax$ → $15ax$; $5\\cdot5=25$ → $25x$; $(-3)(3)=-9$ → $-9a$; $(-3)(5)=-15$.', why: 'Ley de los signos: $(+)(+)=+$ y $(-)(+)=-$. Las letras distintas se escriben juntas (en orden alfabético) porque se multiplican.', for: 'Convertir cada producto en un solo término.', expr: '15ax+25x-9a-15' },
      { do: 'Busco términos semejantes: $ax$, $x$, $a$ y el número tienen partes literales distintas, así que no hay nada que reducir.', why: 'Solo se suman términos con exactamente la misma letra y el mismo exponente; $x$ y $a$ son letras diferentes.', for: 'Confirmar que el resultado ya está simplificado.', expr: '15ax+25x-9a-15' },
    ],
    verifyVals: { x: 2, a: 1 },
    summary: 'Al multiplicar polinomios, cada término del primero multiplica a cada término del segundo, respetando la ley de los signos.',
  },
  {
    id: 'p4', topic: 'T4', kind: 'expand',
    statement: 'Resolver la división de polinomios: $x^3+y^3$ entre $x+y$',
    original: '(x^3+y^3)/(x+y)',
    answer: 'x^2-xy+y^2',
    errors: [
      { id: 'signo-xy', expr: 'x^2+xy+y^2', msg: 'Error de signo en $-xy$: el cociente de una suma de cubos es $x^2-xy+y^2$ (el término central es negativo).' },
      { id: 'cuadrados', expr: 'x^2+y^2', msg: 'Te faltó el término central $-xy$ del cociente.' },
      { id: 'dif-cuadrados', expr: 'x^2-y^2', msg: 'Dividiste exponente entre exponente; la división de polinomios no funciona así. Usa la fórmula de suma de cubos o la división larga.' },
    ],
    steps: [
      { do: 'Reconozco que el dividendo $x^3+y^3$ es una suma de cubos: $x^3$ es el cubo de $x$ e $y^3$ es el cubo de $y$.', why: 'Fórmula de la suma de cubos: $a^3+b^3=(a+b)(a^2-ab+b^2)$, aquí con $a=x$ y $b=y$.', for: 'Poder dividir sin hacer la división larga.', tex: 'x^3+y^3=(x+y)(x^2-xy+y^2)' },
      { do: 'Sustituyo el dividendo por su forma factorizada.', why: 'Una expresión se puede reemplazar por otra equivalente.', for: 'Que aparezca el divisor $(x+y)$ como factor del numerador.', expr: '((x+y)(x^2-xy+y^2))/(x+y)' },
      { do: 'Simplifico el factor $(x+y)$, que está arriba y abajo.', why: 'Una cantidad distinta de cero dividida entre sí misma da $1$: $\\frac{x+y}{x+y}=1$.', for: 'Obtener el cociente.', expr: 'x^2-xy+y^2' },
      { do: 'Compruebo con la división larga: $x^3\\div x=x^2$; $x^2(x+y)=x^3+x^2y$; al restar queda $-x^2y+y^3$. Luego $-x^2y\\div x=-xy$; $-xy(x+y)=-x^2y-xy^2$; al restar queda $xy^2+y^3$. Por último $xy^2\\div x=y^2$; $y^2(x+y)=xy^2+y^3$; residuo $0$.', why: 'Cada término del cociente sale de dividir el primer término del residuo entre el primer término del divisor ($x$); al dividir potencias de la misma base se restan los exponentes.', for: 'Ver de dónde sale el signo negativo de $-xy$.', expr: 'x^2-xy+y^2' },
    ],
    verifyVals: { x: 2, y: 1 },
    summary: 'La suma de cubos dividida entre la suma de las bases da «primero al cuadrado, menos el producto, más segundo al cuadrado».',
  },
  {
    id: 'p5', topic: 'T5', kind: 'expand',
    statement: 'Desarrollar: $(3x^3-9)^2$',
    original: '(3x^3-9)^2',
    answer: '9x^6-54x^3+81',
    errors: [
      { id: 'sin-doble', expr: '9x^6+81', msg: 'Olvidaste el doble producto $2ab$ en el binomio al cuadrado: falta el término $-54x^3$.' },
      { id: 'sin-doble-2', expr: '9x^6-81', msg: 'Olvidaste el doble producto $2ab$ y además $b^2=81$ siempre es positivo.' },
      { id: 'sin-dos', expr: '9x^6-27x^3+81', msg: 'Escribiste $ab$ en lugar de $2ab$: el término central es el DOBLE producto, $2(3x^3)(9)=54x^3$.' },
      { id: 'signo-central', expr: '9x^6+54x^3+81', msg: 'Error de signo: en $(a-b)^2$ el doble producto es negativo, $-54x^3$.' },
      { id: 'exp-sumado', expr: '9x^5-54x^3+81', msg: 'Al elevar $(x^3)^2$ se multiplican los exponentes: $x^{3\\cdot2}=x^6$, no $x^5$.' },
      { id: 'coef-sin-elevar', expr: '3x^6-54x^3+81', msg: 'Olvidaste elevar al cuadrado el coeficiente: $(3x^3)^2=9x^6$.' },
    ],
    steps: [
      { do: 'Identifico un binomio al cuadrado de la forma $(a-b)^2$ con $a=3x^3$ y $b=9$.', why: 'Es un producto notable: se resuelve con la fórmula $(a-b)^2=a^2-2ab+b^2$.', for: 'Evitar multiplicar término por término.', tex: 'a=3x^3,\\qquad b=9' },
      { do: 'Sustituyo $a$ y $b$ en la fórmula.', why: 'La fórmula vale para cualquier valor de $a$ y $b$.', for: 'Saber exactamente qué hay que calcular.', expr: '(3x^3)^2-2(3x^3)(9)+9^2' },
      { do: 'Calculo $a^2$: el coeficiente se eleva al cuadrado ($3^2=9$) y los exponentes se multiplican ($x^{3\\cdot2}=x^6$).', why: 'Potencia de un producto $(ab)^n=a^nb^n$ y potencia de una potencia $(x^m)^n=x^{m\\cdot n}$.', for: 'Obtener el primer término.', tex: '(3x^3)^2=9x^6' },
      { do: 'Calculo el doble producto: $2\\cdot3\\cdot9=54$ y la letra queda $x^3$. Como el binomio es una resta, va con signo $-$.', why: 'El término central de $(a-b)^2$ es $-2ab$.', for: 'Obtener el término central, el que más se olvida.', tex: '-2(3x^3)(9)=-54x^3' },
      { do: 'Calculo $b^2=9^2=81$; siempre es positivo.', why: 'Cualquier número al cuadrado es positivo.', for: 'Obtener el último término.', tex: '9^2=81' },
      { do: 'Junto los tres términos.', why: 'Es el orden de la fórmula.', for: 'Escribir el resultado final.', expr: '9x^6-54x^3+81' },
    ],
    verifyVals: { x: 2 },
    summary: 'Un binomio al cuadrado da un trinomio: cuadrado del primero, menos el doble producto, más el cuadrado del segundo.',
  },
  {
    id: 'p6', topic: 'T6', kind: 'expand',
    statement: 'Desarrollar el producto de binomios conjugados: $(6x^{2n}+3y^{3a})(6x^{2n}-3y^{3a})$',
    original: '(6x^(2n)+3y^(3a))(6x^(2n)-3y^(3a))',
    answer: '36x^(4n)-9y^(6a)',
    errors: [
      { id: 'termino-central', expr: '36x^(4n)-36x^(2n)y^(3a)+9y^(6a)', msg: 'Respondiste con término central, como si fuera un binomio al cuadrado. En los conjugados el término central se cancela.' },
      { id: 'termino-central-2', expr: '36x^(4n)+36x^(2n)y^(3a)-9y^(6a)', msg: 'Respondiste con término central. En los conjugados $+18x^{2n}y^{3a}$ y $-18x^{2n}y^{3a}$ se anulan.' },
      { id: 'termino-central-3', expr: '36x^(4n)+36x^(2n)y^(3a)+9y^(6a)', msg: 'Respondiste con término central, como si fuera un binomio al cuadrado. En los conjugados el término central se cancela.' },
      { id: 'signo-suma', expr: '36x^(4n)+9y^(6a)', msg: 'Error de signo: el producto de conjugados es una DIFERENCIA de cuadrados, $a^2-b^2$.' },
      { id: 'exp-sin-duplicar', expr: '36x^(2n)-9y^(3a)', msg: 'Al elevar al cuadrado se multiplican los exponentes: $(x^{2n})^2=x^{4n}$ y $(y^{3a})^2=y^{6a}$.' },
      { id: 'coef-sin-elevar', expr: '6x^(4n)-3y^(6a)', msg: 'Olvidaste elevar al cuadrado los coeficientes: $6^2=36$ y $3^2=9$.' },
      { id: 'exp-sumado', expr: '36x^(2n+2)-9y^(3a+2)', msg: 'Sumaste 2 al exponente; al elevar al cuadrado el exponente se multiplica por 2.' },
    ],
    steps: [
      { do: 'Identifico que los binomios son conjugados: tienen los mismos términos y solo cambia el signo del segundo. $a=6x^{2n}$, $b=3y^{3a}$.', why: 'Producto notable: $(a+b)(a-b)=a^2-b^2$.', for: 'Usar la fórmula directa.', tex: 'a=6x^{2n},\\qquad b=3y^{3a}' },
      { do: 'Veo por qué no hay término central: al multiplicar todo, los productos cruzados son $-18x^{2n}y^{3a}$ y $+18x^{2n}y^{3a}$.', why: 'Propiedad distributiva; dos términos opuestos suman cero.', for: 'Entender que solo quedan dos términos.', expr: '36x^(4n)-18x^(2n)y^(3a)+18x^(2n)y^(3a)-9y^(6a)' },
      { do: 'Escribo la fórmula con $a$ y $b$ sustituidos.', why: '$(a+b)(a-b)=a^2-b^2$.', for: 'Calcular solo dos cuadrados.', expr: '(6x^(2n))^2-(3y^(3a))^2' },
      { do: 'Elevo al cuadrado: $6^2=36$ y $(x^{2n})^2=x^{2n\\cdot2}=x^{4n}$; $3^2=9$ y $(y^{3a})^2=y^{6a}$.', why: 'Potencia de una potencia: los exponentes se multiplican, también cuando son literales.', for: 'Obtener el resultado.', expr: '36x^(4n)-9y^(6a)' },
    ],
    verifyVals: { x: 2, y: 1, n: 1, a: 1 },
    summary: 'El producto de binomios conjugados es el cuadrado del primero menos el cuadrado del segundo, sin término central.',
  },
  {
    id: 'p7', topic: 'T7', kind: 'expand',
    statement: 'Resolver el producto: $(5x^{2n}+2)(5x^{2n}-3)$',
    original: '(5x^(2n)+2)(5x^(2n)-3)',
    answer: '25x^(4n)-5x^(2n)-6',
    errors: [
      { id: 'sin-coef', expr: '25x^(4n)-x^(2n)-6', msg: 'Multiplicaste la suma $(2-3)$ solo por $x^{2n}$: también debe multiplicar al coeficiente 5. El término central es $-5x^{2n}$.' },
      { id: 'signo-central', expr: '25x^(4n)+5x^(2n)-6', msg: 'Error de signo en el término central: $2+(-3)=-1$, así que queda $-5x^{2n}$.' },
      { id: 'signo-final', expr: '25x^(4n)-5x^(2n)+6', msg: 'Error de signo: $(2)(-3)=-6$.' },
      { id: 'sin-central', expr: '25x^(4n)-6', msg: 'Olvidaste el término central $(p+q)m$. Ese término solo desaparece en los binomios conjugados.' },
      { id: 'exp', expr: '25x^(2n)-5x^(2n)-6', msg: 'Al elevar $(x^{2n})^2$ los exponentes se multiplican: $x^{4n}$.' },
    ],
    steps: [
      { do: 'Identifico el término común $m=5x^{2n}$ y los no comunes $p=2$ y $q=-3$ (cada uno con su signo).', why: 'Producto notable: $(m+p)(m+q)=m^2+(p+q)m+pq$.', for: 'Usar la fórmula en vez de distribuir.', tex: 'm=5x^{2n},\\quad p=2,\\quad q=-3' },
      { do: 'Sustituyo en la fórmula.', why: 'La fórmula vale para cualquier término común.', for: 'Ver los tres cálculos que faltan.', expr: '(5x^(2n))^2+(2-3)(5x^(2n))+(2)(-3)' },
      { do: 'Calculo cada parte: $(5x^{2n})^2=25x^{4n}$ (coeficiente $5^2$, exponente $2n\\cdot2$); $(2-3)=-1$, y $-1\\cdot5x^{2n}=-5x^{2n}$; $(2)(-3)=-6$.', why: 'Potencia de una potencia y ley de los signos ($+$ por $-$ da $-$).', for: 'Obtener el trinomio final.', expr: '25x^(4n)-5x^(2n)-6' },
    ],
    verifyVals: { x: 2, n: 1 },
    summary: 'Con término común: común al cuadrado, más la suma de los no comunes por el común, más el producto de los no comunes.',
  },
  {
    id: 'p8', topic: 'T8', kind: 'expand',
    statement: 'Desarrollar: $(3x^2-4y)^3$',
    original: '(3x^2-4y)^3',
    answer: '27x^6-108x^4y+144x^2y^2-64y^3',
    errors: [
      { id: 'sin-intermedios', expr: '27x^6-64y^3', msg: 'Olvidaste los términos intermedios $-3a^2b$ y $+3ab^2$. El cubo de un binomio tiene cuatro términos.' },
      { id: 'signos', expr: '27x^6+108x^4y+144x^2y^2+64y^3', msg: 'Error de signo: en $(a-b)^3$ los signos se alternan $+,-,+,-$.' },
      { id: 'signo-final', expr: '27x^6-108x^4y+144x^2y^2+64y^3', msg: 'Error de signo en el último término: $(-4y)^3=-64y^3$.' },
      { id: 'sin-tres', expr: '27x^6-36x^4y+48x^2y^2-64y^3', msg: 'Olvidaste el coeficiente 3 de los términos intermedios: son $3a^2b$ y $3ab^2$.' },
      { id: 'exp-sumados', expr: '27x^5-108x^4y+144x^2y^2-64y^3', msg: 'Al elevar $(x^2)^3$ los exponentes se multiplican: $x^6$.' },
    ],
    steps: [
      { do: 'Identifico un binomio al cubo de la forma $(a-b)^3$ con $a=3x^2$ y $b=4y$.', why: 'Producto notable: $(a-b)^3=a^3-3a^2b+3ab^2-b^3$.', for: 'Desarrollar sin multiplicar tres veces.', tex: 'a=3x^2,\\qquad b=4y' },
      { do: 'Sustituyo en la fórmula respetando los signos alternados.', why: 'La fórmula vale para cualquier $a$ y $b$.', for: 'Ver los cuatro términos que hay que calcular.', expr: '(3x^2)^3-3(3x^2)^2(4y)+3(3x^2)(4y)^2-(4y)^3' },
      { do: 'Primer término: $(3x^2)^3=3^3x^{2\\cdot3}=27x^6$.', why: 'Potencia de un producto y de una potencia.', for: 'Obtener $a^3$.', tex: '(3x^2)^3=27x^6' },
      { do: 'Segundo término: $3\\cdot(3x^2)^2\\cdot4y=3\\cdot9x^4\\cdot4y=108x^4y$, con signo $-$.', why: '$(3x^2)^2=9x^4$; luego $3\\cdot9\\cdot4=108$.', for: 'Obtener $-3a^2b$.', tex: '-3(9x^4)(4y)=-108x^4y' },
      { do: 'Tercer término: $3\\cdot3x^2\\cdot(4y)^2=3\\cdot3x^2\\cdot16y^2=144x^2y^2$, con signo $+$.', why: '$(4y)^2=16y^2$; luego $3\\cdot3\\cdot16=144$.', for: 'Obtener $+3ab^2$.', tex: '3(3x^2)(16y^2)=144x^2y^2' },
      { do: 'Cuarto término: $(4y)^3=64y^3$, con signo $-$.', why: '$4^3=64$; potencia impar de $b$ conserva el signo menos.', for: 'Obtener $-b^3$.', tex: '-(4y)^3=-64y^3' },
      { do: 'Junto los cuatro términos.', why: 'Orden de la fórmula.', for: 'Escribir el resultado final.', expr: '27x^6-108x^4y+144x^2y^2-64y^3' },
    ],
    verifyVals: { x: 2, y: 1 },
    summary: 'El cubo de un binomio tiene cuatro términos con coeficientes 1, 3, 3, 1 y, si es resta, signos alternados.',
  },
  {
    id: 'p9', topic: 'T9', kind: 'factor',
    statement: 'Factorar: $4y^5-10y^3-4$',
    original: '4y^5-10y^3-4',
    answer: '2(2y^5-5y^3-2)',
    errors: [
      { id: 'division-incompleta', expr: '2(2y^5-5y^3-4)', msg: 'Factorizaste mal: no dividiste el último término; $-4\\div2=-2$.' },
      { id: 'division-incompleta-2', expr: '2(2y^5-10y^3-2)', msg: 'Factorizaste mal: no dividiste el segundo término; $-10y^3\\div2=-5y^3$.' },
      { id: 'letra-no-comun', expr: '2y^3(2y^2-5-2)', msg: 'Sacaste $y^3$ como factor común, pero el término $-4$ no tiene $y$. Solo se saca lo que aparece en TODOS los términos.' },
    ],
    formErrors: {
      'not-product': 'Dejaste el polinomio sin factor común: debe quedar escrito como producto, $2(\\dots)$.',
    },
    steps: [
      { do: 'Busco el máximo común divisor de los coeficientes $4$, $10$ y $4$: el mayor número que divide a los tres es $2$.', why: 'El factor común numérico es el MCD de los coeficientes.', for: 'Saber qué número sacar.', tex: '\\operatorname{MCD}(4,10,4)=2' },
      { do: 'Reviso las letras: $y$ aparece en $4y^5$ y en $-10y^3$, pero NO en $-4$. Por eso no hay letra común.', why: 'Un factor común debe estar en todos los términos.', for: 'No sacar una letra de más.', tex: '4y^5,\\;-10y^3,\\;-4' },
      { do: 'Divido cada término entre $2$, conservando su signo: $4y^5\\div2=2y^5$; $-10y^3\\div2=-5y^3$; $-4\\div2=-2$.', why: 'Propiedad distributiva al revés: $ab+ac=a(b+c)$.', for: 'Obtener lo que va dentro del paréntesis.', expr: '2(2y^5-5y^3-2)' },
      { do: 'Compruebo multiplicando: $2\\cdot2y^5-2\\cdot5y^3-2\\cdot2=4y^5-10y^3-4$. El trinomio $2y^5-5y^3-2$ ya no tiene factor común (2, 5 y 2 no comparten divisor) y no es un producto notable, así que no se factoriza más con enteros.', why: 'Factorizar y multiplicar son operaciones inversas.', for: 'Asegurar que la factorización es correcta y completa.', expr: '2*2y^5-2*5y^3-2*2' },
    ],
    verifyVals: { y: 2 },
    summary: 'El factor común se obtiene con el MCD de los coeficientes y las letras presentes en todos los términos; luego se divide cada término entre él.',
  },
  {
    id: 'p10', topic: 'T10', kind: 'factor',
    statement: 'Factorar: $a^2+ab+ax+bx$',
    original: 'a^2+ab+ax+bx',
    answer: '(a+b)(a+x)',
    errors: [
      { id: 'signo', expr: '(a+b)(a-x)', msg: 'Error de signo: al sacar $x$ del grupo $ax+bx$ queda $+x(a+b)$.' },
      { id: 'grupo-mal', expr: '(a+x)(b+x)', msg: 'Agrupaste mal: los grupos deben producir el mismo paréntesis. Agrupa $(a^2+ab)$ y $(ax+bx)$.' },
    ],
    formErrors: {
      'not-product': 'Te quedaste a la mitad de la agrupación: $a(a+b)+x(a+b)$ todavía es una suma. Falta sacar el binomio común $(a+b)$.',
    },
    steps: [
      { do: 'Formo dos grupos que tengan un factor común: $(a^2+ab)$ comparte la $a$; $(ax+bx)$ comparte la $x$.', why: 'Propiedad asociativa de la suma.', for: 'Poder sacar un factor común en cada grupo.', expr: '(a^2+ab)+(ax+bx)' },
      { do: 'Saco el factor común de cada grupo: $a^2+ab=a(a+b)$ y $ax+bx=x(a+b)$.', why: 'Factor común: $ab+ac=a(b+c)$.', for: 'Que aparezca el mismo paréntesis $(a+b)$ en ambos grupos.', expr: 'a(a+b)+x(a+b)' },
      { do: 'Saco el binomio $(a+b)$ como factor común de toda la expresión; lo que queda es $a+x$.', why: 'El paréntesis repetido es un factor común: $a\\,M+x\\,M=M(a+x)$.', for: 'Convertir la suma en un producto.', expr: '(a+b)(a+x)' },
      { do: 'Compruebo multiplicando: $(a+b)(a+x)=a^2+ax+ab+bx$, que es el polinomio original reordenado.', why: 'Multiplicar deshace la factorización.', for: 'Confirmar el resultado.', expr: 'a^2+ax+ab+bx' },
    ],
    verifyVals: { a: 2, b: 1, x: 3 },
    summary: 'En la agrupación se forman parejas con factor común hasta que aparece un mismo binomio, que se saca como factor de todo.',
  },
];

/* ------------------------------------------------------------------ */
/* Parte teórica (generada para este examen; el portafolio solo traía  */
/* la parte práctica)                                                   */
/* ------------------------------------------------------------------ */
export const THEORY = [
  {
    id: 't1', topic: 'T1', type: 'mc', concept: 'qué son los términos semejantes',
    text: '¿Qué son los términos semejantes?',
    options: [
      'Términos que tienen el mismo coeficiente.',
      'Términos que tienen las mismas letras elevadas a los mismos exponentes.',
      'Términos que tienen el mismo signo.',
      'Términos que tienen el mismo grado, aunque las letras sean distintas.',
    ],
    correct: 1,
    explanation: 'Dos términos son semejantes cuando su parte literal es idéntica: mismas letras con los mismos exponentes. Por ejemplo $5x^2y$ y $-3x^2y$. El coeficiente y el signo pueden ser distintos.',
  },
  {
    id: 't2', topic: 'T1', type: 'tf', concept: 'qué se suma al reducir términos semejantes',
    text: '$5x^3$ y $5x^2$ son términos semejantes porque tienen el mismo coeficiente.',
    options: ['Verdadero', 'Falso'],
    correct: 1,
    explanation: 'Falso. El coeficiente no importa: lo que debe coincidir es la parte literal. $x^3$ y $x^2$ tienen exponentes distintos, así que no son semejantes y no se pueden sumar.',
  },
  {
    id: 't3', topic: 'T2', type: 'mc', concept: 'qué pasa con los signos al restar',
    text: 'Al restar un polinomio de otro, ¿qué pasa con los signos del polinomio que se resta (sustraendo)?',
    options: [
      'Solo cambia el signo del primer término.',
      'No cambia ningún signo.',
      'Cambian los signos de todos sus términos.',
      'Solo cambian los signos de los términos negativos.',
    ],
    correct: 2,
    explanation: 'Restar es sumar el opuesto: $A-(B)=A+(-B)$. El signo menos multiplica por $-1$ a cada término del sustraendo, así que cambian todos los signos.',
  },
  {
    id: 't4', topic: 'T3', type: 'mc', concept: 'la regla de exponentes $x^a\\cdot x^b$',
    text: '¿Cuál es el resultado de $x^3\\cdot x^4$?',
    options: ['$x^{12}$', '$x^7$', '$2x^7$', '$x^{1}$'],
    correct: 1,
    explanation: 'Al multiplicar potencias de la misma base, la base se conserva y los exponentes se suman: $x^a\\cdot x^b=x^{a+b}$. Entonces $x^3\\cdot x^4=x^{3+4}=x^7$.',
  },
  {
    id: 't5', topic: 'T3', type: 'tf', concept: 'la propiedad distributiva en la multiplicación',
    text: 'Para multiplicar dos polinomios, cada término del primero se multiplica por cada término del segundo.',
    options: ['Verdadero', 'Falso'],
    correct: 0,
    explanation: 'Verdadero. Es la propiedad distributiva: $(a+b)(c+d)=ac+ad+bc+bd$. Después se reducen los términos semejantes.',
  },
  {
    id: 't6', topic: 'T4', type: 'mc', concept: 'el cociente de la suma de cubos',
    text: '¿Qué cociente se obtiene al dividir $a^3+b^3$ entre $a+b$?',
    options: ['$a^2+ab+b^2$', '$a^2+b^2$', '$a^2-ab+b^2$', '$(a+b)^2$'],
    correct: 2,
    explanation: 'Por la fórmula de suma de cubos, $a^3+b^3=(a+b)(a^2-ab+b^2)$; al dividir entre $(a+b)$ queda $a^2-ab+b^2$. El término central es negativo.',
  },
  {
    id: 't7', topic: 'T5', type: 'mc', concept: 'la fórmula del binomio al cuadrado',
    text: '¿Cuál es el desarrollo correcto de $(a-b)^2$?',
    options: ['$a^2-b^2$', '$a^2-2ab+b^2$', '$a^2-2ab-b^2$', '$a^2+b^2$'],
    correct: 1,
    explanation: '$(a-b)^2=(a-b)(a-b)=a^2-ab-ab+b^2=a^2-2ab+b^2$. Siempre aparece el doble producto $2ab$ y el último término es positivo.',
  },
  {
    id: 't8', topic: 'T6', type: 'tf', concept: 'la fórmula de los binomios conjugados',
    text: 'El producto $(a+b)(a-b)$ es igual a $a^2-b^2$ y no tiene término central.',
    options: ['Verdadero', 'Falso'],
    correct: 0,
    explanation: 'Verdadero. Al multiplicar aparecen $-ab$ y $+ab$, que se cancelan. Por eso el resultado es una diferencia de cuadrados.',
  },
  {
    id: 't9', topic: 'T7', type: 'mc', concept: 'la fórmula de binomios con término común',
    text: '¿Cuál es la fórmula de $(x+m)(x+n)$?',
    options: ['$x^2+mn$', '$x^2+(m+n)x+mn$', '$x^2+mnx+(m+n)$', '$x^2+2mnx+mn$'],
    correct: 1,
    explanation: 'El término común al cuadrado, más la suma de los no comunes multiplicada por el término común, más el producto de los no comunes: $x^2+(m+n)x+mn$.',
  },
  {
    id: 't10', topic: 'T8', type: 'mc', concept: 'la fórmula del binomio al cubo',
    text: '¿Cuál es el desarrollo de $(a-b)^3$?',
    options: ['$a^3-b^3$', '$a^3-3a^2b+3ab^2-b^3$', '$a^3-3a^2b-3ab^2-b^3$', '$a^3+3a^2b+3ab^2+b^3$'],
    correct: 1,
    explanation: 'El cubo de un binomio tiene cuatro términos con coeficientes $1,3,3,1$. Con resta, los signos se alternan: $a^3-3a^2b+3ab^2-b^3$.',
  },
  {
    id: 't11', topic: 'T9', type: 'mc', concept: 'cuándo aplicar factor común',
    text: '¿Cuándo conviene factorizar por factor común?',
    options: [
      'Cuando el polinomio tiene exactamente dos términos.',
      'Cuando todos los términos comparten un mismo factor (número, letra o ambos).',
      'Solo cuando todos los coeficientes son iguales.',
      'Cuando el polinomio es un trinomio cuadrado perfecto.',
    ],
    correct: 1,
    explanation: 'El factor común se aplica cuando hay algo que divide a TODOS los términos. Por ejemplo, en $6x^2+9x$ todos comparten $3x$: $3x(2x+3)$. Siempre es el primer método que se revisa.',
  },
  {
    id: 't12', topic: 'T10', type: 'tf', concept: 'cuándo aplicar agrupación',
    text: 'La factorización por agrupación se usa cuando no hay un factor común a todos los términos, pero sí a grupos de términos.',
    options: ['Verdadero', 'Falso'],
    correct: 0,
    explanation: 'Verdadero. Se agrupan los términos (normalmente de dos en dos) para que en cada grupo haya un factor común y aparezca un mismo binomio que luego se saca como factor.',
  },
];

/* ------------------------------------------------------------------ */
/* Banco fijo de refuerzo: 2 ejercicios nuevos por tema (20 en total)  */
/* ------------------------------------------------------------------ */
export const BANK = [
  // T1 — Suma
  {
    id: 'r1a', topic: 'T1', kind: 'expand',
    statement: 'Hallar la suma: $(4x^3-2x^2+5)+(-x^3+6x^2-3x)+(2x^2+3x-1)$',
    original: '(4x^3-2x^2+5)+(-x^3+6x^2-3x)+(2x^2+3x-1)',
    answer: '3x^3+6x^2+4',
    errors: [
      { id: 'cero', expr: '3x^3+6x^2+6x+4', msg: 'Los términos $-3x$ y $+3x$ son opuestos: suman $0x=0$, así que el término en $x$ desaparece.' },
      { id: 'exp-sumados', expr: '3x^6+6x^4+4', msg: 'Sumaste los exponentes. En una suma solo se suman los coeficientes.' },
    ],
    steps: [
      { do: 'Quito los paréntesis conservando los signos (todos están precedidos de $+$). Ojo: $-x^3$ tiene coeficiente $-1$.', why: 'Un paréntesis precedido de $+$ no cambia los signos.', for: 'Ver todos los términos sueltos.', expr: '4x^3-2x^2+5-x^3+6x^2-3x+2x^2+3x-1' },
      { do: 'Agrupo semejantes: $x^3$: $4x^3,-x^3$; $x^2$: $-2x^2,6x^2,2x^2$; $x$: $-3x,3x$; números: $5,-1$.', why: 'Conmutativa y asociativa.', for: 'Juntar lo que se puede sumar.', expr: '(4x^3-x^3)+(-2x^2+6x^2+2x^2)+(-3x+3x)+(5-1)' },
      { do: 'Sumo coeficientes: $4-1=3$; $-2+6+2=6$; $-3+3=0$ (el término en $x$ se anula); $5-1=4$.', why: 'Distributiva: $4x^3-x^3=(4-1)x^3$. Un término con coeficiente 0 vale 0 y no se escribe.', for: 'Reducir el polinomio.', expr: '3x^3+6x^2+4' },
    ],
    verifyVals: { x: 2 },
    summary: 'Se suman solo los coeficientes de los términos semejantes; si dan cero, el término desaparece.',
  },
  {
    id: 'r1b', topic: 'T1', kind: 'expand',
    statement: 'Hallar la suma: $(2a^2+3ab-b^2)+(-5a^2+ab+4b^2)$',
    original: '(2a^2+3ab-b^2)+(-5a^2+ab+4b^2)',
    answer: '-3a^2+4ab+3b^2',
    errors: [
      { id: 'signo-a2', expr: '3a^2+4ab+3b^2', msg: 'Error de signo: $2-5=-3$, así que queda $-3a^2$.' },
      { id: 'ab-sin-1', expr: '-3a^2+3ab+3b^2', msg: 'El término $ab$ tiene coeficiente $1$ aunque no se escriba: $3ab+ab=4ab$.' },
    ],
    steps: [
      { do: 'Quito los paréntesis sin cambiar signos.', why: 'Paréntesis precedidos de $+$.', for: 'Ver todos los términos.', expr: '2a^2+3ab-b^2-5a^2+ab+4b^2' },
      { do: 'Agrupo semejantes: $a^2$: $2a^2,-5a^2$; $ab$: $3ab, ab$ (este tiene coeficiente $1$); $b^2$: $-b^2$ (coeficiente $-1$), $4b^2$.', why: 'Conmutativa y asociativa.', for: 'Juntar términos con la misma parte literal.', expr: '(2a^2-5a^2)+(3ab+ab)+(-b^2+4b^2)' },
      { do: 'Sumo coeficientes: $2-5=-3$; $3+1=4$; $-1+4=3$.', why: 'Distributiva.', for: 'Obtener el resultado.', expr: '-3a^2+4ab+3b^2' },
    ],
    verifyVals: { a: 2, b: 1 },
    summary: 'Una letra sin número tiene coeficiente 1 (o −1 si lleva signo menos).',
  },
  // T2 — Resta
  {
    id: 'r2a', topic: 'T2', kind: 'expand',
    statement: 'Hallar la resta: de $6x^3+2x^2-7$ restar $2x^3-5x^2+4x-1$',
    original: '(6x^3+2x^2-7)-(2x^3-5x^2+4x-1)',
    answer: '4x^3+7x^2-4x-6',
    errors: [
      { id: 'cambio-parcial', expr: '4x^3-3x^2+4x-8', msg: 'No cambiaste todos los signos: solo cambiaste el primero. Cada término del sustraendo cambia de signo.' },
      { id: 'sin-cambio', expr: '8x^3-3x^2+4x-8', msg: 'No cambiaste los signos del sustraendo: sumaste en lugar de restar.' },
    ],
    steps: [
      { do: 'Escribo $A-B$: minuendo $6x^3+2x^2-7$, sustraendo $2x^3-5x^2+4x-1$.', why: '«De A restar B» es $A-B$.', for: 'Plantear en el orden correcto.', expr: '(6x^3+2x^2-7)-(2x^3-5x^2+4x-1)' },
      { do: 'Cambio el signo de cada término del sustraendo: $2x^3\\to-2x^3$, $-5x^2\\to+5x^2$, $4x\\to-4x$, $-1\\to+1$.', why: '$A-B=A+(-B)$.', for: 'Convertir la resta en suma.', expr: '6x^3+2x^2-7-2x^3+5x^2-4x+1' },
      { do: 'Agrupo y sumo coeficientes: $6-2=4$; $2+5=7$; $-4x$ queda solo; $-7+1=-6$.', why: 'Distributiva sobre términos semejantes.', for: 'Reducir.', expr: '4x^3+7x^2-4x-6' },
    ],
    verifyVals: { x: 2 },
    summary: 'El signo menos delante del paréntesis cambia el signo de todos los términos que contiene.',
  },
  {
    id: 'r2b', topic: 'T2', kind: 'expand',
    statement: 'Hallar la resta: de $5a^2-3ab+2b^2$ restar $-a^2+4ab-6b^2$',
    original: '(5a^2-3ab+2b^2)-(-a^2+4ab-6b^2)',
    answer: '6a^2-7ab+8b^2',
    errors: [
      { id: 'sin-cambio', expr: '4a^2+ab-4b^2', msg: 'No cambiaste los signos del sustraendo: sumaste en lugar de restar.' },
      { id: 'orden-invertido', expr: '-6a^2+7ab-8b^2', msg: 'Invertiste el orden: «de A restar B» es A − B.' },
    ],
    steps: [
      { do: 'Planteo $A-B$.', why: '«De A restar B» es $A-B$.', for: 'Orden correcto.', expr: '(5a^2-3ab+2b^2)-(-a^2+4ab-6b^2)' },
      { do: 'Cambio todos los signos del sustraendo: $-a^2\\to+a^2$, $4ab\\to-4ab$, $-6b^2\\to+6b^2$.', why: '$A-B=A+(-B)$.', for: 'Convertir en suma.', expr: '5a^2-3ab+2b^2+a^2-4ab+6b^2' },
      { do: 'Sumo semejantes: $5+1=6$; $-3-4=-7$; $2+6=8$.', why: 'Distributiva.', for: 'Reducir.', expr: '6a^2-7ab+8b^2' },
    ],
    verifyVals: { a: 2, b: 1 },
    summary: 'Primero se cambian todos los signos del sustraendo y después se reducen los semejantes.',
  },
  // T3 — Multiplicación
  {
    id: 'r3a', topic: 'T3', kind: 'expand',
    statement: 'Resolver la multiplicación: $(2x+5)$ por $(3y-4)$',
    original: '(2x+5)(3y-4)',
    answer: '6xy-8x+15y-20',
    errors: [
      { id: 'solo-extremos', expr: '6xy-20', msg: 'Faltan los productos cruzados $2x\\cdot(-4)$ y $5\\cdot3y$.' },
      { id: 'signos', expr: '6xy+8x+15y+20', msg: 'Error de signo: $(2x)(-4)=-8x$ y $(5)(-4)=-20$.' },
    ],
    steps: [
      { do: 'Distribuyo: $2x$ por $3y$ y por $-4$; luego $5$ por $3y$ y por $-4$.', why: 'Propiedad distributiva (4 productos).', for: 'No olvidar ningún producto.', expr: '(2x)(3y)+(2x)(-4)+(5)(3y)+(5)(-4)' },
      { do: 'Multiplico coeficientes y letras: $2\\cdot3=6$, $x\\cdot y=xy$; $2\\cdot(-4)=-8$; $5\\cdot3=15$; $5\\cdot(-4)=-20$.', why: 'Ley de los signos.', for: 'Obtener cada término.', expr: '6xy-8x+15y-20' },
      { do: 'Verifico que no hay semejantes: $xy$, $x$, $y$ y el número son distintos.', why: 'Solo se reducen partes literales idénticas.', for: 'Confirmar el resultado final.', expr: '6xy-8x+15y-20' },
    ],
    verifyVals: { x: 2, y: 1 },
    summary: 'Binomio por binomio da cuatro productos; luego se reducen solo los semejantes.',
  },
  {
    id: 'r3b', topic: 'T3', kind: 'expand',
    statement: 'Resolver la multiplicación: $(x-2)(x^2+3x-1)$',
    original: '(x-2)(x^2+3x-1)',
    answer: 'x^3+x^2-7x+2',
    errors: [
      { id: 'sin-reducir-mal', expr: 'x^3+5x^2-7x+2', msg: 'Al reducir $3x^2-2x^2$ debe quedar $x^2$. Revisa el signo de $(-2)(x^2)$.' },
      { id: 'exp', expr: 'x^2+x^2-7x+2', msg: 'Al multiplicar $x\\cdot x^2$ los exponentes se suman: $x^{1+2}=x^3$.' },
    ],
    steps: [
      { do: 'Distribuyo $x$ y luego $-2$ sobre los tres términos del trinomio (6 productos).', why: 'Propiedad distributiva.', for: 'Desarrollar todo.', expr: 'x*x^2+x*3x+x*(-1)+(-2)*x^2+(-2)*3x+(-2)*(-1)' },
      { do: 'Multiplico: $x\\cdot x^2=x^3$ (exponentes $1+2$); $x\\cdot3x=3x^2$; $x\\cdot(-1)=-x$; $-2\\cdot x^2=-2x^2$; $-2\\cdot3x=-6x$; $(-2)(-1)=+2$.', why: 'Regla $x^a\\cdot x^b=x^{a+b}$ y ley de los signos.', for: 'Obtener seis términos.', expr: 'x^3+3x^2-x-2x^2-6x+2' },
      { do: 'Reduzco semejantes: $3x^2-2x^2=x^2$; $-x-6x=-7x$.', why: 'Distributiva sobre semejantes.', for: 'Simplificar.', expr: 'x^3+x^2-7x+2' },
    ],
    verifyVals: { x: 2 },
    summary: 'Binomio por trinomio da seis productos; al final se reducen los semejantes.',
  },
  // T4 — División / suma de cubos
  {
    id: 'r4a', topic: 'T4', kind: 'expand',
    statement: 'Resolver la división: $a^3+64$ entre $a+4$',
    original: '(a^3+64)/(a+4)',
    answer: 'a^2-4a+16',
    errors: [
      { id: 'signo', expr: 'a^2+4a+16', msg: 'Error de signo: el término central del cociente de una suma de cubos es negativo, $-4a$.' },
      { id: 'sin-central', expr: 'a^2+16', msg: 'Te faltó el término central $-ab=-4a$.' },
    ],
    steps: [
      { do: 'Reconozco una suma de cubos: $a^3$ es el cubo de $a$ y $64=4^3$ es el cubo de $4$.', why: '$a^3+b^3=(a+b)(a^2-ab+b^2)$ con $b=4$.', for: 'Dividir en un paso.', tex: 'a^3+4^3=(a+4)(a^2-4a+16)' },
      { do: 'Sustituyo y simplifico el factor $(a+4)$.', why: '$\\frac{a+4}{a+4}=1$.', for: 'Obtener el cociente.', expr: '((a+4)(a^2-4a+16))/(a+4)' },
      { do: 'Escribo el cociente: $a^2$, menos $a\\cdot4=4a$, más $4^2=16$.', why: 'Fórmula del cociente $a^2-ab+b^2$.', for: 'Resultado final.', expr: 'a^2-4a+16' },
    ],
    verifyVals: { a: 2 },
    summary: 'Si el dividendo es una suma de cubos y el divisor la suma de las bases, el cociente es $a^2-ab+b^2$.',
  },
  {
    id: 'r4b', topic: 'T4', kind: 'expand',
    statement: 'Resolver la división: $8x^3+27y^3$ entre $2x+3y$',
    original: '(8x^3+27y^3)/(2x+3y)',
    answer: '4x^2-6xy+9y^2',
    errors: [
      { id: 'signo', expr: '4x^2+6xy+9y^2', msg: 'Error de signo en $-6xy$: en el cociente de la suma de cubos el término central es negativo.' },
      { id: 'coef', expr: '2x^2-6xy+3y^2', msg: 'Debes elevar al cuadrado las bases completas: $(2x)^2=4x^2$ y $(3y)^2=9y^2$.' },
    ],
    steps: [
      { do: 'Identifico las bases: $8x^3=(2x)^3$, así que $a=2x$; $27y^3=(3y)^3$, así que $b=3y$.', why: 'Raíz cúbica de un producto: $\\sqrt[3]{8}=2$, $\\sqrt[3]{x^3}=x$.', for: 'Aplicar la suma de cubos.', tex: 'a=2x,\\qquad b=3y' },
      { do: 'Sustituyo el dividendo por su factorización y simplifico $(2x+3y)$.', why: '$a^3+b^3=(a+b)(a^2-ab+b^2)$.', for: 'Obtener el cociente.', expr: '((2x+3y)((2x)^2-(2x)(3y)+(3y)^2))/(2x+3y)' },
      { do: 'Calculo: $(2x)^2=4x^2$; $(2x)(3y)=6xy$ con signo $-$; $(3y)^2=9y^2$.', why: 'Potencia de un producto.', for: 'Resultado final.', expr: '4x^2-6xy+9y^2' },
    ],
    verifyVals: { x: 2, y: 1 },
    summary: 'Saca la raíz cúbica de cada término para hallar $a$ y $b$ y aplica $a^2-ab+b^2$.',
  },
  // T5 — Binomio al cuadrado
  {
    id: 'r5a', topic: 'T5', kind: 'expand',
    statement: 'Desarrollar: $(2x^2-5)^2$',
    original: '(2x^2-5)^2',
    answer: '4x^4-20x^2+25',
    errors: [
      { id: 'sin-doble', expr: '4x^4+25', msg: 'Olvidaste el doble producto $2ab$ en el binomio al cuadrado: falta $-20x^2$.' },
      { id: 'sin-dos', expr: '4x^4-10x^2+25', msg: 'El término central es el DOBLE producto: $2(2x^2)(5)=20x^2$.' },
    ],
    steps: [
      { do: 'Identifico $(a-b)^2$ con $a=2x^2$, $b=5$ y sustituyo en $a^2-2ab+b^2$.', why: 'Producto notable.', for: 'Saber qué calcular.', expr: '(2x^2)^2-2(2x^2)(5)+5^2' },
      { do: 'Calculo: $(2x^2)^2=4x^4$ ($2^2=4$; $2\\cdot2=4$ en el exponente); $2\\cdot2\\cdot5=20$ → $-20x^2$; $5^2=25$.', why: 'Potencia de un producto y de una potencia.', for: 'Obtener los tres términos.', expr: '4x^4-20x^2+25' },
    ],
    verifyVals: { x: 2 },
    summary: 'Cuadrado del primero, menos el doble producto, más el cuadrado del segundo.',
  },
  {
    id: 'r5b', topic: 'T5', kind: 'expand',
    statement: 'Desarrollar: $(4a+3b)^2$',
    original: '(4a+3b)^2',
    answer: '16a^2+24ab+9b^2',
    errors: [
      { id: 'sin-doble', expr: '16a^2+9b^2', msg: 'Olvidaste el doble producto $2ab$ en el binomio al cuadrado: falta $24ab$.' },
      { id: 'sin-dos', expr: '16a^2+12ab+9b^2', msg: 'El término central es $2\\cdot4a\\cdot3b=24ab$, no $12ab$.' },
    ],
    steps: [
      { do: 'Identifico $(a+b)^2$ con primer término $4a$ y segundo $3b$, y sustituyo.', why: '$(a+b)^2=a^2+2ab+b^2$.', for: 'Plantear los tres términos.', expr: '(4a)^2+2(4a)(3b)+(3b)^2' },
      { do: 'Calculo: $(4a)^2=16a^2$; $2\\cdot4\\cdot3=24$ → $24ab$; $(3b)^2=9b^2$.', why: 'Potencia de un producto.', for: 'Resultado.', expr: '16a^2+24ab+9b^2' },
    ],
    verifyVals: { a: 2, b: 1 },
    summary: 'El doble producto multiplica 2 por el primer término por el segundo, con sus coeficientes.',
  },
  // T6 — Conjugados
  {
    id: 'r6a', topic: 'T6', kind: 'expand',
    statement: 'Desarrollar: $(7x^3+2y)(7x^3-2y)$',
    original: '(7x^3+2y)(7x^3-2y)',
    answer: '49x^6-4y^2',
    errors: [
      { id: 'termino-central', expr: '49x^6-28x^3y+4y^2', msg: 'Respondiste con término central; en los conjugados ese término se cancela.' },
      { id: 'signo', expr: '49x^6+4y^2', msg: 'El producto de conjugados es una diferencia: $a^2-b^2$.' },
    ],
    steps: [
      { do: 'Identifico conjugados con $a=7x^3$ y $b=2y$ y aplico $a^2-b^2$.', why: 'Los productos cruzados $-14x^3y$ y $+14x^3y$ se cancelan.', for: 'Calcular solo dos cuadrados.', expr: '(7x^3)^2-(2y)^2' },
      { do: 'Elevo: $7^2=49$, $(x^3)^2=x^6$; $2^2=4$, $y^2$.', why: 'Potencia de una potencia.', for: 'Resultado.', expr: '49x^6-4y^2' },
    ],
    verifyVals: { x: 2, y: 1 },
    summary: 'Conjugados: cuadrado del primero menos cuadrado del segundo.',
  },
  {
    id: 'r6b', topic: 'T6', kind: 'expand',
    statement: 'Desarrollar: $(4x^{3n}-5y^{n})(4x^{3n}+5y^{n})$',
    original: '(4x^(3n)-5y^n)(4x^(3n)+5y^n)',
    answer: '16x^(6n)-25y^(2n)',
    errors: [
      { id: 'exp', expr: '16x^(3n)-25y^n', msg: 'Al elevar al cuadrado, los exponentes se multiplican por 2: $x^{6n}$ y $y^{2n}$.' },
      { id: 'termino-central', expr: '16x^(6n)-40x^(3n)y^n+25y^(2n)', msg: 'Respondiste con término central; en los conjugados se cancela.' },
    ],
    steps: [
      { do: 'Identifico conjugados con $a=4x^{3n}$ y $b=5y^{n}$ (el orden de los factores no importa).', why: '$(a-b)(a+b)=a^2-b^2$.', for: 'Usar la fórmula.', expr: '(4x^(3n))^2-(5y^n)^2' },
      { do: 'Elevo: $4^2=16$, $(x^{3n})^2=x^{6n}$; $5^2=25$, $(y^n)^2=y^{2n}$.', why: 'Potencia de una potencia con exponente literal: $3n\\cdot2=6n$.', for: 'Resultado.', expr: '16x^(6n)-25y^(2n)' },
    ],
    verifyVals: { x: 2, y: 1, n: 1 },
    summary: 'Con exponentes literales la regla es la misma: al elevar al cuadrado se multiplica el exponente por 2.',
  },
  // T7 — Término común
  {
    id: 'r7a', topic: 'T7', kind: 'expand',
    statement: 'Resolver el producto: $(x+7)(x-4)$',
    original: '(x+7)(x-4)',
    answer: 'x^2+3x-28',
    errors: [
      { id: 'signo', expr: 'x^2-3x-28', msg: 'La suma de los no comunes es $7+(-4)=3$, positiva.' },
      { id: 'sin-central', expr: 'x^2-28', msg: 'Olvidaste el término central $(p+q)x=3x$.' },
    ],
    steps: [
      { do: 'Término común $x$; no comunes $p=7$ y $q=-4$. Sustituyo en $m^2+(p+q)m+pq$.', why: 'Producto de binomios con término común.', for: 'Plantear.', expr: 'x^2+(7-4)x+(7)(-4)' },
      { do: 'Calculo: $7-4=3$; $7\\cdot(-4)=-28$.', why: 'Ley de los signos.', for: 'Resultado.', expr: 'x^2+3x-28' },
    ],
    verifyVals: { x: 2 },
    summary: 'Suma de no comunes para el término central y producto de no comunes para el término independiente.',
  },
  {
    id: 'r7b', topic: 'T7', kind: 'expand',
    statement: 'Resolver el producto: $(3x^{2n}-5)(3x^{2n}+1)$',
    original: '(3x^(2n)-5)(3x^(2n)+1)',
    answer: '9x^(4n)-12x^(2n)-5',
    errors: [
      { id: 'sin-coef', expr: '9x^(4n)-4x^(2n)-5', msg: 'La suma $(-5+1)=-4$ debe multiplicar al término común completo, $3x^{2n}$: queda $-12x^{2n}$.' },
      { id: 'signo', expr: '9x^(4n)+12x^(2n)-5', msg: 'Error de signo: $-5+1=-4$.' },
    ],
    steps: [
      { do: 'Término común $m=3x^{2n}$; no comunes $p=-5$, $q=1$. Sustituyo.', why: '$(m+p)(m+q)=m^2+(p+q)m+pq$.', for: 'Plantear.', expr: '(3x^(2n))^2+(-5+1)(3x^(2n))+(-5)(1)' },
      { do: 'Calculo: $(3x^{2n})^2=9x^{4n}$; $(-4)(3x^{2n})=-12x^{2n}$; $(-5)(1)=-5$.', why: 'Potencia de una potencia y ley de los signos.', for: 'Resultado.', expr: '9x^(4n)-12x^(2n)-5' },
    ],
    verifyVals: { x: 2, n: 1 },
    summary: 'El término central es (suma de no comunes) × (término común completo, con su coeficiente).',
  },
  // T8 — Binomio al cubo
  {
    id: 'r8a', topic: 'T8', kind: 'expand',
    statement: 'Desarrollar: $(2x+3)^3$',
    original: '(2x+3)^3',
    answer: '8x^3+36x^2+54x+27',
    errors: [
      { id: 'sin-intermedios', expr: '8x^3+27', msg: 'Olvidaste los términos intermedios $3a^2b$ y $3ab^2$.' },
      { id: 'sin-tres', expr: '8x^3+12x^2+18x+27', msg: 'Faltó el coeficiente 3 en los términos intermedios.' },
    ],
    steps: [
      { do: 'Identifico $(a+b)^3$ con $a=2x$, $b=3$ y sustituyo en $a^3+3a^2b+3ab^2+b^3$.', why: 'Producto notable.', for: 'Plantear los cuatro términos.', expr: '(2x)^3+3(2x)^2(3)+3(2x)(3)^2+3^3' },
      { do: 'Calculo: $(2x)^3=8x^3$; $3\\cdot4x^2\\cdot3=36x^2$; $3\\cdot2x\\cdot9=54x$; $3^3=27$.', why: 'Potencia de un producto.', for: 'Resultado.', expr: '8x^3+36x^2+54x+27' },
    ],
    verifyVals: { x: 2 },
    summary: 'Binomio al cubo: coeficientes 1, 3, 3, 1 y todos positivos si es suma.',
  },
  {
    id: 'r8b', topic: 'T8', kind: 'expand',
    statement: 'Desarrollar: $(x^2-2y)^3$',
    original: '(x^2-2y)^3',
    answer: 'x^6-6x^4y+12x^2y^2-8y^3',
    errors: [
      { id: 'sin-intermedios', expr: 'x^6-8y^3', msg: 'Olvidaste los términos intermedios del binomio al cubo.' },
      { id: 'signos', expr: 'x^6+6x^4y+12x^2y^2+8y^3', msg: 'En $(a-b)^3$ los signos se alternan: $+,-,+,-$.' },
    ],
    steps: [
      { do: 'Identifico $(a-b)^3$ con $a=x^2$, $b=2y$ y sustituyo en $a^3-3a^2b+3ab^2-b^3$.', why: 'Producto notable.', for: 'Plantear.', expr: '(x^2)^3-3(x^2)^2(2y)+3(x^2)(2y)^2-(2y)^3' },
      { do: 'Calculo: $(x^2)^3=x^6$; $3\\cdot x^4\\cdot2y=6x^4y$; $3\\cdot x^2\\cdot4y^2=12x^2y^2$; $(2y)^3=8y^3$.', why: 'Potencia de una potencia.', for: 'Resultado con signos alternados.', expr: 'x^6-6x^4y+12x^2y^2-8y^3' },
    ],
    verifyVals: { x: 2, y: 1 },
    summary: 'En el cubo de una resta los signos se alternan empezando por $+$.',
  },
  // T9 — Factor común
  {
    id: 'r9a', topic: 'T9', kind: 'factor',
    statement: 'Factorar: $6x^3-9x^2$',
    original: '6x^3-9x^2',
    answer: '3x^2(2x-3)',
    errors: [
      { id: 'division-mal', expr: '3x^2(2x-9)', msg: 'Factorizaste mal: $-9x^2\\div3x^2=-3$.' },
    ],
    formErrors: { 'not-product': 'Dejaste el polinomio sin factor común; escríbelo como producto.' },
    steps: [
      { do: 'MCD de $6$ y $9$ es $3$. La letra $x$ está en ambos términos; tomo el menor exponente: $x^2$. Factor común: $3x^2$.', why: 'El factor común lleva el MCD y las letras comunes con su menor exponente.', for: 'Saber qué sacar.', tex: '\\operatorname{MCD}(6,9)=3,\\quad x^2' },
      { do: 'Divido cada término: $6x^3\\div3x^2=2x$ (se restan exponentes $3-2$); $-9x^2\\div3x^2=-3$.', why: 'Distributiva al revés.', for: 'Obtener el paréntesis.', expr: '3x^2(2x-3)' },
    ],
    verifyVals: { x: 2 },
    summary: 'El factor común usa el MCD de los coeficientes y cada letra común con su menor exponente.',
  },
  {
    id: 'r9b', topic: 'T9', kind: 'factor',
    statement: 'Factorar: $8a^4b-12a^2b^2+4a^2b$',
    original: '8a^4b-12a^2b^2+4a^2b',
    answer: '4a^2b(2a^2-3b+1)',
    errors: [
      { id: 'sin-uno', expr: '4a^2b(2a^2-3b)', msg: 'Cuando un término es igual al factor común, deja un $1$ en el paréntesis: $4a^2b\\div4a^2b=1$.' },
    ],
    formErrors: { 'not-product': 'Dejaste el polinomio sin factor común; escríbelo como producto.' },
    steps: [
      { do: 'MCD de $8$, $12$ y $4$ es $4$. Letras comunes: $a$ (menor exponente $2$) y $b$ (menor exponente $1$). Factor común: $4a^2b$.', why: 'MCD y letras comunes con su menor exponente.', for: 'Saber qué sacar.', tex: '4a^2b' },
      { do: 'Divido: $8a^4b\\div4a^2b=2a^2$; $-12a^2b^2\\div4a^2b=-3b$; $4a^2b\\div4a^2b=1$.', why: 'Al dividir potencias de la misma base se restan los exponentes.', for: 'Obtener el paréntesis (sin olvidar el $1$).', expr: '4a^2b(2a^2-3b+1)' },
    ],
    verifyVals: { a: 2, b: 1 },
    summary: 'Si un término coincide con el factor común, en su lugar queda un 1.',
  },
  // T10 — Agrupación
  {
    id: 'r10a', topic: 'T10', kind: 'factor',
    statement: 'Factorar: $xy+2x+3y+6$',
    original: 'xy+2x+3y+6',
    answer: '(x+3)(y+2)',
    errors: [
      { id: 'grupo', expr: '(x+2)(y+3)', msg: 'Revisa los grupos: $xy+2x=x(y+2)$ y $3y+6=3(y+2)$.' },
    ],
    formErrors: { 'not-product': 'Te quedaste a la mitad: falta sacar el binomio común $(y+2)$.' },
    steps: [
      { do: 'Agrupo $(xy+2x)+(3y+6)$.', why: 'Asociativa.', for: 'Buscar factor común en cada grupo.', expr: '(xy+2x)+(3y+6)' },
      { do: 'Saco factor común: $x(y+2)+3(y+2)$.', why: 'Factor común en cada grupo.', for: 'Que aparezca el mismo binomio.', expr: 'x(y+2)+3(y+2)' },
      { do: 'Saco el binomio común $(y+2)$.', why: '$xM+3M=M(x+3)$.', for: 'Convertir en producto.', expr: '(x+3)(y+2)' },
    ],
    verifyVals: { x: 2, y: 1 },
    summary: 'Agrupa para que aparezca el mismo binomio y sácalo como factor.',
  },
  {
    id: 'r10b', topic: 'T10', kind: 'factor',
    statement: 'Factorar: $2am-2an+bm-bn$',
    original: '2am-2an+bm-bn',
    answer: '(m-n)(2a+b)',
    errors: [
      { id: 'signo', expr: '(m+n)(2a+b)', msg: 'Error de signo: $2am-2an=2a(m-n)$.' },
    ],
    formErrors: { 'not-product': 'Te quedaste a la mitad: falta sacar el binomio común $(m-n)$.' },
    steps: [
      { do: 'Agrupo $(2am-2an)+(bm-bn)$.', why: 'Asociativa.', for: 'Buscar factor común en cada grupo.', expr: '(2am-2an)+(bm-bn)' },
      { do: 'Saco $2a$ del primer grupo y $b$ del segundo: $2a(m-n)+b(m-n)$.', why: 'Factor común.', for: 'Que aparezca el binomio $(m-n)$.', expr: '2a(m-n)+b(m-n)' },
      { do: 'Saco el binomio común $(m-n)$.', why: '$2aM+bM=M(2a+b)$.', for: 'Producto final.', expr: '(m-n)(2a+b)' },
    ],
    verifyVals: { a: 2, b: 1, m: 3, n: 1 },
    summary: 'El signo dentro del binomio común debe ser el mismo en ambos grupos.',
  },
];

/* ------------------------------------------------------------------ */
/* Glosario (los términos se subrayan en las explicaciones)            */
/* ------------------------------------------------------------------ */
export const GLOSSARY = [
  { key: 'coeficiente', match: 'coeficientes?', def: 'Número que multiplica a la parte literal de un término.', ex: 'En $-7x^2$ el coeficiente es $-7$.' },
  { key: 'exponente', match: 'exponentes?', def: 'Número (o letra) que indica cuántas veces se multiplica la base por sí misma.', ex: 'En $x^3$ el exponente es $3$: $x\\cdot x\\cdot x$.' },
  { key: 'binomio', match: 'binomios?', def: 'Polinomio de dos términos.', ex: '$3x^2-4y$' },
  { key: 'trinomio', match: 'trinomios?', def: 'Polinomio de tres términos.', ex: '$9x^6-54x^3+81$' },
  { key: 'término semejante', match: 'términos? semejantes?', def: 'Términos con las mismas letras elevadas a los mismos exponentes; se pueden sumar.', ex: '$5x^3$ y $3x^3$ son semejantes; $5x^3$ y $5x^2$ no.' },
  { key: 'conjugado', match: 'conjugados?', def: 'Dos binomios con los mismos términos que solo difieren en el signo del segundo.', ex: '$(a+b)$ y $(a-b)$' },
  { key: 'factor común', match: 'factor(?:es)? comú?n(?:es)?', def: 'Expresión que divide a todos los términos de un polinomio y se puede sacar como multiplicador.', ex: '$6x^2+9x=3x(2x+3)$' },
  { key: 'producto notable', match: 'productos? notables?', def: 'Multiplicación con una forma fija cuyo resultado se escribe con fórmula, sin multiplicar término por término.', ex: '$(a+b)^2=a^2+2ab+b^2$' },
];

/** Todos los ejercicios con explicación, por id. */
export const EXERCISES = Object.fromEntries([...PRACTICE, ...BANK].map((e) => [e.id, e]));
export const THEORY_BY_ID = Object.fromEntries(THEORY.map((q) => [q.id, q]));
