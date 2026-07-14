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

const app = express();

// El frontend (.jsx/.html estáticos) vive en la raíz del repo, un nivel arriba de backend/
const REPO_ROOT = path.join(__dirname, '..', '..');

app.use(express.json({ limit: '10mb' })); // fotos de empleado llegan como dataURL en el body
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api', employeesRoutes);
app.use('/api', rolesRoutes);
app.use('/api/audit-log', auditRoutes);
app.use('/api/credentials', credentialsRoutes);

// Nunca sirvas la carpeta backend/ (contiene .env, credenciales de DB) ni .git como estático
app.use((req, res, next) => {
  if (req.path.startsWith('/backend') || req.path.startsWith('/.git')) return res.status(404).end();
  next();
});
app.use(express.static(REPO_ROOT));

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`UASD Fingerprint backend escuchando en http://localhost:${env.port}`);
});
