/* dashboard.jsx — employee directory */

function DashboardView({ t, lang, setLang, setRoute }) {
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [employees, setEmployees] = React.useState(EMPLOYEES);
  const [selectedId, setSelectedId] = React.useState(EMPLOYEES[0]?.id || null);
  const [editingId, setEditingId] = React.useState(null);
  const [exportOpen, setExportOpen] = React.useState(false);
  const exportRef = React.useRef(null);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const statusRef = React.useRef(null);

  React.useEffect(() => {
    if (!exportOpen) return;
    const onDoc = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [exportOpen]);

  React.useEffect(() => {
    if (!statusOpen) return;
    const onDoc = (e) => { if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [statusOpen]);

  const statusLabel = (e) => {
    if (e.status === 'inactive' && e.inactiveReason === 'retired') return t.dash_status_retired;
    if (e.status === 'inactive' && e.inactiveReason === 'suspended') return t.dash_status_suspended || 'Suspensión';
    if (e.status === 'inactive' && e.inactiveReason === 'other') return t.dash_status_inactive_other || t.dash_filter_licensed;
    if (e.status === 'inactive') return t.dash_status_inactive;
    const statusMap = { ok: t.dash_status_ok, pending: t.dash_status_pending, inactive: t.dash_status_inactive };
    return statusMap[e.status] || e.status;
  };

  const updateEmployee = (id, field, value) => {
    setEmployees((prev) => prev.map((employee) => employee.id === id ? { ...employee, [field]: value } : employee));
  };

  const startEditing = (event, employeeId) => {
    event.stopPropagation();
    setSelectedId(employeeId);
    setEditingId(employeeId);
  };

  const stopEditing = (event, employeeId) => {
    event.stopPropagation();
    setEditingId((current) => (current === employeeId ? null : current));
  };

  const list = employees.filter(e => {
    if (filter === 'active' && e.status !== 'ok') return false;
    if (filter === 'pending' && e.status !== 'pending') return false;
    if (filter === 'inactive' && e.status !== 'inactive') return false;
    if (filter === 'licensed' && !(e.status === 'inactive' && e.inactiveReason === 'other')) return false;
    if (filter === 'retired' && !(e.status === 'inactive' && e.inactiveReason === 'retired')) return false;
    if (filter === 'suspended' && !(e.status === 'inactive' && e.inactiveReason === 'suspended')) return false;
    if (query) {
      const q = query.toLowerCase();
      return e.name.toLowerCase().includes(q) ||
             e.cedula.includes(q) ||
             e.id.toLowerCase().includes(q) ||
             e.dept.toLowerCase().includes(q) ||
             e.role.toLowerCase().includes(q) ||
             (e.email && e.email.toLowerCase().includes(q)) ||
             (e.phone && e.phone.includes(q)) ||
             statusLabel(e).toLowerCase().includes(q) ||
             (e.inactiveComment && e.inactiveComment.toLowerCase().includes(q));
    }
    return true;
  });

  const tableRef = React.useRef(null);
  const segRef = React.useRef(null);
  const segItems = React.useRef({});
  const [segPill, setSegPill] = React.useState({ opacity: 0 });

  React.useLayoutEffect(() => {
    const el = segItems.current[filter];
    const wrap = segRef.current;
    if (!el || !wrap) { setSegPill({ opacity: 0 }); return; }
    const er = el.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    setSegPill({
      opacity: 1,
      width: `${Math.round(er.width)}px`,
      transform: `translateX(${Math.round(er.left - wr.left)}px)`,
    });
  }, [filter, t]);

  const goPending = () => {
    setFilter('pending');
    setQuery('');
    if (tableRef.current) tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chooseStatusFilter = (next) => {
    setFilter(next);
    setStatusOpen(false);
  };

  const filterOptions = [
    { id: 'all', label: t.dash_filter_all },
    { id: 'active', label: t.dash_filter_active },
    { id: 'pending', label: t.dash_filter_pending },
    { id: 'inactive', label: t.dash_filter_inactive },
  ];

  const statusMenuEnabled = filter === 'all' || filter === 'inactive';
  const statusFilterLabel =
    filter === 'licensed' ? t.dash_filter_licensed :
    filter === 'retired' ? t.dash_filter_retired :
    filter === 'suspended' ? t.dash_filter_suspended :
    filterOptions.find((entry) => entry.id === filter)?.label || t.dash_col_status;

  const kpis = [
    { label: t.dash_kpi_total,   value: employees.length + 387, pill: '+12', dir: 'up', icon: 'badge' },
    { label: t.dash_kpi_active,   value: 197, pill: t.dash_pill_live, icon: 'user', accent: 'ok', live: true },
    { label: t.dash_kpi_pending, value: 87, pill: t.dash_pill_review, icon: 'clock', accent: 'warn', action: goPending },
  ];

  const exportExcel = () => {
    setExportOpen(false);
    const headers = ['ID', 'Cédula', t.dash_col_employee, t.dash_col_dept, t.dash_col_role, t.dash_col_schedule, t.dash_col_status, t.dash_col_comment, t.dash_col_last];
    const rows = list.map(e => [e.id, e.cedula, e.name, e.dept, e.role, e.schedule, statusLabel(e), e.inactiveComment || t.dash_no_comment, e.lastIn]);
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UASD_empleados.xls';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    setExportOpen(false);
    const escHtml = (v) => String(v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const rowsHtml = list.map(e => `<tr>
      <td>${escHtml(e.id)}</td><td>${escHtml(e.cedula)}</td><td>${escHtml(e.name)}</td><td>${escHtml(e.dept)}</td>
      <td>${escHtml(e.role)}</td><td>${escHtml(e.schedule)}</td><td>${escHtml(statusLabel(e))}</td><td>${escHtml(e.inactiveComment || t.dash_no_comment)}</td><td>${escHtml(e.lastIn)}</td>
    </tr>`).join('');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${t.dash_title} — UASD</title>
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
      <h1>${t.dash_title} — UASD</h1>
      <div class="sub">${t.appSub} · ${new Date().toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US')}</div>
      <table><thead><tr>
        <th>ID</th><th>Cédula</th><th>${t.dash_col_employee}</th><th>${t.dash_col_dept}</th>
        <th>${t.dash_col_role}</th><th>${t.dash_col_schedule}</th><th>${t.dash_col_status}</th><th>${t.dash_col_comment}</th><th>${t.dash_col_last}</th>
      </tr></thead><tbody>${rowsHtml}</tbody></table>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 350);
  };

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">{t.dash_title}</div>
          <div className="page__subtitle">{t.dash_sub}</div>
        </div>
        <div className="page__actions">
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
          <button className="btn btn--primary" onClick={() => setRoute('register')}>
            <Icon name="plus" size={14}/> {t.dash_new}
          </button>
        </div>
      </div>

      <div className="kpi-grid kpi-grid--3">
        {kpis.map((k, i) => (
          <div className={`kpi ${k.fill ? 'kpi--fill' : ''} ${k.accent ? 'kpi--' + k.accent : ''}`} key={i}>
            <div className="kpi__top">
              <div className="kpi__icon"><Icon name={k.icon} size={18}/></div>
              {k.pill && (
                k.action ? (
                  <button className={`kpi__pill kpi__pill--btn ${k.dir === 'up' ? 'kpi__pill--up' : ''}`} onClick={k.action}>
                    {k.live && <span className="kpi__pill-dot"></span>}
                    {k.pill} <Icon name="arrowRight" size={12}/>
                  </button>
                ) : (
                  <span className={`kpi__pill ${k.dir === 'up' ? 'kpi__pill--up' : ''}`}>
                    {k.live && <span className="kpi__pill-dot"></span>}
                    {k.pill}
                  </span>
                )
              )}
            </div>
            <div className="kpi__foot">
              <div className="kpi__label">{k.label}</div>
              <div className="kpi__value">{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" ref={tableRef}>

        <div className="card__head" style={{padding:'18px 20px'}}>
          <div className="toolbar" style={{margin:0}}>
            <div className="toolbar__left">
              <div className="toolbar__search">
                <span className="toolbar__search-icon"><Icon name="search" size={15}/></span>
                <input placeholder={t.dash_search}
                       value={query} onChange={e => setQuery(e.target.value)}/>
                {query && (
                  <>
                    <span className="toolbar__search-count">{list.length}</span>
                    <button className="toolbar__search-clear" onClick={() => setQuery('')} aria-label="Limpiar">
                      <Icon name="x" size={13} stroke={2.4}/>
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="seg-filter" ref={segRef}>
              <span className="seg-filter__pill" style={segPill}></span>
              {filterOptions.map(f => (
                  <button key={f.id}
                          ref={(el) => (segItems.current[f.id] = el)}
                          className={`seg-filter__item ${filter === f.id ? 'seg-filter__item--active' : ''}`}
                          onClick={() => setFilter(f.id)}>
                    {f.label}
                  </button>
              ))}
            </div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>{t.dash_col_employee}</th>
              <th>{t.dash_col_dept}</th>
              <th>{t.dash_col_role}</th>
              <th>{t.dash_col_schedule}</th>
              <th>
                <div className="table__status-wrap" ref={statusRef}>
                  <button className="table__status-filter"
                          onClick={() => statusMenuEnabled && setStatusOpen((o) => !o)}
                          title={t.dash_col_status}>
                    {statusFilterLabel}
                  </button>
                  {statusOpen && statusMenuEnabled && (
                    <div className="table__status-menu">
                      <button className={`table__status-menu-item ${filter === 'licensed' ? 'is-active' : ''}`}
                              onClick={() => chooseStatusFilter('licensed')}>
                        <StatusBadge status="inactive" t={t} employee={{ status: 'inactive', inactiveReason: 'other' }} />
                      </button>
                      <button className={`table__status-menu-item ${filter === 'suspended' ? 'is-active' : ''}`}
                              onClick={() => chooseStatusFilter('suspended')}>
                        <StatusBadge status="inactive" t={t} employee={{ status: 'inactive', inactiveReason: 'suspended' }} />
                      </button>
                      <button className={`table__status-menu-item ${filter === 'retired' ? 'is-active' : ''}`}
                              onClick={() => chooseStatusFilter('retired')}>
                        <StatusBadge status="inactive" t={t} employee={{ status: 'inactive', inactiveReason: 'retired' }} />
                      </button>
                    </div>
                  )}
                </div>
              </th>
              <th>{t.dash_col_comment}</th>
              <th style={{textAlign:'right'}}>{t.dash_col_last}</th>
              <th style={{textAlign:'center'}}>Editar</th>
            </tr>
          </thead>
          <tbody>
            {list.map(e => (
              <tr
                key={e.id}
                className={selectedId === e.id ? 'table__row--selected' : ''}
                onClick={() => setSelectedId(e.id)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setSelectedId(e.id);
                  setEditingId(e.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  {editingId === e.id ? (
                    <div className="table__person table__person--edit">
                      <div className="table__avatar">{initials(e.name)}</div>
                      <div className="table__person-edit-stack">
                        <input className="table__inline-input" value={e.name} onChange={(event) => updateEmployee(e.id, 'name', event.target.value)} onClick={(event) => event.stopPropagation()} />
                        <input className="table__inline-input mono" value={e.cedula} onChange={(event) => updateEmployee(e.id, 'cedula', event.target.value)} onClick={(event) => event.stopPropagation()} />
                      </div>
                    </div>
                  ) : (
                    <div className="table__person">
                      <div className="table__avatar">{initials(e.name)}</div>
                      <div>
                        <div className="table__person-name">{e.name}</div>
                        <div className="table__person-id mono">{e.id} · {e.cedula}</div>
                      </div>
                    </div>
                  )}
                </td>
                <td>
                  {editingId === e.id ? (
                    <input className="table__inline-input" value={e.dept} onChange={(event) => updateEmployee(e.id, 'dept', event.target.value)} onClick={(event) => event.stopPropagation()} />
                  ) : (
                    <span className="table__text-value">{e.dept}</span>
                  )}
                </td>
                <td>
                  {editingId === e.id ? (
                    <input className="table__inline-input" value={e.role} onChange={(event) => updateEmployee(e.id, 'role', event.target.value)} onClick={(event) => event.stopPropagation()} />
                  ) : (
                    <span className="table__text-value">{e.role}</span>
                  )}
                </td>
                <td>
                  {editingId === e.id ? (
                    <input className="table__inline-input mono" value={e.schedule} onChange={(event) => updateEmployee(e.id, 'schedule', event.target.value)} onClick={(event) => event.stopPropagation()} />
                  ) : (
                    <span className="table__text-value mono">{e.schedule}</span>
                  )}
                </td>
                <td>
                  {editingId === e.id ? (
                    <select className="table__inline-select" value={e.status} onChange={(event) => updateEmployee(e.id, 'status', event.target.value)} onClick={(event) => event.stopPropagation()}>
                      <option value="ok">Registrado</option>
                      <option value="pending">Pendiente</option>
                      <option value="inactive">No activo</option>
                    </select>
                  ) : (
                    <StatusBadge status={e.status} t={t} employee={e} />
                  )}
                </td>
                <td>
                  {editingId === e.id ? (
                    <input className="table__inline-input" value={e.inactiveComment || ''} onChange={(event) => updateEmployee(e.id, 'inactiveComment', event.target.value)} onClick={(event) => event.stopPropagation()} placeholder={t.dash_no_comment} />
                  ) : (
                    <div className={`table__comment ${e.inactiveComment ? '' : 'table__comment--empty'}`}>
                      {e.inactiveComment || t.dash_no_comment}
                    </div>
                  )}
                </td>
                <td style={{textAlign:'right'}} className="mono">{e.lastIn}</td>
                <td style={{textAlign:'center'}}>
                  {editingId === e.id ? (
                    <button className="table__edit-btn table__edit-btn--done" onClick={(event) => stopEditing(event, e.id)}>Listo</button>
                  ) : (
                    <button className="table__edit-btn" onClick={(event) => startEditing(event, e.id)}>Editar</button>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="8" style={{textAlign:'center',padding:'40px',color:'var(--ink-400)'}}>
                  {t.dash_empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{
          padding:'14px 20px',
          display:'flex',
          justifyContent:'space-between',
          fontSize:12,
          color:'var(--ink-400)',
          borderTop:'1px solid var(--ink-100)',
        }}>
          <span>{t.dash_showing.split('{n}').join(list.length).split('{total}').join(employees.length)}</span>
          <div className="hstack" style={{gap:6}}>
            <button className="filter-chip">‹</button>
            <span className="mono" style={{padding:'0 8px'}}>1 / 24</span>
            <button className="filter-chip">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardView });
