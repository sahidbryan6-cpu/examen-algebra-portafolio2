/**
 * Capa de datos. Usa Firebase (Firestore + Authentication) si está configurado;
 * si no, guarda en el navegador («modo local», que el administrador NO puede ver).
 *
 * Estructura en Firestore:
 *   registros/{id}                 → un examen terminado (solo creación desde el alumno)
 *   registros/{id}/refuerzo/{rid}  → cada intento de refuerzo y el resumen final
 *
 * Para pruebas locales con el emulador de Firebase: abrir en localhost con ?emu=1.
 */
import { FIREBASE_CONFIG, ADMIN_EMAIL } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';
const LOCAL_KEY = 'algebra.registrosLocales.v1';

const params = new URLSearchParams(location.search);
const useEmulator = ['localhost', '127.0.0.1'].includes(location.hostname) && params.has('emu');

export const mode = useEmulator ? 'emulator' : FIREBASE_CONFIG.apiKey ? 'cloud' : 'local';
export const isCloud = mode !== 'local';
export const adminEmail = useEmulator ? 'admin@example.com' : ADMIN_EMAIL;

let fb = null;
/** Carga el SDK de Firebase solo cuando hace falta. */
async function firebase() {
  if (fb) return fb;
  const [app, fs, auth] = await Promise.all([
    import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-firestore.js`), import(`${SDK}/firebase-auth.js`),
  ]);
  const config = useEmulator ? { apiKey: 'demo-key', projectId: 'demo-algebra', authDomain: 'localhost' } : FIREBASE_CONFIG;
  const instance = app.initializeApp(config);
  const db = fs.getFirestore(instance);
  const a = auth.getAuth(instance);
  if (useEmulator) {
    fs.connectFirestoreEmulator(db, '127.0.0.1', 8080);
    auth.connectAuthEmulator(a, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  fb = { fs, auth, db, a };
  return fb;
}

/* --------------------------- Modo local --------------------------- */
function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
}
function writeLocal(list) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch { /* almacenamiento lleno o bloqueado */ }
}

/* --------------------------- Alumno ------------------------------- */

/** Crea el registro del examen terminado. */
export async function saveRecord(record) {
  if (!isCloud) {
    writeLocal([...readLocal().filter((r) => r.id !== record.id), { ...record, refuerzo: [] }]);
    return;
  }
  const { fs, db } = await firebase();
  await fs.setDoc(fs.doc(db, 'registros', record.id), { ...record, creado: fs.serverTimestamp() });
}

/** Agrega un intento de refuerzo (o el resumen final) al registro. */
export async function addReinforcement(recordId, entry) {
  if (!isCloud) {
    const list = readLocal();
    const r = list.find((x) => x.id === recordId);
    if (r) { r.refuerzo = [...(r.refuerzo || []).filter((e) => e.rid !== entry.rid), entry]; writeLocal(list); }
    return;
  }
  const { fs, db } = await firebase();
  await fs.setDoc(fs.doc(db, 'registros', recordId, 'refuerzo', entry.rid), { ...entry, creado: fs.serverTimestamp() });
}

/** Solo para la prueba de seguridad: intenta leer registros sin ser administrador. */
export async function tryPublicRead() {
  const { fs, db } = await firebase();
  return fs.getDocs(fs.collection(db, 'registros'));
}

/* --------------------------- Administrador ------------------------ */

export async function onAuth(cb) {
  if (!isCloud) return cb(null);
  const { auth, a } = await firebase();
  auth.onAuthStateChanged(a, cb);
}

export async function login(email, password) {
  const { auth, a } = await firebase();
  return auth.signInWithEmailAndPassword(a, email, password);
}

export async function logout() {
  if (!isCloud) return;
  const { auth, a } = await firebase();
  return auth.signOut(a);
}

/** Escucha en tiempo real todos los registros. Devuelve la función para dejar de escuchar. */
export async function subscribeRecords(onData, onError) {
  if (!isCloud) {
    const emit = () => onData(readLocal());
    emit();
    const h = (e) => { if (e.key === LOCAL_KEY) emit(); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }
  const { fs, db } = await firebase();
  const q = fs.query(fs.collection(db, 'registros'), fs.orderBy('finMs', 'desc'));
  return fs.onSnapshot(q, (snap) => {
    const added = snap.docChanges().filter((c) => c.type === 'added').map((c) => c.doc.id);
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })), added);
  }, onError);
}

/** Escucha en tiempo real el refuerzo de un alumno. */
export async function subscribeReinforcement(recordId, onData, onError) {
  if (!isCloud) {
    onData(readLocal().find((r) => r.id === recordId)?.refuerzo || []);
    return () => {};
  }
  const { fs, db } = await firebase();
  return fs.onSnapshot(fs.collection(db, 'registros', recordId, 'refuerzo'), (snap) => onData(snap.docs.map((d) => d.data())), onError);
}

/** Elimina un registro y su refuerzo. */
export async function deleteRecord(recordId) {
  if (!isCloud) { writeLocal(readLocal().filter((r) => r.id !== recordId)); return; }
  const { fs, db } = await firebase();
  const subs = await fs.getDocs(fs.collection(db, 'registros', recordId, 'refuerzo'));
  const batch = fs.writeBatch(db);
  subs.forEach((d) => batch.delete(d.ref));
  batch.delete(fs.doc(db, 'registros', recordId));
  await batch.commit();
}
