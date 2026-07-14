# UASD - FINGERPRINT — Notas del proyecto

## Visión general
Sistema de registro biométrico de asistencia para la UASD. Prototipo en React (JSX + Babel en el navegador), bilingüe (ES/EN).

Pantallas: terminal de marcaje (kiosk), login, dashboard de empleados, registro + captura de huella, reportes.

## Arquitectura de archivos
- `UASD Fingerprint System.html` — entrada; carga fuentes, estilos y todos los .jsx.
- `styles.css` — tokens de diseño + todos los estilos.
- `shared.jsx` — diccionario de textos bilingüe (I18N), iconos, componentes comunes (TopBar, Crest, etc.), helpers (formatTime/formatDate).
- `store.jsx` — puente frontend↔backend (DataStore, apiFetch, sesión JWT). Se carga justo después de `shared.jsx`.
- `kiosk.jsx` — terminal de marcaje (vista principal de reconocimiento).
- `login.jsx`, `dashboard.jsx`, `register.jsx`, `reports.jsx` — demás vistas.
- `fingerprint.jsx` — componente del lector/escáner reutilizable.
- `app.jsx` — router + Tweaks.
- `backend/` — servidor Node/Express + Prisma + PostgreSQL (ver sección "Backend" abajo).

## Backend (Node + Express + Prisma + PostgreSQL)
Fase 1 implementada (2026-07-14): Empleados, Auth (JWT + refresh cookie httpOnly),
Roles/Permisos/Asignaciones y Auditoría ya persisten en Postgres real, vía
`backend/` (Express sirve también los estáticos del frontend en el mismo puerto
8080 — reemplaza `python3 -m http.server`). Arranque: `bash "Abrir sistema.command"`
(o `cd backend && npm run dev`). Seed: `cd backend && npm run seed`.

**Patrón de integración — "dual-path"**: los helpers `get*/save*` de
`shared.jsx`/`roles.jsx`/`changelog.jsx` (empleados, departamentos, roles,
asignaciones, credenciales, audit log) chequean `isBackendActive()`
(= `DataStore.session` no nulo, definido en `store.jsx`). Con sesión activa,
leen/escriben contra la API real; sin sesión (app sin login, arranque dev por
defecto en `dashboard`), siguen exactamente igual que antes sobre
`localStorage`. `EMPLOYEES` pasó de `const` a `let` y se muta EN SITIO
(`EMPLOYEES.length = 0; EMPLOYEES.push(...)`) en `bootstrapStore()` — así
`dashboard.jsx`/`finca.jsx`/`liceo.jsx`/`vacaciones.jsx`/`register.jsx`, que
hacen `EMPLOYEES.find/.filter/.map` directo, funcionan sin tocarles una línea.

**Dominios pendientes** (siguen 100% en `localStorage`, fases futuras):
Asistencia (`attendance_events`/`absences`), Finca, Liceo, Eventualidades,
Vacaciones, Feriados. El diseño de esas tablas ya está en el plan
`~/.claude/plans/adaptive-mapping-whisper.md` de la sesión que hizo la Fase 1.

**Local dev**: Postgres corre vía Homebrew (`brew services start postgresql@16`),
base de datos `uasd_fingerprint`, `DATABASE_URL` en `backend/.env` (no versionado).

## Sistema tipográfico (mantener consistente en TODAS las pantallas)
- **Serif** (Source Serif 4) → títulos grandes / display.
- **Manrope** (sans) → UI, texto, etiquetas, botones.
- **JetBrains Mono** → datos (hora, cédulas, códigos, IDs, horarios).
- Texto secundario de "chrome" (subtítulos, fechas, pies) → capitalización natural, NO mayúsculas forzadas.
- Micro-etiquetas de datos (ID, Cédula, encabezados de tabla, KPIs) → mayúsculas pequeñas con tracking.

