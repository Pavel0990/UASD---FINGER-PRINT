// Seed idempotente — transcribe los datos hoy hardcodeados en el frontend
// (shared.jsx: EMPLOYEES, DEFAULT_DEPARTMENTS; roles.jsx: ALL_PERMS, SEED_ROLES, SEED_ASSIGNMENTS, DEFAULT_PASS)
// a filas iniciales en Postgres. Correr con: npm run seed

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ---- Catálogos ----

const DEFAULT_DEPARTMENTS = [
  'Data', 'Recursos Humanos', 'Facultad de Ingeniería', 'Biblioteca Central',
  'Tesorería', 'Sistemas e Informática', 'Rectoría', 'Mantenimiento',
  'Facultad de Humanidades', 'Seguridad', 'Registro', 'Comunicaciones',
  'Economato', 'Caja',
];

const EMPLOYEE_STATUSES = [
  { code: 'ok', label: 'Activo', color: '#2e7d32', isDefault: true },
  { code: 'pending', label: 'Pendiente de captura', color: '#b8860b', isDefault: true },
  { code: 'inactive', label: 'Inactivo', color: '#8b2942', isDefault: true },
];

// roles.jsx:28-38 (ALL_PERMS) + 'kiosk_admin' (usado por SEED_ROLES.role_admin pero no
// declarado en el catálogo original — inconsistencia existente que el seed resuelve).
const ALL_PERMS = [
  { id: 'enroll', label_es: 'Registrar empleados', label_en: 'Register employees' },
  { id: 'reports', label_es: 'Ver reportes', label_en: 'View reports' },
  { id: 'manage', label_es: 'Gestionar empleados', label_en: 'Manage employees' },
  { id: 'roles', label_es: 'Gestionar roles', label_en: 'Manage roles' },
  { id: 'audit', label_es: 'Control de actividad', label_en: 'Activity log' },
  { id: 'farm', label_es: 'Control de finca', label_en: 'Farm control' },
  { id: 'liceo', label_es: 'Control de liceo', label_en: 'School control' },
  { id: 'vacaciones', label_es: 'Vacaciones colectivas', label_en: 'Collective vacations' },
  { id: 'feriados', label_es: 'Gestionar feriados', label_en: 'Manage holidays' },
  { id: 'kiosk_admin', label_es: 'Administrar kiosco', label_en: 'Manage kiosk' },
  // Fase 4: separado de 'reports' — antes cualquiera con acceso de solo-lectura a reportes
  // podía aprobar/rechazar eventualidades con un clic (reports.jsx cycleEventStatus), sin
  // atribución ni auditoría real.
  { id: 'approve_eventualidades', label_es: 'Aprobar eventualidades', label_en: 'Approve eventualities' },
];

