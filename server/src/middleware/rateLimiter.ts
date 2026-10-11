import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';

/**
 * General API Rate Limiter
 * Guards endpoints against high-volume abuse and denial-of-service attempts.
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: (req) =>
    process.env.NODE_ENV === 'test' ||
    req.path === '/health' ||
    req.path === '/health/' ||
    req.originalUrl === '/api/health' ||
    req.originalUrl === '/api/health/',
  handler: (req, res) => {
    const retryAfterSeconds =
      Math.ceil(
        (((req as any).rateLimit?.resetTime?.getTime() || 0) - Date.now()) / 1000
      ) || Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000);
    const safeSeconds = Math.max(1, retryAfterSeconds);
    res.setHeader('Retry-After', safeSeconds);
    sendError(
      res,
      `Too many requests from this IP. Please wait ${safeSeconds} seconds before trying again.`,
      429
    );
  },
});

/**
 * Strict Rate Limiter for Authentication Endpoints
 * Mitigates brute-force credential stuffing and password guessing attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (_req, res) => {
    sendError(
      res,
      'Too many authentication attempts from this network. Please wait a few minutes before trying again.',
      429
    );
  },
});

/**
 * Strict Rate Limiter for Payment / Order Endpoints
 * Mitigates card testing, automated order generation, and replay attacks.
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Max 60 orders/verifications per IP window
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (_req, res) => {
    sendError(
      res,
      'Too many payment generation requests from this network. Please wait a few minutes before trying again.',
      429
    );
  },
});