## ⚠️ FUTURO: posible cambio de Huella → Face ID en la vista principal
El cliente anticipa que el método de reconocimiento del terminal principal podría
cambiar de **huella dactilar** a **reconocimiento facial (Face ID)**. Diseñar y editar
pensando en que ese intercambio sea de bajo impacto:

- Mantener la LÓGICA de reconocimiento separada de la PRESENTACIÓN. En `kiosk.jsx`,
  `startScan()` es el único punto que decide el resultado (éxito/error, entrada/salida).
  Al conectar hardware real (huella o cámara) se reemplaza SOLO ese bloque (está marcado).
- El visual del lector vive en `fingerprint.jsx` (`FingerprintScanner`). Para Face ID se
  añadiría un componente equivalente (p. ej. `FaceScanner`) con los MISMOS estados
  (`idle | scanning | success | error`) y la misma animación de barrido/anillos, y el
  terminal elegiría cuál mostrar — idealmente vía una sola variable de modo
  (p. ej. `recognitionMode: 'fingerprint' | 'face'`).
- Los textos que mencionan "dedo"/"huella" están en el diccionario I18N (`shared.jsx`):
  `kiosk_title`, `kiosk_scanning`, `kiosk_ready`, `kiosk_not_recognized`, etc.
  Para Face ID solo se cambian/duplican esas claves ("Mire a la cámara…", etc.).
- La tarjeta de reconocimiento (RecognizedCard) y el cartel de error (ErrorCard) son
  AGNÓSTICOS al método — no asumen huella, así que se reutilizan tal cual.

Conclusión: para migrar a Face ID se tocan 3 puntos acotados — el componente visual del
lector, las claves de texto del kiosk, y el bloque de `startScan()`. No reescribir la
estructura del terminal ni las tarjetas de resultado.

## Modelo Estado vs. Eventualidad (empleado)
Son dos modelos separados, cada uno con una responsabilidad distinta. No deben
mezclarse ni sincronizarse entre sí — la división es por severidad/efecto, no por tema.

- **Estado** (`StatusPicker`/`StatusBadge`, `dashboard.jsx`) — clasificación única y
  vigente del empleado: `ok | pending | inactive(+reason) | custom`. Es un **gate
  funcional real**: `status !== 'ok'` saca al empleado del pool de reconocimiento del
  kiosco (`kiosk.jsx`), del roster de Finca (`finca.jsx`) y de los reportes
  (`reports.jsx`). Úsalo para situaciones **serias/prolongadas** que ameritan sacar al
  empleado del sistema mientras duren: licencia médica, licencia de
  maternidad/paternidad, estudio, comisión de servicio, personal (`inactive` + reason
  `other`, con detalle `licenseType/licenseStart/licenseEnd` en el modal de edición).

- **Eventualidad** (`EventualidadSection`, `dashboard.jsx`, persistida en
  `localStorage['uasd_eventualidades']`) — registro histórico por fecha/rango que
  **justifica un día de marcaje sin sacar al empleado del sistema** (sigue `ok`, sigue
  marcando). Tipos: `eventualidad` (trabajo extra), `dia_libre`, `permiso`,
  `servicio_feriado`. Al guardar una, borra ausencias existentes en esas fechas y al
  editar/eliminar puede regenerar ausencias en los días que dejan de estar cubiertos.

`licencia_familiar` y `licencia_medica` existieron antes como tipos de Eventualidad y
se quitaron (2026-07) porque duplicaban lo que ya cubre Estado → Lic. laboral. Si se
necesita una licencia corta que no amerite sacar al empleado del sistema, no se debe
re-agregar esos tipos a Eventualidad — evaluar primero si encaja en `permiso`.

## Notas de edición
- El componente `T` en `shared.jsx` (renderiza títulos con `<strong>`) NO debe llevar
  texto hijo: usa solo `dangerouslySetInnerHTML`. Si se le agrega texto directo se rompe
  ("Can only set one of children or dangerouslySetInnerHTML"). Editar el texto del título
  en la clave `kiosk_title` del diccionario, no sobre el elemento.
