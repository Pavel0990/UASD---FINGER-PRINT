/* finca.jsx — Finca Experimental: control diario de asistencia para trabajadores de la finca */

const FARM_EMP_KEY = 'uasd_farm_employees';
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
  const today = new Date().toLocaleDateString('en-CA');
  const [farmEmps, setFarmEmps] = React.useState(getFarmEmployees);
  const [daily, setDaily] = React.useState(getFarmDaily);
  const [viewDate, setViewDate] = React.useState(today);
  const [showManage, setShowManage] = React.useState(false);
  const [searchQ, setSearchQ] = React.useState('');
  const [flash, setFlash] = React.useState(null);
  const isES = lang === 'es';

  const canManage = typeof userHasPermission === 'function' && userHasPermission('farm');

  const dayRecords = daily[viewDate] || {};
  const farmEmployeeObjects = farmEmps.map(id => EMPLOYEES.find(e => e.id === id)).filter(Boolean);
  const presentCount = farmEmployeeObjects.filter(e => dayRecords[e.id]).length;
  const totalCount = farmEmployeeObjects.length;

  const togglePresent = (empId) => {
    const records = { ...daily };
    if (!records[viewDate]) records[viewDate] = {};
    records[viewDate] = { ...records[viewDate] };
    if (records[viewDate][empId]) {
      delete records[viewDate][empId];
      if (Object.keys(records[viewDate]).length === 0) delete records[viewDate];
    } else {
      records[viewDate][empId] = true;
    }
    setDaily(records);
    saveFarmDaily(records);
  };

  const markAllPresent = () => {
    const records = { ...daily };
    records[viewDate] = {};
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
    setFlash(isES ? 'Empleado agregado a la finca' : 'Employee added to farm');
    setTimeout(() => setFlash(null), 2000);
  };

  const removeFromFarm = (empId) => {
    const list = farmEmps.filter(id => id !== empId);
    setFarmEmps(list);
    saveFarmEmployees(list);
    const records = { ...daily };
    Object.keys(records).forEach(date => {
      if (records[date][empId]) {
        records[date] = { ...records[date] };
        delete records[date][empId];
        if (Object.keys(records[date]).length === 0) delete records[date];
      }
    });
    setDaily(records);
    saveFarmDaily(records);
    setFlash(isES ? 'Empleado removido de la finca' : 'Employee removed from farm');
    setTimeout(() => setFlash(null), 2000);
  };

  const availableEmps = EMPLOYEES.filter(e => !farmEmps.includes(e.id) && e.status !== 'inactive');
  const filteredAvailable = searchQ
    ? availableEmps.filter(e =>
        e.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        e.id.toLowerCase().includes(searchQ.toLowerCase()) ||
        e.cedula.includes(searchQ))
    : availableEmps;

  const navDate = (offset) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + offset);
    setViewDate(d.toLocaleDateString('en-CA'));
  };

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">{t.farm_title}</div>
          <div className="page__subtitle">{t.farm_sub}</div>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          {canManage && (
            <button className="kpi__pill kpi__pill--btn" onClick={() => setShowManage(p => !p)}>
              <Icon name={showManage ? 'x' : 'settings'} size={13} />
              {showManage ? (isES ? 'Cerrar' : 'Close') : (isES ? 'Gestionar' : 'Manage')}
            </button>
          )}
          <button className="kpi__pill kpi__pill--up" onClick={() => setViewDate(today)}>
            <Icon name="refresh" size={12} /> {isES ? 'Hoy' : 'Today'}
          </button>
        </div>
      </div>

      {flash && <div className="flash" style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',zIndex:1000}}>{flash}</div>}

      <div className="audit-toolbar" style={{marginBottom:'16px',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <button className="btn btn--ghost" onClick={() => navDate(-1)} style={{padding:'6px 10px'}}>
            <Icon name="arrowLeft" size={16} />
          </button>
          <span className="mono" style={{fontSize:'16px',fontWeight:600,minWidth:'120px',textAlign:'center',display:'inline-block'}}>
            {viewDate}
          </span>
          <button className="btn btn--ghost" onClick={() => navDate(1)} style={{padding:'6px 10px'}}>
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="kpi__pill kpi__pill--up" onClick={markAllPresent} disabled={totalCount === 0}>
            <Icon name="check" size={12} /> {t.farm_all_present}
          </button>
          <button className="kpi__pill kpi__pill--btn" onClick={clearAll} disabled={totalCount === 0}>
            <Icon name="x" size={12} /> {isES ? 'Limpiar' : 'Clear'}
          </button>
        </div>
      </div>

      <div style={{display:'flex',gap:'16px',marginBottom:'20px'}}>
        <div className="kpi">
          <div className="kpi__value">{presentCount}</div>
          <div className="kpi__label">{isES ? 'Presentes' : 'Present'}</div>
        </div>
        <div className="kpi">
          <div className="kpi__value">{totalCount - presentCount}</div>
          <div className="kpi__label">{isES ? 'Ausentes' : 'Absent'}</div>
        </div>
        <div className="kpi">
          <div className="kpi__value">{totalCount}</div>
          <div className="kpi__label">{isES ? 'Asignados' : 'Assigned'}</div>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="audit-empty">
          <Icon name="users" size={28} stroke={1.2} />
          <div className="audit-empty__title">{t.farm_no_employees}</div>
          <div className="audit-empty__sub">{canManage ? t.farm_no_emps_manage : t.farm_no_emps_admin}</div>
        </div>
      ) : (
        <div className="audit-list">
          {farmEmployeeObjects.map(emp => {
            const present = !!dayRecords[emp.id];
            return (
              <label key={emp.id} className="audit-entry" style={{cursor:'pointer',alignItems:'center',padding:'12px 16px',background:present ? 'rgba(46,204,113,0.04)' : ''}}>
                <div style={{width:'38px',height:'38px',borderRadius:'50%',background: present ? 'var(--ink-700)' : 'var(--ink-200)',display:'grid',placeItems:'center',fontSize:'12px',fontWeight:700,color: present ? 'var(--cream-100)' : 'var(--ink-600)',flexShrink:0,transition:'background .15s'}}>
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
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{fontSize:'12px',color:present ? 'var(--success, #2ecc71)' : 'var(--ink-300)',fontWeight:500,minWidth:'52px',textAlign:'right'}}>
                    {present ? (isES ? 'Sí' : 'Yes') : (isES ? 'No' : 'No')}
                  </span>
                  <div style={{width:'42px',height:'24px',borderRadius:'12px',background:present ? 'var(--ink-700)' : 'var(--ink-200)',position:'relative',transition:'background .15s',flexShrink:0,cursor:'pointer'}}
                    onClick={() => togglePresent(emp.id)}>
                    <div style={{position:'absolute',top:'3px',left:present ? '21px' : '3px',width:'18px',height:'18px',borderRadius:'50%',background:'var(--paper)',transition:'left .15s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}} />
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {showManage && (
        <div className="act-panel" style={{marginTop:'20px'}}>
          <div className="act-panel__head">
            <div className="act-panel__who">
              <div className="act-panel__avatar" style={{background:'var(--ink-700)'}}>
                <Icon name="users" size={16} stroke={2} />
              </div>
              <div>
                <div className="act-panel__name">{isES ? 'Empleados de la finca' : 'Farm employees'}</div>
                <div className="act-panel__dept">{farmEmps.length} {isES ? 'asignados' : 'assigned'}</div>
              </div>
            </div>
          </div>

          {farmEmployeeObjects.length > 0 && (
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
                  <button onClick={() => removeFromFarm(emp.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-300)',padding:'4px',borderRadius:'4px',transition:'color 150ms'}}
                    onMouseOver={e => e.currentTarget.style.color='var(--danger)'}
                    onMouseOut={e => e.currentTarget.style.color='var(--ink-300)'}>
                    <Icon name="x" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="audit-toolbar" style={{borderTop:'1px solid var(--ink-100)',flexDirection:'column',gap:'8px'}}>
            <span className="activity-map__label" style={{width:'100%'}}>
              {isES ? 'Agregar empleado' : 'Add employee'}
            </span>
            <div style={{position:'relative',width:'100%'}}>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder={isES ? 'Buscar empleado…' : 'Search employee…'}
                style={{width:'100%',padding:'9px 12px',border:'1px solid var(--ink-100)',borderRadius:'8px',fontSize:'13px',background:'var(--paper)'}} />
              {searchQ && (
                <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--paper)',border:'1px solid var(--ink-100)',borderRadius:'8px',zIndex:10,maxHeight:'200px',overflowY:'auto',marginTop:'4px',boxShadow:'var(--shadow-md)'}}>
                  {filteredAvailable.length === 0 && (
                    <div style={{padding:'12px',fontSize:'13px',color:'var(--ink-300)',textAlign:'center'}}>
                      {isES ? 'Sin resultados' : 'No results'}
                    </div>
                  )}
                  {filteredAvailable.map(e => (
                    <div key={e.id} onClick={() => { addToFarm(e.id); setSearchQ(''); }}
                      style={{padding:'10px 12px',cursor:'pointer',fontSize:'13px',borderBottom:'1px solid var(--ink-100)',display:'flex',alignItems:'center',gap:'10px'}}
                      onMouseOver={e => e.currentTarget.style.background='var(--cream-50)'}
                      onMouseOut={e => e.currentTarget.style.background=''}>
                      <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'var(--ink-200)',display:'grid',placeItems:'center',fontSize:'10px',fontWeight:700,color:'var(--ink-600)',flexShrink:0}}>
                        {e.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:600}}>{e.name}</div>
                        <div style={{fontSize:'11px',color:'var(--ink-300)'}}><span className="mono">{e.id}</span> · {e.dept}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { FarmView });
