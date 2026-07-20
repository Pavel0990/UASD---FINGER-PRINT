const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./eventualities.controller');

const router = express.Router();

router.get('/eventualities', requireAuth, ctrl.getEventualities);
router.post('/eventualities', requireAuth, requirePerm('manage'), ctrl.postEventuality);
router.patch('/eventualities/:id', requireAuth, requirePerm('manage'), ctrl.patchEventuality);
router.delete('/eventualities/:id', requireAuth, requirePerm('manage'), ctrl.deleteEventuality);

// Permiso dedicado — no 'reports' — para que ver reportes ya no alcance para aprobar/rechazar
// (antes cualquiera con acceso de solo-lectura a reportes podía hacerlo con un clic).
router.patch('/eventualities/:id/estado', requireAuth, requirePerm('approve_eventualidades'), ctrl.patchEstado);

module.exports = router;
