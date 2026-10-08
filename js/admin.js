/**
 * Panel privado del administrador: inicio de sesión (Firebase Auth), tabla de alumnos
 * en tiempo real, detalle por alumno, estadísticas del grupo, exportación y borrado.
 * Todo dato escrito por alumnos se inserta como texto escapado (esc / textContent).
 */
import * as store from './store.js';
import { PRACTICE, THEORY, EXERCISES, THEORY_BY_ID, TOPICS, TOPIC_IDS } from './exam-data.js';
import { latexOf } from './math-engine.js';
import { icon, esc, rich, tex, confirmDialog, toast, fmtDuration, fmtDate, fmtScore, downloadFile } from './ui.js';

const root = document.getElementById('admin');
const who = document.getElementById('who');

let records = [];
let unsubscribe = null;
let firstSnapshot = true;
let tab = 'alumnos';
let sort = { key: 'finMs', dir: -1 };
const filters = { q: '', from: '', to: '', min: '', max: '' };
const charts = [];

/* ------------------------------------------------------------------ */
/* Inicio de sesión                                                    */
/* ------------------------------------------------------------------ */
function renderLogin(message = '') {
  const local = store.mode === 'local';
  who.textContent = '';
  root.innerHTML = `
    <form class="card login-card" id="login" novalidate>
      <p class="eyebrow">${icon('lock')} Acceso privado</p>
      <h1>Iniciar sesión</h1>
      <p class="muted">Solo el administrador puede ver los resultados de los alumnos.</p>
      ${local ? `<p class="notice notice-warn">${icon('alert')} <span>Firebase todavía no está configurado en este sitio, así que no se puede iniciar sesión y los resultados de los alumnos se quedan en sus propios navegadores.</span></p>` : ''}
      <div class="field">
        <label class="field-label" for="email">Correo</label>
        <input id="email" type="email" autocomplete="username" required ${local ? 'disabled' : ''} value="${esc(store.adminEmail)}">
      </div>
      <div class="field">
        <label class="field-label" for="password">Contraseña</label>
        <input id="password" type="password" autocomplete="current-password" required ${local ? 'disabled' : ''}>
      </div>
      <p class="field-error" id="login-error" role="alert" ${message ? '' : 'hidden'}>${icon('alert')} <span>${esc(message)}</span></p>
      <button class="btn btn-primary btn-block" type="submit" ${local ? 'disabled' : ''}>${icon('lock')} Entrar</button>
      ${local ? `<button class="btn btn-ghost btn-block" type="button" id="local-view" style="margin-top:.75rem">${icon('eye')} Ver datos guardados en este navegador</button>` : ''}
    </form>`;
  const form = document.getElementById('login');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Entrando…';
    try {
      await store.login(form.email.value.trim(), form.password.value);
    } catch (err) {
      const code = err?.code || '';
      renderLogin(code.includes('invalid') || code.includes('wrong-password') || code.includes('user-not-found')
        ? 'Correo o contraseña incorrectos.'
        : code.includes('too-many') ? 'Demasiados intentos. Espera unos minutos.' : 'No se pudo iniciar sesión. Revisa tu conexión.');
    }
  });
  document.getElementById('local-view')?.addEventListener('click', () => startDashboard('Modo local · datos de este navegador'));
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */
async function startDashboard(label) {
  who.textContent = label;
  root.innerHTML = `
    <div class="admin-bar">
      <div>
        <p class="eyebrow">${icon('shield')} Panel del administrador</p>
        <h1>Resultados del grupo</h1>
      </div>
      <button class="btn btn-ghost btn-small" id="logout">${icon('logout')} ${store.isCloud ? 'Cerrar sesión' : 'Salir'}</button>
    </div>
    <div class="kpis" id="kpis"></div>
    <div class="tabs" role="tablist" aria-label="Secciones del panel">
      <button class="tab" role="tab" id="tab-alumnos" aria-controls="panel" data-tab="alumnos">${icon('user')} Alumnos</button>
      <button class="tab" role="tab" id="tab-estadisticas" aria-controls="panel" data-tab="estadisticas">${icon('chart')} Estadísticas</button>
    </div>
    <section id="panel" role="tabpanel" style="margin-top:1rem"><div class="loading" role="status"><span class="spinner" aria-hidden="true"></span> Cargando registros…</div></section>`;
  document.getElementById('logout').addEventListener('click', async () => {
    unsubscribe?.();
    await store.logout();
    if (!store.isCloud) renderLogin();
  });
  root.querySelector('.tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (b) { tab = b.dataset.tab; renderPanel(); }
  });
  root.querySelector('.tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    tab = tab === 'alumnos' ? 'estadisticas' : 'alumnos';
    renderPanel();
    document.getElementById(`tab-${tab}`).focus();
  });
  firstSnapshot = true;
  unsubscribe = await store.subscribeRecords((list, added = []) => {
    const prev = new Set(records.map((r) => r.id));
    records = list;
    if (!firstSnapshot) added.filter((id) => !prev.has(id)).forEach((id) => toast(`Nuevo resultado: ${list.find((r) => r.id === id)?.nombre || 'alumno'}`, 'ok'));
    renderKpis();
    renderPanel(firstSnapshot ? [] : added);
    firstSnapshot = false;
  }, (err) => {
    console.error(err);
    document.getElementById('panel').innerHTML = stateBox('alert', 'No se pudieron cargar los registros.', err?.code === 'permission-denied' ? 'Esta cuenta no tiene permiso de administrador.' : 'Revisa tu conexión e intenta de nuevo.');
  });
}

