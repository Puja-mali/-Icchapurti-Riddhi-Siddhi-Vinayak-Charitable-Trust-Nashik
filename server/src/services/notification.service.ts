import mongoose, { Types } from 'mongoose';
import { Notification, INotification, NotificationType } from '../models/Notification';
import { User } from '../models/User';
import { WebPushService } from './webpush.service';
import { AppError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export interface CreateNotificationInput {
  recipientId: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedEntity?: {
    entityType: 'Donation' | 'Volunteer' | 'HelpRequest' | 'Event' | 'User';
    entityId: Types.ObjectId | string;
  };
  metadata?: Record<string, any>;
}

export interface ListNotificationsOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export class NotificationService {
  private static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Create an in-app notification.
   * Fails safely without throwing if called in asynchronous event hooks.
   */
  public static async createNotification(input: CreateNotificationInput): Promise<INotification | null> {
    if (!this.isConnected()) {
      logger.warn('[NOTIFICATION SERVICE] MongoDB is offline. Notification skipped.');
      return null;
    }

    try {
      if (!input.recipientId || !input.title || !input.message) {
        return null;
      }

      const recipientObjectId =
        typeof input.recipientId === 'string'
          ? new Types.ObjectId(input.recipientId)
          : input.recipientId;

      const notification = await Notification.create({
        recipient: recipientObjectId,
        type: input.type,
        title: input.title.trim(),
        message: input.message.trim(),
        link: input.link?.trim() || '',
        relatedEntity: input.relatedEntity,
        metadata: input.metadata || {},
        isRead: false,
      });

      // Non-blocking Web Push dispatch to the recipient's devices
      WebPushService.sendToUser(
        recipientObjectId,
        {
          title: input.title.trim(),
          body: input.message.trim(),
          data: {
            url: input.link || '/dashboard',
            entityType: input.relatedEntity?.entityType,
            entityId: input.relatedEntity?.entityId ? input.relatedEntity.entityId.toString() : undefined,
          },
        },
        {
          dedupKey: `${recipientObjectId.toString()}:${input.type}:${input.relatedEntity?.entityId || ''}`,
        }
      ).catch((pushErr) => {
        logger.debug?.(`[WEB PUSH] Background dispatch skipped or failed: ${pushErr.message}`);
      });

      return notification;
    } catch (error: any) {
      logger.error(`[NOTIFICATION SERVICE] Failed to create notification: ${error.message}`);
      return null;
    }
  }

  /**
   * Retrieve notifications strictly belonging to the authenticated user.
   * Prevents IDOR by forcing query on recipient: userObjectId.
   */
  public static async getUserNotifications(
    userId: string,
    options: ListNotificationsOptions = {}
  ): Promise<{
    notifications: INotification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    if (!this.isConnected()) {
      return {
        notifications: [],
        unreadCount: 0,
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID', 400);
    }

    const userObjectId = new Types.ObjectId(userId);
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(options.limit) || 15));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { recipient: userObjectId };
    if (options.unreadOnly) {
      query.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userObjectId, isRead: false }),
    ]);

    return {
      notifications: notifications as unknown as INotification[],
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get unread count for current user
   */
  public static async getUnreadCount(userId: string): Promise<number> {
    if (!this.isConnected()) return 0;
    if (!Types.ObjectId.isValid(userId)) return 0;

    return Notification.countDocuments({
      recipient: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  /**
   * Mark a notification as read with strict IDOR verification
   */
  public static async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    if (!this.isConnected()) {
      throw new AppError('Database connection unavailable', 503);
    }

    if (!Types.ObjectId.isValid(notificationId) || !Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid identifier provided', 400);
    }

    const notification = await Notification.findOne({
      _id: new Types.ObjectId(notificationId),
      recipient: new Types.ObjectId(userId),
    });

    if (!notification) {
      throw new AppError('Notification not found or access denied', 404);
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return notification;
  }

  /**
   * Mark all notifications as read for current user
   */
  public static async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
    if (!this.isConnected()) {
      throw new AppError('Database connection unavailable', 503);
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID', 400);
    }

    const result = await Notification.updateMany(
      {
        recipient: new Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return { updatedCount: result.modifiedCount };
  }

  /**
   * Delete a notification with strict IDOR verification
   */
  public static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    if (!this.isConnected()) {
      throw new AppError('Database connection unavailable', 503);
    }

    if (!Types.ObjectId.isValid(notificationId) || !Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid identifier provided', 400);
    }

    const result = await Notification.deleteOne({
      _id: new Types.ObjectId(notificationId),
      recipient: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new AppError('Notification not found or access denied', 404);
    }
  }

  /**
   * Broadcast an operational notification to trust Admins and Staff
   */
  public static async notifyAdmins(input: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
    roles?: Array<'ADMIN' | 'STAFF'>;
  }): Promise<void> {
    if (!this.isConnected()) return;

    try {
      const targetRoles = input.roles || ['ADMIN'];
      const adminUsers = await User.find({
        role: { $in: targetRoles },
        isActive: true,
      })
        .select('_id')
        .lean();

      if (adminUsers.length === 0) return;

      const docs = adminUsers.map((admin) => ({
        recipient: admin._id,
        type: input.type,
        title: input.title.trim(),
        message: input.message.trim(),
        link: input.link || '',
        metadata: input.metadata || {},
        isRead: false,
      }));

      await Notification.insertMany(docs, { ordered: false });

      // Non-blocking Web Push dispatch to Admin & Staff devices
      WebPushService.sendToAdmins(
        {
          title: input.title.trim(),
          body: input.message.trim(),
          data: {
            url: input.link || '/admin',
            ...input.metadata,
          },
        },
        {
          roles: targetRoles,
          dedupKey: `admin:${input.type}:${input.metadata?.donationId || input.metadata?.requestId || input.title}`,
        }
      ).catch((pushErr) => {
        logger.debug?.(`[WEB PUSH] Background admin push dispatch skipped or failed: ${pushErr.message}`);
      });
    } catch (err: any) {
      logger.error(`[NOTIFICATION SERVICE] Failed to notify admins: ${err.message}`);
    }
  }
}
