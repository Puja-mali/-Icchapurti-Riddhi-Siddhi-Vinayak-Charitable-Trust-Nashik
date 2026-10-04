import { Router } from 'express';
import { CauseController } from '../controllers/cause.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createCauseSchema,
  updateCauseSchema,
  listCausesQuerySchema,
} from '../validators/cause.validator';

const router = Router();

/**
 * Public Routes:
 * - GET /api/causes (List campaigns with optional filters; supports optional auth to allow admins to view all/drafts)
 * - GET /api/causes/:id (Retrieve specific campaign by MongoDB ID or slug)
 */
router.get('/', optionalAuthenticate, validateQuery(listCausesQuerySchema), CauseController.listCauses);
router.get('/:id', CauseController.getCauseById);

/**
 * Protected Admin Routes:
 * Middleware order strictly enforced:
 * authenticate → authorize('ADMIN') → validateBody(...) → Controller
 *
 * - POST /api/causes (Create new campaign)
 * - PATCH /api/causes/:id (Update existing campaign)
 * - DELETE /api/causes/:id (Permanently delete campaign)
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateBody(createCauseSchema),
  CauseController.createCause
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateBody(updateCauseSchema),
  CauseController.updateCause
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  CauseController.deleteCause
);

export default router;
