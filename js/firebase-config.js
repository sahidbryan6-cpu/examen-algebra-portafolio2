/**
 * Configuración web de Firebase.
 *
 * Estos valores NO son secretos: identifican el proyecto y la seguridad real
 * la dan las reglas de Firestore (firestore.rules). La contraseña del
 * administrador NUNCA va aquí ni en ningún archivo del repositorio.
 *
 * Mientras FIREBASE_CONFIG.apiKey esté vacío, el sitio funciona en «modo local»:
 * los resultados se guardan solo en el navegador del alumno y el administrador NO los ve.
 */
export const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

/** Correo de la cuenta de administrador (debe coincidir con firestore.rules). */
export const ADMIN_EMAIL = '';
