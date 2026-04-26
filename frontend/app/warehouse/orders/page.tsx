"use client";

import { useEffect, useState } from "react";
import {
  getOrders,
  updateOrderStatus,
  createOutgoingShipment,
  getInventory,
  Order,
  InventoryItem,
} from "@/lib/warehouse-api";
import { RefreshCw, Truck, ChevronDown } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-950/30 text-yellow-400 border-yellow-900/40",
  processing: "bg-blue-950/30 text-blue-400 border-blue-900/40",
  shipped: "bg-purple-950/30 text-purple-400 border-purple-900/40",
  delivered: "bg-emerald-950/30 text-emerald-400 border-emerald-900/40",
  cancelled: "bg-red-950/30 text-red-400 border-red-900/40",
};

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Status modal
  const [statusModal, setStatusModal] = useState<{ id: string; current: string } | null>(null);
  const [newStatus, setNewStatus] = useState("");

  // Outgoing shipment modal
  const [shipModal, setShipModal] = useState<Order | null>(null);
  const [shipForm, setShipForm] = useState({
    product_id: "",
    quantity: "",
    shipping_address: "",
    expected_delivery_date: "",
  });
  const [shipSaving, setShipSaving] = useState(false);
  const [shipError, setShipError] = useState("");

  const refresh = () => {
    setLoading(true);
    Promise.all([getOrders(), getInventory()])
      .then(([o, inv]) => {
        setOrders(o);
        setInventory(inv);
      })
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const handleStatusUpdate = async () => {
    if (!statusModal || !newStatus) return;
    setActionLoading(statusModal.id);
    try {
      await updateOrderStatus(statusModal.id, newStatus);
      setStatusModal(null);
      setNewStatus("");
      refresh();
    } catch {
      alert("Failed to update order status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateShipment = async () => {
    if (!shipModal) return;
    setShipError("");
    if (!shipForm.product_id || !shipForm.quantity || !shipForm.shipping_address || !shipForm.expected_delivery_date) {
      setShipError("All fields are required.");
      return;
    }
    setShipSaving(true);
    try {
      await createOutgoingShipment({
        order_id: shipModal.order_id,
        product_id: shipForm.product_id,
        quantity: Number(shipForm.quantity),
        shipping_address: shipForm.shipping_address,
        expected_delivery_date: shipForm.expected_delivery_date,
      });
      setShipModal(null);
      setShipForm({ product_id: "", quantity: "", shipping_address: "", expected_delivery_date: "" });
      refresh();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to create shipment.";
      setShipError(msg);
    } finally {
      setShipSaving(false);
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#c8b86a] mb-1">
            Warehouse
          </p>
          <h1 className="text-2xl font-mono font-bold text-[#e8e4dc] tracking-tight">
            Retailer Orders
          </h1>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 border border-[#2a2a2a] px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase text-[#555] hover:text-[#e8e4dc] hover:border-[#3a3a3a] transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-[#111] border border-[#1e1e1e] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="border border-red-900/50 bg-red-950/20 px-4 py-3 font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {["Order ID", "Retailer", "Date", "Total", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-[10px] tracking-[0.2em] uppercase text-[#444] font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[#333] font-mono">
                    No orders found.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr
                  key={order.order_id}
                  className="border-b border-[#141414] hover:bg-[#111] transition-colors"
                >
                  <td className="px-3 py-3 text-[#555]">
                    {order.order_id.slice(0, 8)}…
                  </td>
                  <td className="px-3 py-3 text-[#e8e4dc]">{order.retailer_name}</td>
                  <td className="px-3 py-3 text-[#666]">{fmt(order.order_date)}</td>
                  <td className="px-3 py-3 text-[#999]">
                    ${order.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center border px-2 py-0.5 text-[10px] tracking-wider uppercase ${
                        STATUS_COLORS[order.order_status] ||
                        "bg-[#1a1a1a] text-[#555] border-[#2a2a2a]"
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* Update status */}
                      {order.order_status !== "delivered" && order.order_status !== "cancelled" && (
                        <button
                          onClick={() => {
                            setStatusModal({ id: order.order_id, current: order.order_status });
                            setNewStatus("");
                          }}
                          disabled={actionLoading === order.order_id}
                          className="flex items-center gap-1 border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1 text-[10px] text-[#666] hover:text-[#bbb] hover:border-[#3a3a3a] transition-all disabled:opacity-50"
                        >
                          <ChevronDown className="w-3 h-3" />
                          Status
                        </button>
                      )}
                      {/* Create outgoing shipment */}
                      {(order.order_status === "processing" || order.order_status === "pending") && (
                        <button
                          onClick={() => {
                            setShipModal(order);
                            setShipForm({ product_id: "", quantity: "", shipping_address: "", expected_delivery_date: "" });
                            setShipError("");
                          }}
                          className="flex items-center gap-1 border border-[#c8b86a]/30 bg-[#c8b86a]/5 px-2 py-1 text-[10px] text-[#c8b86a] hover:bg-[#c8b86a]/10 transition-all"
                        >
                          <Truck className="w-3 h-3" />
                          Ship
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#2a2a2a] w-full max-w-sm p-6">
            <h2 className="text-sm font-mono font-semibold text-[#e8e4dc] mb-1">
              Update Order Status
            </h2>
            <p className="text-[11px] font-mono text-[#444] mb-5">
              Current:{" "}
              <span className="text-[#c8b86a]">{statusModal.current}</span>
            </p>
            <div className="space-y-1.5 mb-5">
              {ORDER_STATUSES.filter((s) => s !== statusModal.current).map((s) => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`w-full text-left px-3 py-2 text-[11px] font-mono border transition-all ${
                    newStatus === s
                      ? "border-[#c8b86a]/50 bg-[#c8b86a]/10 text-[#c8b86a]"
                      : "border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a] hover:text-[#999]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setStatusModal(null)}
                className="border border-[#2a2a2a] px-4 py-2 text-[11px] font-mono text-[#555] hover:text-[#999] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || !!actionLoading}
                className="bg-[#c8b86a]/10 border border-[#c8b86a]/40 px-4 py-2 text-[11px] font-mono text-[#c8b86a] hover:bg-[#c8b86a]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Outgoing Shipment Modal */}
      {shipModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#2a2a2a] w-full max-w-md p-6">
            <h2 className="text-sm font-mono font-semibold text-[#e8e4dc] mb-0.5">
              Create Outgoing Shipment
            </h2>
            <p className="text-[11px] font-mono text-[#444] mb-5">
              Order{" "}
              <span className="text-[#c8b86a]">
                {shipModal.order_id.slice(0, 8)}…
              </span>{" "}
              → {shipModal.retailer_name}
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-[#555] mb-1.5">
                  Product
                </label>
                <select
                  value={shipForm.product_id}
                  onChange={(e) =>
                    setShipForm((f) => ({ ...f, product_id: e.target.value }))
                  }
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e4dc] font-mono text-xs px-3 py-2 outline-none focus:border-[#c8b86a] transition-colors"
                >
                  <option value="">Select a product…</option>
                  {inventory.map((item) => (
                    <option key={item.product_id} value={item.product_id}>
                      {item.product_name} ({item.quantity_available} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-[#555] mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={shipForm.quantity}
                  onChange={(e) =>
                    setShipForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e4dc] font-mono text-xs px-3 py-2 outline-none focus:border-[#c8b86a] transition-colors"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-[#555] mb-1.5">
                  Shipping Address
                </label>
                <input
                  type="text"
                  value={shipForm.shipping_address}
                  onChange={(e) =>
                    setShipForm((f) => ({ ...f, shipping_address: e.target.value }))
                  }
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e4dc] font-mono text-xs px-3 py-2 outline-none focus:border-[#c8b86a] transition-colors"
                  placeholder="123 Main St, City, Country"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-[#555] mb-1.5">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={shipForm.expected_delivery_date}
                  onChange={(e) =>
                    setShipForm((f) => ({ ...f, expected_delivery_date: e.target.value }))
                  }
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e4dc] font-mono text-xs px-3 py-2 outline-none focus:border-[#c8b86a] transition-colors"
                />
              </div>
            </div>

            {shipError && (
              <div className="border border-red-900/50 bg-red-950/20 px-3 py-2 mb-4">
                <p className="text-red-400 text-[11px] font-mono">{shipError}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShipModal(null)}
                className="border border-[#2a2a2a] px-4 py-2 text-[11px] font-mono text-[#555] hover:text-[#999] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShipment}
                disabled={shipSaving}
                className="bg-[#c8b86a]/10 border border-[#c8b86a]/40 px-4 py-2 text-[11px] font-mono text-[#c8b86a] hover:bg-[#c8b86a]/20 transition-all disabled:opacity-50"
              >
                {shipSaving ? "Creating…" : "Create Shipment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
