import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * Public routes for validating and accepting invitations
 */
router.get('/validate/:token', InvitationController.validateInvitationToken);
router.post('/accept', InvitationController.acceptInvitation);

/**
 * Administrative routes (Strictly ADMIN only - STAFF, VOLUNTEER, DONOR rejected)
 */
router.post('/', authenticate, authorize('ADMIN'), InvitationController.createInvitation);
router.get('/', authenticate, authorize('ADMIN'), InvitationController.listInvitations);
router.post('/:id/resend', authenticate, authorize('ADMIN'), InvitationController.resendInvitation);
router.delete('/:id', authenticate, authorize('ADMIN'), InvitationController.revokeInvitation);
router.post('/:id/revoke', authenticate, authorize('ADMIN'), InvitationController.revokeInvitation);

export default router;
