const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken({ employeeId, roleId, perms }) {
  return jwt.sign({ employeeId, roleId, perms }, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

function generateRefreshToken() {
  const raw = crypto.randomBytes(48).toString('hex');
  const hash = hashRefreshToken(raw);
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  return { raw, hash, expiresAt };
}

function hashRefreshToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

module.exports = { signAccessToken, verifyAccessToken, generateRefreshToken, hashRefreshToken };
