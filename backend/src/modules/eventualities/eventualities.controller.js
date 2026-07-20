const svc = require('./eventualities.service');
const { serializeEventuality } = require('../../utils/serializers');
const { logAudit } = require('../audit/audit.service');

async function getEventualities(req, res, next) {
  try {
    const rows = await svc.listEventualities({ employeeId: req.query.employeeId });
    res.json(rows.map(serializeEventuality));
  } catch (err) { next(err); }
}

async function postEventuality(req, res, next) {
  try {
    const { employeeId, date, dateEnd, type, motivo } = req.body;
    if (!employeeId || !date || !type || !motivo) return res.status(400).json({ error: 'employeeId_date_type_motivo_required' });
    const row = await svc.createEventuality({ employeeId, dateStart: date, dateEnd, type, motivo });
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'add', subjectEmployeeId: employeeId, detail: { kind: 'eventuality', type, date } });
    res.status(201).json(serializeEventuality(row));
  } catch (err) { next(err); }
}

async function patchEventuality(req, res, next) {
  try {
    const { date, dateEnd, type, motivo } = req.body;
    const row = await svc.updateEventuality(req.params.id, { dateStart: date, dateEnd, type, motivo });
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', subjectEmployeeId: row.employeeId, detail: { kind: 'eventuality', id: req.params.id } });
    res.json(serializeEventuality(row));
  } catch (err) { next(err); }
}

async function deleteEventuality(req, res, next) {
  try {
    const row = await svc.deleteEventuality(req.params.id);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'delete', subjectEmployeeId: row.employeeId, detail: { kind: 'eventuality', id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
}

async function patchEstado(req, res, next) {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: 'estado_required' });
    const row = await svc.updateEstado(req.params.id, estado, req.user.employeeId);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', subjectEmployeeId: row.employeeId, detail: { kind: 'eventuality_estado', id: req.params.id, estado } });
    res.json(serializeEventuality(row));
  } catch (err) { next(err); }
}

module.exports = { getEventualities, postEventuality, patchEventuality, deleteEventuality, patchEstado };
