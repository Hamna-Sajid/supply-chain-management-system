'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, AlertCircle } from 'lucide-react';

const shipmentData = [
  { id: 'SHIP-001', destination: 'Warehouse A', items: 250, eta: '2024-01-20', status: 'In Transit' },
  { id: 'SHIP-002', destination: 'Warehouse B', items: 180, eta: '2024-01-22', status: 'Processing' },
  { id: 'SHIP-003', destination: 'Warehouse C', items: 320, eta: '2024-01-25', status: 'Pending' },
  { id: 'SHIP-004', destination: 'Warehouse A', items: 150, eta: '2024-01-19', status: 'Delivered' },
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState(shipmentData);

  const updateStatus = (id: string) => {
    const statusFlow = ['Pending', 'Processing', 'In Transit', 'Delivered'];
    setShipments(shipments.map(s => {
      if (s.id === id && s.status !== 'Delivered') {
        const currentIndex = statusFlow.indexOf(s.status);
        return { ...s, status: statusFlow[currentIndex + 1] };
      }
      return s;
    }));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Delivered': return '#D8F3DC';
      case 'In Transit': return '#DBEAFE';
      case 'Processing': return '#FEF3C7';
      default: return '#FEE2E2';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch(status) {
      case 'Delivered': return '#2D6A4F';
      case 'In Transit': return '#2563EB';
      case 'Processing': return '#D97706';
      default: return '#DC2626';
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d6a4f]">Warehouse Shipments</h1>
        <p className="text-gray-600 mt-2">Monitor shipments to warehouse locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {shipments.map(shipment => (
          <Card key={shipment.id} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2D6A4F]" />
                {shipment.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-semibold text-gray-900">{shipment.destination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Items</p>
                <p className="font-semibold text-gray-900">{shipment.items} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ETA</p>
                <p className="font-semibold text-gray-900">{shipment.eta}</p>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: getStatusColor(shipment.status), color: getStatusTextColor(shipment.status)}}>
                  {shipment.status}
                </span>
              </div>
              {shipment.status !== 'Delivered' && (
                <Button onClick={() => updateStatus(shipment.id)} className="w-full text-white" style={{ backgroundColor: '#40916C' }}>
                  Update Status
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Shipment Timeline</CardTitle>
          <CardDescription>All shipments overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shipments.map(shipment => (
              <div key={shipment.id} className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: '#F9F9F9', borderColor: '#B7E4C7', borderWidth: '1px' }}>
                {shipment.status === 'Delivered' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <Truck className="w-6 h-6 text-[#2D6A4F] flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{shipment.id} → {shipment.destination}</p>
                  <p className="text-sm text-gray-600">{shipment.items} units • ETA: {shipment.eta}</p>
                </div>
                <span style={{backgroundColor: getStatusColor(shipment.status), color: getStatusTextColor(shipment.status)}} className="px-3 py-1 rounded-full text-xs font-medium">
                  {shipment.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
