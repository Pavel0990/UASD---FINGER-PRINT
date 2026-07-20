require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name} (revisa backend/.env, copia backend/.env.example)`);
  return value;
}

module.exports = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtlDays: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '7', 10),
  // WebAuthn exige que rpID sea el dominio exacto (sin protocolo/puerto) y origin la URL completa
  // que ve el navegador — coincide con el redirect 127.0.0.1→localhost que ya exige el frontend.
  webauthnRpId: process.env.WEBAUTHN_RP_ID || 'localhost',
  webauthnOrigin: process.env.WEBAUTHN_ORIGIN || `http://localhost:${process.env.PORT || '8080'}`,
  webauthnRpName: process.env.WEBAUTHN_RP_NAME || 'UASD Sistema de Registro Biométrico',
};
