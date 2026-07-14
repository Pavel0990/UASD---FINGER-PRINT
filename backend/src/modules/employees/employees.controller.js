const svc = require('./employees.service');
const { serializeEmployee } = require('../../utils/serializers');
const { logAudit } = require('../audit/audit.service');

async function getEmployees(req, res, next) {
  try {
    const rows = await svc.listEmployees();
    res.json(rows.map(serializeEmployee));
  } catch (err) { next(err); }
}

async function getEmployeeById(req, res, next) {
  try {
    const row = await svc.getEmployee(req.params.id);
    if (!row) return res.status(404).json({ error: 'not_found' });
    res.json(serializeEmployee(row));
  } catch (err) { next(err); }
}

async function postEmployee(req, res, next) {
  try {
    const row = await svc.createEmployee(req.body);
    await logAudit({
      actorEmployeeId: req.user.employeeId,
      actionType: 'add',
      subjectEmployeeId: row.id,
      subjectLabel: row.name,
    });
    res.status(201).json(serializeEmployee(row));
  } catch (err) { next(err); }
}

async function patchEmployee(req, res, next) {
  try {
    const row = await svc.updateEmployee(req.params.id, req.body);
    await logAudit({
      actorEmployeeId: req.user.employeeId,
      actionType: 'edit',
      subjectEmployeeId: row.id,
      subjectLabel: row.name,
    });
    res.json(serializeEmployee(row));
  } catch (err) { next(err); }
}

async function deleteEmployee(req, res, next) {
  try {
    const existing = await svc.getEmployee(req.params.id);
    if (!existing) return res.status(404).json({ error: 'not_found' });
    await svc.deleteEmployee(req.params.id);
    await logAudit({
      actorEmployeeId: req.user.employeeId,
      actionType: 'delete',
      subjectEmployeeId: existing.id,
      subjectLabel: existing.name,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}

async function getDepartments(req, res, next) {
  try { res.json(await svc.listDepartments()); } catch (err) { next(err); }
}

async function postDepartment(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name_required' });
    await svc.addDepartment(name.trim());
    res.status(201).json(await svc.listDepartments());
  } catch (err) { next(err); }
}

async function getEmployeeStatuses(req, res, next) {
  try { res.json(await svc.listEmployeeStatuses()); } catch (err) { next(err); }
}

module.exports = {
  getEmployees, getEmployeeById, postEmployee, patchEmployee, deleteEmployee,
  getDepartments, postDepartment, getEmployeeStatuses,
};
