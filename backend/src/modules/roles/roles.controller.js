const svc = require('./roles.service');
const { serializeRole } = require('../../utils/serializers');
const { logAudit } = require('../audit/audit.service');

async function getRoles(req, res, next) {
  try { res.json((await svc.listRoles()).map(serializeRole)); } catch (err) { next(err); }
}

async function getPermissions(req, res, next) {
  try { res.json(await svc.listPermissions()); } catch (err) { next(err); }
}

async function postRole(req, res, next) {
  try {
    const { id, name, description, color, perms } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'id_and_name_required' });
    const role = await svc.createRole(req.user.perms, { id, name, description, color, perms });
    res.status(201).json(serializeRole(role));
  } catch (err) { next(err); }
}

async function patchRole(req, res, next) {
  try {
    const role = await svc.updateRole(req.user.perms, req.params.id, req.body);
    res.json(serializeRole(role));
  } catch (err) { next(err); }
}

async function deleteRole(req, res, next) {
  try {
    const role = await svc.getRole(req.params.id);
    if (role && role.isProtected) return res.status(403).json({ error: 'protected_role' });
    await svc.deleteRole(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function getAssignments(req, res, next) {
  try {
    const rows = await svc.listAssignments();
    res.json(rows.map((r) => ({ empId: r.employeeId, roleId: r.roleId })));
  } catch (err) { next(err); }
}

async function postAssignment(req, res, next) {
  try {
    const { empId, roleId } = req.body;
    if (!empId || !roleId) return res.status(400).json({ error: 'empId_and_roleId_required' });
    await svc.assignRole(req.user.perms, empId, roleId);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', subjectEmployeeId: empId, detail: { roleId } });
    res.status(201).json({ empId, roleId });
  } catch (err) { next(err); }
}

async function deleteAssignment(req, res, next) {
  try {
    await svc.unassignRole(req.user.perms, req.params.employeeId);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', subjectEmployeeId: req.params.employeeId, detail: { kind: 'role_unassign' } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getRoles, getPermissions, postRole, patchRole, deleteRole, getAssignments, postAssignment, deleteAssignment };