function stateBox(ic, title, text) {
  return `<div class="card state-box">${icon(ic)}<p><strong>${esc(title)}</strong></p><p>${esc(text)}</p></div>`;
}

/* ---------- Indicadores ---------- */
function attemptsByStudent() {
  const map = new Map();
  records.forEach((r) => { const k = normName(r); map.set(k, (map.get(k) || 0) + 1); });
  return map;
}
const normName = (r) => `${String(r.nombre || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}|${String(r.grupo || '').trim().toLowerCase()}`;

function renderKpis() {
  const n = records.length;
  const avg = n ? records.reduce((s, r) => s + (r.notaGlobal || 0), 0) / n : 0;
  const pass = n ? records.filter((r) => r.notaGlobal >= 6).length / n : 0;
  const weak = topicWeakness()[0];
  document.getElementById('kpis').innerHTML = [
    ['Exámenes terminados', n],
    ['Promedio global', n ? fmtScore(avg) : '—'],
    ['Aprobados (≥ 6)', n ? `${Math.round(pass * 100)} %` : '—'],
    ['Tema más débil', n && weak ? `<span style="font-size:1rem;font-family:var(--font-body);font-weight:700">${esc(weak.name)}</span>` : '—'],
  ].map(([l, v]) => `<div class="kpi"><p class="kpi-label">${l}</p><p class="kpi-value">${v}</p></div>`).join('');
}

function renderPanel(highlight = []) {
  document.querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.tab === tab;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
  });
  charts.splice(0).forEach((c) => c.destroy());
  if (tab === 'alumnos') renderTable(highlight); else renderStats();
}

/* ---------- Tabla de alumnos ---------- */
const COLUMNS = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'grupo', label: 'Grupo' },
  { key: 'inicioMs', label: 'Inicio', fmt: fmtDate },
  { key: 'finMs', label: 'Fin', fmt: fmtDate },
  { key: 'duracionMs', label: 'Duración', fmt: fmtDuration, num: true },
  { key: 'notaTeorica', label: 'Teórica', grade: true },
  { key: 'notaPractica', label: 'Práctica', grade: true },
  { key: 'notaGlobal', label: 'Global', grade: true },
  { key: 'intentos', label: 'Intentos', num: true },
  { key: 'dispositivo', label: 'Dispositivo', get: (r) => r.dispositivo?.tipo || '' },
  { key: 'navegador', label: 'Navegador', get: (r) => [r.dispositivo?.navegador, r.dispositivo?.so].filter(Boolean).join(' · ') },
  { key: 'idioma', label: 'Idioma', get: (r) => r.dispositivo?.idioma || '' },
  { key: 'pantalla', label: 'Pantalla', get: (r) => r.dispositivo?.pantalla || '' },
];
const cellValue = (r, c, attempts) => (c.key === 'intentos' ? attempts.get(normName(r)) : c.get ? c.get(r) : r[c.key]);

