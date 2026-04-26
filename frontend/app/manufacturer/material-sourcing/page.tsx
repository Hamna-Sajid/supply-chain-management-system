'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Check } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';

export default function MaterialSourcingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await manufacturerApi.getRawMaterials();
      // Add local state for the cart
      const materialsWithCart = (res.materials || []).map((m: any) => ({ ...m, inCart: false }));
      setSupplierList(materialsWithCart);
    } catch (err: any) {
      setError('Failed to fetch materials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = supplierList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.supplier_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (id: string) => {
    setSupplierList(supplierList.map(s => 
      s._id === id ? { ...s, inCart: !s.inCart } : s
    ));
  };

  const handleCheckout = async () => {
    const itemsInCart = supplierList.filter(s => s.inCart);
    if (itemsInCart.length === 0) return;

    // Group items by supplier
    const ordersBySupplier = itemsInCart.reduce((acc: any, item: any) => {
      const supId = item.supplier_id?._id || item.supplier_id;
      if (!acc[supId]) acc[supId] = [];
      acc[supId].push({ material_id: item._id, quantity: 100 }); // default qty for demo
      return acc;
    }, {});

    try {
      setPlacingOrder(true);
      setError('');
      for (const supplierId of Object.keys(ordersBySupplier)) {
        await manufacturerApi.placeOrder({
          supplier_id: supplierId,
          shipping_address: 'Main Manufacturing Plant, Sector A',
          items: ordersBySupplier[supplierId]
        });
      }
      // Reset cart
      setSupplierList(supplierList.map(s => ({ ...s, inCart: false })));
      alert('Order(s) placed successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order.');
      console.error(err);
    } finally {
      setPlacingOrder(false);
    }
  };

  const cartCount = supplierList.filter(s => s.inCart).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Material Sourcing</h1>
        <p className="text-gray-600 mt-2">Browse and purchase raw materials from suppliers</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <Card className="shadow-sm mb-6">
        <CardHeader>
          <CardTitle>Browse Suppliers</CardTitle>
          <CardDescription>Find materials from verified suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by material or supplier name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-slate-800 text-white hover:bg-slate-700">
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Material</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Stock</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map(item => (
                  <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 font-medium">{item.supplier_id?.name || 'Unknown Supplier'}</td>
                    <td className="py-3 px-4 text-gray-700">{item.name}</td>
                    <td className="py-3 px-4 text-blue-600 font-semibold">${item.price_per_unit} / {item.unit}</td>
                    <td className="py-3 px-4 text-gray-700">{item.quantity_available} {item.unit}</td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item._id)}
                        variant={item.inCart ? "default" : "outline"}
                        className={`flex items-center gap-1 mx-auto ${item.inCart ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                      >
                        {item.inCart ? (
                          <><Check className="w-4 h-4" /> Added</>
                        ) : (
                          <><Plus className="w-4 h-4" /> Add to Order</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">No materials found in the supplier catalog.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {cartCount > 0 && (
            <div className="mt-6 p-4 rounded-lg flex items-center justify-between bg-blue-50 border border-blue-200">
              <p className="text-blue-800 font-semibold">{cartCount} item(s) selected for ordering. (Default qty: 100)</p>
              <Button onClick={handleCheckout} disabled={placingOrder} className="bg-blue-600 hover:bg-blue-700 text-white">
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
