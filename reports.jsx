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
        {active && (() => {
          const xPct = clampPct((active.x / W) * 100);
          const yPct = (active.y / H) * 100;
          // HOY siempre cae en el punto más a la derecha (última fecha) — si
          // además es el valor más alto de la semana, su tooltip nace justo
          // en la esquina superior derecha, la misma zona donde vive el HUD
          // .rep-scouter (top:-6px; right:0). Ahí el tooltip quedaba tapando
          // el número del contador. Solo en ese rincón (y solo si hay
          // contador, que es lo único que ocupa esa esquina) lo mandamos
          // abajo del punto en vez de arriba.
          const below = counter && xPct > 78 && yPct < 34;
          return (
            <div className={`rep-area-tooltip ${expanded ? 'rep-area-tooltip--lg' : ''} ${below ? 'rep-area-tooltip--below' : ''}`}
              style={{ left: `${xPct}%`, top: `${yPct}%`, marginTop: below ? 10 : -10 }}>
              <b>{formatValue(activeIdx)}</b>
            </div>
          );
        })()}
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

/* ── InsightBolt — "Aspectos destacados" como un rayo: la chispa nace
   pegada al margen de la esquina inferior derecha de la tarjeta y el trazo
   sube ramificándose hacia la izquierda. Dos capas: una textura decorativa
   (recursiva, determinística — mismo seed → mismo dibujo siempre) que da
   la sensación de ramificación fina de un rayo real, con una ráfaga de
   impacto (líneas radiando hacia todos lados) en la chispa — ahí es donde
   "pega" contra el suelo. Encima, tantas RAMAS DE DATOS como hallazgos,
   coloreadas por severidad, terminando en el punto seleccionable de cada
   una — clic o teclado abre el popover con la información, con la flechita
   corregida para apuntar exacto al punto real (no al centro del popover,
   que se recentra cerca de los bordes). ── */
