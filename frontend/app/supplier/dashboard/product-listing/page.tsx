import { SupplierSidebar } from '@/components/supplier-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';

export default function ProductListingPage() {
  const products = [
    {
      id: 1,
      name: 'Industrial Pump Unit',
      category: 'Machinery',
      sku: 'IPU-001',
      price: '$450',
      stock: 156,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Stainless Steel Pipe',
      category: 'Materials',
      sku: 'SSP-002',
      price: '$75',
      stock: 450,
      status: 'Active',
    },
    {
      id: 3,
      name: 'Electric Motor',
      category: 'Components',
      sku: 'EM-003',
      price: '$320',
      stock: 89,
      status: 'Active',
    },
    {
      id: 4,
      name: 'Control Panel Assembly',
      category: 'Electronics',
      sku: 'CPA-004',
      price: '$1,200',
      stock: 23,
      status: 'Low Stock',
    },
    {
      id: 5,
      name: 'Hydraulic Fluid (Gallon)',
      category: 'Fluids',
      sku: 'HF-005',
      price: '$45',
      stock: 0,
      status: 'Out of Stock',
    },
    {
      id: 6,
      name: 'Power Distribution Unit',
      category: 'Electronics',
      sku: 'PDU-006',
      price: '$2,500',
      stock: 12,
      status: 'Low Stock',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SupplierSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2D6A4F]">Product Listing</h1>
            <p className="text-gray-600 mt-2">Manage your product catalog</p>
          </div>
          <Button className="bg-[#2D6A4F] hover:bg-[#40916C] gap-2">
            <Plus className="w-4 h-4" />
            Add New Product
          </Button>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search products by name or SKU..."
                  className="pl-10"
                />
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:border-[#2D6A4F] focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]">
                <option value="">All Categories</option>
                <option value="machinery">Machinery</option>
                <option value="materials">Materials</option>
                <option value="components">Components</option>
                <option value="electronics">Electronics</option>
                <option value="fluids">Fluids</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:border-[#2D6A4F] focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow border-t-4 border-t-[#2D6A4F]"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-[#2D6A4F]">{product.name}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      product.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'Low Stock'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Price</span>
                    <span className="font-bold text-[#2D6A4F]">{product.price}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Category</span>
                    <span className="text-gray-700">{product.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Stock</span>
                    <span className="font-semibold text-gray-700">{product.stock} units</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#40916C] text-[#40916C] hover:bg-[#40916C] hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
