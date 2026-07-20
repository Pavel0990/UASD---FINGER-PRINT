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
  if (typeof isBackendActive === 'function' && isBackendActive()) return DataStore.auditLog;
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]'); } catch { return []; }
}

function pushAuditEntry(entry) {
  if (typeof isBackendActive === 'function' && isBackendActive()) {
    // El backend ya registró la entrada real server-side (logAudit(), disparado
    // por employees.controller en el mismo request que originó esta llamada,
    // con el actor real de la sesión — no AUDIT_ADMINS[0]). Acá solo se
    // refresca el cache local para que ChangelogView la muestre.
    apiFetch('/audit-log?limit=200').then(data => { DataStore.auditLog = data.entries || []; }).catch(() => {});
    return;
  }
  const log = getAuditLog();
  log.unshift({ ...entry, id: Date.now(), ts: new Date().toISOString() });
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log.slice(0, 200)));
}

// Actor real de la sesión local — antes SIEMPRE se atribuía a AUDIT_ADMINS[0]
// sin importar quién estuviera logueado, así que el log de auditoría no
// reflejaba quién hizo qué de verdad.
function currentActor() {
  const uid = typeof getCurrentUserId === 'function' ? getCurrentUserId() : '';
  const emp = uid && typeof EMPLOYEES !== 'undefined' ? EMPLOYEES.find(e => e.id === uid) : null;
  if (!emp) return AUDIT_ADMINS[0]; // último recurso si no hay forma de determinar quién es
  return { name: emp.name, id: emp.id, initials: initials(emp.name), dept: emp.dept };
}

