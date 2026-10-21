import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    // Redact sensitive tokens (password reset tokens, invitation tokens) from logged URLs
    const sanitizedUrl = (req.originalUrl || '')
      .replace(/(\/reset-password\/validate\/)[a-zA-Z0-9_-]+/gi, '$1[REDACTED]')
      .replace(/(\/accept-invitation\/)[a-zA-Z0-9_-]+/gi, '$1[REDACTED]')
      .replace(/([?&]token=)[^&]+/gi, '$1[REDACTED]');
    logger.info(`${req.method} ${sanitizedUrl} [${res.statusCode}] - ${duration}ms (IP: ${ip})`);
  });

  next();
};
