const {
  generateRegistrationOptions: generateRegistrationOptions_,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const prisma = require('../../db/prisma');
const env = require('../../config/env');

const CHALLENGE_TTL_MS = 2 * 60 * 1000; // 2 minutos — ventana corta, coherente con el timeout de captura en register.jsx

async function saveChallenge(challenge, purpose, employeeId = null) {
  await prisma.webauthnChallenge.create({
    data: { challenge, purpose, employeeId, expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS) },
  });
}

// Challenge de un solo uso: se busca, se borra siempre (éxito o no), y se rechaza si expiró.
// Esto es lo que impide reenviar (replay) una aserción/atestación ya usada.
async function consumeChallenge(challenge, purpose) {
  const row = await prisma.webauthnChallenge.findUnique({ where: { challenge } });
  if (!row) return null;
  await prisma.webauthnChallenge.delete({ where: { challenge } }).catch(() => {});
  if (row.purpose !== purpose || row.expiresAt < new Date()) return null;
  return row;
}

// register.jsx captura la huella ANTES de que el empleado exista como fila real
// (el alta se confirma al final del wizard) — por eso employeeId es opcional acá:
// si ya existe, se usa su email/nombre real y se excluyen sus credenciales previas;
// si todavía no existe (empleado en alta), se generan opciones "genéricas" atadas
// solo a la cédula/nombre del formulario, sin tocar la tabla Employee todavía.
async function generateRegisterOptions({ employeeId, userName, userDisplayName }) {
  let employee = null;
  if (employeeId) {
    employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  }

  const existing = employeeId
    ? await prisma.webauthnCredential.findMany({ where: { employeeId } })
    : [];

  const options = await generateRegistrationOptions_({
    rpName: env.webauthnRpName,
    rpID: env.webauthnRpId,
    userName: employee?.email || userName || 'nuevo-empleado',
    userDisplayName: employee?.name || userDisplayName || 'Nuevo empleado',
    attestationType: 'none',
    excludeCredentials: existing.map((c) => ({ id: c.id, transports: c.transports })),
    // Sin authenticatorAttachment: acepta TANTO el Touch ID integrado (dev en Mac, hoy)
    // COMO un lector externo/roaming compatible con FIDO2 (kiosco en producción, después)
    // — antes forzaba 'platform', que hubiera excluido cualquier lector USB externo.
    authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' },
  });

  await saveChallenge(options.challenge, 'register', employeeId || null);
  return options;
}

// Verifica la ceremonia WebAuthn (firma, origin, rpID) pero NO persiste nada —
// devuelve el material verificado (public key, counter, transports) al cliente
// para que lo mantenga en memoria hasta que exista un employeeId real, momento
// en el que linkCredential() lo escribe. Si el empleado YA existía (ej. agregar
// una segunda credencial a alguien activo), sí persiste de una vez.
async function verifyRegister(attestationResponse, deviceLabel) {
  const challenge = decodeClientDataChallenge(attestationResponse);
  const challengeRow = challenge && (await consumeChallenge(challenge, 'register'));
  if (!challengeRow) {
    throw Object.assign(new Error('challenge_invalid_or_expired'), { status: 400, publicMessage: 'challenge_invalid_or_expired' });
  }

  const verification = await verifyRegistrationResponse({
    response: attestationResponse,
    expectedChallenge: challengeRow.challenge,
    expectedOrigin: env.webauthnOrigin,
    expectedRPID: env.webauthnRpId,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw Object.assign(new Error('registration_not_verified'), { status: 400, publicMessage: 'registration_not_verified' });
  }

  const { credential } = verification.registrationInfo;
  const payload = {
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString('base64'),
    signCount: credential.counter,
    transports: credential.transports || [],
  };

  if (challengeRow.employeeId) {
    await persistCredential(challengeRow.employeeId, payload, deviceLabel);
    return { verified: true, credentialId: credential.id, linked: true };
  }

  return { verified: true, credentialId: credential.id, linked: false, credential: payload };
}

async function persistCredential(employeeId, credential, deviceLabel) {
  return prisma.webauthnCredential.create({
    data: {
      id: credential.id,
      employeeId,
      publicKey: Buffer.from(credential.publicKey, 'base64'),
      signCount: credential.signCount,
      transports: credential.transports || [],
      deviceLabel: deviceLabel || null,
    },
  });
}

// Llamado justo después de crear el empleado en register.jsx's save(), con el
// material devuelto por verifyRegister() cuando linked===false.
async function linkCredential(employeeId, credential, deviceLabel) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw Object.assign(new Error('employee_not_found'), { status: 404, publicMessage: 'employee_not_found' });
  return persistCredential(employeeId, credential, deviceLabel);
}

async function generateAuthOptions() {
  const creds = await prisma.webauthnCredential.findMany({ select: { id: true, transports: true } });

  const options = await generateAuthenticationOptions({
    rpID: env.webauthnRpId,
    userVerification: 'required',
    allowCredentials: creds.map((c) => ({ id: c.id, transports: c.transports })),
  });

  await saveChallenge(options.challenge, 'auth', null);
  return options;
}

function decodeClientDataChallenge(response) {
  try {
    const clientDataJSON = JSON.parse(Buffer.from(response.response.clientDataJSON, 'base64url').toString('utf8'));
    return clientDataJSON.challenge;
  } catch {
    return null;
  }
}

async function verifyAuth(assertionResponse) {
  const challenge = decodeClientDataChallenge(assertionResponse);
  const challengeRow = challenge && (await consumeChallenge(challenge, 'auth'));
  if (!challengeRow) {
    throw Object.assign(new Error('challenge_invalid_or_expired'), { status: 400, publicMessage: 'challenge_invalid_or_expired' });
  }

  const credRow = await prisma.webauthnCredential.findUnique({
    where: { id: assertionResponse.id },
    include: { employee: { include: { status: true } } },
  });
  if (!credRow) {
    throw Object.assign(new Error('credential_not_recognized'), { status: 401, publicMessage: 'credential_not_recognized' });
  }

  const verification = await verifyAuthenticationResponse({
    response: assertionResponse,
    expectedChallenge: challengeRow.challenge,
    expectedOrigin: env.webauthnOrigin,
    expectedRPID: env.webauthnRpId,
    credential: {
      id: credRow.id,
      publicKey: new Uint8Array(credRow.publicKey),
      counter: credRow.signCount,
      transports: credRow.transports,
    },
  });

  if (!verification.verified) {
    throw Object.assign(new Error('assertion_not_verified'), { status: 401, publicMessage: 'assertion_not_verified' });
  }

  // Nunca confiar en nada del cliente más allá de la firma: el empleado elegible se
  // reconsulta acá, contra la fila real de Postgres — no contra un array cacheado.
  if (credRow.employee.status.code !== 'ok') {
    throw Object.assign(new Error('employee_not_eligible'), { status: 403, publicMessage: 'employee_not_eligible' });
  }

  await prisma.webauthnCredential.update({
    where: { id: credRow.id },
    data: { signCount: verification.authenticationInfo.newCounter, lastUsedAt: new Date() },
  });

  return { employee: credRow.employee };
}

module.exports = { generateRegisterOptions, verifyRegister, linkCredential, generateAuthOptions, verifyAuth };
