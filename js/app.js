/**
 * Flujo del alumno: bienvenida → examen (teoría + práctica) → resultados y diagnóstico
 * → refuerzo → resumen final. El avance se guarda en el navegador en cada cambio.
 */
import { PRACTICE, THEORY, EXERCISES, THEORY_BY_ID, TOPICS } from './exam-data.js';
import { grade, latexOf } from './math-engine.js';
import { scoreExam, reinforcementItems, diagnoseAfter } from './scoring.js';
import * as store from './store.js';
import {
  icon, esc, rich, tex, mathInput, isReadable, explanationHtml, theoryExplanationHtml,
  setupGlossary, confirmDialog, toast, fmtDuration, fmtScore, downloadFile,
} from './ui.js';

const KEY = 'algebra.examen.v1';
const ATTEMPTS_KEY = 'algebra.intentos.v1';
const ORDER = [...THEORY.map((q) => q.id), ...PRACTICE.map((p) => p.id)];
const app = document.getElementById('app');

let state = load();
let shownAt = 0; // momento en que se mostró la pregunta actual

/* ------------------------------------------------------------------ */
/* Persistencia del avance                                             */
/* ------------------------------------------------------------------ */
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* sin almacenamiento: el examen sigue funcionando */ }
}
function nextAttemptNumber() {
  let n = 1;
  try { n = (Number(localStorage.getItem(ATTEMPTS_KEY)) || 0) + 1; localStorage.setItem(ATTEMPTS_KEY, String(n)); } catch { /* ignorado */ }
  return n;
}

/** Suma al tiempo de la pregunta actual lo transcurrido desde que se mostró. */
function flushTime() {
  if (!state || state.screen !== 'exam' || !shownAt) return;
  const id = ORDER[state.index];
  state.times[id] = (state.times[id] || 0) + (Date.now() - shownAt);
  shownAt = Date.now();
  save();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { flushTime(); shownAt = 0; } else if (state?.screen === 'exam') shownAt = Date.now();
});
window.addEventListener('pagehide', flushTime);

/* ------------------------------------------------------------------ */
/* Utilidades de pantalla                                              */
/* ------------------------------------------------------------------ */
function render(html) {
  app.innerHTML = html;
  const h = app.querySelector('h1, h2');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  window.scrollTo({ top: 0 });
  updateHeader();
}

function updateHeader() {
  const who = document.getElementById('who');
  if (who) who.textContent = state?.student ? state.student.nombre : '';
}

function go(screen) {
  state.screen = screen;
  save();
  SCREENS[screen]();
}

