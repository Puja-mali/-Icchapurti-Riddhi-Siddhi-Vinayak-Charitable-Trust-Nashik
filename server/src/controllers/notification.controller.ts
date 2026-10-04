import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/apiResponse';

export class NotificationController {
  /**
   * GET /api/notifications
   * Fetch authenticated user's notifications (supports pagination & unread filter)
   */
  public static async getMyNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const { page, limit, unreadOnly } = req.query;

      const result = await NotificationService.getUserNotifications(userId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        unreadOnly: unreadOnly === 'true',
      });

      sendSuccess(res, result, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Fetch unread notification count for authenticated user
   */
  public static async getUnreadCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const count = await NotificationService.getUnreadCount(userId);

      sendSuccess(res, { unreadCount: count }, 'Unread count retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a specific notification as read (with IDOR check)
   */
  public static async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      const notification = await NotificationService.markAsRead(id, userId);

      sendSuccess(res, { notification }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read for current user
   */
  public static async markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const result = await NotificationService.markAllAsRead(userId);

      sendSuccess(res, result, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Remove a notification (with IDOR check)
   */
  public static async deleteNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      await NotificationService.deleteNotification(id, userId);

      sendSuccess(res, null, 'Notification removed successfully');
    } catch (error) {
      next(error);
    }
  }
}
