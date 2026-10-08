/**
 * Prueba automática del motor y de la clave de respuestas.
 * Ejecutar con:  node tests/verify.mjs
 *
 * Verifica:
 *  1. Las 10 respuestas del examen y las 20 del banco de refuerzo son equivalentes
 *     a su enunciado original y se califican como correctas.
 *  2. Cada paso con resultado parcial (`expr`) es equivalente al enunciado.
 *  3. Los errores típicos de la biblioteca NO son equivalentes y se califican como incorrectos.
 *  4. Formatos de entrada aceptados (x², 2x, x^(2n), espacios, desorden de términos).
 *  5. Reglas de forma: sin simplificar / sin factorizar = incorrecto; ilegible ≠ error.
 *  6. La parte teórica tiene 12 preguntas y cubre los 10 temas.
 */
import * as M from '../js/math-engine.js';
import { PRACTICE, BANK, THEORY, TOPIC_IDS } from '../js/exam-data.js';

let pass = 0, fail = 0;
function check(cond, label) {
  if (cond) pass++;
  else { fail++; console.error('  ✗ ' + label); }
}

// Varias semillas: el veredicto no debe depender de los puntos aleatorios.
const SEEDS = [1, 42, 2024, 99991, 123456789];
const eqAll = (a, b) => SEEDS.every((s) => M.equivalent(a, b, s));
const gradeAll = (input, ex) => SEEDS.map((s) => M.grade(input, ex, s).status);

console.log('1-3. Clave de respuestas, pasos y errores típicos');
for (const ex of [...PRACTICE, ...BANK]) {
  check(eqAll(ex.original, ex.answer), `${ex.id}: la respuesta no es equivalente al enunciado`);
  check(gradeAll(ex.answer, ex).every((s) => s === 'correct'), `${ex.id}: la respuesta clave no se califica como correcta (${gradeAll(ex.answer, ex)})`);
  ex.steps.forEach((st, i) => {
    if (st.expr) check(eqAll(ex.original, st.expr), `${ex.id} paso ${i + 1}: resultado parcial no equivalente (${st.expr})`);
    check(st.do && st.why && st.for && (st.expr || st.tex), `${ex.id} paso ${i + 1}: faltan campos de la explicación`);
  });
  check(ex.summary && ex.verifyVals, `${ex.id}: falta resumen o valores de verificación`);
  for (const err of ex.errors || []) {
    if (!err.expr) continue;
    check(!eqAll(err.expr, ex.answer), `${ex.id}/${err.id}: el error típico es equivalente a la respuesta`);
    const r = M.grade(err.expr, ex, 7);
    check(r.status === 'incorrect' && r.errorId === err.id, `${ex.id}/${err.id}: no se detectó el error (${r.status}, ${r.errorId})`);
  }
  // Verificación numérica con los valores concretos que se muestran al alumno.
  const vo = M.evaluate(M.parse(ex.original), ex.verifyVals);
  const va = M.evaluate(M.parse(ex.answer), ex.verifyVals);
  check(M.close(vo, va), `${ex.id}: la verificación numérica no coincide (${vo} vs ${va})`);
}
check(PRACTICE.length === 10, 'Deben ser 10 ejercicios prácticos');
check(BANK.length === 20, 'Deben ser 20 ejercicios de refuerzo');
TOPIC_IDS.forEach((t) => check(BANK.filter((b) => b.topic === t).length === 2, `Tema ${t}: debe tener 2 ejercicios en el banco`));

console.log('4. Formatos de entrada');
const P = Object.fromEntries(PRACTICE.map((e) => [e.id, e]));
const accepted = [
  ['p1', '8x³−7x²+11x+5'], ['p1', '5 + 11x - 7x^2 + 8x^3'], ['p1', '8x^3 - 7x^2 + 11x + 5'],
  ['p2', '-12x²+7x³+8'], ['p3', '15xa+25x-9a-15'], ['p3', '25x - 15 + 15ax - 9a'], ['p3', '15·a·x+25x−9a−15'],
  ['p4', 'y²-xy+x²'], ['p5', '81-54x³+9x⁶'],
  ['p6', '36x^(4n)-9y^(6a)'], ['p6', '36x⁴ⁿ−9y^(6a)'], ['p6', '-9y^(6a)+36x^(4n)'],
  ['p7', '25x^(4n)-5x^(2n)-6'], ['p8', '27x^6-108x^4 y+144x^2 y^2-64y^3'], ['p8', '27x⁶−108yx⁴+144x²y²−64y³'],
  ['p9', '2(2y^5-5y^3-2)'], ['p9', '2 (2y⁵ − 5y³ − 2)'], ['p9', '(2y^5-5y^3-2)·2'], ['p9', '-2(-2y^5+5y^3+2)'],
  ['p10', '(a+b)(a+x)'], ['p10', '(a+x)(a+b)'], ['p10', '(b+a)(x+a)'],
];
for (const [id, input] of accepted) {
  check(gradeAll(input, P[id]).every((s) => s === 'correct'), `${id}: debería aceptar «${input}» (${M.grade(input, P[id], 1).msg})`);
}