function deviceInfo() {
  const ua = navigator.userAgent;
  const tipo = /iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'Tableta' : /Mobi|Android|iPhone/i.test(ua) ? 'Móvil' : 'Escritorio';
  const navegador = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /(Chrome|CriOS)\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Otro';
  const so = /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Otro';
  return {
    tipo, navegador, so,
    idioma: navigator.language || '',
    pantalla: `${screen.width}×${screen.height}`,
    ventana: `${window.innerWidth}×${window.innerHeight}`,
    ua: ua.slice(0, 300),
  };
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

/* ------------------------------------------------------------------ */
/* a) Bienvenida                                                       */
/* ------------------------------------------------------------------ */
function renderWelcome() {
  render(`
    <section class="hero">
      <p class="eyebrow">${icon('sigma')} Portafolio 2 · Álgebra</p>
      <h1>Examen diagnóstico de polinomios y productos notables</h1>
      <p class="lead">Responde 12 preguntas teóricas y 10 ejercicios prácticos. Al terminar verás qué temas dominas, cuáles debes repasar y practicarás con explicaciones paso a paso.</p>
      <ul class="facts">
        <li>${icon('list')} <span><strong>22 preguntas</strong> en dos partes</span></li>
        <li>${icon('clock')} <span>Unos <strong>40 minutos</strong>; se mide tu tiempo</span></li>
        <li>${icon('refresh')} <span>Tu avance <strong>se guarda solo</strong> si recargas la página</span></li>
      </ul>
    </section>
    <form class="card form" id="start" novalidate>
      <h2 class="card-title">Antes de empezar</h2>
      <div class="field">
        <label class="field-label" for="nombre">Nombre completo <span class="req">(obligatorio)</span></label>
        <input id="nombre" name="nombre" type="text" autocomplete="name" required minlength="3" maxlength="120" aria-describedby="nombre-error">
        <p class="field-error" id="nombre-error" hidden>${icon('alert')} Escribe tu nombre completo (mínimo 3 caracteres).</p>
      </div>
      <div class="field">
        <label class="field-label" for="grupo">Grupo o grado <span class="opt">(opcional)</span></label>
        <input id="grupo" name="grupo" type="text" maxlength="60" placeholder="Ejemplo: 3.º B">
      </div>
      <p class="notice">${icon('eye')} <span>Tus respuestas y resultados serán visibles para el administrador.</span></p>
      ${store.mode === 'local' ? `<p class="notice notice-warn">${icon('alert')} <span>Este sitio todavía no está conectado a la base de datos: por ahora los resultados se guardan solo en este navegador.</span></p>` : ''}
      <button class="btn btn-primary btn-block" type="submit">Comenzar examen ${icon('right')}</button>
    </form>`);
  const form = document.getElementById('start');
  const nombre = form.nombre;
  const err = document.getElementById('nombre-error');
  nombre.addEventListener('input', () => { if (nombre.value.trim().length >= 3) { err.hidden = true; nombre.removeAttribute('aria-invalid'); } });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = nombre.value.trim().replace(/\s+/g, ' ');
    if (n.length < 3) { err.hidden = false; nombre.setAttribute('aria-invalid', 'true'); nombre.focus(); return; }
    state = {
      version: 1, screen: 'exam', index: 0,
      student: { nombre: n, grupo: form.grupo.value.trim().slice(0, 60) },
      startedAt: Date.now(), answers: {}, times: {},
      recordId: uid(), attempt: nextAttemptNumber(),
      reinforcement: { attempts: {}, extra: false },
    };
    go('exam');
  });
}

