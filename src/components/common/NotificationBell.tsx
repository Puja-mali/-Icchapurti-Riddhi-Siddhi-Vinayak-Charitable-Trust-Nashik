import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  X,
} from 'lucide-react';
import { notificationService, AppNotification } from '@/src/services/notificationService';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';
import { PushNotificationToggle } from './PushNotificationToggle';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Quietly ignore network/auth errors in poll
    }
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({
        limit: 15,
        unreadOnly: filterUnread,
      });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // Quietly handle errors
    } finally {
      setLoading(false);
    }
  }, [user, filterUnread]);

  // Initial fetch and light periodic polling (every 45s)
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 45000);
    return () => clearInterval(interval);
  }, [user, loadUnreadCount]);

  // When dropdown opens or filter toggles, load list
  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, filterUnread, user, loadNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) {
    return null;
  }

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'DONATION_SUCCESS':
        return <Heart className="w-4 h-4 text-emerald-600 fill-emerald-100" />;
      case 'DONATION_FAILED':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'VOLUNTEER_APPROVED':
      case 'VOLUNTEER_SUBMITTED':
        return <HandHelping className="w-4 h-4 text-amber-600" />;
      case 'HELP_REQUEST_SUBMITTED':
      case 'HELP_REQUEST_STATUS_UPDATED':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'EVENT_REGISTRATION':
      case 'EVENT_UPDATE':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'WELCOME':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        id="notification-bell-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        className={cn(
          'relative p-2 rounded-md text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 cursor-pointer',
          isOpen && 'bg-stone-100 text-stone-900'
        )}
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span
            id="notification-badge"
            className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-amber-600 rounded-full ring-2 ring-white shadow-xs animate-in zoom-in-50"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="notification-dropdown-panel"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-stone-200 z-50 overflow-hidden text-stone-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-stone-900 tracking-tight">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    title="Mark all as read"
                    className="text-[11px] font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                  aria-label="Close notifications"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Device Web Push Notification Quick Toggle */}
            <div className="px-4 py-2 bg-stone-50/80 border-b border-stone-200">
              <PushNotificationToggle compact />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center border-b border-stone-200 text-xs bg-white px-3 pt-1">
              <button
                type="button"
                onClick={() => setFilterUnread(false)}
                className={cn(
                  'px-3 py-1.5 font-medium border-b-2 transition-colors cursor-pointer',
                  !filterUnread
                    ? 'border-emerald-800 text-emerald-900 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterUnread(true)}
                className={cn(
                  'px-3 py-1.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
                  filterUnread
                    ? 'border-emerald-800 text-emerald-900 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                )}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-stone-200 text-stone-800 rounded-full px-1.5 font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* List Body */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-stone-500 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
                  <span className="text-xs">Loading updates...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-stone-500 flex flex-col items-center justify-center gap-2">
                  <Bell className="w-8 h-8 text-stone-300 stroke-1" />
                  <p className="text-xs font-medium text-stone-700">No notifications found</p>
                  <p className="text-[11px] text-stone-400">
                    {filterUnread
                      ? 'You have caught up with all unread updates.'
                      : 'Activity notifications and receipts will appear here.'}
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    id={`notification-item-${n._id}`}
                    onClick={() => {
                      if (!n.isRead) handleMarkAsRead(n._id);
                    }}
                    className={cn(
                      'p-3 sm:p-3.5 transition-colors flex items-start gap-3 relative group cursor-pointer text-left',
                      n.isRead ? 'bg-white hover:bg-stone-50' : 'bg-emerald-50/50 hover:bg-emerald-50/80'
                    )}
                  >
                    {/* Visual Type Icon */}
                    <div className="mt-0.5 shrink-0 p-1.5 rounded-full bg-stone-100">
                      {renderIcon(n.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {!n.isRead && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0"
                            title="Unread"
                          />
                        )}
                        <h4 className="text-xs font-semibold text-stone-900 truncate leading-snug">
                          {n.title}
                        </h4>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-stone-400">
                        <span>{formatTime(n.createdAt)}</span>

                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => {
                              if (!n.isRead) handleMarkAsRead(n._id);
                              setIsOpen(false);
                            }}
                            className="text-emerald-800 hover:text-emerald-950 font-medium inline-flex items-center gap-0.5"
                          >
                            <span>View details</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Button: Delete / Mark Read */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 shrink-0">
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(n._id, e)}
                          title="Mark as read"
                          className="p-1 text-stone-400 hover:text-emerald-700 rounded cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(n._id, e)}
                        title="Delete"
                        className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Link */}
            <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-center">
              <Link
                to="/dashboard#notification-center"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                View Full Notification Log in Dashboard →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
