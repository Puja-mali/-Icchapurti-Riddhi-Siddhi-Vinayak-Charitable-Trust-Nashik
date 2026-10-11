import { Request, Response, NextFunction } from 'express';
import { WebPushService } from '../services/webpush.service';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';

export class PushController {
  /**
   * GET /api/push/public-key
   * Furnish the public VAPID key to the client
   */
  public static async getPublicKey(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const publicKey = WebPushService.getPublicKey();
      sendSuccess(
        res,
        { publicKey },
        publicKey
          ? 'VAPID public key retrieved successfully'
          : 'Web push is not configured on this server',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/push/subscribe
   * Register or refresh browser push subscription for authenticated user
   */
  public static async subscribe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        throw new AppError('Authentication required to register push notifications.', 401);
      }

      const { endpoint, keys } = req.body;
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        throw new AppError('Invalid subscription payload: endpoint and keys (p256dh, auth) are required.', 400);
      }

      const userAgent = req.headers['user-agent'] || '';

      const subscription = await WebPushService.registerSubscription(req.user._id.toString(), {
        endpoint,
        keys,
        userAgent,
      });

      sendSuccess(
        res,
        { subscriptionId: subscription._id, active: subscription.isActive },
        'Web push notifications enabled successfully on this device.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/push/unsubscribe
   * Remove browser push subscription for authenticated user
   */
  public static async unsubscribe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        throw new AppError('Authentication required to manage push preferences.', 401);
      }

      const { endpoint } = req.body;
      if (!endpoint) {
        throw new AppError('Endpoint URL is required to unsubscribe.', 400);
      }

      await WebPushService.unsubscribe(req.user._id.toString(), endpoint);

      sendSuccess(res, null, 'Web push notifications disabled for this device.', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/push/status
   * Check subscription status for authenticated user
   */
  public static async getStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        throw new AppError('Authentication required.', 401);
      }

      const status = await WebPushService.getUserStatus(req.user._id.toString());
      sendSuccess(res, status, 'Push subscription status retrieved.', 200);
    } catch (error) {
      next(error);
    }
  }
}
