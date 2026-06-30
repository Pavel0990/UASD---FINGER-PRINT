/* roles.jsx — administración de roles y perfiles de administradores */

const ROLES_KEY = 'uasd_roles_v1';
const ASSIGN_KEY = 'uasd_role_assignments_v1';
const CRED_KEY = 'uasd_credentials_v1';
const CURR_USER_KEY = 'uasd_current_user';
const ROLE_SEED_VER = 'uasd_role_seed_v4';

const SEED_ROLES = [
  { id: 'role_admin', name: 'Administrador', description: 'Acceso completo a todas las funciones del sistema.', color: '#8b2942', perms: ['enroll','reports','manage','roles','audit','farm','kiosk_admin'] },
  { id: 'role_hr', name: 'Recursos Humanos', description: 'Registro de empleados, captura de huellas y reportes.', color: '#2C3E66', perms: ['enroll','reports','manage','farm'] },
  { id: 'role_viewer', name: 'Solo lectura', description: 'Acceso solo a reportes y control de actividad.', color: '#5a6a90', perms: ['reports','audit'] },
];

const SEED_ASSIGNMENTS = [
  { empId: 'EMP-00702', roleId: 'role_admin' },
  { empId: 'EMP-00601', roleId: 'role_admin' },
  { empId: 'EMP-00187', roleId: 'role_hr' },
  { empId: 'EMP-00103', roleId: 'role_viewer' },
];

const ALL_PERMS = [
  { id: 'enroll',       label_es: 'Registrar huellas',       label_en: 'Enroll fingerprints' },
  { id: 'reports',      label_es: 'Ver reportes',            label_en: 'View reports' },
  { id: 'manage',       label_es: 'Gestionar empleados',     label_en: 'Manage employees' },
  { id: 'roles',        label_es: 'Gestionar roles',         label_en: 'Manage roles' },
  { id: 'audit',        label_es: 'Control de actividad',    label_en: 'Activity log' },
  { id: 'farm',         label_es: 'Control de finca',        label_en: 'Farm control' },
  { id: 'kiosk_admin',  label_es: 'Panel del terminal',      label_en: 'Kiosk admin panel' },
];

(function seedRoles() {
  if (localStorage.getItem(ROLE_SEED_VER)) return;
  const existingRoles = getRoles();
  const roles = existingRoles.length ? existingRoles.map(r => {
    const perms = Array.isArray(r.perms) ? r.perms : [];
    if ((r.id === 'role_admin' || r.id === 'role_hr') && !perms.includes('farm')) {
      return { ...r, perms: [...perms, 'farm'] };
    }
    if (perms !== r.perms) return { ...r, perms };
    return r;
  }) : SEED_ROLES;
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  if (!localStorage.getItem(ASSIGN_KEY)) {
    localStorage.setItem(ASSIGN_KEY, JSON.stringify(SEED_ASSIGNMENTS));
  }
  const creds = {};
  SEED_ASSIGNMENTS.forEach(a => {
    const emp = EMPLOYEES.find(e => e.id === a.empId);
    if (emp) creds[a.empId] = { email: emp.email, password: 'Uasd2026' };
  });
  localStorage.setItem(CRED_KEY, JSON.stringify({ ...creds, ...getCredentials() }));
  localStorage.setItem(ROLE_SEED_VER, '1');
})();

function getCredentials() {
  try { return JSON.parse(localStorage.getItem(CRED_KEY) || '{}'); } catch { return {}; }
}

function saveCredential(empId, email, password) {
  const creds = getCredentials();
  creds[empId] = { email, password };
  localStorage.setItem(CRED_KEY, JSON.stringify(creds));
}

function getCurrentUserId() {
  return localStorage.getItem(CURR_USER_KEY) || '';
}

function setCurrentUserId(id) {
  if (id) localStorage.setItem(CURR_USER_KEY, id);
  else localStorage.removeItem(CURR_USER_KEY);
}

