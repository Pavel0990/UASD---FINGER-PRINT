const bcrypt = require('bcryptjs');
const prisma = require('../../db/prisma');
const { assertPermCeiling } = require('../../utils/permCeiling');

// Crea la credencial si el empleado aún no tiene una (recién registrado vía
// register.jsx no trae password), o actualiza el hash si ya existe.
//
// Techo de permisos: resetear la contraseña de alguien equivale a poder
// iniciar sesión COMO esa persona, así que aplica el mismo techo que
// roles.service.js (assignRole/updateRole) — un actor no puede resetear la
// contraseña de un empleado cuyo rol tiene permisos que el actor mismo no
// tiene (ej. role_hr reseteando a un role_admin real). Antes este endpoint
// solo exigía el permiso 'manage' sin mirar el rol del empleado objetivo.
// Ver auditoría de seguridad. `actorPerms` null = llamado interno/seed, sin
// actor real que limitar (no debe pasar en producción vía HTTP).
async function setPassword(employeeId, email, password, actorPerms = null) {
  if (actorPerms) {
    const assignment = await prisma.roleAssignment.findUnique({
      where: { employeeId },
      include: { role: { include: { permissions: true } } },
    });
    if (assignment) {
      assertPermCeiling(actorPerms, assignment.role.permissions.map((p) => p.permissionId));
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (email) {
    await prisma.employee.update({ where: { id: employeeId }, data: { email: email.toLowerCase() } });
  }

  return prisma.credential.upsert({
    where: { employeeId },
    update: { passwordHash, mustChangePassword: false },
    create: { employeeId, passwordHash, mustChangePassword: false },
  });
}

async function deleteCredential(employeeId) {
  return prisma.credential.deleteMany({ where: { employeeId } });
}

module.exports = { setPassword, deleteCredential };
