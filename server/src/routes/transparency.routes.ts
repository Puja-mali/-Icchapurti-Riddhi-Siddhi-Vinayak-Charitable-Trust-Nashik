import { Router } from 'express';
import { TransparencyController } from '../controllers/transparency.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  transparencyQuerySchema,
  createTransparencySchema,
  updateTransparencySchema,
} from '../validators/transparency.validator';

const router = Router();

// Public: List published reports
router.get('/', validateQuery(transparencyQuerySchema), TransparencyController.getReports);

// Admin: List all reports including drafts/unpublished
router.get(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  validateQuery(transparencyQuerySchema),
  TransparencyController.getAdminReports
);

router.get(
  '/admin/all',
  authenticate,
  authorize('ADMIN'),
  validateQuery(transparencyQuerySchema),
  TransparencyController.getAdminReports
);

// Public / Admin Preview: Retrieve single report by ID
router.get('/:id', optionalAuthenticate, TransparencyController.getReportById);

// Admin: Create new transparency report
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateBody(createTransparencySchema),
  TransparencyController.createReport
);

// Admin: Update an existing transparency report
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateBody(updateTransparencySchema),
  TransparencyController.updateReport
);

// Admin: Delete a transparency report
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  TransparencyController.deleteReport
);

export default router;
