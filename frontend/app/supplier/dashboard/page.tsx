"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/lib/api";

export default function SupplierDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalMaterials: 0, rating: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/supplier/dashboard"),
      api.get("/supplier/orders?limit=5"),
    ]).then(([dashRes, ordersRes]) => {
      setStats(dashRes.data);
      setOrders(ordersRes.data.orders || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.totalOrders },
          { label: "Pending Orders", value: stats.pendingOrders },
          { label: "Materials Listed", value: stats.totalMaterials },
          { label: "Avg Rating", value: `${stats.rating}/5` },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{s.label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-slate-800">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Order ID</th><th className="text-left py-2">Material</th><th className="text-left py-2">Qty</th><th className="text-left py-2">Status</th></tr></thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o._id} className="border-b hover:bg-slate-50">
                    <td className="py-2">{o._id?.slice(-6)}</td>
                    <td className="py-2">{o.materialName}</td>
                    <td className="py-2">{o.quantity}</td>
                    <td className="py-2"><span className={`px-2 py-1 rounded-full text-xs ${o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}