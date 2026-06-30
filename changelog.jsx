/* changelog.jsx — control de actividad del sistema (inmutable, solo lectura) */

const AUDIT_KEY = 'uasd_audit_log_v1';

const AUDIT_ADMINS = [
  { name: 'Pavel Abreu Torres',    id: 'EMP-00702', initials: 'PA', dept: 'Data'             },
  { name: 'Gabriel Gómez',         id: 'EMP-00601', initials: 'GG', dept: 'Data'             },
  { name: 'Carlos Méndez Polanco', id: 'EMP-00187', initials: 'CM', dept: 'Recursos Humanos' },
  { name: 'Elena Sánchez Brito',   id: 'EMP-00103', initials: 'ES', dept: 'Rectoría'         },
];

function getAuditActions(t) {
  return {
    add:    { label: t.cl_badge_add,    cls: 'audit-badge--add',    icon: 'userPlus' },
    edit:   { label: t.cl_badge_edit,   cls: 'audit-badge--edit',   icon: 'edit'     },
    delete: { label: t.cl_badge_delete, cls: 'audit-badge--delete', icon: 'trash'    },
  };
}

function getAuditLog() {
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]'); } catch { return []; }
}

function pushAuditEntry(entry) {
  const log = getAuditLog();
  log.unshift({ ...entry, id: Date.now(), ts: new Date().toISOString() });
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log.slice(0, 200)));
}

window.auditLog = {
  add:    (subject) => pushAuditEntry({ actor: AUDIT_ADMINS[0], type: 'add',    subject }),
  edit:   (subject) => pushAuditEntry({ actor: AUDIT_ADMINS[0], type: 'edit',   subject }),
  delete: (subject) => pushAuditEntry({ actor: AUDIT_ADMINS[0], type: 'delete', subject }),
};

const AUDIT_SEED_VER = 'uasd_audit_seed_v3';

/* Seed demo entries once per version — runs automatically on update */
(function seedDemo() {
  if (localStorage.getItem(AUDIT_SEED_VER)) return;
  localStorage.setItem(AUDIT_SEED_VER, '1');
  const now = Date.now();
  const entries = [
    {
      actor:   AUDIT_ADMINS[3], // Elena Sánchez Brito
      type:    'add',
      subject: { name: 'Francisco Pimentel Lora', id: 'EMP-00237' },
      id:      now,
      ts:      new Date(now - 2 * 60 * 1000).toISOString(),
    },
    {
      actor:   AUDIT_ADMINS[2], // Carlos Méndez Polanco
      type:    'delete',
      subject: { name: 'Yolanda Fernández Cruz', id: 'EMP-00388' },
      id:      now - 1,
      ts:      new Date(now - 9 * 60 * 1000).toISOString(),
    },
    {
      actor:   AUDIT_ADMINS[3], // Elena Sánchez Brito
      type:    'edit',
      subject: { name: 'Ricardo Taveras Núñez', id: 'EMP-00410' },
      id:      now - 2,
      ts:      new Date(now - 15 * 60 * 1000).toISOString(),
    },
    {
      actor:   AUDIT_ADMINS[1], // Gabriel Gómez
      type:    'edit',
      subject: { name: 'Ana Cristina Jiménez', id: 'EMP-00298' },
      id:      now - 3,
      ts:      new Date(now - 18 * 60 * 1000).toISOString(),
    },
    {
      actor:   AUDIT_ADMINS[2], // Carlos Méndez Polanco
      type:    'edit',
      subject: { name: 'Marleni Rosario Castillo', id: 'EMP-00174' },
      id:      now - 4,
      ts:      new Date(now - 42 * 60 * 1000).toISOString(),
    },
    {
      actor:   AUDIT_ADMINS[0], // Pavel Abreu Torres
      type:    'add',
      subject: { name: 'Sofía Hernández Marte', id: 'EMP-00521' },
      id:      now - 5,
      ts:      new Date(now - 34 * 60 * 1000).toISOString(),
    },
  ];
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
})();

function timeAgo(isoStr, t) {
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 60)    return t.cl_moment;
  if (diff < 3600)  return t.cl_mins_ago.replace('{n}', Math.floor(diff / 60));
  if (diff < 86400) return t.cl_hours_ago.replace('{n}', Math.floor(diff / 3600));
  return new Date(isoStr).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function auditMessage(entry, t) {
  const actor   = entry.actor?.name   || t.cl_msg_actor;
  const subject = entry.subject?.name || t.cl_msg_subject;
  const sid     = entry.subject?.id   ? ` (${entry.subject.id})` : '';
  const conn    = { add: t.cl_msg_add_c, edit: t.cl_msg_edit_c, delete: t.cl_msg_del_c };
  const verb    = { add: t.cl_msg_add_v, edit: t.cl_msg_edit_v, delete: t.cl_msg_del_v };
  if (entry.type === 'add' || entry.type === 'edit' || entry.type === 'delete') {
    const c = conn[entry.type];
    return <>{actor} <strong>{verb[entry.type]}</strong>{c ? ` ${c}` : ''} {subject}{sid}</>;
  }
  return <>{actor} {t.cl_msg_other} {subject}</>;
}

