const { listAuditLog } = require('./audit.service');

function initials(name) {
  return (name || '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

async function getAuditLog(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;
    const { rows, total } = await listAuditLog({ limit, offset });

    const entries = rows.map((r) => ({
      id: String(r.id), // BigInt no serializa a JSON directo
      ts: r.ts.toISOString(),
      actor: {
        id: r.actor.id,
        name: r.actor.name,
        initials: initials(r.actor.name),
        dept: r.actor.department ? r.actor.department.name : null,
      },
      type: r.actionType,
      subject: r.subject ? { id: r.subject.id, name: r.subject.name } : { id: r.subjectEmployeeId, name: r.subjectLabel },
    }));

    res.json({ entries, total, limit, offset });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAuditLog };
