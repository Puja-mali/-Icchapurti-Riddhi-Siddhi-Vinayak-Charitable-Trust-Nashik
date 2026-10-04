import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Check system vitality, uptime, and database connection status
 * @access  Public
 */
router.get('/', HealthController.getHealth);

export default router;
