/* store.jsx — puente entre el frontend y el backend real (Node + Postgres).
   Se carga justo después de shared.jsx. No depende de npm/bundler: vanilla JS,
   igual que el resto de los .jsx.

   Patrón: mientras no haya sesión (DataStore.session === null), toda la app se
   comporta EXACTAMENTE como antes (localStorage puro) — esto es a propósito,
   para no romper el flujo de desarrollo por defecto (la app hoy arranca
   directo en 'dashboard', sin pasar por login). En cuanto login.jsx completa
   un login real, bootstrapStore() puebla los datos reales del backend y los
   helpers de shared.jsx/roles.jsx empiezan a leer/escribir contra la API. */

const DataStore = {
  session: null, // { accessToken, user: {id,name,email,roleId,perms} }
  employees: [],
  departments: [],
  employeeStatuses: [],
  roles: [],
  assignments: [],
  auditLog: [],
  bootstrapped: false,
};

const API_BASE = '/api';

async function apiFetch(path, opts = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  if (DataStore.session?.accessToken) headers.Authorization = 'Bearer ' + DataStore.session.accessToken;

  let res = await fetch(API_BASE + path, { ...opts, headers, credentials: 'include' });

  if (res.status === 401 && DataStore.session) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.Authorization = 'Bearer ' + DataStore.session.accessToken;
      res = await fetch(API_BASE + path, { ...opts, headers, credentials: 'include' });
    }
  }

  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch {}
    const err = new Error((body && body.error) || `http_${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

async function tryRefresh() {
  try {
    const res = await fetch(API_BASE + '/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    DataStore.session = { accessToken: data.accessToken, user: data.user };
    return true;
  } catch {
    return false;
  }
}

async function loginRequest(email, password) {
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((body && body.error) || 'login_failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  DataStore.session = { accessToken: body.accessToken, user: body.user };
  return body.user;
}

async function logoutRequest() {
  try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
  DataStore.session = null;
}

// Se puede llamar al montar la app para restaurar sesión desde la cookie de
// refresh (httpOnly) sin pedir login de nuevo si el token sigue vigente.
async function restoreSession() {
  const ok = await tryRefresh();
  if (ok) { try { await bootstrapStore(); } catch { /* backend caído: sigue en modo localStorage */ } }
  return ok;
}

// Único punto async real de la app: se corre una vez tras login (o restore),
// antes de mostrar pantallas autenticadas. Muta EMPLOYEES EN SITIO (no lo
// reasigna) para que dashboard.jsx/finca.jsx/liceo.jsx/vacaciones.jsx/
// register.jsx, que ya hacen EMPLOYEES.find/.filter/.map directamente, vean
// los datos reales sin que se les toque una sola línea.
async function bootstrapStore() {
  const [employees, departments, statuses, roles, assignments, auditData] = await Promise.all([
    apiFetch('/employees'),
    apiFetch('/departments'),
    apiFetch('/employee-statuses'),
    apiFetch('/roles'),
    apiFetch('/role-assignments'),
    apiFetch('/audit-log?limit=200').catch(() => ({ entries: [] })),
  ]);

  EMPLOYEES.length = 0;
  EMPLOYEES.push(...employees);

  DataStore.employees = EMPLOYEES;
  DataStore.departments = departments;
  DataStore.employeeStatuses = statuses;
  DataStore.roles = roles;
  DataStore.assignments = assignments;
  DataStore.auditLog = auditData.entries || [];
  DataStore.bootstrapped = true;

  return DataStore;
}

function isBackendActive() {
  return !!DataStore.session;
}

window.DataStore = DataStore;
window.apiFetch = apiFetch;
window.loginRequest = loginRequest;
window.logoutRequest = logoutRequest;
window.restoreSession = restoreSession;
window.bootstrapStore = bootstrapStore;
window.isBackendActive = isBackendActive;
