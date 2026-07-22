const prisma = require('../../db/prisma');

// Fila única (id fijo = 1) — no existe todavía una pantalla de "Configuración"
// completa, así que se modela como singleton en vez de clave/valor genérico.
async function getSettings() {
  return prisma.systemConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

async function updateSettings({ lateThresholdMinutes }) {
  return prisma.systemConfig.upsert({
    where: { id: 1 },
    update: { lateThresholdMinutes },
    create: { id: 1, lateThresholdMinutes },
  });
}

module.exports = { getSettings, updateSettings };
