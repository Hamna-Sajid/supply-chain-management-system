'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, Package } from 'lucide-react';
import api from '@/lib/api'; // direct api access needed for put

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manufacturer/shipments');
      setShipments(res.data.shipments || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch shipments.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, currentStatus: string) => {
    const statusFlow = ['pending', 'processing', 'in_transit', 'delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return;
    
    const nextStatus = statusFlow[currentIndex + 1];
    
    try {
      setUpdating(id);
      await api.put(`/manufacturer/shipments/${id}/status`, { status: nextStatus });
      await fetchShipments();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update shipment status.');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"/></div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Warehouse Shipments</h1>
        <p className="text-gray-600 mt-2">Monitor finished goods sent to warehouses</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {shipments.map(shipment => (
          <Card key={shipment._id} className="shadow-sm border border-slate-200">
            <CardHeader className="pb-3 bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Truck className="w-4 h-4" />
                {shipment._id.substring(0, 8).toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Destination</p>
                <p className="font-semibold text-gray-900">{shipment.warehouse_id?.name || 'Unknown Warehouse'}</p>
                <p className="text-sm text-gray-600">{shipment.warehouse_id?.location || ''}</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Product</p>
                  <p className="font-semibold text-gray-900">{shipment.inventory_id?.product_id?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{shipment.quantity} units</p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(shipment.status)}`}>
                    {shipment.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              {shipment.status !== 'delivered' && (
                <Button 
                  onClick={() => updateStatus(shipment._id, shipment.status)} 
                  disabled={updating === shipment._id}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                >
                  {updating === shipment._id ? 'Updating...' : 'Advance Status'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Shipment Timeline</CardTitle>
          <CardDescription>Overview of all active and past shipments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shipments.map(shipment => (
              <div key={shipment._id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                {shipment.status === 'delivered' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <Truck className="w-6 h-6 text-slate-700 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {shipment.inventory_id?.product_id?.name || 'Unknown Product'} 
                    <span className="font-normal text-slate-500 ml-2">→ {shipment.warehouse_id?.name || 'Warehouse'}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Package className="w-3 h-3" /> {shipment.quantity} units shipped
                    <span className="text-slate-400 mx-2">•</span>
                    Created on {new Date(shipment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(shipment.status)}`}>
                  {shipment.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {shipments.length === 0 && (
              <div className="py-8 text-center text-slate-500">
                No shipments found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