/* ------------------------------------------------------------------ */
/* b-c) Examen: una pregunta por pantalla                               */
/* ------------------------------------------------------------------ */
function renderExam() {
  const id = ORDER[state.index];
  const isTheory = state.index < THEORY.length;
  const sectionIndex = isTheory ? state.index + 1 : state.index - THEORY.length + 1;
  const sectionTotal = isTheory ? THEORY.length : PRACTICE.length;
  const answered = ORDER.filter((q) => hasAnswer(q)).length;
  const pct = Math.round(((state.index + 1) / ORDER.length) * 100);
  const last = state.index === ORDER.length - 1;

  render(`
    <div class="exam-head">
      <p class="eyebrow">${isTheory ? 'Parte 1 · Teoría' : 'Parte 2 · Práctica'}</p>
      <div class="progress" role="progressbar" aria-label="Avance del examen" aria-valuemin="1" aria-valuemax="${ORDER.length}" aria-valuenow="${state.index + 1}">
        <span style="transform:scaleX(${pct / 100})"></span>
      </div>
      <p class="progress-text">Pregunta ${state.index + 1} de ${ORDER.length} · ${answered} respondidas</p>
    </div>
    <article class="card question" aria-labelledby="q-title">
      <p class="q-meta"><span class="chip">${isTheory ? (THEORY_BY_ID[id].type === 'tf' ? 'Verdadero o falso' : 'Opción múltiple') : `Ejercicio ${sectionIndex}`}</span>
        <span class="muted">${sectionIndex} de ${sectionTotal} · ${esc(TOPICS[isTheory ? THEORY_BY_ID[id].topic : EXERCISES[id].topic].name)}</span></p>
      <h2 id="q-title" class="q-title">${isTheory ? rich(THEORY_BY_ID[id].text) : rich(EXERCISES[id].statement)}</h2>
      <div id="q-body"></div>
    </article>
    <nav class="exam-nav" aria-label="Navegación entre preguntas">
      <button class="btn btn-ghost" id="prev" ${state.index === 0 ? 'disabled' : ''}>${icon('left')} Anterior</button>
      <button class="btn btn-primary" id="next">${last ? `Terminar examen ${icon('flag')}` : `Siguiente ${icon('right')}`}</button>
    </nav>
    <details class="jump">
      <summary>Ver todas las preguntas</summary>
      <div class="jump-grid">${ORDER.map((q, i) => `<button class="jump-btn ${hasAnswer(q) ? 'is-done' : ''} ${i === state.index ? 'is-current' : ''}" data-i="${i}" aria-label="Ir a la pregunta ${i + 1}${hasAnswer(q) ? ', respondida' : ''}">${i + 1}</button>`).join('')}</div>
    </details>`);

  const body = document.getElementById('q-body');
  if (isTheory) body.appendChild(optionsField(THEORY_BY_ID[id], state.answers[id], (v) => { state.answers[id] = v; save(); }));
  else body.appendChild(mathInput({ id: `in-${id}`, value: state.answers[id] || '', onInput: (v) => { state.answers[id] = v; save(); } }));

  shownAt = Date.now();
  document.getElementById('prev').addEventListener('click', () => move(state.index - 1));
  document.getElementById('next').addEventListener('click', () => (last ? finishExam() : move(state.index + 1)));
  app.querySelector('.jump-grid').addEventListener('click', (e) => {
    const b = e.target.closest('.jump-btn');
    if (b) move(+b.dataset.i);
  });
}

function hasAnswer(id) {
  const v = state.answers[id];
  return v !== undefined && v !== null && String(v).trim() !== '';
}

/** Cambia de pregunta; si la expresión actual no se puede leer, avisa y no avanza. */
function move(to) {
  const id = ORDER[state.index];
  if (state.index >= THEORY.length && !isReadable(state.answers[id])) {
    toast('No pude leer tu respuesta, revisa los paréntesis. Corrígela o bórrala para continuar.', 'error');
    document.getElementById(`in-${id}`)?.focus();
    return;
  }
  flushTime();
  state.index = Math.max(0, Math.min(ORDER.length - 1, to));
  save();
  renderExam();
}

