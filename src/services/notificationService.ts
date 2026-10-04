import { api } from './api';

export type NotificationType =
  | 'DONATION_SUCCESS'
  | 'DONATION_FAILED'
  | 'DONATION_PENDING'
  | 'VOLUNTEER_SUBMITTED'
  | 'VOLUNTEER_APPROVED'
  | 'VOLUNTEER_REJECTED'
  | 'HELP_REQUEST_SUBMITTED'
  | 'HELP_REQUEST_STATUS_UPDATED'
  | 'EVENT_REGISTRATION'
  | 'EVENT_UPDATE'
  | 'WELCOME'
  | 'SYSTEM'
  | 'ADMIN';

export interface AppNotification {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedEntity?: {
    entityType: 'Donation' | 'Volunteer' | 'HelpRequest' | 'Event' | 'User';
    entityId: string;
  };
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationService = {
  /**
   * Fetch authenticated user's paginated notifications
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');

    const query = searchParams.toString();
    const endpoint = query ? `/notifications?${query}` : '/notifications';
    return api.get<NotificationListResponse>(endpoint);
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const res = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return res?.unreadCount || 0;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<AppNotification> {
    const res = await api.patch<{ notification: AppNotification }>(`/notifications/${id}/read`);
    return res.notification;
  },

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(): Promise<{ updatedCount: number }> {
    return api.patch<{ updatedCount: number }>('/notifications/read-all');
  },

  /**
   * Delete a single notification
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
