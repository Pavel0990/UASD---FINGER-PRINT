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
  try {
    const now = new Date();
    const time = now.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = now.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    localStorage.setItem('uasd_last_login', `${date} ${time}`);
  } catch {}
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
  const [employees, departments, statuses, roles, assignments, auditData, holidays] = await Promise.all([
    apiFetch('/employees'),
    apiFetch('/departments'),
    apiFetch('/employee-statuses'),
    apiFetch('/roles'),
    apiFetch('/role-assignments'),
    apiFetch('/audit-log?limit=200').catch(() => ({ entries: [] })),
    apiFetch('/holidays').catch(() => []),
  ]);

  EMPLOYEES.length = 0;
  EMPLOYEES.push(...employees);

  // Mismo patrón que EMPLOYEES: HOLIDAYS_CACHE (shared.jsx) se muta en sitio para que
  // isHoliday()/getHolidays() sigan siendo síncronas en todos sus call sites actuales.
  if (typeof HOLIDAYS_CACHE !== 'undefined') {
    HOLIDAYS_CACHE.length = 0;
    HOLIDAYS_CACHE.push(...holidays);
  }

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

/* ── Asistencia / WebAuthn / Feriados (Fase 2) ──────────────────────────
   El kiosco (auth-options/auth-verify) no tiene sesión admin — apiFetch ya
   omite el header Authorization cuando DataStore.session es null, así que
   estas dos llamadas funcionan igual sin login. */

function waRegisterOptions(opts = {}) {
  return apiFetch('/attendance/webauthn/register-options', { method: 'POST', body: JSON.stringify(opts) });
}
function waRegisterVerify(attestationResponse, deviceLabel) {
  return apiFetch('/attendance/webauthn/register-verify', { method: 'POST', body: JSON.stringify({ attestationResponse, deviceLabel }) });
}
function waLinkCredential(employeeId, credential, deviceLabel) {
  return apiFetch('/attendance/webauthn/link-credential', { method: 'POST', body: JSON.stringify({ employeeId, credential, deviceLabel }) });
}
function waAuthOptions() {
  return apiFetch('/attendance/webauthn/auth-options', { method: 'POST', body: JSON.stringify({}) });
}
function waAuthVerify(assertionResponse) {
  return apiFetch('/attendance/webauthn/auth-verify', { method: 'POST', body: JSON.stringify({ assertionResponse }) });
}

function apiGetAttendance(params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null)).toString();
  return apiFetch('/attendance' + (qs ? '?' + qs : ''));
}
function apiPostManualAttendance(data) {
  return apiFetch('/attendance/manual', { method: 'POST', body: JSON.stringify(data) });
}
function apiPatchAttendance(id, patch) {
  return apiFetch('/attendance/' + id, { method: 'PATCH', body: JSON.stringify(patch) });
}
function apiGetAbsences(params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null)).toString();
  return apiFetch('/absences' + (qs ? '?' + qs : ''));
}
function apiPostAbsence(data) {
  return apiFetch('/absences', { method: 'POST', body: JSON.stringify(data) });
}
function apiPatchAbsence(id, patch) {
  return apiFetch('/absences/' + id, { method: 'PATCH', body: JSON.stringify(patch) });
}
function apiDeleteAbsence(id) {
  return apiFetch('/absences/' + id, { method: 'DELETE' });
}
function apiGetHolidays(year) {
  return apiFetch('/holidays' + (year ? '?year=' + year : ''));
}
function apiPostHoliday(data) {
  return apiFetch('/holidays', { method: 'POST', body: JSON.stringify(data) });
}
function apiDeleteHoliday(id) {
  return apiFetch('/holidays/' + id, { method: 'DELETE' });
}
function apiPostEmployeeStatus(data) {
  return apiFetch('/employee-statuses', { method: 'POST', body: JSON.stringify(data) });
}

/* ── Finca / Liceo (Fase 3) ── */
function apiGetRoster(location) {
  return apiFetch('/roster?location=' + location);
}
function apiAddToRoster(employeeId, location) {
  return apiFetch('/roster', { method: 'POST', body: JSON.stringify({ employeeId, location }) });
}
function apiRemoveFromRoster(employeeId, location) {
  return apiFetch('/roster/' + encodeURIComponent(employeeId) + '?location=' + location, { method: 'DELETE' });
}
function apiGetRosterDaily(location) {
  return apiFetch('/roster/' + location + '/daily');
}
function apiSaveRosterDay(location, date, presentEmpIds) {
  return apiFetch('/roster/' + location + '/save-day', { method: 'POST', body: JSON.stringify({ date, presentEmpIds }) });
}