function filtered() {
  const q = filters.q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const from = filters.from ? new Date(filters.from + 'T00:00').getTime() : -Infinity;
  const to = filters.to ? new Date(filters.to + 'T23:59:59').getTime() : Infinity;
  const min = filters.min === '' ? -Infinity : Number(filters.min);
  const max = filters.max === '' ? Infinity : Number(filters.max);
  const attempts = attemptsByStudent();
  const col = COLUMNS.find((c) => c.key === sort.key);
  return records
    .filter((r) => !q || normName(r).includes(q))
    .filter((r) => r.finMs >= from && r.finMs <= to && r.notaGlobal >= min && r.notaGlobal <= max)
    .sort((a, b) => {
      const va = cellValue(a, col, attempts), vb = cellValue(b, col, attempts);
      return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va ?? '').localeCompare(String(vb ?? ''), 'es')) * sort.dir;
    });
}

function gradeClass(n) { return n < 6 ? 'low' : n < 8 ? 'mid' : 'high'; }

function renderTable(highlight = []) {
  const panel = document.getElementById('panel');
  if (!panel.querySelector('#filters')) {
    panel.innerHTML = `
      <div class="filters" id="filters">
        <div class="field"><label class="field-label" for="f-q">Buscar por nombre</label><div class="search">${icon('search')}<input id="f-q" type="search" placeholder="Nombre o grupo"></div></div>
        <div class="field"><label class="field-label" for="f-from">Desde</label><input id="f-from" type="date"></div>
        <div class="field"><label class="field-label" for="f-to">Hasta</label><input id="f-to" type="date"></div>
        <div class="field"><label class="field-label" for="f-min">Calif. mínima</label><input id="f-min" type="number" min="0" max="10" step="0.1" inputmode="decimal"></div>
        <div class="field"><label class="field-label" for="f-max">Calif. máxima</label><input id="f-max" type="number" min="0" max="10" step="0.1" inputmode="decimal"></div>
      </div>
      <div class="table-actions">
        <p class="muted small" id="count" role="status" style="margin:0"></p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn btn-ghost btn-small" id="csv">${icon('download')} Exportar CSV</button>
          <button class="btn btn-ghost btn-small" id="json">${icon('download')} Exportar JSON</button>
        </div>
      </div>
      <div id="table"></div>`;
    const bind = (id, key) => panel.querySelector(id).addEventListener('input', (e) => { filters[key] = e.target.value; drawRows(); });
    bind('#f-q', 'q'); bind('#f-from', 'from'); bind('#f-to', 'to'); bind('#f-min', 'min'); bind('#f-max', 'max');
    Object.entries({ '#f-q': 'q', '#f-from': 'from', '#f-to': 'to', '#f-min': 'min', '#f-max': 'max' }).forEach(([id, k]) => { panel.querySelector(id).value = filters[k]; });
    panel.querySelector('#csv').addEventListener('click', exportCsv);
    panel.querySelector('#json').addEventListener('click', exportJson);
  }
  drawRows(highlight);
}

