const { verifyAccessToken } = require('../utils/tokens');

// FIX del modo inseguro actual (userHasPermission() del frontend devuelve `true`
// para todo si no hay sesión): acá sin JWT válido siempre es 401, sin excepción.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no_token' });

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { employeeId, roleId, perms }
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = { requireAuth };
