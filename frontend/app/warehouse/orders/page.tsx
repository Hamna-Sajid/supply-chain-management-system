"use client";

import { useState } from "react";
import { ShoppingCart, Package, Clock, CheckCircle, Truck } from "lucide-react";
import { useOrders, RetailerOrder } from "../orders-context";

const STATUS_CONFIG: Record<RetailerOrder["order_status"], {
  label: string;
  bg: string;
  text: string;
  icon: React.ReactNode;
}> = {
  pending:    { label: "Pending",    bg: "bg-yellow-50",  text: "text-yellow-700", icon: <Clock className="w-3 h-3" /> },
  processing: { label: "Processing", bg: "bg-blue-50",    text: "text-blue-700",   icon: <Package className="w-3 h-3" /> },
  shipped:    { label: "Shipped",    bg: "bg-purple-50",  text: "text-purple-700", icon: <Truck className="w-3 h-3" /> },
  delivered:  { label: "Delivered",  bg: "bg-green-50",   text: "text-green-700",  icon: <CheckCircle className="w-3 h-3" /> },
};

const PRIORITY_COLORS: Record<string, string> = {
  high:   "bg-red-600 text-white",
  medium: "bg-orange-400 text-white",
  low:    "bg-gray-300 text-gray-700",
};

const ACTION_LABELS: Record<string, string> = {
  pending:    "⊙ Start Processing",
  processing: "Mark as Shipped",
  shipped:    "Mark as Delivered",
};

export default function OrdersPage() {
  // Shared context — survives tab navigation
  const { orders, advanceStatus } = useOrders();

  const [loading, setLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const counts = {
    all:        orders.length,
    pending:    orders.filter(o => o.order_status === "pending").length,
    processing: orders.filter(o => o.order_status === "processing").length,
    shipped:    orders.filter(o => o.order_status === "shipped").length,
    delivered:  orders.filter(o => o.order_status === "delivered").length,
  };

  const filtered = activeFilter === "all"
    ? orders
    : orders.filter(o => o.order_status === activeFilter);

  const handleAdvance = (orderId: string, currentStatus: RetailerOrder["order_status"]) => {
    if (currentStatus === "delivered") return;
    setLoading(orderId);
    // Small delay to feel responsive, then commit to shared context
    setTimeout(() => {
      advanceStatus(orderId);
      setLoading(null);
    }, 400);
  };

  const totalRevenue = orders
    .filter(o => o.order_status === "delivered" || o.order_status === "shipped")
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="p-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Retailer Orders</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">Process and fulfill retailer orders</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders",      value: orders.length,                     color: "text-[#2d5a27]" },
          { label: "Pending",           value: counts.pending,                    color: "text-yellow-600" },
          { label: "In Progress",       value: counts.processing,                 color: "text-blue-600" },
          { label: "Revenue (Shipped+)", value: `$${totalRevenue.toLocaleString()}`, color: "text-[#4a9d8a]" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#e0e5e0] p-4">
            <p className="text-xs text-[#6b7f6b] mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "pending", "processing", "shipped", "delivered"] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
              activeFilter === f
                ? "bg-[#2d5a27] text-white"
                : "bg-white border border-[#e0e5e0] text-[#6b7f6b] hover:border-[#2d5a27]"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
              activeFilter === f ? "bg-white/20 text-white" : "bg-gray-100 text-[#6b7f6b]"
            }`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(order => {
          const statusCfg = STATUS_CONFIG[order.order_status];
          const isActing  = loading === order.order_id;
          const canAct    = order.order_status !== "delivered";
          const border    = order.priority === "high" ? "border-[#2d5a27]" : "border-[#e0e5e0]";

          return (
            <div key={order.order_id} className={`bg-white rounded-xl border-2 ${border} p-6 relative`}>
              {/* Priority badge */}
              <span className={`absolute top-5 right-5 text-xs px-3 py-1 rounded-full font-semibold capitalize ${PRIORITY_COLORS[order.priority]}`}>
                {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
              </span>

              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <ShoppingCart className="w-5 h-5 text-[#4a9d8a] mt-0.5" />
                <div>
                  <p className="font-bold text-[#2d5a27] text-base">{order.order_id}</p>
                  <p className="text-sm text-[#1a2e1a] font-medium">{order.retailer_name}</p>
                  <p className="text-xs text-[#6b7f6b]">{order.retailer_location}</p>
                </div>
              </div>

              {/* Line items */}
              <div className="bg-[#f8faf8] rounded-lg p-3 mb-4 space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-[#1a2e1a]">{item.product}</span>
                    <span className="text-[#6b7f6b]">
                      {item.qty} × ${item.unit_price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Details row */}
              <div className="grid grid-cols-4 gap-4 mb-5">
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Items</p>
                  <p className="font-semibold text-[#1a2e1a]">
                    {order.items.reduce((s, i) => s + i.qty, 0)} units
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Total</p>
                  <p className="font-semibold text-[#1a2e1a]">${order.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Order Date</p>
                  <p className="font-semibold text-[#1a2e1a]">{order.order_date}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                </div>
              </div>

              {canAct && (
                <button
                  onClick={() => handleAdvance(order.order_id, order.order_status)}
                  disabled={isActing}
                  className="w-full flex items-center justify-center gap-2 bg-[#2d5a27] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1e3d1a] transition disabled:opacity-60"
                >
                  {isActing ? "Updating..." : ACTION_LABELS[order.order_status]}
                </button>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-[#e0e5e0] p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-[#a8c5a0] mx-auto mb-3" />
            <p className="text-[#6b7f6b]">No orders in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
