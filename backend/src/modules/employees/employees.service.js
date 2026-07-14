const prisma = require('../../db/prisma');
const { ddmmyyyyToDate } = require('../../utils/serializers');

const employeeInclude = { department: true, status: true, roleAssignment: true };

async function listEmployees() {
  return prisma.employee.findMany({ include: employeeInclude, orderBy: { id: 'asc' } });
}

async function getEmployee(id) {
  return prisma.employee.findUnique({ where: { id }, include: employeeInclude });
}

// Replica la lógica actual de register.jsx:8-11 — próximo id = max(EMP-#####) + 1
async function nextEmployeeId() {
  const rows = await prisma.employee.findMany({ select: { id: true } });
  const max = rows.reduce((m, r) => {
    const n = parseInt(r.id.replace('EMP-', ''), 10) || 0;
    return Math.max(m, n);
  }, 0);
  return 'EMP-' + String(max + 1).padStart(5, '0');
}

async function resolveStatusId(code) {
  const status = await prisma.employeeStatus.findUnique({ where: { code } });
  if (!status) throw Object.assign(new Error(`Estado desconocido: ${code}`), { status: 400 });
  return status.id;
}

async function resolveDepartmentId(name) {
  if (!name) return null;
  const dept = await prisma.department.upsert({
    where: { name },
    update: {},
    create: { name, isDefault: false },
  });
  return dept.id;
}

async function createEmployee(input) {
  const id = input.id || (await nextEmployeeId());
  const statusId = await resolveStatusId(input.status || 'pending');
  const departmentId = await resolveDepartmentId(input.dept);

  return prisma.employee.create({
    data: {
      id,
      name: input.name,
      cedula: input.cedula,
      departmentId,
      roleTitle: input.role || null,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      schedule: input.schedule || null,
      workDays: input.workDays || [],
      statusId,
      inactiveReason: input.inactiveReason || null,
      inactiveComment: input.inactiveComment || null,
      dob: input.dob ? ddmmyyyyToDate(input.dob) : null,
      gender: input.gender || null,
      photoUrl: input.photo || null,
    },
    include: employeeInclude,
  });
}

async function updateEmployee(id, input) {
  const data = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.cedula !== undefined) data.cedula = input.cedula;
  if (input.dept !== undefined) data.departmentId = await resolveDepartmentId(input.dept);
  if (input.role !== undefined) data.roleTitle = input.role;
  if (input.email !== undefined) data.email = input.email.toLowerCase();
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.schedule !== undefined) data.schedule = input.schedule;
  if (input.workDays !== undefined) data.workDays = input.workDays;
  if (input.status !== undefined) data.statusId = await resolveStatusId(input.status);
  if (input.inactiveReason !== undefined) data.inactiveReason = input.inactiveReason;
  if (input.inactiveComment !== undefined) data.inactiveComment = input.inactiveComment;
  if (input.dob !== undefined) data.dob = input.dob ? ddmmyyyyToDate(input.dob) : null;
  if (input.gender !== undefined) data.gender = input.gender;
  if (input.photo !== undefined) data.photoUrl = input.photo;

  return prisma.employee.update({ where: { id }, data, include: employeeInclude });
}

async function deleteEmployee(id) {
  return prisma.employee.delete({ where: { id } });
}

async function listDepartments() {
  const rows = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  return rows.map((r) => r.name);
}

async function addDepartment(name) {
  return prisma.department.upsert({ where: { name }, update: {}, create: { name, isDefault: false } });
}

async function listEmployeeStatuses() {
  return prisma.employeeStatus.findMany({ orderBy: { id: 'asc' } });
}

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  listDepartments,
  addDepartment,
  listEmployeeStatuses,
};
