import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { sendError } from './utils/apiResponse';
import { getDbStatus } from './config/database';

export const createApp = (): Express => {
  const app = express();

  // Trust proxy for reverse proxies in container / cloud environment
  app.set('trust proxy', true);

  // Basic Security Headers via Helmet
  // Configured to allow standard API consumption and preview iframes
  app.use(
    helmet({
      contentSecurityPolicy: false, // Keep CSP flexible for embeddable preview environments
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Cross-Origin Resource Sharing (CORS) restricted to client URL
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (such as mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.run.app') || // Support Google Cloud Run dynamic preview subdomains
          !env.isProduction
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'x-razorpay-signature',
        'X-Razorpay-Signature',
      ],
    })
  );

  // Request body parsing with strict size limits and rawBody retention for webhook verification
  app.use(
    express.json({
      limit: '1mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
        req.rawBodyBuffer = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Basic request logging
  app.use(requestLogger);

  // NoSQL injection query safety filter
  // Sanitizes keys with leading '$' or containing '.' in req.body/params/query
  app.use((req: Request, _res: Response, next) => {
    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
      return obj;
    };
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
  });

  // Apply general rate limiting to API routes
  app.use('/api', apiLimiter);

  // Handle requests during database initialization or fallback
  app.use('/api', async (req: Request, res: Response, next) => {
    // Health check endpoint is always permitted to report real system status
    if (req.path === '/health' || req.path === '/health/') {
      return next();
    }
    const db = getDbStatus();
    if (db.status === 'connecting') {
      // Brief wait up to 3 seconds for initial connection during server boot
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 100));
        if (getDbStatus().status === 'connected') break;
      }
    }

    if (getDbStatus().status !== 'connected') {
      return res.status(503).json({
        success: false,
        message: 'Database service is unavailable. Please try again later.',
        error: 'DATABASE_UNAVAILABLE',
      });
    }
    next();
  });

  // Mount API modules
  app.use('/api', routes);

  // 404 Handler for undefined API routes
  app.use('/api/*', (req: Request, res: Response) => {
    sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
  });

  // Database offline error middleware fallback
  app.use((err: any, req: Request, res: Response, next: any) => {
    if (
      err &&
      (err.name === 'MongooseError' ||
        err.name === 'MongoNetworkError' ||
        (err.message && err.message.includes('buffering timed out')))
    ) {
      console.warn('[AI Studio] Database offline — returning mock empty response');
      if (req.method === 'GET') {
        return res.json({
          success: true,
          data: req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {},
        });
      }
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable (database offline)',
      });
    }
    next(err);
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
