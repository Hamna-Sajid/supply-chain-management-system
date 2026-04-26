'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await manufacturerApi.getOrders();
      setOrders(res.orders || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch supplier orders.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Supplier Orders</h1>
        <p className="text-gray-600 mt-2">Track raw material orders placed with suppliers</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>All placed orders and their statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Total Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{order._id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 text-gray-700">{order.supplier_id?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">${order.total_amount?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.items?.length || 0} items
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">No orders placed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}