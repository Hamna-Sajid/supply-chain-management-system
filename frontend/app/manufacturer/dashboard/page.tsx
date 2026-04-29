'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, ChevronLeft, Truck } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';
import { toast } from 'sonner';

interface DashboardData {
  products_in_production: number;
  finished_goods_stock: number;
  total_orders: number;
  total_shipments: number;
}

interface RawMaterial {
  material_id: string;
  material_name: string;
  supplier_id: string;
  supplier_name: string;
  unit_price: number;
  avg_rating: string;
  quantity_available: number;
}

interface Product {
  product_id: string;
  product_name: string;
  production_stage: string;
  category: string;
}

interface Shipment {
  shipment_id: string;
  warehouse_name: string;
  quantity: number;
  estimated_delivery: string;
  status: string;
}

const STAGE_COLORS: Record<string, string> = {
  design: '#DBEAFE', cutting: '#FEF3C7', sewing: '#F3E8FF',
  quality: '#FED7AA', packaging: '#D1FAE5', completed: '#D8F3DC',
};
const STAGE_TEXT: Record<string, string> = {
  design: '#1D4ED8', cutting: '#D97706', sewing: '#7C3AED',
  quality: '#EA580C', packaging: '#059669', completed: '#2D6A4F',
};

export default function ManufacturerDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [placingOrder, setPlacingOrder] = useState<string | null>(null);
  const itemsPerPage = 5;

  const fetchAll = useCallback(async () => {
    try {
      const [dash, mats, prods, ships] = await Promise.all([
        manufacturerApi.getDashboard(),
        manufacturerApi.getRawMaterials(),
        manufacturerApi.getProducts(),
        manufacturerApi.getShipments(),
      ]);
      setDashboard(dash);
      setMaterials(mats);
      setProducts(prods.filter((p: Product) => p.production_stage !== 'completed'));
      setShipments(ships.filter((s: Shipment) => s.status === 'in_transit').slice(0, 3));
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePlaceOrder = async (material: RawMaterial) => {
    if (!material.supplier_id) { toast.error('No supplier linked to this material.'); return; }
    setPlacingOrder(material.material_id);
    try {
      await manufacturerApi.placeOrder({
        supplier_id: material.supplier_id,
        shipping_address: 'Manufacturing Plant',
        items: [{ material_id: material.material_id, quantity: 1, unit_price: material.unit_price }],
      });
      toast.success(`Order placed for ${material.material_name}!`);
      const dash = await manufacturerApi.getDashboard();
      setDashboard(dash);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to place order.');
    } finally {
      setPlacingOrder(null);
    }
  };

  const filteredMaterials = materials.filter(m => {
    const q = searchQuery.toLowerCase();
    return m.material_name.toLowerCase().includes(q) || m.supplier_name.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / itemsPerPage));
  const paginatedMaterials = filteredMaterials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#2d6a4f' }}>Manufacturing Dashboard</h1>
        <p style={{ color: '#74c69d' }} className="mt-2">Monitor production, materials, and shipments</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card style={{ borderLeft: '4px solid #52b788' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#2d6a4f' }}>Products in Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#52b788' }}>{loading ? '...' : dashboard?.products_in_production ?? 0}</div>
            <p className="text-xs mt-1" style={{ color: '#74c69d' }}>Currently being manufactured</p>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #40916c' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#2d6a4f' }}>Pending Material Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#40916c' }}>{loading ? '...' : dashboard?.total_orders ?? 0}</div>
            <p className="text-xs mt-1" style={{ color: '#74c69d' }}>Awaiting supplier shipment</p>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #95d5b2' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#2d6a4f' }}>Finished Goods in Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#95d5b2' }}>{loading ? '...' : dashboard?.finished_goods_stock ?? 0}</div>
            <p className="text-xs mt-1" style={{ color: '#74c69d' }}>Ready for distribution</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#2d6a4f' }}>Production Status</CardTitle>
              <CardDescription>Current production queue</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <p className="text-sm text-gray-400">Loading…</p>
                : products.length === 0 ? <p className="text-sm text-gray-400">No products currently in production.</p>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottomColor: '#d8f3dc', borderBottomWidth: '2px' }}>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#2d6a4f' }}>Product</th>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#2d6a4f' }}>Category</th>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#2d6a4f' }}>Stage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.product_id} style={{ borderBottomColor: '#f0f0f0', borderBottomWidth: '1px' }}>
                            <td className="py-2 px-3 font-medium">{p.product_name}</td>
                            <td className="py-2 px-3 text-gray-600">{p.category || '—'}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-1 rounded text-xs font-semibold capitalize"
                                style={{ backgroundColor: STAGE_COLORS[p.production_stage] ?? '#f0f0f0', color: STAGE_TEXT[p.production_stage] ?? '#333' }}>
                                {p.production_stage}
                              </span>
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

        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#2d6a4f' }}>Shipments In Transit</CardTitle>
            <CardDescription>{loading ? '…' : `${shipments.length} active`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <p className="text-sm text-gray-400">Loading…</p>
              : shipments.length === 0 ? <p className="text-sm text-gray-400">No shipments in transit.</p>
              : shipments.map(s => (
                <div key={s.shipment_id} className="p-4 rounded-lg" style={{ backgroundColor: '#d8f3dc' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm" style={{ color: '#2d6a4f' }}>
                      <Truck className="inline w-3 h-3 mr-1" />{s.shipment_id.slice(0, 8).toUpperCase()}
                    </h4>
                    {s.estimated_delivery && (
                      <span className="text-xs font-semibold" style={{ color: '#40916c' }}>
                        ETA: {new Date(s.estimated_delivery).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: '#74c69d' }}>To: {s.warehouse_name}</p>
                  <p className="text-sm mt-1" style={{ color: '#74c69d' }}>{s.quantity} items</p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#2d6a4f' }}>Browse Raw Materials</CardTitle>
          <CardDescription>Search and place orders from suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5" style={{ color: '#74c69d' }} />
              <Input placeholder="Search by material name or supplier..." value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10" style={{ borderColor: '#b7e4c7', color: '#2d6a4f' }} />
            </div>
          </div>
          {loading ? <p className="text-sm text-gray-400">Loading materials…</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: '#d8f3dc', borderBottomWidth: '2px' }}>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Material Name</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Supplier</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Price</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Rating</th>
                    <th className="text-center py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMaterials.map(m => (
                    <tr key={m.material_id} style={{ borderBottomColor: '#f0f0f0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{m.material_name}</td>
                      <td className="py-3 px-4">{m.supplier_name}</td>
                      <td className="py-3 px-4 font-semibold" style={{ color: '#40916c' }}>${m.unit_price.toFixed(2)}/unit</td>
                      <td className="py-3 px-4" style={{ color: '#74c69d' }}>★ {m.avg_rating}</td>
                      <td className="py-3 px-4 text-center">
                        <Button size="sm" disabled={placingOrder === m.material_id}
                          onClick={() => handlePlaceOrder(m)}
                          style={{ backgroundColor: '#52b788', color: 'white' }} className="hover:opacity-90">
                          {placingOrder === m.material_id ? 'Placing…' : 'Place Order'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {paginatedMaterials.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-gray-400">No materials found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between mt-6">
            <p style={{ color: '#74c69d' }} className="text-sm">Page {currentPage} of {totalPages} ({filteredMaterials.length} results)</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{ backgroundColor: currentPage === 1 ? '#b7e4c7' : '#52b788', color: 'white' }}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                style={{ backgroundColor: currentPage === totalPages ? '#b7e4c7' : '#52b788', color: 'white' }}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}