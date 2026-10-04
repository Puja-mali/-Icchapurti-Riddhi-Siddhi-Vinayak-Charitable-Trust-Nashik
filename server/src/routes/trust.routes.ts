import { Router } from 'express';
import { TrustController } from '../controllers/trust.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateTrustProfileSchema } from '../validators/trust.validator';

const router = Router();

// ================= PUBLIC ROUTE =================
/**
 * @route   GET /api/trust
 * @desc    Retrieve public organization profile, vision, mission, and registered details
 * @access  Public
 */
router.get('/', TrustController.getPublicTrust);

// ================= ADMIN ROUTES =================
/**
 * @route   GET /api/trust/admin
 * @desc    Retrieve complete organization profile for administrative review
 * @access  Private (ADMIN only)
 */
router.get('/admin', authenticate, authorize('ADMIN'), TrustController.getAdminTrust);

/**
 * @route   PATCH /api/trust/admin
 * @desc    Update or initialize organization profile and governance data
 * @access  Private (ADMIN only)
 */
router.patch(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  validateBody(updateTrustProfileSchema),
  TrustController.updateAdminTrust
);

export default router;
