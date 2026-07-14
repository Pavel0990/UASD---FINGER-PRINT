const svc = require('./credentials.service');

async function postSetPassword(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: 'password_too_short' });
    await svc.setPassword(req.params.employeeId, email, password);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function deleteCredential(req, res, next) {
  try {
    await svc.deleteCredential(req.params.employeeId);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { postSetPassword, deleteCredential };
