import mongoose from 'mongoose';
import { Event, IEvent } from '../models/Event';
import { EventRegistration, IEventRegistration } from '../models/EventRegistration';
import { User } from '../models/User';
import {
  CreateEventInput,
  UpdateEventInput,
  ListEventsQuery,
  RegisterForEventInput,
} from '../validators/event.validator';
import { AppError } from '../utils/apiResponse';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export interface PaginatedEventsResult {
  events: IEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class EventService {
  /**
   * Helper to generate a clean, URL-safe slug from an event title
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Ensure slug is unique in the database
   */
  private static async ensureUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
    let slug = baseSlug || 'event';
    let counter = 1;

    while (true) {
      const existing = await Event.findOne({ slug });
      if (!existing || (currentId && existing._id.toString() === currentId)) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Retrieve list of events with filtering, search, and pagination
   */
  public static async listEvents(
    query: ListEventsQuery,
    isAdmin: boolean = false
  ): Promise<PaginatedEventsResult> {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const skip = (page - 1) * limit;

    // Fast-exit if database is not connected to prevent buffering timeouts
    if (mongoose.connection.readyState !== 1) {
      return {
        events: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const filter: Record<string, any> = {};

    // Public users must only receive events that are intended to be public (no DRAFT)
    if (!isAdmin) {
      filter.status = { $in: ['UPCOMING', 'ONGOING', 'COMPLETED'] };
    }

    // Status filter
    if (query.status) {
      if (query.status === 'ALL') {
        if (!isAdmin) {
          filter.status = { $in: ['UPCOMING', 'ONGOING', 'COMPLETED'] };
        } else {
          delete filter.status;
        }
      } else {
        if (!isAdmin && query.status === 'DRAFT') {
          // Public users cannot see drafts
          filter.status = { $in: [] };
        } else {
          filter.status = query.status;
        }
      }
    }

    // Kumbh related filter
    if (query.isKumbhRelated !== undefined) {
      filter.isKumbhRelated = query.isKumbhRelated === 'true';
    }

    // Category filter
    if (query.category && query.category !== 'All') {
      filter.category = query.category;
    }

    // Date range filtering
    if (query.startDate) {
      filter.startDate = { $gte: new Date(query.startDate) };
    }
    if (query.endDate) {
      filter.endDate = { $lte: new Date(query.endDate) };
    }

    // Text search
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(
        query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
      filter.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { location: searchRegex },
      ];
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .select(isAdmin ? '' : '-createdBy')
        .sort({ startDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieve a single event by either MongoDB _id or URL slug
   */
  public static async getEventByIdOrSlug(
    idOrSlug: string,
    isAdmin: boolean = false
  ): Promise<IEvent> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError(`Event '${idOrSlug}' not found.`, 404);
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    let event: IEvent | null = null;

    if (isObjectId) {
      event = await Event.findById(idOrSlug).select(isAdmin ? '' : '-createdBy');
    }

    if (!event) {
      event = await Event.findOne({ slug: idOrSlug.toLowerCase() }).select(
        isAdmin ? '' : '-createdBy'
      );
    }

    if (!event) {
      throw new AppError(`Event '${idOrSlug}' not found.`, 404);
    }

    // Non-admins cannot view DRAFT events
    if (!isAdmin && event.status === 'DRAFT') {
      throw new AppError(`Event '${idOrSlug}' not found.`, 404);
    }

    return event;
  }

  /**
   * Create a new event (Admin operation)
   */
  public static async createEvent(
    input: CreateEventInput,
    creatorUserId: string
  ): Promise<IEvent> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database connection unavailable. Please configure MONGODB_URI.', 503);
    }

    const rawSlug = input.slug || this.generateSlug(input.title);
    const uniqueSlug = await this.ensureUniqueSlug(rawSlug);

    const event = await Event.create({
      title: input.title,
      slug: uniqueSlug,
      shortDescription: input.shortDescription,
      description: input.description,
      location: input.location,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      registrationRequired: input.registrationRequired ?? false,
      registrationLimit: input.registrationLimit ?? 0,
      registrationCount: 0, // Never trust client-supplied count
      status: input.status || 'UPCOMING',
      imageUrl: input.imageUrl,
      galleryUrls: input.galleryUrls || [],
      isKumbhRelated: input.isKumbhRelated ?? false,
      category: input.category || 'Community Outreach',
      createdBy: new mongoose.Types.ObjectId(creatorUserId),
      translations: input.translations,
    });

    return event;
  }

  /**
   * Update an existing event (Admin operation)
   */
  public static async updateEvent(id: string, input: UpdateEventInput): Promise<IEvent> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid event identifier.', 400);
    }

    const existing = await Event.findById(id);
    if (!existing) {
      throw new AppError('Event not found.', 404);
    }

    let updatedSlug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      updatedSlug = await this.ensureUniqueSlug(input.slug, id);
    }

    const updatePayload: Record<string, any> = {
      ...input,
      slug: updatedSlug,
    };

    // Client is never permitted to set registrationCount directly
    delete updatePayload.registrationCount;

    if (input.startDate) {
      updatePayload.startDate = new Date(input.startDate);
    }
    if (input.endDate) {
      updatePayload.endDate = new Date(input.endDate);
    }

    const updated = await Event.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new AppError('Event not found during update.', 404);
    }

    return updated;
  }

  /**
   * Permanently delete an event (Admin operation)
   */
  public static async deleteEvent(id: string): Promise<IEvent> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid event identifier.', 400);
    }

    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError('Event not found.', 404);
    }

    // Clean up registrations for this event
    await EventRegistration.deleteMany({ event: id });

    return deleted;
  }

  /**
   * Register authenticated user for an event
   */
  public static async registerForEvent(
    eventId: string,
    userId: string,
    input: RegisterForEventInput
  ): Promise<{ registration: IEventRegistration; event: IEvent }> {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new AppError('Invalid event identifier.', 400);
    }

    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError('Event not found.', 404);
    }

    if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
      throw new AppError(`Cannot register for an event that is ${event.status.toLowerCase()}.`, 400);
    }

    if (event.status === 'DRAFT') {
      throw new AppError('This event is not currently open for public registrations.', 400);
    }

    // Check if event is in the past
    if (new Date(event.startDate).getTime() < Date.now()) {
      throw new AppError('Cannot register for an event that has already occurred.', 400);
    }

    // Enforce registrationLimit server-side
    const attendeeCount = input.attendeeCount || 1;
    if (event.registrationLimit > 0) {
      if (event.registrationCount + attendeeCount > event.registrationLimit) {
        throw new AppError(
          `Event registration capacity reached. Only ${Math.max(
            0,
            event.registrationLimit - event.registrationCount
          )} spot(s) remaining.`,
          400
        );
      }
    }

    // Check duplicate registration
    const existingReg = await EventRegistration.findOne({
      event: event._id,
      user: userId,
      status: 'CONFIRMED',
    });

    if (existingReg) {
      throw new AppError('You are already registered for this event.', 400);
    }

    // Fetch user info
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User profile not found.', 404);
    }

    const userName = input.userName || user.name;
    const userEmail = input.userEmail || user.email;
    const userPhone = input.userPhone || user.phone || '';

    // Create registration
    const registration = await EventRegistration.create({
      event: event._id,
      user: user._id,
      userName,
      userEmail,
      userPhone,
      attendeeCount,
      status: 'CONFIRMED',
      notes: input.notes,
    });

    // Atomically increment registrationCount on event
    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { $inc: { registrationCount: attendeeCount } },
      { new: true }
    );

    const registrationCode = `SCT-EVT-${registration._id.toString().slice(-6).toUpperCase()}`;

    // Send event registration email non-blockingly
    EmailService.sendEventRegistrationEmail({
      email: userEmail,
      attendeeName: userName,
      eventTitle: event.title,
      startDate: new Date(event.startDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      location: event.location,
      registrationCode,
    }).catch((err) => logger.error(`[EventService] Email error: ${err.message}`));

    // In-app notification for attendee
    NotificationService.createNotification({
      recipientId: user._id,
      type: 'EVENT_REGISTRATION',
      title: `Event Registration: ${event.title}`,
      message: `Your registration for "${event.title}" has been confirmed (${attendeeCount} attendee${attendeeCount > 1 ? 's' : ''}). Code: ${registrationCode}.`,
      link: '/events',
      relatedEntity: { entityType: 'Event', entityId: event._id },
      metadata: { eventTitle: event.title, registrationCode, attendeeCount },
    }).catch((err) => logger.error(`[EventService] Notification error: ${err.message}`));

    return { registration, event: updatedEvent || event };
  }

  /**
   * Get user's active registrations
   */
  public static async getMyRegistrations(userId: string): Promise<IEventRegistration[]> {
    return EventRegistration.find({ user: userId })
      .populate('event', 'title slug startDate endDate location imageUrl status category')
      .sort({ createdAt: -1 });
  }

  /**
   * Cancel an event registration
   */
  public static async cancelRegistration(
    registrationId: string,
    userId: string,
    isAdmin: boolean = false
  ): Promise<IEventRegistration> {
    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
      throw new AppError('Invalid registration identifier.', 400);
    }

    const registration = await EventRegistration.findById(registrationId);
    if (!registration) {
      throw new AppError('Registration record not found.', 404);
    }

    // IDOR protection: check ownership unless ADMIN
    if (!isAdmin && registration.user.toString() !== userId) {
      throw new AppError('Unauthorized: You can only manage your own event registrations.', 403);
    }

    if (registration.status === 'CANCELLED') {
      return registration;
    }

    registration.status = 'CANCELLED';
    await registration.save();

    // Decrement event registrationCount safely
    await Event.findByIdAndUpdate(registration.event, {
      $inc: { registrationCount: -registration.attendeeCount },
    });

    return registration;
  }

  /**
   * Admin/Staff: Get all registrations for a specific event
   */
  public static async getEventRegistrations(eventId: string): Promise<IEventRegistration[]> {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new AppError('Invalid event identifier.', 400);
    }

    return EventRegistration.find({ event: eventId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
  }
}
