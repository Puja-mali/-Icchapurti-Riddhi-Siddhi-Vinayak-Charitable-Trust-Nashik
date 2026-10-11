import { Router } from 'express';
import { PushController } from '../controllers/push.controller';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/push/public-key
 * @desc    Get the server's VAPID public key
 * @access  Public
 */
router.get('/public-key', PushController.getPublicKey);

/**
 * @route   POST /api/push/subscribe
 * @desc    Register a new push subscription for the logged-in user
 * @access  Private (Authenticated)
 */
router.post('/subscribe', apiLimiter, authenticate, PushController.subscribe);

/**
 * @route   POST /api/push/unsubscribe
 * @desc    Remove an existing push subscription for the logged-in user
 * @access  Private (Authenticated)
 */
router.post('/unsubscribe', authenticate, PushController.unsubscribe);

/**
 * @route   GET /api/push/status
 * @desc    Check whether current user has active push subscriptions
 * @access  Private (Authenticated)
 */
router.get('/status', authenticate, PushController.getStatus);

export default router;