// roles.jsx:690-705 (shared.jsx EMPLOYEES)
const EMPLOYEES = [
  { id: 'EMP-00702', name: 'Pavel Abreu Torres', cedula: '40298731045', dept: 'Data', role: 'Desarrollador', email: 'pabreu@uasd.edu.do', phone: '+1 809 555 0702', schedule: '8:00 AM — 6:00 PM', workDays: [1,2,3,4,5], status: 'ok', dob: '12/06/1999', gender: 'M' },
  { id: 'EMP-00601', name: 'Gabriel Gómez', cedula: '40220274583', dept: 'Data', role: 'Analista de Datos', email: 'ggomez@uasd.edu.do', phone: '+1 809 555 0601', schedule: '8:00 AM — 6:00 PM', workDays: [1,2,3,4,5], status: 'ok', dob: '14/03/1991', gender: 'M' },
  { id: 'EMP-00214', name: 'María Reyes Castillo', cedula: '40212845637', dept: 'Facultad de Ingeniería', role: 'Decana', email: 'mreyes@uasd.edu.do', phone: '+1 809 555 0142', schedule: '7:00 AM — 3:00 PM', workDays: [1,2,3,4,5], status: 'ok', dob: '22/07/1978', gender: 'F' },
  { id: 'EMP-00187', name: 'Carlos Méndez Polanco', cedula: '00119238472', dept: 'Recursos Humanos', role: 'Director', email: 'cmendez@uasd.edu.do', phone: '+1 809 555 0238', schedule: '8:00 AM — 4:00 PM', workDays: [1,2,3,4,5], status: 'ok', dob: '05/11/1975', gender: 'M' },
  { id: 'EMP-00342', name: 'Lourdes Peña Vargas', cedula: '40277823419', dept: 'Biblioteca Central', role: 'Bibliotecaria Jefa', email: 'lpena@uasd.edu.do', phone: '+1 829 555 0411', schedule: '8:00 AM — 5:00 PM', workDays: [1,2,3,4,5,6], status: 'ok', dob: '30/01/1983', gender: 'F' },
  { id: 'EMP-00501', name: 'Juan Manuel Tavárez', cedula: '40233498721', dept: 'Facultad de Ciencias', role: 'Profesor Titular', email: 'jtavarez@uasd.edu.do', phone: '+1 809 555 0623', schedule: '9:00 AM — 1:00 PM', workDays: [1,2,3,4], status: 'ok', dob: '18/09/1969', gender: 'M' },
  { id: 'EMP-00298', name: 'Ana Cristina Jiménez', cedula: '00111457824', dept: 'Tesorería', role: 'Auxiliar Contable', email: 'ajimenez@uasd.edu.do', phone: '+1 809 555 0388', schedule: '8:00 AM — 4:00 PM', workDays: [1,2,3,4,5], status: 'pending', dob: '09/06/1997', gender: 'F' },
  { id: 'EMP-00412', name: 'Roberto Núñez Espinal', cedula: '40299123413', dept: 'Sistemas e Informática', role: 'Ingeniero de Redes', email: 'rnunez@uasd.edu.do', phone: '+1 829 555 0712', schedule: '8:00 AM — 5:00 PM', workDays: [1,2,3,4,5], status: 'ok', dob: '27/04/1988', gender: 'M' },
  { id: 'EMP-00103', name: 'Elena Sánchez Brito', cedula: '00122849136', dept: 'Rectoría', role: 'Asistente Ejecutiva', email: 'esanchez@uasd.edu.do', phone: '+1 809 555 0119', schedule: '7:30 AM — 3:30 PM', workDays: [1,2,3,4,5], status: 'ok', dob: '11/12/1994', gender: 'F' },
  { id: 'EMP-00276', name: 'Pedro Antonio Rosario', cedula: '40255678232', dept: 'Mantenimiento', role: 'Supervisor', email: 'prosario@uasd.edu.do', phone: '+1 829 555 0834', schedule: '6:00 AM — 2:00 PM', workDays: [1,2,3,4,5,6], status: 'ok', dob: '03/08/1980', gender: 'M' },
  { id: 'EMP-00388', name: 'Yolanda Fernández Cruz', cedula: '40277231048', dept: 'Facultad de Humanidades', role: 'Profesora Auxiliar', email: 'yfernandez@uasd.edu.do', phone: '+1 809 555 0277', schedule: '10:00 AM — 2:00 PM', workDays: [1,2,3,4,5], status: 'inactive', dob: '15/02/1962', gender: 'F', inactiveReason: 'retired', inactiveComment: 'Pensionada por tiempo de servicio. Resolución RRHH-2026-014.' },
  { id: 'EMP-00455', name: 'Miguel Ángel Rodríguez', cedula: '00133987215', dept: 'Seguridad', role: 'Agente', email: 'mrodriguez@uasd.edu.do', phone: '+1 829 555 0566', schedule: '2:00 PM — 10:00 PM', workDays: [0,1,2,3,4,5,6], status: 'ok', dob: '20/05/1993', gender: 'M' },
  { id: 'EMP-00521', name: 'Sofía Hernández Marte', cedula: '40211029347', dept: 'Registro', role: 'Analista', email: 'shernandez@uasd.edu.do', phone: '+1 809 555 0445', schedule: '8:00 AM — 4:00 PM', workDays: [1,2,3,4,5], status: 'pending', dob: '07/10/1999', gender: 'F' },
  { id: 'EMP-00237', name: 'Francisco Pimentel Lora', cedula: '00128913451', dept: 'Comunicaciones', role: 'Coordinador', email: 'fpimentel@uasd.edu.do', phone: '+1 829 555 0291', schedule: '9:00 AM — 5:00 PM', workDays: [1,2,3,4,5], status: 'inactive', dob: '25/11/1986', gender: 'M', inactiveReason: 'other', inactiveComment: 'Licencia administrativa temporal pendiente de revisión.' },
];

// roles.jsx:12-16 / 18-23 / 10
const SEED_ROLES = [
  { id: 'role_admin', name: 'Administrador', description: 'Acceso completo a todas las funciones del sistema.', color: '#8b2942', perms: ['enroll', 'reports', 'manage', 'roles', 'audit', 'farm', 'liceo', 'vacaciones', 'feriados', 'kiosk_admin', 'approve_eventualidades'], isProtected: true, maxMembers: 5 },
  { id: 'role_hr', name: 'Recursos Humanos', description: 'Registro de empleados, captura de huellas y reportes.', color: '#2C3E66', perms: ['enroll', 'reports', 'manage', 'farm', 'liceo', 'vacaciones', 'feriados', 'roles', 'approve_eventualidades'], isProtected: true, maxMembers: 5 },
  { id: 'role_viewer', name: 'Solo lectura', description: 'Acceso solo a reportes y control de actividad.', color: '#5a6a90', perms: ['reports', 'audit'], isProtected: false, maxMembers: 5 },
];

const SEED_ASSIGNMENTS = [
  { empId: 'EMP-00702', roleId: 'role_admin' },
  { empId: 'EMP-00601', roleId: 'role_admin' },
  { empId: 'EMP-00187', roleId: 'role_hr' },
  { empId: 'EMP-00103', roleId: 'role_viewer' },
];

const DEFAULT_PASS = '123456789';

