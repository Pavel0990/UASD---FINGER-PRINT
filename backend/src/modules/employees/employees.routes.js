const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./employees.controller');

const router = express.Router();

router.get('/employees', requireAuth, ctrl.getEmployees);
router.get('/employees/:id', requireAuth, ctrl.getEmployeeById);
router.post('/employees', requireAuth, requirePerm('enroll'), ctrl.postEmployee);
router.patch('/employees/:id', requireAuth, requirePerm('manage'), ctrl.patchEmployee);
router.delete('/employees/:id', requireAuth, requirePerm('manage'), ctrl.deleteEmployee);

router.get('/departments', requireAuth, ctrl.getDepartments);
router.post('/departments', requireAuth, requirePerm('manage'), ctrl.postDepartment);

router.get('/employee-statuses', requireAuth, ctrl.getEmployeeStatuses);
router.post('/employee-statuses', requireAuth, requirePerm('manage'), ctrl.postEmployeeStatus);

module.exports = router;