function drawRows(highlight = []) {
  const list = filtered();
  const attempts = attemptsByStudent();
  document.getElementById('count').textContent = `${list.length} de ${records.length} registros`;
  const box = document.getElementById('table');
  if (!records.length) { box.innerHTML = stateBox('user', 'Todavía no hay resultados.', 'Cuando un alumno termine el examen aparecerá aquí automáticamente.'); return; }
  if (!list.length) { box.innerHTML = stateBox('search', 'Ningún registro coincide con los filtros.', 'Cambia la búsqueda o las fechas.'); return; }
  box.innerHTML = `
    <div class="table-wrap">
      <table>
        <caption class="sr-only">Resultados de los alumnos. Pulsa una fila para ver el detalle.</caption>
        <thead><tr>${COLUMNS.map((c) => `<th scope="col" aria-sort="${sort.key === c.key ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}"><button data-sort="${c.key}">${c.label}</button></th>`).join('')}</tr></thead>
        <tbody>${list.map((r) => `<tr tabindex="0" data-id="${esc(r.id)}" class="${highlight.includes(r.id) ? 'is-new' : ''}">${COLUMNS.map((c) => {
          const v = cellValue(r, c, attempts);
          if (c.grade) return `<td class="num"><span class="grade ${gradeClass(v)}">${fmtScore(v ?? 0)}</span></td>`;
          return `<td class="${c.num ? 'num' : ''}">${esc(c.fmt ? c.fmt(v) : v ?? '')}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>`;
  box.querySelector('thead').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sort]');
    if (!b) return;
    sort = { key: b.dataset.sort, dir: sort.key === b.dataset.sort ? -sort.dir : 1 };
    drawRows();
    box.querySelector(`[data-sort="${sort.key}"]`).focus();
  });
  const open = (tr) => tr && openDetail(records.find((r) => r.id === tr.dataset.id));
  box.querySelector('tbody').addEventListener('click', (e) => open(e.target.closest('tr')));
  box.querySelector('tbody').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(e.target.closest('tr')); } });
}

/* ---------- Exportar ---------- */
function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // evita fórmulas al abrir en Excel
  return `"${s.replace(/"/g, '""')}"`;
}
function exportCsv() {
  const attempts = attemptsByStudent();
  const head = [...COLUMNS.map((c) => c.label), 'Temas dominados', 'Temas por repasar', ...PRACTICE.map((p) => `Ej ${p.id.slice(1)}`), ...THEORY.map((q) => `P ${q.id.slice(1)}`)];
  const rows = filtered().map((r) => [
    ...COLUMNS.map((c) => { const v = cellValue(r, c, attempts); return c.fmt ? c.fmt(v) : v; }),
    (r.temas?.dominados || []).map((t) => TOPICS[t]?.name).join('; '),
    (r.temas?.repasar || []).map((t) => TOPICS[t]?.name).join('; '),
    ...[...PRACTICE, ...THEORY].map((q) => { const a = (r.respuestas || []).find((x) => x.id === q.id); return a ? `${a.correcta ? 'Bien' : 'Mal'}: ${a.respuesta}` : ''; }),
  ]);
  downloadFile(`resultados-algebra-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
}
function exportJson() {
  const clean = filtered().map(({ creado, ...r }) => r);
  downloadFile(`resultados-algebra-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(clean, null, 2), 'application/json');
}