/** Opciones de una pregunta teórica como grupo de radios (navegable con flechas). */
function optionsField(q, value, onChange, disabled = false) {
  const fs = document.createElement('fieldset');
  fs.className = 'options';
  fs.innerHTML = `<legend class="sr-only">Elige una opción</legend>${q.options.map((o, i) => `
    <label class="option">
      <input type="radio" name="opt-${q.id}" value="${i}" ${Number(value) === i && value !== '' && value != null ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <span class="option-mark" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
      <span class="option-text">${rich(o)}</span>
    </label>`).join('')}`;
  fs.addEventListener('change', (e) => onChange(Number(e.target.value)));
  return fs;
}

async function finishExam() {
  const id = ORDER[state.index];
  if (!isReadable(state.answers[id])) return move(state.index);
  flushTime();
  const missing = ORDER.filter((q) => !hasAnswer(q)).length;
  const ok = await confirmDialog({
    title: '¿Terminar el examen?',
    body: missing ? `Tienes <strong>${missing}</strong> ${missing === 1 ? 'pregunta' : 'preguntas'} sin responder; contarán como incorrectas.` : 'Respondiste todas las preguntas. Ya no podrás cambiar tus respuestas.',
    confirm: 'Terminar y calificar', cancel: 'Seguir revisando',
  });
  if (!ok) { shownAt = Date.now(); return; }
  state.finishedAt = Date.now();
  state.results = scoreExam(state.answers, state.times);
  state.saved = false;
  go('results'); // renderResults envía el registro
}

/* ------------------------------------------------------------------ */
/* Guardado del registro                                               */
/* ------------------------------------------------------------------ */
function buildRecord() {
  const r = state.results;
  return {
    id: state.recordId, version: 1,
    nombre: state.student.nombre, grupo: state.student.grupo,
    inicioMs: state.startedAt, finMs: state.finishedAt, duracionMs: state.finishedAt - state.startedAt,
    notaTeorica: round1(r.theory.score), notaPractica: round1(r.practice.score), notaGlobal: round1(r.global),
    aciertosTeoria: r.theory.correct, aciertosPractica: r.practice.correct,
    respuestas: r.items.map((i) => ({
      id: i.id, parte: i.part, tema: i.topic, respuesta: String(i.text ?? ''), opcion: i.part === 'teoria' ? i.value : null,
      correcta: i.correct, estado: i.status, error: i.correct ? '' : i.msg, errorId: i.errorId || null, tiempoMs: Math.round(i.timeMs),
    })),
    temas: {
      dominados: r.topics.filter((t) => t.dominated).map((t) => t.id),
      repasar: r.topics.filter((t) => !t.dominated).map((t) => t.id),
      detalle: r.topics.map((t) => ({ tema: t.id, dominado: t.dominated, motivo: t.reason })),
    },
    dispositivo: deviceInfo(),
    intentoLocal: state.attempt,
  };
}
const round1 = (n) => Math.round(n * 10) / 10;

async function persistRecord() {
  setSaveStatus('saving');
  try {
    await store.saveRecord(buildRecord());
    state.saved = true;
    save();
    setSaveStatus('saved');
    flushPending();
  } catch (e) {
    console.error(e);
    setSaveStatus('error');
  }
}

function setSaveStatus(kind) {
  const el = document.getElementById('save-status');
  if (!el) return;
  const local = store.mode === 'local';
  const map = {
    saving: `<span class="spinner" aria-hidden="true"></span> Guardando tus resultados…`,
    saved: local ? `${icon('alert')} Guardado solo en este navegador (modo local): el administrador todavía no puede verlo.` : `${icon('check')} Resultados enviados al administrador.`,
    error: `${icon('alert')} No se pudieron enviar tus resultados. Revisa tu conexión. <button class="btn btn-small" id="retry-save">${icon('refresh')} Reintentar</button>`,
  };
  el.dataset.kind = kind === 'saved' && local ? 'warn' : kind;
  el.innerHTML = map[kind];
  document.getElementById('retry-save')?.addEventListener('click', persistRecord);
}

/** Envía los intentos de refuerzo que no se pudieron guardar. */
async function flushPending() {
  if (!state.saved) return;
  for (const [key, a] of Object.entries(state.reinforcement.attempts)) {
    if (a.synced) continue;
    try {
      await store.addReinforcement(state.recordId, attemptEntry(key, a));
      a.synced = true;
      save();
    } catch (e) { console.error(e); return; }
  }
}

/* ------------------------------------------------------------------ */
/* d-e) Resultados y diagnóstico                                        */
/* ------------------------------------------------------------------ */
function scoreCards(r) {
  const card = (label, score, detail, main = false) => `
    <div class="score ${main ? 'score-main' : ''}">
      <p class="score-label">${label}</p>
      <p class="score-value">${fmtScore(score)}<span>/10</span></p>
      <p class="score-detail">${detail}</p>
    </div>`;
  return `<div class="scores">
    ${card('Calificación global', r.global, 'Promedio de ambas partes', true)}
    ${card('Parte teórica', r.theory.score, `${r.theory.correct} de ${r.theory.total} correctas`)}
    ${card('Parte práctica', r.practice.score, `${r.practice.correct} de ${r.practice.total} correctos`)}
  </div>`;
}

function topicList(topics, dominated) {
  const list = topics.filter((t) => t.dominated === dominated);
  if (!list.length) return `<p class="empty">${dominated ? 'Todavía ninguno. El refuerzo te ayudará a dominarlos.' : 'Ninguno: dominas todos los temas evaluados.'}</p>`;
  return `<ul class="topic-list">${list.map((t) => `
    <li class="topic ${dominated ? 'is-ok' : 'is-review'}">
      ${icon(dominated ? 'check' : 'target')}
      <div><p class="topic-name">${esc(t.name)}</p><p class="topic-reason">${rich(t.reason)}</p></div>
    </li>`).join('')}</ul>`;
}

function answerReview(items) {
  return `<ul class="review">${items.map((i) => {
    const isP = i.part === 'practica';
    const ex = isP ? EXERCISES[i.id] : THEORY_BY_ID[i.id];
    const yours = !i.text ? '<span class="muted">Sin respuesta</span>' : isP ? (latexOf(i.text) ? tex(latexOf(i.text)) : esc(i.text)) : rich(i.text);
    const right = isP ? tex(latexOf(ex.answer)) : rich(ex.options[ex.correct]);
    return `<li class="review-item ${i.correct ? 'is-ok' : 'is-bad'}">
      <p class="review-head">${icon(i.correct ? 'check' : 'x')} <strong>${isP ? `Ejercicio ${i.id.slice(1)}` : `Pregunta ${i.id.slice(1)}`}</strong> <span class="muted">· ${fmtDuration(i.timeMs)}</span></p>
      <p class="review-q">${rich(isP ? ex.statement : ex.text)}</p>
      <p>Tu respuesta: ${yours}</p>
      ${i.correct ? '' : `<p>Respuesta correcta: ${right}</p><p class="review-msg">${rich(i.msg)}</p>`}
    </li>`;
  }).join('')}</ul>`;
}

function renderResults() {
  const r = state.results;
  const total = state.finishedAt - state.startedAt;
  render(`
    <header class="page-head">
      <p class="eyebrow">Resultados</p>
      <h1>${esc(state.student.nombre)}</h1>
      <p class="muted">${state.student.grupo ? esc(state.student.grupo) + ' · ' : ''}Tiempo total: <strong>${fmtDuration(total)}</strong></p>
    </header>
    <p class="save-status" id="save-status" role="status"></p>
    ${scoreCards(r)}
    <section class="card">
      <h2 class="card-title">Diagnóstico</h2>
      <div class="diag">
        <div><h3 class="diag-title is-ok">${icon('check')} Temas que dominas</h3>${topicList(r.topics, true)}</div>
        <div><h3 class="diag-title is-review">${icon('target')} Temas que debes repasar</h3>${topicList(r.topics, false)}</div>
      </div>
    </section>
    <div class="cta-row"><button class="btn btn-primary btn-block" id="to-reinforce">${icon('book')} Ir al refuerzo</button></div>
    <details class="card details">
      <summary>Revisar mis respuestas y el tiempo por pregunta</summary>
      ${answerReview(r.items)}
    </details>`);
  setSaveStatus(state.saved ? 'saved' : 'saving');
  if (!state.saved && !persisting) { persisting = true; persistRecord().finally(() => { persisting = false; }); }
  document.getElementById('to-reinforce').addEventListener('click', () => go('reinforce'));
}
let persisting = false;

/* ------------------------------------------------------------------ */
/* 4) Refuerzo                                                          */
/* ------------------------------------------------------------------ */
function topicsToPractice() {
  const review = state.results.topics.filter((t) => !t.dominated);
  if (review.length) return review;
  return state.reinforcement.extra ? state.results.topics : [];
}

function beforeAfter() {
  const after = diagnoseAfter(state.results.topics, state.results.items, state.reinforcement.attempts);
  return `<ul class="ba-list">${after.map((t) => `
    <li class="ba">
      <span class="ba-name">${esc(t.name)}</span>
      <span class="ba-pair">
        <span class="pill ${t.dominated ? 'is-ok' : 'is-review'}"><span class="sr-only">Antes: </span>${t.dominated ? 'Dominado' : 'Por repasar'}</span>
        ${icon('right', 'ba-arrow')}
        <span class="pill ${t.after ? 'is-ok' : 'is-review'}"><span class="sr-only">Después: </span>${t.after ? 'Dominado' : 'Por repasar'}</span>
      </span>
    </li>`).join('')}</ul>`;
}

function renderReinforce() {
  const topics = topicsToPractice();
  const allDominated = !state.results.topics.some((t) => !t.dominated);
  render(`
    <header class="page-head">
      <p class="eyebrow">Refuerzo</p>
      <h1>Practica lo que te faltó</h1>
      <p class="lead">Para cada tema por repasar tienes otro intento de lo que fallaste y dos ejercicios nuevos. Al comprobar tu respuesta (o al pulsar «Ver solución») se abre la explicación completa. Toca las palabras subrayadas para ver su significado.</p>
    </header>
    <section class="card">
      <h2 class="card-title">Diagnóstico: antes y después</h2>
      <p class="muted small">Un tema pasa a «Dominado» cuando aciertas su ejercicio (en el examen o en el reintento), al menos la mitad de sus preguntas teóricas y al menos uno de los dos ejercicios nuevos.</p>
      <div id="ba">${beforeAfter()}</div>
    </section>
    ${allDominated && !state.reinforcement.extra ? `
      <section class="card empty-state">
        ${icon('check', 'empty-icon')}
        <h2 class="card-title">Dominas todos los temas</h2>
        <p>No hay temas por repasar. Si quieres, practica con los ejercicios nuevos de cada tema.</p>
        <button class="btn btn-ghost" id="extra">Practicar de todos modos</button>
      </section>` : ''}
    <div id="topics"></div>
    <div class="cta-row"><button class="btn btn-primary btn-block" id="to-final">Terminar y ver resumen ${icon('right')}</button></div>`);

  const wrap = document.getElementById('topics');
  topics.forEach((t) => wrap.appendChild(topicSection(t)));
  document.getElementById('extra')?.addEventListener('click', () => { state.reinforcement.extra = true; save(); renderReinforce(); });
  document.getElementById('to-final').addEventListener('click', async () => {
    const pending = topics.flatMap((t) => reinforcementItems(t.id, state.results.items)).filter((it) => !state.reinforcement.attempts[it.key]).length;
    if (pending && !(await confirmDialog({ title: '¿Terminar el refuerzo?', body: `Te quedan <strong>${pending}</strong> actividades sin resolver.`, confirm: 'Ver resumen', cancel: 'Seguir practicando' }))) return;
    go('final');
  });
}

function topicSection(t) {
  const sec = document.createElement('section');
  sec.className = 'card topic-card';
  const items = reinforcementItems(t.id, state.results.items);
  sec.innerHTML = `
    <header class="topic-head">
      <p class="eyebrow">${t.dominated ? 'Práctica opcional' : 'Tema por repasar'}</p>
      <h2 class="card-title">${esc(t.name)}</h2>
      ${t.dominated ? '' : `<p class="topic-reason">${rich(t.reason)}</p>`}
    </header>`;
  items.forEach((it, i) => sec.appendChild(activity(it, i + 1)));
  return sec;
}

/** Una actividad de refuerzo (reintento o ejercicio nuevo). */
function activity(it, n) {
  const el = document.createElement('article');
  el.className = 'activity';
  const isTheory = it.part === 'teoria';
  const data = isTheory ? THEORY_BY_ID[it.ref] : EXERCISES[it.ref];
  const label = it.kind === 'reintento' ? `Otro intento · ${isTheory ? `Pregunta ${it.ref.slice(1)}` : `Ejercicio ${it.ref.slice(1)}`}` : 'Ejercicio nuevo';
  el.innerHTML = `
    <p class="q-meta"><span class="chip ${it.kind === 'nuevo' ? 'chip-accent' : ''}">${label}</span><span class="muted">Actividad ${n}</span></p>
    <h3 class="q-title">${rich(isTheory ? data.text : data.statement)}</h3>
    <div class="act-input"></div>
    <div class="act-actions">
      <button class="btn btn-primary" data-act="check">${icon('check')} Comprobar</button>
      <button class="btn btn-ghost" data-act="solution">${icon('bulb')} Ver solución</button>
    </div>
    <div class="act-feedback" role="status"></div>
    <div class="act-explain"></div>`;

  const a = state.reinforcement.attempts[it.key];
  let value = a?.value ?? '';
  let startedAt = 0;
  const inputBox = el.querySelector('.act-input');
  const startTimer = () => { if (!startedAt) startedAt = Date.now(); };
  const field = isTheory
    ? optionsField(data, value, (v) => { value = v; startTimer(); }, !!a)
    : mathInput({ id: `rf-${it.key.replace(':', '-')}`, value, disabled: !!a, onInput: (v) => { value = v; startTimer(); } });
  inputBox.appendChild(field);
  field.addEventListener('focusin', startTimer);

  const showResult = (att) => {
    el.querySelector('.act-actions').hidden = true;
    const fb = el.querySelector('.act-feedback');
    fb.className = `act-feedback ${att.correct ? 'is-ok' : att.viewed ? 'is-info' : 'is-bad'}`;
    fb.innerHTML = att.correct
      ? `${icon('check')} <span><strong>¡Correcto!</strong> Revisa la explicación para afianzar el procedimiento.</span>`
      : att.viewed
        ? `${icon('bulb')} <span>Viste la solución sin responder; cuenta como no resuelto.</span>`
        : `${icon('x')} <span><strong>Todavía no.</strong> ${rich(att.msg)}</span>`;
    el.querySelector('.act-explain').innerHTML = isTheory ? theoryExplanationHtml(data) : explanationHtml(data);
  };
  if (a) showResult(a);

  el.querySelector('.act-actions').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    let att;
    if (btn.dataset.act === 'solution') {
      att = { value: '', correct: false, status: 'solution', viewed: true, msg: 'Vio la solución sin responder.' };
    } else if (isTheory) {
      if (value === '' || value == null) return toast('Elige una opción o pulsa «Ver solución».');
      const ok = Number(value) === data.correct;
      att = { value, correct: ok, status: ok ? 'correct' : 'incorrect', viewed: false, msg: ok ? '' : `Elegiste «${data.options[value]}».` };
    } else {
      const g = grade(value, data);
      if (g.status === 'unreadable') return toast(g.msg, 'error');
      if (g.status === 'empty') return toast('Escribe tu respuesta o pulsa «Ver solución».');
      att = { value, correct: g.status === 'correct', status: g.status, viewed: false, msg: g.status === 'correct' ? '' : g.msg, errorId: g.errorId || null };
    }
    att.timeMs = startedAt ? Date.now() - startedAt : 0;
    att.at = Date.now();
    att.synced = false;
    state.reinforcement.attempts[it.key] = att;
    save();
    field.querySelectorAll('input, button').forEach((x) => { x.disabled = true; });
    showResult(att);
    document.getElementById('ba').innerHTML = beforeAfter();
    el.querySelector('.act-feedback').focus?.();
    flushPending();
  });
  return el;
}

