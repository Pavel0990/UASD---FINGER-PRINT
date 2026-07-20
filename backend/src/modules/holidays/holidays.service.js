const prisma = require('../../db/prisma');

async function listHolidays(year) {
  const where = { removed: false };
  if (year) {
    where.date = { gte: new Date(Date.UTC(+year, 0, 1)), lt: new Date(Date.UTC(+year + 1, 0, 1)) };
  }
  return prisma.holiday.findMany({ where, orderBy: { date: 'asc' } });
}

async function createHoliday({ date, nameEs, nameEn, type }) {
  return prisma.holiday.upsert({
    where: { date: new Date(date) },
    update: { nameEs, nameEn, type, removed: false },
    create: { date: new Date(date), nameEs, nameEn, type: type || 'custom' },
  });
}

// Un feriado default (fixed/uasd) nunca se borra de verdad — se marca removed=true (soft-delete,
// igual que localStorage['uasd_holidays_removed'] hoy). Uno custom sí se borra directo.
async function deleteHoliday(id) {
  const row = await prisma.holiday.findUnique({ where: { id: Number(id) } });
  if (!row) throw Object.assign(new Error('not_found'), { status: 404, publicMessage: 'not_found' });
  if (row.type === 'custom') return prisma.holiday.delete({ where: { id: Number(id) } });
  return prisma.holiday.update({ where: { id: Number(id) }, data: { removed: true } });
}

async function isHoliday(dateStr) {
  const row = await prisma.holiday.findFirst({ where: { date: new Date(dateStr), removed: false } });
  return !!row;
}

module.exports = { listHolidays, createHoliday, deleteHoliday, isHoliday };
