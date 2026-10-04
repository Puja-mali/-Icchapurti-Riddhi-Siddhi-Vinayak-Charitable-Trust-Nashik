import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app as apiApp } from './server/src/app';
import { connectDatabase } from './server/src/config/database';
import { logger } from './server/src/utils/logger';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for reverse proxies in container / cloud environment
  app.set('trust proxy', true);

  // Initialize backend database connection (graceful fallback if MONGODB_URI not yet set)
  await connectDatabase();

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

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`=======================================================`);
    logger.info(` Siddhivinayak Charitable Trust Unified Platform Ready `);
    logger.info(` Port:        ${PORT}                                  `);
    logger.info(` Frontend:    http://localhost:${PORT}/                `);
    logger.info(` API Health:  http://localhost:${PORT}/api/health      `);
    logger.info(`=======================================================`);
  });
}

startServer();
