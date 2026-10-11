import webpush from 'web-push';
import mongoose, { Types } from 'mongoose';
import { PushSubscription, IPushSubscription } from '../models/PushSubscription';
import { User } from '../models/User';
import { env, isWebPushConfigured } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/apiResponse';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    entityType?: 'Donation' | 'Volunteer' | 'HelpRequest' | 'Event' | 'Transparency' | 'System' | 'User';
    entityId?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export interface SendPushOptions {
  dedupKey?: string; // Optional deduplication key to suppress repeat alerts
  ttlSeconds?: number;
}

// Memory cache for event deduplication (10 minutes TTL)
const dedupCache = new Map<string, number>();
const DEDUP_TTL_MS = 10 * 60 * 1000;

function cleanupDedupCache(): void {
  const now = Date.now();
  for (const [key, timestamp] of dedupCache.entries()) {
    if (now - timestamp > DEDUP_TTL_MS) {
      dedupCache.delete(key);
    }
  }
}

export class WebPushService {
  private static vapidKeys: { publicKey: string; privateKey: string } | null = null;
  private static isInitialized = false;

  /**
   * Initializes VAPID credentials lazily.
   * In local development, if keys are not set in .env, generates an ephemeral pair
   * so the entire Web Push protocol functions without requiring manual setup.
   */
  public static initialize(): void {
    if (this.isInitialized) return;

    if (isWebPushConfigured()) {
      this.vapidKeys = {
        publicKey: env.VAPID_PUBLIC_KEY,
        privateKey: env.VAPID_PRIVATE_KEY,
      };
    } else if (!env.isProduction) {
      // Ephemeral developmental VAPID pair for local testing
      const generated = webpush.generateVAPIDKeys();
      this.vapidKeys = generated;
      logger.info(
        `[WEB PUSH] Using generated development VAPID keys. Public Key: ${generated.publicKey.substring(0, 15)}...`
      );
    } else {
      logger.warn(
        '[WEB PUSH] VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are not configured in production environment.'
      );
      this.vapidKeys = null;
    }

    if (this.vapidKeys) {
      webpush.setVapidDetails(
        env.VAPID_SUBJECT,
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );
    }

    this.isInitialized = true;
  }

  /**
   * Retrieve the active VAPID public key for the browser to register PushManager
   */
  public static getPublicKey(): string | null {
    this.initialize();
    return this.vapidKeys ? this.vapidKeys.publicKey : null;
  }

