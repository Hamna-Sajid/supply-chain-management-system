"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { manufacturerApi } from "@/lib/api";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await manufacturerApi.getInventory();
      setInventory(res.inventory || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" /></div>;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Finished Goods Inventory</h1>
        <p className="text-gray-600 mt-2">Manage your completed products ready for shipment</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
          <CardDescription>Current stock levels of all finished goods</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold text-slate-700">Product Name</th>
                <th className="text-left py-2 font-semibold text-slate-700">Quantity Available</th>
                <th className="text-left py-2 font-semibold text-slate-700">Status</th>
                <th className="text-left py-2 font-semibold text-slate-700">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item._id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-900">{item.product_id?.name || 'Unknown Product'}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${item.quantity < 10 ? "bg-red-100 text-red-700" :
                        item.quantity < 50 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                      }`}>
                      {item.quantity < 10 ? "Critical" : item.quantity < 50 ? "Low Stock" : "Healthy"}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{new Date(item.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">No finished goods in inventory yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}