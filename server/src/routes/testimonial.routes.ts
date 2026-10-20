import { Router } from 'express';
import { TestimonialController } from '../controllers/testimonial.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public
router.get('/', TestimonialController.listPublic);

// Admin & Staff read / Admin write
router.get('/admin', authenticate, authorize('ADMIN', 'STAFF'), TestimonialController.listAdmin);
router.post('/admin', authenticate, authorize('ADMIN'), TestimonialController.create);
router.patch('/admin/:id', authenticate, authorize('ADMIN'), TestimonialController.update);
router.delete('/admin/:id', authenticate, authorize('ADMIN'), TestimonialController.delete);

export default router;