/* ── Eventualidades / Vacaciones (Fase 4) ── */
function apiGetEventualities(employeeId) {
  return apiFetch('/eventualities' + (employeeId ? '?employeeId=' + encodeURIComponent(employeeId) : ''));
}
function apiPostEventuality(data) {
  return apiFetch('/eventualities', { method: 'POST', body: JSON.stringify(data) });
}
function apiPatchEventuality(id, data) {
  return apiFetch('/eventualities/' + id, { method: 'PATCH', body: JSON.stringify(data) });
}
function apiDeleteEventuality(id) {
  return apiFetch('/eventualities/' + id, { method: 'DELETE' });
}
function apiPatchEventualityEstado(id, estado) {
  return apiFetch('/eventualities/' + id + '/estado', { method: 'PATCH', body: JSON.stringify({ estado }) });
}
function apiGetCollectiveVacations(year) {
  return apiFetch('/collective-vacations?year=' + year);
}
function apiSetCollectiveVacationDays(year, dates) {
  return apiFetch('/collective-vacations/' + year + '/days', { method: 'POST', body: JSON.stringify({ dates }) });
}
function apiAddCollectiveVacationEmployees(year, employeeIds) {
  return apiFetch('/collective-vacations/' + year + '/employees', { method: 'POST', body: JSON.stringify({ employeeIds }) });
}
function apiRemoveCollectiveVacationEmployee(year, employeeId) {
  return apiFetch('/collective-vacations/' + year + '/employees/' + encodeURIComponent(employeeId), { method: 'DELETE' });
}
function apiRemoveAllCollectiveVacationEmployees(year) {
  return apiFetch('/collective-vacations/' + year + '/employees', { method: 'DELETE' });
}

window.DataStore = DataStore;
window.apiFetch = apiFetch;
window.loginRequest = loginRequest;
window.logoutRequest = logoutRequest;
window.restoreSession = restoreSession;
window.bootstrapStore = bootstrapStore;
window.isBackendActive = isBackendActive;
window.waRegisterOptions = waRegisterOptions;
window.waRegisterVerify = waRegisterVerify;
window.waLinkCredential = waLinkCredential;
window.waAuthOptions = waAuthOptions;
window.waAuthVerify = waAuthVerify;
window.apiGetAttendance = apiGetAttendance;
window.apiPostManualAttendance = apiPostManualAttendance;
window.apiPatchAttendance = apiPatchAttendance;
window.apiGetAbsences = apiGetAbsences;
window.apiPostAbsence = apiPostAbsence;
window.apiPatchAbsence = apiPatchAbsence;
window.apiDeleteAbsence = apiDeleteAbsence;
window.apiGetHolidays = apiGetHolidays;
window.apiPostHoliday = apiPostHoliday;
window.apiDeleteHoliday = apiDeleteHoliday;
window.apiPostEmployeeStatus = apiPostEmployeeStatus;
window.apiGetRoster = apiGetRoster;
window.apiAddToRoster = apiAddToRoster;
window.apiRemoveFromRoster = apiRemoveFromRoster;
window.apiGetRosterDaily = apiGetRosterDaily;
window.apiSaveRosterDay = apiSaveRosterDay;
window.apiGetEventualities = apiGetEventualities;
window.apiPostEventuality = apiPostEventuality;
window.apiPatchEventuality = apiPatchEventuality;
window.apiDeleteEventuality = apiDeleteEventuality;
window.apiPatchEventualityEstado = apiPatchEventualityEstado;
window.apiGetCollectiveVacations = apiGetCollectiveVacations;
window.apiSetCollectiveVacationDays = apiSetCollectiveVacationDays;
window.apiAddCollectiveVacationEmployees = apiAddCollectiveVacationEmployees;
window.apiRemoveCollectiveVacationEmployee = apiRemoveCollectiveVacationEmployee;
window.apiRemoveAllCollectiveVacationEmployees = apiRemoveAllCollectiveVacationEmployees;