/* ------------------------------------------------------------------ */
/* Detalle por alumno                                                   */
/* ------------------------------------------------------------------ */
function openDetail(r) {
  if (!r) return;
  const d = document.createElement('dialog');
  d.className = 'drawer';
  d.setAttribute('aria-labelledby', 'detail-title');
  const dev = r.dispositivo || {};
  const tm = (r.temas?.detalle || []);
  d.innerHTML = `
    <div class="drawer-head">
      <h2 id="detail-title" style="margin:0">${esc(r.nombre)}</h2>
      <button class="btn btn-ghost btn-small" data-close aria-label="Cerrar detalle">${icon('x')} Cerrar</button>
    </div>
    <div class="drawer-body">
      <div class="scores">
        ${[['Global', r.notaGlobal], ['Teórica', r.notaTeorica], ['Práctica', r.notaPractica]].map(([l, v], i) => `<div class="score ${i === 0 ? 'score-main' : ''}"><p class="score-label">${l}</p><p class="score-value">${fmtScore(v)}<span>/10</span></p></div>`).join('')}
      </div>
      <section class="card">
        <h3 class="card-title">Datos del intento</h3>
        <dl class="meta-grid">
          ${[['Grupo', r.grupo || '—'], ['Inicio', fmtDate(r.inicioMs)], ['Fin', fmtDate(r.finMs)], ['Duración', fmtDuration(r.duracionMs)],
            ['Intento en su dispositivo', r.intentoLocal], ['Dispositivo', `${dev.tipo || ''} · ${dev.so || ''}`], ['Navegador', dev.navegador], ['Idioma', dev.idioma],
            ['Pantalla', dev.pantalla], ['Ventana', dev.ventana]].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v ?? '—')}</dd></div>`).join('')}
        </dl>
      </section>
      <section class="card">
        <h3 class="card-title">Diagnóstico</h3>
        <div class="diag">
          <div><h4 class="diag-title is-ok">${icon('check')} Dominados</h4><ul class="topic-list">${tm.filter((t) => t.dominado).map((t) => `<li class="topic is-ok"><div><p class="topic-name">${esc(TOPICS[t.tema]?.name)}</p><p class="topic-reason">${rich(t.motivo)}</p></div></li>`).join('') || '<p class="empty">Ninguno</p>'}</ul></div>
          <div><h4 class="diag-title is-review">${icon('target')} Por repasar</h4><ul class="topic-list">${tm.filter((t) => !t.dominado).map((t) => `<li class="topic is-review"><div><p class="topic-name">${esc(TOPICS[t.tema]?.name)}</p><p class="topic-reason">${rich(t.motivo)}</p></div></li>`).join('') || '<p class="empty">Ninguno</p>'}</ul></div>
        </div>
      </section>
      <section class="card">
        <h3 class="card-title">Respuestas</h3>
        <ul class="review">${(r.respuestas || []).map(answerRow).join('')}</ul>
      </section>
      <section class="card">
        <h3 class="card-title">Refuerzo</h3>
        <div id="refuerzo"><div class="loading" role="status"><span class="spinner" aria-hidden="true"></span> Cargando…</div></div>
      </section>
      <button class="btn btn-danger btn-block" data-delete>${icon('trash')} Eliminar este registro</button>
    </div>`;
  document.body.appendChild(d);
  let stop = () => {};
  d.addEventListener('close', () => { stop(); d.remove(); });
  d.querySelector('[data-close]').addEventListener('click', () => d.close());
  d.querySelector('[data-delete]').addEventListener('click', async () => {
    const ok = await confirmDialog({ title: '¿Eliminar el registro?', body: `Se borrará definitivamente el examen de <strong>${esc(r.nombre)}</strong> y su refuerzo. Esta acción no se puede deshacer.`, confirm: 'Eliminar', danger: true });
    if (!ok) return;
    try { await store.deleteRecord(r.id); toast('Registro eliminado.', 'ok'); d.close(); if (!store.isCloud) { records = records.filter((x) => x.id !== r.id); renderKpis(); renderPanel(); } }
    catch (e) { console.error(e); toast('No se pudo eliminar el registro.', 'error'); }
  });
  d.showModal();
  store.subscribeReinforcement(r.id, (list) => { d.querySelector('#refuerzo').innerHTML = reinforcementHtml(list); }, () => {
    d.querySelector('#refuerzo').innerHTML = '<p class="empty">No se pudo cargar el refuerzo.</p>';
  }).then((fn) => { stop = fn; });
}

function answerRow(a) {
  const isP = a.parte === 'practica';
  const q = isP ? EXERCISES[a.id] : THEORY_BY_ID[a.id];
  if (!q) return '';
  const yours = !a.respuesta ? '<span class="muted">Sin respuesta</span>' : isP ? (latexOf(a.respuesta) ? `${tex(latexOf(a.respuesta))} <code>${esc(a.respuesta)}</code>` : `<code>${esc(a.respuesta)}</code>`) : esc(a.respuesta);
  const right = isP ? tex(latexOf(q.answer)) : rich(q.options[q.correct]);
  return `<li class="review-item ${a.correcta ? 'is-ok' : 'is-bad'}">
    <p class="review-head">${icon(a.correcta ? 'check' : 'x')} <strong>${isP ? `Ejercicio ${a.id.slice(1)}` : `Pregunta ${a.id.slice(1)}`}</strong>
      <span class="badge ${a.correcta ? 'ok' : 'bad'}">${a.correcta ? 'Acertó' : 'Falló'}</span> <span class="muted">${icon('clock')} ${fmtDuration(a.tiempoMs)}</span></p>
    <p class="review-q">${rich(isP ? q.statement : q.text)}</p>
    <p>Escribió: ${yours}</p>
    <p>Correcta: ${right}</p>
    ${a.correcta ? '' : `<p class="review-msg"><strong>Error detectado:</strong> ${rich(a.error)}</p>`}
  </li>`;
}

function reinforcementHtml(list) {
  const tries = list.filter((e) => e.tipo === 'intento').sort((a, b) => (a.fechaMs || 0) - (b.fechaMs || 0));
  const summary = list.filter((e) => e.tipo === 'resumen').sort((a, b) => (b.fechaMs || 0) - (a.fechaMs || 0))[0];
  if (!tries.length && !summary) return '<p class="empty">El alumno todavía no ha hecho actividades de refuerzo.</p>';
  const name = (id) => esc(TOPICS[id]?.name || id);
  return `
    ${summary ? `<p><strong>Antes:</strong> ${summary.antes.length} temas dominados · <strong>Después:</strong> ${summary.despues.length} temas dominados (${summary.resumen?.aciertos ?? 0} aciertos en ${summary.resumen?.actividades ?? 0} actividades).</p>
      <p class="small muted">Dominados después: ${summary.despues.map(name).join(', ') || 'ninguno'}</p>` : ''}
    <ul class="review">${tries.map((e) => `<li class="review-item ${e.correcta ? 'is-ok' : 'is-bad'}">
      <p class="review-head">${icon(e.correcta ? 'check' : e.vioSolucion ? 'bulb' : 'x')} <strong>${e.clase === 'reintento' ? 'Reintento' : 'Nuevo'} · ${name(e.tema)}</strong>
        <span class="badge ${e.correcta ? 'ok' : e.vioSolucion ? 'info' : 'bad'}">${e.correcta ? 'Acertó' : e.vioSolucion ? 'Vio la solución' : 'Falló'}</span>
        <span class="muted">${icon('clock')} ${fmtDuration(e.tiempoMs)}</span></p>
      <p class="review-q">${rich(EXERCISES[e.ref]?.statement || THEORY_BY_ID[e.ref]?.text || '')}</p>
      ${e.respuesta ? `<p>Escribió: <code>${esc(e.respuesta)}</code></p>` : ''}
      ${e.error && !e.correcta && !e.vioSolucion ? `<p class="review-msg">${rich(e.error)}</p>` : ''}
    </li>`).join('')}</ul>`;
}

/* ------------------------------------------------------------------ */
/* Estadísticas                                                         */
/* ------------------------------------------------------------------ */
function topicWeakness() {
  return TOPIC_IDS.map((t) => ({
    id: t, name: TOPICS[t].name,
    pct: records.length ? (records.filter((r) => (r.temas?.repasar || []).includes(t)).length / records.length) * 100 : 0,
  })).sort((a, b) => b.pct - a.pct);
}

function hitRate(id) {
  const withQ = records.filter((r) => (r.respuestas || []).some((a) => a.id === id));
  return withQ.length ? (withQ.filter((r) => r.respuestas.find((a) => a.id === id).correcta).length / withQ.length) * 100 : 0;
}

function renderStats() {
  const panel = document.getElementById('panel');
  if (!records.length) { panel.innerHTML = stateBox('chart', 'Sin datos todavía.', 'Las gráficas aparecerán cuando haya resultados.'); return; }
  panel.innerHTML = `
    <div class="charts">
      <section class="card chart-wide"><h2 class="card-title">Porcentaje de aciertos por ejercicio práctico</h2><div class="chart-box"><canvas id="c-prac" role="img" aria-label="Gráfica de barras del porcentaje de aciertos en cada ejercicio práctico"></canvas></div></section>
      <section class="card chart-wide"><h2 class="card-title">Porcentaje de aciertos por pregunta teórica</h2><div class="chart-box"><canvas id="c-theo" role="img" aria-label="Gráfica de barras del porcentaje de aciertos en cada pregunta teórica"></canvas></div></section>
      <section class="card"><h2 class="card-title">Temas más débiles</h2><p class="muted small">Porcentaje de alumnos que deben repasar cada tema.</p><div class="chart-box chart-tall"><canvas id="c-weak" role="img" aria-label="Ranking de temas por porcentaje de alumnos que deben repasarlos"></canvas></div></section>
      <section class="card"><h2 class="card-title">Distribución de calificaciones globales</h2><p class="muted small">Número de alumnos por rango de calificación.</p><div class="chart-box chart-tall"><canvas id="c-dist" role="img" aria-label="Histograma de calificaciones globales"></canvas></div></section>
    </div>`;
  if (!window.Chart) { panel.insertAdjacentHTML('afterbegin', `<p class="notice notice-warn">${icon('alert')} No se pudo cargar la librería de gráficas.</p>`); return; }
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  Chart.defaults.font.family = v('--font-body');
  Chart.defaults.color = v('--ink-2');
  Chart.defaults.borderColor = v('--line');
  const pctAxis = { min: 0, max: 100, ticks: { callback: (x) => `${x} %` } };
  const base = (labels, data, opts = {}) => ({
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: opts.color || v('--accent'), borderRadius: 6, maxBarThickness: 46 }] },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: opts.horizontal ? 'y' : 'x',
      animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 500 },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => opts.count ? ` ${c.raw} alumnos` : ` ${Math.round(c.raw)} %` } } },
      scales: opts.count ? { y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Alumnos' } }, x: { title: { display: true, text: 'Calificación global' } } }
        : opts.horizontal ? { x: pctAxis } : { y: pctAxis },
    },
  });
  charts.push(new Chart(document.getElementById('c-prac'), base(PRACTICE.map((p) => `Ej. ${p.id.slice(1)}`), PRACTICE.map((p) => hitRate(p.id)))));
  charts.push(new Chart(document.getElementById('c-theo'), base(THEORY.map((q) => `P${q.id.slice(1)}`), THEORY.map((q) => hitRate(q.id)))));
  const weak = topicWeakness();
  charts.push(new Chart(document.getElementById('c-weak'), base(weak.map((w) => w.name), weak.map((w) => w.pct), { horizontal: true, color: v('--warn') })));
  const bins = Array.from({ length: 10 }, (_, i) => records.filter((r) => Math.min(9, Math.floor(r.notaGlobal)) === i).length);
  charts.push(new Chart(document.getElementById('c-dist'), base(bins.map((_, i) => `${i}–${i + 1}`), bins, { count: true })));
}

/* ------------------------------------------------------------------ */
/* Arranque                                                             */
/* ------------------------------------------------------------------ */
store.onAuth(async (user) => {
  if (!store.isCloud) return renderLogin();
  unsubscribe?.();
  records = [];
  if (!user) return renderLogin();
  if (user.email !== store.adminEmail) {
    await store.logout();
    return renderLogin('Esta cuenta no tiene permisos de administrador.');
  }
  startDashboard(user.email);
});
