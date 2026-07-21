/* reports.jsx — attendance analytics (datos reales del sistema, sin mocks) */

/* Color fijo por departamento real de la UASD — no depende de posición
   alfabética ni de cuántos departamentos existan (eso fue lo que se rompió
   con "Economato" sin empleados: agregar/quitar un departamento corría el
   índice de todos los demás). El nombre completo mapea directo a un color
   elegido a mano por lo que mejor representa a ese departamento (Tesorería
   → dorado/dinero, Sistemas e Informática → violeta/tech, Rectoría → navy/
   autoridad, etc.) — agregar un departamento nuevo nunca cambia el color de
   los que ya existían. */
const DEPT_COLORS = {
  'Rectoría':                 '#C8CFDE', // gris casi blanco — pedido explícito
  'Sistemas e Informática':   '#5C3D6B', // violeta — tecnología
  'Tesorería':                '#A67C3D', // dorado/ocre — finanzas
  'Facultad de Ingeniería':   '#3D4F8C', // índigo — técnico/preciso
  'Facultad de Humanidades':  '#7A2E3D', // vino — académico clásico
  'Facultad de Ciencias':     '#3D8B6E', // verde científico — distinto del sage de Mantenimiento y del teal de Biblioteca (antes sin entrada propia, caía en el fallback por hash y le tocaba el mismo azul marino que Registro, #1B2A4A — visible solo en el donut ampliado, que no agrupa "Otros")
  'Biblioteca Central':       '#35707D', // azul-teal — conocimiento, calma
  'Recursos Humanos':         '#D18C7C', // rosa cálido — personas/calidez (antes #B98A96 y luego #C38E8A: en ambos el canal verde quedaba casi empatado con el azul, dándole un dejo morado/mauve; aquí el verde se despega claramente del azul en todo el degradado del anillo, sin ambigüedad hacia violeta)
  'Comunicaciones':           '#5FA3A6', // cian — conectividad
  'Registro':                 '#1B2A4A', // navy — institucional/oficial
  'Seguridad':                '#43434A', // carbón — serio/vigilancia
  'Mantenimiento':            '#6E8B5A', // verde salvia — operativo/industrial
  'Caja':                     '#B5602E', // terracota — efectivo/metal cálido
  'Data':                     '#A78BC4', // lavanda — digital, distinto del violeta de Sistemas
  'Economato':                '#9C5049', // ladrillo — almacén/insumos
};
// Fallback para un departamento futuro que no esté en el mapa de arriba —
// determinístico por nombre (mismo nombre siempre cae en el mismo color),
// no aleatorio, para que la primera vez que aparezca no "salte" de color en
// cada re-render.
const DEPT_COLOR_FALLBACK = ['#1B2A4A','#7A2E3D','#3D4F8C','#A67C3D','#C38E8A','#B5602E','#A78BC4','#C8CFDE','#9C5049','#43434A','#35707D','#5C3D6B','#6E8B5A','#5FA3A6'];
function colorForDept(name) {
  if (DEPT_COLORS[name]) return DEPT_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return DEPT_COLOR_FALLBACK[hash % DEPT_COLOR_FALLBACK.length];
}

/* Convierte un mapa {nombre: cantidad} en la distribución coloreada que
   arma la leyenda por departamento — usado por buildActiveNowDist (activos
   ahora). */
function distFromCounts(counts, topN, otherLabel) {
  const full = Object.keys(counts)
    .map((name) => ({ name, value: counts[name], color: colorForDept(name) }))
    .sort((a, b) => b.value - a.value);
  if (!topN || full.length <= topN) return full;
  const top = full.slice(0, topN);
  // Siempre se agrega "Otros", incluso en 0 — si el guard fuera `restValue > 0`,
  // en activos-ahora (donde casi todos los deptos están en 0 fuera de horario)
  // el bucket desaparecía en vez de mostrarse en 0, y esos departamentos quedaban
  // fuera de la leyenda por completo en vez de agrupados.
  const restValue = full.slice(topN).reduce((s, d) => s + d.value, 0);
  top.push({ name: otherLabel, value: restValue, color: 'var(--ink-200)' });
  return top;
}

function todayKey() { return new Date().toLocaleDateString('en-CA').slice(0, 7); }
function todayISO()  { return new Date().toLocaleDateString('en-CA'); }

/* Distribución de "activos ahora" por departamento — empleados con marcaje
   de ENTRADA hoy que todavía no tienen marcaje de SALIDA (siguen en el
   recinto). Los que no tienen a nadie adentro ahora mismo no aparecen (no
   tiene sentido listar un departamento vacío en "quién está presente").
   `topN` agrupa la cola en un bucket "Otros" — se usa en la tarjeta
   compacta (donde no cabe cada departamento) pero no en el modal ampliado,
   que desglosa todos los reales sin agrupar. */
function buildActiveNowDist(emps, attRecords, topN, otherLabel) {
  const counts = {};
  const today = todayISO();
  attRecords.forEach(a => {
    if (a.date !== today || a.timeOut) return;
    const emp = emps.find(e => e.id === a.empId);
    if (emp) counts[emp.dept] = (counts[emp.dept] || 0) + 1;
  });
  return distFromCounts(counts, topN, otherLabel);
}

function loadAttendance() {
  try { return JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}'); } catch { return {}; }
}
function loadAbsences() {
  try { return JSON.parse(localStorage.getItem('uasd_absences') || '{}'); } catch { return {}; }
}

/* "08:14:32 AM" → 8 · "01:05:00 PM" → 13 */
function parseHour24(timeStr) {
  const m = /(\d+):(\d+).*?(AM|PM)/i.exec(timeStr || '');
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (/PM/i.test(m[3])) h += 12;
  return h;
}

/* "08:14:32 AM" → 494 (minutos desde medianoche) */
function parseTimeToMinutes(timeStr) {
  const m = /(\d+):(\d+).*?(AM|PM)/i.exec(timeStr || '');
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (/PM/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
}

/* Horas trabajadas entre entrada y salida — null si falta la salida o el
   dato es inconsistente (salida antes que entrada). */
function hoursBetween(timeIn, timeOut) {
  if (!timeOut) return null;
  const a = parseTimeToMinutes(timeIn);
  const b = parseTimeToMinutes(timeOut);
  if (a === null || b === null || b < a) return null;
  return (b - a) / 60;
}

function countWeekdays(year, month0, throughDay) {
  const last = throughDay || new Date(year, month0 + 1, 0).getDate();
  let n = 0;
  for (let d = 1; d <= last; d++) {
    const dow = new Date(year, month0, d).getDay();
    if (dow >= 1 && dow <= 5) n++;
  }
  return n;
}

/* Curva suave (cardinal simplificado) + área rellena, mapeando valores reales
   a un viewBox fijo — usado por AreaChart. */
function buildAreaPath(values, w, h, padX, padTop, padBottom) {
  const n = values.length;
  const maxV = Math.max(1, ...values);
  const plotW = w - padX * 2;
  const baseY = h - padBottom;
  const plotH = baseY - padTop;
  const pts = values.map((v, i) => ({
    x: padX + (n > 1 ? i * (plotW / (n - 1)) : plotW / 2),
    y: padTop + (1 - v / maxV) * plotH,
  }));
  // Línea recta punto a punto (sin curva bezier) — cada día se conecta al
  // siguiente con un segmento recto, con un punto marcado en cada dato
  // (referencia: gráfico de líneas con puntos conectados).
  let line = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) line += ` L${pts[i].x},${pts[i].y}`;
  const area = `${line} L${pts[n - 1].x},${baseY} L${pts[0].x},${baseY} Z`;
  return { line, area, pts, baseY };
}

/* ── AreaChart — gráfica de línea con degradado, grid y tooltip en el punto
   destacado (mismo lenguaje visual en Asistencia diaria y Tendencia de tardanzas) ── */
/* clamp: la línea guía y el punto quedan en la posición real del dato, pero
   el globo de texto se mueve un poco hacia adentro cerca de los bordes para
   que nunca se salga del contenedor (eso era lo que rompía el layout en
   móvil — un tooltip desbordado empuja TODA la página a scroll horizontal).
   Margen angosto (6/94) porque el tooltip ahora es una sola palabra corta —
   con el margen viejo (10/90), pensado para el texto de dos líneas de antes,
   el punto de HOY (el más a la derecha, el que se ve por defecto) quedaba
   notoriamente desalineado del círculo. */
const clampPct = (pct) => Math.min(94, Math.max(6, pct));

/* Colorea cada TRAMO de la línea según si sube o baja respecto al día
   anterior (verde/rojo, como un gráfico bursátil) — en vez de partir el
   trazo en N <path> separados (perdería el dibujo/glow/sobrecarga que ya
   corren sobre un solo path), se arma un linearGradient con paradas dobles
   en la posición x de cada punto: mismo offset con dos colores = corte
   duro, sin degradado, justo en el vértice de cada subida/bajada. */
function buildTrendStops(values, pts, w) {
  const segColor = (i) => {
    const diff = values[i] - values[i - 1];
    if (diff > 0) return 'var(--success)';
    if (diff < 0) return 'var(--danger)';
    return null; // sin cambio — usa el color neutro de por sí
  };
  const n = pts.length;
  if (n < 2) return null;
  const stops = [{ offset: 0, color: segColor(1) }];
  for (let i = 1; i < n - 1; i++) {
    const off = (pts[i].x / w) * 100;
    stops.push({ offset: off, color: segColor(i) });
    stops.push({ offset: off, color: segColor(i + 1) });
  }
  stops.push({ offset: 100, color: segColor(n - 1) });
  return stops;
}

/* Contador "escáner" — como el scouter de Vegeta cuando mide el ki de
   alguien: al cambiar de valor, los dígitos escanean números al azar por un
   instante y frenan en el número real. Muestra el marcaje del día
   seleccionado en Asistencia diaria (arranca en null así el primer valor
   real también dispara el escaneo). */
function ScouterCounter({ value, inline, large, color }) {
  const [display, setDisplay] = React.useState(value);
  const [scanning, setScanning] = React.useState(false);
  const prevValue = React.useRef(null);

  React.useEffect(() => {
    if (value === prevValue.current) return;
    prevValue.current = value;
    setScanning(true);
    const digits = String(Math.max(value, 9)).length;
    const randMax = Math.pow(10, digits);
    let ticks = 0;
    const id = setInterval(() => {
      ticks++;
      if (ticks >= 9) {
        clearInterval(id);
        setDisplay(value);
        setScanning(false);
        return;
      }
      setDisplay(Math.floor(Math.random() * randMax));
    }, 45);
    return () => clearInterval(id);
  }, [value]);

  return (
    <div className={`rep-scouter ${scanning ? 'rep-scouter--scanning' : ''} ${inline ? 'rep-scouter--inline' : ''} ${large ? 'rep-scouter--lg' : ''}`}
      style={color ? { color, '--scouter-accent': color } : undefined}>
      {display}
    </div>
  );
}

