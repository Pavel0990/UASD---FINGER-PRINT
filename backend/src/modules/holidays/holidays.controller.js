const svc = require('./holidays.service');
const { serializeHoliday } = require('../../utils/serializers');
const { logAudit } = require('../audit/audit.service');

async function getHolidays(req, res, next) {
  try {
    const rows = await svc.listHolidays(req.query.year);
    res.json(rows.map(serializeHoliday));
  } catch (err) { next(err); }
}

async function postHoliday(req, res, next) {
  try {
    const { date, name_es, name_en, type } = req.body;
    if (!date || !name_es || !name_en) return res.status(400).json({ error: 'date_name_es_name_en_required' });
    const row = await svc.createHoliday({ date, nameEs: name_es, nameEn: name_en, type });
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'add', subjectLabel: name_es, detail: { kind: 'holiday', date } });
    res.status(201).json(serializeHoliday(row));
  } catch (err) { next(err); }
}

async function deleteHoliday(req, res, next) {
  try {
    await svc.deleteHoliday(req.params.id);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'delete', detail: { kind: 'holiday', id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getHolidays, postHoliday, deleteHoliday };
