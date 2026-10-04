import { Router } from 'express';
import { TrustController } from '../controllers/trust.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createTrusteeSchema,
  updateTrusteeSchema,
  trusteeQuerySchema,
  objectIdParamSchema,
} from '../validators/trust.validator';

const router = Router();

// ================= PUBLIC ROUTE =================
/**
 * @route   GET /api/trustees
 * @desc    Retrieve list of active trustees sorted by displayOrder
 * @access  Public
 */
router.get('/', TrustController.getPublicTrustees);

// ================= ADMIN ROUTES =================
/**
 * @route   GET /api/trustees/admin
 * @desc    Retrieve all trustees (active and inactive) for admin management
 * @access  Private (ADMIN only)
 */
router.get(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  validateQuery(trusteeQuerySchema),
  TrustController.getAdminTrustees
);

/**
 * @route   POST /api/trustees/admin
 * @desc    Add a new trustee record
 * @access  Private (ADMIN only)
 */
router.post(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  validateBody(createTrusteeSchema),
  TrustController.createTrustee
);

/**
 * @route   PATCH /api/trustees/admin/:id
 * @desc    Update trustee details, status, or display order
 * @access  Private (ADMIN only)
 */
router.patch(
  '/admin/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(objectIdParamSchema),
  validateBody(updateTrusteeSchema),
  TrustController.updateTrustee
);

/**
 * @route   DELETE /api/trustees/admin/:id
 * @desc    Permanently delete a trustee record
 * @access  Private (ADMIN only)
 */
router.delete(
  '/admin/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(objectIdParamSchema),
  TrustController.deleteTrustee
);

export default router;
