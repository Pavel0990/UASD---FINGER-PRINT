const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./collective-vacations.controller');

const router = express.Router();

router.get('/collective-vacations', requireAuth, ctrl.getPeriod);
router.post('/collective-vacations/:year/days', requireAuth, requirePerm('vacaciones'), ctrl.postDays);
router.post('/collective-vacations/:year/employees', requireAuth, requirePerm('vacaciones'), ctrl.postEmployees);
router.delete('/collective-vacations/:year/employees/:employeeId', requireAuth, requirePerm('vacaciones'), ctrl.deleteEmployee);
router.delete('/collective-vacations/:year/employees', requireAuth, requirePerm('vacaciones'), ctrl.deleteAllEmployees);

module.exports = router;
