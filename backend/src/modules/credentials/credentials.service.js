const bcrypt = require('bcryptjs');
const prisma = require('../../db/prisma');

// Crea la credencial si el empleado aún no tiene una (recién registrado vía
// register.jsx no trae password), o actualiza el hash si ya existe.
async function setPassword(employeeId, email, password) {
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