function InsightBolt({ insights, isES, onGoto }) {
  const n = insights.length;
  const W = 480, H = 250;
  const [selected, setSelected] = React.useState(0);
  const wrapRef = React.useRef(null);
  const [wrapWidth, setWrapWidth] = React.useState(0);

  React.useEffect(() => { if (selected >= n) setSelected(0); }, [n, selected]);

  React.useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWrapWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ROOT = { x: W - 3, y: H - 3 };
  const TIP = { x: 30, y: 26 };

  const texture = React.useMemo(() => {
    const segs = [];
    const hash = (s) => { const v = Math.sin(s * 12.9898) * 43758.5453; return v - Math.floor(v); };
    const dx = TIP.x - ROOT.x, dy = TIP.y - ROOT.y;
    const baseAngle = Math.atan2(dy, dx);
    const walk = (x, y, angle, len, depth, seed) => {
      if (depth <= 0 || len < 5) return;
      const wig = (hash(seed) - 0.5) * 0.6;
      const a = angle + wig;
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      segs.push({ x1: x, y1: y, x2, y2, w: Math.max(0.6, depth * 0.19) });
      walk(x2, y2, a, len * 0.86, depth - 1, seed * 1.37 + 1);
      if (depth > 2) walk(x2, y2, a + 0.55, len * 0.42, depth - 2, seed * 2.19 + 3);
      if (depth > 2 && depth % 2 === 0) walk(x2, y2, a - 0.5, len * 0.38, depth - 2, seed * 3.71 + 7);
      if (depth > 4 && depth % 3 === 0) walk(x2, y2, a + 0.3, len * 0.3, depth - 3, seed * 5.03 + 11);
    };
    walk(ROOT.x, ROOT.y, baseAngle, 96, 14, 5);

    for (let k = 0; k < 7; k++) {
      const ia = baseAngle + (hash(k * 3.31 + 41) - 0.5) * 3.0;
      const ilen = 16 + hash(k * 5.77 + 53) * 26;
      segs.push({
        x1: ROOT.x, y1: ROOT.y,
        x2: ROOT.x + Math.cos(ia) * ilen, y2: ROOT.y + Math.sin(ia) * ilen,
        w: 1 + hash(k * 2.13 + 7) * 1.1,
      });
    }
    return segs;
  }, []);

  const branches = React.useMemo(() => {
    if (n === 0) return [];
    const dx = TIP.x - ROOT.x, dy = TIP.y - ROOT.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    return Array.from({ length: n }, (_, i) => {
      const t = (n - i - 0.3) / (n + 0.4);
      const ox = ROOT.x + dx * t, oy = ROOT.y + dy * t;
      const side = i % 2 === 0 ? 1 : -1;
      const deg = (30 + (i * 7) % 14) * side;
      const rad = (deg * Math.PI) / 180;
      const fx = ux * Math.cos(rad) - uy * Math.sin(rad);
      const fy = ux * Math.sin(rad) + uy * Math.cos(rad);
      const blen = 34 + ((i * 5) % 12);
      const tipX = ox + fx * blen, tipY = oy + fy * blen;
      return { origin: { x: ox, y: oy }, tip: { x: tipX, y: tipY } };
    });
  }, [n]);

  const sel = insights[selected];
  const selTip = branches[selected]?.tip;

  return (
    <div className="insight-bolt" ref={wrapRef}>
      <svg viewBox={`0 0 ${W} ${H}`} className="insight-bolt__svg">
        <g className="insight-bolt__texture">
          {texture.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={s.w}/>
          ))}
        </g>
        <circle className="insight-bolt__spark" cx={ROOT.x} cy={ROOT.y} r="4"/>

        {branches.map((b, i) => {
          const ins = insights[i];
          const isSel = i === selected;
          const d = `M${b.origin.x.toFixed(1)},${b.origin.y.toFixed(1)} L${b.tip.x.toFixed(1)},${b.tip.y.toFixed(1)}`;
          return (
            <g key={i} className={`insight-bolt__branch-g insight-bolt__branch-g--${i % 8}`}>
              <path d={d} pathLength="1" className={`insight-bolt__branch rep-area-draw insight-bolt__branch--${ins.status}`}/>
              <g
                className={`insight-bolt__node-g ${isSel ? 'is-selected' : ''}`}
                role="button" tabIndex={0}
                aria-label={ins.catLabel}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(i); } }}>
                <circle cx={b.tip.x} cy={b.tip.y} r="15" fill="transparent"/>
                <circle cx={b.tip.x} cy={b.tip.y} r={isSel ? 7 : 5} className={`insight-bolt__node insight-bolt__node--${ins.status}`}/>
              </g>
            </g>
          );
        })}
      </svg>

      {sel && selTip && (() => {
        const rawX = (selTip.x / W) * 100, rawY = (selTip.y / H) * 100;
        const xPct = Math.min(80, Math.max(20, rawX));
        const below = rawY < 40;
        const arrowPx = wrapWidth
          ? Math.max(-96, Math.min(96, ((rawX - xPct) / 100) * wrapWidth))
          : 0;
        return (
          <div key={selected} className={`insight-bolt__popover insight-bolt__popover--${sel.status} ${below ? 'insight-bolt__popover--below' : ''} insight-bolt__popover-in`}
            style={{ left: `${xPct}%`, top: `${rawY}%`, '--arrow-x': `${arrowPx}px` }}>
            <div className="insight-bolt__popover-head">
              <span className={`insight-bolt__popover-icon insight-bolt__popover-icon--${sel.status}`}>
                <Icon name={sel.icon || 'activity'} size={13} stroke={2.4}/>
              </span>
              <span className="insight-bolt__popover-cat">{sel.catLabel}</span>
            </div>
            <div className="insight-bolt__popover-text">{sel.text}</div>
            {sel.rec && <div className="insight-bolt__popover-rec">{sel.rec}</div>}
            {sel.action && (
              <button type="button" className="insight-bolt__popover-goto" onClick={() => onGoto(sel.action)}>
                {isES ? 'Ver en Detalle' : 'View in Detail'}
                <Icon name="arrowRight" size={12} stroke={2.4}/>
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ── RepAccordion — envoltorio de .chart-card con header cliqueable, para las
   secciones secundarias de Detalle (Horas trabajadas, Faltas por semana):
   la lista unificada arriba es el contenido principal de la pestaña, estas
   son de consulta ocasional y no ameritan ocupar full altura siempre. ── */
function RepAccordion({ title, subtitle, count, extra, defaultOpen, className, children }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  return (
    <div className={`chart-card rep-accordion ${className || ''}`} style={{ marginBottom: 20 }}>
      <button type="button" className="rep-accordion__head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div>
          <div className="chart-card__title">{title}</div>
          {subtitle && <div className="chart-card__sub">{subtitle}</div>}
        </div>
        <div className="rep-accordion__meta">
          {extra}
          {count != null && <span className="badge badge--neutral">{count}</span>}
          <span className={`rep-accordion__chev ${open ? 'rep-accordion__chev--open' : ''}`}>
            <Icon name="chevDown" size={16} stroke={2}/>
          </span>
        </div>
      </button>
      {open && <div className="rep-accordion__body rep-panel-in">{children}</div>}
    </div>
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

  /* ── Aspectos destacados — insights calculados de datos reales, no
     inventados. Cada uno se omite si no hay suficiente data para
     sostenerlo. El de puntualidad (mes vs. mes anterior) se quitó de acá
     porque duplicaba exactamente el pill de tendencia del primer KPI,
     arriba en la misma pestaña.

     Cada insight lleva:
       - status: severidad real (ok|info|warn|critical) — separa lo
         puramente informativo (hora pico) de lo que sí amerita atención, y
         escala warn→critical cuando el número ya es grave.
       - icon: ícono propio del tipo de hallazgo, para el popover del rayo.
       - action: { view, filter } opcional — si existe, el punto salta
         directo a Detalle con el filtro correspondiente ya aplicado. ── */
  /* ── Estadísticas por departamento — mes actual y anterior. Extraído de
     "Aspectos destacados" (antes vivía inline solo ahí) para que la tab
     Departamentos reuse exactamente el mismo cálculo en vez de duplicarlo. ── */
  const deptStatsFor = React.useCallback((records, ym) => {
    const byDept = {};
    records.forEach(a => {
      const emp = emps.find(e => e.id === a.empId);
      if (!emp) return;
      byDept[emp.dept] = byDept[emp.dept] || { total: 0, onTime: 0, absences: 0 };
      byDept[emp.dept].total++;
      if (!a.late) byDept[emp.dept].onTime++;
    });
    emps.forEach(emp => {
      (absMap[emp.id] || []).forEach(ab => {
        if (ab.date?.slice(0,7) !== ym || isHoliday(ab.date)) return;
        byDept[emp.dept] = byDept[emp.dept] || { total: 0, onTime: 0, absences: 0 };
        byDept[emp.dept].absences++;
      });
    });
    return byDept;
  }, [emps, absMap]);

  const deptStatsCur  = React.useMemo(() => deptStatsFor(curMonthRecords,  curMonthKey),  [deptStatsFor, curMonthRecords,  curMonthKey]);
  const deptStatsPrev = React.useMemo(() => deptStatsFor(prevMonthRecords, prevMonthKey), [deptStatsFor, prevMonthRecords, prevMonthKey]);

  const deptRates = React.useMemo(() => Object.keys(deptStatsCur)
    .filter(d => deptStatsCur[d].total >= 2)
    .map(d => ({ dept: d, rate: deptStatsCur[d].onTime / deptStatsCur[d].total }))
    .sort((a, b) => b.rate - a.rate), [deptStatsCur]);

  const insights = React.useMemo(() => {
    const out = [];

    if (deptRates.length) {
      const pct = Math.round(deptRates[0].rate * 100);
      out.push({
        status: 'ok', icon: 'award',
        text: isES
          ? `${deptRates[0].dept} es el departamento con mejor asistencia (${pct}%)`
          : `${deptRates[0].dept} has the best attendance (${pct}%)`,
        catLabel: isES ? 'Departamento' : 'Department',
      });
    }

    // Opuesto al anterior — solo si hay más de un departamento con muestra
    // suficiente, si no "peor" y "mejor" serían el mismo y se repetiría el dato.
    if (deptRates.length > 1) {
      const worstDept = deptRates[deptRates.length - 1];
      const pct = Math.round(worstDept.rate * 100);
      out.push({
        status: 'warn', icon: 'users',
        text: isES
          ? `${worstDept.dept} es el departamento con más tardanzas (${100 - pct}% de llegadas tarde)`
          : `${worstDept.dept} has the most late arrivals (${100 - pct}% arrive late)`,
        catLabel: isES ? 'Departamento' : 'Department',
        action: { view: 'detalle', filter: 'tardanza' },
      });
    }

    // Señala a un empleado por nombre — exige al menos 2 ausencias sin
    // justificar en el mes, no 1, para no "acusar" a alguien por un
    // incidente aislado (una sola falta puede ser cualquier cosa). A partir
    // de 4 ya no es "puede ser cualquier cosa" — pasa a crítico.
    let worstAbs = null;
    emps.forEach(emp => {
      const list = (absMap[emp.id] || []).filter(a => a.date?.slice(0,7) === curMonthKey && !a.justified && !isHoliday(a.date));
      if (list.length && (!worstAbs || list.length > worstAbs.count)) worstAbs = { emp, count: list.length };
    });
    if (worstAbs && worstAbs.count >= 2) {
      out.push({
        status: worstAbs.count >= 4 ? 'critical' : 'warn', icon: 'userX',
        text: isES
          ? `${worstAbs.emp.name} acumula ${worstAbs.count} ausencias sin justificar este mes`
          : `${worstAbs.emp.name} has ${worstAbs.count} unjustified absences this month`,
        catLabel: isES ? 'Ausencias' : 'Absences',
        action: { view: 'detalle', filter: 'ausencia' },
      });
    }

    // Mismo criterio que ausentismo (mínimo 2, no señalar por un caso
    // aislado; 5+ pasa a crítico) pero contando llegadas tarde por persona
    // en vez de ausencias.
    let worstLate = null;
    emps.forEach(emp => {
      const count = curMonthRecords.filter(a => a.empId === emp.id && a.late).length;
      if (count && (!worstLate || count > worstLate.count)) worstLate = { emp, count };
    });
    if (worstLate && worstLate.count >= 2) {
      out.push({
        status: worstLate.count >= 5 ? 'critical' : 'warn', icon: 'clock',
        text: isES
          ? `${worstLate.emp.name} llegó tarde ${worstLate.count} veces este mes`
          : `${worstLate.emp.name} arrived late ${worstLate.count} times this month`,
        catLabel: isES ? 'Puntualidad' : 'Punctuality',
        action: { view: 'detalle', filter: 'tardanza' },
      });
    }

    // Cola de eventualidades sin aprobar/rechazar este mes — si se acumulan
    // varias, vale la pena avisar antes de que la lista crezca más; 6+ ya es
    // una cola real, no solo "vale la pena revisar cuando puedas".
    let pendingEv = 0;
    Object.values(evMap).forEach(list => {
      (list || []).forEach(ev => {
        if (ev.date?.slice(0,7) === curMonthKey && (ev.estado || 'pendiente') === 'pendiente') pendingEv++;
      });
    });
    if (pendingEv >= 3) {
      out.push({
        status: pendingEv >= 6 ? 'critical' : 'warn', icon: 'calendar',
        text: isES
          ? `Hay ${pendingEv} eventualidades pendientes de aprobar este mes`
          : `There are ${pendingEv} eventualities pending approval this month`,
        rec: isES
          ? 'Recomendación: revisar la cola de eventualidades en Detalle antes de que se acumule más.'
          : 'Recommendation: review the eventualities queue in Detail before it piles up further.',
        catLabel: isES ? 'Tendencia' : 'Trend',
        action: { view: 'detalle', filter: 'eventualidad' },
      });
    }

    if (peakHourIdx >= 0) {
      out.push({
        status: 'info', icon: 'activity',
        text: isES
          ? `El pico de marcajes ocurre entre las ${hourHours[peakHourIdx]}:00 y ${hourHours[peakHourIdx] + 1}:00`
          : `Check-ins peak between ${hourHours[peakHourIdx]}:00 and ${hourHours[peakHourIdx] + 1}:00`,
        catLabel: isES ? 'Tendencia' : 'Trend',
      });
    }

    // Prioriza por severidad real, no por el orden en que se calcularon —
    // lo crítico sube arriba, lo puramente informativo (hora pico) al final.
    const RANK = { critical: 0, warn: 1, ok: 2, info: 3 };
    return out.sort((a, b) => RANK[a.status] - RANK[b.status]);
  }, [curMonthRecords, emps, absMap, evMap, curMonthKey, peakHourIdx, hourHours, isES, deptRates]);

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

  /* ── Buscador por empleado/departamento + orden por columna de la lista de
     Detalle — antes la única forma de acotar la lista eran los chips de
     tipo; con un departamento grande esa lista puede crecer bastante y no
     había forma de encontrar a alguien puntual ni de reordenarla. El
     conteo de los chips (detailCounts, arriba) sigue basado en detailRows
     sin buscador, para que siga mostrando el total real por tipo aunque
     haya un texto de búsqueda activo. */
  const [detailSearch, setDetailSearch] = React.useState('');
  const searchedDetailRows = React.useMemo(() => {
    const q = detailSearch.trim().toLowerCase();
    if (!q) return visibleDetailRows;
    return visibleDetailRows.filter(r => r.emp.name.toLowerCase().includes(q) || r.emp.dept.toLowerCase().includes(q));
  }, [visibleDetailRows, detailSearch]);

  const [detailSort, setDetailSort] = React.useState({ key: 'date', dir: 'desc' });
  const toggleDetailSort = (key) => {
    setDetailSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'date' ? 'desc' : 'asc' });
  };
  const sortedDetailRows = React.useMemo(() => {
    const dir = detailSort.dir === 'asc' ? 1 : -1;
    const val = (r) => {
      if (detailSort.key === 'name')   return r.emp.name;
      if (detailSort.key === 'type')   return r.type;
      if (detailSort.key === 'estado') return r.estado || '';
      return r.date;
    };
    return [...searchedDetailRows].sort((a, b) => {
      const av = val(a), bv = val(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return b.date.localeCompare(a.date); // desempate estable: más reciente primero
    });
  }, [searchedDetailRows, detailSort]);

  // Botón de encabezado ordenable — se usa tanto en la lista unificada
  // (.rep-list-row--head) como en Horas trabajadas (.data-table th), ambos
  // heredan mayúscula/tracking/color del contenedor vía `font/text-transform:
  // inherit` en .rep-sort-th.
  const SortTh = ({ label, active, dir, onClick }) => (
    <button type="button" className={`rep-sort-th ${active ? `rep-sort-th--active${dir === 'asc' ? ' rep-sort-th--asc' : ''}` : ''}`} onClick={onClick}>
      {label}
      <span className="rep-sort-th__icon"><Icon name="chevDown" size={11} stroke={2.6}/></span>
    </button>
  );

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

  const [hoursSort, setHoursSort] = React.useState({ key: 'total', dir: 'desc' });
  const toggleHoursSort = (key) => {
    setHoursSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  };
  const sortedHoursRows = React.useMemo(() => {
    const dir = hoursSort.dir === 'asc' ? 1 : -1;
    const val = (r) => {
      const completeDays = r.days - r.incomplete;
      switch (hoursSort.key) {
        case 'name':      return r.emp.name;
        case 'days':      return r.days;
        case 'avg':       return completeDays > 0 ? r.totalHours / completeDays : -1;
        case 'incomplete':return r.incomplete;
        default:          return r.totalHours;
      }
    };
    return [...hoursRows].sort((a, b) => {
      const av = val(a), bv = val(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [hoursRows, hoursSort]);

  // Construye las mismas filas (Tardanzas + Ausencias + Eventualidades del
  // mes filtrado) para los dos formatos de export — mismo patrón que
  // dashboard.jsx (dropdown Exportar → PDF / Excel).
  const buildExportRows = (onlyEmpId) => {
    let evMap = {};
    try { evMap = JSON.parse(localStorage.getItem('uasd_eventualidades') || '{}'); } catch {}

    const rows = [];
    const targetEmps = onlyEmpId ? emps.filter(e => e.id === onlyEmpId) : emps;

    targetEmps.forEach(emp => {
      Object.values(allAtt)
        .filter(a => a.empId === emp.id && a.late && a.date?.slice(0, 7) === filterMonth)
        .forEach(a => rows.push(['Tardanza', emp.name, emp.dept, a.date, '', a.justified ? 'Justificada' : 'No justificada']));
    });

    targetEmps.forEach(emp => {
      (absMap[emp.id] || [])
        .filter(a => a.date?.slice(0, 7) === filterMonth && !isHoliday(a.date))
        .forEach(a => rows.push(['Ausencia', emp.name, emp.dept, a.date, a.auto ? 'Automática' : '', a.justified ? 'Justificada' : 'No justificada']));
    });

    targetEmps.forEach(emp => {
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

  const exportExcel = (onlyEmpId) => {
    setExportOpen(false);
    const esc = (v) => `"${csvSafe(v).replace(/"/g, '""')}"`;
    const header = ['Secci\u00F3n', 'Empleado', 'Departamento', 'Fecha', 'Detalle', 'Estado'];
    const csv = '\uFEFF' + [header, ...buildExportRows(onlyEmpId)].map(r => r.map(esc).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const suffix = onlyEmpId ? `_${onlyEmpId}` : '';
    a.download = `UASD_reportes_${filterMonth}${suffix}.xls`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportPDF = (onlyEmpId) => {
    setExportOpen(false);
    const escHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const rowsHtml = buildExportRows(onlyEmpId).map(r => `<tr>${r.map(c => `<td>${escHtml(c)}</td>`).join('')}</tr>`).join('');
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

  /* ── Ajustes — umbral de tardanza (antes 15 fijo en shared.jsx/kiosk.jsx y
     en el backend). Mismo patrón dual-path que el resto: con backend activo,
     GET/PATCH /api/settings; sin sesión, fallback a localStorage['uasd_settings']
     (mismo shape en ambos casos: { lateThresholdMinutes }). Solo visible con
     permiso 'manage' — es una regla de negocio del sistema, no de reportes. ── */
  const canManageSettings = typeof userHasPermission !== 'function' || userHasPermission('manage');
  const [lateThresholdMinutes, setLateThresholdMinutes] = React.useState(15);
  const loadSettings = React.useCallback(() => {
    if (typeof isBackendActive === 'function' && isBackendActive() && typeof apiGetSettings === 'function') {
      apiGetSettings().then(s => setLateThresholdMinutes(s.lateThresholdMinutes)).catch(() => {});
      return;
    }
    try {
      const s = JSON.parse(localStorage.getItem('uasd_settings') || '{}');
      setLateThresholdMinutes(Number.isInteger(s.lateThresholdMinutes) ? s.lateThresholdMinutes : 15);
    } catch { setLateThresholdMinutes(15); }
  }, []);
  React.useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveLateThreshold = (minutes) => {
    setLateThresholdMinutes(minutes);
    if (typeof isBackendActive === 'function' && isBackendActive() && typeof apiPatchSettings === 'function') {
      apiPatchSettings({ lateThresholdMinutes: minutes }).catch(() => loadSettings());
      return;
    }
    let s = {};
    try { s = JSON.parse(localStorage.getItem('uasd_settings') || '{}'); } catch {}
    localStorage.setItem('uasd_settings', JSON.stringify({ ...s, lateThresholdMinutes: minutes }));
  };

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const settingsRef = React.useRef(null);
  React.useEffect(() => {
    if (!settingsOpen) return;
    const onDoc = (e) => { if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [settingsOpen]);

  const [settingsMounted, setSettingsMounted] = React.useState(false);
  const [settingsClosing, setSettingsClosing] = React.useState(false);
  React.useEffect(() => {
    if (settingsOpen) {
      setSettingsMounted(true);
      setSettingsClosing(false);
      return;
    }
    if (!settingsMounted) return;
    setSettingsClosing(true);
    const id = setTimeout(() => { setSettingsMounted(false); setSettingsClosing(false); }, 150);
    return () => clearTimeout(id);
  }, [settingsOpen]);

  /* ── Resumen (pulso en vivo) vs Detalle (histórico por mes) ──
     Mismo patrón seg-filter que dashboard.jsx (filtro de estado) y
     changelog.jsx (filtro de tipo) — pill animado que se desliza al ítem activo. */
  const [view, setView] = React.useState('resumen');
  const viewOptions = [
    { id: 'resumen', label: t.rep_view_summary, icon: 'chartPie' },
    { id: 'detalle', label: t.rep_view_detail, icon: 'barChart' },
    { id: 'empleado', label: t.rep_view_employee, icon: 'user' },
    { id: 'departamentos', label: t.rep_view_departments, icon: 'building' },
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

  /* ── Por Empleado — ficha individual. Reusa detailRows (lista unificada
     de Detalle) y hoursRows (horas trabajadas) filtrados por un solo
     empleado en vez de recalcular nada nuevo. ── */
  const [selectedEmpId, setSelectedEmpId] = React.useState(null);
  const [empPickerSearch, setEmpPickerSearch] = React.useState('');
  const selectedEmp = React.useMemo(() => emps.find(e => e.id === selectedEmpId) || null, [emps, selectedEmpId]);

  const empPickerList = React.useMemo(() => {
    const q = empPickerSearch.trim().toLowerCase();
    const list = activeEmps.filter(e => !q || e.name.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q));
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeEmps, empPickerSearch]);

  const empRows = React.useMemo(
    () => selectedEmpId ? detailRows.filter(r => r.emp.id === selectedEmpId) : [],
    [detailRows, selectedEmpId]
  );
  const empHours = React.useMemo(
    () => selectedEmpId ? (hoursRows.find(r => r.emp.id === selectedEmpId) || null) : null,
    [hoursRows, selectedEmpId]
  );
  const empKpis = React.useMemo(() => {
    if (!selectedEmpId) return null;
    const tardanzas = empRows.filter(r => r.type === 'tardanza').length;
    const ausencias = empRows.filter(r => r.type === 'ausencia').length;
    const marcados = empHours ? empHours.days : 0;
    const punctualPct = marcados > 0 ? ((marcados - tardanzas) / marcados) * 100 : null;
    const completeDays = empHours ? empHours.days - empHours.incomplete : 0;
    const avgHours = empHours && completeDays > 0 ? empHours.totalHours / completeDays : null;
    return { tardanzas, ausencias, punctualPct, avgHours };
  }, [empRows, empHours, selectedEmpId]);

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

        <div className="page__actions" style={{ gap: 10, flex: '1 1 0', justifyContent: 'flex-end', minWidth: 0 }}>
          <div className="export-wrap" ref={exportRef}>
            <button className="btn btn--ghost" onClick={() => setExportOpen(o => !o)}>
              <Icon name="download" size={14}/> {t.dash_export} <Icon name="chevDown" size={12}/>
            </button>
            {exportMounted && (
              <div className="export-menu" style={{ animation: exportClosing
                ? 'repPickerClose 0.15s cubic-bezier(0.4,0,1,1) both'
                : 'repPickerOpen 0.15s cubic-bezier(0.16,1,0.3,1) both' }}>
                <button className="export-menu__item" onClick={() => exportPDF()}>
                  <span className="export-menu__tag export-menu__tag--pdf">PDF</span> {t.dash_export_pdf}
                </button>
                <button className="export-menu__item" onClick={() => exportExcel()}>
                  <span className="export-menu__tag export-menu__tag--xls">XLS</span> {t.dash_export_excel}
                </button>
              </div>
            )}
          </div>
          {canManageSettings && (
            <div className="export-wrap" ref={settingsRef}>
              <button className="btn btn--ghost" onClick={() => setSettingsOpen(o => !o)} aria-label={isES ? 'Ajustes' : 'Settings'}>
                <Icon name="settings" size={14}/>
              </button>
              {settingsMounted && (
                <div className="export-menu" style={{ minWidth: 240, animation: settingsClosing
                  ? 'repPickerClose 0.15s cubic-bezier(0.4,0,1,1) both'
                  : 'repPickerOpen 0.15s cubic-bezier(0.16,1,0.3,1) both' }}>
                  <div style={{ padding: '10px 14px' }}>
                    <div className="kpi__label" style={{ marginBottom: 8 }}>
                      {isES ? 'Tolerancia de tardanza' : 'Late tolerance'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number" min={0} max={120} value={lateThresholdMinutes}
                        onChange={(e) => {
                          const n = Math.max(0, Math.min(120, parseInt(e.target.value, 10) || 0));
                          saveLateThreshold(n);
                        }}
                        style={{
                          width: 64, padding: '6px 8px', borderRadius: 8,
                          border: '1px solid var(--ink-100)', fontFamily: 'var(--font-mono)', fontSize: 13,
                        }}
                      />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--ink-400)' }}>
                        {isES ? 'minutos' : 'minutes'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Navegación de pestañas — fila propia, centrada. Antes vivía dentro
           de page__actions junto a Exportar/Ajustes, pero al pasar de 3 a 5
           pestañas (Por empleado, Departamentos) ya no cabía en el ancho fijo
           que le tocaba por el truco de centrado título/acciones (ambos
           flex:1 1 0 a propósito, para que el mes quede centrado real — ver
           comentario de arriba). Con fila propia no compite por ese espacio. ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
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

      {/* ── Activos ahora por departamento + Aspectos destacados ──
           alignItems:'start' — sin esto, el grid estira "Presentes por
           departamento" a la altura de "Aspectos destacados"; con el rayo
           ancho, esa altura cambia según cuántos hallazgos haya y el donut
           se veía desproporcionado. Cada tarjeta conserva su propio tamaño
           natural. ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:20, marginBottom:20, alignItems:'start' }}>
        <div className="chart-card chart-card--dept" onDoubleClick={() => setExpandedChart('dept')}>
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

        <div className="chart-card chart-card--insights">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{isES ? 'Aspectos destacados' : 'Highlights'}</div>
              <div className="chart-card__sub">{isES ? 'Generados automáticamente de los datos del mes' : 'Auto-generated from this month\'s data'}</div>
            </div>
            {insights.length > 0 && <span className="badge badge--neutral">{insights.length}</span>}
          </div>
          {insights.length === 0 ? (
            <div className="audit-empty">
              <Icon name="activity" size={26} stroke={1.2}/>
              <div className="audit-empty__title">{isES ? 'Aún sin datos suficientes' : 'Not enough data yet'}</div>
              <div className="audit-empty__sub">{isES ? 'Los aspectos destacados aparecen cuando hay marcajes registrados.' : 'Highlights appear once check-ins are recorded.'}</div>
            </div>
          ) : (
            <InsightBolt
              key={curMonthKey}
              insights={insights}
              isES={isES}
              onGoto={(action) => { setView(action.view); setDetailFilter(action.filter); }}
            />
          )}
          {insights.length > 0 && (
            <div className="insight-bolt__quote">
              “El cambio es inevitable. El crecimiento es opcional.”
              <span className="insight-bolt__quote-author">— John C. Maxwell</span>
            </div>
          )}
        </div>
      </div>

      </div>}

      {/* ── DETALLE — histórico filtrable por mes ── */}
      {view === 'detalle' && <div key="detalle" className="rep-panel-in">

      {/* Todo lo de acá abajo hasta FaltasSemanalReport queda fuera de la
         impresión (print-hide) — Imprimir reporte solo imprime la grilla
         semanal, no el buscador/lista/horas de arriba. Ver @media print en
         styles.css, que preserva a FaltasSemanalReport vía :has() aunque
         esté anidado dentro de este mismo panel "detalle". */}
      <div className="print-hide">

      {/* ── Chips de filtro (Tardanzas · Ausencias · Eventualidades) + buscador
           por empleado/departamento — el mes ya se controla desde la píldora
           central del header, arriba. ── */}
      <div className="rep-detail-toolbar">
        <div className="rep-chips">
          {detailChips.map(c => (
            <button key={c.id} className={`rep-chip ${detailFilter === c.id ? 'rep-chip--active' : ''}`} onClick={() => setDetailFilter(c.id)}>
              {c.label} <span className="rep-chip__count">{detailCounts[c.id]}</span>
            </button>
          ))}
        </div>
        <div className="rep-detail-search">
          <span className="rep-detail-search-icon"><Icon name="search" size={13}/></span>
          <input
            value={detailSearch}
            onChange={(e) => setDetailSearch(e.target.value)}
            placeholder={isES ? 'Buscar empleado o departamento…' : 'Search employee or department…'}
          />
          {detailSearch && (
            <button className="rep-detail-search-clear" onClick={() => setDetailSearch('')} aria-label={isES ? 'Limpiar' : 'Clear'}>
              <Icon name="x" size={11} stroke={2.4}/>
            </button>
          )}
        </div>
      </div>

      {/* ── Lista unificada — Tardanzas + Ausencias + Eventualidades del mes ── */}
      {sortedDetailRows.length === 0 ? (
        <div className="rep-list-card">
          <div className="audit-empty">
            <Icon name="calendar" size={26} stroke={1.2}/>
            <div className="audit-empty__title">{isES ? 'Sin registros' : 'No records'}</div>
            <div className="audit-empty__sub">
              {detailSearch
                ? (isES ? `Nadie coincide con "${detailSearch}".` : `No one matches "${detailSearch}".`)
                : (isES ? `No hay registros para ${monthLabel.toLowerCase()}.` : `No records for ${monthLabel}.`)}
            </div>
          </div>
        </div>
      ) : (
        <div className="rep-list-card rep-rows-in" key={detailFilter}>
          <div className="rep-list-row rep-list-row--head">
            <span></span>
            <SortTh label={isES ? 'Empleado' : 'Employee'} active={detailSort.key === 'name'} dir={detailSort.dir} onClick={() => toggleDetailSort('name')}/>
            <SortTh label={isES ? 'Tipo' : 'Type'} active={detailSort.key === 'type'} dir={detailSort.dir} onClick={() => toggleDetailSort('type')}/>
            <SortTh label={isES ? 'Fecha' : 'Date'} active={detailSort.key === 'date'} dir={detailSort.dir} onClick={() => toggleDetailSort('date')}/>
            <span>{isES ? 'Detalle' : 'Detail'}</span>
            <SortTh label={isES ? 'Estado' : 'Status'} active={detailSort.key === 'estado'} dir={detailSort.dir} onClick={() => toggleDetailSort('estado')}/>
          </div>
          {sortedDetailRows.map(r => (
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

      {/* ── Horas trabajadas — mes filtrado. Sección secundaria (colapsable,
           abierta por defecto): la lista de arriba es el contenido principal
           de Detalle. ── */}
      <RepAccordion
        title={isES ? 'Horas trabajadas' : 'Hours worked'}
        subtitle={`${monthLabel} · ${isES ? 'calculado de entrada y salida reales' : 'calculated from real entry/exit'}`}
        count={hoursRows.length}
        defaultOpen>
        {hoursRows.length === 0 ? (
          <div className="audit-empty">
            <Icon name="clock" size={26} stroke={1.2}/>
            <div className="audit-empty__title">{isES ? 'Sin marcajes' : 'No check-ins'}</div>
            <div className="audit-empty__sub">{isES ? `No hay marcajes para ${monthLabel.toLowerCase()}.` : `No check-ins for ${monthLabel}.`}</div>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th><SortTh label={isES ? 'Empleado' : 'Employee'} active={hoursSort.key === 'name'} dir={hoursSort.dir} onClick={() => toggleHoursSort('name')}/></th>
                  <th className="is-center"><SortTh label={isES ? 'Días marcados' : 'Days'} active={hoursSort.key === 'days'} dir={hoursSort.dir} onClick={() => toggleHoursSort('days')}/></th>
                  <th className="is-center"><SortTh label={isES ? 'Horas totales' : 'Total hours'} active={hoursSort.key === 'total'} dir={hoursSort.dir} onClick={() => toggleHoursSort('total')}/></th>
                  <th className="is-center"><SortTh label={isES ? 'Promedio/día' : 'Avg/day'} active={hoursSort.key === 'avg'} dir={hoursSort.dir} onClick={() => toggleHoursSort('avg')}/></th>
                  <th className="is-center"><SortTh label={isES ? 'Sin salida' : 'No exit'} active={hoursSort.key === 'incomplete'} dir={hoursSort.dir} onClick={() => toggleHoursSort('incomplete')}/></th>
                </tr>
              </thead>
              <tbody>
                {sortedHoursRows.map(r => {
                  const completeDays = r.days - r.incomplete;
                  const avg = completeDays > 0 ? r.totalHours / completeDays : 0;
                  return (
                    <tr key={r.emp.id}>
                      <td>
                        <div className="data-table__name">{r.emp.name}</div>
                        <div className="data-table__dept">{r.emp.dept}</div>
                      </td>
                      <td className="is-center is-mono">{r.days}</td>
                      <td className="is-center is-mono" style={{ fontWeight:700, color:'var(--ink-800)' }}>{r.totalHours.toFixed(1)}h</td>
                      <td className="is-center is-mono">{completeDays > 0 ? `${avg.toFixed(1)}h` : '—'}</td>
                      <td className="is-center">
                        {r.incomplete > 0
                          ? <span className="badge badge--warn" style={{ fontSize:10 }}>{r.incomplete}</span>
                          : <span className="is-mono" style={{ color:'var(--ink-200)' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </RepAccordion>

      </div>

      <FaltasSemanalReport filterMonth={filterMonth} monthLabel={monthLabel}/>

      </div>}

      {/* ── POR EMPLEADO — ficha individual. Mismos datos que Detalle/Horas
           trabajadas (detailRows/hoursRows), acotados a un solo empleado. ── */}
      {view === 'empleado' && <div key="empleado" className="rep-panel-in">
        {!selectedEmp ? (
          <>
            <div className="rep-detail-toolbar">
              <div className="rep-detail-search" style={{ maxWidth: 360 }}>
                <span className="rep-detail-search-icon"><Icon name="search" size={13}/></span>
                <input
                  value={empPickerSearch}
                  onChange={(e) => setEmpPickerSearch(e.target.value)}
                  placeholder={isES ? 'Buscar empleado o departamento…' : 'Search employee or department…'}
                />
                {empPickerSearch && (
                  <button className="rep-detail-search-clear" onClick={() => setEmpPickerSearch('')} aria-label={isES ? 'Limpiar' : 'Clear'}>
                    <Icon name="x" size={11} stroke={2.4}/>
                  </button>
                )}
              </div>
            </div>
            {empPickerList.length === 0 ? (
              <div className="rep-list-card">
                <div className="audit-empty">
                  <Icon name="user" size={26} stroke={1.2}/>
                  <div className="audit-empty__title">{isES ? 'Sin resultados' : 'No results'}</div>
                  <div className="audit-empty__sub">{isES ? `Nadie coincide con "${empPickerSearch}".` : `No one matches "${empPickerSearch}".`}</div>
                </div>
              </div>
            ) : (
              <div className="rep-list-card rep-rows-in">
                {empPickerList.map(emp => (
                  <div key={emp.id} className="rep-list-row" style={{ gridTemplateColumns: '38px 1fr 1fr', cursor: 'pointer' }} onClick={() => setSelectedEmpId(emp.id)}>
                    <div className="table__avatar" style={{ width:32, height:32, fontSize:10 }}>{initials(emp.name)}</div>
                    <div className="rep-list-who">
                      <div className="rep-list-name">{emp.name}</div>
                      <div className="rep-list-dept">{emp.dept}</div>
                    </div>
                    <span className="mono" style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-400)', justifySelf:'end' }}>{emp.id}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="rep-emp-card">
              <div className="rep-emp-card__head">
                <div className="edit-modal__head-id">
                  <div className="edit-modal__avatar-wrap">
                    <div className="edit-modal__avatar" style={{ cursor:'default' }}>
                      {selectedEmp.photo
                        ? <img src={selectedEmp.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }}/>
                        : initials(selectedEmp.name)}
                    </div>
                  </div>
                  <div>
                    <div className="edit-modal__title">{selectedEmp.name}</div>
                    <div className="edit-modal__sub">{selectedEmp.id} · {formatCedula(selectedEmp.cedula)}</div>
                  </div>
                </div>
                <button className="edit-modal__close" onClick={() => setSelectedEmpId(null)} aria-label={isES ? 'Cambiar empleado' : 'Change employee'}>
                  <Icon name="x" size={18}/>
                </button>
              </div>
              <div style={{ display:'flex', gap:28, padding:'16px 24px', flexWrap:'wrap' }}>
                <div>
                  <div className="kpi__label">{isES ? 'Departamento' : 'Department'}</div>
                  <div style={{ fontFamily:'var(--font-sans)', fontWeight:600, color:'var(--ink-800)', fontSize:13.5 }}>{selectedEmp.dept}</div>
                </div>
                <div>
                  <div className="kpi__label">{isES ? 'Cargo' : 'Role'}</div>
                  <div style={{ fontFamily:'var(--font-sans)', fontWeight:600, color:'var(--ink-800)', fontSize:13.5 }}>{selectedEmp.role || '—'}</div>
                </div>
                <div>
                  <div className="kpi__label">{isES ? 'Horario' : 'Schedule'}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontWeight:600, color:'var(--ink-800)', fontSize:13 }}>{selectedEmp.schedule || '—'}</div>
                </div>
              </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: 20 }}>
              <div className="kpi">
                <div className="kpi__top"><div className="kpi__icon"><Icon name="userCheck" size={26}/></div></div>
                <div className="kpi__foot">
                  <div className="kpi__label">{t.rep_punctual_on}</div>
                  <div className="kpi__value">{empKpis.punctualPct === null ? '—' : <>{Math.round(empKpis.punctualPct)}<span style={{fontSize:18,color:'var(--ink-400)',marginLeft:4}}>%</span></>}</div>
                </div>
              </div>
              <div className="kpi">
                <div className="kpi__top"><div className="kpi__icon"><Icon name="clock" size={26}/></div></div>
                <div className="kpi__foot">
                  <div className="kpi__label">{t.rep_punctual_late}</div>
                  <div className="kpi__value">{empKpis.tardanzas}</div>
                </div>
              </div>
              <div className="kpi">
                <div className="kpi__top"><div className="kpi__icon"><Icon name="userX" size={26}/></div></div>
                <div className="kpi__foot">
                  <div className="kpi__label">{t.rep_punctual_absent}</div>
                  <div className="kpi__value">{empKpis.ausencias}</div>
                </div>
              </div>
              <div className="kpi">
                <div className="kpi__top"><div className="kpi__icon"><Icon name="fingerprint" size={26}/></div></div>
                <div className="kpi__foot">
                  <div className="kpi__label">{isES ? 'Promedio horas/día' : 'Avg hours/day'}</div>
                  <div className="kpi__value">{empKpis.avgHours === null ? '—' : `${empKpis.avgHours.toFixed(1)}h`}</div>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom: 10 }}>
              <button className="btn btn--ghost" onClick={() => exportPDF(selectedEmp.id)}>
                <Icon name="download" size={14}/> {isES ? 'Exportar ficha (PDF)' : 'Export sheet (PDF)'}
              </button>
            </div>

            {empRows.length === 0 ? (
              <div className="rep-list-card">
                <div className="audit-empty">
                  <Icon name="calendar" size={26} stroke={1.2}/>
                  <div className="audit-empty__title">{isES ? 'Sin registros' : 'No records'}</div>
                  <div className="audit-empty__sub">
                    {isES ? `${selectedEmp.name} no tiene tardanzas, ausencias ni eventualidades en ${monthLabel.toLowerCase()}.` : `No late arrivals, absences or events for ${selectedEmp.name} in ${monthLabel}.`}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rep-list-card rep-rows-in">
                <div className="rep-list-row rep-list-row--head" style={{ gridTemplateColumns: '38px 0.9fr 0.7fr 1fr 0.9fr' }}>
                  <span></span>
                  <span>{isES ? 'Tipo' : 'Type'}</span>
                  <span>{isES ? 'Fecha' : 'Date'}</span>
                  <span>{isES ? 'Detalle' : 'Detail'}</span>
                  <span>{isES ? 'Estado' : 'Status'}</span>
                </div>
                {[...empRows].sort((a, b) => b.date.localeCompare(a.date)).map(r => (
                  <div className="rep-list-row" style={{ gridTemplateColumns: '38px 0.9fr 0.7fr 1fr 0.9fr' }} key={r.key}>
                    <div className="table__avatar" style={{ width:32, height:32, fontSize:10 }}>{initials(r.emp.name)}</div>
                    <span className={`badge ${r.type === 'tardanza' ? 'badge--warn' : r.type === 'ausencia' ? 'badge--err' : 'badge--info'}`} style={{ fontSize:10.5, padding:'3px 9px', width:'fit-content' }}>
                      {r.type === 'tardanza' ? (isES ? 'Tardanza' : 'Late') : r.type === 'ausencia' ? (isES ? 'Ausencia' : 'Absence') : (EVENT_TYPE_LABEL[r.evType] || (isES ? 'Eventualidad' : 'Event'))}
                    </span>
                    <span className="mono" style={{ fontFamily:'var(--font-mono)', fontSize:12.5, color:'var(--ink-500)' }}>{fmtShortDate(r.date)}</span>
                    <span style={{ fontFamily:'var(--font-sans)', fontSize:12.5, color: r.detailOk ? 'var(--success,#2f7a5a)' : 'var(--ink-400)', fontWeight: r.detailOk ? 700 : 400 }}>{r.detail}</span>
                    {r.type === 'eventualidad'
                      ? <span className={`badge ${r.estado === 'aceptado' ? 'badge--ok' : r.estado === 'rechazado' ? 'badge--err' : 'badge--warn'}`} style={{ fontSize:10.5, padding:'3px 9px', width:'fit-content' }}>{EVENT_STATUS_LABEL[r.estado] || EVENT_STATUS_LABEL.pendiente}</span>
                      : <span style={{ color:'var(--ink-200)', fontSize:12 }}>—</span>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>}

      {/* ── DEPARTAMENTOS — ranking histórico de puntualidad/ausentismo por
           depto (mismo cálculo que "Aspectos destacados", desglosado). ── */}
      {view === 'departamentos' && <div key="departamentos" className="rep-panel-in">
        {deptRates.length === 0 ? (
          <div className="rep-list-card">
            <div className="audit-empty">
              <Icon name="building" size={26} stroke={1.2}/>
              <div className="audit-empty__title">{isES ? 'Sin datos suficientes' : 'Not enough data'}</div>
              <div className="audit-empty__sub">{isES ? `No hay suficientes marcajes en ${monthLabel.toLowerCase()} para comparar departamentos.` : `Not enough check-ins in ${monthLabel} to compare departments.`}</div>
            </div>
          </div>
        ) : (
          <div className="rep-list-card rep-rows-in">
            <div className="rep-list-row rep-list-row--head" style={{ gridTemplateColumns: '4px 1.4fr 0.9fr 0.7fr 0.7fr' }}>
              <span></span>
              <span>{isES ? 'Departamento' : 'Department'}</span>
              <span>{isES ? 'Puntualidad' : 'Punctuality'}</span>
              <span>{isES ? 'Tardanzas' : 'Late'}</span>
              <span>{isES ? 'Ausencias' : 'Absences'}</span>
            </div>
            {deptRates.map(({ dept, rate }) => {
              const cur = deptStatsCur[dept] || { total: 0, onTime: 0, absences: 0 };
              const prev = deptStatsPrev[dept];
              const prevRate = prev && prev.total >= 2 ? prev.onTime / prev.total : null;
              return (
                <div key={dept} className="rep-list-row" style={{ gridTemplateColumns: '4px 1.4fr 0.9fr 0.7fr 0.7fr', cursor: 'pointer' }}
                  onClick={() => { setView('detalle'); setDetailFilter('todos'); setDetailSearch(dept); }}>
                  <span style={{ width:4, height:28, borderRadius:2, background: colorForDept(dept) }}></span>
                  <div className="rep-list-who">
                    <div className="rep-list-name">{dept}</div>
                    <div className="rep-list-dept">{cur.total} {isES ? 'marcajes' : 'check-ins'}</div>
                  </div>
                  <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span className="mono" style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--ink-800)' }}>{Math.round(rate * 100)}%</span>
                    {prevRate !== null && trendPill(rate * 100, prevRate * 100, true, false)}
                  </span>
                  <span className="mono" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-500)' }}>{cur.total - cur.onTime}</span>
                  <span className="mono" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-500)' }}>{cur.absences}</span>
                </div>
              );
            })}
          </div>
        )}
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

/* FLIP (First-Last-Invert-Play): el salto vertical de .donut-wrap al pasar
   de vacío (centrado con margin:auto, no animable) a con-datos (arriba,
   pegado al header) no se puede resolver con transition normal — "margin:
   auto" no es un valor interpolable. En vez de eso: en cada cambio de
   `isEmpty`, se mide la posición ANTES de que el navegador repinte, se
   fuerza a arrancar ahí con un transform (sin transición), y en el frame
   siguiente se anima ese transform de vuelta a 0 — el mismo truco que usa
   el horizontal, pero aplicado a mano porque acá el cambio de layout no es
   un valor CSS animable. */
function useVerticalFlip(ref, key) {
  const prevRectRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const newRect = el.getBoundingClientRect();
    const prevRect = prevRectRef.current;
    if (prevRect) {
      const deltaY = prevRect.top - newRect.top;
      if (Math.abs(deltaY) > 0.5) {
        el.style.transition = 'none';
        el.style.transform = `translateY(${deltaY}px)`;
        el.getBoundingClientRect(); // fuerza reflow antes de soltar la transición
        requestAnimationFrame(() => {
          el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
          el.style.transform = '';
        });
      }
    }
    prevRectRef.current = newRect;
  }, [key]);
}

function DeptDonutViz({ dist, centerLabel, large }) {
  const uid      = React.useId().replace(/:/g, '');
  const [exploded, setExploded] = React.useState(false);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const total    = dist.reduce((s, d) => s + d.value, 0);
  const wrapRef  = React.useRef(null);
  useVerticalFlip(wrapRef, dist.length === 0);
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
    <div ref={wrapRef} className={`donut-wrap ${large ? 'donut-wrap--lg' : ''} ${dist.length === 0 ? 'donut-wrap--center' : ''}`}>
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
              {/* 0 activos: sin esto el aro no dibuja ningún <circle> (todas las
                  longitudes dan 0) y queda un hueco en blanco. Mismo lenguaje
                  que el spinner de carga del login (.login__spinner) — pista
                  gris fija + arco blanco que gira, pero en el propio anillo. */}
              {total === 0 && (
                <>
                  <circle cx="70" cy="70" r={r} fill="none" stroke="var(--ink-100)" strokeWidth="16"/>
                  <circle cx="70" cy="70" r={r} fill="none" stroke="#fff" strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${circ * 0.22} ${circ * 0.78}`}
                    className="donut__empty-spin"/>
                </>
              )}
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
      {/* Siempre montada (nunca se quita del DOM) — así el paso de vacío a
          con-datos anima min-width/gap/opacity en vez de aparecer de golpe,
          y el donut (centrado por el justify-content del wrap) se desliza a
          su lugar en vez de saltar. */}
      <div className={`donut__legend ${dist.length === 0 ? 'donut__legend--collapsed' : ''}`}>
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
  const [absencesMap, setAbsencesMap] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('uasd_absences') || '{}'); } catch { return {}; }
  });

  React.useEffect(() => {
    const sync = () => { try { setAbsencesMap(JSON.parse(localStorage.getItem('uasd_absences') || '{}')); } catch {} };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const weeks = React.useMemo(() => {
    const ym = filterMonth || new Date().toISOString().slice(0, 7);
    const year  = parseInt(ym.slice(0, 4), 10);
    const month = parseInt(ym.slice(5, 7), 10) - 1;
    const lastDay = new Date(year, month + 1, 0);
    const weekMap = {};
    let d = new Date(year, month, 1);
    while (d <= lastDay) {
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) {
        const monday = new Date(d);
        monday.setDate(d.getDate() + (1 - dow));
        const key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
        (weekMap[key] = weekMap[key] || []).push(new Date(d));
      }
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
    return Object.keys(weekMap).sort().map(key => ({ key, days: weekMap[key] }));
  }, [filterMonth]);

  const emps = typeof EMPLOYEES !== 'undefined' ? EMPLOYEES.filter(e => e.status === 'ok') : [];
  const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  const fmtDate = (day) => `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;

  // Colapsada por defecto: esta grilla repite día por día lo que la lista
  // unificada de Detalle ya muestra por fila (Ausencias) — es una vista
  // alternativa/exportable para imprimir, no el contenido principal de la
  // pestaña, así que no amerita ocupar full altura por defecto en cada carga.
  const [open, setOpen] = React.useState(false);

  return (
    <div className="chart-card rep-accordion faltas-semanales-report" style={{ marginBottom: 20 }}>

      {/* visible only when printing */}
      <div className="print-report-header" style={{ display:'none', marginBottom:20 }}>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:700, color:'var(--ink-800)' }}>
          UASD — Reporte de Faltas por Semanas
        </div>
        <div style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--ink-500)', marginTop:4 }}>
          {monthLabel} · Generado el {new Date().toLocaleDateString('es-DO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </div>
      </div>

      {/* section header — cliqueable para colapsar, mismo look que RepAccordion */}
      <div className="print-hide rep-accordion__head" role="button" tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}>
        <div>
          <div className="chart-card__title" style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Icon name="calendar" size={15}/>
            Reporte de faltas por semana
          </div>
          <div className="chart-card__sub">{monthLabel} · faltas registradas por empleado</div>
        </div>
        <div className="rep-accordion__meta">
          <button
            onClick={(e) => { e.stopPropagation(); window.print(); }}
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
          <span className="badge badge--neutral">{weeks.length}</span>
          <span className={`rep-accordion__chev ${open ? 'rep-accordion__chev--open' : ''}`}>
            <Icon name="chevDown" size={16} stroke={2}/>
          </span>
        </div>
      </div>

      {/* Siempre montado (nunca `open && ...`) — el CSS de impresión
         (.page > *:not(.faltas-semanales-report)) necesita este contenido
         presente en el DOM para poder imprimirlo aunque el usuario nunca
         haya expandido el acordeón con clic (Ctrl+P directo del navegador).
         `.rep-accordion__body--collapsed` lo oculta en pantalla vía
         display:none y esa regla se anula en @media print. */}
      <div className={`rep-accordion__body ${open ? 'rep-panel-in' : 'rep-accordion__body--collapsed'}`}>

      {/* legend */}
      <div className="print-hide" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16, flexWrap:'wrap' }}>
        {[
          { cls:'ok',        icon:'check',    label:'Presente' },
          { cls:'bad',       icon:'x',        label:'Ausente sin justificar' },
          { cls:'justified', icon:'x',        label:'Ausente justificado' },
          { cls:'holiday',   icon:'calendar', label:'Feriado' },
        ].map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-500)' }}>
            <span className={`data-table__mark data-table__mark--${item.cls}`}><Icon name={item.icon} size={12} stroke={2.6}/></span>
            {item.label}
          </div>
        ))}
      </div>

      {/* weeks */}
      {weeks.length === 0 ? (
        <div style={{ padding:'24px', textAlign:'center', fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink-400)' }}>
          Sin datos para este período.
        </div>
      ) : weeks.map((week, wi) => {
        const d0 = week.days[0];
        const dN = week.days[week.days.length - 1];
        const rangeLabel = `${d0.getDate()} — ${dN.getDate()}`;

        return (
          <div key={week.key} className="faltas-week-card" style={{ marginBottom:16, border:'1px solid var(--ink-100)', borderRadius:'var(--radius-md)', overflow:'hidden', pageBreakInside:'avoid' }}>
            <div style={{ padding:'9px 16px', background:'var(--ink-800)', color:'var(--paper)', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', opacity:0.5 }}>
                Semana {wi + 1}
              </span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600 }}>
                {rangeLabel}
              </span>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ minWidth:190 }}>Empleado</th>
                    {week.days.map(day => {
                      const dow = day.getDay() - 1;
                      return (
                        <th key={fmtDate(day)} className="is-center" style={{ minWidth:52 }}>
                          <div>{DAY_NAMES[dow]}</div>
                          <div className="is-mono" style={{ fontSize:12, color:'var(--ink-600)', marginTop:2, fontWeight:600, letterSpacing:0, textTransform:'none' }}>
                            {day.getDate()}
                          </div>
                        </th>
                      );
                    })}
                    <th className="is-center">Faltas</th>
                  </tr>
                </thead>
                <tbody>
                  {emps.map(emp => {
                    const empAbs = absencesMap[emp.id] || [];
                    const dayCells = week.days.map(day => {
                      const ds = fmtDate(day);
                      const found = empAbs.find(a => a.date === ds) || null;
                      return { ds, abs: found, isHoliday: isHoliday(ds) };
                    });
                    const absCount = dayCells.filter(c => c.abs !== null && !c.isHoliday).length;

                    return (
                      <tr key={emp.id}>
                        <td style={{ whiteSpace:'nowrap' }}>
                          <div className="data-table__name">{emp.name}</div>
                          <div className="data-table__dept">{emp.dept}</div>
                        </td>
                        {dayCells.map(cell => {
                          const isAbsent  = cell.abs !== null && !cell.isHoliday;
                          const justified = isAbsent && cell.abs.justified;
                          return (
                            <td key={cell.ds} className="is-center">
                              {cell.isHoliday ? (
                                <span className="data-table__mark data-table__mark--holiday" title="Feriado"><Icon name="calendar" size={12} stroke={2.6}/></span>
                              ) : isAbsent ? (
                                <span className={`data-table__mark data-table__mark--${justified ? 'justified' : 'bad'}`} title={justified ? 'Ausencia justificada' : 'Ausencia sin justificar'}>
                                  <Icon name="x" size={12} stroke={2.8}/>
                                </span>
                              ) : (
                                <span className="data-table__mark data-table__mark--ok"><Icon name="check" size={12} stroke={2.8}/></span>
                              )}
                            </td>
                          );
                        })}
                        <td className="is-center">
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
    </div>
  );
}

Object.assign(window, { ReportsView });
