// Mapea 1:1 el catálogo de permisos (ALL_PERMS) que hoy vive hardcodeado en roles.jsx.
function requirePerm(permId) {
  return (req, res, next) => {
    const perms = (req.user && req.user.perms) || [];
    if (!perms.includes(permId)) return res.status(403).json({ error: 'forbidden', missing: permId });
    next();
  };
}

module.exports = { requirePerm };
