import { SupplierSidebar } from '@/components/supplier-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function OrdersManagementPage() {
  const orders = [
    {
      id: 'SUP-ORD-001',
      buyer: 'Metro Warehouse LLC',
      buyerType: 'Warehouse',
      date: '2024-01-18',
      items: 5,
      total: '$5,750',
      status: 'Pending',
      dueDate: '2024-01-25',
    },
    {
      id: 'SUP-ORD-002',
      buyer: 'RetailMart Inc',
      buyerType: 'Retailer',
      date: '2024-01-17',
      items: 3,
      total: '$2,400',
      status: 'Processing',
      dueDate: '2024-01-22',
    },
    {
      id: 'SUP-ORD-003',
      buyer: 'Industrial Manufacturing Co',
      buyerType: 'Manufacturer',
      date: '2024-01-16',
      items: 8,
      total: '$12,300',
      status: 'Processing',
      dueDate: '2024-01-23',
    },
    {
      id: 'SUP-ORD-004',
      buyer: 'Quick Supply Warehouse',
      buyerType: 'Warehouse',
      date: '2024-01-15',
      items: 2,
      total: '$1,850',
      status: 'Ready to Ship',
      dueDate: '2024-01-20',
    },
    {
      id: 'SUP-ORD-005',
      buyer: 'Downtown Retail',
      buyerType: 'Retailer',
      date: '2024-01-14',
      items: 4,
      total: '$3,600',
      status: 'Shipped',
      dueDate: '2024-01-21',
    },
    {
      id: 'SUP-ORD-006',
      buyer: 'Tech Factory Systems',
      buyerType: 'Manufacturer',
      date: '2024-01-13',
      items: 6,
      total: '$8,900',
      status: 'Shipped',
      dueDate: '2024-01-19',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Processing':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Ready to Ship':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'Shipped':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Ready to Ship':
        return 'bg-orange-100 text-orange-800';
      case 'Shipped':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SupplierSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2D6A4F]">Orders Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all incoming orders from buyers</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2D6A4F]">156</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">In Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-xs text-gray-500 mt-1">Being prepared</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">This Month Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#40916C]">$34,800</div>
              <p className="text-xs text-green-600 mt-1">+15% vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Current Orders</CardTitle>
                <CardDescription>Manage and track all buyer orders</CardDescription>
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm hover:border-[#2D6A4F] focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="ready">Ready to Ship</option>
                  <option value="shipped">Shipped</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Order ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Buyer</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Type</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Items</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Total</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Due Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Status</th>
                    <th className="text-center py-4 px-4 font-semibold text-[#2D6A4F]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-semibold text-[#2D6A4F]">{order.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.buyer}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-gray-700">
                          {order.buyerType}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{order.items}</td>
                      <td className="py-4 px-4 font-semibold text-[#2D6A4F]">{order.total}</td>
                      <td className="py-4 px-4 text-gray-700">{order.dueDate}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#2D6A4F] hover:bg-[#52B788] hover:text-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
