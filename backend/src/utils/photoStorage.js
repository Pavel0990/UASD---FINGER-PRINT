const fs = require('fs');
const path = require('path');

// Antes las fotos de empleado llegaban como dataURL (base64) y se guardaban tal cual en
// la columna photo_url — una fila podía pesar 2+ MB y ese peso viajaba en cada GET /employees.
// Acá se decodifica el dataURL una sola vez, se escribe a disco, y solo la URL corta
// (/employee-photos/EMP-00298.jpg) queda en Postgres.
const PHOTOS_DIR = path.join(__dirname, '..', '..', 'uploads', 'employee-photos');
const URL_PREFIX = '/employee-photos';

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function ensureDir() {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

function removeExistingFiles(employeeId) {
  for (const ext of Object.values(MIME_EXT)) {
    const p = path.join(PHOTOS_DIR, `${employeeId}.${ext}`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

// Devuelve la URL a persistir en photo_url. Si photoInput no es un dataURL nuevo (ya es
// una URL /employee-photos/... o viene undefined), lo deja pasar sin tocar el disco.
function savePhotoIfDataUri(photoInput, employeeId) {
  if (photoInput === undefined) return undefined;
  if (!photoInput) { removeExistingFiles(employeeId); return null; }

  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(photoInput);
  if (!match) return photoInput; // ya es una URL (p.ej. no se cambió la foto), no re-procesar

  const ext = MIME_EXT[match[1]];
  if (!ext) throw Object.assign(new Error('unsupported_photo_format'), { status: 400, publicMessage: 'unsupported_photo_format' });

  ensureDir();
  removeExistingFiles(employeeId);
  const fileName = `${employeeId}.${ext}`;
  fs.writeFileSync(path.join(PHOTOS_DIR, fileName), Buffer.from(match[2], 'base64'));
  return `${URL_PREFIX}/${fileName}`;
}

module.exports = { savePhotoIfDataUri, PHOTOS_DIR, URL_PREFIX };
