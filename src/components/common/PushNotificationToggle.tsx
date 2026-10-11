import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from './Button';
import { webPushService } from '@/src/services/webPushService';
import { useAuth } from '@/src/context/AuthContext';

interface PushNotificationToggleProps {
  className?: string;
  compact?: boolean;
}

export const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({
  className = '',
  compact = false,
}) => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const checkState = async () => {
      const supported = webPushService.isSupported();
      setIsSupported(supported);
      if (!supported) return;

      setPermission(webPushService.getPermission());

      const sub = await webPushService.getDeviceSubscription();
      setIsSubscribed(!!sub);
    };

    checkState();
  }, [user]);

  const handleEnable = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      await webPushService.subscribe();
      setIsSubscribed(true);
      setPermission('granted');
      setStatusMessage({
        type: 'success',
        text: 'Device notifications enabled! You will now receive official Trust alerts on this device.',
      });
    } catch (err: any) {
      setPermission(webPushService.getPermission());
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not enable push notifications.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      await webPushService.unsubscribe();
      setIsSubscribed(false);
      setStatusMessage({
        type: 'success',
        text: 'Device push notifications have been disabled for this device.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to disable notifications.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className={`p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 flex items-start gap-2 ${className}`}>
        <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-stone-700">Web Push Not Supported</span>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Your current browser or privacy mode does not support operating-system Web Push notifications.
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <BellRing className="w-4 h-4 text-emerald-600" />
          ) : (
            <Bell className="w-4 h-4 text-stone-400" />
          )}
          <span className="text-xs font-semibold text-stone-800">
            {isSubscribed ? 'Device Notifications Active' : 'Device Notifications'}
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant={isSubscribed ? 'outline' : 'primary'}
          disabled={isLoading}
          onClick={isSubscribed ? handleDisable : handleEnable}
          className="text-xs py-1 px-3"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isSubscribed ? (
            'Turn Off'
          ) : (
            'Turn On'
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#14532d]" />
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">
              Browser & Phone Push Notifications
            </h4>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed max-w-md">
            Receive instant operating-system notifications on this device when donations are verified, volunteer shifts updated, or urgent Trust updates published — even when this tab is closed.
          </p>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
            isSubscribed
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-stone-200/80 text-stone-700 border-stone-300'
          }`}
        >
          {isSubscribed ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Active on Device
            </>
          ) : (
            'Disabled'
          )}
        </span>
      </div>

      {permission === 'denied' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-amber-950">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Browser Permission Blocked</span>
          </div>
          <p className="text-[11px] text-amber-800">
            Notifications are currently blocked in your browser site permissions. Click the lock icon in your address bar and reset notifications to "Allow" to enable device alerts.
          </p>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="pt-1 flex items-center justify-between border-t border-stone-200/60">
        <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          Secure VAPID protocol • Never spammed
        </span>

        {isSubscribed ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isLoading}
            onClick={handleDisable}
            className="text-xs text-stone-700 hover:text-red-700 border-stone-300 hover:border-red-300"
            leftIcon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellOff className="w-3.5 h-3.5" />}
          >
            {isLoading ? 'Updating...' : 'Disable on this Device'}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={isLoading || permission === 'denied'}
            onClick={handleEnable}
            className="text-xs bg-[#14532d] hover:bg-[#0f4023] text-white"
            leftIcon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
          >
            {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
          </Button>
        )}
      </div>
    </div>
  );
};
