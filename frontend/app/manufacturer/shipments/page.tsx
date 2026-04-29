'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';
import { toast } from 'sonner';

interface Shipment {
  shipment_id: string;
  warehouse_name: string;
  product_name: string;
  quantity: number;
  estimated_delivery: string | null;
  actual_date_delivered: string | null;
  status: string; // preparing | in_transit | delivered
}

// Map backend status → display label
const STATUS_LABEL: Record<string, string> = {
  preparing: 'Processing',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};

const STATUS_NEXT: Record<string, string> = {
  preparing: 'in_transit',
  in_transit: 'delivered',
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'delivered': return '#D8F3DC';
    case 'in_transit': return '#DBEAFE';
    case 'preparing': return '#FEF3C7';
    default: return '#FEE2E2';
  }
};
const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered': return '#2D6A4F';
    case 'in_transit': return '#2563EB';
    case 'preparing': return '#D97706';
    default: return '#DC2626';
  }
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchShipments = async () => {
    try {
      const data = await manufacturerApi.getShipments();
      setShipments(data);
    } catch {
      toast.error('Failed to load shipments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  // Auto-refresh when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchShipments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleUpdateStatus = async (shipment: Shipment) => {
    const nextStatus = STATUS_NEXT[shipment.status];
    if (!nextStatus) return;

    setUpdating(shipment.shipment_id);
    try {
      // Optimistically update UI
      setShipments(prev => prev.map(s =>
        s.shipment_id === shipment.shipment_id ? { ...s, status: nextStatus } : s
      ));

      await manufacturerApi.updateShipmentStatus(shipment.shipment_id, nextStatus);
      toast.success(`${shipment.shipment_id.slice(0, 8).toUpperCase()} → ${STATUS_LABEL[nextStatus]}`);

      // Verify by fetching fresh data
      await fetchShipments();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to update status.');
      // Revert optimistic update on error
      await fetchShipments();
    } finally {
      setUpdating(null);
    }
  };

  // Count for dashboard-like summary
  const inTransitCount = shipments.filter(s => s.status === 'in_transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d6a4f]">Warehouse Shipments</h1>
        <p className="text-gray-600 mt-2">Monitor shipments to warehouse locations</p>
      </div>

      {/* Summary cards — in transit count updates when statuses change */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card style={{ borderLeft: '4px solid #2563EB' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{loading ? '…' : inTransitCount}</div>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2D6A4F]">{loading ? '…' : deliveredCount}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading shipments…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {shipments.slice(0, 6).map(s => (
              <Card key={s.shipment_id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#2D6A4F]" />
                    {s.shipment_id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-semibold text-gray-900">{s.warehouse_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-semibold text-gray-900">{s.product_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-semibold text-gray-900">{s.quantity} units</p>
                  </div>
                  {s.estimated_delivery && (
                    <div>
                      <p className="text-sm text-gray-600">ETA</p>
                      <p className="font-semibold text-gray-900">{new Date(s.estimated_delivery).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: getStatusBg(s.status), color: getStatusColor(s.status) }}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </div>
                  {s.status !== 'delivered' && (
                    <Button
                      onClick={() => handleUpdateStatus(s)}
                      disabled={updating === s.shipment_id}
                      className="w-full text-white"
                      style={{ backgroundColor: '#40916C' }}
                    >
                      {updating === s.shipment_id ? 'Updating…' : `Mark ${STATUS_LABEL[STATUS_NEXT[s.status]]}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full timeline table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>All Shipments</CardTitle>
              <CardDescription>{shipments.length} total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shipments.map(s => (
                  <div key={s.shipment_id} className="flex items-center gap-4 p-4 rounded-lg"
                    style={{ backgroundColor: '#F9F9F9', borderColor: '#B7E4C7', borderWidth: '1px' }}>
                    {s.status === 'delivered'
                      ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      : <Truck className="w-6 h-6 text-[#2D6A4F] flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{s.shipment_id.slice(0, 8).toUpperCase()} → {s.warehouse_name}</p>
                      <p className="text-sm text-gray-600">{s.product_name} • {s.quantity} units{s.estimated_delivery ? ` • ETA: ${new Date(s.estimated_delivery).toLocaleDateString()}` : ''}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: getStatusBg(s.status), color: getStatusColor(s.status) }}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </div>
                ))}
                {shipments.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No shipments found.</p>}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}