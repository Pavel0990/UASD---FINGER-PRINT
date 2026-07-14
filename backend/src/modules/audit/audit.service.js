const prisma = require('../../db/prisma');

// Se llama internamente desde otros módulos (employees, roles) al mutar datos.
// El actor SIEMPRE sale de la sesión autenticada (req.user), nunca del body —
// fix del bug actual donde el actor de auditoría está hardcodeado a AUDIT_ADMINS[0].
async function logAudit({ actorEmployeeId, actionType, subjectEmployeeId = null, subjectLabel = null, detail = null }) {
  return prisma.auditLog.create({
    data: { actorEmployeeId, actionType, subjectEmployeeId, subjectLabel, detail },
  });
}

async function listAuditLog({ limit = 50, offset = 0 }) {
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { ts: 'desc' },
      take: limit,
      skip: offset,
      include: {
        actor: { select: { id: true, name: true, department: { select: { name: true } } } },
        subject: { select: { id: true, name: true } },
      },
    }),
    prisma.auditLog.count(),
  ]);
  return { rows, total };
}

module.exports = { logAudit, listAuditLog };
