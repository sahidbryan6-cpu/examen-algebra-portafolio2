/**
 * Utilidades de interfaz compartidas por el examen (index.html) y el panel (admin.html):
 * íconos SVG, texto enriquecido con KaTeX y glosario, campo matemático con vista previa,
 * diálogos, avisos y formato de tiempos.
 */
import { latexOf, inputHint, tryParse, evaluate, substitutedLatex, parse } from './math-engine.js';
import { GLOSSARY, TOPICS } from './exam-data.js';

/* ------------------------------------------------------------------ */
/* Íconos (trazos de 24×24, estilo lineal coherente)                   */
/* ------------------------------------------------------------------ */
const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  left: '<path d="m12 19-7-7 7-7M19 12H5"/>',
  right: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15.7-6L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.7 6L3 16"/><path d="M8 16H3v5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5A6 6 0 1 0 7.5 11.5c.8.8 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  user: '<circle cx="12" cy="8" r="4.5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>',
  sigma: '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
};

/** Devuelve el SVG de un ícono (decorativo: aria-hidden). */
export function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Texto seguro y matemática                                           */
/* ------------------------------------------------------------------ */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** LaTeX → HTML con KaTeX; si KaTeX no cargó, muestra el código tal cual. */
export function tex(latex, display = false) {
  if (!window.katex) return `<code>${esc(latex)}</code>`;
  return window.katex.renderToString(latex, { displayMode: display, throwOnError: false, strict: 'ignore' });
}

const GLOSSARY_RE = new RegExp(`\\b(${GLOSSARY.map((g) => g.match).join('|')})\\b`, 'gi');

function glossaryKey(word) {
  return GLOSSARY.find((g) => new RegExp(`^${g.match}$`, 'i').test(word))?.key;
}

/**
 * Texto con matemática entre $...$ y, opcionalmente, términos del glosario subrayados.
 * Todo el texto se escapa antes de insertar marcas propias.
 */
export function rich(text, { glossary = false } = {}) {
  return String(text ?? '').split('$').map((part, i) => {
    if (i % 2) return tex(part);
    const safe = esc(part);
    if (!glossary) return safe;
    return safe.replace(GLOSSARY_RE, (w) => {
      const key = glossaryKey(w);
      return key ? `<button type="button" class="term" data-term="${esc(key)}">${w}</button>` : w;
    });
  }).join('');
}

/** Activa los términos del glosario: al tocarlos se abre una tarjeta corta con ejemplo. */
export function setupGlossary() {
  const pop = document.createElement('div');
  pop.className = 'glossary-pop';
  pop.setAttribute('role', 'dialog');
  pop.hidden = true;
  document.body.appendChild(pop);
  let anchor = null;
  const close = () => { pop.hidden = true; anchor?.setAttribute('aria-expanded', 'false'); anchor = null; };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.term');
    if (!btn) { if (!pop.contains(e.target)) close(); return; }
    if (anchor === btn) return close();
    close();
    const g = GLOSSARY.find((x) => x.key === btn.dataset.term);
    pop.innerHTML = `<p class="glossary-title">${esc(g.key)}</p><p>${rich(g.def)}</p><p class="glossary-ex"><span>Ejemplo:</span> ${rich(g.ex)}</p>`;
    pop.setAttribute('aria-label', `Glosario: ${g.key}`);
    pop.hidden = false;
    anchor = btn;
    btn.setAttribute('aria-expanded', 'true');
    const r = btn.getBoundingClientRect();
    const w = Math.min(320, window.innerWidth - 32);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(16, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 16)) + 'px';
    pop.style.top = r.bottom + window.scrollY + 8 + 'px';
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && anchor) { const a = anchor; close(); a.focus(); } });
}

/* ------------------------------------------------------------------ */
/* Campo de expresión con barra de símbolos y vista previa en vivo     */
/* ------------------------------------------------------------------ */
const TOOLBAR = [
  { label: 'x²', insert: '^2', caret: 0, aria: 'Insertar exponente 2' },
  { label: 'xⁿ', insert: '^()', caret: -1, aria: 'Insertar exponente entre paréntesis' },
  { label: '( )', insert: '()', caret: -1, aria: 'Insertar paréntesis' },
  { label: '^', insert: '^', caret: 0, aria: 'Insertar símbolo de potencia' },
  { label: '·', insert: '·', caret: 0, aria: 'Insertar signo de multiplicación' },
];

