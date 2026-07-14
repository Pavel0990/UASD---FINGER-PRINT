const prisma = require('../../db/prisma');

const roleInclude = { permissions: true };

async function listRoles() {
  return prisma.role.findMany({ include: roleInclude, orderBy: { name: 'asc' } });
}

async function listPermissions() {
  return prisma.permission.findMany({ orderBy: { id: 'asc' } });
}

async function createRole({ id, name, description, color, perms = [] }) {
  return prisma.$transaction(async (tx) => {
    const role = await tx.role.create({ data: { id, name, description, color } });
    if (perms.length) {
      await tx.rolePermission.createMany({ data: perms.map((permissionId) => ({ roleId: id, permissionId })) });
    }
    return tx.role.findUnique({ where: { id }, include: roleInclude });
  });
}

async function updateRole(id, { name, description, color, perms }) {
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

async function deleteRole(id) {
  return prisma.role.delete({ where: { id } });
}

// roles.jsx: MAX_ROLE_MEMBERS = 5
const MAX_ROLE_MEMBERS = 5;

async function countRoleMembers(roleId) {
  return prisma.roleAssignment.count({ where: { roleId } });
}

async function assignRole(employeeId, roleId) {
  const memberCount = await countRoleMembers(roleId);
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  const limit = role?.maxMembers ?? MAX_ROLE_MEMBERS;
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

async function unassignRole(employeeId) {
  return prisma.roleAssignment.delete({ where: { employeeId } });
}

async function listAssignments() {
  return prisma.roleAssignment.findMany();
}

module.exports = {
  listRoles, listPermissions, createRole, updateRole, deleteRole,
  assignRole, unassignRole, listAssignments,
};
