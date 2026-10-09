import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Attempt database connection
    const dbConnected = await connectDatabase();
    if (!dbConnected) {
      if (process.env.NODE_ENV === 'production' || env.isProduction) {
        logger.error(
          '[FATAL] Production startup aborted: Could not connect to real MongoDB. Set a valid MONGODB_URI in environment.'
        );
      } else {
        logger.error(
          '[FATAL] Development startup aborted: Database connection failed. Set MONGODB_URI or USE_IN_MEMORY_DB=true in .env.'
        );
      }
      process.exit(1);
    }

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`=======================================================`);
      logger.info(` Siddhivinayak Charitable Trust Backend Server Running `);
      logger.info(` Port:        ${env.PORT}                              `);
      logger.info(` Environment: ${env.NODE_ENV}                          `);
      logger.info(` Client URL:  ${env.CLIENT_URL}                        `);
      logger.info(` Health URL:  http://localhost:${env.PORT}/api/health   `);
      logger.info(`=======================================================`);
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server closed cleanly. Process exiting.');
        process.exit(0);
      });

      // Force shutdown after timeout if graceful close hangs
      setTimeout(() => {
        logger.error('Graceful shutdown timeout exceeded. Forcing termination.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Fatal error encountered during server bootstrap:', error);
    process.exit(1);
  }
};

startServer();
