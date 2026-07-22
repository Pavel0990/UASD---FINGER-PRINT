const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const employeesRoutes = require('./modules/employees/employees.routes');
const rolesRoutes = require('./modules/roles/roles.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const credentialsRoutes = require('./modules/credentials/credentials.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const holidaysRoutes = require('./modules/holidays/holidays.routes');
const rosterRoutes = require('./modules/roster/roster.routes');
const eventualitiesRoutes = require('./modules/eventualities/eventualities.routes');
const collectiveVacationsRoutes = require('./modules/collective-vacations/collective-vacations.routes');
const settingsRoutes = require('./modules/settings/settings.routes');

const app = express();

// El frontend (.jsx/.html estáticos) vive en la raíz del repo, un nivel arriba de backend/
const REPO_ROOT = path.join(__dirname, '..', '..');

app.use(express.json({ limit: '10mb' })); // fotos de empleado llegan como dataURL en el body
app.use(cookieParser());

// Fotos de empleado: se decodifican una sola vez a disco (photoStorage.js) y se sirven
// desde acá — Postgres solo guarda la URL corta, no el base64 completo.
app.use('/employee-photos', express.static(path.join(__dirname, '..', 'uploads', 'employee-photos')));

app.use('/api/auth', authRoutes);
app.use('/api', employeesRoutes);
app.use('/api', rolesRoutes);
app.use('/api/audit-log', auditRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', holidaysRoutes);
app.use('/api', rosterRoutes);
app.use('/api', eventualitiesRoutes);
app.use('/api', collectiveVacationsRoutes);
app.use('/api', settingsRoutes);

// Nunca sirvas la carpeta backend/ (contiene .env, credenciales de DB) ni .git como estático
app.use((req, res, next) => {
  if (req.path.startsWith('/backend') || req.path.startsWith('/.git')) return res.status(404).end();
  next();
});

// Auto-reload en desarrollo: vigila los .jsx/.css/.html del frontend (no hay
// bundler/HMR — Babel transpila en el navegador) y le avisa al navegador que
// recargue solo al guardar. connect-livereload inyecta el script en el HTML;
// el servidor de livereload escucha en su propio puerto (35729, estándar),
// separado de la app — no toca el origen :8080 que usan las cookies/WebAuthn.
if (!env.isProduction) {
  const livereload = require('livereload');
  const connectLivereload = require('connect-livereload');
  const lrServer = livereload.createServer({
    exts: ['html', 'css', 'jsx'],
    exclusions: [/node_modules/, /\.git/, /^backend/, /screenshots/, /vendor/],
    delay: 150,
  });
  lrServer.watch(REPO_ROOT);
  app.use(connectLivereload());
}

app.use(express.static(REPO_ROOT));

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`UASD Fingerprint backend escuchando en http://localhost:${env.port}`);
});
