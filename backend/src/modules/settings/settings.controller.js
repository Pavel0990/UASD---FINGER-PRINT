const svc = require('./settings.service');
const { logAudit } = require('../audit/audit.service');

async function getSettings(req, res, next) {
  try {
    const row = await svc.getSettings();
    res.json({ lateThresholdMinutes: row.lateThresholdMinutes });
  } catch (err) { next(err); }
}

async function patchSettings(req, res, next) {
  try {
    const { lateThresholdMinutes } = req.body;
    const n = Number(lateThresholdMinutes);
    if (!Number.isInteger(n) || n < 0 || n > 120) {
      return res.status(400).json({ error: 'lateThresholdMinutes_invalid' });
    }
    const row = await svc.updateSettings({ lateThresholdMinutes: n });
    await logAudit({
      actorEmployeeId: req.user.employeeId,
      actionType: 'edit',
      subjectLabel: 'Configuración del sistema',
      detail: { kind: 'settings', lateThresholdMinutes: n },
    });
    res.json({ lateThresholdMinutes: row.lateThresholdMinutes });
  } catch (err) { next(err); }
}

module.exports = { getSettings, patchSettings };