window.auditLog = {
  add:    (subject) => pushAuditEntry({ actor: currentActor(), type: 'add',    subject }),
  edit:   (subject) => pushAuditEntry({ actor: currentActor(), type: 'edit',   subject }),
  delete: (subject) => pushAuditEntry({ actor: currentActor(), type: 'delete', subject }),
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

function ActivityTimeline({ admin, log, typeFilter, setTypeFilter, dateFilter, t }) {
  const isAll = admin.id === '__all__';
  const entries = log.filter(e => {
    if (!isAll && e.actor?.id !== admin.id) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (dateFilter) {
      if (Array.isArray(dateFilter)) { if (!dateFilter.some(d => e.ts.startsWith(d))) return false; }
      else if (!e.ts.startsWith(dateFilter)) return false;
    }
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

      <div className="act-panel__body" key={admin.id}>
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

const MONTH_NAMES_ES      = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTH_NAMES_ES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DOW_ES = ['L','M','X','J','V','S','D'];

/* ── Filtro tipo "KPI Statistic": años → menú flotante mes/día ───────── */
function DateStatFilter({ log, dateFilter, onChange }) {
  const now         = new Date();
  const currentYear = String(now.getFullYear());
  const todayStr    = now.toISOString().slice(0, 10);

  const isMulti      = Array.isArray(dateFilter);
  const isDayArray   = isMulti && dateFilter[0]?.length === 10;
  const isMonthArray = isMulti && dateFilter[0]?.length === 7;

  const activeYear     = isMulti ? dateFilter[0]?.slice(0,4) : (dateFilter ? dateFilter.slice(0,4) : null);
  const selectedMonths = isMonthArray ? dateFilter : (dateFilter?.length === 7 ? [dateFilter] : []);
  const selectedDays   = isDayArray ? dateFilter : [];
  const activeMonth    = selectedMonths[0] || null;
  const activeDay      = selectedDays.length === 1 ? selectedDays[0] : null;

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuClosing, setMenuClosing] = React.useState(false);
  const [calYM, setCalYM]         = React.useState(null);
  const [pendingYear, setPendingYear] = React.useState(null);
  const trigRef = React.useRef(null);
  const popRef  = React.useRef(null);
  const [pos, setPos] = React.useState({ top:0, left:0 });

  const closeMenu = () => {
    setMenuClosing(true);
  };
  const onMenuAnimEnd = () => {
    if (menuClosing) { setMenuOpen(false); setMenuClosing(false); setPendingYear(null); setCalYM(null); setRangeAnchor(null); setHoverDs(null); }
  };

  // Año que el menú usa para listar meses (puede diferir del filtro activo)
  const browsedYear = pendingYear || activeYear;

  const availableYears = React.useMemo(() => {
    const set = new Set(log.map(e => e.ts.slice(0, 4)));
    set.add(currentYear);
    return Array.from(set).sort().reverse();
  }, [log]);

  const availableMonths = React.useMemo(() => {
    if (!browsedYear) return [];
    const set = new Set(log.filter(e => e.ts.startsWith(browsedYear)).map(e => e.ts.slice(0, 7)));
    const curM = currentYear + '-' + String(now.getMonth()+1).padStart(2,'0');
    if (browsedYear === currentYear) set.add(curM);
    return Array.from(set).sort().reverse();
  }, [log, browsedYear]);

  const openMenu = (yearPillEl, year) => {
    if (menuOpen) { closeMenu(); return; }
    // Abrir menú para el año elegido sin borrar la selección actual
    setPendingYear(year !== activeYear ? year : null);
    setCalYM(null);
    setRangeAnchor(null);
    setHoverDs(null);
    const r = yearPillEl.getBoundingClientRect();
    setPos({ top: r.bottom + 8, left: r.left });
    setMenuOpen(true);
  };

  React.useEffect(() => {
    if (!menuOpen) return;
    const onMouse = (e) => {
      if (!trigRef.current?.contains(e.target) && !popRef.current?.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', onMouse);
    return () => document.removeEventListener('mousedown', onMouse);
  }, [menuOpen]);

  // Calendario días — mes fijo al elegido en la lista
  const calY = calYM ? parseInt(calYM.slice(0,4)) : new Date().getFullYear();
  const calM = calYM ? parseInt(calYM.slice(5,7)) - 1 : new Date().getMonth();
  const firstDow    = (new Date(calY, calM, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();

  const [rangeAnchor, setRangeAnchor] = React.useState(null);
  const [hoverDs,     setHoverDs]     = React.useState(null);

  const getDaysInRange = (a, b) => {
    const [s, e] = a <= b ? [a, b] : [b, a];
    const days = [], cur = new Date(s + 'T00:00:00'), end = new Date(e + 'T00:00:00');
    while (cur <= end) { days.push(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1); }
    return days;
  };

  const previewSet = React.useMemo(() => {
    if (rangeAnchor && hoverDs) return new Set(getDaysInRange(rangeAnchor, hoverDs));
    return new Set(selectedDays);
  }, [rangeAnchor, hoverDs, selectedDays]);

  const pickDay = (ds) => {
    if (!rangeAnchor) {
      if (selectedDays.includes(ds)) {
        // Clic sobre día ya seleccionado → deseleccionar todo
        onChange(calYM);
      } else {
        setRangeAnchor(ds);
        onChange([ds]);
      }
    } else {
      if (ds === rangeAnchor) {
        // Clic sobre el ancla misma → cancelar selección
        setRangeAnchor(null);
        setHoverDs(null);
        onChange(calYM);
      } else {
        const range = getDaysInRange(rangeAnchor, ds);
        setRangeAnchor(null);
        setHoverDs(null);
        onChange(range.length === 0 ? calYM : range);
      }
    }
  };

  const pillBase = {
    fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600,
    border:'1px solid var(--ink-200)', borderRadius:999,
    padding:'8px 22px', cursor:'pointer', transition:'all .15s',
    background:'transparent', color:'var(--ink-500)', lineHeight:1,
  };
  const pillActive = { ...pillBase, background:'var(--ink-800)', color:'var(--cream-100)', border:'1px solid var(--ink-800)' };

  const activeLabel = selectedDays.length > 0
    ? selectedDays.length === 1
      ? `${parseInt(selectedDays[0].slice(8))} ${MONTH_NAMES_ES[parseInt(selectedDays[0].slice(5,7))-1]} ${activeYear}`
      : `${selectedDays.length} días — ${MONTH_NAMES_ES[parseInt(activeMonth?.slice(5))-1]} ${activeYear}`
    : selectedMonths.length > 1
      ? `${selectedMonths.length} meses — ${activeYear}`
      : activeMonth
        ? `${MONTH_NAMES_ES_FULL[parseInt(activeMonth.slice(5))-1]} ${activeYear}`
        : null;

  return (
    <div style={{ marginBottom:20 }}>

      {/* Pills de año — wrap natural sin cortar */}
      <div ref={trigRef} style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', rowGap:6 }}>
        {availableYears.map(y => {
          const isActive  = activeYear === y;
          const isBrowsed = browsedYear === y && menuOpen && !isActive;
          const pillBrowsed = { ...pillBase, background:'var(--ink-100)', color:'var(--ink-700)', border:'1px solid var(--ink-300)' };
          return (
          <button key={y}
            onClick={e => openMenu(e.currentTarget, y)}
            style={isActive ? pillActive : isBrowsed ? pillBrowsed : pillBase}
            onMouseEnter={e => { if (!isActive && !isBrowsed) { e.currentTarget.style.background='var(--ink-100)'; e.currentTarget.style.color='var(--ink-800)'; } }}
            onMouseLeave={e => { if (!isActive && !isBrowsed) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-500)'; } }}>
            <span style={{ fontFamily:'var(--font-mono)' }}>{y}</span>
          </button>
          );
        })}
      </div>

      {/* Indicador activo mes/día — animado para no empujar de golpe */}
      <div style={{
        maxHeight: activeLabel ? 36 : 0,
        opacity:   activeLabel ? 1 : 0,
        marginTop: activeLabel ? 8 : 0,
        overflow:  'hidden',
        transition: 'max-height .48s cubic-bezier(0.33,1,0.68,1), opacity .35s ease, margin-top .48s cubic-bezier(0.33,1,0.68,1)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)' }}>
          <Icon name="arrowRight" size={11} stroke={2} />
          <span style={{ fontFamily: activeDay ? 'var(--font-mono)' : 'var(--font-sans)', color:'var(--ink-600)', fontWeight:600 }}>{activeLabel}</span>
          <button onClick={() => { onChange(null); setMenuOpen(false); setRangeAnchor(null); setHoverDs(null); }}
            style={{ width:16, height:16, borderRadius:'50%', border:'none', background:'var(--ink-200)', color:'var(--ink-600)', cursor:'pointer', display:'grid', placeItems:'center' }}>
            <Icon name="x" size={9} stroke={2.4} />
          </button>
        </div>
      </div>

      {/* Mini menú flotante */}
      {menuOpen && ReactDOM.createPortal(
        <>
          <div onClick={closeMenu} style={{ position:'fixed', inset:0, zIndex:9998 }} />
          <div ref={popRef} onAnimationEnd={onMenuAnimEnd}
            style={{ position:'fixed', top:pos.top, left:pos.left, zIndex:9999,
              background:'var(--paper)', border:'1px solid var(--ink-100)', borderRadius:'var(--radius-md)',
              boxShadow:'0 8px 28px rgba(0,0,0,0.10)', minWidth:180, overflow:'hidden',
              animation: menuClosing ? 'menuClose 0.22s cubic-bezier(0.4,0,1,1) forwards' : 'menuOpen 0.22s cubic-bezier(0.16,1,0.3,1) both' }}>

          {!calYM ? (
            /* ── Lista de meses — selección múltiple ── */
            <div>
              <div style={{ padding:'8px 14px 6px', fontFamily:'var(--font-sans)', fontSize:10, fontWeight:700, color:'var(--ink-300)', letterSpacing:'0.08em', textTransform:'uppercase', borderBottom:'1px solid var(--ink-100)' }}>
                Mes
              </div>
              {availableMonths.map(ym => {
                const isSel = selectedMonths.includes(ym);
                const toggleMonth = () => {
                  if (selectedDays.length > 0) return; // en modo días no toggle meses
                  const next = isSel
                    ? selectedMonths.filter(m => m !== ym)
                    : [...selectedMonths, ym];
                  onChange(next.length === 0 ? (browsedYear || activeYear) : next.length === 1 ? next[0] : next);
                };
                return (
                  <div key={ym} role="checkbox" aria-checked={isSel} tabIndex={0}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'8px 14px', cursor:'pointer',
                    background: isSel ? 'rgba(22,27,51,0.05)' : 'transparent',
                    borderBottom:'1px solid var(--ink-100)', transition:'background .12s' }}
                    onClick={toggleMonth}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMonth(); } }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background='var(--cream-50)'; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background='transparent'; }}>
                    {/* Checkbox azul oscuro del sistema */}
                    <span style={{ width:15, height:15, borderRadius:3, marginRight:10, flexShrink:0, display:'grid', placeItems:'center', cursor:'pointer',
                      border: isSel ? '2px solid var(--ink-800)' : '1.5px solid var(--ink-200)',
                      background: isSel ? 'var(--ink-800)' : 'transparent', transition:'all .12s' }}>
                      {isSel && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <polyline points="1,3.5 3.5,6 8,1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span
                      style={{ fontFamily:'var(--font-sans)', fontSize:13, fontWeight: isSel ? 600 : 400,
                        color: isSel ? 'var(--ink-800)' : 'var(--ink-600)', flex:1 }}>
                      {MONTH_NAMES_ES_FULL[parseInt(ym.slice(5),10)-1]}
                    </span>
                    <button onClick={e => { e.stopPropagation(); onChange(ym); setCalYM(ym); }}
                      style={{ border:'none', background:'none', cursor:'pointer', color:'var(--ink-300)',
                        display:'grid', placeItems:'center', padding:'2px 4px', borderRadius:4 }}
                      title="Ver días"
                      onMouseEnter={e => e.currentTarget.style.color='var(--ink-700)'}
                      onMouseLeave={e => e.currentTarget.style.color='var(--ink-300)'}>
                      <Icon name="calendar" size={13} stroke={1.8} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Grid de días ── */
            <div>
              {/* Volver a meses */}
              <button onClick={() => { setCalYM(null); setRangeAnchor(null); setHoverDs(null); }}
                style={{ display:'flex', alignItems:'center', gap:4, width:'100%', padding:'9px 14px', border:'none', background:'none', cursor:'pointer', fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)', borderBottom:'1px solid var(--ink-100)' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--ink-800)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--ink-400)'}>
                <Icon name="arrowLeft" size={12} stroke={2} /> Meses
              </button>
              {/* Grid de días — mismas clases internas que DatePickerField */}
              <div style={{ padding:'12px 14px 14px', minWidth:220 }}>
                <div style={{ textAlign:'center', marginBottom:12, fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600, color:'var(--ink-800)' }}>
                  {MONTH_NAMES_ES_FULL[calM]} {calY}
                </div>
                <div className="dp-cal__grid">
                  {DOW_ES.map(d => <span key={d} className="dp-cal__dow">{d}</span>)}
                  {Array.from({ length: firstDow }).map((_,i) => <span key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_,i) => i+1).map(d => {
                    const ds = `${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const isToday   = ds === todayStr;
                    const inPreview = previewSet.has(ds);
                    const sortedSel = rangeAnchor && hoverDs
                      ? [rangeAnchor < hoverDs ? rangeAnchor : hoverDs, rangeAnchor < hoverDs ? hoverDs : rangeAnchor]
                      : selectedDays.length > 0 ? [selectedDays[0], selectedDays[selectedDays.length-1]] : [null, null];
                    const isEdge = ds === sortedSel[0] || ds === sortedSel[1];
                    const isSolid = inPreview && isEdge;
                    const isTint  = inPreview && !isEdge;
                    return (
                      <button type="button" key={d}
                        onClick={() => pickDay(ds)}
                        onMouseEnter={() => rangeAnchor && setHoverDs(ds)}
                        onMouseLeave={() => rangeAnchor && setHoverDs(null)}
                        className={`dp-cal__day${isToday && !inPreview ? ' dp-cal__day--today' : ''}`}
                        style={isSolid ? {
                          background: 'var(--ink-700)', color: 'var(--cream-100)', fontWeight: 700,
                          borderRadius: '50%', border: 'none',
                        } : isTint ? {
                          background: 'rgba(34,42,77,0.10)', color: 'var(--ink-600)', fontWeight: 500,
                          borderRadius: '50%', border: '1px solid rgba(34,42,77,0.14)',
                        } : {}}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        </>,
        document.body
      )}
    </div>
  );
}


function ChangelogView({ t }) {
  const [log, setLog]               = React.useState(getAuditLog);
  const [activeId, setActiveId]     = React.useState('__all__');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState(null); // null | 'YYYY' | 'YYYY-MM' | string[]

  const allAdmin    = { id: '__all__', name: t.cl_all_name, initials: '∑', dept: t.cl_all_dept };
  const activeAdmin = activeId === '__all__'
    ? allAdmin
    : (AUDIT_ADMINS.find(a => a.id === activeId) ?? AUDIT_ADMINS[0]);

  const filteredLog = !dateFilter ? log
    : Array.isArray(dateFilter) ? log.filter(e => dateFilter.some(d => e.ts.startsWith(d)))
    : log.filter(e => e.ts.startsWith(dateFilter));

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

      <DateStatFilter log={log} dateFilter={dateFilter} onChange={setDateFilter} />

      <div className="activity-map">
        <div className="activity-map__left">
          <div className="activity-map__label">
            {t.cl_label_admins}
            <span style={{fontWeight:400,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',textTransform:'none',letterSpacing:0}}>
              ({AUDIT_ADMINS.length})
            </span>
          </div>
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
          dateFilter={dateFilter}
          t={t}
        />
      </div>
    </div>
  );
}

Object.assign(window, { ChangelogView });
