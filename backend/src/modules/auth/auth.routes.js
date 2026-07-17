const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../../middleware/auth');
const ctrl = require('./auth.controller');

const router = express.Router();

// El bloqueo de 5 intentos/30s en login.jsx es solo del lado cliente — se
// salta llamando la API directo (curl/script). Este es el límite real:
// por IP, no por cuenta, así que no se puede usar para bloquear a un usuario
// legítimo enumerando su email.
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_attempts' },
});

router.post('/login', loginLimiter, ctrl.postLogin);
router.post('/refresh', ctrl.postRefresh);
router.post('/logout', ctrl.postLogout);
router.get('/me', requireAuth, ctrl.getMe);

module.exports = router;
