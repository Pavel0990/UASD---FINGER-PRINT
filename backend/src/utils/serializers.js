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

module.exports = { dateToDDMMYYYY, ddmmyyyyToDate, serializeEmployee, serializeRole };
