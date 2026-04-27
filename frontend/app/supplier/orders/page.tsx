'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { supplierApi, Order } from '@/lib/api';

// Valid linear status progression
const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'] as const;

// Determines what the next status should be, and what button label to show
function getNextAction(status: string): { next: string; label: string } | null {
  switch (status) {
    case 'pending':   return { next: 'confirmed', label: 'Confirm Order' };
    case 'confirmed': return { next: 'shipped',   label: 'Mark Shipped' };
    case 'shipped':   return { next: 'delivered', label: 'Mark Delivered' };
    default:          return null; // delivered or cancelled — no further action
  }
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: '#FEE2E2', text: '#DC2626', label: 'Pending' },
  confirmed: { bg: '#FEF3C7', text: '#D97706', label: 'Confirmed' },
  shipped:   { bg: '#DBEAFE', text: '#2563EB', label: 'Shipped' },
  delivered: { bg: '#DCFCE7', text: '#16A34A', label: 'Delivered' },
  cancelled: { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' },
};

const FILTER_OPTIONS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await supplierApi.getOrders();
      setOrders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const action = getNextAction(currentStatus);
    if (!action) return;

    setUpdatingId(orderId);
    try {
      await supplierApi.patchOrderStatus(orderId, action.next);
      // Optimistic update
      setOrders(prev =>
        prev.map(o =>
          o.order_id === orderId
            ? { ...o, order_status: action.next as Order['order_status'] }
            : o
        )
      );
    } catch (err: unknown) {
      console.error('Status update failed:', err);
      // Reload to get real state
      await loadOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(o => o.order_status === filter.toLowerCase());

  const fmt = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString(); }
    catch { return '—'; }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Manufacturer Orders</h1>
        <p className="text-gray-600 mt-2">Process and manage incoming purchase orders</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Incoming Purchase Orders</CardTitle>
          <CardDescription>All orders placed for your materials</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === opt
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt}
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
              <Button size="sm" variant="outline" onClick={loadOrders} className="ml-auto">Retry</Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-16">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Total Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Order Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const badge  = STATUS_BADGE[order.order_status] ?? STATUS_BADGE.cancelled;
                    const action = getNextAction(order.order_status);
                    return (
                      <tr
                        key={order.order_id}
                        style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}
                        className="hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-mono text-xs text-gray-700">
                          PO-{order.order_id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {order.ordered_by?.name ?? '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: badge.bg, color: badge.text }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#2D6A4F]">
                          ${order.total_amount?.toLocaleString() ?? '0'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {order.order_date ? fmt(order.order_date) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {action && (
                            <Button
                              size="sm"
                              disabled={updatingId === order.order_id}
                              onClick={() => handleUpdateStatus(order.order_id, order.order_status)}
                              style={{ backgroundColor: '#40916C', color: 'white' }}
                              className="hover:opacity-90 flex items-center gap-1 mx-auto"
                            >
                              {updatingId === order.order_id ? 'Updating…' : action.label}
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
