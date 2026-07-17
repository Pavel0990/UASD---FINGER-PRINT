const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./credentials.controller');

const router = express.Router();

// 'manage' (Gestionar empleados), no 'roles' (Gestionar roles) — resetear la
// contraseña de un empleado es una acción sobre EMPLEADOS, no sobre la
// estructura de roles/permisos. Con 'roles' cualquier rol que solo debiera
// poder ver la pantalla de Roles (ej. Solo lectura) podía resetear la
// contraseña de un administrador. Ver auditoría de seguridad.
router.post('/:employeeId/set-password', requireAuth, requirePerm('manage'), ctrl.postSetPassword);
router.delete('/:employeeId', requireAuth, requirePerm('manage'), ctrl.deleteCredential);

module.exports = router;
