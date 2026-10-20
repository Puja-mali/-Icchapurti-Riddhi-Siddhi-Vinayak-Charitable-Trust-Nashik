import { Router } from 'express';
import { VolunteerController } from '../controllers/volunteer.controller';
import { authenticate, authorize } from '../middleware/auth';

import { publicFormLimiter, spamProtection } from '../middleware/spamProtection';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * @route   GET /api/volunteers/roles
 * @desc    Public list of active volunteer opportunities/roles
 * @access  Public
 */
router.get('/roles', VolunteerController.getPublicRoles);

/**
 * @route   POST /api/volunteers/apply
 * @desc    Public volunteer application submission
 * @access  Public
 */
router.post('/apply', publicFormLimiter, spamProtection, VolunteerController.submitApplication);

// ============================================================================
// AUTHENTICATED VOLUNTEER ROUTES (Private, user-isolated)
// ============================================================================

/**
 * @route   GET /api/volunteers/me
 * @desc    Retrieve logged-in volunteer's profile, shifts, certificates, and stats
 * @access  Private (Authenticated users - data strictly isolated to req.user._id)
 */
router.get(
  '/me',
  authenticate,
  authorize('VOLUNTEER', 'ADMIN', 'STAFF', 'DONOR'),
  VolunteerController.getMyVolunteerProfile
);

/**
 * @route   PUT /api/volunteers/me
 * @desc    Update volunteer's own skills and availability preferences
 * @access  Private (Authenticated users - data strictly isolated to req.user._id)
 */
router.put(
  '/me',
  authenticate,
  authorize('VOLUNTEER', 'ADMIN', 'STAFF', 'DONOR'),
  VolunteerController.updateMyVolunteerProfile
);

/**
 * @route   GET /api/volunteers/me/shifts
 * @desc    Get shifts strictly belonging to logged-in volunteer
 * @access  Private (Authenticated users - data strictly isolated to req.user._id)
 */
router.get(
  '/me/shifts',
  authenticate,
  authorize('VOLUNTEER', 'ADMIN', 'STAFF', 'DONOR'),
  VolunteerController.getMyShifts
);

/**
 * @route   POST /api/volunteers/me/shifts
 * @desc    Self-log a completed shift
 * @access  Private (Authenticated users - data strictly isolated to req.user._id)
 */
router.post(
  '/me/shifts',
  authenticate,
  authorize('VOLUNTEER', 'ADMIN', 'STAFF', 'DONOR'),
  VolunteerController.logMyShift
);

/**
 * @route   GET /api/volunteers/me/certificates
 * @desc    Get certificates strictly belonging to logged-in volunteer
 * @access  Private (Authenticated users - data strictly isolated to req.user._id)
 */
router.get(
  '/me/certificates',
  authenticate,
  authorize('VOLUNTEER', 'ADMIN', 'STAFF', 'DONOR'),
  VolunteerController.getMyCertificates
);

/**
 * @route   POST /api/volunteers/events/:eventId/register
 * @desc    Sign up volunteer for an upcoming community seva event
 * @access  Private (Authenticated users - data strictly isolated to req.user._id)
 */
router.post(
  '/events/:eventId/register',
  authenticate,
  authorize('VOLUNTEER', 'ADMIN', 'STAFF', 'DONOR'),
  VolunteerController.registerForEvent
);

// ============================================================================
// ADMIN ROUTES (Protected with authenticate -> authorize('ADMIN'))
// ============================================================================

/**
 * @route   GET /api/volunteers/admin/shifts
 * @desc    List all volunteer shifts
 * @access  Private (ADMIN only)
 */
router.get(
  '/admin/shifts',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.listAllShifts
);

/**
 * @route   PATCH /api/volunteers/admin/shifts/:id/verify
 * @desc    Verify volunteer shift
 * @access  Private (ADMIN only)
 */
router.patch(
  '/admin/shifts/:id/verify',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.verifyShift
);

/**
 * @route   GET /api/volunteers/admin/applications
 * @desc    List all volunteer applications
 * @access  Private (ADMIN only)
 */
router.get(
  '/admin/applications',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.listApplications
);

/**
 * @route   PATCH /api/volunteers/admin/applications/:id
 * @desc    Approve or reject a volunteer application
 * @access  Private (ADMIN only)
 */
router.patch(
  '/admin/applications/:id',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.reviewApplication
);

/**
 * @route   POST /api/volunteers/admin/roles
 * @desc    Create new volunteer role
 * @access  Private (ADMIN only)
 */
router.post(
  '/admin/roles',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.createRole
);

/**
 * @route   PUT /api/volunteers/admin/roles/:id
 * @desc    Update volunteer role
 * @access  Private (ADMIN only)
 */
router.put(
  '/admin/roles/:id',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.updateRole
);

/**
 * @route   DELETE /api/volunteers/admin/roles/:id
 * @desc    Delete volunteer role
 * @access  Private (ADMIN only)
 */
router.delete(
  '/admin/roles/:id',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.deleteRole
);

/**
 * @route   POST /api/volunteers/admin/certificates
 * @desc    Issue a verifiable digital certificate to a volunteer
 * @access  Private (ADMIN only)
 */
router.post(
  '/admin/certificates',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.issueCertificate
);

/**
 * @route   GET /api/volunteers
 * @desc    List all registered volunteers with hours and events
 * @access  Private (ADMIN only)
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.listAllVolunteers
);

/**
 * @route   PATCH /api/volunteers/:id/hours
 * @desc    Approve and record volunteer hours
 * @access  Private (ADMIN only)
 */
router.patch(
  '/:id/hours',
  authenticate,
  authorize('ADMIN'),
  VolunteerController.updateVolunteerHours
);

/**
 * @route   GET /api/volunteers/:id
 * @desc    Retrieve volunteer details by ID with IDOR ownership validation
 * @access  Private (Volunteer Owner or ADMIN, STAFF)
 */
router.get(
  '/:id',
  authenticate,
  authorize('VOLUNTEER', 'ADMIN', 'STAFF'),
  VolunteerController.getVolunteerById
);

export default router;
