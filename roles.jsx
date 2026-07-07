/* roles.jsx — administración de roles y perfiles de administradores */

const ROLES_KEY = 'uasd_roles_v1';
const ASSIGN_KEY = 'uasd_role_assignments_v1';
const CRED_KEY = 'uasd_credentials_v1';
const CURR_USER_KEY = 'uasd_current_user';
const ROLE_SEED_VER = 'uasd_role_seed_v8';
const CRED_PATCH_V1 = 'uasd_cred_patch_v1';
const CRED_PATCH_V2 = 'uasd_cred_patch_v2';
const DEFAULT_PASS   = '123456789';

const SEED_ROLES = [
  { id: 'role_admin', name: 'Administrador', description: 'Acceso completo a todas las funciones del sistema.', color: '#8b2942', perms: ['enroll','reports','manage','roles','audit','farm','liceo','kiosk_admin'] },
  { id: 'role_hr', name: 'Recursos Humanos', description: 'Registro de empleados, captura de huellas y reportes.', color: '#2C3E66', perms: ['enroll','reports','manage','farm','liceo','roles'] },
  { id: 'role_viewer', name: 'Solo lectura', description: 'Acceso solo a reportes y control de actividad.', color: '#5a6a90', perms: ['reports','audit','roles'] },
];

const SEED_ASSIGNMENTS = [
  { empId: 'EMP-00702', roleId: 'role_admin' },
  { empId: 'EMP-00601', roleId: 'role_admin' },
  { empId: 'EMP-00187', roleId: 'role_hr' },
  { empId: 'EMP-00103', roleId: 'role_viewer' },
];

const PROTECTED_ROLE_IDS = ['role_admin', 'role_hr'];
const MAX_ROLE_MEMBERS = 5;

const ALL_PERMS = [
  { id: 'enroll',  label_es: 'Registrar empleados',  label_en: 'Register employees' },
  { id: 'reports', label_es: 'Ver reportes',          label_en: 'View reports' },
  { id: 'manage',  label_es: 'Gestionar empleados',   label_en: 'Manage employees' },
  { id: 'roles',   label_es: 'Gestionar roles',       label_en: 'Manage roles' },
  { id: 'audit',   label_es: 'Control de actividad',  label_en: 'Activity log' },
  { id: 'farm',    label_es: 'Control de finca',      label_en: 'Farm control' },
  { id: 'liceo',   label_es: 'Control de liceo',      label_en: 'School control' },
];

(function seedRoles() {
  if (localStorage.getItem(ROLE_SEED_VER)) return;
  const existingRoles = getRoles();
  const roles = existingRoles.length ? existingRoles.map(r => {
    const perms = Array.isArray(r.perms) ? r.perms : [];
    if ((r.id === 'role_admin' || r.id === 'role_hr') && !perms.includes('farm')) {
      return { ...r, perms: [...perms, 'farm'] };
    }
    if ((r.id === 'role_admin' || r.id === 'role_hr') && !perms.includes('liceo')) {
      return { ...r, perms: [...perms, 'liceo'] };
    }
    if (r.id === 'role_hr' && !perms.includes('roles')) {
      return { ...r, perms: [...perms, 'roles'] };
    }
    if (r.id === 'role_viewer' && !perms.includes('roles')) {
      return { ...r, perms: [...perms, 'roles'] };
    }
    if (perms !== r.perms) return { ...r, perms };
    return r;
  }) : SEED_ROLES;
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(SEED_ASSIGNMENTS));
  const creds = {};
  SEED_ASSIGNMENTS.forEach(a => {
    const emp = EMPLOYEES.find(e => e.id === a.empId);
    if (emp) creds[a.empId] = { email: emp.email, password: DEFAULT_PASS };
  });
  localStorage.setItem(CRED_KEY, JSON.stringify({ ...creds, ...getCredentials() }));
  localStorage.setItem(ROLE_SEED_VER, '1');
})();

(function patchMissingCreds() {
  if (localStorage.getItem(CRED_PATCH_V1)) return;
  const creds = (() => { try { return JSON.parse(localStorage.getItem(CRED_KEY) || '{}'); } catch { return {}; } })();
  let changed = false;
  SEED_ASSIGNMENTS.forEach(a => {
    if (!creds[a.empId]) {
      const emp = (window.EMPLOYEES || []).find(e => e.id === a.empId);
      if (emp) { creds[a.empId] = { email: emp.email, password: DEFAULT_PASS }; changed = true; }
    }
  });
  if (changed) localStorage.setItem(CRED_KEY, JSON.stringify(creds));
  localStorage.setItem(CRED_PATCH_V1, '1');
})();

(function patchDefaultPass() {
  if (localStorage.getItem(CRED_PATCH_V2)) return;
  const creds = (() => { try { return JSON.parse(localStorage.getItem(CRED_KEY) || '{}'); } catch { return {}; } })();
  let changed = false;
  SEED_ASSIGNMENTS.forEach(a => {
    if (creds[a.empId]?.password === 'Uasd2026') {
      creds[a.empId].password = DEFAULT_PASS; changed = true;
    }
    if (!creds[a.empId]) {
      const emp = (window.EMPLOYEES || []).find(e => e.id === a.empId);
      if (emp) { creds[a.empId] = { email: emp.email, password: DEFAULT_PASS }; changed = true; }
    }
  });
  if (changed) localStorage.setItem(CRED_KEY, JSON.stringify(creds));
  localStorage.setItem(CRED_PATCH_V2, '1');
})();

