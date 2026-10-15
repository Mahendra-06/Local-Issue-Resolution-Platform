import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { notificationsService } from '../../api/notificationsService';
import { useToast } from '../../context/ToastContext';
import { Bell, CheckCheck, Clock, ArrowRight } from 'lucide-react';

export const CitizenNotificationsPage = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationsService.getNotifications();
      const list = Array.isArray(response) ? response : response?.data || [];
      setNotifications(list);
    } catch (err) {
      setError(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Updated', 'Notification marked as read.');
    } catch (err) {
      toast.error('Action Failed', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All Read', 'All notifications marked as read.');
    } catch (err) {
      toast.error('Action Failed', err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        role="citizen"
        title="Notifications & Updates"
        subtitle="Real-time alerts regarding status updates, department assignments, and resolutions for your reports."
        actions={
          notifications.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>
          )
        }
      />

      {error && (
        <ErrorState
          title="Could Not Load Notifications"
          message="Failed to retrieve notification events from the server."
          error={error}
          onRetry={fetchNotifications}
          role="citizen"
        />
      )}

      {loading && !error && <SkeletonLoader count={4} type="card" />}

      {!loading && !error && notifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          message="You're all caught up! Updates regarding your submitted reports will appear here."
        />
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((item) => (
            <GlassCard
              key={item.id}
              className={`p-4 flex items-start justify-between gap-4 transition-all ${
                item.isRead ? 'opacity-70 bg-white/60' : 'bg-white border-purple-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    item.isRead
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#252238]">{item.title}</h4>
                  <p className="text-xs text-[#6B687A] mt-0.5 leading-relaxed">{item.message}</p>
                  <span className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
              </div>

              {!item.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(item.id)}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 shrink-0 px-2 py-1 rounded hover:bg-purple-50"
                >
                  Mark read
                </button>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
