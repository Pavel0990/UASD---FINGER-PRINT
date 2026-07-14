const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./credentials.controller');

const router = express.Router();

router.post('/:employeeId/set-password', requireAuth, requirePerm('roles'), ctrl.postSetPassword);
router.delete('/:employeeId', requireAuth, requirePerm('roles'), ctrl.deleteCredential);

module.exports = router;
