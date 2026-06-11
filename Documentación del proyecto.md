# UASD - FINGERPRINT — Notas del proyecto

## Visión general
Sistema de registro biométrico de asistencia para la UASD. Prototipo en React (JSX + Babel en el navegador), bilingüe (ES/EN).

Pantallas: terminal de marcaje (kiosk), login, dashboard de empleados, registro + captura de huella, reportes.

## Arquitectura de archivos
- `UASD Fingerprint System.html` — entrada; carga fuentes, estilos y todos los .jsx.
- `styles.css` — tokens de diseño + todos los estilos.
- `shared.jsx` — diccionario de textos bilingüe (I18N), iconos, componentes comunes (TopBar, Crest, etc.), helpers (formatTime/formatDate).
- `kiosk.jsx` — terminal de marcaje (vista principal de reconocimiento).
- `login.jsx`, `dashboard.jsx`, `register.jsx`, `reports.jsx` — demás vistas.
- `fingerprint.jsx` — componente del lector/escáner reutilizable.
- `app.jsx` — router + Tweaks.

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

## Notas de edición
- El componente `T` en `shared.jsx` (renderiza títulos con `<strong>`) NO debe llevar
  texto hijo: usa solo `dangerouslySetInnerHTML`. Si se le agrega texto directo se rompe
  ("Can only set one of children or dangerouslySetInnerHTML"). Editar el texto del título
  en la clave `kiosk_title` del diccionario, no sobre el elemento.
