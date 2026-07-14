const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const { getAuditLog } = require('./audit.controller');

const router = express.Router();

router.get('/', requireAuth, requirePerm('audit'), getAuditLog);

module.exports = router;
