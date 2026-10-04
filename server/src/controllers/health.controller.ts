import { Request, Response } from 'express';
import { getDbStatus } from '../config/database';
import { sendSuccess } from '../utils/apiResponse';
import { env } from '../config/env';

export class HealthController {
  /**
   * Health Check Endpoint
   * Returns server uptime, environment, and sanitized database connectivity without leaking sensitive secrets.
   */
  public static getHealth(_req: Request, res: Response): void {
    const db = getDbStatus();

    const healthData = {
      server: {
        status: 'online',
        uptimeSeconds: Math.floor(process.uptime()),
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      database: {
        status: db.status,
        configured: Boolean(env.MONGODB_URI),
        ...(db.status === 'connected' ? { databaseName: db.name } : {}),
      },
      api: {
        version: '1.0.0',
        name: 'Siddhivinayak Charitable Trust REST API',
      },
    };

    sendSuccess(
      res,
      healthData,
      'Siddhivinayak Charitable Trust Backend service is operational.'
    );
  }
}
