import { api } from './api';
import { EventItem, EventRegistrationItem } from '../types';

export interface EventListParams {
  category?: string;
  status?: string;
  search?: string;
  isKumbhRelated?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface EventListResponse {
  events: EventItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Formats a Date object or ISO string into friendly date (e.g. "Mar 15, 2025")
 */
export const formatEventDate = (dateStr?: string | Date): string => {
  if (!dateStr) return 'Date TBD';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Date TBD';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a Date object or ISO string into friendly time (e.g. "09:00 AM - 04:00 PM")
 */
export const formatEventTime = (startStr?: string | Date, endStr?: string | Date): string => {
  if (!startStr) return 'All Day';
  const start = new Date(startStr);
  if (isNaN(start.getTime())) return 'All Day';

  const startTimeStr = start.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (endStr) {
    const end = new Date(endStr);
    if (!isNaN(end.getTime())) {
      const endTimeStr = end.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${startTimeStr} - ${endTimeStr}`;
    }
  }

  return startTimeStr;
};

/**
 * Normalizes an event item from MongoDB for seamless UI rendering
 */
export const normalizeEvent = (item: any): EventItem => {
  const id = item.id || item._id?.toString() || item._id || '';
  const startDate = item.startDate ? new Date(item.startDate).toISOString() : new Date().toISOString();
  const endDate = item.endDate ? new Date(item.endDate).toISOString() : undefined;
  const date = item.date || formatEventDate(startDate);
  const time = item.time || formatEventTime(startDate, endDate);

  const registrationLimit = Number(item.registrationLimit ?? item.capacity ?? 0);
  const registrationCount = Number(item.registrationCount ?? item.registeredCount ?? 0);

  return {
    ...item,
    id,
    _id: item._id?.toString() || id,
    slug: item.slug || id,
    title: item.title || 'Untitled Event',
    category: item.category || 'Community Outreach',
    startDate,
    endDate,
    date,
    time,
    location: item.location || 'Maharashtra, India',
    shortDescription: item.shortDescription || item.description?.slice(0, 140) || '',
    description: item.description || '',
    capacity: registrationLimit,
    registeredCount: registrationCount,
    registrationLimit,
    registrationCount,
    registrationRequired: !!item.registrationRequired,
    status: item.status || 'UPCOMING',
    imageUrl:
      item.imageUrl ||
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200',
    galleryUrls: Array.isArray(item.galleryUrls) ? item.galleryUrls : [],
    isKumbhRelated: !!item.isKumbhRelated,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
  };
};

export const eventService = {
  /**
   * Fetch list of events from backend API
   */
  async getEvents(params: EventListParams = {}): Promise<EventListResponse> {
    const query = new URLSearchParams();

    if (params.category && params.category !== 'All') {
      query.append('category', params.category);
    }
    if (params.status) {
      query.append('status', params.status);
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }
    if (params.isKumbhRelated !== undefined) {
      query.append('isKumbhRelated', String(params.isKumbhRelated));
    }
    if (params.startDate) {
      query.append('startDate', params.startDate);
    }
    if (params.endDate) {
      query.append('endDate', params.endDate);
    }
    if (params.page) {
      query.append('page', String(params.page));
    }
    if (params.limit) {
      query.append('limit', String(params.limit));
    }

    const queryString = query.toString();
    const endpoint = queryString ? `/events?${queryString}` : '/events';

    const response = await api.get<{ events: any[]; pagination: any }>(endpoint);

    const rawEvents = response?.events || [];
    const normalizedEvents = rawEvents.map(normalizeEvent);

    return {
      events: normalizedEvents,
      pagination: response?.pagination || {
        page: 1,
        limit: normalizedEvents.length,
        total: normalizedEvents.length,
        totalPages: 1,
      },
    };
  },

  /**
   * Fetch single event by ID or Slug
   */
  async getEvent(idOrSlug: string): Promise<EventItem> {
    const response = await api.get<{ event: any }>(`/events/${encodeURIComponent(idOrSlug)}`);
    if (!response?.event) {
      throw new Error(`Event '${idOrSlug}' not found.`);
    }
    return normalizeEvent(response.event);
  },

  /**
   * Admin: Create a new event
   */
  async createEvent(payload: Partial<EventItem>): Promise<EventItem> {
    const response = await api.post<{ event: any }>('/events', {
      title: payload.title,
      slug: payload.slug || undefined,
      shortDescription: payload.shortDescription || payload.description?.slice(0, 140),
      description: payload.description,
      location: payload.location,
      startDate: payload.startDate,
      endDate: payload.endDate || undefined,
      registrationRequired: !!payload.registrationRequired,
      registrationLimit: Number(payload.registrationLimit ?? payload.capacity ?? 0),
      status: payload.status || 'UPCOMING',
      imageUrl: payload.imageUrl,
      galleryUrls: payload.galleryUrls || [],
      isKumbhRelated: !!payload.isKumbhRelated,
      category: payload.category || 'Community Outreach',
    });

    return normalizeEvent(response.event);
  },

  /**
   * Admin: Update an existing event
   */
  async updateEvent(id: string, payload: Partial<EventItem>): Promise<EventItem> {
    const response = await api.patch<{ event: any }>(`/events/${encodeURIComponent(id)}`, {
      title: payload.title,
      slug: payload.slug || undefined,
      shortDescription: payload.shortDescription,
      description: payload.description,
      location: payload.location,
      startDate: payload.startDate,
      endDate: payload.endDate,
      registrationRequired: payload.registrationRequired,
      registrationLimit: payload.registrationLimit !== undefined ? Number(payload.registrationLimit) : undefined,
      status: payload.status,
      imageUrl: payload.imageUrl,
      galleryUrls: payload.galleryUrls,
      isKumbhRelated: payload.isKumbhRelated,
      category: payload.category,
    });

    return normalizeEvent(response.event);
  },

  /**
   * Admin: Delete an existing event
   */
  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${encodeURIComponent(id)}`);
  },

  /**
   * Authenticated User: Register for an event
   */
  async registerForEvent(
    id: string,
    payload: {
      attendeeCount?: number;
      userName?: string;
      userEmail?: string;
      userPhone?: string;
      notes?: string;
    }
  ): Promise<{ registration: EventRegistrationItem; event: EventItem }> {
    const response = await api.post<{ registration: any; event: any }>(
      `/events/${encodeURIComponent(id)}/register`,
      payload
    );

    return {
      registration: response.registration,
      event: normalizeEvent(response.event),
    };
  },

  /**
   * Authenticated User: Get my active event registrations
   */
  async getMyRegistrations(): Promise<EventRegistrationItem[]> {
    const response = await api.get<{ registrations: any[] }>('/events/user/my-registrations');
    return (response?.registrations || []).map((r) => ({
      ...r,
      id: r._id || r.id,
      event: r.event ? normalizeEvent(r.event) : r.event,
    }));
  },

  /**
   * Authenticated User: Cancel an event registration
   */
  async cancelRegistration(registrationId: string): Promise<void> {
    await api.patch(`/events/registrations/${encodeURIComponent(registrationId)}/cancel`, {});
  },

  /**
   * Admin/Staff: Get registrations for an event
   */
  async getEventRegistrations(eventId: string): Promise<EventRegistrationItem[]> {
    const response = await api.get<{ registrations: any[] }>(
      `/events/${encodeURIComponent(eventId)}/registrations`
    );
    return response?.registrations || [];
  },
};
