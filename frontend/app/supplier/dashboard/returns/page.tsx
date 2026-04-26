import { SupplierSidebar } from '@/components/supplier-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';

export default function ReturnRequestsPage() {
  const pendingReturns = [
    {
      id: 'RET-001',
      originalOrder: 'ORD-125',
      buyer: 'Metro Warehouse LLC',
      product: 'Industrial Pump Unit',
      quantity: 2,
      reason: 'Defective unit - motor not functioning',
      requestDate: '2024-01-16',
      status: 'Pending Review',
      refundAmount: '$900',
    },
    {
      id: 'RET-002',
      originalOrder: 'ORD-128',
      buyer: 'RetailMart Inc',
      product: 'Control Panel Assembly',
      quantity: 1,
      reason: 'Wrong specification received',
      requestDate: '2024-01-15',
      status: 'Awaiting Item',
      refundAmount: '$1,200',
    },
    {
      id: 'RET-003',
      originalOrder: 'ORD-131',
      buyer: 'Industrial Manufacturing Co',
      product: 'Stainless Steel Pipe',
      quantity: 5,
      reason: 'Damaged during shipment',
      requestDate: '2024-01-14',
      status: 'Item Received',
      refundAmount: '$375',
    },
  ];

  const completedReturns = [
    {
      id: 'RET-004',
      originalOrder: 'ORD-110',
      buyer: 'Quick Supply Warehouse',
      product: 'Electric Motor',
      quantity: 1,
      reason: 'Performance issue',
      requestDate: '2024-01-05',
      completedDate: '2024-01-12',
      refundAmount: '$320',
      status: 'Refunded',
    },
    {
      id: 'RET-005',
      originalOrder: 'ORD-115',
      buyer: 'Downtown Retail',
      product: 'Power Distribution Unit',
      quantity: 1,
      reason: 'Exceeded return window',
      requestDate: '2024-01-08',
      completedDate: '2024-01-10',
      refundAmount: '$0',
      status: 'Rejected',
    },
    {
      id: 'RET-006',
      originalOrder: 'ORD-120',
      buyer: 'Tech Factory Systems',
      product: 'Pressure Gauge',
      quantity: 3,
      reason: 'Calibration error',
      requestDate: '2024-01-02',
      completedDate: '2024-01-11',
      refundAmount: '$450',
      status: 'Refunded',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SupplierSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2D6A4F]">Return Requests</h1>
            <p className="text-gray-600 mt-2">Manage customer returns and refunds</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingReturns.length}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2D6A4F]">$2,475</div>
              <p className="text-xs text-gray-500 mt-1">Total amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Return Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">2.1%</div>
              <p className="text-xs text-gray-500 mt-1">Of total orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#40916C]">2.4 days</div>
              <p className="text-xs text-gray-500 mt-1">Processing</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="mb-8">
          <TabsList className="bg-white border border-gray-200 mb-6">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white"
            >
              Pending Returns ({pendingReturns.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white"
            >
              Completed Returns ({completedReturns.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Returns Tab */}
          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingReturns.map((returnItem) => (
                <Card key={returnItem.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#2D6A4F]">{returnItem.id}</h3>
                          <Badge className="bg-yellow-100 text-yellow-800">{returnItem.status}</Badge>
                        </div>
                        <p className="text-gray-600">
                          <span className="font-medium">{returnItem.buyer}</span>
                          {' • '}
                          <span className="text-sm">{returnItem.product}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#2D6A4F]">{returnItem.refundAmount}</div>
                        <p className="text-xs text-gray-500">Refund</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Original Order</p>
                        <p className="font-medium text-gray-900">{returnItem.originalOrder}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Quantity</p>
                        <p className="font-medium text-gray-900">{returnItem.quantity} units</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Reason for Return</p>
                        <p className="text-gray-700">{returnItem.reason}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Request Date</p>
                        <p className="text-gray-900">{returnItem.requestDate}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {returnItem.status === 'Pending Review' && (
                        <>
                          <Button className="flex-1 bg-[#2D6A4F] hover:bg-[#40916C]">
                            Approve Return
                          </Button>
                          <Button variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50">
                            Deny Return
                          </Button>
                        </>
                      )}
                      {returnItem.status === 'Awaiting Item' && (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Mark Item as Received
                        </Button>
                      )}
                      {returnItem.status === 'Item Received' && (
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          Process Refund
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Completed Returns Tab */}
          <TabsContent value="completed">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Return ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Original Order</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Buyer</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Product</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Reason</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Refund</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {completedReturns.map((returnItem) => (
                    <tr key={returnItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-semibold text-[#2D6A4F]">{returnItem.id}</td>
                      <td className="py-4 px-4 text-gray-700">{returnItem.originalOrder}</td>
                      <td className="py-4 px-4 text-gray-700">{returnItem.buyer}</td>
                      <td className="py-4 px-4 text-gray-900 font-medium">{returnItem.product}</td>
                      <td className="py-4 px-4 text-gray-700 text-sm">{returnItem.reason}</td>
                      <td className="py-4 px-4 font-semibold text-[#2D6A4F]">{returnItem.refundAmount}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            returnItem.status === 'Refunded'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {returnItem.status === 'Refunded' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                          {returnItem.status === 'Rejected' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                          {returnItem.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{returnItem.completedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
