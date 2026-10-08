/**
 * Motor algebraico del examen.
 *
 * - parse(texto)        → árbol (AST) o lanza ParseError.
 * - evaluate(ast, env)  → número.
 * - equivalent(a, b)    → compara dos expresiones evaluándolas en 8 puntos
 *                         aleatorios con valores positivos (tolerancia 1e-9 relativa).
 * - toLatex(ast)        → LaTeX para KaTeX, respetando la forma escrita.
 * - monomials(ast)      → lista de monomios si la expresión ya es una suma reducida.
 * - checkSimplified / checkFactored → verifican la FORMA de la respuesta.
 * - grade(input, ejercicio) → veredicto completo para un ejercicio práctico.
 *
 * Funciona igual en el navegador y en Node (pruebas automáticas).
 */

export class ParseError extends Error {}

/* ------------------------------------------------------------------ */
/* 1. Normalización y análisis léxico                                  */
/* ------------------------------------------------------------------ */

const SUPERSCRIPTS = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  'ⁿ': 'n', 'ᵃ': 'a', 'ᵇ': 'b', 'ˣ': 'x', 'ʸ': 'y', 'ᵐ': 'm', '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')',
};

/** Convierte variantes tipográficas (−, ·, ×, ÷, superíndices) a una forma ASCII. */
export function normalize(text) {
  let s = String(text ?? '')
    .replace(/[−–—]/g, '-')
    .replace(/[·×⋅∙•*]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[\[{]/g, '(')
    .replace(/[\]}]/g, ')')
    .toLowerCase();
  // Cada racha de superíndices se convierte en ^( ... ): x²ⁿ → x^(2n)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵃᵇˣʸᵐ⁺⁻⁽⁾]+/g, (run) => '^(' + [...run].map((c) => SUPERSCRIPTS[c]).join('') + ')');
  return s.replace(/\s+/g, '');
}

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const raw = src.slice(i, j);
      if (!/^(\d+\.?\d*|\.\d+)$/.test(raw)) throw new ParseError('Número mal escrito');
      tokens.push({ type: 'num', value: parseFloat(raw), raw });
      i = j;
    } else if (/[a-z]/.test(c)) {
      tokens.push({ type: 'var', value: c });
      i++;
    } else if ('+-*/^()'.includes(c)) {
      tokens.push({ type: c });
      i++;
    } else {
      throw new ParseError(`Símbolo no reconocido: ${c}`);
    }
  }
  return tokens;
}

/* ------------------------------------------------------------------ */
/* 2. Análisis sintáctico (descenso recursivo)                         */
/*    expr  := term (('+'|'-') term)*                                  */
/*    term  := unary (('*'|'/'|implícita) unary)*                      */
/*    unary := ('-'|'+') unary | power                                 */
/*    power := primary ('^' unary)?        (asociativa a la derecha)   */
/* ------------------------------------------------------------------ */

