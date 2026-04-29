'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, TrendingUp } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';
import { toast } from 'sonner';

interface InventoryItem {
  inventory_id: string;
  product_id: string;
  product_name: string;
  category: string;
  production_stage: string;
  quantity_available: number;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
  last_restocked: string | null;
}

interface Warehouse {
  user_id: string;
  name: string;
  address: string;
  contact_number: string;
  avg_rating: string;
  rating_count: number;
}

export default function FinishedGoodsPage() {
  const [goods, setGoods] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipmentDialog, setShipmentDialog] = useState<InventoryItem | null>(null);
  const [shipmentData, setShipmentData] = useState({
    warehouse_id: '',
    quantity: '1',
    shipping_address: '',
    expected_delivery_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const [data, warehouseData] = await Promise.all([
        manufacturerApi.getInventory(),
        manufacturerApi.getWarehouses()
      ]);
      setGoods(data);
      setWarehouses(warehouseData);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const totalUnits = goods.reduce((sum, g) => sum + g.quantity_available, 0);
  const readyCount = goods.filter(g => g.production_stage === 'completed').length;

  const handleMarkReady = async (item: InventoryItem) => {
    try {
      await manufacturerApi.updateProductStage(item.product_id, 'completed');
      toast.success(`${item.product_name} marked as Ready!`);
      fetchInventory();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to update status.');
    }
  };

  const handleShipClick = (item: InventoryItem) => {
    setShipmentDialog(item);
    setShipmentData({
      warehouse_id: '',
      quantity: Math.min(1, item.quantity_available).toString(),
      shipping_address: '',
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleConfirmShipment = async () => {
    if (!shipmentDialog) return;
    const qty = parseInt(shipmentData.quantity);
    if (!qty || qty < 1 || qty > shipmentDialog.quantity_available) {
      toast.error('Enter a valid quantity.');
      return;
    }
    if (!shipmentData.warehouse_id) {
      toast.error('Select a warehouse.');
      return;
    }
    if (!shipmentData.shipping_address.trim()) {
      toast.error('Enter a shipping address.');
      return;
    }
    if (!shipmentData.expected_delivery_date) {
      toast.error('Select an expected delivery date.');
      return;
    }

    setSubmitting(true);
    try {
      await manufacturerApi.createShipment({
        warehouse_id: shipmentData.warehouse_id,
        product_id: shipmentDialog.product_id,
        quantity: qty,
        shipping_address: shipmentData.shipping_address,
        expected_delivery_date: shipmentData.expected_delivery_date
      });
      toast.success(`Shipment created: ${qty}x ${shipmentDialog.product_name}`);
      setShipmentDialog(null);
      fetchInventory();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to create shipment.');
    } finally {
      setSubmitting(false);
    }
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
              <div className="text-3xl font-bold text-[#2D6A4F]">{loading ? '…' : totalUnits}</div>
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
              <div className="text-3xl font-bold text-[#40916C]">{loading ? '…' : readyCount}</div>
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
          {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Selling Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {goods.map(g => {
                    const isReady = g.production_stage === 'completed';
                    return (
                      <tr key={g.inventory_id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{g.product_name}</td>
                        <td className="py-3 px-4 text-gray-600">{g.category || '—'}</td>
                        <td className="py-3 px-4">{g.quantity_available} units</td>
                        <td className="py-3 px-4 text-[#2D6A4F]">${g.selling_price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs font-medium"
                            style={{ backgroundColor: isReady ? '#D8F3DC' : '#FEF3C7', color: isReady ? '#2D6A4F' : '#D97706' }}>
                            {isReady ? 'Ready' : 'Processing'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center flex gap-2 justify-center">
                          {!isReady && (
                            <Button size="sm" onClick={() => handleMarkReady(g)}
                              style={{ backgroundColor: '#40916C', color: 'white' }} className="hover:opacity-90">
                              Mark Ready
                            </Button>
                          )}
                          {isReady && g.quantity_available > 0 && (
                            <Button size="sm" onClick={() => handleShipClick(g)}
                              style={{ backgroundColor: '#2D6A4F', color: 'white' }} className="hover:opacity-90">
                              Ship
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {goods.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-gray-400">No finished goods in inventory.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!shipmentDialog} onOpenChange={(open) => !open && setShipmentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ship to Warehouse</DialogTitle>
          </DialogHeader>
          {shipmentDialog && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product</label>
                <p className="text-gray-600">{shipmentDialog.product_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Available Quantity</label>
                <p className="text-gray-600">{shipmentDialog.quantity_available} units</p>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity to Ship</label>
                <Input type="number" min="1" max={shipmentDialog.quantity_available}
                  value={shipmentData.quantity}
                  onChange={(e) => setShipmentData({ ...shipmentData, quantity: e.target.value })}
                  placeholder="1" />
              </div>
              <div>
                <label className="text-sm font-medium">Select Warehouse</label>
                <Select value={shipmentData.warehouse_id} onValueChange={(value) => setShipmentData({ ...shipmentData, warehouse_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.user_id} value={w.user_id}>{w.name} ({w.address})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Shipping Address</label>
                <Input value={shipmentData.shipping_address}
                  onChange={(e) => setShipmentData({ ...shipmentData, shipping_address: e.target.value })}
                  placeholder="Enter shipping address" />
              </div>
              <div>
                <label className="text-sm font-medium">Expected Delivery Date</label>
                <Input type="date" value={shipmentData.expected_delivery_date}
                  onChange={(e) => setShipmentData({ ...shipmentData, expected_delivery_date: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipmentDialog(null)}>Cancel</Button>
            <Button onClick={handleConfirmShipment} disabled={submitting}
              style={{ backgroundColor: '#2D6A4F', color: 'white' }}>
              {submitting ? 'Creating...' : 'Confirm Shipment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}