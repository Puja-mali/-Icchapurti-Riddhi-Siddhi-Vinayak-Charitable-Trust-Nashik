import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { sendSuccess } from '../utils/apiResponse';
import { ListEventsQuery } from '../validators/event.validator';

export class EventController {
  /**
   * Public: List all events with filtering, search, and pagination
   * GET /api/events
   */
  public static async listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListEventsQuery;
      const isAdmin = req.user?.role === 'ADMIN';

      const result = await EventService.listEvents(query, isAdmin);

      sendSuccess(res, result, 'Events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: Get single event by ID or Slug
   * GET /api/events/:id
   */
  public static async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';

      const event = await EventService.getEventByIdOrSlug(id, isAdmin);

      sendSuccess(res, { event }, 'Event retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create a new event
   * POST /api/events
   */
  public static async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id;
      const event = await EventService.createEvent(req.body, userId);

      sendSuccess(res, { event }, 'Event created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update an existing event
   * PATCH /api/events/:id
   */
  public static async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const event = await EventService.updateEvent(id, req.body);

      sendSuccess(res, { event }, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Permanently delete an event
   * DELETE /api/events/:id
   */
  public static async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const event = await EventService.deleteEvent(id);

      sendSuccess(res, { event }, 'Event deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticated: Register for an event
   * POST /api/events/:id/register
   */
  public static async registerForEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const result = await EventService.registerForEvent(id, userId, req.body);

      sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticated: Get my event registrations
   * GET /api/events/user/my-registrations
   */
  public static async getMyRegistrations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id;
      const registrations = await EventService.getMyRegistrations(userId);

      sendSuccess(res, { registrations }, 'My event registrations retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticated: Cancel my registration
   * PATCH /api/events/registrations/:id/cancel
   */
  public static async cancelRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!._id;
      const isAdmin = req.user?.role === 'ADMIN';

      const registration = await EventService.cancelRegistration(id, userId, isAdmin);

      sendSuccess(res, { registration }, 'Registration cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin/Staff: Get all attendees/registrations for a specific event
   * GET /api/events/:id/registrations
   */
  public static async getEventRegistrations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const registrations = await EventService.getEventRegistrations(id);

      sendSuccess(res, { registrations }, 'Event registrations retrieved');
    } catch (error) {
      next(error);
    }
  }
}
