import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All notification routes are strictly authenticated
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications (supports page, limit, unreadOnly)
 * @access  Private
 */
router.get('/', NotificationController.getMyNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get('/unread-count', NotificationController.getUnreadCount);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all unread notifications as read
 * @access  Private
 */
router.patch('/read-all', NotificationController.markAllAsRead);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark specific notification as read (with IDOR check)
 * @access  Private
 */
router.patch('/:id/read', NotificationController.markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification (with IDOR check)
 * @access  Private
 */
router.delete('/:id', NotificationController.deleteNotification);

export default router;
