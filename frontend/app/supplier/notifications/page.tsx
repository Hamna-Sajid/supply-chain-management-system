'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, AlertCircle, TrendingUp, Bell, Trash2 } from 'lucide-react';
import { notificationsApi, Notification } from '@/lib/api';

const FILTERS = ['All', 'New Orders', 'New Ratings', 'Status Updates', 'Alerts'] as const;
type Filter = typeof FILTERS[number];

function matchesFilter(n: Notification, filter: Filter): boolean {
  if (filter === 'All') return true;
  const t = n.type?.toLowerCase() ?? '';
  if (filter === 'New Orders') return t.includes('order') && !t.includes('status');
  if (filter === 'New Ratings') return t.includes('rating');
  if (filter === 'Status Updates') return t.includes('status') || t.includes('shipment');
  if (filter === 'Alerts') return t.includes('stock') || t.includes('alert') || t.includes('low');
  return true;
}

function getIcon(type: string) {
  const t = type?.toLowerCase() ?? '';
  if (t.includes('rating')) return <Star className="w-5 h-5 text-[#2D6A4F]" />;
  if (t.includes('stock') || t.includes('alert')) return <AlertCircle className="w-5 h-5 text-red-600" />;
  if (t.includes('status') || t.includes('ship')) return <TrendingUp className="w-5 h-5 text-[#2D6A4F]" />;
  return <ShoppingCart className="w-5 h-5 text-[#2D6A4F]" />;
}

function isAlert(type: string) {
  const t = type?.toLowerCase() ?? '';
  return t.includes('stock') || t.includes('alert') || t.includes('low');
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await notificationsApi.getAll();
      setNotifications(resp.notifications);
      setUnreadCount(resp.unread_count);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark as read failed:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead();
      // Update local state to reflect all notifications as read
      setNotifications(prev =>
        prev.map(n => ({
          notification_id: n.notification_id,
          type: n.type,
          description: n.description,
          is_read: true,
          created_at: n.created_at
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all as read failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to mark notifications as read';
      // Reload notifications to sync state with server
      await loadNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => {
        const removed = prev.find(n => n.notification_id === id);
        if (removed && !removed.is_read) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n.notification_id !== id);
      });
    } catch (err) {
      console.error('Delete notification failed:', err);
    }
  };

  const filtered = notifications.filter(n => matchesFilter(n, filter));

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D6A4F]">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with alerts and important messages</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#D8F3DC]"
          >
            {markingAll ? 'Marking…' : `Mark all read (${unreadCount})`}
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Notifications Center</CardTitle>
          <CardDescription>All alerts and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === f
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
              <Button size="sm" variant="outline" onClick={loadNotifications} className="ml-auto">Retry</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No notifications</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'All' ? "You're all caught up!" : `No ${filter.toLowerCase()} notifications`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(notif => (
                <div
                  key={notif.notification_id}
                  onClick={() => !notif.is_read && handleMarkAsRead(notif.notification_id)}
                  className={`flex gap-4 p-4 rounded-lg border cursor-pointer transition-colors group ${isAlert(notif.type)
                      ? 'bg-red-50 border-red-200'
                      : notif.is_read
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-[#B7E4C7] hover:bg-[#F0FAF5]'
                    }`}
                >
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isAlert(notif.type) ? '#FEE2E2' : '#D8F3DC' }}
                  >
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{notif.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.created_at)}</p>
                  </div>

                  {/* Unread dot + Delete */}
                  <div className="flex items-start gap-2 flex-shrink-0">
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: '#2D6A4F' }} />
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(notif.notification_id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
