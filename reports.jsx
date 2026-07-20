/* reports.jsx — attendance analytics (datos reales del sistema, sin mocks) */

const FULL_DAYS_ES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const FULL_DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function todayKey() { return new Date().toLocaleDateString('en-CA').slice(0, 7); }
function todayISO()  { return new Date().toLocaleDateString('en-CA'); }

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

function buildDeptDist(emps) {
  const palette = ['#1A1F3A','#2C3E66','#4a6fa5','#5a6a90','#2f7a5a','#8a6c2c','#8b2942','#6b5b9e','#2d7d9a','#c1793c','#9e4d6b','#5a8a2c','#8b97b3'];
  const counts = {};
  emps.forEach(e => { counts[e.dept] = (counts[e.dept] || 0) + 1; });
  return Object.keys(counts)
    .map((name, i) => ({ name, value: counts[name], color: palette[i % palette.length] }))
    .sort((a, b) => b.value - a.value);
}

/* Agrupa la distribución completa en los `topN` departamentos más grandes +
   un bucket "Otros" — evita una leyenda de 12 filas casi todas con valor 1. */
function buildDeptDistGrouped(emps, topN, otherLabel) {
  const full = buildDeptDist(emps);
  if (full.length <= topN) return full;
  const top = full.slice(0, topN);
  const restValue = full.slice(topN).reduce((s, d) => s + d.value, 0);
  if (restValue > 0) top.push({ name: otherLabel, value: restValue, color: 'var(--ink-200)' });
  return top;
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
  let line = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    const midX = (p0.x + p1.x) / 2;
    line += ` C${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
  }
  const area = `${line} L${pts[n - 1].x},${baseY} L${pts[0].x},${baseY} Z`;
  return { line, area, pts, baseY };
}

/* ── AreaChart — gráfica de línea con degradado, grid y tooltip en el punto
   destacado (mismo lenguaje visual en Asistencia diaria y Tendencia de tardanzas) ── */
/* clamp: la línea guía y el punto quedan en la posición real del dato, pero
   el globo de texto se mueve un poco hacia adentro cerca de los bordes para
   que nunca se salga del contenedor (eso era lo que rompía el layout en
   móvil — un tooltip desbordado empuja TODA la página a scroll horizontal). */
const clampPct = (pct) => Math.min(90, Math.max(10, pct));

function AreaChart({ values, labels, color, gradId, peakIndex, tooltipCaption, formatValue, emptyLabel }) {
  const W = 400, H = 170, PAD_X = 26, PAD_TOP = 18, PAD_BOTTOM = 20;
  const hasData = values.some(v => v > 0);
  const { line, area, pts } = buildAreaPath(values, W, H, PAD_X, PAD_TOP, PAD_BOTTOM);
  const gridYs = [PAD_TOP, PAD_TOP + (H - PAD_TOP - PAD_BOTTOM) / 2, H - PAD_BOTTOM];

  const svgRef = React.useRef(null);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const activeIdx = hoverIdx !== null ? hoverIdx : peakIndex;
  const active = hasData && activeIdx >= 0 ? pts[activeIdx] : null;

  // Sigue el mouse o el dedo por toda la gráfica — engancha al día real más
  // cercano, así se puede "tocar y mover" sobre cualquier punto, no solo el pico.
  const trackPointer = (clientX) => {
    const svg = svgRef.current;
    if (!svg || !hasData) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const relX = ((clientX - rect.left) / rect.width) * W;
    let nearest = 0, nearestDist = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(p.x - relX); if (d < nearestDist) { nearestDist = d; nearest = i; } });
    setHoverIdx(nearest);
  };

  return (
    <>
      <div className="rep-area-chart">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
          className={hasData ? 'rep-area-chart__svg--live' : ''}
          onMouseMove={(e) => trackPointer(e.clientX)}
          onMouseLeave={() => setHoverIdx(null)}
          onTouchStart={(e) => trackPointer(e.touches[0].clientX)}
          onTouchMove={(e) => trackPointer(e.touches[0].clientX)}
          onTouchEnd={() => setHoverIdx(null)}>
          {gridYs.map((y, i) => <line key={i} x1="0" y1={y} x2={W} y2={y} stroke="var(--ink-100)" strokeWidth="1"/>)}
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.30"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {hasData && <path key={`fill-${values.join(',')}`} className="rep-area-fill-draw" d={area} fill={`url(#${gradId})`}/>}
          {hasData && <path key={`line-${values.join(',')}`} className="rep-area-draw" pathLength="1" d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>}
          {active && <>
            <line x1={active.x} y1={active.y} x2={active.x} y2={H - PAD_BOTTOM} stroke="var(--ink-300)" strokeWidth="1" strokeDasharray="3,4"/>
            <circle cx={active.x} cy={active.y} r={hoverIdx !== null ? 6 : 5} fill="var(--paper)" stroke={color} strokeWidth="2.5"/>
          </>}
        </svg>
        {!hasData && <div className="rep-area-empty">{emptyLabel}</div>}
        {active && (
          <div className="rep-area-tooltip" style={{ left: `${clampPct((active.x / W) * 100)}%`, top: `${(active.y / H) * 100}%`, marginTop: -10 }}>
            {tooltipCaption}<b>{formatValue(activeIdx)}</b>
          </div>
        )}
      </div>
      <div className="rep-area-xlabels">
        {labels.map((l, i) => (
          <span key={i} style={i === activeIdx ? { color: 'var(--ink-800)', fontWeight: 800 } : undefined}>{l}</span>
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

  // Expansión a pantalla completa de "Asistencia diaria" (doble clic o botón
  // de esquina) — Escape cierra igual que el resto de overlays del sistema.
  const [attExpanded, setAttExpanded] = React.useState(false);
  React.useEffect(() => {
    if (!attExpanded) return;
    const onKey = (e) => { if (e.key === 'Escape') setAttExpanded(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [attExpanded]);

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

  /* ── Datos reales — se sincronizan entre pestañas y con el kiosco ── */
  const [allAtt, setAllAtt] = React.useState(loadAttendance);
  const [absMap, setAbsMap] = React.useState(loadAbsences);
  React.useEffect(() => {
    const sync = () => { setAllAtt(loadAttendance()); setAbsMap(loadAbsences()); };
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

  const workdaysCur  = React.useMemo(() => countWeekdays(+cy, +cm - 1, new Date().getDate()), [cy, cm]);
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
      <span className={`kpi__pill ${isGood ? 'kpi__pill--up' : 'kpi__pill--danger'}`}>
        {arrow} {Math.abs(d).toFixed(1)}{unit || '%'} <span style={{opacity:0.6, fontWeight:500}}>vs. {prevMonthLabelShort}</span>
      </span>
    );
  };

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
      out.push({ iso, day: DAYS_ES[d.getDay()], total: recs.length, late, valid: recs.length - late });
    }
    return out;
  }, [attRecords]);

  const last7Totals = last7.map(d => d.total);
  const hasLast7Data = last7Totals.some(v => v > 0);
  const last7Peak    = hasLast7Data ? last7Totals.indexOf(Math.max(...last7Totals)) : -1;

  const fullDayName = (i) => (isES ? FULL_DAYS_ES : FULL_DAYS_EN)[new Date(last7[i].iso + 'T00:00:00').getDay()];

  /* ── Tendencia de tardanzas — últimos 7 días (misma base de last7) ── */
  const lateTotals  = last7.map(d => d.late);
  const lateMax     = Math.max(...lateTotals);
  const latePeakIdx = lateMax > 0 ? lateTotals.indexOf(lateMax) : -1;

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
     Cada uno se omite si no hay suficiente data para sostenerlo. ── */
  const insights = React.useMemo(() => {
    const out = [];

    if (hasPrevAtt) {
      const d = +(onTimePct - prevOnTimePct).toFixed(1);
      out.push({
        status: d >= 0 ? 'ok' : 'warn',
        text: `La puntualidad ${d >= 0 ? 'subió' : 'bajó'} ${Math.abs(d).toFixed(1)}% respecto a ${prevMonthLabelShort}`,
        cat: 'puntualidad', catLabel: isES ? 'Puntualidad' : 'Punctuality',
      });
    }

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
      out.push({
        status: 'ok',
        text: `${deptRates[0].dept} es el departamento con mejor asistencia (${Math.round(deptRates[0].rate * 100)}%)`,
        cat: 'depto', catLabel: isES ? 'Departamento' : 'Department',
      });
    }

    let worstAbs = null;
    emps.forEach(emp => {
      const list = (absMap[emp.id] || []).filter(a => a.date?.slice(0,7) === curMonthKey && !a.justified && !isHoliday(a.date));
      if (list.length && (!worstAbs || list.length > worstAbs.count)) worstAbs = { emp, count: list.length };
    });
    if (worstAbs) {
      out.push({
        status: 'warn',
        text: `${worstAbs.emp.name} acumula ${worstAbs.count} ausencia${worstAbs.count !== 1 ? 's' : ''} sin justificar este mes`,
        cat: 'ausencias', catLabel: isES ? 'Ausencias' : 'Absences',
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

    return out.slice(0, 4);
  }, [hasPrevAtt, onTimePct, prevOnTimePct, curMonthRecords, emps, absMap, curMonthKey, peakHourIdx, hourHours, isES, prevMonthLabelShort]);

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
    { id: 'resumen', label: t.rep_view_summary, icon: 'activity' },
    { id: 'detalle', label: t.rep_view_detail, icon: 'barChart' },
    { id: 'calendario', label: t.rep_view_calendar, icon: 'calendar' },
  ];

  // KPIs cliqueables: los KPI de Resumen reflejan siempre el mes actual, así
  // que al saltar a Detalle hay que fijar ese mismo mes ahí — si no, el
  // usuario tocaría "Tardanzas" y vería el filtro de mes que tenía antes,
  // que podría ser uno completamente distinto.
  const goToDetalle = (filterId) => {
    setFilterMonth(curMonthKey);
    setDetailFilter(filterId);
    setView('detalle');
  };
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
            {exportOpen && (
              <div className="export-menu">
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
           label → valor → tendencia (reutiliza .kpi/.kpi__label/.kpi__value/
           .kpi__pill del sistema, solo se reordena el contenido interno). ── */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi kpi--clickable" role="button" tabIndex={0}
          onClick={() => goToDetalle('todos')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToDetalle('todos'); } }}>
          <div className="kpi__label">{t.rep_punctual_on}</div>
          <div className="kpi__value">{Math.round(onTimePct)}<span style={{fontSize:18,color:'var(--ink-400)',marginLeft:4}}>%</span></div>
          <div style={{ marginTop: 12 }}>{trendPill(onTimePct, prevOnTimePct, hasPrevAtt, false)}</div>
        </div>
        <div className="kpi kpi--clickable" role="button" tabIndex={0}
          onClick={() => goToDetalle('tardanza')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToDetalle('tardanza'); } }}>
          <div className="kpi__label">{t.rep_punctual_late}</div>
          <div className="kpi__value">{Math.round(latePct)}<span style={{fontSize:18,color:'var(--ink-400)',marginLeft:4}}>%</span></div>
          <div style={{ marginTop: 12 }}>{trendPill(latePct, prevLatePct, hasPrevAtt, true)}</div>
        </div>
        <div className="kpi kpi--clickable" role="button" tabIndex={0}
          onClick={() => goToDetalle('ausencia')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToDetalle('ausencia'); } }}>
          <div className="kpi__label">{t.rep_punctual_absent}</div>
          <div className="kpi__value">{Math.round(absentPct)}<span style={{fontSize:18,color:'var(--ink-400)',marginLeft:4}}>%</span></div>
          <div style={{ marginTop: 12 }}>{trendPill(absentPct, prevAbsentPct, true, true)}</div>
        </div>
        <div className="kpi kpi--clickable" role="button" tabIndex={0}
          onClick={() => goToDetalle('todos')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToDetalle('todos'); } }}>
          <div className="kpi__label">{isES ? 'Marcajes del mes' : 'Check-ins this month'}</div>
          <div className="kpi__value">{curMonthRecords.length.toLocaleString(isES ? 'es-DO' : 'en-US')}<span style={{fontSize:18,color:'var(--ink-400)',marginLeft:4}}>{isES ? 'Total' : 'Total'}</span></div>
          <div style={{ marginTop: 12 }}>{trendPill(curMonthRecords.length, prevMonthRecords.length, prevMonthRecords.length > 0, false, '')}</div>
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
      {attExpanded && ReactDOM.createPortal(
        <div className="acc-overlay" onMouseDown={() => setAttExpanded(false)}>
          <div className="chart-expand-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="acc-modal__head">
              <div className="acc-modal__head-id">
                <div className="acc-modal__avatar"><Icon name="activity" size={20}/></div>
                <div>
                  <div className="acc-modal__title">{t.rep_attend}</div>
                  <div className="acc-modal__sub">{t.rep_attend_sub} · {isES ? 'últimos 7 días' : 'last 7 days'}</div>
                </div>
              </div>
              <button className="acc-modal__close acc-modal__close--x" onClick={() => setAttExpanded(false)} aria-label="Cerrar">
                <Icon name="x" size={18}/>
              </button>
            </div>
            <div className="chart-expand-modal__body">
              <AreaChart
                values={last7.map(d => d.total)}
                labels={last7.map(d => d.day)}
                color="var(--ink-700)"
                gradId="repGradAsistenciaXL"
                peakIndex={last7Peak}
                tooltipCaption={isES ? 'Marcajes' : 'Check-ins'}
                formatValue={(i) => `${last7[i].total} · ${fullDayName(i)}`}
                emptyLabel={isES ? 'Sin marcajes esta semana' : 'No check-ins this week'}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20, marginBottom:20 }}>
        <div className="chart-card chart-card--expandable" onDoubleClick={() => setAttExpanded(true)}>
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{t.rep_attend}</div>
              <div className="chart-card__sub">{t.rep_attend_sub} · {isES ? 'últimos 7 días' : 'last 7 days'}</div>
            </div>
            <button type="button" className="chart-card__expand-btn"
              title={isES ? 'Expandir (doble clic)' : 'Expand (double-click)'}
              onClick={() => setAttExpanded(true)}>
              <Icon name="expand" size={14}/>
            </button>
          </div>
          <AreaChart
            values={last7.map(d => d.total)}
            labels={last7.map(d => d.day)}
            color="var(--ink-700)"
            gradId="repGradAsistencia"
            peakIndex={last7Peak}
            tooltipCaption={isES ? 'Marcajes' : 'Check-ins'}
            formatValue={(i) => `${last7[i].total} · ${fullDayName(i)}`}
            emptyLabel={isES ? 'Sin marcajes esta semana' : 'No check-ins this week'}
          />
        </div>

        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{isES ? 'Tendencia de tardanzas' : 'Late arrival trend'}</div>
              <div className="chart-card__sub">{isES ? 'Llegadas tarde · últimos 7 días' : 'Late check-ins · last 7 days'}</div>
            </div>
          </div>
          <AreaChart
            values={lateTotals}
            labels={last7.map(d => d.day)}
            color="var(--gold-600)"
            gradId="repGradTardanzas"
            peakIndex={latePeakIdx}
            tooltipCaption={isES ? 'Tardanzas' : 'Late arrivals'}
            formatValue={(i) => `${lateTotals[i]} · ${fullDayName(i)}`}
            emptyLabel={isES ? 'Sin tardanzas esta semana' : 'No late arrivals this week'}
          />
        </div>
      </div>

      {/* ── Distribución por departamento + Aspectos destacados ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:20, marginBottom:20 }}>
        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{t.rep_dept}</div>
              <div className="chart-card__sub">{t.rep_dept_sub}</div>
            </div>
          </div>
          <DepartmentDonut t={t} isES={isES}/>
        </div>

        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{isES ? 'Aspectos destacados' : 'Highlights'}</div>
            </div>
            <span className="badge badge--ok">
              <span className="badge__dot rep-live-dot"/>
              {t.rep_live}
            </span>
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
                <div className="rep-insight-row" key={i}>
                  <span className={`rep-insight-status rep-insight-status--${ins.status}`}>
                    <Icon name={ins.status === 'ok' ? 'check' : 'alertTriangle'} size={13} stroke={2.6}/>
                  </span>
                  <span className="rep-insight-text">{ins.text}</span>
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

/* ── DepartmentDonut ── */
function DepartmentDonut({ t, isES }) {
  const emps = typeof EMPLOYEES !== 'undefined' ? EMPLOYEES : [];
  const dist = React.useMemo(
    () => buildDeptDistGrouped(emps, 4, isES ? 'Otros departamentos' : 'Other departments'),
    [emps, isES]
  );

  const total    = dist.reduce((s, d) => s + d.value, 0);
  const r        = 52;
  const circ     = 2 * Math.PI * r;
  let   offset   = 0;
  const segments = dist.map(d => {
    const frac   = total > 0 ? d.value / total : 0;
    const length = circ * frac;
    const seg    = { ...d, length, gap: circ - length, offset, frac };
    offset      -= length;
    return seg;
  });

  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg viewBox="0 0 140 140" style={{ transform:'rotate(-90deg)' }}>
          {segments.map((s, i) => (
            <circle key={i} cx="70" cy="70" r={r}
              fill="none" stroke={s.color} strokeWidth="16"
              strokeDasharray={`${s.length} ${s.gap}`}
              strokeDashoffset={s.offset}/>
          ))}
        </svg>
        <div className="donut__center">
          <div>
            <div className="donut__num">{total}</div>
            <div className="donut__lab">{t.rep_donut_emp}</div>
          </div>
        </div>
      </div>
      <div className="donut__legend">
        {dist.map((d, i) => (
          <div className="donut__legend-row" key={i}>
            <span className="donut__legend-swatch" style={{ background:d.color }}/>
            <span className="donut__legend-name">{d.name}</span>
            <span className="donut__legend-val">{d.value} · {total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
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