export function parse(text) {
  const src = normalize(text);
  if (!src) throw new ParseError('Respuesta vacía');
  const tokens = tokenize(src);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const startsFactor = (t) => t && (t.type === 'num' || t.type === 'var' || t.type === '(');

  function parseExpr() {
    const terms = [{ sign: 1, node: parseTerm() }];
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const sign = next().type === '+' ? 1 : -1;
      terms.push({ sign, node: parseTerm() });
    }
    return terms.length === 1 ? terms[0].node : { t: 'add', terms };
  }

  function parseTerm() {
    const factors = [{ op: null, node: parseUnary() }];
    for (;;) {
      const t = peek();
      if (t && (t.type === '*' || t.type === '/')) {
        next();
        factors.push({ op: t.type, node: parseUnary() });
      } else if (startsFactor(t)) {
        factors.push({ op: 'imp', node: parsePower() });
      } else break;
    }
    return factors.length === 1 ? factors[0].node : { t: 'mul', factors };
  }

  function parseUnary() {
    const t = peek();
    if (t && t.type === '-') { next(); return { t: 'neg', node: parseUnary() }; }
    if (t && t.type === '+') { next(); return parseUnary(); }
    return parsePower();
  }

  function parsePower() {
    const base = parsePrimary();
    if (peek() && peek().type === '^') {
      next();
      if (!peek()) throw new ParseError('Falta el exponente');
      return { t: 'pow', base, exp: parseUnary() };
    }
    return base;
  }

  function parsePrimary() {
    const t = next();
    if (!t) throw new ParseError('La expresión termina de forma incompleta');
    if (t.type === 'num') return { t: 'num', v: t.value };
    if (t.type === 'var') return { t: 'var', n: t.value };
    if (t.type === '(') {
      if (peek() && peek().type === ')') throw new ParseError('Paréntesis vacío');
      const inner = parseExpr();
      if (!peek() || next().type !== ')') throw new ParseError('Falta cerrar un paréntesis');
      return { t: 'group', node: inner };
    }
    throw new ParseError('Revisa los paréntesis o los signos');
  }

  const ast = parseExpr();
  if (pos < tokens.length) throw new ParseError('Sobra un paréntesis o un signo');
  return ast;
}

/** Intenta analizar; devuelve null en vez de lanzar. */
export function tryParse(text) {
  try { return parse(text); } catch { return null; }
}

/* ------------------------------------------------------------------ */
/* 3. Evaluación y equivalencia                                        */
/* ------------------------------------------------------------------ */

export function evaluate(node, env) {
  switch (node.t) {
    case 'num': return node.v;
    case 'var': {
      if (!(node.n in env)) throw new Error(`Variable sin valor: ${node.n}`);
      return env[node.n];
    }
    case 'group': return evaluate(node.node, env);
    case 'neg': return -evaluate(node.node, env);
    case 'pow': return Math.pow(evaluate(node.base, env), evaluate(node.exp, env));
    case 'add': return node.terms.reduce((acc, { sign, node: n }) => acc + sign * evaluate(n, env), 0);
    case 'mul': return node.factors.reduce((acc, { op, node: n }) => (op === '/' ? acc / evaluate(n, env) : acc * evaluate(n, env)), 1);
    default: throw new Error('Nodo desconocido');
  }
}

export function variables(node, out = new Set()) {
  if (node.t === 'var') out.add(node.n);
  else if (node.t === 'group' || node.t === 'neg') variables(node.node, out);
  else if (node.t === 'pow') { variables(node.base, out); variables(node.exp, out); }
  else if (node.t === 'add') node.terms.forEach((x) => variables(x.node, out));
  else if (node.t === 'mul') node.factors.forEach((x) => variables(x.node, out));
  return out;
}

/** Generador pseudoaleatorio con semilla (reproducible en pruebas). */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export const SAMPLE_POINTS = 8;
export const TOLERANCE = 1e-9;

