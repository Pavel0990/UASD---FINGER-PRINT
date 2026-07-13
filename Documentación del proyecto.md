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

---

## Plan: Sistema de Feriados en Asistencia + Pago Doble

### Resumen
Integrar feriados en el sistema de asistencia para que:
1. Se excluyan del denominador en reportes y KPIs
2. Aparezcan como "Feriado" con indicador visual en el grid semanal
3. Trabajo en feriado = pago doble como tipo de eventualidad

### Modelo de negocio
- **Feriado = se excluye del conteo** — No cuenta como presente ni ausente
- **Trabajo en feriado = pago doble** — Se registra como eventualidad tipo "Trabajo en feriado"
- **Reportes** — El feriado aparece con badge azul especial, se retira del denominador
- **Base legal** — Art. 68 Código de Trabajo DR: feriados son días pagados

---

### Cambio 1: Nuevo tipo EVENT_TYPE
**Archivo:** `dashboard.jsx:1590-1596`

Agregar al mapa `EVENT_TYPE`:
```js
trabajo_feriado: { label_es: 'Trabajo en feriado', label_en: 'Holiday work', cls: 'badge--info' }
```

Badge azul para diferenciar de los demás tipos.

---

### Cambio 2: Filtrar feriados en FaltasSemanalReport
**Archivo:** `reports.jsx:659-875`

- Importar `isHoliday` (de `shared.jsx`)
- En generación de días (líneas 682-696): marcar días feriados con `isHoliday: true`
- En renderización de celdas (líneas 834-857): celda azul con icono `calendar1`
- En conteo de faltas (línea 826): excluir días feriados
- Agregar "Feriado" a la leyenda (líneas 757-770)

**Diseño celda feriado:**
```
Fondo: rgba(59,130,246,0.10)
Icono: calendar1 (12px)
Color: #3b82f6
Tooltip: "Feriado — {nombre}"
```

---

### Cambio 3: Filtrar feriados en StrikesReport
**Archivo:** `reports.jsx:412-511`

- Importar `isHoliday`
- Filtrar ausencias: excluir las que caigan en feriados (líneas 418-429)
- Actualizar badge "total ausencias"

---

### Cambio 4: Filtrar feriados en Dashboard KPIs
**Archivo:** `dashboard.jsx:2166-2171`

- En `unjustifiedThisMonth`: agregar `!isHoliday(a.date)` al filtro
- Afecta `StrikeBadge` en tabla de empleados (línea 2742)

---

### Cambio 5: Filtrar feriados en AbsenceSection
**Archivo:** `dashboard.jsx:1130`

- Excluir feriados del conteo de "OUT" (ya excluye del datepicker)

---

### Cambio 6: Prevenir ausencias en Finca/Liceo
**Archivos:** `finca.jsx:1350-1363`, `liceo.jsx:1286-1298`

- Agregar `!isHoliday(viewDate)` antes de crear ausencias

---

### Cambio 7: Actualizar leyenda del grid
**Archivo:** `reports.jsx:757-770`

Agregar cuarto ítem:
```jsx
<span style={{ background:'rgba(59,130,246,0.10)', color:'#3b82f6' }}>📅</span>
<span>Feriado</span>
```

---

### Archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `dashboard.jsx` | EVENT_TYPE, KPIs, AbsenceSection |
| `reports.jsx` | StrikesReport, FaltasSemanalReport, badge feriado, leyenda |
| `finca.jsx` | `!isHoliday()` check |
| `liceo.jsx` | `!isHoliday()` check |

---

### Orden de implementación
1. Nuevo tipo EVENT_TYPE (dashboard.jsx)
2. Filtrar KPIs + AbsenceSection (dashboard.jsx)
3. Filtrar StrikesReport (reports.jsx)
4. Filtrar FaltasSemanalReport + badge feriado (reports.jsx)
5. Prevenir ausencias en Finca/Liceo
6. Verificar CSS badge--info
