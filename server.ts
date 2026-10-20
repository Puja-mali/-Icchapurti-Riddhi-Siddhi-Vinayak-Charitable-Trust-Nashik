import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app as apiApp } from './server/src/app';
import { connectDatabase, disconnectDatabase } from './server/src/config/database';
import { autoSeedTrustData } from './server/src/services/seed.service';
import { logger } from './server/src/utils/logger';
import { getCanonicalBaseUrl, generateRobotsTxt, generateSitemapXml } from './server/src/utils/seoService';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust proxy for reverse proxies (e.g. Cloud Run / ALB - single upstream hop)
  app.set('trust proxy', 1);

  // Dynamic SEO sitemap and robots endpoints
  app.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = getCanonicalBaseUrl(req);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(generateRobotsTxt(baseUrl));
  });

  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    const baseUrl = getCanonicalBaseUrl(req);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    try {
      const xml = await generateSitemapXml(baseUrl);
      res.send(xml);
    } catch {
      res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
  });

  // Route all /api/* requests strictly to the backend Express application
  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      return apiApp(req, res, next);
    }
    next();
  });

  const httpServer = http.createServer(app);

  // Vite middleware for frontend development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
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

  // Handle server errors (e.g. EADDRINUSE) gracefully
  httpServer.on('error', (err: any) => {
    logger.error('HTTP server encountered an error:', err);
  });

  // Start HTTP server immediately so port 3000 responds right away for health & pre-warming checks
  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`=======================================================`);
    logger.info(` Siddhivinayak Charitable Trust Unified Platform Ready `);
    logger.info(` Port:        ${PORT}                                  `);
    logger.info(` Frontend:    http://localhost:${PORT}/                `);
    logger.info(` API Health:  http://localhost:${PORT}/api/health      `);
    logger.info(`=======================================================`);
  });

  // Initialize backend database connection in the background without blocking port 3000 readiness
  connectDatabase({ allowInMemory: process.env.NODE_ENV !== 'production' })
    .then(async (dbConnected) => {
      if (dbConnected) {
        await autoSeedTrustData();
      } else {
        logger.warn(
          '[NOTICE] Database is currently offline. Starting server with resilient stubs and fallback data.'
        );
      }
    })
    .catch((dbErr) => {
      logger.warn('[NOTICE] Database connection error caught during startup:', dbErr);
    });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down cleanly...`);
    httpServer.close(async () => {
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

startServer().catch((err) => {
  logger.error('Fatal unhandled error during server startup:', err);
});
