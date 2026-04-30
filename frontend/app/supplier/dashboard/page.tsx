'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Star, AlertCircle } from 'lucide-react';
import { supplierApi, analyticsApi, notificationsApi, Order, Material, FinancialSummary, Notification } from '@/lib/api';

export default function SupplierDashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [mats, ords, fin, notifResp] = await Promise.all([
        supplierApi.getMaterials(),
        supplierApi.getOrders(),
        analyticsApi.getFinancial(),
        notificationsApi.getAll(),
      ]);
      setMaterials(mats);
      setOrders(ords);
      setFinancial(fin);
      setNotifications(notifResp.notifications.slice(0, 4));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Process (confirm) a pending order
  const handleProcess = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await supplierApi.patchOrderStatus(orderId, 'confirmed');
      setOrders(prev =>
        prev.map(o => o.order_id === orderId ? { ...o, order_status: 'confirmed' } : o)
      );
    } catch (err: unknown) {
      console.error('Process order failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // Pending = orders with status 'pending'
  const pendingOrders = orders.filter(o => o.order_status === 'pending');

  // Top materials by quantity
  const materialChartData = [...materials]
    .sort((a, b) => b.quantity_available - a.quantity_available)
    .slice(0, 5)
    .map(m => ({ material: m.material_name, quantity: m.quantity_available }));

  // Build 12-month trend from real financial data
  const buildChartData = () => {
    const revTrend = financial?.revenue_trend ?? {};
    const expTrend = financial?.expense_trend ?? {};
    const allKeys = Array.from(new Set([...Object.keys(revTrend), ...Object.keys(expTrend)]));
    const sorted = allKeys.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return sorted.slice(-12).map(k => ({
      month: k,
      revenue: revTrend[k] ?? 0,
      expense: expTrend[k] ?? 0,
    }));
  };
  const chartData = buildChartData();

  // Notification icon helper
  const getNotifIcon = (type: string) => {
    if (type?.includes('rating')) return <Star className="w-4 h-4 text-[#2D6A4F]" />;
    return <ShoppingCart className="w-4 h-4 text-[#2D6A4F]" />;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">Failed to load dashboard</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <Button className="mt-4" onClick={loadData}>Retry</Button>
        </div>
      </div>
    );
  }

  const totalRevenue = financial?.summary.total_revenue ?? 0;
  const totalExpense = financial?.summary.total_expense ?? 0;
  const avgRating = financial?.summary.avg_rating ?? 0;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Supplier Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your materials, orders, and financials</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm" style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#2D6A4F]">
                  ${totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-[#40916C] mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> From delivered orders
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#D8F3DC]" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderLeft: '4px solid #40916C' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E63946]">
              ${totalExpense.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Operating costs</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderLeft: '4px solid #52B788' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#52B788]">{pendingOrders.length}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2D6A4F]">
              {avgRating > 0 ? `${avgRating.toFixed(1)}/5.0` : '—'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Customer feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders + Top Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>{pendingOrders.length} orders awaiting action</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No pending orders</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Manufacturer</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Total</th>
                        <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map(order => (
                        <tr key={order.order_id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-xs text-gray-700">{order.order_id.slice(0, 8)}…</td>
                          <td className="py-3 px-4 text-gray-700">{order.ordered_by?.name ?? '—'}</td>
                          <td className="py-3 px-4 font-semibold text-[#2D6A4F]">${order.total_amount?.toLocaleString() ?? '0'}</td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              disabled={processingId === order.order_id}
                              onClick={() => handleProcess(order.order_id)}
                              style={{ backgroundColor: '#40916C', color: 'white' }}
                              className="hover:opacity-90"
                            >
                              {processingId === order.order_id ? 'Processing…' : 'Process'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Raw Materials</CardTitle>
            <CardDescription>By quantity available</CardDescription>
          </CardHeader>
          <CardContent>
            {materialChartData.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No materials yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={materialChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="material" type="category" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#2D6A4F" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Revenue vs Expense History</CardTitle>
              <CardDescription>Last 12 months comparison</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No financial data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="expense" stroke="#E63946" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Latest alerts</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No notifications yet</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.notification_id} className="flex gap-3 pb-3" style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D8F3DC' }}>
                      {getNotifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-snug">{n.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-[#2D6A4F] mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
