const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./roles.controller');

const router = express.Router();

router.get('/roles', requireAuth, ctrl.getRoles);
router.post('/roles', requireAuth, requirePerm('roles'), ctrl.postRole);
router.patch('/roles/:id', requireAuth, requirePerm('roles'), ctrl.patchRole);
router.delete('/roles/:id', requireAuth, requirePerm('roles'), ctrl.deleteRole);

router.get('/permissions', requireAuth, ctrl.getPermissions);

router.get('/role-assignments', requireAuth, ctrl.getAssignments);
router.post('/role-assignments', requireAuth, requirePerm('roles'), ctrl.postAssignment);
router.delete('/role-assignments/:employeeId', requireAuth, requirePerm('roles'), ctrl.deleteAssignment);

module.exports = router;
