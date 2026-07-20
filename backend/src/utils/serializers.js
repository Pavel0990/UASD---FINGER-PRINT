// Traduce entre el shape de fila de Prisma (con relaciones) y el shape que el
// frontend ya conoce (mismo formato que el array EMPLOYEES hardcodeado de shared.jsx),
// para que el frontend no tenga que cambiar cómo lee estos objetos.

function dateToDDMMYYYY(date) {
  if (!date) return null;
  const d = new Date(date);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function ddmmyyyyToDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split('/').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function serializeEmployee(row) {
  return {
    id: row.id,
    name: row.name,
    cedula: row.cedula,
    dept: row.department ? row.department.name : null,
    role: row.roleTitle,
    email: row.email,
    phone: row.phone,
    schedule: row.schedule,
    workDays: row.workDays,
    status: row.status ? row.status.code : null,
    inactiveReason: row.inactiveReason,
    inactiveComment: row.inactiveComment,
    dob: dateToDDMMYYYY(row.dob),
    gender: row.gender,
    photo: row.photoUrl,
    hasRole: row.roleAssignment ? !!row.roleAssignment.roleId : undefined,
  };
}

function serializeRole(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    isProtected: row.isProtected,
    maxMembers: row.maxMembers,
    perms: row.permissions ? row.permissions.map((p) => p.permissionId) : [],
  };
}

// Mismo formato que shared.jsx:1251-1261 (formatTime) — el frontend ya sabe leer
// "08:14:32 AM" en las columnas de asistencia/tardanzas, así que el backend replica
// exactamente esa forma en vez de devolver ISO y obligar a tocar cada consumidor.
function formatTime12h(date) {
  if (!date) return null;
  const d = new Date(date);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const isPM = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m}:${s} ${isPM ? 'PM' : 'AM'}`;
}

function dateToYYYYMMDD(date) {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function serializeAttendance(row) {
  return {
    id: row.id.toString(),
    empId: row.employeeId,
    date: dateToYYYYMMDD(row.date),
    timeIn: formatTime12h(row.timeIn),
    timeOut: formatTime12h(row.timeOut),
    late: row.late,
    source: row.source,
    justified: row.justified,
    justifyNote: row.justifyNote || '',
  };
}

function serializeAbsence(row) {
  return {
    id: row.id.toString(),
    empId: row.employeeId,
    date: dateToYYYYMMDD(row.date),
    justified: row.justified,
    justifyNote: row.justifyNote || '',
    source: row.source || null,
  };
}

function serializeHoliday(row) {
  return {
    id: row.id,
    date: dateToYYYYMMDD(row.date),
    name_es: row.nameEs,
    name_en: row.nameEn,
    type: row.type,
  };
}

// Mismo shape que ya arma dashboard.jsx (dashboard.jsx:1744-1745): dateEnd solo aparece si
// es distinto de date, para no obligar a tocar cada consumidor que asume ese shape opcional.
function serializeEventuality(row) {
  const date = dateToYYYYMMDD(row.dateStart);
  const dateEnd = dateToYYYYMMDD(row.dateEnd);
  const out = { id: row.id, empId: row.employeeId, date, type: row.type, motivo: row.motivo, estado: row.estado };
  if (dateEnd !== date) out.dateEnd = dateEnd;
  if (row.approvedById) out.approvedBy = row.approvedById;
  if (row.approvedAt) out.approvedAt = row.approvedAt.toISOString();
  return out;
}

module.exports = {
  dateToDDMMYYYY, ddmmyyyyToDate, serializeEmployee, serializeRole,
  formatTime12h, dateToYYYYMMDD, serializeAttendance, serializeAbsence, serializeHoliday,
  serializeEventuality,
};