console.log('5. Reglas de forma y errores típicos pedidos');
const rejected = [
  ['p1', '(5x^3-7x^2+8x)+(3x^3-8x^2+3)+(8x^2+3x+2)', 'forma-parens'],
  ['p1', '5x^3+3x^3-7x^2+11x+5', 'forma-like-terms'],
  ['p2', '7x^3+2x^2-2', 'cambio-parcial-1'],
  ['p3', '(5x-3)(3a+5)', 'forma-parens'],
  ['p4', 'x^2+xy+y^2', 'signo-xy'],
  ['p5', '9x⁶+81', 'sin-doble'],
  ['p5', '(3x^3-9)^2', 'forma-parens'],
  ['p6', '36x^(4n)-36x^(2n)y^(3a)+9y^(6a)', 'termino-central'],
  ['p7', '25x^(4n)-x^(2n)-6', 'sin-coef'],
  ['p8', '27x^6-64y^3', 'sin-intermedios'],
  ['p9', '4y^5-10y^3-4', 'forma-not-product'],
  ['p9', '2(2y^5-5y^3-4)', 'division-incompleta'],
  ['p9', '2y^3(2y^2-5)-4', 'forma-not-product'],
  ['p9', '1(4y^5-10y^3-4)', 'forma-not-product'],
  ['p10', 'a^2+ab+ax+bx', 'forma-not-product'],
  ['p10', 'a(a+b)+x(a+b)', 'forma-not-product'],
  ['p10', 'a^2+ax+ab+bx', 'forma-not-product'],
];
for (const [id, input, errId] of rejected) {
  const r = M.grade(input, P[id], 3);
  check(r.status === 'incorrect' && r.errorId === errId, `${id}: «${input}» debería ser incorrecto (${errId}); se obtuvo ${r.status}/${r.errorId}`);
}
// Factor común incompleto en un paréntesis
const r9 = BANK.find((b) => b.id === 'r9a');
check(M.grade('3x(2x^2-3x)', r9, 1).errorId === 'forma-common-letter', 'r9a: debe detectar que queda la letra x como factor común');
check(M.grade('x^2(6x-9)', r9, 1).errorId === 'forma-common-number', 'r9a: debe detectar que queda un factor numérico');

// Respuestas ilegibles: no cuentan como error
for (const bad of ['(2x+3', '2x+)', '2x^', '3x ? 2', '((x)', '']) {
  const st = M.grade(bad, P.p1, 1).status;
  check(st === 'unreadable' || (bad === '' && st === 'empty'), `«${bad}» debería ser ilegible (${st})`);
}
check(M.grade('(2x+3', P.p1, 1).msg === 'No pude leer tu respuesta, revisa los paréntesis', 'Mensaje de ilegible exacto');

// Mensajes genéricos de estructura
check(M.grade('8x^3+7x^2+11x+5', P.p1, 1).errorId === 'signo', 'p1: debe detectar error de signo genérico');
check(M.grade('8x^3-7x^2+11x', P.p1, 1).errorId === 'faltan', 'p1: debe detectar términos faltantes');

// LaTeX legible
check(M.latexOf('x^(2n)') === 'x^{2n}', 'LaTeX de x^(2n)');
check(M.latexOf('(x^3+y^3)/(x+y)').startsWith('\\dfrac'), 'LaTeX de fracción');

console.log('6. Parte teórica');
check(THEORY.length === 12, 'Deben ser 12 preguntas teóricas');
TOPIC_IDS.forEach((t) => check(THEORY.some((q) => q.topic === t), `Tema ${t} sin pregunta teórica`));
check(THEORY.some((q) => q.type === 'tf') && THEORY.some((q) => q.type === 'mc'), 'Debe haber opción múltiple y verdadero/falso');
THEORY.forEach((q) => check(q.explanation && q.correct >= 0 && q.correct < q.options.length, `${q.id}: datos incompletos`));

console.log(`\nResultado: ${pass} comprobaciones correctas, ${fail} fallidas.`);
process.exit(fail ? 1 : 0);
