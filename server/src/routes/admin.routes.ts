import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/admin/dashboard/summary
 * @desc    Retrieve real MongoDB-backed administrative metrics and activity feed
 * @access  Private (Strictly ADMIN only)
 */
router.get(
  '/dashboard/summary',
  authenticate,
  authorize('ADMIN'),
  AdminController.getDashboardSummary
);

/**
 * @route   GET /api/admin/settings
 * @desc    Retrieve site settings including module configuration
 * @access  Private (Strictly ADMIN only)
 */
router.get(
  '/settings',
  authenticate,
  authorize('ADMIN'),
  AdminController.getSettings
);

/**
 * @route   PATCH /api/admin/settings/kumbh-mode
 * @desc    Update Kumbh Mode feature flag
 * @access  Private (Strictly ADMIN only)
 */
router.patch(
  '/settings/kumbh-mode',
  authenticate,
  authorize('ADMIN'),
  AdminController.updateKumbhMode
);

export default router;
