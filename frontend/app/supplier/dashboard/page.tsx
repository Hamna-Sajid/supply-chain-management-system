'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, ShoppingCart, Star } from 'lucide-react';
import { supplierApi, Material, Order } from '@/lib/api';

export default function SupplierDashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const [mats, ords] = await Promise.all([
          supplierApi.getMaterials(),
          supplierApi.getOrders(),
        ]);
        setMaterials(mats);
        setOrders(ords);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Derived metrics
  const pendingOrders = orders.filter(o =>
    o.status === 'pending' || o.status === 'confirmed'
  );
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

  // Chart data from real materials
  const materialChartData = materials.slice(0, 5).map(m => ({
    material: m.material_name,
    quantity: m.quantity_available,
  }));

  // Static trend data (no analytics endpoint wired yet)
  const revenueExpenseData = [
    { month: 'Jan', revenue: 4000, expense: 2400 },
    { month: 'Feb', revenue: 3000, expense: 2210 },
    { month: 'Mar', revenue: 2000, expense: 2290 },
    { month: 'Apr', revenue: 2780, expense: 2000 },
    { month: 'May', revenue: 1890, expense: 2181 },
    { month: 'Jun', revenue: 2390, expense: 2500 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-semibold">Failed to load dashboard</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
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
            <CardTitle className="text-sm font-medium text-gray-700">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold text-[#40916C]">{pendingOrders.length}</div>
              <p className="text-xs text-[#40916C] mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Awaiting processing
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderLeft: '4px solid #52B788' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold text-[#52B788]">{orders.length}</div>
              <p className="text-xs text-[#52B788] mt-1">All time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Materials Listed</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold text-[#2D6A4F]">{materials.length}</div>
              <p className="text-xs text-gray-500 mt-1">In catalog</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Orders Table */}
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
                        <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Total Amount</th>
                        <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order.id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium">{order.id}</td>
                          <td className="py-3 px-4 text-gray-700">{order.manufacturer?.name ?? '—'}</td>
                          <td className="py-3 px-4 font-semibold text-[#2D6A4F]">${order.total_amount?.toLocaleString() ?? '0'}</td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              style={{ backgroundColor: '#40916C', color: 'white' }}
                              className="hover:opacity-90"
                            >
                              Process
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

        {/* Material Stock Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Raw Materials</CardTitle>
            <CardDescription>By quantity available</CardDescription>
          </CardHeader>
          <CardContent>
            {materialChartData.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No materials yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={materialChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="material" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#40916C" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Revenue vs Expense History</CardTitle>
              <CardDescription>Last 6 months comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke="#E63946" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Notifications placeholder */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Latest alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex gap-3 pb-3" style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D8F3DC' }}>
                      <ShoppingCart className="w-4 h-4 text-[#2D6A4F]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Order #{order.id} — {order.status}</p>
                    <p className="text-xs text-gray-500 mt-1">${order.total_amount?.toLocaleString() ?? '0'}</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="flex gap-3 pb-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D8F3DC' }}>
                      <Star className="w-4 h-4 text-[#2D6A4F]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">No activity yet</p>
                    <p className="text-xs text-gray-500 mt-1">Your orders will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
