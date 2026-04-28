'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';

interface DashboardData {
  products_in_production: number;
  finished_goods_stock: number;
  total_orders: number;
  total_shipments: number;
}

const initialRawMaterials = [
  { id: 'MAT-001', name: 'Steel Sheets', supplier: 'Steel Co', price: '$120/unit', rating: 4.8, type: 'Metal' },
  { id: 'MAT-002', name: 'Aluminum Bars', supplier: 'Aluminum Ltd', price: '$85/unit', rating: 4.6, type: 'Metal' },
  { id: 'MAT-003', name: 'Copper Wire', supplier: 'Copper Works', price: '$45/unit', rating: 4.9, type: 'Metal' },
  { id: 'MAT-004', name: 'Plastic Pellets', supplier: 'Polymer Co', price: '$25/unit', rating: 4.3, type: 'Plastic' },
  { id: 'MAT-005', name: 'Electronic Components', supplier: 'E-Comp Ltd', price: '$150/unit', rating: 4.7, type: 'Electronics' },
  { id: 'MAT-006', name: 'Rubber Seals', supplier: 'Seal Works', price: '$15/unit', rating: 4.5, type: 'Rubber' },
  { id: 'MAT-007', name: 'Fasteners Pack', supplier: 'FastBolt Inc', price: '$30/unit', rating: 4.4, type: 'Hardware' },
  { id: 'MAT-008', name: 'Insulation Material', supplier: 'InsuCorp', price: '$55/unit', rating: 4.6, type: 'Materials' },
];

const shipmentsInTransit = [
  { id: 'SHIP-001', destination: 'Warehouse A', items: 250, eta: '2024-01-20' },
  { id: 'SHIP-002', destination: 'Warehouse B', items: 180, eta: '2024-01-22' },
  { id: 'SHIP-003', destination: 'Warehouse C', items: 320, eta: '2024-01-25' },
];

export default function ManufacturerDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await manufacturerApi.getDashboard();
        setDashboard(data);
      } catch (error: unknown) {
        setError(
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as any).message)
            : 'Unable to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const filteredMaterials = initialRawMaterials.filter((material) => {
    const query = searchQuery.toLowerCase();
    return (
      material.name.toLowerCase().includes(query) ||
      material.supplier.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / itemsPerPage));
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#2d6a4f' }}>Manufacturing Dashboard</h1>
        <p style={{ color: '#74c69d' }} className="mt-2">Monitor production, materials, and shipments</p>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card style={{ borderLeft: '4px solid #52b788' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#2d6a4f' }}>Products in Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#52b788' }}>
              {loading ? '...' : dashboard?.products_in_production ?? 0}
            </div>
            <p className="text-xs mt-1" style={{ color: '#74c69d' }}>Currently being manufactured</p>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: '4px solid #40916c' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#2d6a4f' }}>Pending Material Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#40916c' }}>
              {loading ? '...' : dashboard?.total_orders ?? 0}
            </div>
            <p className="text-xs mt-1" style={{ color: '#74c69d' }}>Awaiting supplier shipment</p>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: '4px solid #95d5b2' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#2d6a4f' }}>Finished Goods in Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#95d5b2' }}>
              {loading ? '...' : dashboard?.finished_goods_stock ?? 0}
            </div>
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
              <p className="text-sm text-gray-500">This section is still using sample production data, but the dashboard metrics are now loaded from the backend.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#2d6a4f' }}>Shipments In Transit</CardTitle>
            <CardDescription>Warehouse operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shipmentsInTransit.map((shipment) => (
              <div key={shipment.id} className="p-4 rounded-lg" style={{ backgroundColor: '#d8f3dc' }}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium" style={{ color: '#2d6a4f' }}>{shipment.id}</h4>
                  <span className="text-xs font-semibold" style={{ color: '#40916c' }}>ETA: {shipment.eta}</span>
                </div>
                <p className="text-sm" style={{ color: '#74c69d' }}>To: {shipment.destination}</p>
                <p className="text-sm mt-1" style={{ color: '#74c69d' }}>{shipment.items} items</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#2d6a4f' }}>Browse Raw Materials</CardTitle>
          <CardDescription>Search and order materials from suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5" style={{ color: '#74c69d' }} />
              <Input
                placeholder="Search by material name or supplier..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
                style={{ borderColor: '#b7e4c7', color: '#2d6a4f' }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottomColor: '#d8f3dc', borderBottomWidth: '2px' }}>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Material Name</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Type</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Price</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Rating</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: '#2d6a4f' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMaterials.map((material) => (
                  <tr key={material.id} style={{ borderBottomColor: '#f0f0f0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{material.name}</td>
                    <td className="py-3 px-4">{material.supplier}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#d8f3dc', color: '#2d6a4f' }}>
                        {material.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold" style={{ color: '#40916c' }}>{material.price}</td>
                    <td className="py-3 px-4" style={{ color: '#74c69d' }}>
                      <span>★ {material.rating}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        style={{ backgroundColor: '#52b788', color: 'white' }}
                        className="hover:opacity-90"
                      >
                        Place Order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p style={{ color: '#74c69d' }} className="text-sm">
              Page {currentPage} of {totalPages} ({filteredMaterials.length} results)
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  backgroundColor: currentPage === 1 ? '#b7e4c7' : '#52b788',
                  color: 'white',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  backgroundColor: currentPage === totalPages ? '#b7e4c7' : '#52b788',
                  color: 'white',
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