/**
 * Crea el campo de respuesta. Devuelve el elemento contenedor.
 * opts: { id, value, label, onInput(value), disabled }
 */
export function mathInput({ id, value = '', label = 'Tu respuesta', onInput = () => {}, disabled = false }) {
  const wrap = document.createElement('div');
  wrap.className = 'math-input';
  wrap.innerHTML = `
    <label class="field-label" for="${id}">${esc(label)}</label>
    <div class="toolbar" role="toolbar" aria-label="Símbolos matemáticos">
      ${TOOLBAR.map((b, i) => `<button type="button" class="tool" data-i="${i}" aria-label="${b.aria}" ${disabled ? 'disabled' : ''}>${b.label}</button>`).join('')}
    </div>
    <input id="${id}" class="expr-field" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false"
      placeholder="Ejemplo: 3x^2 - 5x + 2" aria-describedby="${id}-help ${id}-preview" ${disabled ? 'disabled' : ''}>
    <p class="field-help" id="${id}-help">Escribe exponentes con ^ (x^2) o con superíndices (x²). Para exponentes con letras usa paréntesis: x^(2n).</p>
    <div class="preview" id="${id}-preview" aria-live="polite"></div>`;
  const input = wrap.querySelector('input');
  const preview = wrap.querySelector('.preview');
  input.value = value;

  const update = () => {
    const v = input.value;
    if (!v.trim()) {
      preview.className = 'preview is-empty';
      preview.innerHTML = '<span>La vista previa aparecerá aquí.</span>';
    } else {
      const latex = latexOf(v);
      const hint = inputHint(v);
      preview.className = 'preview' + (latex ? '' : ' is-error');
      preview.innerHTML = latex
        ? `<span class="sr-only">Vista previa:</span>${tex(latex, true)}${hint ? `<p class="hint">${icon('info')} ${esc(hint)}</p>` : ''}`
        : `<p class="hint">${icon('alert')} No pude leer tu respuesta, revisa los paréntesis</p>`;
    }
  };
  input.addEventListener('input', () => { update(); onInput(input.value); });
  wrap.querySelector('.toolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('.tool');
    if (!btn) return;
    const b = TOOLBAR[+btn.dataset.i];
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.value = input.value.slice(0, start) + b.insert + input.value.slice(end);
    const pos = start + b.insert.length + b.caret;
    input.focus();
    input.setSelectionRange(pos, pos);
    input.dispatchEvent(new Event('input'));
  });
  update();
  return wrap;
}

/** ¿La expresión se puede leer? (vacío cuenta como legible: es «sin respuesta»). */
export function isReadable(v) {
  return !String(v ?? '').trim() || !!tryParse(v);
}

/* ------------------------------------------------------------------ */
/* Explicación completa en 6 partes                                    */
/* ------------------------------------------------------------------ */
function fmtValue(v) {
  return Number.isInteger(Math.round(v * 1e9) / 1e9) ? String(Math.round(v)) : v.toFixed(4).replace(/0+$/, '');
}

/** Bloque de verificación calculado con el motor (no escrito a mano). */
function verificationHtml(ex) {
  const vals = ex.verifyVals;
  const vo = evaluate(parse(ex.original), vals);
  const va = evaluate(parse(ex.answer), vals);
  const list = Object.entries(vals).map(([k, v]) => `${k}=${v}`).join(',\\;');
  return `
    <p>Sustituyo ${tex(list)} en el enunciado y en el resultado:</p>
    <div class="verify-row"><span class="verify-label">Enunciado</span>${tex(`${substitutedLatex(ex.original, vals)} = ${fmtValue(vo)}`, true)}</div>
    <div class="verify-row"><span class="verify-label">Resultado</span>${tex(`${substitutedLatex(ex.answer, vals)} = ${fmtValue(va)}`, true)}</div>
    <p class="verify-ok">${icon('check')} Los dos dan ${tex(fmtValue(vo))}: el resultado es equivalente.</p>`;
}