function userHasPermission(perm) {
  const uid = getCurrentUserId();
  if (!uid) return true; // dev mode: no user logged in → show everything
  const assign = getAssignments();
  const roles = getRoles();
  const asgn = assign.find(a => a.empId === uid);
  if (!asgn) return false;
  const role = roles.find(r => r.id === asgn.roleId);
  return role ? role.perms.includes(perm) : false;
}

function getRoles() {
  try { return JSON.parse(localStorage.getItem(ROLES_KEY) || 'null') || SEED_ROLES; } catch { return SEED_ROLES; }
}

function saveRoles(roles) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

function getAssignments() {
  try { return JSON.parse(localStorage.getItem(ASSIGN_KEY) || 'null') || SEED_ASSIGNMENTS; } catch { return SEED_ASSIGNMENTS; }
}

function saveAssignments(asgn) {
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(asgn));
}

function getCurrentUserProfile() {
  const uid = getCurrentUserId() || 'EMP-00601';
  const employee = EMPLOYEES.find(e => e.id === uid) || EMPLOYEES.find(e => e.id === 'EMP-00601') || EMPLOYEES[0];
  const assignment = getAssignments().find(a => a.empId === employee?.id);
  const role = assignment ? getRoles().find(r => r.id === assignment.roleId) : null;
  return { employee, role, assignment };
}

window.getCredentials = getCredentials;
window.saveCredential = saveCredential;
window.getCurrentUserId = getCurrentUserId;
window.setCurrentUserId = setCurrentUserId;
window.userHasPermission = userHasPermission;
window.getRoles = getRoles;
window.getAssignments = getAssignments;
window.getCurrentUserProfile = getCurrentUserProfile;
window.ALL_PERMS = ALL_PERMS;

