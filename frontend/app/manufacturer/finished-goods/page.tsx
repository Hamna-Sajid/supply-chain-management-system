'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, TrendingUp } from 'lucide-react';

const finishedGoods = [
  { id: 'FG-001', product: 'Electronic Widget A', quantity: 450, warehouse: 'Main', readyToShip: true, lastUpdated: '2024-01-15' },
  { id: 'FG-002', product: 'Mechanical Component B', quantity: 320, warehouse: 'North', readyToShip: true, lastUpdated: '2024-01-14' },
  { id: 'FG-003', product: 'Circuit Board C', quantity: 280, warehouse: 'South', readyToShip: false, lastUpdated: '2024-01-13' },
  { id: 'FG-004', product: 'Assembly Unit D', quantity: 210, warehouse: 'Main', readyToShip: true, lastUpdated: '2024-01-12' },
];

export default function FinishedGoodsPage() {
  const [goods, setGoods] = useState(finishedGoods);
  const readyCount = goods.filter(g => g.readyToShip).length;

  const handleShip = (id: string) => {
    setGoods(goods.map(g => g.id === id ? { ...g, readyToShip: !g.readyToShip } : g));
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d6a4f]">Finished Goods</h1>
        <p className="text-gray-600 mt-2">Track and manage finished products ready for shipment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm" style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Finished Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-[#2D6A4F]">{goods.reduce((sum, g) => sum + g.quantity, 0)}</div>
              <Package className="w-10 h-10 text-[#D8F3DC]" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderLeft: '4px solid #40916C' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Ready to Ship</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-[#40916C]">{readyCount}</div>
              <TrendingUp className="w-10 h-10 text-[#D8F3DC]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Finished Goods Inventory</CardTitle>
          <CardDescription>Products ready for distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Warehouse</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Action</th>
                </tr>
              </thead>
              <tbody>
                {goods.map(good => (
                  <tr key={good.id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{good.id}</td>
                    <td className="py-3 px-4">{good.product}</td>
                    <td className="py-3 px-4">{good.quantity} units</td>
                    <td className="py-3 px-4">{good.warehouse}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded text-xs font-medium" style={{backgroundColor: good.readyToShip ? '#D8F3DC' : '#FEF3C7', color: good.readyToShip ? '#2D6A4F' : '#D97706'}}>{good.readyToShip ? 'Ready' : 'Processing'}</span></td>
                    <td className="py-3 px-4 text-center">
                      <Button size="sm" onClick={() => handleShip(good.id)} style={{ backgroundColor: '#40916C', color: 'white' }} className="hover:opacity-90">
                        {good.readyToShip ? 'Mark Processing' : 'Mark Ready'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
