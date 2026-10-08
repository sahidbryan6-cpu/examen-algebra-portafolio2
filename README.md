# Examen de Álgebra · Portafolio 2

Examen diagnóstico interactivo (sitio estático, sin compilación): parte teórica (12 preguntas) y práctica (10 ejercicios del Portafolio 2), diagnóstico por tema, refuerzo con explicaciones paso a paso y panel privado del administrador.

- Alumno: `index.html`
- Administrador: `admin.html` (también responde en `/admin`)

## Estructura

| Archivo | Contenido |
| --- | --- |
| `js/exam-data.js` | Enunciados, clave, preguntas teóricas, banco de refuerzo, explicaciones, glosario |
| `js/math-engine.js` | Parser y motor de equivalencia algebraica, revisión de forma (simplificado / factorizado) |
| `js/scoring.js` | Calificación y diagnóstico por tema |
| `js/app.js` · `js/admin.js` | Interfaz del alumno y del administrador |
| `js/store.js` · `js/firebase-config.js` | Datos (Firebase o modo local) |
| `firestore.rules` | Reglas de seguridad |
| `tests/verify.mjs` | Prueba automática de las 30 respuestas y de los errores típicos |

## Pruebas

```bash
node tests/verify.mjs
```

## Conectar Firebase (plan gratuito)

1. En <https://console.firebase.google.com> crea un proyecto.
2. **Authentication → Método de acceso**: activa *Correo electrónico/contraseña*. En **Usuarios → Agregar usuario** crea la cuenta del administrador con tu correo y una contraseña segura (la contraseña nunca va en el código).
3. **Authentication → Configuración → Acciones del usuario**: desactiva *Habilitar la creación de cuentas* para que nadie más pueda registrarse.
4. **Firestore Database → Crear base de datos** (modo producción).
5. **Firestore → Reglas**: pega el contenido de `firestore.rules` reemplazando `__ADMIN_EMAIL__` por tu correo y publica.
6. **Configuración del proyecto → Tus apps → Web (`</>`)**: registra una app y copia el objeto `firebaseConfig` en `js/firebase-config.js`; escribe tu correo en `ADMIN_EMAIL`.
7. **Authentication → Configuración → Dominios autorizados**: agrega `<usuario>.github.io`.

Mientras `js/firebase-config.js` esté vacío, el sitio funciona en **modo local**: los resultados se quedan en el navegador del alumno (que puede descargarlos en JSON) y el administrador **no** los ve.
