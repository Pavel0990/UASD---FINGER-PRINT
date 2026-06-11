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
  const max = Math.max(...ATTEND_DAYS.map(d => d.valid + d.late));
  const days = t.rep_days;

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">{t.rep_title}</div>
          <div className="page__subtitle">{t.rep_sub}</div>
        </div>
        <div className="page__actions">
          <button className="btn btn--ghost">
            <Icon name="calendar" size={14}/> {t.rep_range} <Icon name="chevDown" size={12}/>
          </button>
          <button className="btn btn--ghost">
            <Icon name="download" size={14}/> {t.dash_export}
          </button>
        </div>
      </div>

      <div className="kpi-grid">
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

      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:20}}>
        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <div className="chart-card__title">{t.rep_attend}</div>
              <div className="chart-card__sub">{t.rep_attend_sub}</div>
            </div>
            <div className="legend">
              <div className="legend__item">
                <span className="legend__swatch" style={{background:'var(--ink-600)'}}></span>
                {t.rep_punctual_on}
              </div>
              <div className="legend__item">
                <span className="legend__swatch" style={{background:'var(--gold-500)'}}></span>
                {t.rep_punctual_late}
              </div>
            </div>
          </div>

          <div className="bars">
            {ATTEND_DAYS.map((d, i) => {
              const total = d.valid + d.late;
              const totalH = (total / max) * 100;
              const lateH = (d.late / total) * 100;
              return (
                <div key={i} className="bars__col">
                  <div className="bars__bar" style={{height:`${totalH}%`}}>
                    <div className="bars__bar-late" style={{height:`${lateH}%`}}></div>
                  </div>
                  <div className="bars__label">{days[i]}</div>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop:18,paddingTop:16,
            borderTop:'1px solid var(--ink-100)',
            display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,
          }}>
            <MicroStat label={t.rep_micro_avg} val="231" unit={t.rep_micro_avg_unit}/>
            <MicroStat label={t.rep_micro_peak} val={t.rep_micro_peak_day} unit={t.rep_micro_peak_unit}/>
            <MicroStat label={t.rep_micro_total} val="1,629" unit={t.rep_micro_total_unit}/>
          </div>
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
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginTop:20}}>
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
              <div className="chart-card__title">{t.rep_top}</div>
              <div className="chart-card__sub">{t.rep_recent_60}</div>
            </div>
            <span className="badge badge--ok">
              <span className="badge__dot"></span>
              {t.rep_live}
            </span>
          </div>
          <ActivityFeed t={t}/>
        </div>
      </div>
    </div>
  );
}

function MicroStat({ label, val, unit }) {
  return (
    <div>
      <div style={{fontSize:10,color:'var(--ink-400)',letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600,marginBottom:6}}>
        {label}
      </div>
      <div style={{fontSize:22,fontWeight:700,color:'var(--ink-800)',letterSpacing:'-0.02em',lineHeight:1}}>
        {val}
      </div>
      <div style={{fontSize:11,color:'var(--ink-400)',marginTop:4,fontFamily:'var(--font-mono)'}}>
        {unit}
      </div>
    </div>
  );
}

function DepartmentDonut({ t }) {
  const total = DEPT_DIST.reduce((s, d) => s + d.value, 0);
  const r = 56;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = DEPT_DIST.map(d => {
    const frac = d.value / total;
    const length = circ * frac;
    const seg = { ...d, length, gap: circ - length, offset, frac };
    offset -= length;
    return seg;
  });

  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg viewBox="0 0 140 140" style={{transform:'rotate(-90deg)'}}>
          {segments.map((s, i) => (
            <circle key={i}
                    cx="70" cy="70" r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="18"
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
            <span className="donut__legend-swatch" style={{background:d.color}}></span>
            <span className="donut__legend-name">{d.name}</span>
            <span className="donut__legend-val">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HourHistogram({ t }) {
  // Hours 6 → 18
  const hours = [
    6, 12, 28, 64, 92, 41,
    23, 12, 8,  6,  18, 47,
    9
  ];
  const labels = ['06','07','08','09','10','11','12','13','14','15','16','17','18'];
  const max = Math.max(...hours);

  return (
    <div style={{padding:'8px 0'}}>
      <div className="bars" style={{height:160}}>
        {hours.map((h, i) => (
          <div className="bars__col" key={i}>
            <div className="bars__bar"
                 style={{
                   height:`${(h / max) * 100}%`,
                   background: i === 4 ? 'var(--gold-500)' : 'var(--ink-600)',
                 }}>
            </div>
            <div className="bars__label">{labels[i]}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop:14,padding:'12px 14px',
        background:'var(--cream-50)',
        borderRadius:'var(--radius-sm)',
        fontSize:12,color:'var(--ink-600)',
        display:'flex',alignItems:'center',gap:10,
      }}>
        <Icon name="clock" size={14} stroke={1.8}/>
        {(() => {
          const parts = t.rep_peak_msg.split('{h}').join('||10:00 — 11:00||').split('{n}').join('92').split('||');
          return parts.map((p, i) => p === '10:00 — 11:00'
            ? <strong key={i} style={{color:'var(--ink-800)'}}>{p}</strong>
            : <span key={i}>{p}</span>);
        })()}
      </div>
    </div>
  );
}

function ActivityFeed({ t }) {
  const feed = [
    { name: 'María Reyes Castillo', dept: 'Ingeniería',     min: 2,  kind: 'in'  },
    { name: 'Carlos Méndez Polanco',dept: 'RRHH',            min: 6,  kind: 'in'  },
    { name: 'Roberto Núñez Espinal',dept: 'Sistemas',        min: 11, kind: 'in'  },
    { name: 'Elena Sánchez Brito',  dept: 'Rectoría',        min: 18, kind: 'out' },
    { name: 'Lourdes Peña Vargas',  dept: 'Biblioteca',      min: 24, kind: 'in'  },
    { name: 'Pedro Antonio Rosario',dept: 'Mantenimiento',   min: 31, kind: 'in'  },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:0,padding:'8px 0'}}>
      {feed.map((e, i) => (
        <div key={i} style={{
          display:'grid',
          gridTemplateColumns:'32px 1fr auto auto',
          alignItems:'center', gap:12,
          padding:'12px 0',
          borderBottom: i < feed.length - 1 ? '1px solid var(--ink-100)' : 'none',
        }}>
          <div className="table__avatar" style={{width:32,height:32,fontSize:10}}>
            {initials(e.name)}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'var(--ink-800)'}}>{e.name}</div>
            <div style={{fontSize:11,color:'var(--ink-400)'}}>{e.dept}</div>
          </div>
          <span className={`badge ${e.kind === 'in' ? 'badge--ok' : 'badge--neutral'}`}>
            {e.kind === 'in' ? 'IN' : 'OUT'}
          </span>
          <span style={{fontSize:11,color:'var(--ink-400)',fontFamily:'var(--font-mono)',minWidth:80,textAlign:'right'}}>
            {t.rep_ago.split('{n}').join(e.min)}
          </span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { ReportsView });
