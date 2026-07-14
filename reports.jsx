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

function ReportsView({ t, lang, setRoute }) {
  React.useEffect(() => {
    if (typeof userHasPermission === 'function' && !userHasPermission('reports')) setRoute('dashboard');
  }, []);

  const isES = lang === 'es';
  const [hoveredIdx, setHoveredIdx] = React.useState(null);

  const [filterMonth, setFilterMonth] = React.useState(todayKey);
  const [fy, fm]    = filterMonth.split('-');
  const monthLabel  = `${MONTHS_ES[+fm - 1]} ${fy}`;
  const isCurrentMonth = filterMonth === todayKey();

  const prevMonth = React.useCallback(() => {
    const d = new Date(+fy, +fm - 2, 1);
    setFilterMonth(d.toLocaleDateString('en-CA').slice(0, 7));
  }, [fy, fm]);

  const nextMonth = React.useCallback(() => {
    const d   = new Date(+fy, +fm, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (key <= todayKey()) setFilterMonth(key);
  }, [fy, fm]);

  /* ── Datos reales — se sincronizan entre pestañas y con el kiosco ── */
  const [allAtt, setAllAtt] = React.useState(loadAttendance);
  const [absMap, setAbsMap] = React.useState(loadAbsences);
  React.useEffect(() => {
    const sync = () => { setAllAtt(loadAttendance()); setAbsMap(loadAbsences()); };
    window.addEventListener('storage', sync);
    const id = setInterval(sync, 4000);
    return () => { window.removeEventListener('storage', sync); clearInterval(id); };
  }, []);

  const emps       = typeof EMPLOYEES !== 'undefined' ? EMPLOYEES : [];
  const activeEmps = React.useMemo(() => emps.filter(e => e.status !== 'inactive'), [emps]);
  const attRecords = React.useMemo(() => Object.values(allAtt), [allAtt]);

  /* KPIs + hero chart reflejan SIEMPRE el mes/semana actual (no el filtro de abajo) —
     así el resumen de arriba es un "pulso en vivo", igual que el resto del sistema. */
  const curMonthKey  = todayKey();
  const [cy, cm]     = curMonthKey.split('-');
  const curMonthLabel = `${MONTHS_ES[+cm - 1]} ${cy}`;
  const prevMonthKey = React.useMemo(() => {
    const d = new Date(+cy, +cm - 2, 1);
    return d.toLocaleDateString('en-CA').slice(0, 7);
  }, [cy, cm]);

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
  const trendPill = (curr, prev, hasPrev, goodWhenLower) => {
    if (!hasPrev) return <span className="kpi__pill">{curMonthLabel}</span>;
    const d = +(curr - prev).toFixed(1);
    const isGood = goodWhenLower ? d <= 0 : d >= 0;
    const arrow  = d === 0 ? '•' : (d > 0 ? '▲' : '▼');
    return (
      <span className="kpi__pill" style={isGood ? undefined : {color:'var(--danger)', borderColor:'rgba(193,85,77,0.35)'}}>
        {arrow} {Math.abs(d).toFixed(1)}%
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
  const last7Max     = Math.max(1, ...last7Totals);
  const hasLast7Data = last7Totals.some(v => v > 0);
  const last7Varies  = new Set(last7Totals).size > 1;
  const last7Peak    = hasLast7Data ? last7Totals.indexOf(Math.max(...last7Totals)) : -1;
  const last7Low     = (hasLast7Data && last7Varies) ? last7Totals.indexOf(Math.min(...last7Totals)) : -1;

  const daysWithData = last7.filter(d => d.total > 0).length;
  const avgPerDay     = daysWithData > 0 ? Math.round(last7Totals.reduce((s,v) => s+v, 0) / daysWithData) : 0;
  const totalLast7    = last7Totals.reduce((s,v) => s+v, 0);
  const busiestIdx    = hasLast7Data ? last7Peak : -1;
  const busiestDayFull = busiestIdx >= 0
    ? (isES ? FULL_DAYS_ES : FULL_DAYS_EN)[new Date(last7[busiestIdx].iso + 'T00:00:00').getDay()]
    : '—';
  const busiestVal    = busiestIdx >= 0 ? last7[busiestIdx].total : 0;

  /* ── Llegadas por hora — hoy ── */
  const todayStr     = todayISO();
  const todayRecords = React.useMemo(() => attRecords.filter(a => a.date === todayStr), [attRecords, todayStr]);
  const hourHours  = React.useMemo(() => Array.from({length:13}, (_,i) => i + 6), []);
  const hourCounts = React.useMemo(
    () => hourHours.map(h => todayRecords.filter(a => parseHour24(a.time) === h).length),
    [hourHours, todayRecords]
  );

  const exportCSV = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    let evMap = {};
    try { evMap = JSON.parse(localStorage.getItem('uasd_eventualidades') || '{}'); } catch {}

    const rows = [['Sección', 'Empleado', 'Departamento', 'Fecha', 'Detalle']];

    emps.forEach(emp => {
      Object.values(allAtt)
        .filter(a => a.empId === emp.id && a.late && a.date?.slice(0, 7) === filterMonth)
        .forEach(a => rows.push(['Tardanza', emp.name, emp.dept, a.date, a.justified ? 'Justificada' : 'No justificada']));
    });

    emps.forEach(emp => {
      (evMap[emp.id] || [])
        .filter(e => e.date?.slice(0, 7) === filterMonth)
        .forEach(e => rows.push(['Eventualidad', emp.name, emp.dept, e.dateEnd ? `${e.date} → ${e.dateEnd}` : e.date, `${e.type}${e.motivo ? ' — ' + e.motivo : ''}`]));
    });

    const csv = '\uFEFF' + rows.map(r => r.map(esc).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `UASD_reportes_${filterMonth}.xls`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="page__head">
        <div>
          <div className="page__title">{t.rep_title}</div>
          <div className="page__subtitle">{t.rep_sub}</div>
        </div>
        <div className="page__actions">
          <button className="btn btn--ghost" onClick={exportCSV}>
            <Icon name="download" size={14}/> {t.dash_export}
          </button>
        </div>
      </div>

      {/* ── KPIs — mes actual, datos reales, comparados con el mes anterior ── */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi kpi--fill">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="check" size={18}/></div>
            {trendPill(onTimePct, prevOnTimePct, hasPrevAtt, false)}
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_punctual_on}</div>
            <div className="kpi__value">{Math.round(onTimePct)}<span style={{fontSize:18,opacity:0.6}}>%</span></div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="clock" size={18}/></div>
            {trendPill(latePct, prevLatePct, hasPrevAtt, true)}
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_punctual_late}</div>
            <div className="kpi__value">{Math.round(latePct)}<span style={{fontSize:18,color:'var(--ink-400)'}}>%</span></div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="x" size={18}/></div>
            {trendPill(absentPct, prevAbsentPct, true, true)}
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_punctual_absent}</div>
            <div className="kpi__value">{Math.round(absentPct)}<span style={{fontSize:18,color:'var(--ink-400)'}}>%</span></div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="barChart" size={18}/></div>
            <span className="kpi__pill">{curMonthLabel}</span>
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{isES ? 'Marcajes del mes' : 'Check-ins this month'}</div>
            <div className="kpi__value">{curMonthRecords.length.toLocaleString(isES ? 'es-DO' : 'en-US')}</div>
          </div>
        </div>
      </div>

      {/* ── Hero chart — asistencia semanal ── */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card__head">
          <div>
            <div className="chart-card__title">{t.rep_attend}</div>
            <div className="chart-card__sub">{t.rep_attend_sub} · {isES ? 'últimos 7 días' : 'last 7 days'}</div>
          </div>
          <div className="rep-legend">
            <div className="rep-legend__item">
              <span className="rep-legend__dot" style={{ background:'var(--ink-700)' }}/>
              {t.rep_punctual_on}
            </div>
            <div className="rep-legend__item">
              <span className="rep-legend__dot" style={{ background:'var(--gold-500)' }}/>
              {t.rep_punctual_late}
            </div>
          </div>
        </div>

        {/* barra hero estilo Interstellar */}
        <div className="rep-hero-chart">
          {/* líneas de guía horizontales */}
          <div className="rep-hero-chart__grid">
            {[0,1,2,3].map(i => <div key={i} className="rep-hero-chart__gridline"/>)}
          </div>

          {/* dots de datos encima de las barras */}
          <div className="rep-hero-chart__dots">
            {last7.map((d, i) => {
              const isHigh = i === last7Peak;
              const isLow  = i === last7Low;
              return (
                <div key={i} className="rep-hero-chart__dot-col">
                  <span className="rep-hero-chart__dot" style={{
                    background: isHigh ? 'var(--gold-500)' : isLow ? 'var(--danger)' : 'var(--ink-200)',
                    transform: (hoveredIdx === i || isHigh || isLow) ? 'scale(1.4)' : 'scale(1)',
                  }}/>
                </div>
              );
            })}
          </div>

          {/* columnas de barras */}
          <div className="rep-hero-chart__bars">
            {last7.map((d, i) => {
              const total   = d.total;
              const totalH  = (total / last7Max) * 100;
              const lateH   = total > 0 ? (d.late / total) * 100 : 0;
              const isHigh  = i === last7Peak;
              const isLow   = i === last7Low;
              const isHover = hoveredIdx === i;
              const isActive = isHigh || isLow;

              return (
                <div key={i} className={`rep-bar-col${isActive ? ' rep-bar-col--active' : ''}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}>

                  {/* barra — el tag flotante vive DENTRO del track (absolute) para
                      no empujar el layout ni desbordar en pantallas angostas */}
                  <div className="rep-bar-col__track">
                    {isActive && (
                      <div className="rep-bar-tag"
                        style={{ bottom: `calc(${totalH}% + 8px)`, background: isHigh ? 'var(--ink-900)' : 'var(--ink-500)' }}>
                        {isHigh ? (isES ? 'Pico' : 'Peak') : (isES ? 'Mínimo' : 'Low')}
                      </div>
                    )}
                    <div className="rep-bar-col__fill" style={{
                      height: `${totalH}%`,
                      background: isHigh ? 'var(--ink-800)' : isLow ? 'var(--ink-400)' : (isHover ? 'var(--ink-300)' : 'var(--ink-100)'),
                    }}>
                      {/* segmento tarde */}
                      <div style={{
                        position:'absolute', bottom:0, left:0, right:0,
                        height:`${lateH}%`,
                        background: isHigh ? 'var(--gold-500)' : isLow ? 'var(--ink-300)' : 'var(--ink-200)',
                        borderRadius: '6px 6px 0 0',
                        opacity: isActive || isHover ? 1 : 0.6,
                      }}/>
                    </div>
                  </div>

                  {/* etiqueta día + valor — siempre visible, nunca vacío */}
                  <div className="rep-bar-col__foot">
                    <div className="rep-bar-col__day">{d.day}</div>
                    <div className="rep-bar-col__val" style={{
                      color: isHigh ? 'var(--gold-600)' : isLow ? 'var(--ink-500)' : 'var(--ink-300)',
                      fontWeight: isActive ? 700 : 600,
                    }}>
                      {total}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* micro-stats debajo del chart */}
        <div className="rep-microstats">
          <MicroStat label={t.rep_micro_avg}   val={avgPerDay}      unit={t.rep_micro_avg_unit}/>
          <MicroStat label={t.rep_micro_peak}  val={busiestDayFull} unit={busiestIdx >= 0 ? `${busiestVal} ${isES ? 'marcajes' : 'clock-ins'}` : (isES ? 'sin datos' : 'no data')}/>
          <MicroStat label={t.rep_micro_total} val={totalLast7}     unit={isES ? 'últimos 7 días' : 'last 7 days'}/>
        </div>
      </div>

      {/* ── Fila inferior: histograma + donut + actividad ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20, marginBottom:20 }}>
        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{t.rep_hours_title}</div>
              <div className="chart-card__sub">{t.rep_hours_sub}</div>
            </div>
          </div>
          <HourHistogram hours={hourHours} counts={hourCounts} todayCount={todayRecords.length} isES={isES}/>
        </div>

        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{t.rep_dept}</div>
              <div className="chart-card__sub">{t.rep_dept_sub}</div>
            </div>
          </div>
          <DepartmentDonut t={t}/>
        </div>

        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{t.rep_top}</div>
              <div className="chart-card__sub">{isES ? 'Marcajes de hoy' : "Today's check-ins"}</div>
            </div>
            <span className="badge badge--ok">
              <span className="badge__dot"/>
              {t.rep_live}
            </span>
          </div>
          <ActivityFeed isES={isES}/>
        </div>
      </div>

      {/* ── Tardanzas · Ausencias · Eventualidades ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:20, marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, border:'1px solid var(--ink-100)', borderRadius:8, padding:'4px 6px', background:'var(--paper)' }}>
          <button onClick={prevMonth} style={{ background:'none', border:'none', width:24, height:24, display:'grid', placeItems:'center', cursor:'pointer', color:'var(--ink-500)', borderRadius:4 }}>
            <Icon name="arrowLeft" size={12}/>
          </button>
          <span style={{ fontFamily:'var(--font-sans)', fontSize:12, fontWeight:600, color:'var(--ink-800)', minWidth:96, textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
            <span style={{ color:'var(--ink-400)', display:'flex' }}><Icon name="filter" size={12} stroke={1.6}/></span>
            {monthLabel}
          </span>
          <button onClick={nextMonth} disabled={isCurrentMonth} style={{ background:'none', border:'none', width:24, height:24, display:'grid', placeItems:'center', cursor: isCurrentMonth ? 'default' : 'pointer', color: isCurrentMonth ? 'var(--ink-200)' : 'var(--ink-500)', borderRadius:4 }}>
            <Icon name="arrowRight" size={12}/>
          </button>
        </div>
        <div style={{ fontFamily:'var(--font-sans)', fontSize:12, fontWeight:700, color:'var(--ink-400)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
          Detalle del período
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20 }}>
        <TardanzasReport filterMonth={filterMonth} monthLabel={monthLabel}/>
        <StrikesReport   filterMonth={filterMonth} monthLabel={monthLabel}/>
        <EventualidadesReport filterMonth={filterMonth} monthLabel={monthLabel}/>
      </div>

      <FaltasSemanalReport filterMonth={filterMonth} monthLabel={monthLabel}/>
    </div>
  );
}

/* ── MicroStat ── */
function MicroStat({ label, val, unit }) {
  return (
    <div className="rep-microstat">
      <div className="rep-microstat__label">{label}</div>
      <div className="rep-microstat__val">{val}</div>
      <div className="rep-microstat__unit">{unit}</div>
    </div>
  );
}

/* ── DepartmentDonut ── */
function DepartmentDonut({ t }) {
  const emps = typeof EMPLOYEES !== 'undefined' ? EMPLOYEES : [];
  const dist = React.useMemo(() => buildDeptDist(emps), [emps]);

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
            <span className="donut__legend-val">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── HourHistogram — llegadas de hoy, datos reales ── */
function HourHistogram({ hours, counts, todayCount, isES }) {
  const hasData = todayCount > 0;
  const maxH    = Math.max(1, ...counts);
  const peakI   = hasData ? counts.indexOf(Math.max(...counts)) : -1;

  return (
    <div style={{ padding:'8px 0' }}>
      <div className="bars" style={{ height:'clamp(110px, 22vw, 160px)', gap:6 }}>
        {counts.map((h, i) => (
          <div className="bars__col" key={i}>
            <div className="bars__bar" style={{
              height: hasData ? `${Math.max(h / maxH * 100, h > 0 ? 4 : 0)}%` : '2px',
              background: i === peakI ? 'var(--ink-800)' : 'var(--ink-150, var(--ink-100))',
              borderRadius: '5px 5px 0 0',
            }}>
              {i === peakI && h > 0 && (
                <div style={{
                  position:'absolute', top:0, left:0, right:0,
                  height:'35%', background:'var(--gold-500)',
                  borderRadius:'5px 5px 0 0',
                }}/>
              )}
            </div>
            <div className="bars__label" style={{ fontSize:9 }}>{String(hours[i]).padStart(2,'0')}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop:12, padding:'10px 12px',
        background:'var(--cream-100)', borderRadius:'var(--radius-sm)',
        fontSize:12, color:'var(--ink-600)',
        display:'flex', alignItems:'center', gap:8,
      }}>
        <Icon name="clock" size={13} stroke={1.8}/>
        {hasData ? (
          <span>
            {isES ? 'Pico de marcajes a las ' : 'Peak clock-ins at '}
            <strong style={{ color:'var(--ink-800)' }}>
              {String(hours[peakI]).padStart(2,'0')}:00 — {String(hours[peakI] + 1).padStart(2,'0')}:00
            </strong>
            {isES ? ` con ${maxH} entrada${maxH !== 1 ? 's' : ''}.` : ` with ${maxH} ${maxH !== 1 ? 'entries' : 'entry'}.`}
          </span>
        ) : (
          <span>{isES ? 'Aún no hay marcajes registrados hoy.' : 'No check-ins recorded yet today.'}</span>
        )}
      </div>
    </div>
  );
}

/* ── ActivityFeed — marcajes reales de hoy ── */
function ActivityFeed({ isES }) {
  const [allAtt, setAllAtt] = React.useState(loadAttendance);
  React.useEffect(() => {
    const sync = () => setAllAtt(loadAttendance());
    window.addEventListener('storage', sync);
    const id = setInterval(sync, 4000);
    return () => { window.removeEventListener('storage', sync); clearInterval(id); };
  }, []);

  const today = todayISO();
  const emps  = typeof EMPLOYEES !== 'undefined' ? EMPLOYEES : [];

  const feed = React.useMemo(() => {
    return Object.values(allAtt)
      .filter(a => a.date === today)
      .map(a => {
        const emp = emps.find(e => e.id === a.empId);
        return emp ? { name: emp.name, dept: emp.dept, time: a.time, late: a.late } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 8);
  }, [allAtt, today]);

  if (feed.length === 0) {
    return (
      <div className="audit-empty" style={{ padding:'32px 16px' }}>
        <Icon name="activity" size={26} stroke={1.2}/>
        <div className="audit-empty__title">{isES ? 'Sin actividad hoy' : 'No activity today'}</div>
        <div className="audit-empty__sub">{isES ? 'Aún no hay marcajes registrados hoy.' : 'No check-ins recorded yet today.'}</div>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', padding:'4px 0' }}>
      {feed.map((e, i) => (
        <div key={i} style={{
          display:'grid', gridTemplateColumns:'28px 1fr auto',
          alignItems:'center', gap:10,
          padding:'9px 0',
          borderBottom: i < feed.length - 1 ? '1px solid var(--ink-100)' : 'none',
        }}>
          <div className="table__avatar" style={{ width:28, height:28, fontSize:9 }}>
            {initials(e.name)}
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:12, fontWeight:600, color:'var(--ink-800)', lineHeight:1.3 }}>{e.name}</div>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:10, color:'var(--ink-400)', marginTop:1 }}>{e.dept} · <span style={{ fontFamily:'var(--font-mono)' }}>{e.time.slice(0,5)}</span></div>
          </div>
          <span className={`badge ${e.late ? 'badge--warn' : 'badge--ok'}`} style={{ fontSize:9, padding:'2px 7px' }}>
            {e.late ? (isES ? 'TARDE' : 'LATE') : 'IN'}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── StrikesReport ── */
function StrikesReport({ filterMonth, monthLabel }) {
  const [absencesMap, setAbsencesMap] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('uasd_absences') || '{}'); } catch { return {}; }
  });

  const rows = React.useMemo(() => {
    const emps = (typeof EMPLOYEES !== 'undefined' ? EMPLOYEES : []);
    return emps
      .map(emp => {
        const allAbs  = absencesMap[emp.id] || [];
        const absences = filterMonth ? allAbs.filter(a => a.date?.slice(0, 7) === filterMonth && !isHoliday(a.date)) : allAbs.filter(a => !isHoliday(a.date));
        const unjustified = absences.filter(a => !a.justified).length;
        return { emp, absences, unjustified };
      })
      .filter(r => r.absences.length > 0)
      .sort((a, b) => b.unjustified - a.unjustified);
  }, [absencesMap, filterMonth]);

  React.useEffect(() => {
    const sync = () => {
      try { setAbsencesMap(JSON.parse(localStorage.getItem('uasd_absences') || '{}')); } catch {}
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <div>
          <div className="chart-card__title" style={{ display:'flex', alignItems:'center', gap:10 }}>
            Ausencias
            {rows.some(r => r.unjustified >= 3) && (
              <span className="badge badge--err" style={{ fontSize:10, gap:5 }}>
                <Icon name="baseball" size={11} stroke={1.8}/>
                OUT
              </span>
            )}
          </div>
          <div className="chart-card__sub">Sin justificación · {monthLabel || 'Mes actual'} · 3 = OUT</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="audit-empty">
          <Icon name="baseball" size={26} stroke={1.2}/>
          <div className="audit-empty__title">Sin ausencias</div>
          <div className="audit-empty__sub">No hay ausencias registradas para {(monthLabel || 'este período').toLowerCase()}.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column' }}>
          {rows.map((r, i) => {
            const isOut = r.unjustified >= 3;
            return (
              <div key={r.emp.id} className="rep-row" style={{
                display:'grid', gridTemplateColumns:'36px 1fr auto auto',
                alignItems:'center', gap:14,
                padding:'12px 0',
                borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 'none',
                background: isOut ? 'rgba(193,85,77,0.025)' : 'transparent',
              }}>
                <div className="table__avatar" style={{ width:34, height:34, fontSize:11 }}>
                  {initials(r.emp.name)}
                </div>
                <div>
                  <div style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600, color:'var(--ink-800)' }}>{r.emp.name}</div>
                  <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)', marginTop:2 }}>
                    {r.emp.dept} · {r.absences.length} ausencia{r.absences.length !== 1 ? 's' : ''}
                    {r.absences.some(a => a.auto && !a.justified) && (
                      <span style={{ marginLeft:5, color:'var(--ink-300)', fontStyle:'italic' }}>
                        · {r.absences.filter(a => a.auto && !a.justified).length} automática{r.absences.filter(a => a.auto && !a.justified).length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  {[0,1,2].map(j => (
                    <span key={j} style={{
                      width:9, height:9, borderRadius:'50%',
                      background: j < r.unjustified ? (isOut ? 'var(--danger)' : 'var(--gold-500)') : 'var(--ink-100)',
                      border:`1.5px solid ${j < r.unjustified ? (isOut ? 'var(--danger)' : 'var(--gold-400)') : 'var(--ink-200)'}`,
                    }}/>
                  ))}
                  <span style={{ marginLeft:6, fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, color: isOut ? 'var(--danger)' : 'var(--gold-600)' }}>
                    {r.unjustified}/3
                  </span>
                </div>
                {isOut ? (
                  <div style={{ display:'flex', alignItems:'center', gap:5, color:'var(--danger)', fontWeight:700, fontSize:13 }}>
                    <Icon name="baseball" size={15} stroke={1.8}/>
                    <span style={{ fontFamily:'var(--font-sans)', letterSpacing:'0.05em' }}>OUT</span>
                  </div>
                ) : <div style={{ width:48 }}/>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── TardanzasReport ── */
function TardanzasReport({ filterMonth, monthLabel }) {
  const [allAtt, setAllAtt] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}'); } catch { return {}; }
  });

  React.useEffect(() => {
    const sync = () => { try { setAllAtt(JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}')); } catch {} };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const rows = React.useMemo(() => {
    const emps = typeof EMPLOYEES !== 'undefined' ? EMPLOYEES : [];
    return emps
      .map(emp => {
        const tards = Object.values(allAtt).filter(a => a.empId === emp.id && a.late && (!filterMonth || a.date?.slice(0, 7) === filterMonth));
        const unjustified = tards.filter(t => !t.justified).length;
        return { emp, tards, unjustified, total: tards.length };
      })
      .filter(r => r.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [allAtt, filterMonth]);

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <div>
          <div className="chart-card__title" style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Icon name="clock" size={15}/>
            Tardanzas
          </div>
          <div className="chart-card__sub">Empleados con tardanzas · {monthLabel}</div>
        </div>
        {rows.length > 0 && (
          <span className="badge badge--warn" style={{ fontSize:11 }}>{rows.reduce((s, r) => s + r.total, 0)} total</span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="audit-empty">
          <Icon name="clock" size={26} stroke={1.2}/>
          <div className="audit-empty__title">Sin tardanzas</div>
          <div className="audit-empty__sub">No hay tardanzas registradas para {(monthLabel || 'este período').toLowerCase()}.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column' }}>
          {rows.map((r, i) => (
            <div key={r.emp.id} className="rep-row" style={{
              display:'grid', gridTemplateColumns:'34px 1fr auto auto',
              alignItems:'center', gap:12,
              padding:'11px 0',
              borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 'none',
            }}>
              <div className="table__avatar" style={{ width:34, height:34, fontSize:11 }}>{initials(r.emp.name)}</div>
              <div>
                <div style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600, color:'var(--ink-800)' }}>{r.emp.name}</div>
                <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)', marginTop:2 }}>
                  {r.emp.dept} · {r.total} tardanza{r.total !== 1 ? 's' : ''}
                </div>
              </div>
              <span className="badge badge--warn" style={{ fontSize:10, padding:'2px 8px' }}>{r.total}</span>
              {r.unjustified > 0
                ? <span className="badge badge--err" style={{ fontSize:10, padding:'2px 8px' }}>{r.unjustified} s/j</span>
                : <span className="badge badge--ok"  style={{ fontSize:10, padding:'2px 8px' }}>Justif.</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── EventualidadesReport ── */
function EventualidadesReport({ filterMonth, monthLabel }) {
  const [map, setMap] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('uasd_eventualidades') || '{}'); } catch { return {}; }
  });

  React.useEffect(() => {
    const sync = () => { try { setMap(JSON.parse(localStorage.getItem('uasd_eventualidades') || '{}')); } catch {} };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const rows = React.useMemo(() => {
    const emps = typeof EMPLOYEES !== 'undefined' ? EMPLOYEES : [];
    return emps
      .map(emp => {
        const allItems = map[emp.id] || [];
        const items = filterMonth ? allItems.filter(e => e.date?.slice(0, 7) === filterMonth) : allItems;
        const eventualidades = items.filter(e => e.type === 'eventualidad').length;
        const diasLibres     = items.filter(e => e.type === 'dia_libre').length;
        return { emp, items, eventualidades, diasLibres, total: items.length };
      })
      .filter(r => r.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [map, filterMonth]);

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <div>
          <div className="chart-card__title" style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Icon name="calendar" size={15}/>
            Eventualidades
          </div>
          <div className="chart-card__sub">Eventualidades y días libres · {monthLabel || 'Mes actual'}</div>
        </div>
        {rows.length > 0 && (
          <span className="badge badge--neutral" style={{ fontSize:11 }}>{rows.reduce((s, r) => s + r.total, 0)} total</span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="audit-empty">
          <Icon name="calendar" size={26} stroke={1.2}/>
          <div className="audit-empty__title">Sin eventualidades</div>
          <div className="audit-empty__sub">No hay eventualidades registradas para {(monthLabel || 'este período').toLowerCase()}.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column' }}>
          {rows.map((r, i) => (
            <div key={r.emp.id} className="rep-row" style={{
              display:'grid', gridTemplateColumns:'34px 1fr auto auto',
              alignItems:'center', gap:12,
              padding:'11px 0',
              borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 'none',
            }}>
              <div className="table__avatar" style={{ width:34, height:34, fontSize:11 }}>{initials(r.emp.name)}</div>
              <div>
                <div style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600, color:'var(--ink-800)' }}>{r.emp.name}</div>
                <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)', marginTop:2 }}>
                  {r.emp.dept} · {r.total} registro{r.total !== 1 ? 's' : ''}
                </div>
              </div>
              {r.eventualidades > 0 && (
                <span className="badge badge--neutral" style={{ fontSize:10, padding:'2px 8px' }}>{r.eventualidades} event.</span>
              )}
              {r.diasLibres > 0 && (
                <span className="badge badge--ok" style={{ fontSize:10, padding:'2px 8px' }}>{r.diasLibres} libre{r.diasLibres !== 1 ? 's' : ''}</span>
              )}
            </div>
          ))}
        </div>
      )}
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
    ? EMPLOYEES.filter(function(e) { return e.status !== 'inactive'; })
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
