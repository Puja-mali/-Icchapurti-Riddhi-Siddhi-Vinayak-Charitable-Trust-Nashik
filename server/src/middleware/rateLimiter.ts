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
  skip: (req) => req.path === '/health' || req.path === '/health/',
  handler: (req, res) => {
    const retryAfterSeconds = Math.ceil(
      ((req as any).rateLimit?.resetTime?.getTime() - Date.now()) / 1000
    ) || Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    sendError(
      res,
      `Too many requests from this IP. Please wait ${retryAfterSeconds} seconds before trying again.`,
      429
    );
  },
});

/**
 * Strict Rate Limiter for Authentication Endpoints
 * Mitigates brute-force credential stuffing and password guessing attacks.
 * TODO: For production hardening, add Redis-backed store for multi-instance clusters.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many authentication attempts. Please try again after 15 minutes.',
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
  max: 30, // Max 30 orders/verifications per IP window
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many payment generation requests from this network. Please wait a few minutes before trying again.',
      429
    );
  },
});
