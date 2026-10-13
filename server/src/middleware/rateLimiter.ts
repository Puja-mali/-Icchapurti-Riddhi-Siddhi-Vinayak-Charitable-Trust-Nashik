import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';

/**
 * General API Rate Limiter
 * Guards endpoints against high-volume abuse and denial-of-service attempts.
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: (req) => {
    // In local development or loopback, allow higher threshold so local test runs don't lock out developers
    if (!env.isProduction || req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1') {
      return env.RATE_LIMIT_MAX_REQUESTS * 4;
    }
    return env.RATE_LIMIT_MAX_REQUESTS;
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    // Partition by authenticated user if present so different users on shared NAT/cellular gateway do not collide
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (userId) {
      return `user_${userId}`;
    }
    return req.ip || '127.0.0.1';
  },
  skip: (req) => {
    if (process.env.NODE_ENV === 'test') return true;
    const path = req.path || '';
    const originalUrl = req.originalUrl || '';
    // Exclude health check and lightweight background unread-count polling so background tab polling never exhausts user quota
    if (
      path === '/health' ||
      path === '/health/' ||
      originalUrl.includes('/api/health') ||
      originalUrl.includes('/notifications/unread-count')
    ) {
      return true;
    }
    return false;
  },
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
