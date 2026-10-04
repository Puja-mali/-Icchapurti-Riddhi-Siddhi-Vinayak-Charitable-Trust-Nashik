import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';

const router = Router();

/**
 * @route   GET /api/public/home
 * @desc    Get aggregated public homepage statistics, featured causes, upcoming events, and verified audits
 * @access  Public (No authentication required, no sensitive data exposed)
 */
router.get('/home', PublicController.getHomeData);

/**
 * @route   GET /api/public/kumbh
 * @desc    Get public Simhastha Kumbh 2027 initiatives, campaigns, events, roles, and media
 * @access  Public (No authentication required, no sensitive data exposed)
 */
router.get('/kumbh', PublicController.getKumbhData);

/**
 * @route   GET /api/public/settings
 * @desc    Get public site configuration including Kumbh Mode feature flag
 * @access  Public
 */
router.get('/settings', PublicController.getSettings);

export default router;
