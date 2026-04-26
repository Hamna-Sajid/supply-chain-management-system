'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';

export default function ProductionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', quantity: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await manufacturerApi.getProducts();
      setProducts(res.products || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.quantity) return;
    try {
      setIsSubmitting(true);
      setError('');
      await manufacturerApi.createProduct({
        name: formData.name,
        quantity: parseInt(formData.quantity, 10),
      });
      setFormData({ name: '', quantity: '' });
      await fetchProducts(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await manufacturerApi.deleteProduct(id);
      await fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Production Pipeline</h1>
        <p className="text-gray-600 mt-2">Manage products currently in production</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-slate-800" />
              Start Production
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              placeholder="Product Name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
            <Input 
              type="number"
              placeholder="Quantity" 
              value={formData.quantity} 
              onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
            />
            <Button 
              onClick={handleAddProduct} 
              disabled={isSubmitting || !formData.name || !formData.quantity}
              className="w-full text-white bg-slate-800 hover:bg-slate-700"
            >
              {isSubmitting ? 'Adding...' : 'Add to Production'}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Active Production Batches</CardTitle>
              <CardDescription>{products.length} products total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Product Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Stage</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Quantity Target</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{product.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                            product.production_stage === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {product.production_stage}
                          </span>
                        </td>
                        <td className="py-3 px-4">{product.quantity}</td>
                        <td className="py-3 px-4 text-center">
                          <button 
                            onClick={() => handleDelete(product._id)} 
                            className="p-2 hover:bg-red-100 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-500">No active products in production.</td>
                      </tr>
                    )}
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