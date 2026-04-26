"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => api.get("/supplier/orders").then(r => setOrders(r.data.orders || r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/supplier/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Orders</h1>
      <Card>
        <CardContent className="pt-6">
          {loading ? <p>Loading...</p> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Order ID</th><th className="text-left py-2">Material</th><th className="text-left py-2">Qty</th><th className="text-left py-2">Date</th><th className="text-left py-2">Status</th></tr></thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o._id} className="border-b hover:bg-slate-50">
                    <td className="py-2 font-mono text-xs">{o._id?.slice(-8)}</td>
                    <td className="py-2">{o.materialName}</td>
                    <td className="py-2">{o.quantity}</td>
                    <td className="py-2">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-2">
                      <select className="border rounded px-2 py-1 text-xs" value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                        {["pending","confirmed","shipped","delivered","cancelled"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}