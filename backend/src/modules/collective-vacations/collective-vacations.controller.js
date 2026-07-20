const svc = require('./collective-vacations.service');
const { logAudit } = require('../audit/audit.service');

async function getPeriod(req, res, next) {
  try {
    const year = req.query.year || new Date().getFullYear();
    res.json(await svc.getPeriod(year));
  } catch (err) { next(err); }
}

async function postDays(req, res, next) {
  try {
    const { dates } = req.body;
    if (!Array.isArray(dates)) return res.status(400).json({ error: 'dates_array_required' });
    const result = await svc.setDays(req.params.year, dates);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', detail: { kind: 'collective_vacation_days', year: req.params.year, count: dates.length } });
    res.json(result);
  } catch (err) { next(err); }
}

async function postEmployees(req, res, next) {
  try {
    const { employeeIds } = req.body;
    if (!Array.isArray(employeeIds) || !employeeIds.length) return res.status(400).json({ error: 'employeeIds_array_required' });
    const result = await svc.addEmployees(req.params.year, employeeIds);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', detail: { kind: 'collective_vacation_assign', year: req.params.year, employeeIds } });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function deleteEmployee(req, res, next) {
  try {
    const result = await svc.removeEmployee(req.params.year, req.params.employeeId);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', subjectEmployeeId: req.params.employeeId, detail: { kind: 'collective_vacation_unassign', year: req.params.year } });
    res.json(result);
  } catch (err) { next(err); }
}

async function deleteAllEmployees(req, res, next) {
  try {
    const result = await svc.removeAllEmployees(req.params.year);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', detail: { kind: 'collective_vacation_unassign_all', year: req.params.year } });
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { getPeriod, postDays, postEmployees, deleteEmployee, deleteAllEmployees };
