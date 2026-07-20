const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./holidays.controller');

const router = express.Router();

router.get('/holidays', requireAuth, ctrl.getHolidays);
router.post('/holidays', requireAuth, requirePerm('feriados'), ctrl.postHoliday);
router.delete('/holidays/:id', requireAuth, requirePerm('feriados'), ctrl.deleteHoliday);

module.exports = router;
