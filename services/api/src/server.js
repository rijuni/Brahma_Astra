const app = require('./app');
const env = require('./config/env');
const logger = require('./observability/logger');
const prisma = require('./repositories/prisma');

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`BRAHMA + ASTRA Application API listening on port ${PORT}`, {
    port: PORT,
    environment: env.NODE_ENV,
    prefix: env.API_PREFIX
  });
});

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Prisma database connection disconnected cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database disconnection', err);
      process.exit(1);
    }
  });

  // Force close after 10s if dangling connections persist
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', reason instanceof Error ? reason : new Error(String(reason)));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

module.exports = server;
