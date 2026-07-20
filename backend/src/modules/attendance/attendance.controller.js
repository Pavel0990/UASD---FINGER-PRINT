const svc = require('./attendance.service');
const wa = require('./webauthn.service');
const { serializeAttendance, serializeAbsence, formatTime12h } = require('../../utils/serializers');
const { logAudit } = require('../audit/audit.service');

async function postRegisterOptions(req, res, next) {
  try {
    const { employeeId, userName, userDisplayName } = req.body;
    res.json(await wa.generateRegisterOptions({ employeeId, userName, userDisplayName }));
  } catch (err) { next(err); }
}

async function postRegisterVerify(req, res, next) {
  try {
    const { attestationResponse, deviceLabel } = req.body;
    if (!attestationResponse) return res.status(400).json({ error: 'attestationResponse_required' });
    const result = await wa.verifyRegister(attestationResponse, deviceLabel);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function postLinkCredential(req, res, next) {
  try {
    const { employeeId, credential, deviceLabel } = req.body;
    if (!employeeId || !credential) return res.status(400).json({ error: 'employeeId_and_credential_required' });
    await wa.linkCredential(employeeId, credential, deviceLabel);
    res.status(201).json({ linked: true });
  } catch (err) { next(err); }
}

async function postAuthOptions(req, res, next) {
  try { res.json(await wa.generateAuthOptions()); } catch (err) { next(err); }
}

async function postAuthVerify(req, res, next) {
  try {
    const { assertionResponse } = req.body;
    if (!assertionResponse) return res.status(400).json({ error: 'assertionResponse_required' });
    const { employee } = await wa.verifyAuth(assertionResponse);
    const result = await svc.recordAttendance(employee.id, employee.schedule, 'kiosk');
    res.json({
      kind: result.kind,
      time: formatTime12h(result.time),
      employee: { id: employee.id, name: employee.name },
    });
  } catch (err) { next(err); }
}

async function getAttendance(req, res, next) {
  try {
    const { employeeId, from, to } = req.query;
    const rows = await svc.listAttendance({ employeeId, from, to });
    res.json(rows.map(serializeAttendance));
  } catch (err) { next(err); }
}

async function postManualAttendance(req, res, next) {
  try {
    const { employeeId, date, timeIn, timeOut, justified } = req.body;
    if (!employeeId || !date) return res.status(400).json({ error: 'employeeId_and_date_required' });
    const row = await svc.createManualAttendance({ employeeId, date, timeIn, timeOut, justified });
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'add', subjectEmployeeId: employeeId, detail: { kind: 'attendance_manual', date } });
    res.status(201).json(serializeAttendance(row));
  } catch (err) { next(err); }
}

async function patchAttendance(req, res, next) {
  try {
    const row = await svc.updateAttendance(req.params.id, req.body);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', subjectEmployeeId: row.employeeId, detail: { kind: 'attendance_edit', id: req.params.id } });
    res.json(serializeAttendance(row));
  } catch (err) { next(err); }
}

async function getAbsences(req, res, next) {
  try {
    const { employeeId, from, to } = req.query;
    const rows = await svc.listAbsences({ employeeId, from, to });
    res.json(rows.map(serializeAbsence));
  } catch (err) { next(err); }
}

async function postAbsence(req, res, next) {
  try {
    const { employeeId, date, justified, justifyNote, source } = req.body;
    if (!employeeId || !date) return res.status(400).json({ error: 'employeeId_and_date_required' });
    const row = await svc.createAbsence({ employeeId, date, justified, justifyNote, source });
    res.status(201).json(serializeAbsence(row));
  } catch (err) { next(err); }
}

async function patchAbsence(req, res, next) {
  try {
    const row = await svc.updateAbsence(req.params.id, req.body);
    await logAudit({ actorEmployeeId: req.user.employeeId, actionType: 'edit', subjectEmployeeId: row.employeeId, detail: { kind: 'absence_justify', id: req.params.id } });
    res.json(serializeAbsence(row));
  } catch (err) { next(err); }
}

async function deleteAbsence(req, res, next) {
  try {
    await svc.deleteAbsence(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  postRegisterOptions, postRegisterVerify, postLinkCredential, postAuthOptions, postAuthVerify,
  getAttendance, postManualAttendance, patchAttendance,
  getAbsences, postAbsence, patchAbsence, deleteAbsence,
};
