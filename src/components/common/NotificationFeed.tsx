import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Heart,
  Calendar,
  HandHelping,
  FileText,
  Sparkles,
  CheckCheck,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { notificationService, AppNotification } from '@/src/services/notificationService';
import { cn } from '@/src/lib/utils';
import { Button } from './Button';
import { PushNotificationToggle } from './PushNotificationToggle';

interface NotificationFeedProps {
  title?: string;
  description?: string;
  className?: string;
  showActions?: boolean;
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  title = 'Notifications & Seva Alerts',
  description = 'Live updates regarding your donations, tax receipts, volunteer applications, and aid requests.',
  className,
  showActions = true,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({
        page,
        limit: 20,
        unreadOnly: filterUnread,
      });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filterUnread]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => {
        const item = prev.find((n) => n._id === id);
        if (item && !item.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch {
      // Ignore
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedType === 'ALL') return true;
    if (selectedType === 'DONATION') return n.type.startsWith('DONATION');
    if (selectedType === 'VOLUNTEER') return n.type.startsWith('VOLUNTEER');
    if (selectedType === 'HELP') return n.type.startsWith('HELP');
    if (selectedType === 'EVENT') return n.type.startsWith('EVENT');
    return true;
  });

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'DONATION_SUCCESS':
        return <Heart className="w-5 h-5 text-emerald-600 fill-emerald-100" />;
      case 'DONATION_FAILED':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'VOLUNTEER_APPROVED':
      case 'VOLUNTEER_SUBMITTED':
        return <HandHelping className="w-5 h-5 text-amber-600" />;
      case 'HELP_REQUEST_SUBMITTED':
      case 'HELP_REQUEST_STATUS_UPDATED':
        return <FileText className="w-5 h-5 text-sky-600" />;
      case 'EVENT_REGISTRATION':
      case 'EVENT_UPDATE':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      case 'WELCOME':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-stone-600" />;
    }
  };

  return (
    <div
      id="notification-center"
      className={cn('bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden', className)}
    >
      {/* Top Header */}
      <div className="p-5 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900">{title}</h3>
            {unreadCount > 0 && (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600">{description}</p>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchNotifications}
              title="Refresh notifications"
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md border border-stone-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                leftIcon={<CheckCheck className="w-4 h-4 text-emerald-700" />}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Device Web Push Notification Quick Toggle */}
      <div className="px-5 py-3 bg-stone-50/80 border-b border-stone-200">
        <PushNotificationToggle compact />
      </div>

      {/* Filter Toolbar */}
      <div className="px-5 py-3 border-b border-stone-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Read / Unread toggle */}
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
          <button
            type="button"
            onClick={() => setFilterUnread(false)}
            className={cn(
              'px-3 py-1 rounded-md font-medium transition-colors cursor-pointer',
              !filterUnread ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
            )}
          >
            All Updates
          </button>
          <button
            type="button"
            onClick={() => setFilterUnread(true)}
            className={cn(
              'px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1',
              filterUnread ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
            )}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-amber-600 text-white rounded-full px-1.5 font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'DONATION', label: 'Donations' },
            { id: 'VOLUNTEER', label: 'Volunteering' },
            { id: 'HELP', label: 'Aid Requests' },
            { id: 'EVENT', label: 'Events' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedType(cat.id)}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium text-xs whitespace-nowrap',
                selectedType === cat.id
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-stone-100">
        {loading && notifications.length === 0 ? (
          <div className="p-12 text-center text-stone-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-800" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-stone-500 flex flex-col items-center justify-center gap-2">
            <Bell className="w-10 h-10 text-stone-300 stroke-1" />
            <p className="text-sm font-semibold text-stone-700">No notifications to display</p>
            <p className="text-xs text-stone-400 max-w-sm">
              {filterUnread
                ? 'All caught up! No unread notifications found.'
                : 'Whenever your payments verify, applications progress, or aid requests update, you will find real-time notifications right here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n._id}
              id={`feed-notification-${n._id}`}
              className={cn(
                'p-4 sm:p-5 transition-colors flex items-start gap-4 group',
                n.isRead ? 'bg-white hover:bg-stone-50/70' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
              )}
            >
              {/* Type Badge Icon */}
              <div className="shrink-0 p-2.5 rounded-lg bg-stone-100 border border-stone-200/60 mt-0.5">
                {renderIcon(n.type)}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Unread" />
                    )}
                    <h4 className="text-sm font-bold text-stone-900">{n.title}</h4>
                  </div>
                  <span className="text-xs text-stone-400 whitespace-nowrap">{formatTime(n.createdAt)}</span>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-2">{n.message}</p>

                <div className="flex items-center gap-3 text-xs">
                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={() => {
                        if (!n.isRead) handleMarkAsRead(n._id);
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(n._id)}
                      className="text-stone-500 hover:text-emerald-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Mark read</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(n._id)}
                    className="text-stone-400 hover:text-rose-600 font-medium inline-flex items-center gap-1 cursor-pointer ml-auto opacity-70 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs h-7 px-2"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs h-7 px-2"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
