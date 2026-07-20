const prisma = require('../../db/prisma');
const { isHoliday } = require('../holidays/holidays.service');

function dateOnlyUTC(d) {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
}
function toDateStr(d) {
  return new Date(d).toISOString().slice(0, 10);
}
function eachDay(startStr, endStr) {
  const days = [];
  let d = new Date(startStr + 'T00:00:00Z');
  const end = new Date(endStr + 'T00:00:00Z');
  while (d <= end) {
    days.push(toDateStr(d));
    d = new Date(d.getTime() + 86400000);
  }
  return days;
}

// Al crear/editar una eventualidad, los días que cubre dejan de necesitar una ausencia —
// replica el "borrar ausencias en el rango nuevo" que hace dashboard.jsx submit().
async function clearAbsencesInRange(employeeId, startStr, endStr) {
  await prisma.absence.deleteMany({
    where: { employeeId, date: { gte: dateOnlyUTC(startStr), lte: dateOnlyUTC(endStr) } },
  });
}

// Al editar/borrar, los días que la eventualidad DEJA de cubrir puede que ahora falten
// justificación — regenera una ausencia si no hay marcaje ese día y no es feriado.
async function regenerateAbsencesInRange(employeeId, startStr, endStr) {
  for (const dateStr of eachDay(startStr, endStr)) {
    const date = dateOnlyUTC(dateStr);
    const [attendance, holiday] = await Promise.all([
      prisma.attendanceEvent.findUnique({ where: { employeeId_date: { employeeId, date } } }),
      isHoliday(dateStr),
    ]);
    if (!attendance && !holiday) {
      await prisma.absence.upsert({
        where: { employeeId_date: { employeeId, date } },
        update: {},
        create: { employeeId, date, justified: false },
      });
    }
  }
}

async function listEventualities({ employeeId }) {
  return prisma.eventuality.findMany({
    where: { employeeId: employeeId || undefined },
    orderBy: { dateStart: 'desc' },
  });
}

async function createEventuality({ employeeId, dateStart, dateEnd, type, motivo }) {
  const end = dateEnd || dateStart;
  await clearAbsencesInRange(employeeId, dateStart, end);
  // 'vacaciones' (vacaciones normales, unificadas acá) nunca tuvo flujo de aprobación en el
  // sistema anterior — se marca aceptada de inmediato para no introducir un paso nuevo.
  const estado = type === 'vacaciones' ? 'aceptado' : 'pendiente';
  return prisma.eventuality.create({
    data: { employeeId, dateStart: dateOnlyUTC(dateStart), dateEnd: dateOnlyUTC(end), type, motivo, estado },
  });
}

async function updateEventuality(id, { dateStart, dateEnd, type, motivo }) {
  const old = await prisma.eventuality.findUnique({ where: { id: Number(id) } });
  if (!old) throw Object.assign(new Error('not_found'), { status: 404, publicMessage: 'not_found' });

  const newStart = dateStart;
  const newEnd = dateEnd || dateStart;
  await clearAbsencesInRange(old.employeeId, newStart, newEnd);

  const updated = await prisma.eventuality.update({
    where: { id: Number(id) },
    data: { dateStart: dateOnlyUTC(newStart), dateEnd: dateOnlyUTC(newEnd), type, motivo },
    // estado NO se toca — preserva aprobación existente, igual que dashboard.jsx submit()
  });

  // Regenerar ausencias en los días que el rango viejo cubría y el nuevo ya no.
  const oldDays = new Set(eachDay(toDateStr(old.dateStart), toDateStr(old.dateEnd)));
  const newDays = new Set(eachDay(newStart, newEnd));
  const droppedDays = [...oldDays].filter((d) => !newDays.has(d));
  for (const dateStr of droppedDays) {
    await regenerateAbsencesInRange(old.employeeId, dateStr, dateStr);
  }

  return updated;
}

async function deleteEventuality(id) {
  const row = await prisma.eventuality.findUnique({ where: { id: Number(id) } });
  if (!row) throw Object.assign(new Error('not_found'), { status: 404, publicMessage: 'not_found' });
  await prisma.eventuality.delete({ where: { id: Number(id) } });
  await regenerateAbsencesInRange(row.employeeId, toDateStr(row.dateStart), toDateStr(row.dateEnd));
  return row;
}

async function updateEstado(id, estado, approverEmployeeId) {
  if (!['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
    throw Object.assign(new Error('invalid_estado'), { status: 400, publicMessage: 'invalid_estado' });
  }
  return prisma.eventuality.update({
    where: { id: Number(id) },
    data: { estado, approvedById: approverEmployeeId, approvedAt: new Date() },
  });
}

module.exports = { listEventualities, createEventuality, updateEventuality, deleteEventuality, updateEstado };
