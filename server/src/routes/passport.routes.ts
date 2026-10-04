import { Router } from 'express';
import { PassportController } from '../controllers/passport.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/passport/my
 * @desc    Get authenticated donor's personal verified Impact Passports
 * @access  Private (Authenticated Users)
 */
router.get('/my', authenticate, PassportController.getMyPassports);

/**
 * @route   GET /api/passport/admin/all
 * @desc    Admin listing of all verified Impact Passports across the trust
 * @access  Private (ADMIN only)
 */
router.get('/admin/all', authenticate, authorize('ADMIN'), PassportController.getAllPassports);

/**
 * @route   GET /api/passport/:id
 * @desc    Get single Impact Passport with IDOR ownership check
 * @access  Private (Donor owner or ADMIN)
 */
router.get('/:id', authenticate, PassportController.getPassportById);

export default router;
