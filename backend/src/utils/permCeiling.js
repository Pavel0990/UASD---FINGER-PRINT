// Techo de permisos: un actor nunca puede otorgar, revocar, ni actuar sobre
// alguien/algo que tenga un permiso que el actor mismo no posee. Compartido
// entre roles.service.js (crear/editar roles, asignar/desasignar) y
// credentials.service.js (resetear contraseña de un empleado) — antes cada
// módulo validaba esto por su cuenta y credentials.service.js no lo hacía en
// absoluto, dejando una vía de escalamiento (RRHH podía resetear la
// contraseña de un Administrador real). Ver auditoría de seguridad.
class PermCeilingError extends Error {
  constructor(missing) {
    super('perm_ceiling_exceeded');
    this.status = 403;
    this.publicMessage = 'perm_ceiling_exceeded';
    this.missing = missing;
  }
}

function assertPermCeiling(actorPerms, targetPerms) {
  const missing = (targetPerms || []).filter((p) => !actorPerms.includes(p));
  if (missing.length) throw new PermCeilingError(missing);
}

module.exports = { PermCeilingError, assertPermCeiling };
