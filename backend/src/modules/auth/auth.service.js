const bcrypt = require('bcryptjs');
const prisma = require('../../db/prisma');
const { signAccessToken, generateRefreshToken, hashRefreshToken } = require('../../utils/tokens');

async function resolvePerms(roleId) {
  if (!roleId) return [];
  const rows = await prisma.rolePermission.findMany({ where: { roleId } });
  return rows.map((r) => r.permissionId);
}

// Replica login.jsx: busca por email, valida password, exige role_assignment (error 'no_role' si falta)
async function login(email, password) {
  const employee = await prisma.employee.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { credential: true, roleAssignment: true },
  });

  if (!employee || !employee.credential) {
    throw Object.assign(new Error('invalid_credentials'), { status: 401, publicMessage: 'invalid_credentials' });
  }

  const match = await bcrypt.compare(password, employee.credential.passwordHash);
  if (!match) {
    throw Object.assign(new Error('invalid_credentials'), { status: 401, publicMessage: 'invalid_credentials' });
  }

  if (!employee.roleAssignment) {
    throw Object.assign(new Error('no_role'), { status: 403, publicMessage: 'no_role' });
  }

  const roleId = employee.roleAssignment.roleId;
  const perms = await resolvePerms(roleId);

  await prisma.credential.update({
    where: { employeeId: employee.id },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = signAccessToken({ employeeId: employee.id, roleId, perms });
  const { raw, hash, expiresAt } = generateRefreshToken();
  await prisma.refreshToken.create({ data: { employeeId: employee.id, tokenHash: hash, expiresAt } });

  return {
    accessToken,
    refreshTokenRaw: raw,
    refreshExpiresAt: expiresAt,
    user: { id: employee.id, name: employee.name, email: employee.email, roleId, perms },
  };
}

async function refresh(rawToken, userAgent) {
  if (!rawToken) throw Object.assign(new Error('no_refresh_token'), { status: 401, publicMessage: 'no_refresh_token' });

  const hash = hashRefreshToken(rawToken);
  const stored = await prisma.refreshToken.findFirst({ where: { tokenHash: hash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw Object.assign(new Error('invalid_refresh_token'), { status: 401, publicMessage: 'invalid_refresh_token' });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: stored.employeeId },
    include: { roleAssignment: true },
  });
  if (!employee || !employee.roleAssignment) {
    throw Object.assign(new Error('no_role'), { status: 403, publicMessage: 'no_role' });
  }

  const roleId = employee.roleAssignment.roleId;
  const perms = await resolvePerms(roleId);

  // Rotación: revoca el token usado y emite uno nuevo
  const { raw, hash: newHash, expiresAt } = generateRefreshToken();
  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({ data: { employeeId: employee.id, tokenHash: newHash, expiresAt, userAgent } }),
  ]);

  const accessToken = signAccessToken({ employeeId: employee.id, roleId, perms });

  return {
    accessToken,
    refreshTokenRaw: raw,
    refreshExpiresAt: expiresAt,
    user: { id: employee.id, name: employee.name, email: employee.email, roleId, perms },
  };
}

async function logout(rawToken) {
  if (!rawToken) return;
  const hash = hashRefreshToken(rawToken);
  await prisma.refreshToken.updateMany({ where: { tokenHash: hash, revokedAt: null }, data: { revokedAt: new Date() } });
}

async function getMe(employeeId) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { roleAssignment: true },
  });
  if (!employee) return null;
  const roleId = employee.roleAssignment ? employee.roleAssignment.roleId : null;
  const perms = await resolvePerms(roleId);
  return { id: employee.id, name: employee.name, email: employee.email, roleId, perms };
}

module.exports = { login, refresh, logout, getMe };
