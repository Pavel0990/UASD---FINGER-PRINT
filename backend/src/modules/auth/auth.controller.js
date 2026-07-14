const svc = require('./auth.service');
const env = require('../../config/env');

const REFRESH_COOKIE = 'refresh_token';

function refreshCookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure: env.isProduction, // en dev sobre http no se puede exigir secure
    sameSite: 'strict',
    expires: expiresAt,
    path: '/api/auth',
  };
}

async function postLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });

    const result = await svc.login(email, password);
    res.cookie(REFRESH_COOKIE, result.refreshTokenRaw, refreshCookieOptions(result.refreshExpiresAt));
    res.json({ accessToken: result.accessToken, user: result.user });
  } catch (err) { next(err); }
}

async function postRefresh(req, res, next) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    const result = await svc.refresh(rawToken, req.headers['user-agent']);
    res.cookie(REFRESH_COOKIE, result.refreshTokenRaw, refreshCookieOptions(result.refreshExpiresAt));
    res.json({ accessToken: result.accessToken, user: result.user });
  } catch (err) { next(err); }
}

async function postLogout(req, res, next) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    await svc.logout(rawToken);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    res.status(204).send();
  } catch (err) { next(err); }
}

async function getMe(req, res, next) {
  try {
    const me = await svc.getMe(req.user.employeeId);
    if (!me) return res.status(404).json({ error: 'not_found' });
    res.json(me);
  } catch (err) { next(err); }
}

module.exports = { postLogin, postRefresh, postLogout, getMe };
