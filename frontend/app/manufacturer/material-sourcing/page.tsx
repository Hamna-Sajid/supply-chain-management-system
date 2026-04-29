'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';
import { toast } from 'sonner';

interface RawMaterial {
  material_id: string;
  material_name: string;
  supplier_id: string;
  supplier_name: string;
  unit_price: number;
  avg_rating: string;
  quantity_available: number;
  description: string;
}

export default function MaterialSourcingPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderDialog, setOrderDialog] = useState<RawMaterial | null>(null);
  const [orderQty, setOrderQty] = useState('1');
  const [orderAddress, setOrderAddress] = useState('Manufacturing Plant');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    manufacturerApi.getRawMaterials()
      .then(setMaterials)
      .catch(() => toast.error('Failed to load materials.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter(m => {
    const q = searchQuery.toLowerCase();
    return m.material_name.toLowerCase().includes(q) || m.supplier_name.toLowerCase().includes(q);
  });

  const handleConfirmOrder = async () => {
    if (!orderDialog) return;
    const qty = parseInt(orderQty);
    if (!qty || qty < 1) { toast.error('Enter a valid quantity.'); return; }
    if (!orderAddress.trim()) { toast.error('Enter a shipping address.'); return; }

    setSubmitting(true);
    try {
      await manufacturerApi.placeOrder({
        supplier_id: orderDialog.supplier_id,
        shipping_address: orderAddress,
        items: [{
          material_id: orderDialog.material_id,
          quantity: qty,
          unit_price: orderDialog.unit_price,
        }],
      });
      toast.success(`Order placed: ${qty}x ${orderDialog.material_name}`);
      setOrderDialog(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d6a4f]">Material Sourcing</h1>
        <p className="text-gray-600 mt-2">Browse and purchase raw materials from suppliers</p>
      </div>

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
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400">Loading materials…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Supplier</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Material</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Available</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Rating</th>
                    <th className="text-center py-3 px-4 font-semibold text-[#2D6A4F]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m.material_id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{m.supplier_name}</td>
                      <td className="py-3 px-4 text-gray-700">{m.material_name}</td>
                      <td className="py-3 px-4 text-gray-600">{m.quantity_available} units</td>
                      <td className="py-3 px-4 text-[#2D6A4F] font-semibold">${m.unit_price.toFixed(2)}/unit</td>
                      <td className="py-3 px-4 text-gray-700">★ {m.avg_rating}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          onClick={() => { setOrderDialog(m); setOrderQty('1'); }}
                          style={{ backgroundColor: '#2D6A4F', color: 'white' }}
                          className="hover:opacity-90"
                        >
                          Place Order
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-gray-400">No materials found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Dialog */}
      <Dialog open={!!orderDialog} onOpenChange={open => !open && setOrderDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Order — {orderDialog?.material_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Supplier: <span className="font-medium text-gray-800">{orderDialog?.supplier_name}</span></p>
              <p className="text-sm text-gray-600 mb-1">Unit Price: <span className="font-medium text-[#2D6A4F]">${orderDialog?.unit_price.toFixed(2)}</span></p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Quantity</label>
              <Input type="number" min={1} value={orderQty} onChange={e => setOrderQty(e.target.value)} style={{ borderColor: '#B7E4C7' }} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Shipping Address</label>
              <Input value={orderAddress} onChange={e => setOrderAddress(e.target.value)} style={{ borderColor: '#B7E4C7' }} />
            </div>
            {orderDialog && orderQty && (
              <p className="text-sm text-[#2D6A4F] font-semibold">
                Total: ${(orderDialog.unit_price * parseInt(orderQty || '0')).toFixed(2)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialog(null)}>Cancel</Button>
            <Button disabled={submitting} onClick={handleConfirmOrder} style={{ backgroundColor: '#2D6A4F', color: 'white' }}>
              {submitting ? 'Placing…' : 'Confirm Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
