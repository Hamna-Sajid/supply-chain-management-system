'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Plus } from 'lucide-react';

const initialProducts = [
  { id: 'PRD-001', name: 'Electronic Widget A', sku: 'EW-001', status: 'Active', unitPrice: '$150.00' },
  { id: 'PRD-002', name: 'Mechanical Component B', sku: 'MC-002', status: 'Active', unitPrice: '$85.50' },
  { id: 'PRD-003', name: 'Circuit Board C', sku: 'CB-003', status: 'Discontinued', unitPrice: '$200.00' },
  { id: 'PRD-004', name: 'Assembly Unit D', sku: 'AU-004', status: 'Active', unitPrice: '$320.75' },
];

export default function ProductManagementPage() {
  const [products, setProducts] = useState(initialProducts);
  const [formData, setFormData] = useState({ name: '', sku: '', status: 'Active', unitPrice: '' });

  const handleAddProduct = () => {
    if (formData.name && formData.sku) {
      setProducts([...products, {
        id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
        ...formData
      }]);
      setFormData({ name: '', sku: '', status: 'Active', unitPrice: '' });
    }
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d6a4f]">Product Management</h1>
        <p className="text-gray-600 mt-2">Manage and organize your manufactured products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#2D6A4F]" />
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="SKU" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} style={{ borderColor: '#B7E4C7' }} />
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2" style={{ borderColor: '#B7E4C7' }}>
              <option>Active</option>
              <option>Inactive</option>
              <option>Discontinued</option>
            </select>
            <Input placeholder="Unit Price" value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: e.target.value})} style={{ borderColor: '#B7E4C7' }} />
            <Button onClick={handleAddProduct} className="w-full text-white" style={{ backgroundColor: '#2D6A4F' }}>Add Product</Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>{products.length} products total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">SKU</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Price</th>
                      <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{product.id}</td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.sku}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 rounded text-xs font-medium" style={{backgroundColor: product.status === 'Active' ? '#D8F3DC' : '#FEE2E2', color: product.status === 'Active' ? '#2D6A4F' : '#DC2626'}}>{product.status}</span></td>
                        <td className="py-3 px-4">{product.unitPrice}</td>
                        <td className="py-3 px-4 text-center flex gap-2 justify-center">
                          <button className="p-1 hover:bg-blue-100 rounded"><Edit2 className="w-4 h-4 text-blue-600" /></button>
                          <button onClick={() => handleDelete(product.id)} className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
