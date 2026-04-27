"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, Order } from "@/lib/warehouse-api";
import { ShoppingCart } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  high:   "bg-red-600 text-white",
  medium: "bg-orange-400 text-white",
  normal: "bg-gray-800 text-white",
  low:    "bg-gray-300 text-gray-700",
};

function getOrderPriority(o: Order): string {
  if (o.total_amount > 3000) return "high";
  if (o.total_amount > 1500) return "medium";
  if (o.total_amount > 500)  return "normal";
  return "low";
}

function getActionButton(status: string, onStartProcessing: () => void, onMarkShipped: () => void, loading: boolean) {
  if (status === "pending") {
    return (
      <button
        onClick={onStartProcessing}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#2d5a27] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1e3d1a] transition disabled:opacity-60"
      >
        ⊙ Start Processing
      </button>
    );
  }
  if (status === "processing") {
    return (
      <button
        onClick={onMarkShipped}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#3a7a33] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#2d5a27] transition disabled:opacity-60"
      >
        Mark as Shipped
      </button>
    );
  }
  return null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const refresh = async () => {
    try { const data = await getOrders(); setOrders(data); }
    catch { console.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const handleStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try { await updateOrderStatus(id, status); await refresh(); }
    catch { alert("Failed to update order"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Retailer Orders</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">Process and fulfill retailer orders</p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-44 bg-white rounded-xl border border-[#e0e5e0] animate-pulse" />)}
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order, idx) => {
          const priority = getOrderPriority(order);
          const isActive = actionLoading === order.order_id;
          const canAct = order.order_status === "pending" || order.order_status === "processing";
          const borderColor = priority === "high" ? "border-[#2d5a27]" : "border-[#e0e5e0]";

          return (
            <div key={order.order_id} className={`bg-white rounded-xl border-2 ${borderColor} p-6 relative`}>
              {/* Priority badge */}
              <span className={`absolute top-5 right-5 text-xs px-3 py-1 rounded-full font-semibold capitalize ${PRIORITY_COLORS[priority]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="w-5 h-5 text-[#4a9d8a]" />
                <div>
                  <p className="font-bold text-[#2d5a27] text-base">ORD-{String(idx + 1).padStart(3, "0")}</p>
                  <p className="text-sm text-[#6b7f6b]">{order.retailer_name}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-6 mb-5">
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Items</p>
                  <p className="font-semibold text-[#1a2e1a]">
                    {Math.round(order.total_amount / 50)} units
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Total</p>
                  <p className="font-semibold text-[#1a2e1a]">
                    ${order.total_amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Status</p>
                  <p className="font-semibold text-[#1a2e1a] capitalize">{order.order_status}</p>
                </div>
              </div>

              {canAct && getActionButton(
                order.order_status,
                () => handleStatus(order.order_id, "processing"),
                () => handleStatus(order.order_id, "shipped"),
                isActive
              )}
            </div>
          );
        })}

        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-xl border border-[#e0e5e0] p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-[#a8c5a0] mx-auto mb-3" />
            <p className="text-[#6b7f6b]">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
