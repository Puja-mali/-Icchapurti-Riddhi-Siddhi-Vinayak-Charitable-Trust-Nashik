import { api } from './api';

export interface PushStatus {
  isSubscribed: boolean;
  subscriptionCount: number;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const webPushService = {
  /**
   * Check if the current browser environment supports the Web Push API
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  /**
   * Get current browser notification permission
   */
  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  /**
   * Retrieve active service worker registration or register /sw.js
   */
  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null;
    try {
      const reg = await navigator.serviceWorker.getRegistration('/');
      if (reg) return reg;
      return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (err) {
      console.warn('Service worker registration failed:', err);
      return null;
    }
  },

  /**
   * Retrieve current device push subscription
   */
  async getDeviceSubscription(): Promise<PushSubscription | null> {
    const reg = await this.getRegistration();
    if (!reg) return null;
    return await reg.pushManager.getSubscription();
  },

  /**
   * Fetch server's active VAPID public key
   */
  async getPublicKey(): Promise<string | null> {
    try {
      const res = await api.get<{ publicKey: string | null }>('/push/public-key');
      return res?.publicKey || null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch user subscription status from backend
   */
  async getStatus(): Promise<PushStatus> {
    try {
      return await api.get<PushStatus>('/push/status');
    } catch {
      return { isSubscribed: false, subscriptionCount: 0 };
    }
  },

  /**
   * Prompt user for browser permission, register with push service, and persist subscription to backend
   */
  async subscribe(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Web Push Notifications are not supported in this browser.');
    }

    // Explicit user permission request (NEVER triggered automatically on initial page load)
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error(
        permission === 'denied'
          ? 'Notification permission was denied in your browser settings. Please enable notifications for this site in your browser permissions.'
          : 'Notification permission request was dismissed.'
      );
    }

    const reg = await this.getRegistration();
    if (!reg) {
      throw new Error('Could not initialize service worker for notifications.');
    }

    const publicKey = await this.getPublicKey();
    if (!publicKey) {
      throw new Error('Server VAPID public key is unavailable.');
    }

    // Subscribe to browser Push Service (FCM / Mozilla Push / Apple Push)
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const raw = subscription.toJSON();
    if (!raw.endpoint || !raw.keys?.p256dh || !raw.keys?.auth) {
      throw new Error('Failed to obtain cryptographic push subscription keys from browser.');
    }

    // Save subscription in trust MongoDB associated with authenticated user
    await api.post('/push/subscribe', {
      endpoint: raw.endpoint,
      keys: {
        p256dh: raw.keys.p256dh,
        auth: raw.keys.auth,
      },
    });

    return true;
  },

  /**
   * Unsubscribe from browser Push Service and delete backend subscription record
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const subscription = await this.getDeviceSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        // Unsubscribe from browser
        await subscription.unsubscribe();
        // Remove from database
        await api.post('/push/unsubscribe', { endpoint });
      }
      return true;
    } catch (err) {
      console.warn('Failed to cleanly unsubscribe from push notifications:', err);
      return false;
    }
  },
};