/** HTML de la explicación (Idea clave, Fórmula, Paso a paso, Verificación, Error común, Resumen). */
export function explanationHtml(ex) {
  const t = TOPICS[ex.topic];
  const g = { glossary: true };
  const steps = ex.steps.map((s, i) => `
    <li class="step">
      <span class="step-n" aria-hidden="true">${i + 1}</span>
      <div class="step-body">
        <p><strong>Qué hago:</strong> ${rich(s.do, g)}</p>
        <p><strong>Por qué puedo hacerlo:</strong> ${rich(s.why, g)}</p>
        <p><strong>Para qué sirve:</strong> ${rich(s.for, g)}</p>
        <div class="step-math">${tex(s.expr ? latexOf(s.expr) : s.tex, true)}</div>
      </div>
    </li>`).join('');
  return `
    <section class="explain" aria-label="Explicación detallada">
      <h4><span class="explain-n">1</span> Idea clave</h4>
      <p>${rich(t.idea, g)}</p>
      <h4><span class="explain-n">2</span> Fórmula o regla</h4>
      <div class="formula">${tex(t.formula.tex, true)}</div>
      <ul class="formula-parts">${t.formula.parts.map((p) => `<li>${rich(p, g)}</li>`).join('')}</ul>
      <h4><span class="explain-n">3</span> Paso a paso</h4>
      <ol class="steps">${steps}</ol>
      <h4><span class="explain-n">4</span> Verificación</h4>
      ${verificationHtml(ex)}
      <h4><span class="explain-n">5</span> Error común</h4>
      <p>${rich(t.commonError, g)}</p>
      <h4><span class="explain-n">6</span> Resumen</h4>
      <p class="summary">${rich(ex.summary, g)}</p>
    </section>`;
}

/** Explicación de una pregunta teórica (más breve: concepto + respuesta correcta). */
export function theoryExplanationHtml(q) {
  const t = TOPICS[q.topic];
  const g = { glossary: true };
  return `
    <section class="explain" aria-label="Explicación">
      <p><strong>Respuesta correcta:</strong> ${rich(q.options[q.correct])}</p>
      <p>${rich(q.explanation, g)}</p>
      <div class="formula">${tex(t.formula.tex, true)}</div>
      <p class="summary">${rich(t.idea, g)}</p>
    </section>`;
}

/* ------------------------------------------------------------------ */
/* Diálogos, avisos y formatos                                         */
/* ------------------------------------------------------------------ */

/** Confirmación accesible con <dialog>; resuelve true/false. */
export function confirmDialog({ title, body, confirm = 'Aceptar', cancel = 'Cancelar', danger = false }) {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'dialog';
    d.innerHTML = `
      <form method="dialog">
        <h2 class="dialog-title">${esc(title)}</h2>
        <p>${body}</p>
        <div class="dialog-actions">
          <button value="no" class="btn btn-ghost">${esc(cancel)}</button>
          <button value="yes" class="btn ${danger ? 'btn-danger' : 'btn-primary'}">${esc(confirm)}</button>
        </div>
      </form>`;
    document.body.appendChild(d);
    d.addEventListener('close', () => { resolve(d.returnValue === 'yes'); d.remove(); });
    d.showModal();
  });
}

let toastTimer;
/** Aviso breve no bloqueante (se anuncia a lectores de pantalla). */
export function toast(msg, kind = 'info') {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.dataset.kind = kind;
  el.innerHTML = `${icon(kind === 'error' ? 'alert' : kind === 'ok' ? 'check' : 'info')}<span>${esc(msg)}</span>`;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4200);
}

/** 125000 ms → «2 min 05 s». */
export function fmtDuration(ms) {
  const s = Math.max(0, Math.round((ms || 0) / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  if (h) return `${h} h ${String(m).padStart(2, '0')} min`;
  if (m) return `${m} min ${String(r).padStart(2, '0')} s`;
  return `${r} s`;
}

export function fmtDate(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Nota sobre 10 con un decimal. */
export const fmtScore = (n) => (Math.round(n * 10) / 10).toFixed(1);

/** Descarga un archivo de texto generado en el navegador. */
export function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}
