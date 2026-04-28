import { SupplierSidebar } from '@/components/supplier-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, AlertCircle, Plus } from 'lucide-react';

export default function InventoryManagementPage() {
  const inventory = [
    {
      id: 1,
      product: 'Industrial Pump Unit',
      sku: 'IPU-001',
      category: 'Machinery',
      currentStock: 156,
      reorderLevel: 100,
      warehouseLocation: 'A-12-3',
      status: 'Adequate',
      lastUpdated: '2024-01-18',
    },
    {
      id: 2,
      product: 'Stainless Steel Pipe',
      sku: 'SSP-002',
      category: 'Materials',
      currentStock: 45,
      reorderLevel: 100,
      warehouseLocation: 'B-05-1',
      status: 'Low Stock',
      lastUpdated: '2024-01-17',
    },
    {
      id: 3,
      product: 'Electric Motor',
      sku: 'EM-003',
      category: 'Components',
      currentStock: 89,
      reorderLevel: 50,
      warehouseLocation: 'C-08-2',
      status: 'Adequate',
      lastUpdated: '2024-01-18',
    },
    {
      id: 4,
      product: 'Control Panel Assembly',
      sku: 'CPA-004',
      category: 'Electronics',
      currentStock: 8,
      reorderLevel: 50,
      warehouseLocation: 'D-03-5',
      status: 'Critical',
      lastUpdated: '2024-01-16',
    },
    {
      id: 5,
      product: 'Hydraulic Fluid (Gallon)',
      sku: 'HF-005',
      category: 'Fluids',
      currentStock: 0,
      reorderLevel: 200,
      warehouseLocation: 'E-01-1',
      status: 'Critical',
      lastUpdated: '2024-01-15',
    },
    {
      id: 6,
      product: 'Power Distribution Unit',
      sku: 'PDU-006',
      category: 'Electronics',
      currentStock: 34,
      reorderLevel: 75,
      warehouseLocation: 'A-14-4',
      status: 'Low Stock',
      lastUpdated: '2024-01-18',
    },
    {
      id: 7,
      product: 'Pressure Gauge',
      sku: 'PG-007',
      category: 'Instruments',
      currentStock: 245,
      reorderLevel: 100,
      warehouseLocation: 'F-02-3',
      status: 'Adequate',
      lastUpdated: '2024-01-18',
    },
    {
      id: 8,
      product: 'Temperature Sensor',
      sku: 'TS-008',
      category: 'Sensors',
      currentStock: 156,
      reorderLevel: 80,
      warehouseLocation: 'G-06-2',
      status: 'Adequate',
      lastUpdated: '2024-01-17',
    },
  ];

  const getStockStatus = (current: number, reorder: number) => {
    if (current === 0) return 'Critical';
    if (current < reorder) return current < reorder * 0.5 ? 'Critical' : 'Low Stock';
    return 'Adequate';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Adequate':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-500';
      case 'Low Stock':
        return 'bg-yellow-500';
      case 'Adequate':
        return 'bg-[#2D6A4F]';
      default:
        return 'bg-gray-500';
    }
  };

  // Stats
  const criticalCount = inventory.filter((i) => getStockStatus(i.currentStock, i.reorderLevel) === 'Critical').length;
  const lowStockCount = inventory.filter((i) => getStockStatus(i.currentStock, i.reorderLevel) === 'Low Stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * 100), 0); // Assuming $100 per unit average

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SupplierSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2D6A4F]">Inventory Management</h1>
            <p className="text-gray-600 mt-2">Monitor stock levels and warehouse locations</p>
          </div>
          <Button className="bg-[#2D6A4F] hover:bg-[#40916C] gap-2">
            <Plus className="w-4 h-4" />
            Add Stock
          </Button>
        </div>

        {/* Alert Cards */}
        {(criticalCount > 0 || lowStockCount > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {criticalCount > 0 && (
              <Card className="border-2 border-red-300 bg-red-50">
                <CardContent className="pt-6 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-900">Critical Stock Alert</h3>
                    <p className="text-red-800 text-sm mt-1">
                      {criticalCount} product(s) are critically low or out of stock. Immediate action required.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {lowStockCount > 0 && (
              <Card className="border-2 border-yellow-300 bg-yellow-50">
                <CardContent className="pt-6 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Low Stock Warning</h3>
                    <p className="text-yellow-800 text-sm mt-1">
                      {lowStockCount} product(s) are below reorder level. Consider placing orders.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total SKUs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2D6A4F]">{inventory.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#40916C]">
                {inventory.reduce((sum, i) => sum + i.currentStock, 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">In stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#52B788]">${(totalValue / 1000).toFixed(1)}k</div>
              <p className="text-xs text-gray-500 mt-1">Estimated value</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Stock Levels</CardTitle>
            <CardDescription>Track all products and warehouse locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Product</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">SKU</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Location</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Current Stock</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Reorder Level</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Stock Level</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const status = getStockStatus(item.currentStock, item.reorderLevel);
                    const stockPercentage = (item.currentStock / (item.reorderLevel * 1.5)) * 100;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.product}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700 font-mono">{item.sku}</td>
                        <td className="py-4 px-4 text-gray-700 font-mono">{item.warehouseLocation}</td>
                        <td className="py-4 px-4 font-semibold text-[#2D6A4F]">{item.currentStock}</td>
                        <td className="py-4 px-4 text-gray-700">{item.reorderLevel}</td>
                        <td className="py-4 px-4 flex-1">
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(stockPercentage, 100)} className="flex-1" />
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {Math.round(stockPercentage)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
