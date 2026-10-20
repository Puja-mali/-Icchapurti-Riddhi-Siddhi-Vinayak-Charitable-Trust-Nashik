import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * Dedicated Rate Limiter for Public Form Submissions
 * Mitigates spam floods on Contact, Help Requests, and Volunteer submissions.
 */
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 submissions per IP in 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many form submissions received from this connection. Please wait a few minutes before submitting again.',
      429
    );
  },
});

/**
 * Accessible Anti-Spam Middleware
 * Checks for honeypot traps and minimum human interaction time.
 * Fully compatible with screen readers and keyboard navigation (honeypots are aria-hidden / tabIndex -1).
 */
export const spamProtection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const body = req.body || {};

    // 1. Honeypot traps: If any hidden trap field contains content, it is automated bot spam.
    const honeypotFields = ['website_url', 'bot_trap', 'fax_number', 'company_address'];
    for (const field of honeypotFields) {
      if (body[field] && typeof body[field] === 'string' && body[field].trim().length > 0) {
        logger.warn(`[AntiSpam] Honeypot triggered on field "${field}" from IP ${req.ip}`);
        // Return a benign error or simulated success so bots don't adapt
        sendError(res, 'Submission could not be processed at this time. Please try again.', 400);
        return;
      }
    }

    // 2. Minimum submission time check:
    // Human users take at least 1.5 seconds to fill and submit a form.
    // The client embeds a cryptographic or numeric timestamp `_form_render_time`.
    if (body._form_render_time) {
      const renderTime = Number(body._form_render_time);
      if (!isNaN(renderTime)) {
        const elapsed = Date.now() - renderTime;
        // If submitted under 1.2 seconds, it was filled programmatically by a script
        if (elapsed < 1200) {
          logger.warn(`[AntiSpam] Rapid automated submission detected (${elapsed}ms) from IP ${req.ip}`);
          sendError(res, 'Please take a moment to review your submission before sending.', 429);
          return;
        }
      }
    }

    // Clean internal anti-spam keys before passing to database validators
    delete body.website_url;
    delete body.bot_trap;
    delete body.fax_number;
    delete body.company_address;
    delete body._form_render_time;

    next();
  } catch (error) {
    next(error);
  }
};
