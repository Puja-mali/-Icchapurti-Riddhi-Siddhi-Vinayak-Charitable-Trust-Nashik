import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app as apiApp } from './server/src/app';
import { connectDatabase, disconnectDatabase } from './server/src/config/database';
import { autoSeedTrustData } from './server/src/services/seed.service';
import { logger } from './server/src/utils/logger';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for reverse proxies in container / cloud environment
  app.set('trust proxy', true);

  // Initialize backend database connection (resilient fallback if unavailable)
  try {
    const dbConnected = await connectDatabase();
    if (dbConnected) {
      await autoSeedTrustData();
    } else {
      logger.warn(
        '[NOTICE] Database is currently offline. Starting server with resilient stubs and fallback data.'
      );
    }
  } catch (dbErr) {
    logger.warn('[NOTICE] Database connection error caught during startup:', dbErr);
  }

  // Route all /api/* requests strictly to the backend Express application
  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      return apiApp(req, res, next);
    }
    next();
  });

  // Vite middleware for frontend development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`=======================================================`);
    logger.info(` Siddhivinayak Charitable Trust Unified Platform Ready `);
    logger.info(` Port:        ${PORT}                                  `);
    logger.info(` Frontend:    http://localhost:${PORT}/                `);
    logger.info(` API Health:  http://localhost:${PORT}/api/health      `);
    logger.info(`=======================================================`);
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down cleanly...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed cleanly. Process exiting.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Graceful shutdown timeout exceeded. Forcing exit.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
