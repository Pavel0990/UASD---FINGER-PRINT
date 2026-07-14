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
};
