import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { paymentLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/ai/donation-allocation
 * @desc    Generate an AI-powered donation allocation & impact plan grounded in verified MongoDB data
 * @access  Private (Authenticated Donors & Users)
 */
router.post('/donation-allocation', authenticate, paymentLimiter, AiController.getDonationAllocation);

export default router;
