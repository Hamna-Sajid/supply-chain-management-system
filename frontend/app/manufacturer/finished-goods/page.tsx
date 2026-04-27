"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Box, TrendingUp, Pencil, Truck, X, CheckCircle2, AlertTriangle } from "lucide-react";

interface InventoryItem {
  inventory_id: string;
  product_id: string;
  product_name: string;
  category: string;
  quantity_available: number;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
  last_restocked: string;
}

interface Warehouse {
  user_id: string;
  name: string;
  address: string;
}

export default function FinishedGoodsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<InventoryItem | null>(null);
  const [shipModal, setShipModal] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({ cost_price: "", selling_price: "" });
  const [shipForm, setShipForm] = useState({ warehouse_id: "", quantity: "", shipping_address: "", expected_delivery_date: "" });
  const [saving, setSaving] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([api.get("/manufacturer/inventory"), api.get("/manufacturer/warehouses")])
      .then(([inv, wh]) => {
        setInventory(Array.isArray(inv.data) ? inv.data : []);
        setWarehouses(Array.isArray(wh.data) ? wh.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleEditSave = async () => {
    if (!editModal) return;
    setSaving(true); setError("");
    try {
      await api.put(`/manufacturer/inventory/${editModal.inventory_id}`, {
        cost_price: editForm.cost_price ? parseFloat(editForm.cost_price) : undefined,
        selling_price: editForm.selling_price ? parseFloat(editForm.selling_price) : undefined,
      });
      setInventory(prev => prev.map(i => i.inventory_id === editModal.inventory_id ? {
        ...i,
        cost_price: editForm.cost_price ? parseFloat(editForm.cost_price) : i.cost_price,
        selling_price: editForm.selling_price ? parseFloat(editForm.selling_price) : i.selling_price,
      } : i));
      setEditModal(null);
      setSuccess("Prices updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update");
    } finally { setSaving(false); }
  };

  const handleShip = async () => {
    if (!shipModal) return;
    if (!shipForm.warehouse_id || !shipForm.quantity || !shipForm.shipping_address || !shipForm.expected_delivery_date) {
      setError("All fields are required"); return;
    }
    setShipping(true); setError("");
    try {
      await api.post("/manufacturer/shipments", {
        warehouse_id: shipForm.warehouse_id,
        product_id: shipModal.product_id,
        quantity: parseInt(shipForm.quantity),
        shipping_address: shipForm.shipping_address,
        expected_delivery_date: shipForm.expected_delivery_date,
      });
      setShipModal(null);
      setShipForm({ warehouse_id: "", quantity: "", shipping_address: "", expected_delivery_date: "" });
      setSuccess("Shipment created! Warehouse has been notified.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create shipment");
    } finally { setShipping(false); }
  };

  const totalUnits = inventory.reduce((s, i) => s + i.quantity_available, 0);
  const readyToShip = inventory.filter(i => i.quantity_available > 0).length;
  const lowStock = inventory.filter(i => i.quantity_available <= i.reorder_level && i.reorder_level > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Finished Goods</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">Track and manage finished products ready for shipment</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-medium">Low Stock Alert</p>
            <p className="text-amber-700 text-xs mt-0.5">{lowStock.map(i => i.product_name).join(", ")} {lowStock.length === 1 ? "is" : "are"} below reorder level.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-6 relative overflow-hidden">
          <p className="text-sm text-[#6b7f6b]">Total Finished Units</p>
          <p className="text-4xl font-bold text-[#4a9d8a] mt-2">{totalUnits.toLocaleString()}</p>
          <Box className="absolute right-4 top-4 w-10 h-10 text-[#4a9d8a]/15" />
        </div>
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-6 relative overflow-hidden">
          <p className="text-sm text-[#6b7f6b]">Ready to Ship</p>
          <p className="text-4xl font-bold text-[#1e3d1a] mt-2">{readyToShip}</p>
          <TrendingUp className="absolute right-4 top-4 w-10 h-10 text-[#1e3d1a]/10" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
        <h2 className="font-semibold text-[#1a2e1a] mb-0.5">Finished Goods Inventory</h2>
        <p className="text-sm text-[#6b7f6b] mb-5">Products ready for distribution</p>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12">
            <Box className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-[#6b7f6b] text-sm">No finished goods yet.</p>
            <p className="text-[#6b7f6b] text-xs mt-1">Mark products as completed in Product Management to add inventory.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e0e5e0]">
                <th className="text-left py-3 font-medium text-[#4a9d8a]">ID</th>
                <th className="text-left py-3 font-medium text-[#4a9d8a]">Product</th>
                <th className="text-left py-3 font-medium text-[#4a9d8a]">Quantity</th>
                <th className="text-left py-3 font-medium text-[#4a9d8a]">Cost Price</th>
                <th className="text-left py-3 font-medium text-[#4a9d8a]">Sell Price</th>
                <th className="text-left py-3 font-medium text-[#4a9d8a]">Status</th>
                <th className="text-left py-3 font-medium text-[#4a9d8a]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const isLow = item.quantity_available <= item.reorder_level && item.reorder_level > 0;
                return (
                  <tr key={item.inventory_id} className="border-b border-[#f0f2f0] hover:bg-[#f8faf8] transition-colors">
                    <td className="py-3.5 font-mono text-xs text-[#4a9d8a] font-semibold">FG-{item.inventory_id.slice(-6).toUpperCase()}</td>
                    <td className="py-3.5">
                      <p className="font-medium text-[#1a2e1a]">{item.product_name}</p>
                      {item.category && <p className="text-xs text-[#6b7f6b]">{item.category}</p>}
                    </td>
                    <td className="py-3.5">
                      <span className={`font-medium ${isLow ? "text-amber-600" : "text-[#1a2e1a]"}`}>
                        {item.quantity_available.toLocaleString()} units
                      </span>
                      {isLow && <span className="ml-1 text-xs text-amber-600">⚠ Low</span>}
                    </td>
                    <td className="py-3.5 text-[#6b7f6b]">${item.cost_price.toFixed(2)}</td>
                    <td className="py-3.5 text-[#1e3d1a] font-semibold">${item.selling_price.toFixed(2)}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                        ${item.quantity_available > 0 ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {item.quantity_available > 0 ? "Ready" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditModal(item); setEditForm({ cost_price: String(item.cost_price), selling_price: String(item.selling_price) }); setError(""); }}
                          className="p-1.5 text-[#6b7f6b] hover:text-[#1e3d1a] hover:bg-[#f0f8f0] rounded-lg transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={item.quantity_available === 0}
                          onClick={() => { setShipModal(item); setShipForm({ warehouse_id: "", quantity: "", shipping_address: "", expected_delivery_date: "" }); setError(""); }}
                          className="flex items-center gap-1.5 bg-[#1e3d1a] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#152d12] transition disabled:opacity-40 disabled:cursor-not-allowed">
                          <Truck className="w-3 h-3" /> Ship
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Prices Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e0e5e0] shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a2e1a]">Edit Pricing</h3>
              <button onClick={() => setEditModal(null)}><X className="w-5 h-5 text-[#6b7f6b]" /></button>
            </div>
            <p className="text-sm text-[#6b7f6b] mb-4">{editModal.product_name}</p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Cost Price ($)</label>
                <input type="number" value={editForm.cost_price} onChange={e => setEditForm(p => ({ ...p, cost_price: e.target.value }))} min="0" step="0.01"
                  className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Selling Price ($)</label>
                <input type="number" value={editForm.selling_price} onChange={e => setEditForm(p => ({ ...p, selling_price: e.target.value }))} min="0" step="0.01"
                  className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
              </div>
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setEditModal(null)} className="flex-1 border border-[#e0e5e0] text-[#6b7f6b] py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleEditSave} disabled={saving}
                className="flex-1 bg-[#1e3d1a] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#152d12] transition disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Shipment Modal */}
      {shipModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e0e5e0] shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-[#1a2e1a]">Create Shipment</h3>
              <button onClick={() => setShipModal(null)}><X className="w-5 h-5 text-[#6b7f6b]" /></button>
            </div>
            <p className="text-sm text-[#6b7f6b] mb-5">
              Shipping <span className="font-medium text-[#1a2e1a]">{shipModal.product_name}</span> · Available: {shipModal.quantity_available} units
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Destination Warehouse *</label>
                <select value={shipForm.warehouse_id} onChange={e => setShipForm(p => ({ ...p, warehouse_id: e.target.value }))}
                  className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all">
                  <option value="">Select warehouse...</option>
                  {warehouses.map(w => <option key={w.user_id} value={w.user_id}>{w.name}{w.address ? ` — ${w.address}` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Quantity *</label>
                <input type="number" value={shipForm.quantity} onChange={e => setShipForm(p => ({ ...p, quantity: e.target.value }))}
                  min="1" max={shipModal.quantity_available} placeholder={`Max: ${shipModal.quantity_available}`}
                  className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Shipping Address *</label>
                <input value={shipForm.shipping_address} onChange={e => setShipForm(p => ({ ...p, shipping_address: e.target.value }))}
                  placeholder="Delivery address"
                  className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Expected Delivery Date *</label>
                <input type="date" value={shipForm.expected_delivery_date} onChange={e => setShipForm(p => ({ ...p, expected_delivery_date: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
              </div>
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShipModal(null)} className="flex-1 border border-[#e0e5e0] text-[#6b7f6b] py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleShip} disabled={shipping}
                className="flex-1 bg-[#1e3d1a] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#152d12] transition disabled:opacity-60">
                {shipping ? "Creating..." : "Create Shipment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
