const { PrismaClient } = require('@prisma/client');
const logger = require('../observability/logger');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances in development / hot reload / testing
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' }
      ]
    });

    global.__prisma.$on('error', (e) => {
      logger.error('Prisma Error', e);
    });

    global.__prisma.$on('warn', (e) => {
      logger.warn('Prisma Warning', { message: e.message });
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
