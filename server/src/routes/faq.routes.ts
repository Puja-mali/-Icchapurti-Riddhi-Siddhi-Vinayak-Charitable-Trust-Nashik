import { Router } from 'express';
import { FaqController } from '../controllers/faq.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public
router.get('/', FaqController.listPublic);

// Admin & Staff read / Admin write
router.get('/admin', authenticate, authorize('ADMIN', 'STAFF'), FaqController.listAdmin);
router.post('/admin', authenticate, authorize('ADMIN'), FaqController.create);
router.patch('/admin/:id', authenticate, authorize('ADMIN'), FaqController.update);
router.delete('/admin/:id', authenticate, authorize('ADMIN'), FaqController.delete);

export default router;
