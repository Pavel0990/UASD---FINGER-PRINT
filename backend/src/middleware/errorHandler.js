const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  // Errores 4xx esperados (sin sesión, credenciales inválidas, etc.) no necesitan
  // traza completa — solo los 5xx / Prisma son señal real de que algo se rompió.
  if (status >= 500) console.error(err);

  if (err.code === 'P2002') {
    // Prisma unique constraint violation
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target;
    return res.status(409).json({ error: 'duplicate', field });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'not_found' });
  }

  res.status(err.status || 500).json({
    error: err.publicMessage || 'server_error',
    ...(env.isProduction ? {} : { detail: err.message }),
  });
}

module.exports = { errorHandler };
