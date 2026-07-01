/* finca.jsx — Finca Experimental: control diario de asistencia */

const FARM_EMP_KEY   = 'uasd_farm_employees';
const FARM_DAILY_KEY = 'uasd_farm_daily';

function getFarmEmployees() {
  try { return JSON.parse(localStorage.getItem(FARM_EMP_KEY) || '[]'); } catch { return []; }
}
function saveFarmEmployees(list) {
  localStorage.setItem(FARM_EMP_KEY, JSON.stringify(list));
}
function getFarmDaily() {
  try { return JSON.parse(localStorage.getItem(FARM_DAILY_KEY) || '{}'); } catch { return {}; }
}
function saveFarmDaily(data) {
  localStorage.setItem(FARM_DAILY_KEY, JSON.stringify(data));
}

function FarmView({ t, lang, setRoute }) {
  const today  = new Date().toLocaleDateString('en-CA');
  const isES   = lang === 'es';

  const [farmEmps,  setFarmEmps]  = React.useState(getFarmEmployees);
  const [daily,     setDaily]     = React.useState(getFarmDaily);
  const [viewDate,  setViewDate]  = React.useState(today);
  const [searchQ,   setSearchQ]   = React.useState(false);
  const [searchVal, setSearchVal] = React.useState('');
  const [flash,     setFlash]     = React.useState(null);

  const canManage = typeof userHasPermission === 'function' && userHasPermission('farm');

  const dayRecords          = daily[viewDate] || {};
  const farmEmployeeObjects = farmEmps.map(id => EMPLOYEES.find(e => e.id === id)).filter(Boolean);
  const presentCount        = farmEmployeeObjects.filter(e => dayRecords[e.id]).length;
  const absentCount         = farmEmployeeObjects.length - presentCount;
  const totalCount          = farmEmployeeObjects.length;

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(null), 2000); };

  const togglePresent = (empId) => {
    const records = { ...daily };
    if (!records[viewDate]) records[viewDate] = {};
    records[viewDate] = { ...records[viewDate] };
    if (records[viewDate][empId]) {
      delete records[viewDate][empId];
      if (!Object.keys(records[viewDate]).length) delete records[viewDate];
    } else {
      records[viewDate][empId] = true;
    }
    setDaily(records);
    saveFarmDaily(records);
  };

  const markAllPresent = () => {
    const records = { ...daily, [viewDate]: {} };
    farmEmployeeObjects.forEach(e => { records[viewDate][e.id] = true; });
    setDaily(records);
    saveFarmDaily(records);
  };

  const clearAll = () => {
    const records = { ...daily };
    delete records[viewDate];
    setDaily(records);
    saveFarmDaily(records);
  };

  const addToFarm = (empId) => {
    if (farmEmps.includes(empId)) return;
    const list = [...farmEmps, empId];
    setFarmEmps(list);
    saveFarmEmployees(list);
    setSearchVal('');
    showFlash(isES ? 'Empleado agregado a la finca' : 'Employee added to farm');
  };

  const removeFromFarm = (empId) => {
    const list = [...farmEmps].filter(id => id !== empId);
    setFarmEmps(list);
    saveFarmEmployees(list);
    const records = { ...daily };
    Object.keys(records).forEach(date => {
      if (records[date][empId]) {
        records[date] = { ...records[date] };
        delete records[date][empId];
        if (!Object.keys(records[date]).length) delete records[date];
      }
    });
    setDaily(records);
    saveFarmDaily(records);
    showFlash(isES ? 'Empleado removido de la finca' : 'Employee removed from farm');
  };

  const navDate = (offset) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + offset);
    setViewDate(d.toLocaleDateString('en-CA'));
  };

  const fmtDate = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayName  = (DAYS_ES   || [])[date.getDay()]   || '';
    const monthName= (MONTHS_ES || [])[m - 1]           || '';
    return isES
      ? `${dayName}, ${d} de ${monthName} ${y}`
      : date.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  };

  const availableEmps   = EMPLOYEES.filter(e => !farmEmps.includes(e.id) && e.status !== 'inactive');
  const filteredAvailable = searchVal
    ? availableEmps.filter(e =>
        e.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        e.id.toLowerCase().includes(searchVal.toLowerCase()) ||
        e.cedula.includes(searchVal))
    : availableEmps;

  const isToday = viewDate === today;

  return (
    <div className="page" style={{animation:'body-in .28s cubic-bezier(0.33,1,0.68,1) both'}}>

      {/* Header */}
      <div className="page__head">
        <div>
          <div className="page__title">{t.farm_title}</div>
          <div className="page__subtitle">{t.farm_sub}</div>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          {!isToday && (
            <button className="kpi__pill kpi__pill--up" onClick={() => setViewDate(today)}>
              <Icon name="refresh" size={12} /> {isES ? 'Hoy' : 'Today'}
            </button>
          )}
          {canManage && (
            <button
              className={`kpi__pill kpi__pill--btn${searchQ ? ' kpi__pill--btn--close' : ''}`}
              style={{minWidth:'120px',justifyContent:'center'}}
              onClick={() => { setSearchQ(p => !p); setSearchVal(''); }}>
              <Icon name={searchQ ? 'x' : 'userPlus'} size={13} />
              {searchQ ? (isES ? 'Cerrar' : 'Close') : (isES ? 'Agregar' : 'Add employee')}
            </button>
          )}
        </div>
      </div>

      {flash && (
        <div className="flash" style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',zIndex:1000}}>
          {flash}
        </div>
      )}

      {/* Two-column layout */}
      <div className="activity-map" style={{gridTemplateColumns:'320px 1fr'}}>

        {/* LEFT — Farm roster */}
        <div className="activity-map__left">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 16px 12px'}}>
            <span className="activity-map__label" style={{margin:0}}>
              {isES ? 'Trabajadores' : 'Farm workers'}
              <span style={{fontWeight:400,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',textTransform:'none',letterSpacing:0}}>
                ({totalCount})
              </span>
            </span>
          </div>

          {/* Add employee search */}
          {searchQ && (
            <div style={{padding:'0 16px 12px'}}>
              <div className="toolbar__search" style={{width:'100%'}}>
                <span className="toolbar__search-icon"><Icon name="search" size={15}/></span>
                <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
                  placeholder={isES ? 'Buscar empleado…' : 'Search employee…'}
                  autoFocus style={{background:'var(--paper)'}} />
                {searchVal && (
                  <button className="toolbar__search-clear" onClick={() => setSearchVal('')} aria-label="Limpiar">
                    <Icon name="x" size={13} stroke={2.4}/>
                  </button>
                )}
                {searchVal && (
                  <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:'var(--paper)',border:'1px solid var(--ink-100)',borderRadius:'10px',zIndex:10,maxHeight:'200px',overflowY:'auto',boxShadow:'var(--shadow-md)'}}>
                    {filteredAvailable.length === 0 ? (
                      <div style={{padding:'12px',fontSize:'13px',color:'var(--ink-300)',textAlign:'center'}}>
                        {isES ? 'Sin resultados' : 'No results'}
                      </div>
                    ) : filteredAvailable.map(e => (
                      <button key={e.id} onClick={() => addToFarm(e.id)}
                        style={{display:'block',width:'100%',textAlign:'left',padding:'10px 14px',cursor:'pointer',fontSize:'13px',borderBottom:'1px solid var(--ink-100)',border:'none',background:'transparent',outline:'none',transition:'background .1s'}}
                        onMouseEnter={ev => ev.currentTarget.style.background='var(--cream-50)'}
                        onMouseLeave={ev => ev.currentTarget.style.background='transparent'}>
                        <div style={{fontWeight:600}}>{e.name}</div>
                        <div style={{fontSize:'11px',color:'var(--ink-300)'}}><span className="mono">{e.id}</span> · {e.dept}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Roster list */}
          {totalCount === 0 ? (
            <div className="audit-empty" style={{padding:'32px 16px'}}>
              <Icon name="users" size={24} stroke={1.2} />
              <div className="audit-empty__title">{t.farm_no_employees}</div>
              <div className="audit-empty__sub">{canManage ? t.farm_no_emps_manage : t.farm_no_emps_admin}</div>
            </div>
          ) : (
            <div className="audit-list">
              {farmEmployeeObjects.map(emp => (
                <div key={emp.id} className="audit-entry" style={{alignItems:'center',padding:'10px 16px'}}>
                  <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'var(--ink-200)',display:'grid',placeItems:'center',fontSize:'11px',fontWeight:700,color:'var(--ink-600)',flexShrink:0}}>
                    {emp.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase()}
                  </div>
                  <div className="audit-entry__body">
                    <div className="audit-entry__row">
                      <span style={{fontWeight:600,fontSize:'13px'}}>{emp.name}</span>
                    </div>
                    <div className="audit-entry__row" style={{marginBottom:0,gap:'4px'}}>
                      <span className="az__dept">{emp.dept}</span>
                      <span className="az__last" style={{fontSize:'10.5px'}}>· <span className="mono">{emp.id}</span></span>
                    </div>
                  </div>
                  {canManage && (
                    <button className="table__action-btn table__action-btn--del"
                      onClick={() => removeFromFarm(emp.id)}
                      title={isES ? 'Quitar de la finca' : 'Remove from farm'}
                      style={{width:'30px',height:'30px',flexShrink:0}}>
                      <Icon name="x" size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Daily attendance */}
        <div className="act-panel">

          {/* Panel header with KPIs */}
          <div className="act-panel__head">
            <div className="act-panel__who">
              <div className="act-panel__avatar" style={{background:'#2d5a27'}}>
                <Icon name="check" size={16} stroke={2.2} />
              </div>
              <div>
                <div className="act-panel__name">{isES ? 'Asistencia diaria' : 'Daily attendance'}</div>
                <div className="act-panel__dept" style={{fontFamily:'var(--font-mono)',fontSize:'11.5px'}}>
                  {fmtDate(viewDate)}
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{display:'flex',gap:'12px',padding:'16px 24px',borderBottom:'1px solid var(--ink-100)'}}>
            <div className="kpi" style={{flex:1,minWidth:0}}>
              <div className="kpi__value" style={{color:'#2d5a27'}}>{presentCount}</div>
              <div className="kpi__label">{isES ? 'Presentes' : 'Present'}</div>
            </div>
            <div className="kpi" style={{flex:1,minWidth:0}}>
              <div className="kpi__value" style={{color:'var(--danger)'}}>{absentCount}</div>
              <div className="kpi__label">{isES ? 'Ausentes' : 'Absent'}</div>
            </div>
            <div className="kpi" style={{flex:1,minWidth:0}}>
              <div className="kpi__value">{totalCount}</div>
              <div className="kpi__label">{isES ? 'Total' : 'Total'}</div>
            </div>
          </div>

          {/* Date nav + actions toolbar */}
          <div className="audit-toolbar" style={{padding:'12px 24px',justifyContent:'space-between',borderBottom:'1px solid var(--ink-100)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <button className="table__action-btn" onClick={() => navDate(-1)} title={isES?'Día anterior':'Previous day'} style={{width:'32px',height:'32px'}}>
                <Icon name="arrowLeft" size={15} />
              </button>
              <span className="mono" style={{fontSize:'13px',fontWeight:600,minWidth:'90px',textAlign:'center'}}>
                {viewDate}
              </span>
              <button className="table__action-btn" onClick={() => navDate(1)} title={isES?'Día siguiente':'Next day'} style={{width:'32px',height:'32px'}}>
                <Icon name="arrowRight" size={15} />
              </button>
            </div>
            {totalCount > 0 && (
              <div style={{display:'flex',gap:'8px'}}>
                <button className="kpi__pill kpi__pill--up" onClick={markAllPresent}>
                  <Icon name="check" size={12} /> {t.farm_all_present}
                </button>
                <button className="kpi__pill kpi__pill--btn" onClick={clearAll}>
                  <Icon name="x" size={12} /> {isES ? 'Limpiar' : 'Clear'}
                </button>
              </div>
            )}
          </div>

          {/* Attendance list */}
          <div className="act-panel__body">
            {totalCount === 0 ? (
              <div className="audit-empty">
                <Icon name="users" size={24} stroke={1.2} />
                <div className="audit-empty__title">{t.farm_no_employees}</div>
                <div className="audit-empty__sub">{canManage ? t.farm_no_emps_manage : t.farm_no_emps_admin}</div>
              </div>
            ) : (
              <div className="audit-list">
                {farmEmployeeObjects.map(emp => {
                  const present = !!dayRecords[emp.id];
                  return (
                    <label key={emp.id} className="audit-entry"
                      style={{cursor:'pointer',alignItems:'center',padding:'12px 24px',background:present?'rgba(45,90,39,0.04)':'',transition:'background .15s'}}>
                      <div style={{width:'38px',height:'38px',borderRadius:'50%',
                        background: present ? '#2d5a27' : 'var(--ink-200)',
                        display:'grid',placeItems:'center',fontSize:'12px',fontWeight:700,
                        color: present ? '#fff' : 'var(--ink-600)',flexShrink:0,transition:'background .15s, color .15s'}}>
                        {emp.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase()}
                      </div>
                      <div className="audit-entry__body">
                        <div className="audit-entry__row">
                          <span style={{fontWeight:600,fontSize:'14px'}}>{emp.name}</span>
                        </div>
                        <div className="audit-entry__row" style={{marginBottom:0,gap:'4px'}}>
                          <span className="az__dept">{emp.dept}</span>
                          <span className="az__last" style={{fontSize:'10.5px'}}>· <span className="mono">{emp.id}</span></span>
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <span style={{fontSize:'12px',fontFamily:'var(--font-sans)',fontWeight:600,
                          color: present ? '#2d5a27' : 'var(--ink-300)',minWidth:'36px',textAlign:'right',transition:'color .15s'}}>
                          {present ? (isES ? 'Sí' : 'Yes') : (isES ? 'No' : 'No')}
                        </span>
                        <div onClick={() => togglePresent(emp.id)}
                          style={{width:'42px',height:'24px',borderRadius:'12px',
                            background: present ? '#2d5a27' : 'var(--ink-200)',
                            position:'relative',transition:'background .15s',flexShrink:0,cursor:'pointer'}}>
                          <div style={{position:'absolute',top:'3px',left:present?'21px':'3px',
                            width:'18px',height:'18px',borderRadius:'50%',background:'var(--paper)',
                            transition:'left .15s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}} />
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FarmView });