/** Compara con tolerancia relativa 1e-9 (absoluta cerca de cero). */
export function close(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= TOLERANCE * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * Dos expresiones son equivalentes si coinciden en SAMPLE_POINTS puntos
 * aleatorios, con valores positivos (0.6 a 1.9) para TODAS las letras.
 * Los valores positivos permiten evaluar exponentes literales como x^(2n).
 */
export function equivalent(a, b, seed = Date.now()) {
  const A = typeof a === 'string' ? parse(a) : a;
  const B = typeof b === 'string' ? parse(b) : b;
  const vars = [...new Set([...variables(A), ...variables(B)])];
  const rand = rng(seed);
  for (let k = 0; k < SAMPLE_POINTS; k++) {
    const env = {};
    vars.forEach((v) => { env[v] = 0.6 + 1.3 * rand(); });
    if (!close(evaluate(A, env), evaluate(B, env))) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* 4. Conversión a LaTeX (respeta la forma que escribió el alumno)     */
/* ------------------------------------------------------------------ */

const strip = (n) => (n.t === 'group' ? strip(n.node) : n);

function fmtNum(v) {
  return Number.isInteger(v) ? String(v) : String(+v.toFixed(6));
}

export function toLatex(node, sub = null) {
  const L = (n) => toLatex(n, sub);
  switch (node.t) {
    case 'num': return fmtNum(node.v);
    case 'var': return sub && node.n in sub ? `(${fmtNum(sub[node.n])})` : node.n;
    case 'group': return `\\left(${L(node.node)}\\right)`;
    case 'neg': return `-${L(node.node)}`;
    case 'pow': {
      let base = L(node.base);
      if (sub && node.base.t === 'var' && node.base.n in sub) base = `(${fmtNum(sub[node.base.n])})`;
      return `${base}^{${L(strip(node.exp))}}`;
    }
    case 'add':
      return node.terms.map(({ sign, node: n }, i) => {
        const s = L(n);
        if (i === 0) return sign < 0 ? `-${s}` : s;
        return (sign < 0 ? ' - ' : ' + ') + s;
      }).join('');
    case 'mul': {
      const num = [], den = [];
      node.factors.forEach((f) => (f.op === '/' ? den : num).push(f));
      const joinF = (list) => list.map((f, i) => {
        const s = L(f.node);
        if (i === 0) return s;
        // Punto explícito si el alumno lo escribió, si el factor empieza con número o al sustituir valores.
        const needDot = f.op === '*' || /^[0-9]/.test(s) || sub;
        return (needDot ? ' \\cdot ' : '') + s;
      }).join('');
      if (!den.length) return joinF(num);
      const unwrap = (list) => (list.length === 1 ? L(strip(list[0].node)) : joinF(list));
      return `\\dfrac{${unwrap(num)}}{${unwrap(den)}}`;
    }
    default: return '';
  }
}

/** LaTeX desde texto; devuelve null si no se puede leer. */
export function latexOf(text) {
  const ast = tryParse(text);
  return ast ? toLatex(ast) : null;
}

/** LaTeX de la expresión con las letras sustituidas por valores. */
export function substitutedLatex(text, values) {
  return toLatex(parse(text), values);
}

/* ------------------------------------------------------------------ */
/* 5. Monomios: análisis de forma                                      */
/* ------------------------------------------------------------------ */

// Puntos fijos para identificar exponentes literales (2n, 4n, 6a...).
const EXP_PROBES = [{ n: 1.37, a: 1.91, b: 0.73, m: 1.13, x: 1.51, y: 0.89 }, { n: 2.29, a: 0.57, b: 1.61, m: 0.83, x: 0.67, y: 1.79 }];

function expKey(exp) {
  return EXP_PROBES.map((env) => {
    const filled = { ...env };
    variables(exp).forEach((v) => { if (!(v in filled)) filled[v] = 1.234; });
    return evaluate(exp, filled).toFixed(9);
  }).join('|');
}

function isNumericExp(exp) { return variables(exp).size === 0; }

/**
 * Descompone un monomio (producto de número y potencias de letras).
 * Devuelve null si contiene paréntesis pendientes o divisiones.
 */
function monomial(node) {
  const m = { coef: 1, vars: {}, numCount: 0, repeated: false };
  function walk(n) {
    if (n.t === 'num') { m.coef *= n.v; m.numCount++; return true; }
    if (n.t === 'neg') { m.coef *= -1; return walk(n.node); }
    if (n.t === 'var') return addVar(n.n, { t: 'num', v: 1 });
    if (n.t === 'pow') {
      if (n.base.t === 'var') return addVar(n.base.n, n.exp);
      if (n.base.t === 'num' && isNumericExp(n.exp)) { m.coef *= evaluate(n, {}); m.numCount += 2; return true; }
      return false;
    }
    if (n.t === 'mul') return n.factors.every((f) => f.op !== '/' && walk(f.node));
    return false; // group, add → paréntesis pendientes
  }
  function addVar(name, exp) {
    if (m.vars[name]) m.repeated = true;
    const prev = m.vars[name];
    const key = prev ? `${prev.key}+${expKey(exp)}` : expKey(exp);
    m.vars[name] = { key, exp, numeric: isNumericExp(exp) && !prev, value: isNumericExp(exp) ? evaluate(exp, {}) : null };
    return true;
  }
  if (!walk(node)) return null;
  m.sig = Object.keys(m.vars).sort().map((v) => `${v}:${m.vars[v].key}`).join(',');
  return m;
}

/** Lista de monomios si la expresión es una suma "plana" de monomios; si no, null. */
export function monomials(ast) {
  const top = strip(ast);
  const terms = top.t === 'add' ? top.terms : [{ sign: 1, node: top }];
  const out = [];
  for (const { sign, node } of terms) {
    const m = monomial(node);
    if (!m) return null;
    m.coef *= sign;
    out.push(m);
  }
  return out;
}

/**
 * Forma simplificada: sin paréntesis pendientes, sin términos semejantes
 * repetidos, sin la misma letra dos veces en un término y con un solo coeficiente.
 */
export function checkSimplified(ast) {
  const ms = monomials(ast);
  if (!ms) return { ok: false, reason: 'parens', msg: 'Tu resultado es equivalente, pero quedan paréntesis u operaciones sin desarrollar.' };
  if (ms.some((m) => m.repeated || m.numCount > 1)) return { ok: false, reason: 'unreduced', msg: 'Tu resultado es equivalente, pero hay productos sin efectuar dentro de un término (por ejemplo, dos coeficientes o la misma letra dos veces).' };
  const seen = new Set();
  for (const m of ms) {
    if (seen.has(m.sig)) return { ok: false, reason: 'like-terms', msg: 'Tu resultado es equivalente, pero todavía tiene términos semejantes sin reducir.' };
    seen.add(m.sig);
  }
  if (ms.length > 1 && ms.some((m) => m.coef === 0)) return { ok: false, reason: 'zero', msg: 'Tu resultado tiene un término con coeficiente 0; elimínalo.' };
  return { ok: true };
}

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }

/**
 * Forma factorizada: producto de dos o más factores (sin contar ±1),
 * y ningún paréntesis conserva un factor común que se pudiera sacar.
 */
export function checkFactored(ast) {
  let top = strip(ast);
  while (top.t === 'neg') top = strip(top.node);
  const notProduct = { ok: false, reason: 'not-product', msg: 'Tu resultado es equivalente, pero no está factorizado: debe quedar como un producto de factores.' };
  if (top.t !== 'mul' && !(top.t === 'pow' && strip(top.base).t === 'add')) return notProduct;
  const factors = top.t === 'mul' ? top.factors : [{ op: null, node: top }];
  if (factors.some((f) => f.op === '/')) return notProduct;
  const isUnit = (n) => variables(n).size === 0 && Math.abs(evaluate(n, {})) === 1;
  const real = factors.filter((f) => !isUnit(f.node));
  if (real.length < 2 && top.t !== 'pow') return notProduct;
  if (!real.some((f) => strip(f.node).t === 'add' || (f.node.t === 'pow' && strip(f.node.base).t === 'add'))) return notProduct;
  for (const f of real) {
    const inner = strip(f.node.t === 'pow' ? f.node.base : f.node);
    if (inner.t !== 'add') continue;
    const ms = monomials(inner);
    if (!ms) continue;
    if (ms.every((m) => Number.isInteger(m.coef)) && ms.reduce((g, m) => gcd(g, m.coef), 0) > 1) {
      return { ok: false, reason: 'common-number', msg: 'Casi: dentro de un paréntesis todavía hay un factor común numérico que puedes sacar.' };
    }
    const shared = Object.keys(ms[0].vars).filter((v) => ms.every((m) => m.vars[v] && m.vars[v].numeric && m.vars[v].value > 0));
    if (shared.length) return { ok: false, reason: 'common-letter', msg: `Casi: todos los términos de un paréntesis todavía comparten la letra ${shared[0]}; sácala como factor común.` };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* 6. Calificación de un ejercicio práctico                            */
/* ------------------------------------------------------------------ */

/** Compara la estructura de monomios para explicar un fallo genérico. */
function structuralHint(studentAst, answerAst) {
  const s = monomials(studentAst), c = monomials(answerAst);
  if (!s || !c) return null;
  const bySig = (list) => new Map(list.map((m) => [m.sig, m.coef]));
  const S = bySig(s), C = bySig(c);
  const missing = [...C.keys()].filter((k) => !S.has(k));
  const extra = [...S.keys()].filter((k) => !C.has(k));
  if (!missing.length && !extra.length) {
    const signOnly = [...C].every(([k, v]) => close(Math.abs(S.get(k)), Math.abs(v)));
    if (signOnly) return { id: 'signo', msg: 'Tienes los términos correctos, pero hay un error de signo en al menos uno de ellos.' };
    return { id: 'coeficiente', msg: 'Tienes las letras y exponentes correctos, pero algún coeficiente no es el correcto. Revisa las multiplicaciones de los números.' };
  }
  if (missing.length && !extra.length) return { id: 'faltan', msg: 'Te faltan términos en el resultado.' };
  if (extra.length && !missing.length) return { id: 'sobran', msg: 'Tu resultado tiene términos que no deberían aparecer.' };
  return { id: 'exponentes', msg: 'Algunos términos tienen letras o exponentes distintos a los correctos. Revisa la regla de los exponentes.' };
}

/** Avisos de escritura que no impiden leer la expresión (p. ej. «x3» en vez de «x^3»). */
export function inputHint(text) {
  return /[a-z][0-9]/.test(normalize(text))
    ? 'Ojo: escribiste una letra seguida de un número (por ejemplo x3). Eso se lee como x·3; para exponentes usa x^3.'
    : '';
}

/**
 * Califica una respuesta escrita.
 * exercise: { answer, kind: 'expand'|'factor', errors?: [{expr|terms, msg, id}], fallback? }
 * Devuelve { status: 'empty'|'unreadable'|'correct'|'incorrect', msg, errorId, latex }.
 */
export function grade(input, exercise, seed) {
  const raw = String(input ?? '').trim();
  if (!raw) return { status: 'empty', msg: 'Sin respuesta.', errorId: 'vacia' };
  let ast;
  try { ast = parse(raw); } catch {
    return { status: 'unreadable', msg: 'No pude leer tu respuesta, revisa los paréntesis' };
  }
  const latex = toLatex(ast);
  const answer = parse(exercise.answer);
  if (equivalent(ast, answer, seed)) {
    const form = exercise.kind === 'factor' ? checkFactored(ast) : checkSimplified(ast);
    if (form.ok) return { status: 'correct', msg: '¡Correcto!', latex };
    const custom = (exercise.formErrors || {})[form.reason];
    return { status: 'incorrect', msg: custom || form.msg, errorId: `forma-${form.reason}`, latex };
  }
  for (const e of exercise.errors || []) {
    if (e.expr && equivalent(ast, parse(e.expr), seed)) return { status: 'incorrect', msg: e.msg, errorId: e.id, latex };
  }
  const ms = monomials(ast);
  for (const e of exercise.errors || []) {
    if (e.terms && ms && ms.length === e.terms) return { status: 'incorrect', msg: e.msg, errorId: e.id, latex };
  }
  const hint = exercise.kind === 'expand' ? structuralHint(ast, answer) : null;
  const extra = inputHint(raw) ? ' ' + inputHint(raw) : '';
  if (hint) return { status: 'incorrect', msg: hint.msg + extra, errorId: hint.id, latex };
  return { status: 'incorrect', msg: (exercise.fallback || 'Tu resultado no es equivalente al correcto.') + extra, errorId: 'otro', latex };
}
