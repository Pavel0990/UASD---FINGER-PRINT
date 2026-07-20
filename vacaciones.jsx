/* vacaciones.jsx — Vacaciones Colectivas */

const VAC_EMP_KEY  = 'uasd_vacaciones_employees';
const VAC_DIAS_KEY = 'uasd_vacaciones_dias';

function getVacDias()   { try { return JSON.parse(localStorage.getItem(VAC_DIAS_KEY) || '{}'); } catch(e) { return {}; } }
function saveVacDias(d) { localStorage.setItem(VAC_DIAS_KEY, JSON.stringify(d)); }

function getVacEmps() {
  try {
    var raw = JSON.parse(localStorage.getItem(VAC_EMP_KEY) || '{}');
    if (Array.isArray(raw)) {
      var yr = String(new Date().getFullYear());
      var m  = {};
      if (raw.length) m[yr] = raw;
      return m;
    }
    return raw && typeof raw === 'object' ? raw : {};
  } catch(e) { return {}; }
}
function saveVacEmps(obj) { localStorage.setItem(VAC_EMP_KEY, JSON.stringify(obj)); }

/* ── VacacionesView ── */
function VacacionesView({ t, lang, setRoute }) {
  const isES = lang === 'es';

  /* Lock scroll while mounted */
  React.useEffect(function() {
    const html = document.documentElement;
    const body = document.body;
    const prevH = html.style.overflow;
    const prevB = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return function() {
      html.style.overflow = prevH;
      body.style.overflow = prevB;
    };
  }, []);

  /* ── State ── */
  const [vacEmpsAll, setVacEmpsAll] = React.useState(getVacEmps);
  const [vacDias,    setVacDias]    = React.useState(getVacDias);
  const [selYear,    setSelYear]    = React.useState(String(new Date().getFullYear()));

  // Con backend activo, se hidrata el año seleccionado desde /api/collective-vacations
  // apenas carga o cambia selYear — arranca de localStorage (arriba) para no dejar la
  // pantalla en blanco mientras responde.
  React.useEffect(() => {
    if (!(typeof isBackendActive === 'function' && isBackendActive())) return;
    apiGetCollectiveVacations(selYear).then((period) => {
      setVacDias(prev => ({ ...prev, [selYear]: period.days }));
      setVacEmpsAll(prev => ({ ...prev, [selYear]: period.employeeIds }));
    }).catch(err => console.error('cargar vacaciones colectivas', err));
  }, [selYear]);

  const [yearCalOpen,  setYearCalOpen]  = React.useState(false);
  const [yearCalReady, setYearCalReady] = React.useState(false);
  const [yearCalClosing, setYearCalClosing] = React.useState(false);
  const [yearCalMonth, setYearCalMonth] = React.useState(11);
  const [yearCalYear,  setYearCalYear]  = React.useState(new Date().getFullYear());
  const [yearCalPos,   setYearCalPos]   = React.useState({top:0,left:0});
  const yearPillRef = React.useRef(null);
  const yearCalRef  = React.useRef(null);

  const [searchQ,    setSearchQ]    = React.useState(false);
  const [searchVal,  setSearchVal]  = React.useState('');
  const [rangeStart, setRangeStart] = React.useState(null);
  const [rangeHover, setRangeHover] = React.useState(null);
  const [flash,      setFlash]      = React.useState(null);
  const flashTimerRef = React.useRef(null);

  /* ── Derived ── */
  const yearEmps = React.useMemo(function() {
    return vacEmpsAll[selYear] || [];
  }, [vacEmpsAll, selYear]);

  const vacEmpObjects = React.useMemo(function() {
    return yearEmps
      .map(function(id) { return EMPLOYEES.find(function(e) { return e.id === id; }); })
      .filter(Boolean);
  }, [yearEmps]);

  const yearDias = React.useMemo(function() {
    return vacDias[selYear] || [];
  }, [vacDias, selYear]);

  const totalCount = vacEmpObjects.length;

  const canManage = typeof userHasPermission === 'function'
    ? (userHasPermission('vacaciones') || userHasPermission('admin'))
    : true;

  /* ── Effects ── */
  React.useEffect(function() {
    return function() { if (flashTimerRef.current) clearTimeout(flashTimerRef.current); };
  }, []);

  React.useEffect(function() {
    setYearCalMonth(11);
    setYearCalYear(parseInt(selYear));
    setYearCalOpen(false);
  }, [selYear]);

  /* Calcula posición en useEffect — getBoundingClientRect corre DESPUÉS del
     commit de React, no durante el click, evitando el reflow síncrono que
     causaba el salto de layout al abrir el calendario */
  React.useEffect(function() {
    if (yearCalOpen) {
      if (yearPillRef.current) {
        var r = yearPillRef.current.getBoundingClientRect();
        setYearCalPos({ top: r.bottom + 6, left: r.left + r.width / 2 });
      }
      setYearCalReady(true);
      setYearCalClosing(false);
    } else if (yearCalReady) {
      setYearCalClosing(true);
      var id = setTimeout(function() { setYearCalClosing(false); setYearCalReady(false); }, 220);
      return function() { clearTimeout(id); };
    }
  }, [yearCalOpen]);

  React.useEffect(function() {
    if (!yearCalOpen) return;
    var onResize = function() {
      if (yearPillRef.current) {
        var r = yearPillRef.current.getBoundingClientRect();
        setYearCalPos({ top: r.bottom + 6, left: r.left + r.width / 2 });
      }
    };
    window.addEventListener('resize', onResize);
    return function() { window.removeEventListener('resize', onResize); };
  }, [yearCalOpen]);

  React.useEffect(function() {
    if (!yearCalOpen) return;
    var onOut = function(e) {
      if (yearPillRef.current && yearPillRef.current.contains(e.target)) return;
      if (yearCalRef.current  && yearCalRef.current.contains(e.target))  return;
      setYearCalOpen(false);
    };
    document.addEventListener('mousedown', onOut);
    return function() { document.removeEventListener('mousedown', onOut); };
  }, [yearCalOpen]);

  React.useEffect(function() {
    if (!rangeStart) return;
    var onKey = function(e) { if (e.key === 'Escape') { setRangeStart(null); setRangeHover(null); } };
    document.addEventListener('keydown', onKey);
    return function() { document.removeEventListener('keydown', onKey); };
  }, [rangeStart]);

  /* ── Helpers ── */
  const showFlash = function(msg) {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlash(msg);
    flashTimerRef.current = setTimeout(function() { setFlash(null); }, 2000);
  };

  const openYearCal = function() {
    setYearCalOpen(function(o) { return !o; });
  };

  const fmtPeriodLabel = function() {
    if (!yearDias.length) return '';
    var a   = yearDias[0].split('-').map(Number);
    var b   = yearDias[yearDias.length - 1].split('-').map(Number);
    var MES = MONTHS_ES || [];
    if (isES) {
      var pa = a[2] + ' ' + (MES[a[1]-1] || '').slice(0,3) + (a[0] !== parseInt(selYear) ? '. ' + a[0] : '.');
      var pb = b[2] + ' ' + (MES[b[1]-1] || '').slice(0,3) + (b[0] !== parseInt(selYear) ? '. ' + b[0] : '.');
      if (a[1] === b[1] && a[0] === b[0]) {
        return a[2] + '–' + b[2] + ' ' + (MES[a[1]-1] || '') + (a[0] !== parseInt(selYear) ? ' ' + a[0] : '');
      }
      return pa + ' – ' + pb;
    }
    var fa = new Date(a[0], a[1]-1, a[2]);
    var fb = new Date(b[0], b[1]-1, b[2]);
    return fa.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' – ' + fb.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  };

  /* ── Vacation day selection ── */
  const handleVacClick = function(iso) {
    if (!canManage) return;
    if (!rangeStart) { setRangeStart(iso); return; }
    if (rangeStart === iso) { setRangeStart(null); setRangeHover(null); return; }
    var a = rangeStart < iso ? rangeStart : iso;
    var b = rangeStart < iso ? iso : rangeStart;
    var dates = [];
    var cur = new Date(a + 'T00:00:00');
    var end = new Date(b + 'T00:00:00');
    while (cur <= end) { dates.push(cur.toLocaleDateString('en-CA')); cur.setDate(cur.getDate()+1); }
    var yr       = selYear;
    var existing = vacDias[yr] || [];
    var isSame   = existing.length === dates.length &&
                   existing[0] === dates[0] &&
                   existing[existing.length - 1] === dates[dates.length - 1];
    var next     = isSame ? [] : dates;
    var updated  = Object.assign({}, vacDias);
    if (next.length) updated[yr] = next; else delete updated[yr];
    setVacDias(updated);
    if (typeof isBackendActive === 'function' && isBackendActive()) {
      apiSetCollectiveVacationDays(yr, next).catch(err => console.error('guardar dias vacaciones', err));
    } else {
      saveVacDias(updated);
    }
    setRangeStart(null);
    setRangeHover(null);
    setYearCalOpen(false);
    showFlash(isSame
      ? (isES ? 'Período eliminado' : 'Period cleared')
      : (isES ? 'Días guardados'   : 'Days saved'));
  };

  /* ── Roster management ── */
  const addToVac = function(empId) {
    if (yearEmps.includes(empId)) return;
    var list    = yearEmps.concat([empId]);
    var updated = Object.assign({}, vacEmpsAll);
    updated[selYear] = list;
    setVacEmpsAll(updated);
    if (typeof isBackendActive === 'function' && isBackendActive()) {
      apiAddCollectiveVacationEmployees(selYear, [empId]).catch(err => console.error('agregar a vacaciones', err));
    } else {
      saveVacEmps(updated);
    }
    setSearchVal('');
  };

  const addAllToVac = function() {
    var newIds = filteredAvailable.map(function(e) { return e.id; }).filter(function(id) { return !yearEmps.includes(id); });
    if (!newIds.length) return;
    var list = yearEmps.concat(newIds);
    var updated = Object.assign({}, vacEmpsAll);
    updated[selYear] = list;
    setVacEmpsAll(updated);
    if (typeof isBackendActive === 'function' && isBackendActive()) {
      apiAddCollectiveVacationEmployees(selYear, newIds).catch(err => console.error('agregar todos a vacaciones', err));
    } else {
      saveVacEmps(updated);
    }
    setSearchVal('');
  };

  const removeFromVac = function(empId) {
    var list    = yearEmps.filter(function(id) { return id !== empId; });
    var updated = Object.assign({}, vacEmpsAll);
    if (list.length) updated[selYear] = list;
    else delete updated[selYear];
    setVacEmpsAll(updated);
    if (typeof isBackendActive === 'function' && isBackendActive()) {
      apiRemoveCollectiveVacationEmployee(selYear, empId).catch(err => console.error('quitar de vacaciones', err));
    } else {
      saveVacEmps(updated);
    }
  };

  const removeAllFromVac = function() {
    if (!yearEmps.length) return;
    var updated = Object.assign({}, vacEmpsAll);
    delete updated[selYear];
    setVacEmpsAll(updated);
    if (typeof isBackendActive === 'function' && isBackendActive()) {
      apiRemoveAllCollectiveVacationEmployees(selYear).catch(err => console.error('quitar todos de vacaciones', err));
    } else {
      saveVacEmps(updated);
    }
  };

  /* ── Employee search ── */
  const availableEmps = React.useMemo(function() {
    return EMPLOYEES.filter(function(e) { return !yearEmps.includes(e.id) && e.status === 'ok'; });
  }, [yearEmps]);

  const filteredAvailable = React.useMemo(function() {
    if (!searchVal) return availableEmps;
    var q = searchVal.toLowerCase();
    return availableEmps.filter(function(e) {
      return e.name.toLowerCase().includes(q) ||
             e.id.toLowerCase().includes(q)   ||
             (e.cedula || '').includes(searchVal);
    });
  }, [availableEmps, searchVal]);

  /* ── Render ── */
  return (
    <div className="page">

      {/* page__head */}
      <div className="page__head" style={{marginBottom:24,position:'relative'}}>
        <div>
          <div className="page__title">{isES ? 'Vacaciones Colectivas' : 'Collective Vacation'}</div>
          <div className="page__subtitle">{isES ? 'Gestión del personal en período vacacional colectivo' : 'Staff management during collective vacation period'}</div>
        </div>
        {/* Pill column — position:absolute saca el pill del flujo flex → cero layout shift */}
        <div style={{position:'absolute',right:0,top:'50%',transform:'translateY(-50%)'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,width:'140px'}}>
          <span style={{fontFamily:'var(--font-serif)',fontSize:13,fontWeight:700,
            letterSpacing:'-0.02em',textTransform:'none',color:'var(--ink-500)',lineHeight:1}}>
            {isES ? 'Período' : 'Period'}
          </span>
          <div ref={yearPillRef}
            className="farm-date-pill"
            onMouseDown={function(e){ e.preventDefault(); }}
            style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              border:'1px solid '+(yearCalOpen?'#4a6fa5':'var(--ink-200)'),
              borderRadius:8,padding:'4px 6px',
              background:'var(--paper)',width:140,boxSizing:'border-box',flexShrink:0,
              transition:'background .15s,border-color .2s,box-shadow .2s'}}>
            <button tabIndex={-1} className="dp-cal__arrow" onClick={function() { setSelYear(function(y) { return String(parseInt(y)-1); }); }}>‹</button>
            <button tabIndex={-1} type="button"
              onClick={openYearCal}
              style={{fontFamily:'var(--font-mono)',fontSize:15,fontWeight:700,
                color:'var(--ink-800)',flex:1,textAlign:'center',background:'none',
                border:'none',cursor:'pointer',padding:'0 4px'}}>
              {selYear}
            </button>
            <button tabIndex={-1} className="dp-cal__arrow" onClick={function() { setSelYear(function(y) { return String(parseInt(y)+1); }); }}>›</button>
          </div>
          <span style={{display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap',
            fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,color:'var(--ink-400)',
            letterSpacing:0,marginTop:2,marginBottom:4,
            visibility: yearDias.length > 0 ? 'visible' : 'hidden',
            transition:'opacity .2s ease',
            opacity: yearDias.length > 0 ? 1 : 0}}>
            {yearDias.length > 0 ? fmtPeriodLabel() : '– –'}
            <span style={{color:'var(--ink-200)'}}>·</span>
            <span>{yearDias.length > 0 ? yearDias.length : 0} {isES ? 'días' : 'days'}</span>
          </span>
          </div>

          {/* Year calendar portal */}
          {ReactDOM.createPortal(
            <div onMouseDown={function(e) { if(yearCalOpen) e.preventDefault(); }}
              style={{position:'fixed',top:yearCalPos.top,left:yearCalPos.left,
                transform:'translateX(-50%)',zIndex:9999,
                pointerEvents:(yearCalOpen || yearCalClosing) && yearCalReady ? 'auto' : 'none',
                visibility:(yearCalOpen || yearCalClosing) && yearCalReady ? 'visible' : 'hidden'}}>
              <div ref={yearCalRef} className="dp-cal" style={{
                boxShadow:'0 16px 48px rgba(0,0,0,.18)',
                animation: yearCalClosing ? 'dp-close-vac 0.22s cubic-bezier(0.4,0,1,1) both' : (yearCalOpen && yearCalReady) ? 'dp-open-vac 0.22s cubic-bezier(0.16,1,0.3,1) both' : 'none'}}>
                {(function() {
                  var firstDow = new Date(yearCalYear, yearCalMonth, 1).getDay();
                  var daysInMo = new Date(yearCalYear, yearCalMonth+1, 0).getDate();
                  var vacSet   = {};
                  (vacDias[selYear] || []).forEach(function(d) { vacSet[d] = true; });
                  var MONTHS_C = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
                  var DOW_C    = ['D','L','M','X','J','V','S'];
                  var prevMo   = function() {
                    if (yearCalMonth === 0) { setYearCalMonth(11); setYearCalYear(function(y) { return y-1; }); }
                    else { setYearCalMonth(function(m) { return m-1; }); }
                  };
                  var nextMo   = function() {
                    if (yearCalMonth === 11) { setYearCalMonth(0); setYearCalYear(function(y) { return y+1; }); }
                    else { setYearCalMonth(function(m) { return m+1; }); }
                  };
                  return (
                    <React.Fragment>
                      <div className="dp-cal__nav">
                        <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={prevMo}>‹</button>
                        <span className="dp-cal__month">{MONTHS_C[yearCalMonth]} {yearCalYear}</span>
                        <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={nextMo}>›</button>
                      </div>
                      <div className="dp-cal__grid">
                        {DOW_C.map(function(d) { return <span key={d} className="dp-cal__dow">{d}</span>; })}
                        {Array.from({length:firstDow}).map(function(_,i) { return <span key={'b'+i}/>; })}
                        {Array.from({length:daysInMo},function(_,i) {
                          var d   = i + 1;
                          var iso = String(yearCalYear)+'-'+String(yearCalMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
                          var isSaved = !!vacSet[iso];
                          var rLo = rangeStart && rangeHover ? (rangeStart < rangeHover ? rangeStart : rangeHover) : null;
                          var rHi = rangeStart && rangeHover ? (rangeStart < rangeHover ? rangeHover : rangeStart) : null;
                          var dayStyle = {};
                          var inRange  = false;
                          if (rLo && rHi) {
                            if (iso === rLo && iso === rHi) {
                              dayStyle = {background:'var(--ink-800)',color:'#fff',fontWeight:700,borderRadius:'6px'}; inRange=true;
                            } else if (iso === rLo) {
                              dayStyle = {background:'rgba(22,27,51,0.10)',borderRadius:'6px 0 0 6px',fontWeight:600}; inRange=true;
                            } else if (iso === rHi) {
                              dayStyle = {background:'rgba(22,27,51,0.10)',borderRadius:'0 6px 6px 0',fontWeight:600}; inRange=true;
                            } else if (iso > rLo && iso < rHi) {
                              dayStyle = {background:'rgba(22,27,51,0.10)'}; inRange=true;
                            }
                          } else if (rangeStart === iso) {
                            dayStyle = {background:'var(--ink-800)',color:'#fff',fontWeight:700,borderRadius:'6px'};
                            inRange = true;
                          }
                          return (
                            <button tabIndex={-1} type="button" key={d}
                              className={'dp-cal__day'+(isSaved&&!inRange?' dp-cal__day--sel':'')}
                              onClick={function() { handleVacClick(iso); }}
                              onMouseEnter={rangeStart ? function() { setRangeHover(iso); } : undefined}
                              onMouseLeave={rangeStart ? function() { setRangeHover(null); } : undefined}
                              style={Object.assign({cursor:canManage?'pointer':'default',position:'relative'},dayStyle)}>
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </React.Fragment>
                  );
                })()}
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Roster */}
      <div style={{background:'var(--paper)',border:'1px solid var(--ink-100)',
        borderRadius:'14px',padding:'16px 20px',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
      <div className="activity-map__left" style={{gap:0,width:'100%'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',width:'100%',paddingBottom:'4px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
              <span className="activity-map__label" style={{margin:0,flexShrink:0,color:'var(--ink-600)'}}>
                {isES ? 'Personal' : 'Staff'}
                <span className="mono" style={{fontWeight:600,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',
                  textTransform:'none',letterSpacing:0}}>
                  ({totalCount})
                </span>
              </span>
              {canManage && (
                <div style={{display:'flex',gap:6}}>
                  {searchQ && (
                    <button
                      className={yearEmps.length > 0 ? 'kpi__pill kpi__pill--btn kpi__pill--btn--close' : 'kpi__pill kpi__pill--up'}
                      style={{padding:'9px 14px',fontSize:'12px',gap:'5px',justifyContent:'center',whiteSpace:'nowrap'}}
                      onClick={yearEmps.length > 0 ? removeAllFromVac : addAllToVac}>
                      <Icon name={yearEmps.length > 0 ? 'x' : 'check'} size={14} stroke={yearEmps.length > 0 ? 1.6 : 2.4}/>
                      {yearEmps.length > 0
                        ? (isES ? 'Eliminar todos' : 'Remove all')
                        : (isES ? 'Seleccionar todos' : 'Select all')}
                    </button>
                  )}
                  <button
                    className={'kpi__pill kpi__pill--btn'+(searchQ ? ' kpi__pill--btn--close' : '')}
                    style={{padding:'9px 18px',fontSize:'13px',gap:'7px',justifyContent:'center',width:'140px',boxSizing:'border-box',
                      transition:'background .25s ease, color .25s ease, border-color .25s ease, transform .3s cubic-bezier(0.22,1,0.36,1)'}}
                    onClick={function() { setSearchQ(function(p) { return !p; }); setSearchVal(''); }}>
                    <Icon name={searchQ ? 'x' : 'userPlus'} size={15}/>
                    {searchQ ? (isES ? 'Cerrar' : 'Close') : (isES ? 'Agregar' : 'Add')}
                  </button>
                </div>
              )}
            </div>

            {/* Collapsible search */}
            <div style={{maxHeight: searchQ ? '300px' : '0', overflow:'hidden',
              transition:'max-height .5s cubic-bezier(0.33,1,0.68,1)'}}>
              <div style={{opacity: searchQ ? 1 : 0,
                transform: searchQ ? 'translateY(0)' : 'translateY(-6px)',
                transition: searchQ
                  ? 'opacity .35s ease .08s, transform .4s cubic-bezier(0.22,1,0.36,1) .06s'
                  : 'opacity .2s ease, transform .25s ease',
                paddingTop:'4px', width:'100%', display:'flex', flexDirection:'column', gap:'6px'}}>
                <div className="toolbar__search" style={{width:'100%'}}>
                  <span className="toolbar__search-icon"><Icon name="search" size={15}/></span>
                  <input value={searchVal} onChange={function(e) { setSearchVal(e.target.value); }}
                    placeholder={isES ? 'Buscar empleado…' : 'Search employee…'}
                    autoFocus style={{background:'var(--paper)'}}/>
                  {searchVal && (
                    <button className="toolbar__search-clear"
                      onClick={function() { setSearchVal(''); }} aria-label="Limpiar">
                      <Icon name="x" size={13} stroke={2.4}/>
                    </button>
                  )}
                </div>
                <div style={{background:'var(--paper)',border:'1px solid var(--ink-100)',
                  borderRadius:'10px',maxHeight:'200px',overflowY:'auto',boxShadow:'var(--shadow-md)'}}>
                  {filteredAvailable.length === 0 ? (
                    <div style={{padding:'12px',fontSize:'13px',color:'var(--ink-300)',textAlign:'center'}}>
                      {isES ? 'Sin resultados' : 'No results'}
                    </div>
                  ) : filteredAvailable.map(function(e) {
                    return (
                      <button key={e.id} onClick={function() { addToVac(e.id); }}
                        style={{display:'block',width:'100%',textAlign:'left',padding:'10px 14px',
                          fontSize:'13px',border:'none',background:'transparent',outline:'none',
                          cursor:'pointer',transition:'background .1s'}}
                        onMouseEnter={function(ev) { ev.currentTarget.style.background = 'var(--cream-50)'; }}
                        onMouseLeave={function(ev) { ev.currentTarget.style.background = 'transparent'; }}>
                        <div style={{fontWeight:600}}>{e.name}</div>
                        <div style={{fontSize:'11px',color:'var(--ink-300)'}}>
                          <span className="mono">{e.id}</span> &middot; {e.dept}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {totalCount === 0 && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',gap:16,padding:'80px 24px',textAlign:'center',
              color:'var(--ink-300)',minHeight:320,animation:'body-in .2s ease both'}}>
              <Icon name="absent" size={48} stroke={1.2}/>
              <div style={{fontSize:20,fontWeight:600,color:'var(--ink-500)'}}>
                {isES ? 'Sin vacaciones configuradas' : 'No vacation roster'}
              </div>
              <div style={{fontSize:14,color:'var(--ink-300)',maxWidth:320,lineHeight:1.5}}>
                {canManage
                  ? (isES
                    ? 'Asigna el personal que tomará vacaciones colectivas en este período.'
                    : 'Assign the staff taking collective vacation during this period.')
                  : (isES
                    ? 'Contacta a un administrador para configurar el año ' + selYear + '.'
                    : 'Contact an administrator to configure ' + selYear + '.')}
              </div>
            </div>
          )}

          {/* Employee list — no presence toggles */}
          {totalCount > 0 && (
            <div style={{display:'flex',flexDirection:'column'}}>
              {vacEmpObjects.map(function(emp, idx) {
                return (
                  <div key={emp.id} style={{animation:'roster-in .32s cubic-bezier(0.22,1,0.36,1) both',
                    animationDelay:(idx * 0.04)+'s'}}>
                    <div className="audit-entry role-assignee-row"
                      style={{alignItems:'center',padding:'14px 0',
                        borderTop: idx === 0 ? 'none' : '1px solid var(--ink-100)'}}>
                      <span className="mono" style={{width:'22px',flexShrink:0,fontSize:'12px',fontWeight:600,
                        color:'var(--ink-300)',textAlign:'right',marginRight:'2px'}}>
                        {String(idx + 1).padStart(2,'0')}
                      </span>
                      <div style={{width:'38px',height:'38px',borderRadius:'50%',flexShrink:0,
                        display:'grid',placeItems:'center',fontSize:'13px',fontWeight:700,
                        background:'var(--ink-200)',color:'var(--ink-600)'}}>
                        {emp.name.split(' ').slice(0,2).map(function(p) { return p[0]; }).join('').toUpperCase()}
                      </div>
                      <div className="audit-entry__body">
                        <div className="audit-entry__row" style={{marginBottom:'3px'}}>
                          <span style={{fontWeight:600,fontSize:'14px'}}>{emp.name}</span>
                        </div>
                        <div className="audit-entry__row" style={{marginBottom:0,gap:'5px'}}>
                          <span className="az__dept">{emp.dept}</span>
                          <span className="az__last" style={{fontSize:'11px'}}>
                            &middot; <span className="mono">{emp.id}</span>
                          </span>
                        </div>
                      </div>
                      {canManage && (
                        <div className="role-assignee-actions" style={{display:'flex',flexShrink:0}}>
                          <button className="table__action-btn table__action-btn--del"
                            onClick={function() { removeFromVac(emp.id); }}
                            title={isES ? 'Quitar de vacaciones' : 'Remove from vacation'}
                            style={{width:'28px',height:'28px'}}>
                            <Icon name="trash" size={13}/>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Flash toast */}
          {flash && (
            <div style={{alignSelf:'center',marginTop:'10px',display:'flex',alignItems:'center',gap:'7px',
              whiteSpace:'nowrap',pointerEvents:'none',
              background:'var(--ink-800)',color:'var(--cream-100)',
              padding:'10px 18px',borderRadius:'999px',
              fontFamily:'var(--font-sans)',fontSize:'12px',fontWeight:600,letterSpacing:'.04em',
              animation:'flashFincaLife 2s ease both'}}>
              <Icon name="check" size={13} stroke={3.2}/>
              {flash}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
