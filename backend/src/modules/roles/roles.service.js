const prisma = require('../../db/prisma');

const roleInclude = { permissions: true };

// Techo de permisos: un actor nunca puede otorgar (a un rol o al asignar un
// rol a alguien) un permiso que él mismo no tiene. Antes esto solo se
// validaba en roles.jsx (grantablePerms), del lado del navegador — cualquiera
// podía saltárselo llamando la API directo. Ver auditoría: escalamiento
// role_viewer → role_admin en 2 llamadas HTTP.
class PermCeilingError extends Error {
  constructor(missing) {
    super('perm_ceiling_exceeded');
    this.status = 403;
    this.publicMessage = 'perm_ceiling_exceeded';
    this.missing = missing;
  }
}

function assertPermCeiling(actorPerms, targetPerms) {
  const missing = (targetPerms || []).filter((p) => !actorPerms.includes(p));
  if (missing.length) throw new PermCeilingError(missing);
}

async function listRoles() {
  return prisma.role.findMany({ include: roleInclude, orderBy: { name: 'asc' } });
}

async function listPermissions() {
  return prisma.permission.findMany({ orderBy: { id: 'asc' } });
}

async function createRole(actorPerms, { id, name, description, color, perms = [] }) {
  assertPermCeiling(actorPerms, perms);
  return prisma.$transaction(async (tx) => {
    const role = await tx.role.create({ data: { id, name, description, color } });
    if (perms.length) {
      await tx.rolePermission.createMany({ data: perms.map((permissionId) => ({ roleId: id, permissionId })) });
    }
    return tx.role.findUnique({ where: { id }, include: roleInclude });
  });
}

async function updateRole(actorPerms, id, { name, description, color, perms }) {
  if (perms !== undefined) assertPermCeiling(actorPerms, perms);
  return prisma.$transaction(async (tx) => {
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (color !== undefined) data.color = color;
    if (Object.keys(data).length) await tx.role.update({ where: { id }, data });

    if (perms !== undefined) {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      if (perms.length) await tx.rolePermission.createMany({ data: perms.map((permissionId) => ({ roleId: id, permissionId })) });
    }
    return tx.role.findUnique({ where: { id }, include: roleInclude });
  });
}

async function getRole(id) {
  return prisma.role.findUnique({ where: { id } });
}

async function deleteRole(id) {
  return prisma.role.delete({ where: { id } });
}

// roles.jsx: MAX_ROLE_MEMBERS = 5
const MAX_ROLE_MEMBERS = 5;

async function countRoleMembers(roleId) {
  return prisma.roleAssignment.count({ where: { roleId } });
}

async function assignRole(actorPerms, employeeId, roleId) {
  const targetRole = await prisma.role.findUnique({ where: { id: roleId }, include: roleInclude });
  if (!targetRole) throw Object.assign(new Error('role_not_found'), { status: 404, publicMessage: 'role_not_found' });
  assertPermCeiling(actorPerms, targetRole.permissions.map((p) => p.permissionId));

  const memberCount = await countRoleMembers(roleId);
  const limit = targetRole.maxMembers ?? MAX_ROLE_MEMBERS;
  const existing = await prisma.roleAssignment.findUnique({ where: { employeeId } });
  if (!existing && memberCount >= limit) {
    throw Object.assign(new Error('role_full'), { status: 409, publicMessage: 'role_full' });
  }
  return prisma.roleAssignment.upsert({
    where: { employeeId },
    update: { roleId },
    create: { employeeId, roleId },
  });
}

// Mismo techo de permisos que assignRole, aplicado en la dirección inversa: un actor no
// puede despojar de su rol a alguien cuyo rol tiene permisos que el actor mismo no tiene
// (ej. role_hr desasignando a un role_admin). Ver auditoría post-Fase 4: assignRole ya
// estaba protegido pero unassignRole no, dejando una vía de sabotaje asimétrica.
async function unassignRole(actorPerms, employeeId) {
  const existing = await prisma.roleAssignment.findUnique({
    where: { employeeId },
    include: { role: { include: roleInclude } },
  });
  if (!existing) throw Object.assign(new Error('assignment_not_found'), { status: 404, publicMessage: 'assignment_not_found' });
  assertPermCeiling(actorPerms, existing.role.permissions.map((p) => p.permissionId));
  return prisma.roleAssignment.delete({ where: { employeeId } });
}

async function listAssignments() {
  return prisma.roleAssignment.findMany();
}

module.exports = {
  listRoles, listPermissions, createRole, updateRole, getRole, deleteRole,
  assignRole, unassignRole, listAssignments,
};