function AdminZone({ admin, log, isActive, onClick, t }) {
  const count   = log.filter(e => e.actor?.id === admin.id).length;
  const lastAct = log.find(e => e.actor?.id === admin.id);

  return (
    <button
      className={`az ${isActive ? 'az--active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <div className="az__avatar">{admin.initials}</div>
      <div className="az__name">{admin.name}</div>
      <div className="az__dept">{admin.dept}</div>
      <div className="az__meta">
        <span className="az__count">{count} {count === 1 ? t.cl_action : t.cl_actions}</span>
        {lastAct && <span className="az__last">{timeAgo(lastAct.ts, t)}</span>}
      </div>
      {isActive && <div className="az__active-dot" aria-hidden="true" />}
    </button>
  );
}

function AllAdminZone({ log, isActive, onClick, t }) {
  const count   = log.length;
  const lastAct = log[0];

  return (
    <button
      className={`az az--all ${isActive ? 'az--active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <div className="az__avatar az__avatar--all">
        <Icon name="groupAdmins" size={20} />
      </div>
      <div className="az__all-body">
        <div className="az__name">{t.cl_all_name}</div>
        <div className="az__dept">{t.cl_all_dept}</div>
      </div>
      <div className="az__meta az__meta--right">
        <span className="az__count">{count} {count === 1 ? t.cl_action : t.cl_actions}</span>
        {lastAct && <span className="az__last">{timeAgo(lastAct.ts, t)}</span>}
      </div>
      {isActive && <div className="az__active-dot" aria-hidden="true" />}
    </button>
  );
}

function ActivityTimeline({ admin, log, typeFilter, setTypeFilter, monthFilter, t }) {
  const isAll = admin.id === '__all__';
  const entries = log.filter(e => {
    if (!isAll && e.actor?.id !== admin.id) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (monthFilter && !e.ts.startsWith(monthFilter)) return false;
    return true;
  });

  const auditActions = getAuditActions(t);

  const typeOptions = [
    { id: 'all',    label: t.cl_filter_all    },
    { id: 'add',    label: t.cl_filter_add    },
    { id: 'edit',   label: t.cl_filter_edit   },
    { id: 'delete', label: t.cl_filter_delete },
  ];

  const filterRef      = React.useRef(null);
  const filterItemRefs = React.useRef({});
  const [filterPill, setFilterPill] = React.useState({ opacity: 0 });

  React.useLayoutEffect(() => {
    const el   = filterItemRefs.current[typeFilter];
    const wrap = filterRef.current;
    if (!el || !wrap) return;
    const er = el.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    setFilterPill({
      opacity:   1,
      width:     er.width,
      height:    er.height,
      transform: `translateX(${Math.round(er.left - wr.left)}px)`,
    });
  }, [typeFilter]);

  return (
    <div className="act-panel">
      <div className="act-panel__head">
        <div className="act-panel__who">
          <div className={`act-panel__avatar${isAll ? ' act-panel__avatar--all' : ''}`}>
            {isAll ? <Icon name="groupAdmins" size={20} /> : admin.initials}
          </div>
          <div>
            <div className="act-panel__name">{admin.name}</div>
            <div className="act-panel__dept">
              {isAll
                ? `${entries.length} ${entries.length === 1 ? t.cl_action : t.cl_actions} · ${t.cl_all_unified}`
                : <>{admin.dept} · <span className="mono">{admin.id}</span></>}
            </div>
          </div>
        </div>
        <div className="seg-filter" ref={filterRef}>
          <span className="seg-filter__pill" style={filterPill} aria-hidden="true" />
          {typeOptions.map(o => (
            <button key={o.id}
              ref={el => (filterItemRefs.current[o.id] = el)}
              className={`seg-filter__item ${typeFilter === o.id ? 'seg-filter__item--active' : ''}`}
              onClick={() => setTypeFilter(o.id)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="act-panel__body">
        {entries.length === 0 ? (
          <div className="audit-empty">
            <Icon name="shield" size={28} stroke={1.2} />
            <div className="audit-empty__title">{t.cl_empty_title}</div>
            <div className="audit-empty__sub">{isAll ? t.cl_empty_sub_all : t.cl_empty_sub}</div>
          </div>
        ) : (
          <div className="audit-list">
            {entries.map((entry, i) => {
              const action = auditActions[entry.type] || auditActions.edit;
              return (
                <div key={entry.id} className={`audit-entry ${i < entries.length - 1 ? 'audit-entry--bordered' : ''}`}>
                  <div className="audit-entry__left">
                    <div className="audit-entry__dot-wrap">
                      <div className={`audit-entry__dot audit-dot--${entry.type}`} />
                    </div>
                    {i < entries.length - 1 && <div className="audit-entry__line" />}
                  </div>
                  <div className="audit-entry__body">
                    <div className="audit-entry__row">
                      <span className={`audit-badge ${action.cls}`}>
                        <Icon name={action.icon} size={11} stroke={2.2} />
                        {action.label}
                      </span>
                      <span className="audit-entry__time">{timeAgo(entry.ts, t)}</span>
                    </div>
                    <div className="audit-entry__msg">{auditMessage(entry, t)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const MONTH_NAMES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function ChangelogView({ t }) {
  const [log, setLog]               = React.useState(getAuditLog);
  const [activeId, setActiveId]     = React.useState('__all__');
  const [typeFilter, setTypeFilter] = React.useState('all');

  const now          = new Date();
  const currentYear  = String(now.getFullYear());
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

  const [yearFilter,  setYearFilter]  = React.useState(currentYear);
  const [monthFilter, setMonthFilter] = React.useState(currentMonth);

  React.useEffect(() => { setLog(getAuditLog()); }, []);

  // Años disponibles en el log + año actual
  const availableYears = React.useMemo(() => {
    const set = new Set(log.map(e => e.ts.slice(0, 4)));
    set.add(currentYear);
    return Array.from(set).sort().reverse();
  }, [log]);

  // Meses del año seleccionado que tienen entradas + mes actual si es el año actual
  const availableMonths = React.useMemo(() => {
    const set = new Set(
      log.filter(e => e.ts.startsWith(yearFilter)).map(e => e.ts.slice(0, 7))
    );
    if (yearFilter === currentYear) set.add(currentMonth);
    return Array.from(set).sort().reverse();
  }, [log, yearFilter]);

  const allAdmin    = { id: '__all__', name: t.cl_all_name, initials: '∑', dept: t.cl_all_dept };
  const activeAdmin = activeId === '__all__'
    ? allAdmin
    : (AUDIT_ADMINS.find(a => a.id === activeId) ?? AUDIT_ADMINS[0]);

  const handleYearChange = (y) => {
    setYearFilter(y);
    setTypeFilter('all');
    // Seleccionar mes actual si es el año actual, si no el más reciente del año
    if (y === currentYear) {
      setMonthFilter(currentMonth);
    } else {
      const months = log.filter(e => e.ts.startsWith(y)).map(e => e.ts.slice(0, 7)).sort().reverse();
      setMonthFilter(months[0] || `${y}-01`);
    }
  };

  const filteredLog = log.filter(e => e.ts.startsWith(monthFilter));

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">{t.nav_changelog}</div>
          <div className="page__subtitle">{t.cl_subtitle}</div>
        </div>
        <span className="kpi__pill kpi__pill--up">
          <span className="kpi__pill-dot" />
          {t.dash_pill_live}
        </span>
      </div>

      {/* Filtro año → mes */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
        <div style={{ display:'flex', gap:6 }}>
          {availableYears.map(y => (
            <button key={y}
              onClick={() => handleYearChange(y)}
              className={`ev-month-btn${yearFilter === y ? ' ev-month-btn--active' : ''}`}>
              {y}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {availableMonths.map(ym => (
            <button key={ym}
              onClick={() => { setMonthFilter(ym); setTypeFilter('all'); }}
              className={`ev-month-btn${monthFilter === ym ? ' ev-month-btn--active' : ''}`}>
              {MONTH_NAMES_ES[parseInt(ym.slice(5), 10) - 1]}
            </button>
          ))}
        </div>
      </div>

      <div className="activity-map">
        <div className="activity-map__left">
          <div className="activity-map__label">{t.cl_label_admins}</div>
          <div className="activity-map__grid">
            <AllAdminZone
              log={filteredLog}
              isActive={activeId === '__all__'}
              onClick={() => { setActiveId('__all__'); setTypeFilter('all'); }}
              t={t}
            />
            {AUDIT_ADMINS.map(admin => (
              <AdminZone
                key={admin.id}
                admin={admin}
                log={filteredLog}
                isActive={activeId === admin.id}
                onClick={() => { setActiveId(admin.id); setTypeFilter('all'); }}
                t={t}
              />
            ))}
          </div>
        </div>

        <ActivityTimeline
          admin={activeAdmin}
          log={filteredLog}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          monthFilter={monthFilter}
          t={t}
        />
      </div>
    </div>
  );
}

Object.assign(window, { ChangelogView });