// shared.jsx:1486-1500 (DEFAULT_HOLIDAYS)
const DEFAULT_HOLIDAYS = [
  { date: '2026-01-01', name_es: 'Año Nuevo', name_en: "New Year's Day", type: 'fixed' },
  { date: '2026-01-06', name_es: 'Día de los Santos Reyes', name_en: 'Epiphany', type: 'fixed' },
  { date: '2026-01-21', name_es: 'Día de la Altagracia', name_en: 'Our Lady of Altagracia', type: 'fixed' },
  { date: '2026-01-26', name_es: 'Día de Duarte', name_en: 'Duarte Day', type: 'fixed' },
  { date: '2026-02-27', name_es: 'Día de la Independencia', name_en: 'Independence Day', type: 'fixed' },
  { date: '2026-04-18', name_es: 'Viernes Santo', name_en: 'Good Friday', type: 'fixed' },
  { date: '2026-05-01', name_es: 'Día del Trabajo', name_en: 'Labor Day', type: 'fixed' },
  { date: '2026-06-19', name_es: 'Día de Corpus Christi', name_en: 'Corpus Christi', type: 'fixed' },
  { date: '2026-08-16', name_es: 'Restauración de la República', name_en: 'Restoration Day', type: 'fixed' },
  { date: '2026-09-24', name_es: 'Nuestra Señora de las Mercedes', name_en: 'Our Lady of Mercedes', type: 'fixed' },
  { date: '2026-10-28', name_es: 'Día de la UASD', name_en: 'UASD Day', type: 'uasd' },
  { date: '2026-11-06', name_es: 'Día de la Constitución', name_en: 'Constitution Day', type: 'fixed' },
  { date: '2026-12-25', name_es: 'Navidad', name_en: 'Christmas Day', type: 'fixed' },
];

function parseDob(ddmmyyyy) {
  const [d, m, y] = ddmmyyyy.split('/').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

async function main() {
  console.log('Seeding permissions...');
  for (const p of ALL_PERMS) {
    await prisma.permission.upsert({
      where: { id: p.id },
      update: { labelEs: p.label_es, labelEn: p.label_en },
      create: { id: p.id, labelEs: p.label_es, labelEn: p.label_en },
    });
  }

  console.log('Seeding departments...');
  const departmentIdByName = {};
  for (const name of DEFAULT_DEPARTMENTS) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name, isDefault: true },
    });
    departmentIdByName[name] = dept.id;
  }

  console.log('Seeding employee statuses...');
  const statusIdByCode = {};
  for (const s of EMPLOYEE_STATUSES) {
    const status = await prisma.employeeStatus.upsert({
      where: { code: s.code },
      update: { label: s.label, color: s.color },
      create: s,
    });
    statusIdByCode[s.code] = status.id;
  }

  console.log('Seeding employees + credentials...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASS, 10);
  for (const e of EMPLOYEES) {
    await prisma.employee.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        name: e.name,
        cedula: e.cedula,
        departmentId: departmentIdByName[e.dept] ?? null,
        roleTitle: e.role,
        email: e.email.toLowerCase(),
        phone: e.phone,
        schedule: e.schedule,
        workDays: e.workDays,
        statusId: statusIdByCode[e.status],
        inactiveReason: e.inactiveReason ?? null,
        inactiveComment: e.inactiveComment ?? null,
        dob: parseDob(e.dob),
        gender: e.gender,
      },
    });

    await prisma.credential.upsert({
      where: { employeeId: e.id },
      update: {},
      create: { employeeId: e.id, passwordHash, mustChangePassword: true },
    });
  }

  console.log('Seeding roles + role_permissions...');
  for (const r of SEED_ROLES) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: { name: r.name, description: r.description, color: r.color, isProtected: r.isProtected, maxMembers: r.maxMembers },
      create: { id: r.id, name: r.name, description: r.description, color: r.color, isProtected: r.isProtected, maxMembers: r.maxMembers },
    });
    for (const permId of r.perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: r.id, permissionId: permId } },
        update: {},
        create: { roleId: r.id, permissionId: permId },
      });
    }
    // Poda permisos que ya no están en SEED_ROLES (ej. 'roles' se quitó de
    // role_viewer) — sin esto, upsert solo agrega y nunca retira, así que un
    // permiso otorgado por error en un seed anterior queda pegado para
    // siempre en la DB aunque se corrija este archivo.
    await prisma.rolePermission.deleteMany({
      where: { roleId: r.id, permissionId: { notIn: r.perms } },
    });
  }

  console.log('Seeding role_assignments...');
  for (const a of SEED_ASSIGNMENTS) {
    await prisma.roleAssignment.upsert({
      where: { employeeId: a.empId },
      update: { roleId: a.roleId },
      create: { employeeId: a.empId, roleId: a.roleId },
    });
  }

  console.log('Seeding holidays...');
  for (const h of DEFAULT_HOLIDAYS) {
    await prisma.holiday.upsert({
      where: { date: new Date(h.date) },
      update: {},
      create: { date: new Date(h.date), nameEs: h.name_es, nameEn: h.name_en, type: h.type },
    });
  }

  console.log('Seed completo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