  /**
   * Register or update a browser push subscription for an authenticated user
   */
  public static async registerSubscription(
    userId: string,
    subscriptionData: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      userAgent?: string;
    }
  ): Promise<IPushSubscription> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database connection unavailable for push registration.', 503);
    }

    if (!subscriptionData.endpoint || !subscriptionData.endpoint.startsWith('https://')) {
      throw new AppError('Invalid push subscription endpoint URL. HTTPS required.', 400);
    }

    if (!subscriptionData.keys || !subscriptionData.keys.p256dh || !subscriptionData.keys.auth) {
      throw new AppError('Missing cryptographic subscription keys (p256dh, auth).', 400);
    }

    const userObjectId = new Types.ObjectId(userId);

    // Upsert subscription to avoid duplicate entries for the same browser endpoint
    const subscription = await PushSubscription.findOneAndUpdate(
      { endpoint: subscriptionData.endpoint.trim() },
      {
        $set: {
          user: userObjectId,
          keys: {
            p256dh: subscriptionData.keys.p256dh.trim(),
            auth: subscriptionData.keys.auth.trim(),
          },
          userAgent: subscriptionData.userAgent || '',
          isActive: true,
          failedAttempts: 0,
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    logger.info(`[WEB PUSH] Registered push subscription for user ${userId}. Endpoint: ${subscription.endpoint.substring(0, 30)}...`);
    return subscription;
  }

  /**
   * Deactivate and remove a push subscription with strict IDOR ownership verification
   */
  public static async unsubscribe(userId: string, endpoint: string): Promise<boolean> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database connection unavailable.', 503);
    }

    if (!endpoint) {
      throw new AppError('Endpoint URL is required to unsubscribe.', 400);
    }

    const result = await PushSubscription.deleteOne({
      endpoint: endpoint.trim(),
      user: new Types.ObjectId(userId),
    });

    logger.info(`[WEB PUSH] Removed subscription for user ${userId}. Deleted: ${result.deletedCount}`);
    return result.deletedCount > 0;
  }

  /**
   * Check if the authenticated user has any active registered subscriptions
   */
  public static async getUserStatus(userId: string): Promise<{ isSubscribed: boolean; subscriptionCount: number }> {
    if (mongoose.connection.readyState !== 1) {
      return { isSubscribed: false, subscriptionCount: 0 };
    }

    const count = await PushSubscription.countDocuments({
      user: new Types.ObjectId(userId),
      isActive: true,
    });

    return {
      isSubscribed: count > 0,
      subscriptionCount: count,
    };
  }

  /**
   * Dispatch Web Push Notification to a single user's devices
   * Automatically cleans up dead/expired endpoints (HTTP 410 / 404)
   * Enforces deduplication to prevent spamming identical alerts
   */
  public static async sendToUser(
    userId: string | Types.ObjectId,
    payload: PushPayload,
    options: SendPushOptions = {}
  ): Promise<{ sent: number; failed: number }> {
    this.initialize();
    if (!this.vapidKeys) {
      logger.info(`[WEB PUSH] Skipped delivery to user ${userId} (VAPID credentials not configured).`);
      return { sent: 0, failed: 0 };
    }

    if (mongoose.connection.readyState !== 1) {
      return { sent: 0, failed: 0 };
    }

    // Deduplication check
    const dedupKey = options.dedupKey || `${userId}:${payload.title}:${payload.data?.entityId || ''}`;
    if (dedupKey) {
      cleanupDedupCache();
      const lastSent = dedupCache.get(dedupKey);
      if (lastSent && Date.now() - lastSent < DEDUP_TTL_MS) {
        logger.info(`[WEB PUSH] Duplicate push suppressed for key: ${dedupKey}`);
        return { sent: 0, failed: 0 };
      }
      dedupCache.set(dedupKey, Date.now());
    }

    // Privacy & Data Sanitization: Ensure sensitive beneficiary details or payment numbers are not exposed
    const sanitizedPayload: PushPayload = {
      title: payload.title.trim(),
      body: payload.body.trim(),
      icon: payload.icon || '/trust-emblem.jpg',
      badge: payload.badge || '/trust-emblem.jpg',
      tag: payload.tag || 'sct-trust-update',
      data: {
        url: payload.data?.url || '/dashboard',
        entityType: payload.data?.entityType,
        entityId: payload.data?.entityId,
        timestamp: new Date().toISOString(),
      },
    };

    const payloadString = JSON.stringify(sanitizedPayload);

    const subscriptions = await PushSubscription.find({
      user: new Types.ObjectId(userId),
      isActive: true,
    });

    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payloadString,
          {
            TTL: options.ttlSeconds || 60 * 60 * 24, // 24 hours
          }
        );

        sent++;
        sub.lastSentAt = new Date();
        sub.failedAttempts = 0;
        await sub.save();
      } catch (err: any) {
        failed++;
        logger.warn(`[WEB PUSH] Push delivery failed for endpoint (${err.statusCode || err.name}): ${err.message}`);

        // HTTP 410 Gone or 404 Not Found indicates subscription expired or revoked by browser
        if (err.statusCode === 410 || err.statusCode === 404) {
          logger.info(`[WEB PUSH] Removing expired/unregistered subscription: ${sub._id}`);
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          sub.failedAttempts = (sub.failedAttempts || 0) + 1;
          if (sub.failedAttempts >= 3) {
            sub.isActive = false;
          }
          await sub.save();
        }
      }
    }

    return { sent, failed };
  }

  /**
   * Broadcast an operational Web Push notification to Trust Admins and Staff
   */
  public static async sendToAdmins(
    payload: PushPayload,
    options: SendPushOptions & { roles?: Array<'ADMIN' | 'STAFF'> } = {}
  ): Promise<{ sent: number; failed: number }> {
    if (mongoose.connection.readyState !== 1) {
      return { sent: 0, failed: 0 };
    }

    const targetRoles = options.roles || ['ADMIN', 'STAFF'];
    const adminUsers = await User.find({
      role: { $in: targetRoles },
      isActive: true,
    })
      .select('_id')
      .lean();

    if (adminUsers.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const admin of adminUsers) {
      const result = await this.sendToUser(admin._id, payload, {
        ...options,
        dedupKey: `${admin._id}:${options.dedupKey || payload.title}`,
      });
      totalSent += result.sent;
      totalFailed += result.failed;
    }

    return { sent: totalSent, failed: totalFailed };
  }
}
