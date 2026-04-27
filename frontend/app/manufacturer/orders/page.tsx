"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ShoppingCart, ChevronDown, ChevronUp, Search, Package } from "lucide-react";

interface OrderItem {
  order_item_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  order_id: string;
  order_date: string;
  order_status: string;
  total_amount: number;
  supplier_name: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200" },
  shipped: { label: "Shipped", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    api.get("/manufacturer/orders")
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filtered = orders.filter(o => {
    const matchSearch = o.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.order_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];
  const totalSpend = orders.filter(o => o.order_status !== "cancelled").reduce((s, o) => s + o.total_amount, 0);
  const pendingCount = orders.filter(o => o.order_status === "pending").length;
  const deliveredCount = orders.filter(o => o.order_status === "delivered").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">My Orders</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">Track all material orders placed with suppliers</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
          <p className="text-sm text-[#6b7f6b]">Total Orders</p>
          <p className="text-3xl font-bold text-[#1a2e1a] mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
          <p className="text-sm text-[#6b7f6b]">Awaiting Fulfillment</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
          <p className="text-xs text-[#6b7f6b] mt-0.5">Pending supplier action</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
          <p className="text-sm text-[#6b7f6b]">Total Spend</p>
          <p className="text-3xl font-bold text-[#4a9d8a] mt-1">${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Order Fulfillment Monitoring */}
      <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
        <h2 className="font-semibold text-[#1a2e1a] mb-3">Order Fulfillment Overview</h2>
        <div className="flex gap-4 flex-wrap">
          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(s => {
            const count = orders.filter(o => o.order_status === s).length;
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.color}`}>
                <span className="text-sm font-bold">{count}</span>
                <span className="text-xs">{cfg.label}</span>
              </div>
            );
          })}
        </div>
        {orders.length > 0 && (
          <div className="mt-3">
            <div className="flex rounded-full overflow-hidden h-2.5 bg-gray-100">
              {["delivered", "shipped", "confirmed", "pending"].map(s => {
                const count = orders.filter(o => o.order_status === s).length;
                const pct = (count / orders.length) * 100;
                const colors: Record<string, string> = { delivered: "bg-green-500", shipped: "bg-indigo-400", confirmed: "bg-blue-400", pending: "bg-yellow-400" };
                return pct > 0 ? <div key={s} style={{ width: `${pct}%` }} className={`${colors[s]} transition-all`} /> : null;
              })}
            </div>
            <p className="text-xs text-[#6b7f6b] mt-1.5">
              {deliveredCount > 0 && <span className="text-green-600 font-medium">{Math.round((deliveredCount / orders.length) * 100)}% delivered</span>}
              {deliveredCount > 0 && " · "}
              {orders.length} total orders
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7f6b]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by supplier or order ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#e0e5e0] rounded-lg text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize
                ${filterStatus === s ? "bg-[#1e3d1a] text-white" : "bg-white border border-[#e0e5e0] text-[#6b7f6b] hover:border-[#1e3d1a]/30"}`}>
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-[#e0e5e0] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-12 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[#6b7f6b] text-sm">No orders found. Place orders from Material Sourcing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const cfg = STATUS_CONFIG[o.order_status] ?? { label: o.order_status, color: "bg-gray-100 text-gray-600 border-gray-200" };
            const isOpen = expanded === o.order_id;
            return (
              <div key={o.order_id} className="bg-white rounded-xl border border-[#e0e5e0] overflow-hidden hover:border-[#1e3d1a]/30 transition-all">
                <button className="w-full flex items-center gap-4 p-5 text-left" onClick={() => setExpanded(isOpen ? null : o.order_id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-[#4a9d8a] font-semibold">ORD-{o.order_id.slice(-8).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="font-medium text-[#1a2e1a]">{o.supplier_name}</p>
                    <p className="text-xs text-[#6b7f6b] mt-0.5">{fmt(o.order_date)} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[#1a2e1a]">${o.total_amount.toFixed(2)}</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#6b7f6b] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#6b7f6b] shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-[#f0f2f0] px-5 pb-5 pt-4">
                    <h4 className="text-xs font-semibold text-[#6b7f6b] uppercase tracking-wide mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {o.items.map(item => (
                        <div key={item.order_item_id} className="flex items-center justify-between bg-[#f8faf8] rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-[#4a9d8a] shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-[#1a2e1a]">{item.product_name}</p>
                              <p className="text-xs text-[#6b7f6b]">Unit price: ${item.unit_price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#1a2e1a]">{item.quantity.toLocaleString()} units</p>
                            <p className="text-xs text-[#4a9d8a]">${(item.quantity * item.unit_price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Fulfillment status timeline */}
                    <div className="mt-4 border-t border-[#f0f2f0] pt-4">
                      <p className="text-xs font-semibold text-[#6b7f6b] uppercase tracking-wide mb-3">Fulfillment Status</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {["pending", "confirmed", "shipped", "delivered"].map((s, i) => {
                          const stages = ["pending", "confirmed", "shipped", "delivered"];
                          const currentIdx = stages.indexOf(o.order_status);
                          const thisIdx = stages.indexOf(s);
                          const done = thisIdx < currentIdx;
                          const active = thisIdx === currentIdx;
                          const cfg2 = STATUS_CONFIG[s];
                          return (
                            <div key={s} className="flex items-center gap-2">
                              <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium
                                ${done ? "bg-[#1e3d1a] text-white border-[#1e3d1a]" : active ? `${cfg2.color}` : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                                {cfg2.label}
                              </div>
                              {i < 3 && <div className={`w-6 h-0.5 ${done ? "bg-[#1e3d1a]" : "bg-gray-200"}`} />}
                            </div>
                          );
                        })}
                      </div>
                      {o.order_status === "pending" && (
                        <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mt-3">
                          ⏳ Awaiting supplier confirmation. You'll be notified when the order is processed.
                        </p>
                      )}
                      {o.order_status === "delivered" && (
                        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3">
                          ✓ Order fully delivered. Materials are ready for production.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}