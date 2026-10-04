import { Router } from 'express';
import { HelpRequestController } from '../controllers/helpRequest.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createHelpRequestSchema,
  updateHelpRequestAdminSchema,
  helpRequestQuerySchema,
} from '../validators/helpRequest.validator';

const router = Router();

// ================= ADMIN ENDPOINTS =================
/**
 * @route   GET /api/help-requests/admin/all and /api/help-requests/admin
 * @desc    List all help requests with filters, pagination, and status metrics
 * @access  Private (ADMIN only)
 */
router.get(
  '/admin/all',
  authenticate,
  authorize('ADMIN'),
  validateQuery(helpRequestQuerySchema),
  HelpRequestController.getAdminHelpRequests
);

router.get(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  validateQuery(helpRequestQuerySchema),
  HelpRequestController.getAdminHelpRequests
);

/**
 * @route   GET /api/help-requests/admin/:id
 * @desc    Get detailed help request by ID for admin review
 * @access  Private (ADMIN only)
 */
router.get(
  '/admin/:id',
  authenticate,
  authorize('ADMIN'),
  HelpRequestController.getAdminHelpRequestById
);

/**
 * @route   PATCH /api/help-requests/admin/:id
 * @desc    Update status, internal admin notes, or assignment
 * @access  Private (ADMIN only)
 */
router.patch(
  '/admin/:id',
  authenticate,
  authorize('ADMIN'),
  validateBody(updateHelpRequestAdminSchema),
  HelpRequestController.updateHelpRequestAdmin
);

/**
 * @route   DELETE /api/help-requests/admin/:id
 * @desc    Permanently delete a help request record
 * @access  Private (ADMIN only)
 */
router.delete(
  '/admin/:id',
  authenticate,
  authorize('ADMIN'),
  HelpRequestController.deleteHelpRequestAdmin
);

// Backward compatibility for /:id/status admin route
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validateBody(updateHelpRequestAdminSchema),
  HelpRequestController.updateHelpRequestAdmin
);

// ================= AUTHENTICATED USER ENDPOINTS =================
/**
 * @route   POST /api/help-requests
 * @desc    Submit a new aid/hardship application (authenticated user ID derived when logged in, or anonymous guest)
 * @access  Public / Optional Auth
 */
router.post(
  '/',
  optionalAuthenticate,
  validateBody(createHelpRequestSchema),
  HelpRequestController.createHelpRequest
);

/**
 * @route   GET /api/help-requests/my
 * @desc    Retrieve requests submitted by the logged-in user
 * @access  Private (Authenticated user)
 */
router.get(
  '/my',
  authenticate,
  HelpRequestController.getMyHelpRequests
);

/**
 * @route   GET /api/help-requests/:id
 * @desc    Get single request by ID with IDOR ownership validation
 * @access  Private (Owner or ADMIN)
 */
router.get(
  '/:id',
  authenticate,
  HelpRequestController.getHelpRequestById
);

export default router;
