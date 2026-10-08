/**
 * Calificación del examen y diagnóstico por tema (lógica pura, sin DOM).
 *
 * Regla de dominio: un tema está «dominado» si el alumno acierta su ejercicio
 * práctico Y al menos la mitad de sus preguntas teóricas.
 * Después del refuerzo: cada elemento cuenta como acertado si se acertó en el examen
 * o en el reintento, y además debe acertar al menos 1 de los 2 ejercicios nuevos.
 */
import { grade } from './math-engine.js';
import { PRACTICE, THEORY, BANK, TOPICS, TOPIC_IDS } from './exam-data.js';

const PASS_MSG = { empty: 'No respondiste este ejercicio.' };

/** Califica la parte teórica y la práctica. answers: { id: valor } (teoría: índice de opción). */
export function scoreExam(answers, times = {}) {
  const theory = THEORY.map((q) => {
    const value = answers[q.id];
    const answered = value !== undefined && value !== null && value !== '';
    return {
      id: q.id, part: 'teoria', topic: q.topic,
      value: answered ? Number(value) : null,
      text: answered ? q.options[value] : '',
      correct: answered && Number(value) === q.correct,
      status: answered ? (Number(value) === q.correct ? 'correct' : 'incorrect') : 'empty',
      msg: answered ? (Number(value) === q.correct ? 'Correcta.' : `Fallaste la pregunta sobre ${q.concept}.`) : 'Sin respuesta.',
      timeMs: times[q.id] || 0,
    };
  });
  const practice = PRACTICE.map((ex) => {
    const value = answers[ex.id] ?? '';
    const g = grade(value, ex);
    return {
      id: ex.id, part: 'practica', topic: ex.topic, value, text: value,
      correct: g.status === 'correct', status: g.status === 'unreadable' ? 'empty' : g.status,
      msg: g.status === 'unreadable' ? 'Respuesta ilegible (no se pudo leer).' : (PASS_MSG[g.status] || g.msg),
      errorId: g.errorId || null, timeMs: times[ex.id] || 0,
    };
  });
  const tc = theory.filter((q) => q.correct).length;
  const pc = practice.filter((q) => q.correct).length;
  const theoryScore = (tc / THEORY.length) * 10;
  const practiceScore = (pc / PRACTICE.length) * 10;
  return {
    items: [...theory, ...practice],
    theory: { correct: tc, total: THEORY.length, score: theoryScore },
    practice: { correct: pc, total: PRACTICE.length, score: practiceScore },
    global: (theoryScore + practiceScore) / 2,
    topics: diagnose([...theory, ...practice]),
  };
}

/** Diagnóstico por tema a partir de los resultados del examen. */
export function diagnose(items) {
  return TOPIC_IDS.map((tid) => {
    const p = items.find((i) => i.part === 'practica' && i.topic === tid);
    const th = items.filter((i) => i.part === 'teoria' && i.topic === tid);
    const thOk = th.filter((i) => i.correct).length;
    const practiceOk = !!p?.correct;
    const theoryOk = thOk >= th.length / 2;
    const n = p.id.slice(1);
    let reason;
    if (practiceOk && theoryOk) {
      reason = `Resolviste bien el ejercicio ${n} y acertaste ${thOk} de ${th.length} ${th.length === 1 ? 'pregunta teórica' : 'preguntas teóricas'}.`;
    } else {
      const parts = [];
      if (!practiceOk) parts.push(p.status === 'empty' ? `No respondiste el ejercicio ${n}.` : `Ejercicio ${n}: ${p.msg}`);
      th.filter((i) => !i.correct).forEach((i) => parts.push(i.status === 'empty' ? 'Dejaste sin responder una pregunta teórica del tema.' : i.msg));
      reason = parts.join(' ');
    }
    return { id: tid, name: TOPICS[tid].name, dominated: practiceOk && theoryOk, practiceOk, theoryCorrect: thOk, theoryTotal: th.length, reason };
  });
}

/** Lista de actividades de refuerzo para un tema por repasar. */
export function reinforcementItems(topicId, items) {
  // Primero el ejercicio práctico reprobado, luego las preguntas teóricas falladas.
  const failed = items.filter((i) => i.topic === topicId && !i.correct).sort((a, b) => (a.part === 'practica' ? -1 : 1) - (b.part === 'practica' ? -1 : 1));
  return [
    ...failed.map((i) => ({ key: `retry:${i.id}`, kind: 'reintento', ref: i.id, part: i.part, topic: topicId })),
    ...BANK.filter((b) => b.topic === topicId).map((b) => ({ key: `new:${b.id}`, kind: 'nuevo', ref: b.id, part: 'practica', topic: topicId })),
  ];
}

/**
 * Diagnóstico «después» del refuerzo.
 * attempts: { key: { correct: bool } } con las claves de reinforcementItems.
 */
export function diagnoseAfter(before, items, attempts) {
  return before.map((t) => {
    if (t.dominated) return { ...t, after: true };
    const ok = (id) => items.find((i) => i.id === id)?.correct || attempts[`retry:${id}`]?.correct;
    const p = items.find((i) => i.part === 'practica' && i.topic === t.id);
    const th = items.filter((i) => i.part === 'teoria' && i.topic === t.id);
    const thOk = th.filter((i) => ok(i.id)).length;
    const newOk = BANK.filter((b) => b.topic === t.id).some((b) => attempts[`new:${b.id}`]?.correct);
    return { ...t, after: !!ok(p.id) && thOk >= th.length / 2 && newOk };
  });
}