function getCredentials() {
  try { return JSON.parse(localStorage.getItem(CRED_KEY) || '{}'); } catch { return {}; }
}

function saveCredential(empId, email, password) {
  const creds = getCredentials();
  creds[empId] = { email, password };
  localStorage.setItem(CRED_KEY, JSON.stringify(creds));
}

function deleteCredential(empId) {
  const creds = getCredentials();
  delete creds[empId];
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

function PermCheckbox({ checked, onChange, label }) {
  return (
    <label onClick={onChange} style={{
      display:'flex', alignItems:'center', gap:'10px', cursor:'pointer',
      fontSize:'13px', padding:'7px 8px', borderBottom:'1px solid var(--ink-100)',
      fontFamily:'var(--font-sans)', userSelect:'none', borderRadius:'6px',
      background: checked ? 'rgba(44,62,102,0.06)' : 'transparent',
      transition:'background .2s ease',
    }}>
      <span style={{
        width:'17px', height:'17px', borderRadius:'5px', flexShrink:0,
        border: checked ? '2px solid #2C3E66' : '2px solid var(--ink-200)',
        background: checked ? '#2C3E66' : 'transparent',
        display:'grid', placeItems:'center',
        transition:'background .18s ease, border-color .18s ease, transform .18s cubic-bezier(0.34,1.56,0.64,1)',
        transform: checked ? 'scale(1.12)' : 'scale(1)',
      }}>
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            style={{
              strokeDasharray: 12,
              strokeDashoffset: checked ? 0 : 12,
              transition: checked
                ? 'stroke-dashoffset .22s cubic-bezier(0.22,1,0.36,1) .05s'
                : 'stroke-dashoffset .12s ease',
            }} />
        </svg>
      </span>
      <span style={{
        color: checked ? 'var(--ink-800)' : 'var(--ink-500)',
        fontWeight: checked ? 600 : 400,
        transition:'color .18s ease, font-weight .18s ease',
      }}>{label}</span>
    </label>
  );
}

function RolesView({ t, setRoute }) {
  const [roles, setRoles]       = React.useState(getRoles);
  const [assign, setAssign]     = React.useState(getAssignments);
  const [creds, setCreds]       = React.useState(getCredentials);
  const [selRole, setSelRole]   = React.useState(() => { const r = getRoles(); return r.length ? r[0].id : null; });

  React.useEffect(() => {
    if (!userHasPermission('roles')) setRoute('dashboard');
  }, []);
  const [editing, setEditing]   = React.useState(null);
  const [formClosing, setFormClosing] = React.useState(false);
  const [formError, setFormError] = React.useState(null);
  const [showAssign, setShowAssign] = React.useState(false);
  const [assignClosing, setAssignClosing] = React.useState(false);
  const [assignSearchLeaving, setAssignSearchLeaving] = React.useState(false);
  const [assignQ, setAssignQ]   = React.useState('');
  const [assignEmp, setAssignEmp]   = React.useState(null);
  const [assignEmail, setAssignEmail] = React.useState('');
  const [assignPass, setAssignPass]   = React.useState('');
  const [assignShowPass, setAssignShowPass] = React.useState(false);
  const [assignFieldErr, setAssignFieldErr] = React.useState({ email: false, pass: false });
  const [assignHighlight, setAssignHighlight] = React.useState(-1);
  const assignListRef = React.useRef(null);
  const [editCred, setEditCred]     = React.useState(null);
  const [credClosing, setCredClosing] = React.useState(false);
  const [lastClosedCred, setLastClosedCred] = React.useState(null);
  const [editCredEmail, setEditCredEmail] = React.useState('');
  const [editCredPass, setEditCredPass]   = React.useState('');
  const [editCredShowPass, setEditCredShowPass] = React.useState(false);
  const [editCredFieldErr, setEditCredFieldErr] = React.useState({ email: false, pass: false });
  const [flash, setFlash]       = React.useState(null);
  const isES = t.appName === 'Sistema de Registro Biométrico';


  const curRole = selRole && roles.find(r => r.id === selRole);

  const currentUserRoleId = (() => { const a = assign.find(x => x.empId === getCurrentUserId()); return a?.roleId || null; })();
  const isHRViewer  = currentUserRoleId === 'role_hr';
  const isReadOnly  = currentUserRoleId === 'role_viewer';
  const canEditRole = (rid) => {
    if (PROTECTED_ROLE_IDS.includes(rid)) return false;
    if (isReadOnly) return false;
    if (isHRViewer) return rid !== 'role_admin';
    return true;
  };
  const canManageAssignments = !isReadOnly;
  const canCreateRole = !isReadOnly;
  const currentUserId = getCurrentUserId();
  const canEditCred = (assignee) => {
    if (currentUserRoleId === 'role_admin' && assignee.roleId === 'role_admin' && assignee.empId !== currentUserId) return false;
    if (currentUserRoleId === 'role_hr'    && assignee.roleId === 'role_hr'    && assignee.empId !== currentUserId) return false;
    return canManageAssignments;
  };

  const currentUserPerms = (() => {
    if (!getCurrentUserId()) return ALL_PERMS.map(p => p.id);
    const a = assign.find(x => x.empId === getCurrentUserId());
    if (!a) return [];
    const r = roles.find(r => r.id === a.roleId);
    return r?.perms || [];
  })();

  const grantablePerms = ALL_PERMS.filter(p => currentUserPerms.includes(p.id));

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

  const closeForm = (cb) => {
    setFormError(null);
    setFormClosing(true);
    setTimeout(() => { setEditing(null); setFormClosing(false); if (cb) cb(); }, 420);
  };

  const startEdit = (role) => {
    setEditing({ ...(role || { id: '', name: '', description: '', color: '#2C3E66', perms: ['reports'] }) });
  };

  const saveEdit = () => {
    const missing = [];
    if (!editing.name.trim())        missing.push(isES ? 'Nombre' : 'Name');
    if (!editing.description.trim()) missing.push(isES ? 'Descripción' : 'Description');
    if (!editing.color)              missing.push(isES ? 'Color' : 'Color');
    if (!editing.perms.length)       missing.push(isES ? 'Permisos' : 'Permissions');
    if (missing.length) { setFormError(missing); return; }
    setFormError(null);
    const safePerms = (editing.perms || []).filter(p => currentUserPerms.includes(p));
    let list = [...roles];
    if (editing.id) {
      const idx = list.findIndex(r => r.id === editing.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...editing, perms: safePerms };
    } else {
      const nid = 'role_' + Date.now().toString(36);
      list.push({ ...editing, id: nid, perms: safePerms });
    }
    const msg = editing.id ? 'Rol actualizado' : 'Rol creado';
    const nextSel = editing.id || list[list.length - 1]?.id;
    saveRoles(list);
    setRoles(list);
    closeForm(() => { setFlash(msg); setTimeout(() => setFlash(null), 2000); });
    setSelRole(nextSel);
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
    setAssignSearchLeaving(true);
    setTimeout(() => {
      setAssignEmp(emp);
      setAssignEmail(existing?.email || emp.email || '');
      setAssignPass('');
      setAssignQ('');
      setAssignSearchLeaving(false);
    }, 180);
  };

  const closeAssign = () => {
    setAssignClosing(true);
    setTimeout(() => {
      setShowAssign(false);
      setAssignClosing(false);
      setAssignEmp(null);
      setAssignQ('');
      setAssignEmail('');
      setAssignPass('');
      setAssignFieldErr({ email: false, pass: false });
    }, 140);
  };

  const confirmAssign = () => {
    if (!assignEmp) return;
    if (roleAssignees.length >= MAX_ROLE_MEMBERS) return;
    const errEmail = !assignEmail.trim();
    const errPass  = !assignPass.trim() || assignPass.length < 6;
    if (errEmail || errPass) {
      setAssignFieldErr({ email: errEmail, pass: errPass });
      return;
    }
    setAssignFieldErr({ email: false, pass: false });
    saveCredential(assignEmp.id, assignEmail.trim(), assignPass);
    const asgn = [...assign, { empId: assignEmp.id, roleId: selRole }];
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
    deleteCredential(empId);
    setCreds(getCredentials());
  };

  const closeCred = (cb) => {
    const closing = editCred;
    setCredClosing(true);
    setEditCredFieldErr({ email: false, pass: false });
    setTimeout(() => {
      setEditCred(null);
      setCredClosing(false);
      setLastClosedCred(closing);
      setTimeout(() => setLastClosedCred(null), 500);
      if (cb) cb();
    }, 400);
  };

  const saveEditCred = () => {
    if (!editCred) return;
    const errEmail = !editCredEmail.trim();
    const errPass  = !editCredPass.trim() || editCredPass.length < 6;
    if (errEmail || errPass) { setEditCredFieldErr({ email: errEmail, pass: errPass }); return; }
    setEditCredFieldErr({ email: false, pass: false });
    saveCredential(editCred, editCredEmail.trim(), editCredPass);
    saveEmployeeEmail(editCred, editCredEmail.trim());
    setCreds(getCredentials());
    closeCred(() => { setFlash(isES?'Credenciales actualizadas':'Credentials updated'); setTimeout(() => setFlash(null), 2000); });
  };

  const togglePerm = (pid) => {
    if (!editing) return;
    const list = editing.perms.includes(pid)
      ? editing.perms.filter(p => p !== pid)
      : [...editing.perms, pid];
    setEditing({ ...editing, perms: list });
    setFormError(null);
  };

  return (
    <div className="page" style={{ animation:'body-in .28s cubic-bezier(0.33,1,0.68,1) both' }}>
      <div className="page__head">
        <div>
          <div className="page__title">{t.nav_roles}</div>
          <div className="page__subtitle">{isES ? 'Control de acceso al sistema' : 'System access control'}</div>
        </div>
      </div>

      <div className="activity-map" style={{gridTemplateColumns:'320px 1fr'}}>
        <div className="activity-map__left">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 16px 12px'}}>
            <span className="activity-map__label" style={{margin:0}}>
              {isES ? 'Roles definidos' : 'Defined roles'}
              <span style={{fontWeight:400,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',textTransform:'none',letterSpacing:0}}>
                ({roles.length})
              </span>
            </span>
            {canCreateRole && (
              <button className={`kpi__pill kpi__pill--btn${editing && !editing.id ? ' kpi__pill--btn--close' : ''}`}
                style={{minWidth:'108px',justifyContent:'center'}}
                onClick={() => editing && !editing.id ? closeForm() : startEdit()}>
                <Icon name={editing && !editing.id ? 'x' : 'plus'} size={12} />
                {editing && !editing.id ? (isES ? 'Cerrar' : 'Close') : (isES ? 'Nuevo rol' : 'New role')}
              </button>
            )}
          </div>
          <div className="activity-map__grid">
            {roles.map(role => {
              const live = (editing && editing.id === role.id) ? editing : role;
              const count = assign.filter(a => a.roleId === role.id).length;
              const isActive = selRole === role.id;
              const initials = live.name ? live.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '?';
              return (
                <button key={role.id}
                  className={`az ${isActive ? 'az--active' : ''}`}
                  onClick={() => setSelRole(role.id)}
                  aria-pressed={isActive}>
                  <div className="az__avatar" style={{background:live.color,transition:'background .1s'}}>
                    {initials}
                  </div>
                  <div className="az__name" style={{transition:'color .1s'}}>{live.name || role.name}</div>
                  <div className="az__meta">
                    <span className="az__count">{count} {isES ? (count===1?'asignado':'asignados') : (count===1?'assigned':'assigned')}</span>
                  </div>
                  {isActive && <div className="az__active-dot" aria-hidden="true" />}
                </button>
              );
            })}

            {editing && !editing.id && (
              <div className="az" style={{opacity: editing.name ? 1 : 0.4, border:'1px dashed var(--ink-200)', transition:'opacity .2s'}}>
                <div className="az__avatar" style={{background: editing.color || 'var(--ink-200)'}}>
                  {editing.name
                    ? editing.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
                    : <Icon name="diamondPlus" size={14} stroke={2} />}
                </div>
                <div className="az__name" style={{color: editing.name ? 'var(--ink-800)' : 'var(--ink-300)'}}>
                  {editing.name || (isES ? 'Nuevo rol' : 'New role')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="act-panel">
          {editing ? (
            <div className="audit-toolbar" style={{flexDirection:'column',alignItems:'stretch'}}>
              <div className={`act-panel__who role-form-field${formClosing?' role-form-field--out':''}`} style={{animationDelay:formClosing?'200ms':'0ms',flexDirection:'column',alignItems:'stretch',gap:'10px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <div className="act-panel__avatar" style={{background:editing.color,transition:'background .1s',flexShrink:0}}>
                    {editing.name ? editing.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : <Icon name="diamondPlus" size={16} stroke={2} />}
                  </div>
                  <div>
                    <div className="act-panel__name">{editing.name || (isES?'Nuevo rol':'New role')}</div>
                    <div className="act-panel__dept">{editing.description || (isES?'Completa los datos':'Fill in the role details')}</div>
                  </div>
                </div>
                {editing.perms.length > 0 && (() => {
                  const h = editing.color || '#2C3E66';
                  const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
                  const bg = `rgba(${r},${g},${b},0.12)`;
                  const col = `rgb(${Math.round(r*0.5)},${Math.round(g*0.5)},${Math.round(b*0.5)})`;
                  return (
                    <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
                      {editing.perms.map(p => (
                        <span key={p} className="badge role-perm-badge" style={{background:bg,color:col,transition:'background .1s, color .1s'}}>
                          {permLabel(p)}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'14px',marginTop:'8px'}}>
                <div className={`role-form-field${formClosing?' role-form-field--out':''}`} style={{animationDelay:formClosing?'160ms':'40ms'}}>
                  <label className="activity-map__label" style={{marginBottom:'6px'}}>
                    {isES ? 'Nombre' : 'Name'} <span className="field__req">*</span>
                  </label>
                  <input value={editing.name} onChange={e => { setEditing({...editing,name:e.target.value}); setFormError(null); }}
                    onKeyDown={e => e.key==='Enter' && saveEdit()}
                    placeholder={isES?'Ej. Auditor':'e.g. Auditor'}
                    style={{width:'100%',padding:'9px 12px',border:'1px solid var(--ink-100)',borderRadius:'8px',fontSize:'14px',background:'var(--paper)',fontFamily:'var(--font-sans)',fontWeight:500,color:'var(--ink-800)'}} />
                </div>
                <div className={`role-form-field${formClosing?' role-form-field--out':''}`} style={{animationDelay:formClosing?'120ms':'80ms'}}>
                  <label className="activity-map__label" style={{marginBottom:'6px'}}>
                    {isES ? 'Descripción' : 'Description'} <span className="field__req">*</span>
                  </label>
                  <input value={editing.description} onChange={e => { setEditing({...editing,description:e.target.value}); setFormError(null); }}
                    onKeyDown={e => e.key==='Enter' && saveEdit()}
                    placeholder={isES?'Ej. Acceso a reportes y auditoría':'e.g. Report and audit access'}
                    style={{width:'100%',padding:'9px 12px',border:'1px solid var(--ink-100)',borderRadius:'8px',fontSize:'14px',background:'var(--paper)',fontFamily:'var(--font-sans)',fontWeight:500,color:'var(--ink-800)'}} />
                </div>
                <div className={`role-form-field${formClosing?' role-form-field--out':''}`} style={{animationDelay:formClosing?'80ms':'120ms'}}>
                  <label className="activity-map__label" style={{marginBottom:'8px'}}>
                    {isES ? 'Color' : 'Color'} <span className="field__req">*</span>
                  </label>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {PRESET_COLORS.map(c =>
                      <div key={c} className="color-swatch" data-tip={PRESET_COLOR_NAMES[c]} onClick={() => { setEditing({...editing,color:c}); setFormError(null); }}
                        style={{width:'28px',height:'28px',borderRadius:'50%',background:c,cursor:'pointer',border:editing.color===c?'2px solid var(--ink-800)':'2px solid var(--ink-100)',boxShadow:editing.color===c?'0 0 0 3px rgba(201,169,97,0.25)':'none'}} />
                    )}
                    {(() => {
                      const isCustom = editing.color && !PRESET_COLORS.includes(editing.color);
                      return (
                        <label className="color-swatch" data-tip={isCustom ? nearestColorName(editing.color) : (isES ? 'Color personalizado' : 'Custom color')}
                          style={{position:'relative',width:'28px',height:'28px',borderRadius:'50%',cursor:'pointer',display:'grid',placeItems:'center',
                            background: isCustom ? editing.color : 'conic-gradient(from 0deg,#e3494a,#e8a33d,#e3d23f,#4caf6e,#4a6fa5,#8b2942,#e3494a)',
                            border: isCustom ? '2px solid var(--ink-800)' : '2px solid var(--ink-100)',
                            boxShadow: isCustom ? '0 0 0 3px rgba(201,169,97,0.25)' : 'none'}}>
                          {!isCustom && <span style={{color:'#fff'}}><Icon name="plus" size={12} stroke={2.4} /></span>}
                          <input type="color" value={editing.color || '#2C3E66'}
                            onChange={e => { setEditing({...editing,color:e.target.value}); setFormError(null); }}
                            style={{position:'absolute',inset:0,opacity:0,cursor:'pointer',width:'100%',height:'100%',border:'none',padding:0}} />
                        </label>
                      );
                    })()}
                  </div>
                </div>
                <div className={`role-form-field${formClosing?' role-form-field--out':''}`} style={{animationDelay:formClosing?'40ms':'160ms'}}>
                  <label className="activity-map__label" style={{marginBottom:'8px'}}>
                    {isES ? 'Permisos' : 'Permissions'} <span className="field__req">*</span>
                  </label>
                  <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                    {grantablePerms.map(p => (
                      <PermCheckbox key={p.id}
                        checked={editing.perms.includes(p.id)}
                        onChange={() => togglePerm(p.id)}
                        label={permLabel(p.id)} />
                    ))}
                  </div>
                </div>
                {formError && (
                  <div className={`role-form-field${formClosing?' role-form-field--out':''}`}
                    style={{animationDelay:formClosing?'0ms':'220ms',background:'rgba(193,85,77,0.07)',border:'1px solid rgba(193,85,77,0.22)',borderRadius:'8px',padding:'9px 12px',display:'flex',gap:'8px',alignItems:'flex-start'}}>
                    <span style={{color:'#c1554d',flexShrink:0,marginTop:'1px',lineHeight:0}}><Icon name="alertTriangle" size={14} stroke={2}/></span>
                    <span style={{fontSize:'12px',color:'#8a3028',fontFamily:'var(--font-sans)',lineHeight:'1.5'}}>
                      <span style={{fontWeight:600}}>{isES ? 'Completa los campos obligatorios:' : 'Fill in the required fields:'}</span>{' '}
                      {formError.join(', ')}.
                    </span>
                  </div>
                )}
                <div className={`role-form-field${formClosing?' role-form-field--out':''}`} style={{display:'flex',justifyContent:'flex-end',gap:'8px',marginTop:'4px',animationDelay:formClosing?'0ms':'200ms'}}>
                  <button className="btn btn--ghost" onClick={() => closeForm()} style={{padding:'7px 14px',fontSize:'12px'}}>
                    {isES ? 'Cancelar' : 'Cancel'}
                  </button>
                  <button className="btn btn--primary" onClick={saveEdit} style={{padding:'7px 14px',fontSize:'12px'}}>
                    {isES ? 'Guardar' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : curRole ? (
            <div style={{animation:'body-in .25s cubic-bezier(0.33,1,0.68,1) both'}}>
              <div className="act-panel__head role-head" style={{position:'relative'}}>
                {PROTECTED_ROLE_IDS.includes(curRole.id) ? (
                  <span style={{position:'absolute',top:'20px',right:'24px',display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'11px',fontFamily:'var(--font-sans)',fontWeight:600,color:'var(--ink-400)',background:'var(--ink-50,#f4f5f7)',border:'1px solid var(--ink-100)',borderRadius:'6px',padding:'4px 9px',letterSpacing:'0.02em',whiteSpace:'nowrap'}}>
                    <Icon name="lock" size={11} stroke={2}/> {isES ? 'Rol de sistema' : 'System role'}
                  </span>
                ) : canEditRole(curRole.id) && (
                  <div className="role-head__actions">
                    <button className="table__action-btn" aria-label={isES?'Editar rol':'Edit role'} onClick={() => startEdit(curRole)} style={{width:'34px',height:'34px'}}>
                      <Icon name="edit" size={17} />
                    </button>
                    <button className="table__action-btn table__action-btn--del" aria-label={isES?'Eliminar rol':'Delete role'} onClick={() => deleteRole(curRole.id)} style={{width:'34px',height:'34px'}}>
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                )}
                <div className="act-panel__who">
                  <div className="act-panel__avatar" style={{background:curRole.color}}>
                    {curRole.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="act-panel__name">{curRole.name}</div>
                    <div className="act-panel__dept">{curRole.description}</div>
                  </div>
                </div>
                {(() => {
                  const h = curRole.color || '#2C3E66';
                  const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
                  const bg = `rgba(${r},${g},${b},0.1)`;
                  const color = `rgb(${Math.round(r*0.55)},${Math.round(g*0.55)},${Math.round(b*0.55)})`;
                  return (
                    <div style={{display:'flex',flexWrap:'wrap',gap:'6px',width:'100%'}}>
                      {curRole.perms.map(p => (
                        <span key={p} className="badge role-perm-badge" style={{background:bg,color}}>
                          {permLabel(p)}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="act-panel__body">
                <div className="audit-toolbar" style={{justifyContent:'space-between'}}>
                  <span className="activity-map__label">
                    {isES ? 'Asignados a este rol' : 'Assigned to this role'}
                    <span style={{fontWeight:400,marginLeft:'6px',fontSize:'12px',textTransform:'none',letterSpacing:0,
                      color: roleAssignees.length >= MAX_ROLE_MEMBERS ? 'var(--danger)' : 'var(--ink-300)'}}>
                      ({roleAssignees.length}/{MAX_ROLE_MEMBERS})
                    </span>
                  </span>
                  {canManageAssignments && (
                    <button
                      className={`kpi__pill kpi__pill--btn${showAssign ? ' kpi__pill--btn--close' : ''}`}
                      onClick={() => showAssign ? closeAssign() : setShowAssign(true)}
                      disabled={!showAssign && roleAssignees.length >= MAX_ROLE_MEMBERS}
                      title={!showAssign && roleAssignees.length >= MAX_ROLE_MEMBERS ? (isES ? 'Límite de 5 personas alcanzado' : 'Maximum of 5 members reached') : undefined}
                      style={{minWidth:'148px',justifyContent:'center',opacity: !showAssign && roleAssignees.length >= MAX_ROLE_MEMBERS ? 0.45 : 1, cursor: !showAssign && roleAssignees.length >= MAX_ROLE_MEMBERS ? 'not-allowed' : 'pointer'}}>
                      <Icon name={showAssign ? 'x' : 'plus'} size={12} />
                      {showAssign ? (isES ? 'Cerrar' : 'Close') : (isES ? 'Asignar empleado' : 'Assign employee')}
                    </button>
                  )}
                </div>

                {(showAssign || assignClosing) && (
                  <div style={{padding:'12px 24px 16px',borderBottom:'1px solid var(--ink-100)',transformOrigin:'top',animation:`${assignClosing ? 'assignFormOut .14s ease-in' : 'assignFormIn .22s cubic-bezier(.16,1,.3,1)'} both`,pointerEvents:assignClosing?'none':'auto'}}>
                  {assignEmp ? (
                    <div className="status-card status-card--new" style={{animation:'assignSelectIn .32s cubic-bezier(.16,1,.3,1) both',borderLeftColor:curRole.color}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:curRole.color,display:'grid',placeItems:'center',fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0}}>
                          {assignEmp.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="act-panel__name" style={{fontSize:'14px'}}>{assignEmp.name}</div>
                          <div className="act-panel__dept" style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'2px'}}>
                            <span>{assignEmp.dept}</span>
                            <span>· <span className="mono">{assignEmp.id}</span></span>
                          </div>
                        </div>
                      </div>
                      {(assignFieldErr.email || assignFieldErr.pass) && (
                        <div className="login__error" role="alert" style={{padding:'9px 12px',gap:'8px'}}>
                          <div className="login__error-icon" style={{width:'26px',height:'26px'}}><Icon name="alertTriangle" size={13} stroke={2.4} /></div>
                          <div>
                            <div className="login__error-title" style={{fontSize:'12px'}}>{isES ? 'Campos obligatorios' : 'Required fields'}</div>
                            <div className="login__error-sub" style={{fontSize:'11px'}}>
                              {assignFieldErr.email && assignFieldErr.pass
                                ? (isES ? 'El correo y la contraseña son obligatorios.' : 'Email and password are required.')
                                : assignFieldErr.email
                                  ? (isES ? 'El correo institucional es obligatorio.' : 'Institutional email is required.')
                                  : assignPass.trim()
                                    ? (isES ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.')
                                    : (isES ? 'La contraseña de inicio es obligatoria.' : 'Login password is required.')}
                            </div>
                          </div>
                        </div>
                      )}
                      <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                        <label className="field__label">
                          {isES ? 'Correo institucional' : 'Institutional email'}<span className="field__req">*</span>
                        </label>
                        <input type="email" className={`field__input status-new__input${assignFieldErr.email?' field__input--err':''}`} value={assignEmail}
                          onChange={e => { const v=e.target.value; setAssignEmail(v); setAssignFieldErr(p=>({...p,email:p.email?!v.trim():false})); }}
                          onKeyDown={e => e.key==='Enter' && confirmAssign()}
                          placeholder="usuario@uasd.edu.do" autoFocus />
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                        <label className="field__label">
                          {isES ? 'Contraseña de inicio' : 'Login password'}<span className="field__req">*</span>
                        </label>
                        <div style={{position:'relative'}}>
                          <input type={assignShowPass?'text':'password'} className={`field__input status-new__input${assignFieldErr.pass?' field__input--err':''}`} value={assignPass}
                            onChange={e => { const v=e.target.value; setAssignPass(v); setAssignFieldErr(p=>({...p,pass:p.pass?(!v.trim()||v.length<6):false})); }}
                            onKeyDown={e => e.key==='Enter' && confirmAssign()}
                            placeholder="••••••••" style={{paddingRight:'38px'}} />
                          <button onClick={() => setAssignShowPass(p=>!p)}
                            style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--ink-400)',display:'grid',placeItems:'center',padding:'2px',transition:'color .15s ease'}}
                            onMouseEnter={e => e.currentTarget.style.color='var(--ink-800)'}
                            onMouseLeave={e => e.currentTarget.style.color='var(--ink-400)'}>
                            <Icon name={assignShowPass ? 'eyeOff' : 'eye'} size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="status-new__actions">
                        <button className="status-new__cancel" onClick={() => { setAssignEmp(null); setAssignFieldErr({email:false,pass:false}); }}>{isES ? 'Cancelar' : 'Cancel'}</button>
                        <button className="status-new__save" onClick={confirmAssign}>{isES ? 'Asignar' : 'Assign'}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="toolbar__search" style={{width:'100%',animation:assignSearchLeaving?'assignFormOut .18s ease-in both':undefined}}>
                      <span className="toolbar__search-icon"><Icon name="search" size={15}/></span>
                      <input value={assignQ}
                        onChange={e => { setAssignQ(e.target.value); setAssignHighlight(-1); }}
                        onKeyDown={e => {
                          const len = filteredEmployees.length;
                          if (!len) return;
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const next = (assignHighlight + 1) % len;
                            setAssignHighlight(next);
                            assignListRef.current?.children[next]?.scrollIntoView({block:'nearest'});
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            const prev = (assignHighlight - 1 + len) % len;
                            setAssignHighlight(prev);
                            assignListRef.current?.children[prev]?.scrollIntoView({block:'nearest'});
                          } else if (e.key === 'Enter' && assignHighlight >= 0) {
                            e.preventDefault();
                            startAssign(filteredEmployees[assignHighlight]);
                          } else if (e.key === 'Tab' && len > 0) {
                            e.preventDefault();
                            assignListRef.current?.children[0]?.focus();
                          }
                        }}
                        placeholder={isES?'Buscar empleado…':'Search employee…'}
                        style={{background:'var(--paper)'}} />
                      {assignQ && (<>
                        <span className="toolbar__search-count">{filteredEmployees.length}</span>
                        <button className="toolbar__search-clear" onClick={() => setAssignQ('')} aria-label="Limpiar">
                          <Icon name="x" size={13} stroke={2.4}/>
                        </button>
                      </>)}
                      {assignQ && (
                        <div ref={assignListRef} style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:'var(--paper)',border:'1px solid var(--ink-100)',borderRadius:'10px',zIndex:10,maxHeight:'200px',overflowY:'auto',boxShadow:'var(--shadow-md)'}}>
                          {filteredEmployees.length === 0 && (
                            <div style={{padding:'12px',fontSize:'13px',color:'var(--ink-300)',textAlign:'center'}}>
                              {isES ? 'Sin resultados' : 'No results'}
                            </div>
                          )}
                          {filteredEmployees.map((e, i) => (
                            <button key={e.id}
                              onClick={() => startAssign(e)}
                              onFocus={() => setAssignHighlight(i)}
                              onKeyDown={ev => {
                                if (ev.key === 'Enter') { ev.preventDefault(); startAssign(e); }
                                else if (ev.key === 'ArrowDown') { ev.preventDefault(); assignListRef.current?.children[Math.min(i+1, filteredEmployees.length-1)]?.focus(); }
                                else if (ev.key === 'ArrowUp') { ev.preventDefault(); i === 0 ? ev.currentTarget.closest('.toolbar__search')?.querySelector('input')?.focus() : assignListRef.current?.children[i-1]?.focus(); }
                                else if (ev.key === 'Escape') closeAssign();
                              }}
                              style={{display:'block',width:'100%',textAlign:'left',padding:'10px 14px',cursor:'pointer',fontSize:'13px',borderBottom:'1px solid var(--ink-100)',border:'none',background: i===assignHighlight ? 'var(--cream-50)' : 'transparent',outline:'none',transition:'background .1s'}}>
                              <div style={{fontWeight:600}}>{e.name}</div>
                              <div style={{fontSize:'11px',color:'var(--ink-300)'}}><span className="mono">{e.id}</span> · {e.dept}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                )}

                {roleAssignees.length === 0 ? (
                  <div className="audit-empty">
                    <Icon name="userPlus" size={24} stroke={1.2} />
                    <div className="audit-empty__title">{isES ? 'Sin asignaciones' : 'No assignments'}</div>
                    <div className="audit-empty__sub">{isES ? 'Este rol no tiene empleados asignados aún.' : 'This role has no employees assigned yet.'}</div>
                  </div>
                ) : (
                  <div className="audit-list">
                {roleAssignees.map(a => {
                  const c = creds[a.empId];
                  const isEditingCred = editCred === a.empId;
                  return isEditingCred ? (
                    <div key={a.empId} className="status-card status-card--new" style={{animation:`${credClosing?'credFormOut .38s':'credFormIn .42s'} ease-in-out both`,margin:'4px 0',pointerEvents:credClosing?'none':'auto',borderLeftColor:curRole.color}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:curRole.color,display:'grid',placeItems:'center',fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0}}>
                          {a.emp ? a.emp.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="act-panel__name" style={{fontSize:'14px'}}>{a.emp ? a.emp.name : a.empId}</div>
                          <div className="act-panel__dept" style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'2px'}}>
                            {a.emp && <span>{a.emp.dept}</span>}
                            <span>· <span className="mono">{a.empId}</span></span>
                            {editCredEmail && <span>· {editCredEmail}</span>}
                          </div>
                        </div>
                      </div>
                      {(editCredFieldErr.email || editCredFieldErr.pass) && (
                        <div className="login__error" role="alert" style={{padding:'9px 12px',gap:'8px'}}>
                          <div className="login__error-icon" style={{width:'26px',height:'26px'}}><Icon name="alertTriangle" size={13} stroke={2.4} /></div>
                          <div>
                            <div className="login__error-title" style={{fontSize:'12px'}}>{isES ? 'Campos obligatorios' : 'Required fields'}</div>
                            <div className="login__error-sub" style={{fontSize:'11px'}}>
                              {editCredFieldErr.email && editCredFieldErr.pass
                                ? (isES ? 'El correo y la contraseña son obligatorios.' : 'Email and password are required.')
                                : editCredFieldErr.email
                                  ? (isES ? 'El correo institucional es obligatorio.' : 'Institutional email is required.')
                                  : editCredPass.trim()
                                    ? (isES ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.')
                                    : (isES ? 'La contraseña de inicio es obligatoria.' : 'Login password is required.')}
                            </div>
                          </div>
                        </div>
                      )}
                      <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                        <label className="field__label">{isES ? 'Correo' : 'Email'}<span className="field__req">*</span></label>
                        <input type="email" className={`field__input status-new__input${editCredFieldErr.email?' field__input--err':''}`} value={editCredEmail}
                          onChange={e => { const v=e.target.value; setEditCredEmail(v); setEditCredFieldErr(p=>({...p,email:p.email?!v.trim():false})); }}
                          onKeyDown={e => e.key==='Enter' && saveEditCred()}
                          placeholder="usuario@uasd.edu.do" autoFocus />
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                        <label className="field__label">{isES ? 'Contraseña' : 'Password'}<span className="field__req">*</span></label>
                        <div style={{position:'relative'}}>
                          <input type={editCredShowPass?'text':'password'} className={`field__input status-new__input${editCredFieldErr.pass?' field__input--err':''}`} value={editCredPass}
                            onChange={e => { const v=e.target.value; setEditCredPass(v); setEditCredFieldErr(p=>({...p,pass:p.pass?(!v.trim()||v.length<6):false})); }}
                            onKeyDown={e => e.key==='Enter' && saveEditCred()}
                            placeholder="••••••••" style={{paddingRight:'38px'}} />
                          <button onClick={() => setEditCredShowPass(p=>!p)}
                            style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--ink-400)',display:'grid',placeItems:'center',padding:'2px',transition:'color .15s ease'}}
                            onMouseEnter={e => e.currentTarget.style.color='var(--ink-800)'}
                            onMouseLeave={e => e.currentTarget.style.color='var(--ink-400)'}>
                            <Icon name={editCredShowPass ? 'eyeOff' : 'eye'} size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="status-new__actions">
                        <button className="status-new__cancel" onClick={() => closeCred()}>{isES ? 'Cancelar' : 'Cancel'}</button>
                        <button className="status-new__save" onClick={saveEditCred}>{isES ? 'Guardar' : 'Save'}</button>
                      </div>
                    </div>
                  ) : (
                  <div key={a.empId} className="audit-entry role-assignee-row" style={{alignItems:'center',padding:'12px 0',animation:lastClosedCred===a.empId?'credFormIn .5s cubic-bezier(0.0,0.0,0.2,1) both':undefined}}>
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
                    {canManageAssignments && (
                    <div className="role-assignee-actions" style={{display:'flex',gap:'4px'}}>
                      {canEditCred(a) && (
                        <button className="table__action-btn" onClick={() => { setEditCred(a.empId); setEditCredEmail(c?.email || a.emp?.email || ''); setEditCredPass(c?.password || ''); }} title={isES?(c?'Editar credenciales':'Asignar credenciales'):(c?'Edit credentials':'Assign credentials')}>
                          <Icon name={c ? 'edit' : 'key'} size={14} />
                        </button>
                      )}
                      <button className="table__action-btn table__action-btn--del" onClick={() => removeAssign(a.empId, a.roleId)} title={isES?'Quitar rol':'Remove role'}>
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                    )}
                  </div>
                  );
                })}
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="audit-empty" style={{minHeight:'480px',justifyContent:'center'}}>
            12  <Icon name="shield" size={28} stroke={1.2} />
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
