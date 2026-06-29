/* reports.jsx — attendance analytics */

const ATTEND_DAYS = [
  { day: 'Lun', valid: 287, late: 22 },
  { day: 'Mar', valid: 294, late: 18 },
  { day: 'Mié', valid: 301, late: 14 },
  { day: 'Jue', valid: 288, late: 21 },
  { day: 'Vie', valid: 276, late: 28 },
  { day: 'Sáb', valid: 142, late: 8  },
  { day: 'Dom', valid: 41,  late: 2  },
];

function ReportsView({ t, lang, setRoute }) {
  const max  = Math.max(...ATTEND_DAYS.map(d => d.valid + d.late));
  const days = t.rep_days;

  const totals  = ATTEND_DAYS.map(d => d.valid + d.late);
  const peakIdx = totals.indexOf(Math.max(...totals));
  const lowIdx  = totals.indexOf(Math.min(...totals));

  const [hoveredIdx, setHoveredIdx] = React.useState(null);

  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const [filterMonth, setFilterMonth] = React.useState(new Date().toLocaleDateString('en-CA').slice(0, 7));
  const [fy, fm] = filterMonth.split('-');
  const monthLabel = `${MONTHS_ES[+fm - 1]} ${fy}`;
  const isCurrentMonth = filterMonth === new Date().toLocaleDateString('en-CA').slice(0, 7);
  const prevMonth = () => { const d = new Date(+fy, +fm - 2, 1); setFilterMonth(d.toLocaleDateString('en-CA').slice(0, 7)); };
  const nextMonth = () => { const d = new Date(+fy, +fm, 1); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; if (key <= new Date().toLocaleDateString('en-CA').slice(0, 7)) setFilterMonth(key); };

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="page__head">
        <div>
          <div className="page__title">{t.rep_title}</div>
          <div className="page__subtitle">{t.rep_sub}</div>
        </div>
        <div className="page__actions">
          <button className="btn btn--ghost">
            <Icon name="download" size={14}/> {t.dash_export}
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi kpi--fill">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="check" size={18}/></div>
            <span className="kpi__pill kpi__pill--up">▲ 3.2%</span>
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_punctual_on}</div>
            <div className="kpi__value">87<span style={{fontSize:18,opacity:0.6}}>%</span></div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="clock" size={18}/></div>
            <span className="kpi__pill" style={{color:'var(--danger)',borderColor:'rgba(193,85,77,0.35)'}}>▼ 1.1%</span>
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_punctual_late}</div>
            <div className="kpi__value">9<span style={{fontSize:18,color:'var(--ink-400)'}}>%</span></div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="x" size={18}/></div>
            <span className="kpi__pill">{t.rep_avg_month}</span>
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_punctual_absent}</div>
            <div className="kpi__value">4<span style={{fontSize:18,color:'var(--ink-400)'}}>%</span></div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi__top">
            <div className="kpi__icon"><Icon name="barChart" size={18}/></div>
            <span className="kpi__pill">{t.rep_total_week}</span>
          </div>
          <div className="kpi__foot">
            <div className="kpi__label">{t.rep_kpi_hours}</div>
            <div className="kpi__value">14,287</div>
          </div>
        </div>
      </div>

      {/* ── Hero chart — asistencia semanal ── */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card__head">
          <div>
            <div className="chart-card__title">{t.rep_attend}</div>
            <div className="chart-card__sub">{t.rep_attend_sub}</div>
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
            {ATTEND_DAYS.map((d, i) => {
              const isHigh = i === peakIdx;
              const isLow  = i === lowIdx;
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
            {ATTEND_DAYS.map((d, i) => {
              const total   = d.valid + d.late;
              const totalH  = (total / max) * 100;
              const lateH   = (d.late / total) * 100;
              const isHigh  = i === peakIdx;
              const isLow   = i === lowIdx;
              const isHover = hoveredIdx === i;
              const isActive = isHigh || isLow;

              return (
                <div key={i} className={`rep-bar-col${isActive ? ' rep-bar-col--active' : ''}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}>

                  {/* card flotante en barra activa */}
                  {isActive && (
                    <div className="rep-bar-col__card">
                      <span className="rep-bar-col__card-label">{isHigh ? 'Alto' : 'Bajo'}</span>
                    </div>
                  )}

                  {/* barra */}
                  <div className="rep-bar-col__track">
                    <div className="rep-bar-col__fill" style={{
                      height: `${totalH}%`,
                      background: isActive ? (isHigh ? 'var(--ink-800)' : 'var(--ink-600)') : 'var(--ink-100)',
                    }}>
                      {/* segmento tarde */}
                      <div style={{
                        position:'absolute', bottom:0, left:0, right:0,
                        height:`${lateH}%`,
                        background: isHigh ? 'var(--gold-500)' : isLow ? 'var(--ink-400)' : 'var(--ink-200)',
                        borderRadius: '6px 6px 0 0',
                        opacity: isActive ? 1 : 0.6,
                      }}/>
                    </div>
                  </div>

                  {/* etiqueta día + valor */}
                  <div className="rep-bar-col__foot">
                    <div className="rep-bar-col__day">{days[i]}</div>
                    {isActive && (
                      <div className="rep-bar-col__val" style={{ color: isHigh ? 'var(--gold-500)' : 'var(--ink-400)' }}>
                        {total}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* micro-stats debajo del chart */}
        <div className="rep-microstats">
          <MicroStat label={t.rep_micro_avg}   val="231"              unit={t.rep_micro_avg_unit}/>
          <MicroStat label={t.rep_micro_peak}  val={t.rep_micro_peak_day} unit={t.rep_micro_peak_unit}/>
          <MicroStat label={t.rep_micro_total} val="1,629"            unit={t.rep_micro_total_unit}/>
        </div>
      </div>

      {/* ── Fila inferior: histograma + donut + actividad ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{t.rep_hours_title}</div>
              <div className="chart-card__sub">{t.rep_hours_sub}</div>
            </div>
          </div>
          <HourHistogram t={t}/>
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
              <div className="chart-card__sub">{t.rep_recent_60}</div>
            </div>
            <span className="badge badge--ok">
              <span className="badge__dot"/>
              {t.rep_live}
            </span>
          </div>
          <ActivityFeed t={t}/>
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
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
        <TardanzasReport filterMonth={filterMonth} monthLabel={monthLabel}/>
        <StrikesReport   filterMonth={filterMonth} monthLabel={monthLabel}/>
        <EventualidadesReport filterMonth={filterMonth} monthLabel={monthLabel}/>
      </div>
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
  const total    = DEPT_DIST.reduce((s, d) => s + d.value, 0);
  const r        = 52;
  const circ     = 2 * Math.PI * r;
  let   offset   = 0;
  const segments = DEPT_DIST.map(d => {
    const frac   = d.value / total;
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
        {DEPT_DIST.map((d, i) => (
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

/* ── HourHistogram ── */
function HourHistogram({ t }) {
  const hours  = [6,12,28,64,92,41,23,12,8,6,18,47,9];
  const labels = ['06','07','08','09','10','11','12','13','14','15','16','17','18'];
  const maxH   = Math.max(...hours);
  const peakI  = hours.indexOf(maxH);

  return (
    <div style={{ padding:'8px 0' }}>
      <div className="bars" style={{ height:140, gap:6 }}>
        {hours.map((h, i) => (
          <div className="bars__col" key={i}>
            <div className="bars__bar" style={{
              height:`${(h / maxH) * 100}%`,
              background: i === peakI ? 'var(--ink-800)' : 'var(--ink-150, var(--ink-100))',
              borderRadius: '5px 5px 0 0',
            }}>
              {i === peakI && (
                <div style={{
                  position:'absolute', top:0, left:0, right:0,
                  height:'35%', background:'var(--gold-500)',
                  borderRadius:'5px 5px 0 0',
                }}/>
              )}
            </div>
            <div className="bars__label" style={{ fontSize:9 }}>{labels[i]}</div>
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
        {(() => {
          const parts = t.rep_peak_msg.split('{h}').join('||10:00 — 11:00||').split('{n}').join('92').split('||');
          return parts.map((p, i) => p === '10:00 — 11:00'
            ? <strong key={i} style={{ color:'var(--ink-800)' }}>{p}</strong>
            : <span key={i}>{p}</span>);
        })()}
      </div>
    </div>
  );
}

/* ── ActivityFeed ── */
function ActivityFeed({ t }) {
  const feed = [
    { name:'María Reyes Castillo',   dept:'Ingeniería',   min:2,  kind:'in'  },
    { name:'Carlos Méndez Polanco',  dept:'RRHH',          min:6,  kind:'in'  },
    { name:'Roberto Núñez Espinal',  dept:'Sistemas',      min:11, kind:'in'  },
    { name:'Elena Sánchez Brito',    dept:'Rectoría',      min:18, kind:'out' },
    { name:'Lourdes Peña Vargas',    dept:'Biblioteca',    min:24, kind:'in'  },
    { name:'Pedro Antonio Rosario',  dept:'Mantenimiento', min:31, kind:'in'  },
  ];

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
            <div style={{ fontFamily:'var(--font-sans)', fontSize:10, color:'var(--ink-400)', marginTop:1 }}>{e.dept} · <span style={{ fontFamily:'var(--font-mono)' }}>{t.rep_ago.split('{n}').join(e.min)}</span></div>
          </div>
          <span className={`badge ${e.kind === 'in' ? 'badge--ok' : 'badge--neutral'}`} style={{ fontSize:9, padding:'2px 7px' }}>
            {e.kind === 'in' ? 'IN' : 'OUT'}
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
        const absences = filterMonth ? allAbs.filter(a => a.date?.slice(0, 7) === filterMonth) : allAbs;
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
        <div style={{ padding:'24px 0', textAlign:'center', fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink-400)' }}>
          Sin ausencias registradas actualmente.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column' }}>
          {rows.map((r, i) => {
            const isOut = r.unjustified >= 3;
            return (
              <div key={r.emp.id} style={{
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
        <div style={{ padding:'24px 0', textAlign:'center', fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink-400)' }}>
          Sin tardanzas registradas este mes.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column' }}>
          {rows.map((r, i) => (
            <div key={r.emp.id} style={{
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
        <div style={{ padding:'24px 0', textAlign:'center', fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink-400)' }}>
          Sin eventualidades registradas.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column' }}>
          {rows.map((r, i) => (
            <div key={r.emp.id} style={{
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

Object.assign(window, { ReportsView });
