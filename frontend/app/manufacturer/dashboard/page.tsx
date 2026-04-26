"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { manufacturerApi } from "@/lib/api";

export default function ManufacturerDashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, pendingOrders: 0, lowInventory: 0, revenue: 0 });
  const [productionData, setProductionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, productsRes] = await Promise.all([
          manufacturerApi.getDashboard(),
          manufacturerApi.getProducts()
        ]);
        
        setStats(dashboardRes.metrics || { totalProducts: 0, pendingOrders: 0, lowInventory: 0, revenue: 0 });
        
        // Mocking the chart data using the products response since there's no dedicated chart endpoint
        const mockChartData = (productsRes.products || []).map((p: any, i: number) => ({
          month: `Batch ${i+1}`,
          units: p.quantity
        }));
        setProductionData(mockChartData.length > 0 ? mockChartData : [{ month: 'Initial', units: 0 }]);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Manufacturer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats.totalProducts },
          { label: "Pending Orders", value: stats.pendingOrders },
          { label: "Low Inventory Items", value: stats.lowInventory },
          { label: "Total Revenue", value: `PKR ${stats.revenue?.toLocaleString()}` },
        ].map(s => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{s.label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-slate-800">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Production Output (Batches)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis/>
              <Tooltip/>
              <Line type="monotone" dataKey="units" stroke="#3b82f6" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}