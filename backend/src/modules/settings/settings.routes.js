const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./settings.controller');

const router = express.Router();

router.get('/settings', requireAuth, ctrl.getSettings);
router.patch('/settings', requireAuth, requirePerm('manage'), ctrl.patchSettings);

module.exports = router;