function attemptEntry(key, a) {
  const [kind, ref] = key.split(':');
  return {
    rid: `${key.replace(':', '-')}`, tipo: 'intento', clave: key, ref,
    clase: kind === 'retry' ? 'reintento' : 'nuevo',
    tema: (EXERCISES[ref] || THEORY_BY_ID[ref]).topic,
    respuesta: a.viewed ? '' : String(THEORY_BY_ID[ref] && a.value !== '' ? THEORY_BY_ID[ref].options[a.value] : a.value),
    correcta: a.correct, vioSolucion: !!a.viewed, estado: a.status, error: a.correct ? '' : (a.msg || ''),
    tiempoMs: Math.round(a.timeMs || 0), fechaMs: a.at,
  };
}

/* ------------------------------------------------------------------ */
/* f) Resumen final                                                     */
/* ------------------------------------------------------------------ */
function renderFinal() {
  const r = state.results;
  const after = diagnoseAfter(r.topics, r.items, state.reinforcement.attempts);
  const atts = Object.values(state.reinforcement.attempts);
  const okCount = atts.filter((a) => a.correct).length;
  const domBefore = r.topics.filter((t) => t.dominated).length;
  const domAfter = after.filter((t) => t.after).length;
  render(`
    <header class="page-head">
      <p class="eyebrow">Resumen final</p>
      <h1>Buen trabajo, ${esc(state.student.nombre.split(' ')[0])}</h1>
      <p class="lead">Dominabas <strong>${domBefore}</strong> de 10 temas al terminar el examen y ahora dominas <strong>${domAfter}</strong>.</p>
    </header>
    ${scoreCards(r)}
    <section class="card">
      <h2 class="card-title">Refuerzo</h2>
      <p>${atts.length ? `Resolviste <strong>${atts.length}</strong> actividades y acertaste <strong>${okCount}</strong>.` : 'No resolviste actividades de refuerzo.'}</p>
      ${beforeAfter()}
    </section>
    <p class="save-status" id="save-status" role="status"></p>
    <div class="cta-row cta-split">
      <button class="btn btn-ghost" id="dl">${icon('download')} Descargar mis resultados (JSON)</button>
      <button class="btn btn-ghost" id="back">${icon('book')} Volver al refuerzo</button>
      <button class="btn btn-primary" id="restart">${icon('refresh')} Empezar un nuevo intento</button>
    </div>`);
  setSaveStatus(state.saved ? 'saved' : 'error');
  document.getElementById('dl').addEventListener('click', () => {
    const data = { ...buildRecord(), refuerzo: Object.entries(state.reinforcement.attempts).map(([k, a]) => attemptEntry(k, a)) };
    downloadFile(`resultados-${state.student.nombre.replace(/\W+/g, '-').toLowerCase()}.json`, JSON.stringify(data, null, 2), 'application/json');
  });
  document.getElementById('back').addEventListener('click', () => go('reinforce'));
  document.getElementById('restart').addEventListener('click', async () => {
    if (!(await confirmDialog({ title: '¿Empezar un nuevo intento?', body: 'Se borrará tu avance en este navegador. Tus resultados anteriores ya quedaron registrados.', confirm: 'Empezar de nuevo' }))) return;
    state = null;
    try { localStorage.removeItem(KEY); } catch { /* ignorado */ }
    renderWelcome();
  });
  saveSummary(after, atts.length, okCount);
}

/** Guarda (una vez por visita a esta pantalla) el resumen antes/después. */
async function saveSummary(after, total, ok) {
  if (!state.saved) return;
  await flushPending();
  try {
    await store.addReinforcement(state.recordId, {
      rid: `resumen-${Date.now()}`, tipo: 'resumen', fechaMs: Date.now(),
      antes: after.filter((t) => t.dominated).map((t) => t.id),
      despues: after.filter((t) => t.after).map((t) => t.id),
      resumen: { actividades: total, aciertos: ok },
    });
  } catch (e) { console.error(e); }
}

/* ------------------------------------------------------------------ */
/* Arranque                                                             */
/* ------------------------------------------------------------------ */
const SCREENS = { welcome: renderWelcome, exam: renderExam, results: renderResults, reinforce: renderReinforce, final: renderFinal };

setupGlossary();
if (state && SCREENS[state.screen]) SCREENS[state.screen]();
else renderWelcome();