function AreaChart({ values, labels, color, gradId, formatValue, emptyLabel, slowDraw, counter, trend, onActiveChange, expanded }) {
  // Modal expandido: viewBox más alto (proporción 400:230 en vez de 400:170)
  // para llenar más del espacio real disponible ahí — pero manteniendo un
  // solo factor de escala uniforme (width:100%; height:auto en CSS), sin
  // forzar height:100% con stretch no-uniforme, que distorsionaba la línea
  // y los puntos (se veían "estirados").
  const W = 400, H = expanded ? 230 : 170, PAD_X = 26, PAD_TOP = counter ? 32 : 18, PAD_BOTTOM = 20;
  const hasData = values.some(v => v > 0);
  // Memoizado: arrastrar sobre el gráfico (onPointerMove) re-renderiza este
  // componente en cada pixel de movimiento vía el estado local selectedIdx,
  // pero el path en sí no depende de qué punto está seleccionado — sin esto
  // se reconstruía el string del path completo en cada uno de esos renders.
  const { line, area, pts } = React.useMemo(
    () => buildAreaPath(values, W, H, PAD_X, PAD_TOP, PAD_BOTTOM),
    [values, W, H, PAD_X, PAD_TOP, PAD_BOTTOM]
  );
  const gridYs = [PAD_TOP, PAD_TOP + (H - PAD_TOP - PAD_BOTTOM) / 2, H - PAD_BOTTOM];
  const trendStops = trend && hasData ? buildTrendStops(values, pts, W) : null;
  const trendGradId = `${gradId}-trend`;
  const lineStroke = trendStops ? `url(#${trendGradId})` : color;

  // `last7` (de donde salen `values`/`labels`) siempre son los últimos 7 días
  // terminando HOY — el último índice es siempre hoy y nunca hay un día
  // futuro en el arreglo, así que "no dejar seleccionar días que aún no
  // llegan" ya queda garantizado por los datos mismos, no hace falta clamp.
  const todayIdx = values.length - 1;

  const svgRef = React.useRef(null);
  const draggingRef = React.useRef(false);
  // Seleccionado por el usuario (clic/tap), arranca en HOY — ya no sigue el
  // mouse solo por pasar por encima; hay que hacer clic o arrastrar para
  // moverlo, así el usuario elige el día en vez de que "se mueva solo".
  const [selectedIdx, setSelectedIdx] = React.useState(todayIdx);
  const activeIdx = hasData ? Math.min(selectedIdx, todayIdx) : -1;
  const active = hasData && activeIdx >= 0 ? pts[activeIdx] : null;
  const activeValue = hasData ? values[activeIdx] : 0;

  // El contador puede vivir fuera del gráfico (p. ej. junto al botón de
  // expandir, en el header de la tarjeta) — cuando el padre pasa
  // onActiveChange, este avisa el valor del día seleccionado hacia arriba
  // en vez de (o además de) dibujarlo internamente.
  React.useEffect(() => {
    if (onActiveChange) onActiveChange(activeValue);
  }, [activeValue, onActiveChange]);

  const selectFromClientX = (clientX) => {
    const svg = svgRef.current;
    if (!svg || !hasData) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const relX = ((clientX - rect.left) / rect.width) * W;
    let nearest = 0, nearestDist = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(p.x - relX); if (d < nearestDist) { nearestDist = d; nearest = i; } });
    setSelectedIdx(nearest);
  };

  // Pointer events unifican mouse y touch: clic simple selecciona, y si se
  // mantiene presionado y se arrastra, va "escaneando" día por día (drag).
  const onPointerDown = (e) => {
    draggingRef.current = true;
    svgRef.current?.setPointerCapture?.(e.pointerId);
    selectFromClientX(e.clientX);
  };
  const onPointerMove = (e) => { if (draggingRef.current) selectFromClientX(e.clientX); };
  const onPointerUp = () => { draggingRef.current = false; };

  return (
    <>
      <div className="rep-area-chart">
        {counter && <ScouterCounter value={activeValue} large={expanded} color={color}/>}
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
          className={hasData ? 'rep-area-chart__svg--live' : ''}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}>
          {gridYs.map((y, i) => <line key={i} x1="0" y1={y} x2={W} y2={y} stroke="var(--ink-100)" strokeWidth="1"/>)}
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.30"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
            {trendStops && (
              <linearGradient id={trendGradId} x1="0%" y1="0" x2="100%" y2="0">
                {trendStops.map((s, i) => <stop key={i} offset={`${s.offset}%`} stopColor={s.color || color}/>)}
              </linearGradient>
            )}
          </defs>
          {hasData && <path key={`fill-${values.join(',')}`} className={`rep-area-fill-draw ${slowDraw ? 'rep-area-fill-draw--slow' : ''}`} d={area} fill={`url(#${gradId})`}/>}
          {hasData && <path key={`line-${values.join(',')}`} className={`rep-area-draw ${slowDraw ? 'rep-area-draw--slow' : ''}`} pathLength="1" d={line} fill="none" stroke={lineStroke} strokeWidth={expanded ? 3.5 : 2.5} strokeLinecap="round"/>}
          {/* "Sobrecarga" — un trazo blanco corto que recorre la línea en loop
              por encima del color base, como un pulso de energía viajando por
              el cable. Mismo `d` que la línea real, pathLength=1 normaliza el
              largo real para que el dash-offset funcione igual sin importar
              la forma de la curva. */}
          {hasData && <path d={line} fill="none" pathLength="1" className="rep-area-overload"
            stroke="#fff" strokeWidth={expanded ? 3.5 : 2.5} strokeLinecap="round" strokeDasharray="0.09 0.91"/>}
          {/* Punto marcado en cada dato — no solo en el activo (referencia:
              gráfico de líneas con puntos conectados). */}
          {hasData && pts.map((p, i) => i !== activeIdx && (
            <circle key={i} cx={p.x} cy={p.y} r={expanded ? 5 : 3.5} fill="var(--paper)" stroke={color} strokeWidth={expanded ? 2.5 : 2}/>
          ))}
          {active && <>
            <line x1={active.x} y1={active.y} x2={active.x} y2={H - PAD_BOTTOM} stroke="var(--ink-300)" strokeWidth="1" strokeDasharray="3,4"/>
            <circle cx={active.x} cy={active.y} r={expanded ? 7 : 5} fill="var(--paper)" stroke={color} strokeWidth={expanded ? 3 : 2.5}/>
          </>}
        </svg>
        {!hasData && <div className="rep-area-empty">{emptyLabel}</div>}
        {active && (
          <div className={`rep-area-tooltip ${expanded ? 'rep-area-tooltip--lg' : ''}`} style={{ left: `${clampPct((active.x / W) * 100)}%`, top: `${(active.y / H) * 100}%`, marginTop: -10 }}>
            <b>{formatValue(activeIdx)}</b>
          </div>
        )}
      </div>
      <div className={`rep-area-xlabels ${expanded ? 'rep-area-xlabels--lg' : ''}`}>
        {labels.map((l, i) => (
          <span key={i} style={{
            left: `${(pts[i].x / W) * 100}%`,
            ...(i === activeIdx ? { color: 'var(--ink-800)', fontWeight: 800 } : null),
          }}>{l}</span>
        ))}
      </div>
    </>
  );
}