function RolesView({ t, setRoute }) {
  const [roles, setRoles]       = React.useState(getRoles);
  const [assign, setAssign]     = React.useState(getAssignments);
  const [selRole, setSelRole]   = React.useState(null);

  React.useEffect(() => {
    if (!userHasPermission('roles')) setRoute('dashboard');
  }, []);
  const [editing, setEditing]   = React.useState(null);
  const [showAssign, setShowAssign] = React.useState(false);
  const [assignQ, setAssignQ]   = React.useState('');
  const [assignRole, setAssignRole] = React.useState('');
  const [assignEmp, setAssignEmp]   = React.useState(null);
  const [assignEmail, setAssignEmail] = React.useState('');
  const [assignPass, setAssignPass]   = React.useState('');
  const [assignShowPass, setAssignShowPass] = React.useState(false);
  const [editCred, setEditCred]     = React.useState(null);
  const [editCredEmail, setEditCredEmail] = React.useState('');
  const [editCredPass, setEditCredPass]   = React.useState('');
  const [editCredShowPass, setEditCredShowPass] = React.useState(false);
  const [flash, setFlash]       = React.useState(null);
  const isES = t.appName === 'Sistema de Registro Biométrico';

  React.useEffect(() => { setAssignRole(selRole || ''); }, [selRole]);

  const curRole = selRole && roles.find(r => r.id === selRole);

  const roleAssignees = assign.filter(a => a.roleId === selRole).map(a => {
    const emp = EMPLOYEES.find(e => e.id === a.empId);
    return { ...a, emp };
  });

  const employeesNoRole = EMPLOYEES.filter(e => !assign.some(a => a.empId === e.id));

  const filteredEmployees = assignQ
    ? employeesNoRole.filter(e =>
        e.name.toLowerCase().includes(assignQ.toLowerCase()) ||
        e.id.toLowerCase().includes(assignQ.toLowerCase()) ||
        e.cedula.includes(assignQ))
    : employeesNoRole;

  const permLabel = (pid) => {
    const p = ALL_PERMS.find(x => x.id === pid);
    if (!p) return pid;
    return isES ? p.label_es : p.label_en;
  };

  const startEdit = (role) => {
    setEditing({ ...(role || { id: '', name: '', description: '', color: '#2C3E66', perms: ['reports'] }) });
  };

  const saveEdit = () => {
    if (!editing.name.trim()) return;
    let list = [...roles];
    if (editing.id) {
      const idx = list.findIndex(r => r.id === editing.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...editing };
    } else {
      const nid = 'role_' + Date.now().toString(36);
      list.push({ ...editing, id: nid, perms: editing.perms || [] });
    }
    saveRoles(list);
    setRoles(list);
    setEditing(null);
    setFlash(editing.id ? 'Rol actualizado' : 'Rol creado');
    setTimeout(() => setFlash(null), 2000);
  };

  const deleteRole = (rid) => {
    if (!confirm('¿Eliminar este rol? Las asignaciones vinculadas se perderán.')) return;
    let list = roles.filter(r => r.id !== rid);
    let asgn = assign.filter(a => a.roleId !== rid);
    saveRoles(list);
    saveAssignments(asgn);
    setRoles(list);
    setAssign(asgn);
    if (selRole === rid) setSelRole(null);
    setFlash('Rol eliminado');
    setTimeout(() => setFlash(null), 2000);
  };

  const startAssign = (emp) => {
    const creds = getCredentials();
    const existing = creds[emp.id];
    setAssignEmp(emp);
    setAssignEmail(existing?.email || emp.email || '');
    setAssignPass('');
    setAssignQ('');
  };

  const confirmAssign = () => {
    if (!assignEmp || !assignRole) return;
    if (!assignEmail.trim() || !assignPass.trim()) { setFlash(isES?'Correo y contraseña obligatorios':'Email and password required'); setTimeout(()=>setFlash(null),2000); return; }
    if (assignPass.length < 6) { setFlash(isES?'La contraseña debe tener al menos 6 caracteres':'Password must be at least 6 characters'); setTimeout(()=>setFlash(null),2000); return; }
    saveCredential(assignEmp.id, assignEmail.trim(), assignPass);
    const asgn = [...assign, { empId: assignEmp.id, roleId: assignRole }];
    saveAssignments(asgn);
    setAssign(asgn);
    setAssignEmp(null);
    setAssignEmail('');
    setAssignPass('');
    setShowAssign(false);
  };

  const removeAssign = (empId, roleId) => {
    const asgn = assign.filter(a => !(a.empId === empId && a.roleId === roleId));
    saveAssignments(asgn);
    setAssign(asgn);
  };

  const saveEditCred = () => {
    if (!editCred) return;
    if (!editCredEmail.trim() || !editCredPass.trim()) { setFlash(isES?'Correo y contraseña obligatorios':'Email and password required'); setTimeout(()=>setFlash(null),2000); return; }
    if (editCredPass.length < 6) { setFlash(isES?'La contraseña debe tener al menos 6 caracteres':'Password must be at least 6 characters'); setTimeout(()=>setFlash(null),2000); return; }
    saveCredential(editCred, editCredEmail.trim(), editCredPass);
    setEditCred(null);
    setFlash(isES?'Credenciales actualizadas':'Credentials updated');
    setTimeout(() => setFlash(null), 2000);
  };

  const togglePerm = (pid) => {
    if (!editing) return;
    const list = editing.perms.includes(pid)
      ? editing.perms.filter(p => p !== pid)
      : [...editing.perms, pid];
    setEditing({ ...editing, perms: list });
  };

  return (
    <div className="page" style={{ animation:'body-in .28s cubic-bezier(0.33,1,0.68,1) both' }}>
      <div className="page__head">
        <div>
          <div className="page__title">{t.nav_roles}</div>
          <div className="page__subtitle">{isES ? 'Gestión de roles y permisos de administradores' : 'Admin role and permission management'}</div>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <button className="kpi__pill kpi__pill--up" onClick={() => startEdit()}>
            + {isES ? 'Nuevo rol' : 'New role'}
          </button>
        </div>
      </div>

      <div className="activity-map" style={{gridTemplateColumns:'320px 1fr'}}>
        <div className="activity-map__left">
          <div className="activity-map__label">
            {isES ? 'Roles definidos' : 'Defined roles'}
            <span style={{fontWeight:400,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',textTransform:'none',letterSpacing:0}}>
              ({roles.length})
            </span>
          </div>
          <div className="activity-map__grid">
            {roles.map(role => {
              const count = assign.filter(a => a.roleId === role.id).length;
              const isActive = selRole === role.id;
              const initials = role.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
              return (
                <button key={role.id}
                  className={`az ${isActive ? 'az--active' : ''}`}
                  onClick={() => setSelRole(role.id)}
                  aria-pressed={isActive}>
                  <div className="az__avatar" style={{background:role.color}}>
                    {initials}
                  </div>
                  <div className="az__name">{role.name}</div>
                  <div className="az__dept">{role.description}</div>
                  <div className="az__meta">
                    <span className="az__count">{count} {isES ? (count===1?'asignado':'asignados') : (count===1?'assigned':'assigned')}</span>
                  </div>
                  {isActive && <div className="az__active-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="act-panel">
          {editing ? (
            <div className="audit-toolbar" style={{flexDirection:'column',alignItems:'stretch'}}>
              <div className="act-panel__who">
                <div className="act-panel__avatar" style={{background:editing.color}}>
                  {editing.name ? editing.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '?'}
                </div>
                <div>
                  <div className="act-panel__name">{editing.id ? (isES?'Editar rol':'Edit role') : (isES?'Crear nuevo rol':'New role')}</div>
                  <div className="act-panel__dept">{isES ? 'Complete los datos del rol' : 'Fill in the role details'}</div>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'14px',marginTop:'8px'}}>
                <div>
                  <label className="activity-map__label" style={{marginBottom:'6px'}}>
                    {isES ? 'Nombre' : 'Name'}
                  </label>
                  <input className="mono" value={editing.name} onChange={e => setEditing({...editing,name:e.target.value})}
                    placeholder={isES?'Ej. Auditor':'e.g. Auditor'}
                    style={{width:'100%',padding:'9px 12px',border:'1px solid var(--ink-100)',borderRadius:'8px',fontSize:'14px',background:'var(--paper)'}} />
                </div>
                <div>
                  <label className="activity-map__label" style={{marginBottom:'6px'}}>
                    {isES ? 'Descripción' : 'Description'}
                  </label>
                  <input className="mono" value={editing.description} onChange={e => setEditing({...editing,description:e.target.value})}
                    placeholder={isES?'Ej. Acceso a reportes y auditoría':'e.g. Report and audit access'}
                    style={{width:'100%',padding:'9px 12px',border:'1px solid var(--ink-100)',borderRadius:'8px',fontSize:'14px',background:'var(--paper)'}} />
                </div>
                <div>
                  <label className="activity-map__label" style={{marginBottom:'8px'}}>
                    {isES ? 'Color' : 'Color'}
                  </label>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {['#C9A961','#2C3E66','#1A1F3A','#5a6a90','#8a6c2c','#2f7a5a','#8b2942','#4a6fa5'].map(c =>
                      <div key={c} onClick={() => setEditing({...editing,color:c})}
                        style={{width:'28px',height:'28px',borderRadius:'50%',background:c,cursor:'pointer',border:editing.color===c?'2px solid var(--ink-800)':'2px solid var(--ink-100)',boxShadow:editing.color===c?'0 0 0 3px rgba(201,169,97,0.25)':'none'}} />
                    )}
                  </div>
                </div>
                <div>
                  <label className="activity-map__label" style={{marginBottom:'8px'}}>
                    {isES ? 'Permisos' : 'Permissions'}
                  </label>
                  <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                    {ALL_PERMS.map(p => (
                      <label key={p.id} style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',fontSize:'13px',padding:'7px 0',borderBottom:'1px solid var(--ink-100)'}}>
                        <input type="checkbox" checked={editing.perms.includes(p.id)} onChange={() => togglePerm(p.id)}
                          style={{accentColor:'var(--gold-500)',width:'15px',height:'15px'}} />
                        {permLabel(p.id)}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:'8px',marginTop:'4px'}}>
                  <button className="kpi__pill kpi__pill--up" onClick={saveEdit}>
                    <Icon name="check" size={13} /> {isES ? 'Guardar' : 'Save'}
                  </button>
                  <button className="kpi__pill kpi__pill--btn" onClick={() => setEditing(null)}>
                    {isES ? 'Cancelar' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          ) : curRole ? (
            <>
              <div className="act-panel__head">
                <div className="act-panel__who">
                  <div className="act-panel__avatar" style={{background:curRole.color}}>
                    {curRole.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="act-panel__name">{curRole.name}</div>
                    <div className="act-panel__dept">{curRole.description}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                  <button className="kpi__pill kpi__pill--btn" onClick={() => startEdit(curRole)}>
                    <Icon name="edit" size={12} /> {isES ? 'Editar' : 'Edit'}
                  </button>
                  <button className="kpi__pill kpi__pill--btn" onClick={() => deleteRole(curRole.id)} style={{color:'var(--danger)'}}>
                    <Icon name="trash" size={12} /> {isES ? 'Eliminar' : 'Delete'}
                  </button>
                </div>
                <div className="act-panel__filters" style={{display:'flex',flexWrap:'wrap',gap:'6px',width:'100%'}}>
                  {curRole.perms.map(p => (
                    <span key={p} className="badge badge--ok" style={{fontSize:'11.5px'}}>
                      <span className="badge__dot" />{permLabel(p)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="act-panel__body">
                <div className="audit-toolbar">
                  <span className="activity-map__label">
                    {isES ? 'Asignados a este rol' : 'Assigned to this role'}
                    <span style={{fontWeight:400,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',textTransform:'none',letterSpacing:0}}>
                      ({roleAssignees.length})
                    </span>
                  </span>
                </div>

                {roleAssignees.length === 0 ? (
                  <div className="audit-empty">
                    <Icon name="shield" size={24} stroke={1.2} />
                    <div className="audit-empty__title">{isES ? 'Sin asignaciones' : 'No assignments'}</div>
                    <div className="audit-empty__sub">{isES ? 'Este rol no tiene empleados asignados aún.' : 'This role has no employees assigned yet.'}</div>
                  </div>
                ) : (
                  <div className="audit-list">
                {roleAssignees.map(a => {
                  const creds = getCredentials();
                  const c = creds[a.empId];
                  const isEditingCred = editCred === a.empId;
                  return isEditingCred ? (
                    <div key={a.empId} style={{padding:'12px 20px',borderBottom:'1px solid var(--ink-100)',display:'flex',flexDirection:'column',gap:'8px',background:'var(--cream-50)'}}>
                      <div style={{fontWeight:600,fontSize:'13px'}}>{a.emp ? a.emp.name : a.empId}</div>
                      <div>
                        <label className="activity-map__label" style={{marginBottom:'4px'}}>{isES ? 'Correo' : 'Email'}</label>
                        <input type="email" value={editCredEmail} onChange={e => setEditCredEmail(e.target.value)}
                          style={{width:'100%',padding:'7px 10px',border:'1px solid var(--ink-100)',borderRadius:'6px',fontSize:'13px',background:'var(--paper)'}} />
                      </div>
                      <div>
                        <label className="activity-map__label" style={{marginBottom:'4px'}}>{isES ? 'Contraseña' : 'Password'}</label>
                        <div style={{display:'flex',gap:'6px'}}>
                          <input type={editCredShowPass?'text':'password'} value={editCredPass} onChange={e => setEditCredPass(e.target.value)}
                            style={{flex:1,padding:'7px 10px',border:'1px solid var(--ink-100)',borderRadius:'6px',fontSize:'13px',background:'var(--paper)'}} />
                          <button onClick={() => setEditCredShowPass(p=>!p)} style={{background:'none',border:'1px solid var(--ink-100)',borderRadius:'6px',cursor:'pointer',padding:'0 8px',color:'var(--ink-400)'}}>
                            <Icon name="eye" size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button className="kpi__pill kpi__pill--up" onClick={saveEditCred}><Icon name="check" size={11} /> {isES ? 'Guardar' : 'Save'}</button>
                        <button className="kpi__pill kpi__pill--btn" onClick={() => setEditCred(null)}>{isES ? 'Cancelar' : 'Cancel'}</button>
                      </div>
                    </div>
                  ) : (
                  <div key={a.empId} className="audit-entry" style={{alignItems:'center',padding:'12px 0'}}>
                    <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'var(--ink-200)',display:'grid',placeItems:'center',fontSize:'12px',fontWeight:700,color:'var(--ink-600)',flexShrink:0}}>
                      {a.emp ? a.emp.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase() : '?'}
                    </div>
                    <div className="audit-entry__body">
                      <div className="audit-entry__row">
                        <span style={{fontWeight:600,fontSize:'14px'}}>{a.emp ? a.emp.name : a.empId}</span>
                      </div>
                      <div className="audit-entry__row" style={{marginBottom:0,gap:'4px'}}>
                        <span className="az__dept">{a.emp ? a.emp.dept : ''}</span>
                        <span className="az__last" style={{fontSize:'10.5px'}}>· <span className="mono">{a.empId}</span></span>
                        {c && <span className="az__last" style={{fontSize:'10.5px',color:'var(--ink-300)'}}>· {c.email}</span>}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:'4px'}}>
                      <button onClick={() => { setEditCred(a.empId); setEditCredEmail(c?.email || a.emp?.email || ''); setEditCredPass(''); }}
                        style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-300)',padding:'4px',borderRadius:'4px',transition:'color 150ms'}}
                        onMouseOver={e => e.currentTarget.style.color='var(--gold-500)'}
                        onMouseOut={e => e.currentTarget.style.color='var(--ink-300)'}>
                        <Icon name="edit" size={13} />
                      </button>
                      <button onClick={() => removeAssign(a.empId, a.roleId)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-300)',padding:'4px',borderRadius:'4px',transition:'color 150ms'}}
                        onMouseOver={e => e.currentTarget.style.color='var(--danger)'}
                        onMouseOut={e => e.currentTarget.style.color='var(--ink-300)'}>
                        <Icon name="x" size={16} />
                      </button>
                    </div>
                  </div>
                  );
                })}
                  </div>
                )}

                <div className="audit-toolbar" style={{borderTop:'1px solid var(--ink-100)',borderBottom:'none',flexDirection:'column',gap:'8px'}}>
                  <button className="kpi__pill kpi__pill--btn" onClick={() => setShowAssign(p => !p)}
                    style={{alignSelf:'flex-start'}}>
                    <Icon name={showAssign ? 'x' : 'plus'} size={12} />
                    {showAssign ? (isES ? 'Cerrar' : 'Close') : (isES ? 'Asignar empleado' : 'Assign employee')}
                  </button>

                  {showAssign && (assignEmp ? (
                    <div style={{width:'100%',display:'flex',flexDirection:'column',gap:'10px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:'var(--cream-50)',borderRadius:'8px',border:'1px solid var(--ink-100)'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--ink-200)',display:'grid',placeItems:'center',fontSize:'11px',fontWeight:700,color:'var(--ink-600)',flexShrink:0}}>
                          {assignEmp.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase()}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:'13px'}}>{assignEmp.name}</div>
                          <div style={{fontSize:'11px',color:'var(--ink-300)'}}><span className="mono">{assignEmp.id}</span> · {assignEmp.dept}</div>
                        </div>
                        <button onClick={() => setAssignEmp(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-300)',padding:'4px'}}>
                          <Icon name="x" size={14} />
                        </button>
                      </div>
                      <div>
                        <label className="activity-map__label" style={{marginBottom:'4px'}}>{isES ? 'Correo institucional' : 'Institutional email'}</label>
                        <input type="email" value={assignEmail} onChange={e => setAssignEmail(e.target.value)}
                          style={{width:'100%',padding:'9px 12px',border:'1px solid var(--ink-100)',borderRadius:'8px',fontSize:'13px',background:'var(--paper)'}} />
                      </div>
                      <div>
                        <label className="activity-map__label" style={{marginBottom:'4px'}}>{isES ? 'Contraseña de inicio' : 'Login password'}</label>
                        <div style={{display:'flex',gap:'6px'}}>
                          <input type={assignShowPass?'text':'password'} value={assignPass} onChange={e => setAssignPass(e.target.value)}
                            style={{flex:1,padding:'9px 12px',border:'1px solid var(--ink-100)',borderRadius:'8px',fontSize:'13px',background:'var(--paper)'}} />
                          <button onClick={() => setAssignShowPass(p=>!p)} style={{background:'none',border:'1px solid var(--ink-100)',borderRadius:'8px',cursor:'pointer',padding:'0 10px',color:'var(--ink-400)'}}>
                            <Icon name="eye" size={16} />
                          </button>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                        <button className="kpi__pill kpi__pill--up" onClick={confirmAssign}>
                          <Icon name="check" size={12} /> {isES ? 'Asignar' : 'Assign'}
                        </button>
                        <select value={assignRole} onChange={e => setAssignRole(e.target.value)}
                          style={{padding:'6px 10px',border:'1px solid var(--ink-100)',borderRadius:'6px',fontSize:'13px',background:'var(--paper)',minWidth:'120px'}}>
                          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div style={{display:'flex',gap:'8px',flexWrap:'wrap',width:'100%'}}>
                      <div style={{flex:1,minWidth:'180px',position:'relative'}}>
                        <input value={assignQ} onChange={e => setAssignQ(e.target.value)}
                          placeholder={isES?'Buscar empleado…':'Search employee…'}
                          style={{width:'100%',padding:'9px 12px',border:'1px solid var(--ink-100)',borderRadius:'8px',fontSize:'13px',background:'var(--paper)'}} />
                        {assignQ && (
                          <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--paper)',border:'1px solid var(--ink-100)',borderRadius:'8px',zIndex:10,maxHeight:'200px',overflowY:'auto',marginTop:'4px',boxShadow:'var(--shadow-md)'}}>
                            {filteredEmployees.length === 0 && (
                              <div style={{padding:'12px',fontSize:'13px',color:'var(--ink-300)',textAlign:'center'}}>
                                {isES ? 'Sin resultados' : 'No results'}
                              </div>
                            )}
                            {filteredEmployees.map(e => (
                              <div key={e.id} onClick={() => startAssign(e)}
                                style={{padding:'10px 12px',cursor:'pointer',fontSize:'13px',borderBottom:'1px solid var(--ink-100)'}}
                                onMouseOver={e => e.currentTarget.style.background='var(--cream-50)'}
                                onMouseOut={e => e.currentTarget.style.background=''}>
                                <div style={{fontWeight:600}}>{e.name}</div>
                                <div style={{fontSize:'11px',color:'var(--ink-300)'}}><span className="mono">{e.id}</span> · {e.dept}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <select value={assignRole} onChange={e => setAssignRole(e.target.value)}
                        style={{padding:'9px 12px',border:'1px solid var(--ink-100)',borderRadius:'8px',fontSize:'13px',background:'var(--paper)',minWidth:'140px'}}>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="audit-empty" style={{minHeight:'480px',justifyContent:'center'}}>
              <Icon name="shield" size={28} stroke={1.2} />
              <div className="audit-empty__title">{isES ? 'Selecciona un rol' : 'Select a role'}</div>
              <div className="audit-empty__sub">{isES ? 'Presiona «Ver roles» para elegir un rol y gestionar sus asignaciones.' : 'Click «View roles» to pick a role and manage its assignments.'}</div>
            </div>
          )}
        </div>
      </div>

      {flash && <div className="flash" style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',zIndex:1000}}>{flash}</div>}
    </div>
  );
}

Object.assign(window, { RolesView });
