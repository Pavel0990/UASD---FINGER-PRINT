const { PrismaClient } = require('@prisma/client');

// Singleton — evita abrir un pool de conexiones nuevo por cada require()
const prisma = new PrismaClient();

module.exports = prisma;
