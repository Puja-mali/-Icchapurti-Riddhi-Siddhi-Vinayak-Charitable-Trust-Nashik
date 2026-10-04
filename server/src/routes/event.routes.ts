import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createEventSchema,
  updateEventSchema,
  listEventsQuerySchema,
  registerForEventSchema,
} from '../validators/event.validator';

const router = Router();

/**
 * Public Routes:
 * - GET /api/events (List events with filters; optionalAuthenticate to allow admin to view drafts)
 * - GET /api/events/:id (Retrieve event by ID or slug)
 */
router.get('/', optionalAuthenticate, validateQuery(listEventsQuerySchema), EventController.listEvents);

/**
 * User-Specific Event Registrations (Must precede /:id)
 */
router.get('/user/my-registrations', authenticate, EventController.getMyRegistrations);
router.patch('/registrations/:id/cancel', authenticate, EventController.cancelRegistration);

/**
 * Specific Event Lookup (Public with optionalAuthenticate)
 */
router.get('/:id', optionalAuthenticate, EventController.getEventById);

/**
 * Event Registration (Authenticated users)
 */
router.post(
  '/:id/register',
  authenticate,
  validateBody(registerForEventSchema),
  EventController.registerForEvent
);

/**
 * Admin/Staff: View Registrations for an Event
 */
router.get(
  '/:id/registrations',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  EventController.getEventRegistrations
);

/**
 * Protected Admin Routes:
 * Order strictly enforced:
 * authenticate → authorize('ADMIN') → validateBody(...) → Controller
 *
 * - POST /api/events
 * - PATCH /api/events/:id
 * - DELETE /api/events/:id
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateBody(createEventSchema),
  EventController.createEvent
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateBody(updateEventSchema),
  EventController.updateEvent
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  EventController.deleteEvent
);

export default router;
