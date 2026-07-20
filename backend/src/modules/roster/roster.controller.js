const svc = require('./roster.service');
const { logAudit } = require('../audit/audit.service');

function validLocation(loc) {
  return loc === 'finca' || loc === 'liceo';
}

async function getRoster(req, res, next) {
  try {
    const { location } = req.query;
    if (!validLocation(location)) return res.status(400).json({ error: 'invalid_location' });
    res.json(await svc.listRoster(location));
  } catch (err) { next(err); }
}

async function postRoster(req, res, next) {
  try {
    const { employeeId, location } = req.body;
    if (!employeeId || !validLocation(location)) return res.status(400).json({ error: 'employeeId_and_valid_location_required' });
    await svc.addToRoster(employeeId, location);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', subjectEmployeeId: employeeId, detail: { kind: 'roster_add', location } });
    res.status(201).json({ added: true });
  } catch (err) { next(err); }
}

async function deleteRosterMember(req, res, next) {
  try {
    const { location } = req.query;
    if (!validLocation(location)) return res.status(400).json({ error: 'invalid_location' });
    await svc.removeFromRoster(req.params.employeeId, location);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', subjectEmployeeId: req.params.employeeId, detail: { kind: 'roster_remove', location } });
    res.status(204).send();
  } catch (err) { next(err); }
}

async function getDaily(req, res, next) {
  try {
    const { location } = req.params;
    if (!validLocation(location)) return res.status(400).json({ error: 'invalid_location' });
    res.json(await svc.getDaily(location));
  } catch (err) { next(err); }
}

async function postSaveDay(req, res, next) {
  try {
    const { location } = req.params;
    const { date, presentEmpIds } = req.body;
    if (!validLocation(location) || !date) return res.status(400).json({ error: 'valid_location_and_date_required' });
    const daily = await svc.saveDay(location, date, presentEmpIds || []);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', detail: { kind: 'roster_save_day', location, date } });
    res.json(daily);
  } catch (err) { next(err); }
}

module.exports = { getRoster, postRoster, deleteRosterMember, getDaily, postSaveDay };
