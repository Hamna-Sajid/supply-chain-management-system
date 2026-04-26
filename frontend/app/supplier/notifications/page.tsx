'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Star, AlertCircle, TrendingUp } from 'lucide-react';

const notificationsData = [
  { id: 1, type: 'order', title: 'New Order Received', message: 'Order O-1234 from Acme Manufacturing is pending', time: '2 hours ago' },
  { id: 2, type: 'rating', title: 'New Rating', message: 'You received a 5-star rating from XYZ Industries', time: '4 hours ago' },
  { id: 3, type: 'status', title: 'Status Update', message: 'Order O-1233 has been shipped and is on the way', time: '1 day ago' },
  { id: 4, type: 'alert', title: 'Low Stock Alert', message: 'Your Steel Sheets inventory is running low. Reorder soon.', time: '2 days ago' },
  { id: 5, type: 'order', title: 'New Order', message: 'Order O-1232 from Global Tech is ready for processing', time: '3 days ago' },
];

export default function NotificationsPage() {
  const [filterType, setFilterType] = useState('All');

  const filters = ['All', 'New Orders', 'New Ratings', 'Status Updates', 'Alerts'];

  const filteredNotifications = filterType === 'All'
    ? notificationsData
    : notificationsData.filter(notif => {
        if (filterType === 'New Orders') return notif.type === 'order';
        if (filterType === 'New Ratings') return notif.type === 'rating';
        if (filterType === 'Status Updates') return notif.type === 'status';
        if (filterType === 'Alerts') return notif.type === 'alert';
        return true;
      });

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-[#2D6A4F]" />;
      case 'rating':
        return <Star className="w-5 h-5 text-[#2D6A4F]" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'status':
        return <TrendingUp className="w-5 h-5 text-[#2D6A4F]" />;
      default:
        return <ShoppingCart className="w-5 h-5 text-[#2D6A4F]" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'alert':
        return '#FEE2E2';
      default:
        return '#D8F3DC';
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Notifications</h1>
        <p className="text-gray-600 mt-2">Stay updated with alerts and important messages</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Notifications Center</CardTitle>
          <CardDescription>All alerts and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === filter
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex gap-4 p-4 rounded-lg border"
                  style={{
                    borderColor: '#B7E4C7',
                    backgroundColor: getBackgroundColor(notif.type) === '#FEE2E2' ? '#FEE2E2' : '#F9F9F9',
                  }}
                >
                  {/* Icon Container */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getBackgroundColor(notif.type) }}
                  >
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                    <p className="text-sm text-gray-700 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{notif.time}</p>
                  </div>

                  {/* Unread Indicator */}
                  {notif.type === 'order' && (
                    <div
                      className="flex-shrink-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#018790' }}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No notifications found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