function ReportsView({ t, lang, setRoute }) {
  React.useEffect(() => {
    if (typeof userHasPermission === 'function' && !userHasPermission('reports')) setRoute('dashboard');
  }, []);

  const isES = lang === 'es';

  // Expansión a pantalla completa de "Asistencia diaria" / "Tendencia de
  // tardanzas" (doble clic o botón de esquina) — un solo modal compartido en
  // vez de dos separados, con flechas prev/next en el header para pasar de
  // un gráfico al otro sin cerrar el overlay. Escape cierra igual que el
  // resto de overlays del sistema.
  const [expandedChart, setExpandedChart] = React.useState(null); // null | 'att' | 'late' | 'dept'
  React.useEffect(() => {
    if (!expandedChart) return;
    const onKey = (e) => { if (e.key === 'Escape') setExpandedChart(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expandedChart]);
  const CHART_CYCLE = ['att', 'late', 'abs', 'dept'];
  const otherChart = (c) => CHART_CYCLE[(CHART_CYCLE.indexOf(c) + 1) % CHART_CYCLE.length];

  // Cambiar de gráfico (flechas prev/next) — se desvanece el actual primero
  // (chart-swap-out, corto) y solo después entra el nuevo (chart-swap-in),
  // en vez de cortar el contenido de golpe y solo animar la entrada, que se
  // sentía brusco.
  const [chartSwapping, setChartSwapping] = React.useState(false);
  const goToOtherChart = () => {
    setChartSwapping(true);
    setTimeout(() => {
      setExpandedChart(otherChart(displayedChart));
      setChartSwapping(false);
    }, 140);
  };

  // Desmonte con delay — mismo patrón que el selector de mes (repPickerOpen/
  // repPickerClose): al cerrar, primero se reproduce la animación de salida
  // (accPopOut/accFadeOut) y solo después se quita del DOM, si no se
  // desmontaría de golpe y no se alcanzaría a ver el cierre. `displayedChart`
  // no se limpia al cerrar — así el modal sigue mostrando el último gráfico
  // mientras se desvanece, en vez de quedar en blanco a mitad de la salida.
  const [expandedMounted, setExpandedMounted] = React.useState(false);
  const [expandedClosing, setExpandedClosing] = React.useState(false);
  const [displayedChart, setDisplayedChart] = React.useState(null);
  React.useEffect(() => {
    if (expandedChart) {
      setDisplayedChart(expandedChart);
      setExpandedMounted(true);
      setExpandedClosing(false);
      return;
    }
    if (!expandedMounted) return;
    setExpandedClosing(true);
    const id = setTimeout(() => { setExpandedMounted(false); setExpandedClosing(false); }, 240);
    return () => clearTimeout(id);
  }, [expandedChart]);

  const [filterMonth, setFilterMonth] = React.useState(todayKey);
  const [fy, fm]    = filterMonth.split('-');
  const monthLabel  = `${MONTHS_ES[+fm - 1]} ${fy}`;
  const isCurrentMonth = filterMonth === todayKey();

  const prevMonth = React.useCallback(() => {
    let d = new Date(+fy, +fm - 2, 1);
    let key = d.toLocaleDateString('en-CA').slice(0, 7);
    while (key >= '2020-01' && !monthsWithData.has(key)) {
      d = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      key = d.toLocaleDateString('en-CA').slice(0, 7);
    }
    if (monthsWithData.has(key)) setFilterMonth(key);
  }, [fy, fm, monthsWithData]);

  const nextMonth = React.useCallback(() => {
    let d   = new Date(+fy, +fm, 1);
    let key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const limit = todayKey();
    while (key <= limit && !monthsWithData.has(key)) {
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    }
    if (key <= limit && monthsWithData.has(key)) setFilterMonth(key);
  }, [fy, fm, monthsWithData]);

  const goToday = React.useCallback(() => setFilterMonth(todayKey()), []);

  /* ── Selector rápido de mes/año — clic en "Julio 2026" abre un picker
     (mismo look que .dp-cal de Finca/Vacaciones) con una grilla de 12 meses
     para saltar directo, sin tener que darle a la flecha N veces. ── */
  const [monthPickerOpen, setMonthPickerOpen] = React.useState(false);
  const [pickerMounted, setPickerMounted] = React.useState(false);
  const [pickerClosing, setPickerClosing] = React.useState(false);
  const [pickerYear, setPickerYear] = React.useState(() => +fy);
  const pickerRef = React.useRef(null);

  const toggleMonthPicker = () => {
    setMonthPickerOpen(open => {
      if (!open) setPickerYear(+fy);
      return !open;
    });
  };

  // Desmonte con delay: al cerrar, primero se reproduce la animación de
  // salida (repPickerClose) y solo después se quita del DOM — si se
  // desmontara al instante no se alcanzaría a ver el cierre.
  React.useEffect(() => {
    if (monthPickerOpen) {
      setPickerMounted(true);
      setPickerClosing(false);
      return;
    }
    if (!pickerMounted) return;
    setPickerClosing(true);
    const id = setTimeout(() => { setPickerMounted(false); setPickerClosing(false); }, 220);
    return () => clearTimeout(id);
  }, [monthPickerOpen]);

  React.useEffect(() => {
    if (!monthPickerOpen) return;
    const onDown = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setMonthPickerOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setMonthPickerOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [monthPickerOpen]);

  const pickMonth = (monthIdx1) => {
    const key = `${pickerYear}-${String(monthIdx1).padStart(2,'0')}`;
    if (key > todayKey()) return;
    setFilterMonth(key);
    setMonthPickerOpen(false);
  };

  /* ── Datos reales — se sincronizan entre pestañas y con el kiosco.
     Con backend activo, allAtt se llena desde /api/attendance (donde graba
     el kiosco real) en vez de localStorage — mismo patrón dual-path que ya
     usa dashboard.jsx. El shape en memoria ({"empId:date": record}) es el
     mismo en ambos casos, así que el resto de Reportes (attRecords =
     Object.values(allAtt)) no cambia. ── */
  const attByKey = (rows) => {
    const map = {};
    rows.forEach(r => { map[`${r.empId}:${r.date}`] = r; });
    return map;
  };
  // Mismo shape que loadAbsences() en localStorage: {empId: [registro, ...]}.
  const absByEmp = (rows) => {
    const map = {};
    rows.forEach(r => { (map[r.empId] = map[r.empId] || []).push(r); });
    return map;
  };
  const [allAtt, setAllAtt] = React.useState(loadAttendance);
  const [absMap, setAbsMap] = React.useState(loadAbsences);
  React.useEffect(() => {
    const sync = () => {
      const backendOn = typeof isBackendActive === 'function' && isBackendActive();
      if (backendOn && typeof apiGetAttendance === 'function') {
        apiGetAttendance({}).then(rows => setAllAtt(attByKey(rows))).catch(() => {});
      } else {
        setAllAtt(loadAttendance());
      }
      // Antes esto siempre leía localStorage, incluso con sesión de backend
      // activa — Ausencias (KPI, Tendencia de ausencias, Aspectos destacados)
      // quedaba desincronizado del resto de Reportes, que ya usa la API real.
      if (backendOn && typeof apiGetAbsences === 'function') {
        apiGetAbsences({}).then(rows => setAbsMap(absByEmp(rows))).catch(() => {});
      } else {
        setAbsMap(loadAbsences());
      }
    };
    sync();
    window.addEventListener('storage', sync);
    const id = setInterval(sync, 2500);
    return () => { window.removeEventListener('storage', sync); clearInterval(id); };
  }, []);

  const emps       = typeof EMPLOYEES !== 'undefined' ? EMPLOYEES : [];
  const activeEmps = React.useMemo(() => emps.filter(e => e.status === 'ok'), [emps]);
  const attRecords = React.useMemo(() => Object.values(allAtt), [allAtt]);

  const monthsWithData = React.useMemo(() => {
    const s = new Set();
    attRecords.forEach(a => { if (a.date) s.add(a.date.slice(0, 7)); });
    return s;
  }, [attRecords]);

  React.useEffect(() => {
    if (monthsWithData.has(todayKey()) && filterMonth !== todayKey()) {
      setFilterMonth(todayKey());
    }
  }, [monthsWithData]);

  /* Los KPIs de Resumen ahora siguen el mismo mes seleccionado en la píldora
     central del header (filterMonth) — antes estaban fijos al mes de hoy sin
     poder navegarlos; ahora la píldora central controla el mes para toda la
     página (Resumen, Detalle y Calendario comparten el mismo selector). Las
     gráficas de "últimos 7 días" siguen siendo una ventana móvil real
     (relativa a hoy), no al mes seleccionado — muestran el pulso reciente
     real sin importar qué mes estés navegando arriba. */
  const curMonthKey  = filterMonth;
  const [cy, cm]     = curMonthKey.split('-');
  const curMonthLabel = `${MONTHS_ES[+cm - 1]} ${cy}`;
  const prevMonthKey = React.useMemo(() => {
    const d = new Date(+cy, +cm - 2, 1);
    return d.toLocaleDateString('en-CA').slice(0, 7);
  }, [cy, cm]);
  const prevMonthLabelShort = MONTHS_ES[+prevMonthKey.split('-')[1] - 1];

  const curMonthRecords  = React.useMemo(() => attRecords.filter(a => a.date && a.date.slice(0,7) === curMonthKey),  [attRecords, curMonthKey]);
  const prevMonthRecords = React.useMemo(() => attRecords.filter(a => a.date && a.date.slice(0,7) === prevMonthKey), [attRecords, prevMonthKey]);

  const countAbsences = React.useCallback((ym) => {
    let total = 0;
    Object.values(absMap).forEach(list => {
      (list || []).forEach(a => { if (a.date && a.date.slice(0,7) === ym && !isHoliday(a.date)) total++; });
    });
    return total;
  }, [absMap]);
  const curMonthAbsences  = React.useMemo(() => countAbsences(curMonthKey),  [countAbsences, curMonthKey]);
  const prevMonthAbsences = React.useMemo(() => countAbsences(prevMonthKey), [countAbsences, prevMonthKey]);

  // El tope "hasta hoy" (throughDay) solo aplica cuando el mes filtrado ES el
  // mes en curso (mes parcial) — en cualquier otro mes (ya cerrado) hay que
  // contar todos sus días hábiles, si no el % de Ausencias queda calculado
  // sobre "el día" (día-del-mes de hoy) en vez de sobre el mes completo.
  const workdaysCur  = React.useMemo(
    () => countWeekdays(+cy, +cm - 1, curMonthKey === todayKey() ? new Date().getDate() : undefined),
    [cy, cm, curMonthKey]
  );
  const workdaysPrev = React.useMemo(() => { const [py,pm] = prevMonthKey.split('-'); return countWeekdays(+py, +pm - 1); }, [prevMonthKey]);

  const pct = (n, d) => d > 0 ? (n / d) * 100 : 0;
  const denom = Math.max(1, activeEmps.length);

  const onTimePct = pct(curMonthRecords.length - curMonthRecords.filter(a => a.late).length, curMonthRecords.length);
  const latePct   = pct(curMonthRecords.filter(a => a.late).length, curMonthRecords.length);
  const absentPct = pct(curMonthAbsences, workdaysCur * denom);

  const prevOnTimePct = pct(prevMonthRecords.length - prevMonthRecords.filter(a => a.late).length, prevMonthRecords.length);
  const prevLatePct   = pct(prevMonthRecords.filter(a => a.late).length, prevMonthRecords.length);
  const prevAbsentPct = pct(prevMonthAbsences, workdaysPrev * denom);

  const hasPrevAtt = prevMonthRecords.length > 0;

  /* Pill de tendencia — real, comparado con el mes anterior. Sin datos previos
     suficientes, muestra el mes en vez de inventar un porcentaje. */
  const trendPill = (curr, prev, hasPrev, goodWhenLower, unit) => {
    // El mes ya se muestra una sola vez, centrado en el header (antes se
    // repetía "Julio 2026" en cada una de las 4 tarjetas) — sin datos del mes
    // anterior no hay nada que comparar, así que se avisa en vez de
    // simplemente repetir el mes otra vez.
    if (!hasPrev) return null;
    const d = +(curr - prev).toFixed(1);
    const isGood = goodWhenLower ? d <= 0 : d >= 0;
    const arrow  = d === 0 ? '•' : (d > 0 ? '▲' : '▼');
    return (
      <span className={`kpi__pill rep-trend-pill-in ${isGood ? 'kpi__pill--up' : 'kpi__pill--danger'}`}>
        {arrow} {Math.abs(d).toFixed(1)}{unit || '%'} <span style={{opacity:0.6, fontWeight:500}}>vs. {prevMonthLabelShort}</span>
      </span>
    );
  };

  // Valor del "scouter" de Asistencia diaria, ahora en el header junto al
  // botón de expandir en vez de flotar sobre el gráfico — AreaChart lo
  // reporta vía onActiveChange cada vez que cambia el día seleccionado.
  const [attCounterValue, setAttCounterValue] = React.useState(0);
  const [lateCounterValue, setLateCounterValue] = React.useState(0);
  const [absCounterValue, setAbsCounterValue] = React.useState(0);

  // Cuenta ausencias (no justificadas ni justificadas, igual que countAbsences
  // por mes) de un día puntual — mismo criterio que el KPI de Ausencias, solo
  // que por día en vez de por mes, para que Asistencia/Tardanzas/Ausencias
  // usen exactamente la misma ventana de "últimos 7 días".
  const countAbsencesDay = React.useCallback((iso) => {
    let total = 0;
    Object.values(absMap).forEach(list => {
      (list || []).forEach(a => { if (a.date === iso && !isHoliday(a.date)) total++; });
    });
    return total;
  }, [absMap]);

  /* ── Últimos 7 días — pulso reciente de asistencia (datos reales) ── */
  const last7 = React.useMemo(() => {
    const out  = [];
    const base = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const iso  = d.toLocaleDateString('en-CA');
      const recs = attRecords.filter(a => a.date === iso);
      const late = recs.filter(a => a.late).length;
      out.push({ iso, day: DAYS_ES[d.getDay()], total: recs.length, late, valid: recs.length - late, abs: countAbsencesDay(iso) });
    }
    return out;
  }, [attRecords, countAbsencesDay]);

  /* ── Tendencia de tardanzas / ausencias — últimos 7 días (misma base de last7) ── */
  const lateTotals = last7.map(d => d.late);
  const absTotals  = last7.map(d => d.abs);

  // Semana previa (días -13 a -7) — para el badge de tendencia de Asistencia
  // diaria / Tendencia de tardanzas / Tendencia de ausencias, comparando la
  // semana visible contra la inmediatamente anterior (no el mes, que ya usan
  // los KPI de arriba).
  const prevWeek = React.useMemo(() => {
    const base = new Date();
    let total = 0, late = 0, abs = 0, hasData = false;
    for (let i = 13; i >= 7; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const iso  = d.toLocaleDateString('en-CA');
      const recs = attRecords.filter(a => a.date === iso);
      total += recs.length;
      late  += recs.filter(a => a.late).length;
      abs   += countAbsencesDay(iso);
      if (recs.length > 0) hasData = true;
    }
    return { total, late, abs, hasData };
  }, [attRecords, countAbsencesDay]);
  const weekTotal = last7.reduce((s, d) => s + d.total, 0);
  const weekLate  = last7.reduce((s, d) => s + d.late, 0);
  const weekAbs   = last7.reduce((s, d) => s + d.abs, 0);

  const weekTrendPill = (curr, prev, goodWhenLower) => {
    if (!prevWeek.hasData) return null;
    const d = curr - prev;
    const isGood = goodWhenLower ? d <= 0 : d >= 0;
    const arrow  = d === 0 ? '•' : (d > 0 ? '▲' : '▼');
    return (
      <span className={`kpi__pill rep-trend-pill-in ${isGood ? 'kpi__pill--up' : 'kpi__pill--danger'}`}>
        {arrow} {Math.abs(d)} <span style={{opacity:0.6, fontWeight:500}}>{isES ? 'vs. semana anterior' : 'vs. last week'}</span>
      </span>
    );
  };

  /* ── Llegadas por hora — mes actual (para el insight de hora pico) ── */
  const hourHours  = React.useMemo(() => Array.from({length:13}, (_,i) => i + 6), []);
  const hourCountsMonth = React.useMemo(
    () => hourHours.map(h => curMonthRecords.filter(a => parseHour24(a.timeIn || a.time) === h).length),
    [hourHours, curMonthRecords]
  );
  const peakHourIdx = hourCountsMonth.some(c => c > 0) ? hourCountsMonth.indexOf(Math.max(...hourCountsMonth)) : -1;

  /* ── Eventualidades — mismo patrón de sync que asistencia/ausencias ── */
  const loadEventualidades = () => { try { return JSON.parse(localStorage.getItem('uasd_eventualidades') || '{}'); } catch { return {}; } };
  const [evMap, setEvMap] = React.useState(loadEventualidades);
  // Con backend activo, evMap se llena desde /api/eventualities (Fase 4) — 'vacaciones' se
  // excluye acá porque ese tipo nunca tuvo flujo de aprobación (siempre queda 'aceptado').
  const loadEventualidadesRemote = () => {
    if (typeof apiGetEventualities !== 'function') return Promise.resolve(null);
    return apiGetEventualities().then((rows) => {
      const map = {};
      rows.filter(r => r.type !== 'vacaciones').forEach((r) => {
        if (!map[r.empId]) map[r.empId] = [];
        map[r.empId].push(r);
      });
      return map;
    });
  };
  React.useEffect(() => {
    if (typeof isBackendActive === 'function' && isBackendActive()) {
      const sync = () => loadEventualidadesRemote().then(map => { if (map) setEvMap(map); }).catch(() => {});
      sync();
      const id = setInterval(sync, 2500);
      return () => clearInterval(id);
    }
    const sync = () => setEvMap(loadEventualidades());
    window.addEventListener('storage', sync);
    const id = setInterval(sync, 2500);
    return () => { window.removeEventListener('storage', sync); clearInterval(id); };
  }, []);

  const EVENT_TYPE_LABEL = { eventualidad: 'Eventualidad', dia_libre: 'Día libre', permiso: 'Permiso', servicio_feriado: 'Servicio feriado' };
  const EVENT_STATUS_LABEL = { pendiente: isES ? 'Pendiente' : 'Pending', aceptado: isES ? 'Aceptado' : 'Accepted', rechazado: isES ? 'Rechazado' : 'Rejected' };
  const EVENT_STATUS_CYCLE = ['pendiente', 'aceptado', 'rechazado'];

  // Antes: cualquiera con acceso de solo-lectura a reportes podía aprobar/rechazar con un
  // clic, sin permiso dedicado ni atribución. Ahora exige 'approve_eventualidades' —
  // el backend lo hace cumplir de verdad (403 si no lo tiene); acá solo se refleja en la UI.
  const canApproveEventualidades = typeof userHasPermission !== 'function' || userHasPermission('approve_eventualidades');

  const cycleEventStatus = (empId, evId) => {
    if (typeof isBackendActive === 'function' && isBackendActive()) {
      if (!canApproveEventualidades) return;
      const list = evMap[empId] || [];
      const current = (list.find(x => x.id === evId) || {}).estado || 'pendiente';
      const next = EVENT_STATUS_CYCLE[(EVENT_STATUS_CYCLE.indexOf(current) + 1) % EVENT_STATUS_CYCLE.length];
      apiPatchEventualityEstado(evId, next).then((row) => {
        setEvMap(prev => ({ ...prev, [empId]: (prev[empId] || []).map(x => x.id === evId ? row : x) }));
      }).catch(err => console.error('cambiar estado eventualidad', err));
      return;
    }
    let map = {};
    try { map = JSON.parse(localStorage.getItem('uasd_eventualidades') || '{}'); } catch {}
    const list = map[empId] || [];
    const idx = list.findIndex(x => x.id === evId);
    if (idx === -1) return;
    const current = list[idx].estado || 'pendiente';
    const next = EVENT_STATUS_CYCLE[(EVENT_STATUS_CYCLE.indexOf(current) + 1) % EVENT_STATUS_CYCLE.length];
    list[idx] = { ...list[idx], estado: next };
    map = { ...map, [empId]: list };
    localStorage.setItem('uasd_eventualidades', JSON.stringify(map));
    setEvMap(map);
  };

  /* ── Aspectos destacados — insights calculados de datos reales, no inventados.
     Cada uno se omite si no hay suficiente data para sostenerlo. El de
     puntualidad (mes vs. mes anterior) se quitó de acá porque duplicaba
     exactamente el pill de tendencia del primer KPI, arriba en la misma
     pestaña. ── */
  const insights = React.useMemo(() => {
    const out = [];

    const byDept = {};
    curMonthRecords.forEach(a => {
      const emp = emps.find(e => e.id === a.empId);
      if (!emp) return;
      byDept[emp.dept] = byDept[emp.dept] || { total: 0, onTime: 0 };
      byDept[emp.dept].total++;
      if (!a.late) byDept[emp.dept].onTime++;
    });
    const deptRates = Object.keys(byDept)
      .filter(d => byDept[d].total >= 2)
      .map(d => ({ dept: d, rate: byDept[d].onTime / byDept[d].total }))
      .sort((a, b) => b.rate - a.rate);
    if (deptRates.length) {
      const pct = Math.round(deptRates[0].rate * 100);
      out.push({
        status: 'ok',
        text: isES
          ? `${deptRates[0].dept} es el departamento con mejor asistencia (${pct}%)`
          : `${deptRates[0].dept} has the best attendance (${pct}%)`,
        cat: 'depto', catLabel: isES ? 'Departamento' : 'Department',
      });
    }

    // Opuesto al anterior — solo si hay más de un departamento con muestra
    // suficiente, si no "peor" y "mejor" serían el mismo y se repetiría el dato.
    if (deptRates.length > 1) {
      const worstDept = deptRates[deptRates.length - 1];
      const pct = Math.round(worstDept.rate * 100);
      out.push({
        status: 'warn',
        text: isES
          ? `${worstDept.dept} es el departamento con más tardanzas (${100 - pct}% de llegadas tarde)`
          : `${worstDept.dept} has the most late arrivals (${100 - pct}% arrive late)`,
        cat: 'depto', catLabel: isES ? 'Departamento' : 'Department',
      });
    }

    // Señala a un empleado por nombre — exige al menos 2 ausencias sin
    // justificar en el mes, no 1, para no "acusar" a alguien por un
    // incidente aislado (una sola falta puede ser cualquier cosa).
    let worstAbs = null;
    emps.forEach(emp => {
      const list = (absMap[emp.id] || []).filter(a => a.date?.slice(0,7) === curMonthKey && !a.justified && !isHoliday(a.date));
      if (list.length && (!worstAbs || list.length > worstAbs.count)) worstAbs = { emp, count: list.length };
    });
    if (worstAbs && worstAbs.count >= 2) {
      out.push({
        status: 'warn',
        text: isES
          ? `${worstAbs.emp.name} acumula ${worstAbs.count} ausencias sin justificar este mes`
          : `${worstAbs.emp.name} has ${worstAbs.count} unjustified absences this month`,
        cat: 'ausencias', catLabel: isES ? 'Ausencias' : 'Absences',
      });
    }

    // Mismo criterio que ausentismo (mínimo 2, no señalar por un caso
    // aislado) pero contando llegadas tarde por persona en vez de ausencias.
    let worstLate = null;
    emps.forEach(emp => {
      const count = curMonthRecords.filter(a => a.empId === emp.id && a.late).length;
      if (count && (!worstLate || count > worstLate.count)) worstLate = { emp, count };
    });
    if (worstLate && worstLate.count >= 2) {
      out.push({
        status: 'warn',
        text: isES
          ? `${worstLate.emp.name} llegó tarde ${worstLate.count} veces este mes`
          : `${worstLate.emp.name} arrived late ${worstLate.count} times this month`,
        cat: 'puntualidad', catLabel: isES ? 'Puntualidad' : 'Punctuality',
      });
    }

    // Cola de eventualidades sin aprobar/rechazar este mes — si se acumulan
    // varias, vale la pena avisar antes de que la lista crezca más.
    let pendingEv = 0;
    Object.values(evMap).forEach(list => {
      (list || []).forEach(ev => {
        if (ev.date?.slice(0,7) === curMonthKey && (ev.estado || 'pendiente') === 'pendiente') pendingEv++;
      });
    });
    if (pendingEv >= 3) {
      out.push({
        status: 'warn',
        text: isES
          ? `Hay ${pendingEv} eventualidades pendientes de aprobar este mes`
          : `There are ${pendingEv} eventualities pending approval this month`,
        rec: isES
          ? 'Recomendación: revisar la cola de eventualidades en Detalle antes de que se acumule más.'
          : 'Recommendation: review the eventualities queue in Detail before it piles up further.',
        cat: 'tendencia', catLabel: isES ? 'Tendencia' : 'Trend',
      });
    }

    if (peakHourIdx >= 0) {
      out.push({
        status: 'ok',
        text: isES
          ? `El pico de marcajes ocurre entre las ${hourHours[peakHourIdx]}:00 y ${hourHours[peakHourIdx] + 1}:00`
          : `Check-ins peak between ${hourHours[peakHourIdx]}:00 and ${hourHours[peakHourIdx] + 1}:00`,
        cat: 'tendencia', catLabel: isES ? 'Tendencia' : 'Trend',
      });
    }

    return out;
  }, [curMonthRecords, emps, absMap, evMap, curMonthKey, peakHourIdx, hourHours, isES]);

  /* ── Lista unificada de Detalle — Tardanzas + Ausencias + Eventualidades del
     mes filtrado, en un solo feed ordenable por chips (evita 3 cajas separadas). ── */
  const detailRows = React.useMemo(() => {
    const rows = [];
    Object.values(allAtt).forEach(a => {
      if (!a.late || a.date?.slice(0,7) !== filterMonth) return;
      const emp = emps.find(e => e.id === a.empId);
      if (!emp) return;
      rows.push({
        key: `t-${emp.id}-${a.date}`, type: 'tardanza', emp, date: a.date,
        detail: a.justified ? (isES ? '✓ Justificada' : '✓ Justified') : (isES ? 'Sin justificar' : 'Unjustified'),
        detailOk: !!a.justified,
      });
    });
    emps.forEach(emp => {
      (absMap[emp.id] || []).forEach(ab => {
        if (ab.date?.slice(0,7) !== filterMonth || isHoliday(ab.date)) return;
        rows.push({
          key: `a-${emp.id}-${ab.date}`, type: 'ausencia', emp, date: ab.date,
          detail: ab.justified ? (isES ? '✓ Justificada' : '✓ Justified') : `${ab.auto ? (isES ? 'Automática · ' : 'Automatic · ') : ''}${isES ? 'sin justificar' : 'unjustified'}`,
          detailOk: !!ab.justified,
        });
      });
    });
    emps.forEach(emp => {
      (evMap[emp.id] || []).forEach(ev => {
        if (ev.date?.slice(0,7) !== filterMonth) return;
        rows.push({
          key: `e-${emp.id}-${ev.id}`, type: 'eventualidad', emp, date: ev.date, evType: ev.type, evId: ev.id,
          detail: ev.motivo || EVENT_TYPE_LABEL[ev.type] || ev.type,
          detailOk: true,
          estado: ev.estado || 'pendiente',
        });
      });
    });
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [allAtt, absMap, evMap, emps, filterMonth, isES]);

  const [detailFilter, setDetailFilter] = React.useState('todos');
  const detailCounts = React.useMemo(() => ({
    todos: detailRows.length,
    tardanza: detailRows.filter(r => r.type === 'tardanza').length,
    ausencia: detailRows.filter(r => r.type === 'ausencia').length,
    eventualidad: detailRows.filter(r => r.type === 'eventualidad').length,
  }), [detailRows]);
  const visibleDetailRows = detailFilter === 'todos' ? detailRows : detailRows.filter(r => r.type === detailFilter);
  const detailChips = [
    { id: 'todos', label: isES ? 'Todos' : 'All' },
    { id: 'tardanza', label: isES ? 'Tardanzas' : 'Late arrivals' },
    { id: 'ausencia', label: isES ? 'Ausencias' : 'Absences' },
    { id: 'eventualidad', label: isES ? 'Eventualidades' : 'Events' },
  ];
  const fmtShortDate = (iso) => { const [y,m,d] = iso.split('-'); return `${d} ${MONTHS_ES[+m-1].slice(0,3).toLowerCase()}`; };

  /* ── Horas trabajadas — mes filtrado, calculado de entrada/salida reales
     del kiosco (antes no existía: solo se guardaba una hora, la de entrada,
     y "salida" era cosmético). Marca los días con entrada pero sin salida
     registrada en vez de fingir un total. ── */
  const monthAttForHours = React.useMemo(
    () => attRecords.filter(a => a.date?.slice(0,7) === filterMonth),
    [attRecords, filterMonth]
  );
  const hoursRows = React.useMemo(() => {
    const byEmp = {};
    monthAttForHours.forEach(a => {
      const h = hoursBetween(a.timeIn || a.time, a.timeOut);
      if (!byEmp[a.empId]) byEmp[a.empId] = { totalHours: 0, days: 0, incomplete: 0 };
      byEmp[a.empId].days++;
      if (h !== null) byEmp[a.empId].totalHours += h;
      else byEmp[a.empId].incomplete++;
    });
    return emps
      .map(emp => {
        const agg = byEmp[emp.id];
        if (!agg) return null;
        return { emp, totalHours: agg.totalHours, days: agg.days, incomplete: agg.incomplete };
      })
      .filter(Boolean)
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [monthAttForHours, emps]);

  // Construye las mismas filas (Tardanzas + Ausencias + Eventualidades del
  // mes filtrado) para los dos formatos de export — mismo patrón que
  // dashboard.jsx (dropdown Exportar → PDF / Excel).
  const buildExportRows = () => {
    let evMap = {};
    try { evMap = JSON.parse(localStorage.getItem('uasd_eventualidades') || '{}'); } catch {}

    const rows = [];

    emps.forEach(emp => {
      Object.values(allAtt)
        .filter(a => a.empId === emp.id && a.late && a.date?.slice(0, 7) === filterMonth)
        .forEach(a => rows.push(['Tardanza', emp.name, emp.dept, a.date, '', a.justified ? 'Justificada' : 'No justificada']));
    });

    emps.forEach(emp => {
      (absMap[emp.id] || [])
        .filter(a => a.date?.slice(0, 7) === filterMonth && !isHoliday(a.date))
        .forEach(a => rows.push(['Ausencia', emp.name, emp.dept, a.date, a.auto ? 'Automática' : '', a.justified ? 'Justificada' : 'No justificada']));
    });

    emps.forEach(emp => {
      (evMap[emp.id] || [])
        .filter(e => e.date?.slice(0, 7) === filterMonth)
        .forEach(e => rows.push(['Eventualidad', emp.name, emp.dept, e.dateEnd ? `${e.date} - ${e.dateEnd}` : e.date, `${e.type}${e.motivo ? ' - ' + e.motivo : ''}`, EVENT_STATUS_LABEL[e.estado || 'pendiente']]));
    });

    return rows;
  };

  const [exportOpen, setExportOpen] = React.useState(false);
  const exportRef = React.useRef(null);
  React.useEffect(() => {
    if (!exportOpen) return;
    const onDoc = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [exportOpen]);

  // Desmonte con delay: misma animación de entrada/salida (repPickerOpen/
  // repPickerClose) que el picker de mes — al cerrar, primero se reproduce
  // el cierre y solo después se quita del DOM.
  const [exportMounted, setExportMounted] = React.useState(false);
  const [exportClosing, setExportClosing] = React.useState(false);
  React.useEffect(() => {
    if (exportOpen) {
      setExportMounted(true);
      setExportClosing(false);
      return;
    }
    if (!exportMounted) return;
    setExportClosing(true);
    const id = setTimeout(() => { setExportMounted(false); setExportClosing(false); }, 150);
    return () => clearTimeout(id);
  }, [exportOpen]);

  const exportExcel = () => {
    setExportOpen(false);
    const esc = (v) => `"${csvSafe(v).replace(/"/g, '""')}"`;
    const header = ['Secci\u00F3n', 'Empleado', 'Departamento', 'Fecha', 'Detalle', 'Estado'];
    const csv = '\uFEFF' + [header, ...buildExportRows()].map(r => r.map(esc).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `UASD_reportes_${filterMonth}.xls`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportPDF = () => {
    setExportOpen(false);
    const escHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const rowsHtml = buildExportRows().map(r => `<tr>${r.map(c => `<td>${escHtml(c)}</td>`).join('')}</tr>`).join('');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${t.rep_title} - UASD</title>
      <style>
        * { font-family: 'Manrope', Arial, sans-serif; }
        body { padding: 40px; color: #1A1F3A; }
        h1 { font-size: 20px; margin: 0 0 2px; }
        .sub { color: #5a6a90; font-size: 12px; margin-bottom: 22px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { text-align: left; text-transform: uppercase; letter-spacing: 0.06em; font-size: 9px; color: #5a6a90; border-bottom: 2px solid #1A1F3A; padding: 8px 6px; }
        td { padding: 8px 6px; border-bottom: 1px solid #e8ebf1; }
        @media print { @page { margin: 16mm; } }
      </style></head><body>
      <h1>${t.rep_title} - UASD</h1>
      <div class="sub">${monthLabel} - ${new Date().toLocaleDateString(isES ? 'es-DO' : 'en-US')}</div>
      <table><thead><tr>
        <th>Sección</th><th>Empleado</th><th>Departamento</th><th>Fecha</th><th>Detalle</th><th>Estado</th>
      </tr></thead><tbody>${rowsHtml}</tbody></table>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 350);
  };

  /* ── Resumen (pulso en vivo) vs Detalle (histórico por mes) ──
     Mismo patrón seg-filter que dashboard.jsx (filtro de estado) y
     changelog.jsx (filtro de tipo) — pill animado que se desliza al ítem activo. */
  const [view, setView] = React.useState('resumen');
  const viewOptions = [
    { id: 'resumen', label: t.rep_view_summary, icon: 'chartPie' },
    { id: 'detalle', label: t.rep_view_detail, icon: 'barChart' },
    { id: 'calendario', label: t.rep_view_calendar, icon: 'calendar' },
  ];

  const viewRef = React.useRef(null);
  const viewItemRefs = React.useRef({});
  const [viewPill, setViewPill] = React.useState({ opacity: 0 });

  React.useLayoutEffect(() => {
    const el = viewItemRefs.current[view];
    const wrap = viewRef.current;
    if (!el || !wrap) return;
    const er = el.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    setViewPill({
      opacity: 1,
      width: er.width,
      height: er.height,
      transform: `translateX(${Math.round(er.left - wr.left)}px)`,
    });
  }, [view]);

  /* ── Calendario — cumpleaños del mes + feriados del período ── */
  const birthdaysThisMonth = React.useMemo(() => {
    const targetMonth = +filterMonth.split('-')[1];
    return emps
      .filter(e => e.status === 'ok' && e.dob)
      .map(e => {
        const [d, m] = (e.dob || '').split('/').map(n => parseInt(n, 10));
        return { emp: e, day: d, month: m };
      })
      .filter(e => e.month === targetMonth && !isNaN(e.day))
      .sort((a, b) => a.day - b.day);
  }, [emps, filterMonth]);

  const holidaysThisMonth = React.useMemo(
    () => (typeof getHolidays === 'function' ? getHolidays() : []).filter(h => h.date.slice(0,7) === filterMonth),
    [filterMonth, evMap]
  );

  const holidayWorkers = React.useMemo(() => {
    const byDate = {};
    emps.forEach(emp => {
      (evMap[emp.id] || []).forEach(ev => {
        if (ev.type === 'servicio_feriado' && ev.date?.slice(0,7) === filterMonth) {
          (byDate[ev.date] = byDate[ev.date] || []).push(emp);
        }
      });
    });
    return byDate;
  }, [emps, evMap, filterMonth]);

  return (
    <div className="page">
      {/* ── Header — una sola fila: título a la izquierda; a la derecha, el
           panel de navegación (Resumen/Detalle/Calendario) al lado de Exportar. ── */}
      <div className="page__head" style={{ alignItems: 'center' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <div className="page__title">{t.rep_title}</div>
          <div className="page__subtitle">{t.rep_sub}</div>
        </div>

        {/* Mes actual — centrado centro a centro, mismo truco que usa la barra
           de navegación Empleados/Reportes: ambos lados llevan flex:1 1 0
           (crecen igual), así el elemento del medio queda en el centro real
           de la fila sin importar cuánto contenido tenga cada lado. Mismo pill
           azul oscuro que el reloj (DashClock) de Empleados, con flechas para
           navegar el mes — controla filterMonth para toda la página (Resumen,
           Detalle y Calendario comparten el mismo mes). */}
        <div ref={pickerRef} style={{ position: 'relative', flex: '0 0 auto' }}>
        <div className="dash-clock" style={{ flexDirection: 'row', alignItems: 'center', gap: 18, padding: '11px 22px' }}>
          <button className="rep-month-arrow" onClick={prevMonth} aria-label={isES ? 'Mes anterior' : 'Previous month'}>
            ‹
          </button>
          <div className="month-pill-in" key={filterMonth}
            role="button" tabIndex={0} onClick={toggleMonthPicker}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMonthPicker(); } }}
            aria-label={isES ? 'Elegir mes' : 'Pick month'}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120, cursor: 'pointer' }}>
            <div className="dash-clock__time">
              <span className="dash-clock__hm">{MONTHS_ES[+cm - 1]}</span>
            </div>
            <div className="dash-clock__date">{cy}</div>
          </div>
          <button className="rep-month-arrow" onClick={nextMonth} disabled={isCurrentMonth} aria-label={isES ? 'Mes siguiente' : 'Next month'}>
            ›
          </button>
        </div>

        {pickerMounted && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}>
          <div className="dp-cal rep-month-picker" style={{ minWidth: 220,
            animation: pickerClosing
              ? 'repPickerClose 0.22s cubic-bezier(0.4,0,1,1) both'
              : 'repPickerOpen 0.22s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="dp-cal__nav">
              <button type="button" className="dp-cal__arrow" onClick={() => setPickerYear(y => y - 1)} aria-label={isES ? 'Año anterior' : 'Previous year'}>‹</button>
              <span className="dp-cal__month">{pickerYear}</span>
              <button type="button" className="dp-cal__arrow" onClick={() => setPickerYear(y => y + 1)} disabled={pickerYear >= +todayKey().slice(0,4)} aria-label={isES ? 'Año siguiente' : 'Next year'}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {MONTHS_ES.map((mLabel, i) => {
                const key = `${pickerYear}-${String(i+1).padStart(2,'0')}`;
                const disabled = key > todayKey() || !monthsWithData.has(key);
                const active = key === filterMonth;
                return (
                  <button key={mLabel} type="button" disabled={disabled} onClick={() => pickMonth(i+1)}
                    style={{
                      padding: '8px 4px', borderRadius: 8, cursor: disabled ? 'default' : 'pointer',
                      fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
                      border: active ? '1px solid var(--ink-800)' : '1px solid var(--ink-100)',
                      background: active ? 'var(--ink-800)' : 'none',
                      color: disabled ? 'var(--ink-200)' : active ? '#fff' : 'var(--ink-700)',
                      transition: 'background .12s, border-color .12s, color .12s',
                    }}>
                    {mLabel.slice(0,3)}
                  </button>
                );
              })}
            </div>
            {!isCurrentMonth && (
              <button type="button" className="rep-goto-today" onClick={() => { goToday(); setMonthPickerOpen(false); }}
                style={{
                  marginTop: 12, width: '100%', padding: '7px 0', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
                }}>
                {isES ? 'Mes actual' : 'Current month'}
              </button>
            )}
          </div>
          </div>
        )}
        </div>

        <div className="page__actions" style={{ gap: 16, flex: '1 1 0', justifyContent: 'flex-end', minWidth: 0 }}>
          <div className="seg-filter seg-filter--lg" ref={viewRef}>
            <span className="seg-filter__pill" style={viewPill} aria-hidden="true"/>
            {viewOptions.map(o => (
              <button key={o.id}
                ref={el => (viewItemRefs.current[o.id] = el)}
                className={`seg-filter__item ${view === o.id ? 'seg-filter__item--active' : ''}`}
                onClick={() => setView(o.id)}>
                <Icon name={o.icon} size={12}/>
                {o.label}
              </button>
            ))}
          </div>
          <div className="export-wrap" ref={exportRef}>
            <button className="btn btn--ghost" onClick={() => setExportOpen(o => !o)}>
              <Icon name="download" size={14}/> {t.dash_export} <Icon name="chevDown" size={12}/>
            </button>
            {exportMounted && (
              <div className="export-menu" style={{ animation: exportClosing
                ? 'repPickerClose 0.15s cubic-bezier(0.4,0,1,1) both'
                : 'repPickerOpen 0.15s cubic-bezier(0.16,1,0.3,1) both' }}>
                <button className="export-menu__item" onClick={exportPDF}>
                  <span className="export-menu__tag export-menu__tag--pdf">PDF</span> {t.dash_export_pdf}
                </button>
                <button className="export-menu__item" onClick={exportExcel}>
                  <span className="export-menu__tag export-menu__tag--xls">XLS</span> {t.dash_export_excel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RESUMEN — pulso en vivo del mes actual ── */}
      {view === 'resumen' && <div key="resumen" className="rep-panel-in">

      {/* ── KPIs — mes actual, datos reales, comparados con el mes anterior ──
           icono + tendencia arriba, label + valor abajo (mismo patrón
           .kpi__top/.kpi__icon/.kpi__foot que Empleados). ── */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="userCheck" size={26}/></div>
            {trendPill(onTimePct, prevOnTimePct, hasPrevAtt, false)}
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_punctual_on}</div>
            <div className="kpi__value">{Math.round(onTimePct)}<span style={{fontSize:18,color:'var(--ink-400)',marginLeft:4}}>%</span></div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="clock" size={26}/></div>
            {trendPill(latePct, prevLatePct, hasPrevAtt, true)}
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_punctual_late}</div>
            <div className="kpi__value">{Math.round(latePct)}<span style={{fontSize:18,color:'var(--ink-400)',marginLeft:4}}>%</span></div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="userX" size={26}/></div>
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_punctual_absent}</div>
            <div className="kpi__value">{Math.round(absentPct)}<span style={{fontSize:18,color:'var(--ink-400)',marginLeft:4}}>%</span></div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="fingerprint" size={26}/></div>
            {trendPill(curMonthRecords.length, prevMonthRecords.length, prevMonthRecords.length > 0, false, '')}
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{isES ? 'Marcajes del mes' : 'Check-ins this month'}</div>
            <div className="kpi__value">{curMonthRecords.length.toLocaleString(isES ? 'es-DO' : 'en-US')}</div>
          </div>
        </div>
      </div>

      {/* ── Asistencia diaria + Tendencia de tardanzas — últimos 7 días ──
         Doble clic (o el botón de esquina, para quien no sepa del doble
         clic) expande "Asistencia diaria" a pantalla completa — MISMO
         lenguaje visual que el panel de administración (acc-overlay +
         acc-modal__head: banda oscura, avatar circular, título serif,
         cierre en acc-modal__close--x), no un modal claro genérico.

         Portal a document.body: si se monta acá mismo, queda como
         descendiente de <div className="rep-panel-in"> (la vista Resumen),
         que tiene animation:sectionIn con "transform: translateY(0)" fijado
         por fill-mode "both" — un transform (aunque sea 0) siempre crea
         containing block nuevo para position:fixed, así que el modal quedaba
         recortado al tamaño de esa sección en vez de cubrir la pantalla
         completa. Con portal se monta fuera de esa cadena, igual que hace
         DateStatFilter en changelog.jsx con su menú flotante. ── */}
      {expandedMounted && ReactDOM.createPortal(
        <div className="acc-overlay" onMouseDown={() => setExpandedChart(null)}
          style={{ animation: expandedClosing ? 'accFadeOut .18s ease both' : 'accFade .18s ease both' }}>
          <div className="chart-expand-modal" onMouseDown={(e) => e.stopPropagation()}
            style={{ animation: expandedClosing ? 'accPopOut .2s cubic-bezier(.4,0,1,1) both' : 'accPop .24s cubic-bezier(.16,1,.3,1) both' }}>
            <div className="acc-modal__head">
              <div key={displayedChart} className={`acc-modal__head-id ${chartSwapping ? 'chart-swap-out-left' : 'chart-swap-in-left'}`}>
                <div className="acc-modal__avatar">
                  <Icon name={displayedChart === 'att' ? 'userCheck' : displayedChart === 'late' ? 'clock' : displayedChart === 'abs' ? 'userX' : 'usersActive'} size={24}/>
                </div>
                <div>
                  <div className="acc-modal__title">
                    {displayedChart === 'att' ? t.rep_attend
                      : displayedChart === 'late' ? (isES ? 'Tendencia de tardanzas' : 'Late arrival trend')
                      : displayedChart === 'abs' ? (isES ? 'Tendencia de ausencias' : 'Absence trend')
                      : t.rep_active_now}
                  </div>
                  <div className="acc-modal__sub">
                    {displayedChart === 'dept' ? t.rep_active_now_sub : (isES ? 'Últimos 7 días' : 'Last 7 days')}
                  </div>
                </div>
              </div>
              <button className="acc-modal__close acc-modal__close--x" onClick={() => setExpandedChart(null)} aria-label="Cerrar">
                <Icon name="x" size={18}/>
              </button>
            </div>
            <div className="chart-expand-modal__body">
              <button type="button" className="rep-month-arrow chart-expand-modal__side chart-expand-modal__side--left"
                onClick={goToOtherChart}
                title={isES ? 'Gráfico anterior' : 'Previous chart'} aria-label={isES ? 'Gráfico anterior' : 'Previous chart'}>
                ‹
              </button>
              <button type="button" className="rep-month-arrow chart-expand-modal__side chart-expand-modal__side--right"
                onClick={goToOtherChart}
                title={isES ? 'Siguiente gráfico' : 'Next chart'} aria-label={isES ? 'Siguiente gráfico' : 'Next chart'}>
                ›
              </button>
              <div key={displayedChart} className={chartSwapping ? 'chart-swap-out' : 'chart-swap-in'}>
                {displayedChart === 'att' ? (
                  <AreaChart
                    slowDraw
                    counter
                    expanded
                    values={last7.map(d => d.total)}
                    labels={last7.map(d => d.day)}
                    color="var(--ink-700)"
                    gradId="repGradAsistenciaXL"
                    formatValue={(i) => `${last7[i].total} ${isES ? 'marcajes' : 'check-ins'}`}
                    emptyLabel={isES ? 'Sin marcajes esta semana' : 'No check-ins this week'}
                  />
                ) : displayedChart === 'late' ? (
                  <AreaChart
                    slowDraw
                    counter
                    expanded
                    values={lateTotals}
                    labels={last7.map(d => d.day)}
                    color="var(--gold-600)"
                    gradId="repGradTardanzasXL"
                    formatValue={(i) => `${lateTotals[i]} ${isES ? 'tardanzas' : 'late arrivals'}`}
                    emptyLabel={isES ? 'Sin tardanzas esta semana' : 'No late arrivals this week'}
                  />
                ) : displayedChart === 'abs' ? (
                  <AreaChart
                    slowDraw
                    counter
                    expanded
                    values={absTotals}
                    labels={last7.map(d => d.day)}
                    color="var(--danger)"
                    gradId="repGradAusenciasXL"
                    formatValue={(i) => `${absTotals[i]} ${isES ? 'ausencias' : 'absences'}`}
                    emptyLabel={isES ? 'Sin ausencias esta semana' : 'No absences this week'}
                  />
                ) : (
                  <ActiveNowDonut t={t} isES={isES} attRecords={attRecords} large/>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20, marginBottom:20 }}>
        <div className="chart-card" onDoubleClick={() => setExpandedChart('att')}>
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{t.rep_attend}</div>
              <div className="chart-card__sub">{isES ? 'Últimos 7 días' : 'Last 7 days'}</div>
              <div style={{ marginTop: 6 }}>{weekTrendPill(weekTotal, prevWeek.total, false)}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <ScouterCounter value={attCounterValue} inline color="var(--ink-700)"/>
              <button type="button" className="chart-card__expand-btn chart-card__expand-btn--lg"
                title={isES ? 'Expandir (doble clic)' : 'Expand (double-click)'}
                onClick={() => setExpandedChart('att')}>
                <Icon name="expand" size={16}/>
              </button>
            </div>
          </div>
          <AreaChart
            slowDraw
            onActiveChange={setAttCounterValue}
            values={last7.map(d => d.total)}
            labels={last7.map(d => d.day)}
            color="var(--ink-700)"
            gradId="repGradAsistencia"
            formatValue={(i) => `${last7[i].total} ${isES ? 'marcajes' : 'check-ins'}`}
            emptyLabel={isES ? 'Sin marcajes esta semana' : 'No check-ins this week'}
          />
        </div>

        <div className="chart-card" onDoubleClick={() => setExpandedChart('late')}>
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{isES ? 'Tendencia de tardanzas' : 'Late arrival trend'}</div>
              <div className="chart-card__sub">{isES ? 'Últimos 7 días' : 'Last 7 days'}</div>
              <div style={{ marginTop: 6 }}>{weekTrendPill(weekLate, prevWeek.late, true)}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <ScouterCounter value={lateCounterValue} inline color="var(--gold-600)"/>
              <button type="button" className="chart-card__expand-btn chart-card__expand-btn--lg"
                title={isES ? 'Expandir (doble clic)' : 'Expand (double-click)'}
                onClick={() => setExpandedChart('late')}>
                <Icon name="expand" size={16}/>
              </button>
            </div>
          </div>
          <AreaChart
            slowDraw
            onActiveChange={setLateCounterValue}
            values={lateTotals}
            labels={last7.map(d => d.day)}
            color="var(--gold-600)"
            gradId="repGradTardanzas"
            formatValue={(i) => `${lateTotals[i]} ${isES ? 'tardanzas' : 'late arrivals'}`}
            emptyLabel={isES ? 'Sin tardanzas esta semana' : 'No late arrivals this week'}
          />
        </div>

        <div className="chart-card" onDoubleClick={() => setExpandedChart('abs')}>
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{isES ? 'Tendencia de ausencias' : 'Absence trend'}</div>
              <div className="chart-card__sub">{isES ? 'Últimos 7 días' : 'Last 7 days'}</div>
              <div style={{ marginTop: 6 }}>{weekTrendPill(weekAbs, prevWeek.abs, true)}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <ScouterCounter value={absCounterValue} inline color="var(--danger)"/>
              <button type="button" className="chart-card__expand-btn chart-card__expand-btn--lg"
                title={isES ? 'Expandir (doble clic)' : 'Expand (double-click)'}
                onClick={() => setExpandedChart('abs')}>
                <Icon name="expand" size={16}/>
              </button>
            </div>
          </div>
          <AreaChart
            slowDraw
            onActiveChange={setAbsCounterValue}
            values={absTotals}
            labels={last7.map(d => d.day)}
            color="var(--danger)"
            gradId="repGradAusencias"
            formatValue={(i) => `${absTotals[i]} ${isES ? 'ausencias' : 'absences'}`}
            emptyLabel={isES ? 'Sin ausencias esta semana' : 'No absences this week'}
          />
        </div>
      </div>

      {/* ── Activos ahora por departamento + Aspectos destacados ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:20, marginBottom:20 }}>
        <div className="chart-card" onDoubleClick={() => setExpandedChart('dept')}>
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{t.rep_active_now}</div>
              <div className="chart-card__sub">{t.rep_active_now_sub}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span className="badge badge--ok">
                <span className="badge__dot rep-live-dot"/>
                {t.rep_live}
              </span>
              <button type="button" className="chart-card__expand-btn chart-card__expand-btn--lg"
                title={isES ? 'Expandir (doble clic)' : 'Expand (double-click)'}
                onClick={() => setExpandedChart('dept')}>
                <Icon name="expand" size={16}/>
              </button>
            </div>
          </div>
          <ActiveNowDonut t={t} isES={isES} attRecords={attRecords}/>
        </div>

        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{isES ? 'Aspectos destacados' : 'Highlights'}</div>
            </div>
          </div>
          {insights.length === 0 ? (
            <div className="audit-empty">
              <Icon name="activity" size={26} stroke={1.2}/>
              <div className="audit-empty__title">{isES ? 'Aún sin datos suficientes' : 'Not enough data yet'}</div>
              <div className="audit-empty__sub">{isES ? 'Los aspectos destacados aparecen cuando hay marcajes registrados.' : 'Highlights appear once check-ins are recorded.'}</div>
            </div>
          ) : (
            <div className="rep-insights rep-rows-in">
              {insights.map((ins, i) => (
                <div className={`rep-insight-row ${ins.rec ? 'rep-insight-row--rec' : ''}`} key={i}>
                  <span className={`rep-insight-status rep-insight-status--${ins.status}`}>
                    <Icon name={ins.status === 'ok' ? 'check' : 'alertTriangle'} size={13} stroke={2.6}/>
                  </span>
                  <div className="rep-insight-text">
                    {ins.text}
                    {ins.rec && <div className="rep-insight-rec">{ins.rec}</div>}
                  </div>
                  <span className={`rep-insight-cat rep-insight-cat--${ins.cat}`}>{ins.catLabel}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      </div>}

      {/* ── DETALLE — histórico filtrable por mes ── */}
      {view === 'detalle' && <div key="detalle" className="rep-panel-in">

      {/* ── Chips de filtro (Tardanzas · Ausencias · Eventualidades) — el mes ya
           se controla desde la píldora central del header, arriba. ── */}
      <div className="rep-chips" style={{ marginBottom: 16 }}>
        {detailChips.map(c => (
          <button key={c.id} className={`rep-chip ${detailFilter === c.id ? 'rep-chip--active' : ''}`} onClick={() => setDetailFilter(c.id)}>
            {c.label} <span className="rep-chip__count">{detailCounts[c.id]}</span>
          </button>
        ))}
      </div>

      {/* ── Lista unificada — Tardanzas + Ausencias + Eventualidades del mes ── */}
      {visibleDetailRows.length === 0 ? (
        <div className="rep-list-card">
          <div className="audit-empty">
            <Icon name="calendar" size={26} stroke={1.2}/>
            <div className="audit-empty__title">{isES ? 'Sin registros' : 'No records'}</div>
            <div className="audit-empty__sub">{isES ? `No hay registros para ${monthLabel.toLowerCase()}.` : `No records for ${monthLabel}.`}</div>
          </div>
        </div>
      ) : (
        <div className="rep-list-card rep-rows-in" key={detailFilter}>
          <div className="rep-list-row rep-list-row--head">
            <span></span><span>{isES ? 'Empleado' : 'Employee'}</span><span>{isES ? 'Tipo' : 'Type'}</span><span>{isES ? 'Fecha' : 'Date'}</span><span>{isES ? 'Detalle' : 'Detail'}</span><span>{isES ? 'Estado' : 'Status'}</span>
          </div>
          {visibleDetailRows.map(r => (
            <div className="rep-list-row" key={r.key}>
              <div className="table__avatar" style={{ width:32, height:32, fontSize:10 }}>{initials(r.emp.name)}</div>
              <div className="rep-list-who">
                <div className="rep-list-name">{r.emp.name}</div>
                <div className="rep-list-dept">{r.emp.dept}</div>
              </div>
              <span className={`badge ${r.type === 'tardanza' ? 'badge--warn' : r.type === 'ausencia' ? 'badge--err' : 'badge--info'}`} style={{ fontSize:10.5, padding:'3px 9px', width:'fit-content' }}>
                {r.type === 'tardanza' ? (isES ? 'Tardanza' : 'Late') : r.type === 'ausencia' ? (isES ? 'Ausencia' : 'Absence') : (EVENT_TYPE_LABEL[r.evType] || (isES ? 'Eventualidad' : 'Event'))}
              </span>
              <span className="mono" style={{ fontFamily:'var(--font-mono)', fontSize:12.5, color:'var(--ink-500)' }}>{fmtShortDate(r.date)}</span>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:12.5, color: r.detailOk ? 'var(--success,#2f7a5a)' : 'var(--ink-400)', fontWeight: r.detailOk ? 700 : 400 }}>{r.detail}</span>
              {r.type === 'eventualidad' ? (
                <button
                  className={`badge ${r.estado === 'aceptado' ? 'badge--ok' : r.estado === 'rechazado' ? 'badge--err' : 'badge--warn'}`}
                  style={{ fontSize:10.5, padding:'3px 9px', width:'fit-content', border:'none', cursor: canApproveEventualidades ? 'pointer' : 'default', opacity: canApproveEventualidades ? 1 : 0.7 }}
                  title={canApproveEventualidades ? (isES ? 'Tocar para cambiar el estado' : 'Tap to change status') : (isES ? 'No tienes permiso para aprobar eventualidades' : 'You don\'t have permission to approve eventualities')}
                  onClick={() => cycleEventStatus(r.emp.id, r.evId)}>
                  {EVENT_STATUS_LABEL[r.estado] || EVENT_STATUS_LABEL.pendiente}
                </button>
              ) : <span style={{ color:'var(--ink-200)', fontSize:12 }}>—</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Horas trabajadas — mes filtrado ── */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card__head">
          <div>
            <div className="chart-card__title">{isES ? 'Horas trabajadas' : 'Hours worked'}</div>
            <div className="chart-card__sub">{monthLabel} · {isES ? 'calculado de entrada y salida reales' : 'calculated from real entry/exit'}</div>
          </div>
        </div>
        {hoursRows.length === 0 ? (
          <div className="audit-empty">
            <Icon name="clock" size={26} stroke={1.2}/>
            <div className="audit-empty__title">{isES ? 'Sin marcajes' : 'No check-ins'}</div>
            <div className="audit-empty__sub">{isES ? `No hay marcajes para ${monthLabel.toLowerCase()}.` : `No check-ins for ${monthLabel}.`}</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign:'left', padding:'8px 4px', fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, color:'var(--ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'2px solid var(--ink-100)' }}>{isES ? 'Empleado' : 'Employee'}</th>
                  <th style={{ textAlign:'center', padding:'8px 4px', fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, color:'var(--ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'2px solid var(--ink-100)' }}>{isES ? 'Días marcados' : 'Days'}</th>
                  <th style={{ textAlign:'center', padding:'8px 4px', fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, color:'var(--ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'2px solid var(--ink-100)' }}>{isES ? 'Horas totales' : 'Total hours'}</th>
                  <th style={{ textAlign:'center', padding:'8px 4px', fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, color:'var(--ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'2px solid var(--ink-100)' }}>{isES ? 'Promedio/día' : 'Avg/day'}</th>
                  <th style={{ textAlign:'center', padding:'8px 4px', fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, color:'var(--ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'2px solid var(--ink-100)' }}>{isES ? 'Sin salida' : 'No exit'}</th>
                </tr>
              </thead>
              <tbody>
                {hoursRows.map(r => {
                  const completeDays = r.days - r.incomplete;
                  const avg = completeDays > 0 ? r.totalHours / completeDays : 0;
                  return (
                    <tr key={r.emp.id} className="rep-row">
                      <td style={{ padding:'10px 4px', borderBottom:'1px solid var(--ink-100)' }}>
                        <div style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600, color:'var(--ink-800)' }}>{r.emp.name}</div>
                        <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)' }}>{r.emp.dept}</div>
                      </td>
                      <td style={{ textAlign:'center', padding:'10px 4px', borderBottom:'1px solid var(--ink-100)', fontFamily:'var(--font-mono)', fontSize:12.5, color:'var(--ink-600)' }}>{r.days}</td>
                      <td style={{ textAlign:'center', padding:'10px 4px', borderBottom:'1px solid var(--ink-100)', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color:'var(--ink-800)' }}>{r.totalHours.toFixed(1)}h</td>
                      <td style={{ textAlign:'center', padding:'10px 4px', borderBottom:'1px solid var(--ink-100)', fontFamily:'var(--font-mono)', fontSize:12.5, color:'var(--ink-600)' }}>{completeDays > 0 ? `${avg.toFixed(1)}h` : '—'}</td>
                      <td style={{ textAlign:'center', padding:'10px 4px', borderBottom:'1px solid var(--ink-100)' }}>
                        {r.incomplete > 0
                          ? <span className="badge badge--warn" style={{ fontSize:10 }}>{r.incomplete}</span>
                          : <span style={{ color:'var(--ink-200)', fontFamily:'var(--font-mono)', fontSize:12 }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FaltasSemanalReport filterMonth={filterMonth} monthLabel={monthLabel}/>

      </div>}

      {/* ── CALENDARIO — cumpleaños del mes + feriados del período ── */}
      {view === 'calendario' && <div key="calendario" className="rep-panel-in">

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:20 }}>
        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{isES ? 'Cumpleaños del mes' : 'Birthdays this month'}</div>
              <div className="chart-card__sub">{monthLabel}</div>
            </div>
          </div>
          {birthdaysThisMonth.length === 0 ? (
            <div className="audit-empty">
              <Icon name="calendar" size={26} stroke={1.2}/>
              <div className="audit-empty__title">{isES ? 'Sin cumpleaños' : 'No birthdays'}</div>
              <div className="audit-empty__sub">{isES ? `Nadie cumple años en ${monthLabel.toLowerCase()}.` : `No one has a birthday in ${monthLabel}.`}</div>
            </div>
          ) : (
            <div className="rep-rows-in">
              {birthdaysThisMonth.map(b => (
                <div className="rep-row" key={b.emp.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 4px' }}>
                  <div className="table__avatar" style={{ width:34, height:34, fontSize:11 }}>{initials(b.emp.name)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600, color:'var(--ink-800)' }}>{b.emp.name}</div>
                    <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)' }}>{b.emp.dept}</div>
                  </div>
                  <span className="badge badge--neutral" style={{ fontFamily:'var(--font-mono)', fontSize:11 }}>
                    {isES ? 'Día' : 'Day'} {b.day}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{isES ? 'Feriados del período' : 'Holidays this period'}</div>
              <div className="chart-card__sub">{monthLabel}</div>
            </div>
          </div>
          {holidaysThisMonth.length === 0 ? (
            <div className="audit-empty">
              <Icon name="calendar" size={26} stroke={1.2}/>
              <div className="audit-empty__title">{isES ? 'Sin feriados' : 'No holidays'}</div>
              <div className="audit-empty__sub">{isES ? `No hay feriados en ${monthLabel.toLowerCase()}.` : `No holidays in ${monthLabel}.`}</div>
            </div>
          ) : (
            <div className="rep-rows-in">
              {holidaysThisMonth.map(h => {
                const workers = holidayWorkers[h.date] || [];
                return (
                  <div key={h.date} style={{ padding:'10px 4px', borderBottom:'1px solid var(--ink-100)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span className="mono" style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-500)', minWidth:38 }}>{fmtShortDate(h.date)}</span>
                      <span style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600, color:'var(--ink-800)', flex:1 }}>{isES ? h.name_es : h.name_en}</span>
                      {workers.length > 0 && (
                        <span className="badge badge--info" style={{ fontSize:10 }}>{workers.length} {isES ? 'trabajaron' : 'worked'}</span>
                      )}
                    </div>
                    {workers.length > 0 && (
                      <div style={{ marginTop:6, marginLeft:48, display:'flex', flexWrap:'wrap', gap:6 }}>
                        {workers.map(w => (
                          <span key={w.id} style={{ fontFamily:'var(--font-sans)', fontSize:11.5, color:'var(--ink-500)', background:'var(--cream-50)', padding:'3px 9px', borderRadius:999 }}>{w.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      </div>}
    </div>
  );
}

const DONUT_SEG_GAP = 8; // separación visual entre segmentos, en px de circunferencia

/* Donut con degradado "glossy" por segmento (claro→base→oscuro, vía
   shadeHex) — sin la "pared" 3D duplicada de la versión vieja, solo el aro
   real con el gradiente. Cada segmento entra con un fade+scale escalonado
   por índice (mismo repFadeIn que usa el resto de la app), y el aro
   completo gira lento sin parar.
   Mientras se toca/pasa el mouse sobre el aro, los segmentos se dispersan
   hacia afuera, cada uno en su propia dirección radial (dx/dy = ángulo medio
   del segmento) — al soltar/quitar el mouse vuelven a juntarse solos, no es
   un toggle que quede pegado. Hover cruzado: pasar el mouse sobre una fila de la
   leyenda resalta su segmento en el aro (más grueso, el resto se atenúa) y
   viceversa — conecta las dos listas en vez de dejarlas sueltas. */
const LEGEND_CAP = 6; // cuántos departamentos reales se muestran en la tarjeta compacta antes de agrupar el resto en "Otros".

/* Aclara/oscurece un color HEX un `percent` (negativo = más oscuro) — arma el
   degradado "glossy" de cada segmento del donut. Colores que no son hex (p. ej.
   var(--ink-200) del bucket "Otros") se devuelven tal cual, sin degradado. */
function shadeHex(hex, percent) {
  if (typeof hex !== 'string' || hex[0] !== '#') return hex;
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  const target = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  r = Math.round((target - r) * p) + r;
  g = Math.round((target - g) * p) + g;
  b = Math.round((target - b) * p) + b;
  return `rgb(${r},${g},${b})`;
}

function DeptDonutViz({ dist, centerLabel, large }) {
  const uid      = React.useId().replace(/:/g, '');
  const [exploded, setExploded] = React.useState(false);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const total    = dist.reduce((s, d) => s + d.value, 0);
  const r        = 52;
  const circ     = 2 * Math.PI * r;
  let   offset   = 0;
  let   cum      = 0;
  // En reposo el aro queda unido (sin gap, un solo anillo continuo); el corte
  // entre departamentos solo aparece mientras se toca/pasa el mouse, junto
  // con el empuje hacia afuera (exploded).
  const gapNow   = exploded ? DONUT_SEG_GAP : 0;
  const segments = dist.map(d => {
    const frac     = total > 0 ? d.value / total : 0;
    const length   = circ * frac;
    const visLength = Math.max(0, length - gapNow);
    const midAngle  = ((cum + length / 2) / circ) * 2 * Math.PI;
    const seg      = {
      ...d, length: visLength, gap: circ - visLength, offset: offset - gapNow / 2, frac,
      dx: Math.cos(midAngle), dy: Math.sin(midAngle),
    };
    offset -= length; // avanza con la longitud real, no la achicada por el gap
    cum    += length;
    return seg;
  });
  const EXPLODE_PX = 10;

  return (
    <div className={`donut-wrap ${large ? 'donut-wrap--lg' : ''}`}>
      <div className="donut"
        onMouseEnter={() => setExploded(true)}
        onMouseLeave={() => setExploded(false)}
        onTouchStart={() => setExploded(true)}
        onTouchEnd={() => setExploded(false)}>
        <svg viewBox="0 0 140 140" className="donut__spin" aria-label="Separar segmentos">
          <defs>
            {segments.map((s, i) => s.color[0] === '#' && (
              <linearGradient key={i} id={`${uid}-g${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={shadeHex(s.color, 32)}/>
                <stop offset="55%"  stopColor={s.color}/>
                <stop offset="100%" stopColor={shadeHex(s.color, -26)}/>
              </linearGradient>
            ))}
          </defs>
          <g className="donut__ring">
            {/* strokeWidth fijo en 16 — antes el segmento con hover se ponía a 20
                para "resaltarlo", pero como cada segmento es su propio <circle>
                independiente, eso lo hacía 2px más ancho que sus vecinos hacia
                adentro y hacia afuera, dejando un escalón rectangular visible
                justo en el borde compartido (el "rabito"/"pestañita" morado que
                aparecía entre Sistemas y RRHH). El hover ya se distingue solo con
                la opacidad de los demás segmentos (línea de abajo), no hace falta
                también cambiar el grosor. */}
            <g transform="rotate(-90 70 70)">
              {segments.map((s, i) => s.length > 0 && (
                <circle key={i} cx="70" cy="70" r={r} fill="none"
                  stroke={s.color[0] === '#' ? `url(#${uid}-g${i})` : s.color}
                  strokeWidth={16} strokeLinecap="butt"
                  strokeDasharray={`${s.length} ${s.gap}`} strokeDashoffset={s.offset}
                  className="donut__seg"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.35,
                    transform: exploded ? `translate(${s.dx * EXPLODE_PX}px, ${s.dy * EXPLODE_PX}px)` : 'none',
                    pointerEvents: 'visibleStroke',
                  }}/>
              ))}
            </g>
          </g>
        </svg>
        <div className="donut__center">
          <div>
            <div className="donut__num">{total}</div>
            <div className="donut__lab">{centerLabel}</div>
          </div>
        </div>
      </div>
      <div className="donut__legend">
        {dist.map((d, i) => (
          <div key={i} className={`donut__legend-row ${hoverIdx === i ? 'donut__legend-row--active' : ''} ${i === 0 ? 'donut__legend-row--top' : ''}`}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}>
            <span className="donut__legend-swatch" style={{ background:d.color }}/>
            <span className="donut__legend-name">{d.name}</span>
            <span className="donut__legend-val"><ScouterCounter value={d.value} inline color="var(--ink-700)"/></span>
            <span className="donut__legend-pct">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* El polling de asistencia (cada 2.5s) fuerza un re-render de ReportsView
   aunque nadie haya entrado/salido — y como `buildActiveNowDist` arma un
   array NUEVO en cada llamada, React ve props "distintas" en cada segmento
   del donut y retriggerea la transición CSS de stroke-dasharray/dashoffset
   (styles.css .donut__seg) sin que haya nada real que animar. Cada segmento
   transiciona por separado, así que a mitad de esa animación de sobra los
   bordes entre segmentos quedan desalineados por una fracción de segundo —
   un triángulo del vecino (o de la sombra de abajo) asomando en el borde.
   `useStableList` corta eso: sigue recalculando en cada render (mismo motivo
   de siempre — EMPLOYEES se muta en sitio, un useMemo con `emps` en deps no
   vería el cambio), pero solo devuelve una referencia NUEVA cuando el
   contenido (nombre+valor de cada depto) realmente cambió. */
function useStableList(list, keyOf) {
  const key = list.map(keyOf).join('|');
  const ref = React.useRef({ key, list });
  if (ref.current.key !== key) ref.current = { key, list };
  return ref.current.list;
}

function ActiveNowDonut({ t, isES, attRecords, large }) {
  const emps = typeof EMPLOYEES !== 'undefined' ? EMPLOYEES : [];
  // Compacta: top 6 + "Otros" agrupado (no cabe cada departamento en la
  // tarjeta). Ampliada: todos los departamentos reales, sin agrupar.
  const rawDist = buildActiveNowDist(emps, attRecords, large ? null : LEGEND_CAP, isES ? 'Otros' : 'Others');
  const dist = useStableList(rawDist, d => `${d.name}:${d.value}`);
  return <DeptDonutViz dist={dist} centerLabel={t.rep_donut_active} large={large}/>;
}

/* ── FaltasSemanalReport ── */
function FaltasSemanalReport({ filterMonth, monthLabel }) {
  var absInit = function() {
    try { return JSON.parse(localStorage.getItem('uasd_absences') || '{}'); } catch(e) { return {}; }
  };
  var absState = React.useState(absInit);
  var absencesMap = absState[0];
  var setAbsencesMap = absState[1];

  React.useEffect(function() {
    var sync = function() {
      try { setAbsencesMap(JSON.parse(localStorage.getItem('uasd_absences') || '{}')); } catch(e) {}
    };
    window.addEventListener('storage', sync);
    return function() { window.removeEventListener('storage', sync); };
  }, []);

  var weeks = React.useMemo(function() {
    var ym = filterMonth || new Date().toISOString().slice(0, 7);
    var year  = parseInt(ym.slice(0, 4), 10);
    var month = parseInt(ym.slice(5, 7), 10) - 1;
    var lastDay = new Date(year, month + 1, 0);
    var weekMap = {};
    var d = new Date(year, month, 1);
    while (d <= lastDay) {
      var dow = d.getDay();
      if (dow >= 1 && dow <= 5) {
        var mondayOffset = 1 - dow;
        var monday = new Date(d);
        monday.setDate(d.getDate() + mondayOffset);
        var key = monday.getFullYear() + '-' +
          String(monday.getMonth() + 1).padStart(2, '0') + '-' +
          String(monday.getDate()).padStart(2, '0');
        if (!weekMap[key]) weekMap[key] = [];
        weekMap[key].push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return Object.keys(weekMap).sort().map(function(key) {
      return { key: key, days: weekMap[key] };
    });
  }, [filterMonth]);

  var emps = typeof EMPLOYEES !== 'undefined'
    ? EMPLOYEES.filter(function(e) { return e.status === 'ok'; })
    : [];

  var DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

  function fmtDate(day) {
    return day.getFullYear() + '-' +
      String(day.getMonth() + 1).padStart(2, '0') + '-' +
      String(day.getDate()).padStart(2, '0');
  }

  return (
    <div className="faltas-semanales-report" style={{ marginTop: 28 }}>

      {/* visible only when printing */}
      <div className="print-report-header" style={{ display:'none', marginBottom:20 }}>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:700, color:'var(--ink-800)' }}>
          UASD — Reporte de Faltas por Semanas
        </div>
        <div style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--ink-500)', marginTop:4 }}>
          {monthLabel} · Generado el {new Date().toLocaleDateString('es-DO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </div>
      </div>

      {/* section header */}
      <div className="print-hide" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ fontFamily:'var(--font-sans)', fontSize:15, fontWeight:700, color:'var(--ink-800)', display:'flex', alignItems:'center', gap:8 }}>
            <Icon name="calendar" size={15}/>
            Reporte de faltas por semanas
          </div>
          <div style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--ink-400)', marginTop:3 }}>
            {monthLabel} · faltas registradas por empleado
          </div>
        </div>
        <button
          onClick={function() { window.print(); }}
          style={{
            display:'flex', alignItems:'center', gap:7,
            fontFamily:'var(--font-sans)', fontSize:12, fontWeight:600,
            color:'var(--ink-700)', background:'var(--paper)',
            border:'1px solid var(--ink-200)', borderRadius:8,
            padding:'7px 14px', cursor:'pointer'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Imprimir reporte
        </button>
      </div>

      {/* legend */}
      <div className="print-hide" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16, flexWrap:'wrap' }}>
        {[
          { bg:'rgba(34,197,94,0.10)',  color:'#16a34a',              sym:'✓', label:'Presente' },
          { bg:'rgba(193,85,77,0.13)',  color:'var(--danger,#c1554d)', sym:'✕', label:'Ausente sin justificar' },
          { bg:'rgba(200,160,0,0.14)',  color:'var(--gold-600,#b45309)',sym:'✕', label:'Ausente justificado' },
          { bg:'rgba(59,130,246,0.10)', color:'#3b82f6',              sym:'📅', label:'Feriado' },
        ].map(function(item, i) {
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-500)' }}>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:'50%', background:item.bg, color:item.color, fontWeight:700, fontSize:12 }}>{item.sym}</span>
              {item.label}
            </div>
          );
        })}
      </div>

      {/* weeks */}
      {weeks.length === 0 ? (
        <div style={{ padding:'24px', textAlign:'center', fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink-400)' }}>
          Sin datos para este período.
        </div>
      ) : weeks.map(function(week, wi) {
        var d0 = week.days[0];
        var dN = week.days[week.days.length - 1];
        var rangeLabel = d0.getDate() + ' — ' + dN.getDate();

        return (
          <div key={week.key} className="chart-card faltas-week-card" style={{ marginBottom:16, overflow:'hidden', pageBreakInside:'avoid' }}>
            <div style={{ padding:'9px 16px', background:'var(--ink-800)', color:'var(--paper)', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', opacity:0.5 }}>
                Semana {wi + 1}
              </span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600 }}>
                {rangeLabel}
              </span>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign:'left', padding:'8px 16px', fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, color:'var(--ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'2px solid var(--ink-100)', minWidth:190, whiteSpace:'nowrap' }}>
                      Empleado
                    </th>
                    {week.days.map(function(day) {
                      var dow = day.getDay() - 1;
                      return (
                        <th key={fmtDate(day)} style={{ textAlign:'center', padding:'6px 8px', fontFamily:'var(--font-sans)', fontSize:10, fontWeight:700, color:'var(--ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'2px solid var(--ink-100)', minWidth:52 }}>
                          <div>{DAY_NAMES[dow]}</div>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-600)', marginTop:2, fontWeight:600, letterSpacing:0, textTransform:'none' }}>
                            {day.getDate()}
                          </div>
                        </th>
                      );
                    })}
                    <th style={{ textAlign:'center', padding:'8px 12px', fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, color:'var(--ink-400)', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'2px solid var(--ink-100)' }}>
                      Faltas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emps.map(function(emp, ei) {
                    var empAbs = absencesMap[emp.id] || [];
                    var dayCells = week.days.map(function(day) {
                      var ds = fmtDate(day);
                      var found = null;
                      for (var i = 0; i < empAbs.length; i++) {
                        if (empAbs[i].date === ds) { found = empAbs[i]; break; }
                      }
                      return { ds: ds, abs: found, isHoliday: isHoliday(ds) };
                    });
                    var absCount = dayCells.filter(function(c) { return c.abs !== null && !c.isHoliday; }).length;

                    return (
                      <tr key={emp.id} style={{ background: ei % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.018)' }}>
                        <td style={{ padding:'9px 16px', borderBottom:'1px solid var(--ink-100)', whiteSpace:'nowrap' }}>
                          <div style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600, color:'var(--ink-800)' }}>{emp.name}</div>
                          <div style={{ fontFamily:'var(--font-sans)', fontSize:10, color:'var(--ink-400)', marginTop:1 }}>{emp.dept}</div>
                        </td>
                        {dayCells.map(function(cell) {
                          var isAbsent  = cell.abs !== null && !cell.isHoliday;
                          var justified = isAbsent && cell.abs.justified;
                          if (cell.isHoliday) {
                            return (
                              <td key={cell.ds} style={{ textAlign:'center', padding:'8px 4px', borderBottom:'1px solid var(--ink-100)' }}>
                                <span title="Feriado" style={{
                                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                                  width:24, height:24, borderRadius:'50%',
                                  background:'rgba(59,130,246,0.10)', color:'#3b82f6',
                                  fontWeight:700, fontSize:13
                                }}>📅</span>
                              </td>
                            );
                          }
                          return (
                            <td key={cell.ds} style={{ textAlign:'center', padding:'8px 4px', borderBottom:'1px solid var(--ink-100)' }}>
                              {isAbsent ? (
                                <span title={justified ? 'Ausencia justificada' : 'Ausencia sin justificar'} style={{
                                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                                  width:24, height:24, borderRadius:'50%',
                                  background: justified ? 'rgba(200,160,0,0.14)' : 'rgba(193,85,77,0.13)',
                                  color: justified ? 'var(--gold-600,#b45309)' : 'var(--danger,#c1554d)',
                                  fontWeight:700, fontSize:13
                                }}>✕</span>
                              ) : (
                                <span style={{
                                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                                  width:24, height:24, borderRadius:'50%',
                                  background:'rgba(34,197,94,0.10)', color:'#16a34a',
                                  fontWeight:700, fontSize:13
                                }}>✓</span>
                              )}
                            </td>
                          );
                        })}
                        <td style={{ textAlign:'center', padding:'8px 12px', borderBottom:'1px solid var(--ink-100)' }}>
                          {absCount > 0
                            ? <span className="badge badge--err" style={{ fontSize:11 }}>{absCount}</span>
                            : <span className="badge badge--ok"  style={{ fontSize:11 }}>0</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { ReportsView });
