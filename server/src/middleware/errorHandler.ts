import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/apiResponse';
export { AppError };
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Centralized Error Handling Middleware
 * Catches all operational and unexpected application errors.
 * TODO: For production hardening, add automated Sentry / alert hooks.
 * TODO: Conduct security penetration testing for detailed error disclosure prevention.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response => {
  const statusCode =
    err instanceof AppError
      ? err.statusCode
      : err instanceof ZodError || err.name === 'CastError' || err.name === 'ValidationError'
      ? 400
      : err.code === 11000
      ? 409
      : err.status || err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - Internal Server Error:`, {
      message: err.message,
      name: err.name,
      stack: env.isProduction ? undefined : err.stack,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - HTTP ${statusCode}: ${err.message}`);
  }

  // Handle explicitly thrown AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors || []);
  }

  // Handle Mongoose / MongoDB offline errors gracefully
  if (
    err.name === 'MongooseError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoServerSelectionError' ||
    (typeof err.message === 'string' && (
      err.message.includes('buffering timed out') ||
      err.message.includes('before initial connection') ||
      err.message.includes('connect ECONNREFUSED')
    ))
  ) {
    logger.warn(`[AI Studio] Database offline — returning fallback response: ${err.message}`);
    if (req.method === 'GET') {
      const isPlural = req.path.endsWith('s') || req.path.endsWith('s/');
      return res.json(isPlural ? [] : {});
    }
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable (database offline)',
    });
  }

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return sendError(res, 'Validation failed', 400, formattedErrors);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A record with this ${field} already exists.`;
    return sendError(res, message, 409, [{ field, message }]);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid resource identifier format for ${err.path}`, 400);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    const formattedErrors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
    return sendError(res, 'Database validation error', 400, formattedErrors);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired. Please refresh your session.', 401);
  }

  // Generic fallback for unhandled exceptions
  const fallbackMessage = env.isProduction
    ? 'An unexpected internal server error occurred.'
    : err.message || 'Internal Server Error';

  return sendError(res, fallbackMessage, 500);
};
