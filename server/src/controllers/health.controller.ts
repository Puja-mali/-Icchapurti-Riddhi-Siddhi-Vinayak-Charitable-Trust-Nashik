import { Request, Response } from 'express';
import { getDbStatus } from '../config/database';
import { sendSuccess } from '../utils/apiResponse';
import { env } from '../config/env';

export class HealthController {
  /**
   * Health Check Endpoint
   * Returns server uptime, environment, and sanitized database connectivity without leaking sensitive secrets.
   * Returns HTTP 200 when database is connected, HTTP 503 when database is disconnected or degraded.
   */
  public static getHealth(_req: Request, res: Response): void {
    const db = getDbStatus();
    const isDbConnected = db.status === 'connected';

    const healthData = {
      server: {
        status: isDbConnected ? 'online' : 'degraded',
        uptimeSeconds: Math.floor(process.uptime()),
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      database: {
        status: db.status,
        configured: Boolean(
          process.env.MONGODB_URI ||
            env.MONGODB_URI ||
            ((process.env.USE_IN_MEMORY_DB === 'true' || env.USE_IN_MEMORY_DB) && !env.isProduction)
        ),
        ...(isDbConnected ? { databaseName: db.name } : {}),
      },
      api: {
        version: '1.0.0',
        name: 'Siddhivinayak Charitable Trust REST API',
      },
    };

    if (isDbConnected) {
      sendSuccess(
        res,
        healthData,
        'Siddhivinayak Charitable Trust Backend service is operational.',
        200
      );
    } else {
      res.status(503).json({
        success: false,
        message: 'Backend service degraded: Database is disconnected or unavailable.',
        data: healthData,
      });
    }
  }
}
