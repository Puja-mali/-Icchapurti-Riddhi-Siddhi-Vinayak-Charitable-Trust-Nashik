import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validators/auth.validator';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public (Rate limited)
 */
router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate existing user credentials
 * @access  Public (Rate limited)
 */
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  AuthController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Obtain new access token using a valid refresh token (from HttpOnly cookie or request body)
 * @access  Public
 */
router.post('/refresh', AuthController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke current user session and clear authentication cookies
 * @access  Public / Authenticated
 */
router.post('/logout', optionalAuthenticate, AuthController.logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Safely change password for the authenticated user
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  AuthController.changePassword
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request a single-use password reset link via email
 * @access  Public (Rate limited)
 */
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);

/**
 * @route   GET /api/auth/reset-password/validate/:token
 * @desc    Validate password reset token validity before showing reset form
 * @access  Public
 */
router.get('/reset-password/validate/:token', AuthController.validateResetToken);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using valid single-use token
 * @access  Public (Rate limited)
 */
router.post('/reset-password', authLimiter, AuthController.resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve profile of the currently authenticated user
 * @access  Private
 */
router.get('/me', authenticate, AuthController.getMe);

export default router;
