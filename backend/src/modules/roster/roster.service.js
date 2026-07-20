const prisma = require('../../db/prisma');
const { isHoliday } = require('../holidays/holidays.service');

function dateOnlyUTC(d) {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
}
function toDateStr(d) {
  return new Date(d).toISOString().slice(0, 10);
}

// El gate de elegibilidad hoy es inconsistente entre pantallas (kiosco usa status==='ok',
// Finca/Liceo/Reportes usan status!=='inactive', dejando pasar pending/custom). Se unifica acá
// a 'ok' — el más estricto, y ya es el que usa el kiosco — filtrando en cada GET, no solo al
// agregar, para que un empleado que pasa a inactivo desaparezca del roster de inmediato.
async function listRoster(location) {
  const rows = await prisma.rosterAssignment.findMany({
    where: { location, employee: { status: { code: 'ok' } } },
    select: { employeeId: true },
  });
  return rows.map((r) => r.employeeId);
}

async function addToRoster(employeeId, location) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { status: { select: { code: true } } },
  });
  if (!employee || employee.status.code !== 'ok') {
    const err = new Error(`employee_not_eligible: ${employeeId}`);
    err.status = 409;
    err.publicMessage = 'employee_not_eligible';
    throw err;
  }
  return prisma.rosterAssignment.upsert({
    where: { employeeId_location: { employeeId, location } },
    update: {},
    create: { employeeId, location },
  });
}

// Replica el comportamiento actual de removeFromFarm/removeFromLiceo: además de sacar del
// roster, borra el historial de asistencia/ausencias que ese empleado generó en esa sede.
async function removeFromRoster(employeeId, location) {
  await prisma.$transaction([
    prisma.rosterAssignment.deleteMany({ where: { employeeId, location } }),
    prisma.attendanceEvent.deleteMany({ where: { employeeId, source: location } }),
    prisma.absence.deleteMany({ where: { employeeId, source: location } }),
  ]);
}

// Reconstruye la forma { "YYYY-MM-DD": { empId: true, ... } } que ya espera el frontend
// (daily de finca.jsx/liceo.jsx) a partir de attendance_events con ese source.
async function getDaily(location) {
  const rows = await prisma.attendanceEvent.findMany({ where: { source: location } });
  const daily = {};
  rows.forEach((r) => {
    const dateStr = toDateStr(r.date);
    if (!daily[dateStr]) daily[dateStr] = {};
    daily[dateStr][r.employeeId] = true;
  });
  return daily;
}

// Transaccional: para cada miembro del roster, presente → upsert attendance_events;
// ausente → upsert absences (salvo feriado) — mismo puente que hoy hace
// finca.jsx/liceo.jsx saveAttendance() a mano contra dos localStorage distintos.
async function saveDay(location, dateStr, presentEmpIds) {
  const date = dateOnlyUTC(dateStr);
  const presentSet = new Set(presentEmpIds);
  const rosterIds = await listRoster(location);
  const isToday = toDateStr(new Date()) === dateStr;
  const holiday = await isHoliday(dateStr);

  await prisma.$transaction(async (tx) => {
    for (const employeeId of rosterIds) {
      if (presentSet.has(employeeId)) {
        await tx.absence.deleteMany({ where: { employeeId, date, source: location } });
        const existing = await tx.attendanceEvent.findUnique({ where: { employeeId_date: { employeeId, date } } });
        if (!existing || existing.source === location) {
          await tx.attendanceEvent.upsert({
            where: { employeeId_date: { employeeId, date } },
            update: { source: location },
            create: { employeeId, date, timeIn: isToday ? new Date() : null, late: false, source: location },
          });
        }
      } else {
        const existing = await tx.attendanceEvent.findUnique({ where: { employeeId_date: { employeeId, date } } });
        if (existing && existing.source === location) {
          await tx.attendanceEvent.delete({ where: { id: existing.id } });
        }
        if (!holiday) {
          await tx.absence.upsert({
            where: { employeeId_date: { employeeId, date } },
            update: {},
            create: { employeeId, date, justified: false, source: location },
          });
        }
      }
    }
  });

  return getDaily(location);
}

module.exports = { listRoster, addToRoster, removeFromRoster, getDaily, saveDay };
