const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const ctrl = require('./auth.controller');

const router = express.Router();

router.post('/login', ctrl.postLogin);
router.post('/refresh', ctrl.postRefresh);
router.post('/logout', ctrl.postLogout);
router.get('/me', requireAuth, ctrl.getMe);

module.exports = router;
