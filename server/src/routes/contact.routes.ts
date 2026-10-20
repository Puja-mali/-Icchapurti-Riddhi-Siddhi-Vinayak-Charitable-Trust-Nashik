import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth';
import { publicFormLimiter, spamProtection } from '../middleware/spamProtection';

const router = Router();

// Public contact submission with rate limiting and anti-spam protection
router.post('/', publicFormLimiter, spamProtection, ContactController.submit);

// Admin / Staff management
router.get('/admin', authenticate, authorize('ADMIN', 'STAFF'), ContactController.listAdmin);
router.patch('/admin/:id', authenticate, authorize('ADMIN', 'STAFF'), ContactController.updateStatus);

export default router;
