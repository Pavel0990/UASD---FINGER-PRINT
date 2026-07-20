const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./attendance.controller');

const router = express.Router();

// El kiosco no tiene sesión de usuario admin — estas dos rutas son la única puerta de
// entrada sin requireAuth de toda la API, y quedan protegidas por la ceremonia
// criptográfica WebAuthn (challenge de un solo uso + verificación de firma), no por JWT.
router.post('/attendance/webauthn/auth-options', ctrl.postAuthOptions);
router.post('/attendance/webauthn/auth-verify', ctrl.postAuthVerify);

// Registrar una huella nueva sí exige sesión admin con permiso 'enroll' (se hace desde register.jsx).
router.post('/attendance/webauthn/register-options', requireAuth, requirePerm('enroll'), ctrl.postRegisterOptions);
router.post('/attendance/webauthn/register-verify', requireAuth, requirePerm('enroll'), ctrl.postRegisterVerify);
router.post('/attendance/webauthn/link-credential', requireAuth, requirePerm('enroll'), ctrl.postLinkCredential);

router.get('/attendance', requireAuth, ctrl.getAttendance);
router.post('/attendance/manual', requireAuth, requirePerm('manage'), ctrl.postManualAttendance);
router.patch('/attendance/:id', requireAuth, requirePerm('manage'), ctrl.patchAttendance);

router.get('/absences', requireAuth, ctrl.getAbsences);
router.post('/absences', requireAuth, requirePerm('manage'), ctrl.postAbsence);
router.patch('/absences/:id', requireAuth, requirePerm('manage'), ctrl.patchAbsence);
router.delete('/absences/:id', requireAuth, requirePerm('manage'), ctrl.deleteAbsence);

module.exports = router;
