import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { app as apiApp } from './server/src/app';
import { connectDatabase, disconnectDatabase } from './server/src/config/database';
import { autoSeedTrustData } from './server/src/services/seed.service';
import { logger } from './server/src/utils/logger';
import { getCanonicalBaseUrl, generateRobotsTxt, generateSitemapXml } from './server/src/utils/seoService';

async function startServer() {
  const app = express();
  const portIndex = process.argv.indexOf('--port');
  const cliPort =
    portIndex !== -1 && process.argv[portIndex + 1]
      ? parseInt(process.argv[portIndex + 1], 10)
      : null;

  // Detect whether running in production mode (Render environment, production bundle dist/server.cjs, or NODE_ENV=production)
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RENDER_SERVICE_ID) ||
    (typeof __filename !== 'undefined' && __filename.endsWith('server.cjs')) ||
    (Boolean(process.argv[1]) && process.argv[1].includes('dist'));

  // Ensure process.env.PORT is respected for Render and cloud hosting platforms
  let resolvedPort = 3000;
  if (cliPort) {
    resolvedPort = cliPort;
  } else if (process.env.PORT) {
    const parsedPort = parseInt(process.env.PORT, 10);
    // In AI Studio dev container, NGINX occupies NGINX_PORT (8080) while dev server runs on 3000
    if (
      !isProduction &&
      process.env.NGINX_PORT &&
      parsedPort === parseInt(process.env.NGINX_PORT, 10)
    ) {
      resolvedPort = process.env.DEFAULT_APP_PORT
        ? parseInt(process.env.DEFAULT_APP_PORT, 10)
        : 3000;
    } else if (!isNaN(parsedPort) && parsedPort > 0) {
      resolvedPort = parsedPort;
    }
  } else if (process.env.DEFAULT_APP_PORT) {
    resolvedPort = parseInt(process.env.DEFAULT_APP_PORT, 10);
  }

  const PORT = resolvedPort;

  // Ensure NODE_ENV is explicitly set to production when running bundled server in production
  if (isProduction && !process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

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

  // Vite middleware for frontend development vs static assets in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
      ? path.join(process.cwd(), 'dist')
      : path.resolve(__dirname);
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Handle server errors (e.g. EADDRINUSE) gracefully
  httpServer.on('error', (err: any) => {
    logger.error('HTTP server encountered an error:', err);
  });

  // Start HTTP server immediately on 0.0.0.0 and PORT so Render detects the port right away
  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`=======================================================`);
    logger.info(` Siddhivinayak Charitable Trust Unified Platform Ready `);
    logger.info(` Port:        ${PORT} (bound to 0.0.0.0)               `);
    logger.info(` Frontend:    http://0.0.0.0:${PORT}/                  `);
    logger.info(` API Health:  http://0.0.0.0:${PORT}/api/health        `);
    logger.info(`=======================================================`);
  });

  // Initialize backend database connection in the background without blocking HTTP port readiness
  connectDatabase({ allowInMemory: !isProduction })
    .then(async (dbConnected) => {
      if (dbConnected) {
        try {
          const { Donation } = await import('./server/src/models/Donation');
          // Auto-sync receiptNumber index in MongoDB to ensure partialFilterExpression prevents null key collisions
          await Donation.collection
            .createIndex(
              { receiptNumber: 1 },
              { unique: true, partialFilterExpression: { receiptNumber: { $type: 'string' } } }
            )
            .catch(async (idxErr: any) => {
              if (idxErr.code === 85 || idxErr.codeName === 'IndexOptionsConflict') {
                await Donation.collection.dropIndex('receiptNumber_1').catch(() => {});
                await Donation.collection.createIndex(
                  { receiptNumber: 1 },
                  { unique: true, partialFilterExpression: { receiptNumber: { $type: 'string' } } }
                );
              }
            });
        } catch (_) {}

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
