'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { supplierApi, Order } from '@/lib/api';

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'];

const statusColors: Record<string, string> = {
  pending:   '#FEE2E2',
  confirmed: '#FEF3C7',
  shipped:   '#DBEAFE',
  delivered: '#DCFCE7',
  cancelled: '#F3F4F6',
};

const statusTextColors: Record<string, string> = {
  pending:   '#DC2626',
  confirmed: '#D97706',
  shipped:   '#2563EB',
  delivered: '#16A34A',
  cancelled: '#6B7280',
};

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('All');

  const statuses = ['All', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  // ─── Load orders ─────────────────────────────────────────────────────────────
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

  // ─── Update status ────────────────────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex < 0 || currentIndex >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    setUpdatingId(id);
    try {
      await supplierApi.patchOrderStatus(id, nextStatus);
      setOrders(prev =>
        prev.map(o => o.id === id ? { ...o, status: nextStatus } : o)
      );
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = selectedStatus === 'All'
    ? orders
    : orders.filter(o => o.status === selectedStatus);

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
          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors capitalize ${
                  selectedStatus === status
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
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
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-16">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Manufacturer</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Total Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Order Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900 font-medium">{order.id}</td>
                      <td className="py-3 px-4 text-gray-700">{order.manufacturer?.name ?? '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                          style={{
                            backgroundColor: statusColors[order.status] ?? '#F3F4F6',
                            color: statusTextColors[order.status] ?? '#6B7280',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2D6A4F]">
                        ${order.total_amount?.toLocaleString() ?? '0'}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, order.status)}
                            style={{ backgroundColor: '#40916C', color: 'white' }}
                            className="hover:opacity-90 flex items-center gap-1 mx-auto"
                          >
                            {updatingId === order.id ? 'Updating…' : 'Update Status'}
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
