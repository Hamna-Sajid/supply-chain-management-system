"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Truck, Package, CheckCircle2, Clock, X, Plus, ChevronDown } from "lucide-react";

interface Shipment {
  shipment_id: string;
  warehouse_id: string;
  warehouse_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  status: string;
  shipping_address: string;
  expected_delivery_date: string;
  actual_date_delivered: string | null;
  created_at: string;
}

interface InventoryItem {
  inventory_id: string;
  product_id: string;
  product_name: string;
  quantity_available: number;
}

interface Warehouse {
  user_id: string;
  name: string;
  address: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  preparing: {
    label: "Preparing",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Package className="w-3 h-3" />,
  },
  in_transit: {
    label: "In Transit",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Truck className="w-3 h-3" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

const STATUS_FLOW = ["preparing", "in_transit", "delivered"];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-600 border-gray-200", icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ warehouse_id: "", product_id: "", quantity: "", shipping_address: "", expected_delivery_date: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () => {
    Promise.all([
      api.get("/manufacturer/shipments"),
      api.get("/manufacturer/inventory"),
      api.get("/manufacturer/warehouses"),
    ]).then(([sh, inv, wh]) => {
      setShipments(Array.isArray(sh.data) ? sh.data : []);
      setInventory(Array.isArray(inv.data) ? inv.data.filter((i: InventoryItem) => i.quantity_available > 0) : []);
      setWarehouses(Array.isArray(wh.data) ? wh.data : []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.warehouse_id || !form.product_id || !form.quantity || !form.shipping_address || !form.expected_delivery_date) {
      setError("All fields are required"); return;
    }
    const item = inventory.find(i => i.product_id === form.product_id);
    if (item && parseInt(form.quantity) > item.quantity_available) {
      setError(`Cannot ship more than available stock (${item.quantity_available} units)`); return;
    }
    setAdding(true); setError("");
    try {
      await api.post("/manufacturer/shipments", {
        warehouse_id: form.warehouse_id,
        product_id: form.product_id,
        quantity: parseInt(form.quantity),
        shipping_address: form.shipping_address,
        expected_delivery_date: form.expected_delivery_date,
      });
      setShowAdd(false);
      setForm({ warehouse_id: "", product_id: "", quantity: "", shipping_address: "", expected_delivery_date: "" });
      setSuccess("Shipment created! Warehouse has been notified.");
      setTimeout(() => setSuccess(""), 4000);
      load();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create shipment");
    } finally { setAdding(false); }
  };

  const handleStatusUpdate = async (shipmentId: string, newStatus: string) => {
    setUpdating(shipmentId);
    try {
      await api.put(`/manufacturer/shipments/${shipmentId}/status`, { status: newStatus });
      setShipments(prev => prev.map(s => s.shipment_id === shipmentId ? { ...s, status: newStatus } : s));
      setSuccess(`Shipment status updated to "${STATUS_CONFIG[newStatus]?.label || newStatus}"`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: unknown) {
      alert((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update status");
    } finally { setUpdating(null); }
  };

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const filtered = filterStatus === "all" ? shipments : shipments.filter(s => s.status === filterStatus);

  const counts = {
    preparing: shipments.filter(s => s.status === "preparing").length,
    in_transit: shipments.filter(s => s.status === "in_transit").length,
    delivered: shipments.filter(s => s.status === "delivered").length,
  };

  const selectedProduct = inventory.find(i => i.product_id === form.product_id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2e1a]">Warehouse Shipments</h1>
          <p className="text-[#6b7f6b] text-sm mt-1">Monitor and manage shipments to warehouse locations</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setError(""); }}
          className="flex items-center gap-2 bg-[#1e3d1a] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#152d12] transition"
        >
          <Plus className="w-4 h-4" /> New Shipment
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Info box about shipment workflow */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm font-medium mb-1">How Shipments Work</p>
        <p className="text-blue-700 text-xs leading-relaxed">
          Each shipment sends finished goods from your inventory to a warehouse. One inventory item can have multiple shipments
          over time. Products must be in <span className="font-medium">Completed</span> stage (via Product Management) before
          shipping. Track each shipment independently: Preparing → In Transit → Delivered.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(counts).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <button key={status} onClick={() => setFilterStatus(filterStatus === status ? "all" : status)}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:border-[#1e3d1a]/40 
                ${filterStatus === status ? "border-2 border-[#1e3d1a]" : "border-[#e0e5e0]"}`}>
              <p className="text-sm text-[#6b7f6b]">{cfg.label}</p>
              <p className="text-2xl font-bold text-[#1a2e1a] mt-1">{count}</p>
            </button>
          );
        })}
      </div>

      {/* New Shipment Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border-2 border-[#1e3d1a] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#1a2e1a]">Create New Shipment</h2>
              <p className="text-xs text-[#6b7f6b] mt-0.5">Ship finished goods from inventory to a warehouse</p>
            </div>
            <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-[#6b7f6b]" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Product (from inventory) *</label>
              <select value={form.product_id} onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))}
                className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all">
                <option value="">Select product...</option>
                {inventory.map(i => <option key={i.product_id} value={i.product_id}>{i.product_name} ({i.quantity_available} available)</option>)}
              </select>
              {inventory.length === 0 && <p className="text-xs text-amber-600 mt-1">No finished goods in inventory. Complete production first.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Destination Warehouse *</label>
              <select value={form.warehouse_id} onChange={e => setForm(p => ({ ...p, warehouse_id: e.target.value }))}
                className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all">
                <option value="">Select warehouse...</option>
                {warehouses.map(w => <option key={w.user_id} value={w.user_id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">
                Quantity * {selectedProduct && <span className="text-[#4a9d8a] font-normal">(max {selectedProduct.quantity_available})</span>}
              </label>
              <input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                min="1" max={selectedProduct?.quantity_available}
                className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Expected Delivery Date *</label>
              <input type="date" value={form.expected_delivery_date} onChange={e => setForm(p => ({ ...p, expected_delivery_date: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Shipping Address *</label>
              <input value={form.shipping_address} onChange={e => setForm(p => ({ ...p, shipping_address: e.target.value }))}
                placeholder="Warehouse delivery address"
                className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
          <button onClick={handleAdd} disabled={adding}
            className="bg-[#1e3d1a] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#152d12] transition disabled:opacity-60">
            {adding ? "Creating..." : "Create Shipment"}
          </button>
        </div>
      )}

      {/* Shipment Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-xl border border-[#e0e5e0] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-12 text-center">
          <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[#6b7f6b] text-sm">No shipments {filterStatus !== "all" ? `with "${STATUS_CONFIG[filterStatus]?.label}" status` : "found"}.</p>
          {filterStatus !== "all" && (
            <button onClick={() => setFilterStatus("all")} className="text-[#1e3d1a] text-xs font-medium mt-2 hover:underline">Show all shipments</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => {
            const currentIdx = STATUS_FLOW.indexOf(s.status);
            const nextStatus = STATUS_FLOW[currentIdx + 1];
            return (
              <div key={s.shipment_id} className="bg-white rounded-xl border border-[#e0e5e0] p-5 hover:border-[#1e3d1a]/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#4a9d8a]" />
                    <span className="font-semibold text-[#1a2e1a] text-sm">SHIP-{s.shipment_id.slice(-6).toUpperCase()}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#6b7f6b]">Product</span>
                    <span className="text-[#1a2e1a] font-medium text-right max-w-[140px] truncate">{s.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7f6b]">Destination</span>
                    <span className="text-[#1a2e1a] font-medium">{s.warehouse_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7f6b]">Quantity</span>
                    <span className="text-[#1a2e1a] font-medium">{s.quantity.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7f6b]">ETA</span>
                    <span className="text-[#1a2e1a] font-medium">{fmt(s.expected_delivery_date)}</span>
                  </div>
                  {s.actual_date_delivered && (
                    <div className="flex justify-between">
                      <span className="text-[#6b7f6b]">Delivered</span>
                      <span className="text-green-600 font-medium">{fmt(s.actual_date_delivered)}</span>
                    </div>
                  )}
                </div>
                {nextStatus && (
                  <button
                    disabled={updating === s.shipment_id}
                    onClick={() => handleStatusUpdate(s.shipment_id, nextStatus)}
                    className="w-full bg-[#1e3d1a] text-white py-2 rounded-lg text-xs font-medium hover:bg-[#152d12] transition disabled:opacity-60">
                    {updating === s.shipment_id ? "Updating..." : `Mark as ${STATUS_CONFIG[nextStatus]?.label}`}
                  </button>
                )}
                {s.status === "delivered" && (
                  <div className="w-full bg-green-50 border border-green-200 text-green-700 py-2 rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      {shipments.length > 0 && (
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
          <h2 className="font-semibold text-[#1a2e1a] mb-0.5">Shipment Timeline</h2>
          <p className="text-sm text-[#6b7f6b] mb-4">All shipments overview</p>
          <div className="space-y-3">
            {shipments.map(s => (
              <div key={s.shipment_id} className="flex items-center gap-4 bg-[#f8faf8] rounded-xl p-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                  ${s.status === "delivered" ? "bg-green-100" : s.status === "in_transit" ? "bg-blue-100" : "bg-yellow-100"}`}>
                  {s.status === "delivered" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                   s.status === "in_transit" ? <Truck className="w-4 h-4 text-blue-600" /> :
                   <Clock className="w-4 h-4 text-yellow-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#1a2e1a]">
                    SHIP-{s.shipment_id.slice(-6).toUpperCase()} → {s.warehouse_name}
                  </p>
                  <p className="text-xs text-[#6b7f6b]">{s.product_name} · {s.quantity} units · ETA: {fmt(s.expected_delivery_date)}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}