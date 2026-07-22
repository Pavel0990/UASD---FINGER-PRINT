const prisma = require('../../db/prisma');
const { getSettings } = require('../settings/settings.service');

function dateOnlyUTC(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// El registro manual de tardanza (dashboard.jsx → SimpleTimePicker) manda la hora
// suelta ("8:30 AM", sin fecha) — new Date("8:30 AM") es Invalid Date y Prisma
// rechaza el insert completo. Si viene en ese formato, se combina con `dateStr`
// usando el constructor local (mismo criterio que recordAttendance/isLate, que
// leen con getHours() en hora LOCAL del servidor, no UTC — construir con
// setUTCHours acá desalinearía la hora mostrada por formatTime12h). Si ya es
// un datetime completo (ISO), se usa tal cual.
function combineDateTime(dateStr, timeStr) {
  if (!timeStr) return null;
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(timeStr);
  if (!m) {
    const d = new Date(timeStr);
    return isNaN(d) ? null : d;
  }
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  const [y, mo, da] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(y, mo - 1, da, h, parseInt(m[2], 10), 0, 0);
}

// Replica shared.jsx:1320-1335 (getLateMinutes) del lado servidor — misma regex. El umbral
// (antes 15 fijo) ahora viene de SystemConfig (ver settings.service.js) y se aplica al momento
// del marcaje — es intencional que el resultado quede "congelado" en el registro histórico:
// cambiar el umbral después no recalcula marcajes pasados.
function isLate(schedule, when, thresholdMinutes = 15) {
  if (!schedule) return false;
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(schedule);
  if (!m) return false;
  let startH = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') startH += 12;
  const startMin = startH * 60 + parseInt(m[2], 10);
  const actualMin = when.getHours() * 60 + when.getMinutes();
  return (actualMin - startMin) > thresholdMinutes;
}

// Entrada/salida atómica: el INSERT inicial es la entrada; si dos marcajes casi simultáneos
// compiten por ser "la entrada", la restricción UNIQUE(employee_id,date) de Postgres garantiza
// que solo uno gane el INSERT — el otro recibe P2002 real (no una condición de carrera de
// aplicación) y cae al branch de salida. Reemplaza el patrón read-JSON→mutate→write-JSON no
// atómico de hoy sobre localStorage['uasd_daily_attendance'].
async function recordAttendance(employeeId, schedule, source = 'kiosk') {
  const now = new Date();
  const date = dateOnlyUTC(now);
  const { lateThresholdMinutes } = await getSettings();
  const late = isLate(schedule, now, lateThresholdMinutes);

  try {
    const created = await prisma.attendanceEvent.create({
      data: { employeeId, date, timeIn: now, late, source },
    });
    return { kind: 'in', time: created.timeIn, record: created };
  } catch (err) {
    if (err.code !== 'P2002') throw err;
    return prisma.$transaction(async (tx) => {
      const existing = await tx.attendanceEvent.findUnique({ where: { employeeId_date: { employeeId, date } } });
      if (!existing) throw err;
      if (existing.timeOut) return { kind: 'done', time: existing.timeOut, record: existing };
      const updated = await tx.attendanceEvent.update({ where: { id: existing.id }, data: { timeOut: now } });
      return { kind: 'out', time: updated.timeOut, record: updated };
    });
  }
}

async function listAttendance({ employeeId, from, to }) {
  return prisma.attendanceEvent.findMany({
    where: {
      employeeId: employeeId || undefined,
      date: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined },
    },
    orderBy: { date: 'desc' },
  });
}

async function createManualAttendance({ employeeId, date, timeIn, timeOut, justified, late }) {
  const parsedIn  = combineDateTime(date, timeIn);
  const parsedOut = combineDateTime(date, timeOut);
  return prisma.attendanceEvent.upsert({
    where: { employeeId_date: { employeeId, date: dateOnlyUTC(new Date(date)) } },
    update: { timeIn: timeIn ? parsedIn : undefined, timeOut: timeOut ? parsedOut : undefined, justified: !!justified, late: !!late },
    create: {
      employeeId,
      date: dateOnlyUTC(new Date(date)),
      timeIn: parsedIn,
      timeOut: parsedOut,
      justified: !!justified,
      late: !!late,
      source: 'manual',
    },
  });
}

async function updateAttendance(id, { justified, justifyNote, timeIn, timeOut }) {
  const data = {};
  if (justified !== undefined) data.justified = justified;
  if (justifyNote !== undefined) data.justifyNote = justifyNote;
  if (timeIn !== undefined) data.timeIn = timeIn ? new Date(timeIn) : null;
  if (timeOut !== undefined) data.timeOut = timeOut ? new Date(timeOut) : null;
  return prisma.attendanceEvent.update({ where: { id: BigInt(id) }, data });
}

async function listAbsences({ employeeId, from, to }) {
  return prisma.absence.findMany({
    where: {
      employeeId: employeeId || undefined,
      date: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined },
    },
    orderBy: { date: 'desc' },
  });
}

async function createAbsence({ employeeId, date, justified, justifyNote, source }) {
  return prisma.absence.upsert({
    where: { employeeId_date: { employeeId, date: dateOnlyUTC(new Date(date)) } },
    update: { justified: !!justified, justifyNote: justifyNote || null, source: source || null },
    create: { employeeId, date: dateOnlyUTC(new Date(date)), justified: !!justified, justifyNote: justifyNote || null, source: source || null },
  });
}

async function updateAbsence(id, { justified, justifyNote }) {
  const data = {};
  if (justified !== undefined) data.justified = justified;
  if (justifyNote !== undefined) data.justifyNote = justifyNote;
  return prisma.absence.update({ where: { id: BigInt(id) }, data });
}

async function deleteAbsence(id) {
  return prisma.absence.delete({ where: { id: BigInt(id) } });
}

module.exports = {
  recordAttendance, listAttendance, createManualAttendance, updateAttendance,
  listAbsences, createAbsence, updateAbsence, deleteAbsence,
};
