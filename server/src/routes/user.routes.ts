import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize, enforceOwnerOrRoles } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get currently logged in user profile
 * @access  Private (Authenticated user)
 */
router.get('/me', authenticate, UserController.getUserById);

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user's profile details (cannot self-assign roles or status)
 * @access  Private (Authenticated user)
 */
router.patch('/me', authenticate, UserController.updateMe);

/**
 * @route   GET /api/users
 * @desc    List and paginate all registered users
 * @access  Private (ADMIN only)
 */
router.get('/', authenticate, authorize('ADMIN'), UserController.listUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get specific user profile with strict IDOR prevention
 * @access  Private (Owner or ADMIN)
 */
router.get(
  '/:id',
  authenticate,
  enforceOwnerOrRoles('id', 'ADMIN'),
  UserController.getUserById
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Activate or deactivate user account
 * @access  Private (ADMIN only)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  UserController.updateUserStatus
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Promote or assign role to user (ADMIN, STAFF, VOLUNTEER, DONOR)
 * @access  Private (ADMIN only)
 */
router.patch(
  '/:id/role',
  authenticate,
  authorize('ADMIN'),
  UserController.updateUserRole
);

export default router;
