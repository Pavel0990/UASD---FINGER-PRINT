const prisma = require('../../db/prisma');

function dateOnlyUTC(d) {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
}
function toDateStr(d) {
  return new Date(d).toISOString().slice(0, 10);
}

async function getOrCreatePeriod(year) {
  return prisma.collectiveVacationPeriod.upsert({
    where: { year: Number(year) },
    update: {},
    create: { year: Number(year) },
  });
}

// Igual que listRoster (Finca/Liceo): filtra por status vigente en cada lectura, no solo al
// agregar, para que un empleado que pasa a inactivo desaparezca de inmediato.
async function getPeriod(year) {
  const period = await prisma.collectiveVacationPeriod.findUnique({
    where: { year: Number(year) },
    include: {
      days: true,
      assignments: { where: { employee: { status: { code: 'ok' } } } },
    },
  });
  if (!period) return { days: [], employeeIds: [] };
  return {
    days: period.days.map((d) => toDateStr(d.date)).sort(),
    employeeIds: period.assignments.map((a) => a.employeeId),
  };
}

// handleVacClick reemplaza el rango completo del año de una — nunca hay más de un
// período por año (confirmado en la investigación).
async function setDays(year, dates) {
  const period = await getOrCreatePeriod(year);
  await prisma.$transaction([
    prisma.collectiveVacationDay.deleteMany({ where: { periodId: period.id } }),
    ...(dates.length
      ? [prisma.collectiveVacationDay.createMany({ data: dates.map((d) => ({ periodId: period.id, date: dateOnlyUTC(d) })) })]
      : []),
  ]);
  return getPeriod(year);
}

async function addEmployees(year, employeeIds) {
  const eligible = await prisma.employee.findMany({
    where: { id: { in: employeeIds }, status: { code: 'ok' } },
    select: { id: true },
  });
  const eligibleIds = new Set(eligible.map((e) => e.id));
  const ineligible = employeeIds.filter((id) => !eligibleIds.has(id));
  if (ineligible.length) {
    const err = new Error(`employees_not_eligible: ${ineligible.join(', ')}`);
    err.status = 409;
    err.publicMessage = 'employees_not_eligible';
    throw err;
  }
  const period = await getOrCreatePeriod(year);
  await prisma.$transaction(
    employeeIds.map((employeeId) =>
      prisma.collectiveVacationAssignment.upsert({
        where: { periodId_employeeId: { periodId: period.id, employeeId } },
        update: {},
        create: { periodId: period.id, employeeId },
      })
    )
  );
  return getPeriod(year);
}

async function removeEmployee(year, employeeId) {
  const period = await prisma.collectiveVacationPeriod.findUnique({ where: { year: Number(year) } });
  if (period) await prisma.collectiveVacationAssignment.deleteMany({ where: { periodId: period.id, employeeId } });
  return getPeriod(year);
}

async function removeAllEmployees(year) {
  const period = await prisma.collectiveVacationPeriod.findUnique({ where: { year: Number(year) } });
  if (period) await prisma.collectiveVacationAssignment.deleteMany({ where: { periodId: period.id } });
  return getPeriod(year);
}

module.exports = { getPeriod, setDays, addEmployees, removeEmployee, removeAllEmployees };
