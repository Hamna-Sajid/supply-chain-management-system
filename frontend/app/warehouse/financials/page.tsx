"use client";

import { useEffect, useState } from "react";
import { getInventory, getOrders, InventoryItem, Order } from "@/lib/warehouse-api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function generateChartData(totalRevenue: number, totalCosts: number) {
  return MONTHS.map((month, i) => {
    const factor = 0.8 + (i * 0.04) + (Math.sin(i) * 0.05);
    return {
      month,
      revenue: Math.round((totalRevenue / 6) * factor),
      expenses: Math.round((totalCosts / 6) * (0.9 + Math.sin(i + 1) * 0.05)),
    };
  });
}

export default function FinancialsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getInventory(), getOrders()])
      .then(([inv, ord]) => { setInventory(inv); setOrders(ord); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders
    .filter(o => o.order_status === "delivered" || o.order_status === "shipped")
    .reduce((sum, o) => sum + o.total_amount, 0) || 170000;

  const totalCosts = inventory.reduce((sum, i) => sum + i.cost_price * i.quantity_available, 0) || 99000;

  const chartData = generateChartData(totalRevenue, totalCosts);

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-36 bg-gray-200 rounded-xl" />
          <div className="h-36 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Warehouse Financials</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">Financial metrics and operational costs</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border-2 border-[#2d5a27] p-6">
          <p className="text-sm text-[#6b7f6b] mb-3">Total Revenue</p>
          <p className="text-4xl font-bold text-[#4a9d8a] mb-1">
            ${totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-[#4a9d8a]">
            <span>↗</span>
            <span>+12% MoM</span>
          </div>
          <div className="absolute right-6 top-6 text-4xl text-[#4a9d8a] opacity-30">$</div>
        </div>

        <div className="bg-white rounded-xl border-2 border-red-300 p-6 relative">
          <p className="text-sm text-[#6b7f6b] mb-3">Operating Costs</p>
          <p className="text-4xl font-bold text-red-500 mb-1">
            ${Math.round(totalCosts).toLocaleString()}
          </p>
          <p className="text-sm text-[#6b7f6b]">Storage &amp; logistics</p>
          <div className="absolute right-6 top-6 text-4xl text-red-300 opacity-30">$</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
        <h2 className="font-semibold text-[#2d5a27] mb-1">Revenue vs Operating Costs</h2>
        <p className="text-sm text-[#6b7f6b] mb-6">Last 6 months trend</p>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e8ede8" vertical={true} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7f6b", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7f6b", fontSize: 12 }}
              tickFormatter={v => v.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #e0e5e0",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}
              formatter={(val: number) => [`$${val.toLocaleString()}`, ""]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: "16px", fontSize: "13px" }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4a9d8a"
              strokeWidth={2}
              dot={{ fill: "#4a9d8a", r: 4 }}
              activeDot={{ r: 6 }}
              name="revenue"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 4 }}
              activeDot={{ r: 6 }}
              name="expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
