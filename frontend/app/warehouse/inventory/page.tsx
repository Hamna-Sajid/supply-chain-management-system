"use client";

import { useEffect, useState } from "react";
import { getInventory, updateInventory, InventoryItem } from "@/lib/warehouse-api";
import { Search, Pencil } from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit modal
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editReorder, setEditReorder] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try { const data = await getInventory(); setItems(data); }
    catch { console.error("Failed to load inventory"); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = items.filter(i =>
    i.product_name.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setEditQty(String(item.quantity_available));
    setEditReorder(String(item.reorder_level));
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateInventory(editItem.inventory_id, {
        quantity_available: editQty !== "" ? Number(editQty) : undefined,
        reorder_level: editReorder !== "" ? Number(editReorder) : undefined,
      });
      setEditItem(null);
      await refresh();
    } catch { alert("Failed to update inventory"); }
    finally { setSaving(false); }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toISOString().slice(0, 10) : "—";

  const isLow = (i: InventoryItem) => i.quantity_available < i.reorder_level;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Warehouse Inventory</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">Track and manage warehouse stock levels</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
        <h2 className="font-semibold text-[#1a2e1a] mb-0.5">Stock Levels</h2>
        <p className="text-sm text-[#6b7f6b] mb-4">Current warehouse inventory</p>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7f6b]" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-[#e0e5e0] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e0e5e0]">
                {["ID", "Product", "Quantity", "Location", "Last Updated", "Action"].map(h => (
                  <th key={h} className="text-left py-3 font-medium text-[#4a9d8a] text-sm pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6b7f6b]">
                    {search ? "No products match your search" : "No inventory items"}
                  </td>
                </tr>
              )}
              {filtered.map((item, idx) => (
                <tr key={item.inventory_id} className="border-b border-[#f0f2f0] hover:bg-[#f8faf8] transition-colors">
                  <td className="py-3 pr-4 text-[#6b7f6b] font-mono text-xs">
                    INV-{String(idx + 1).padStart(3, "0")}
                  </td>
                  <td className="py-3 pr-4 font-medium text-[#1a2e1a]">{item.product_name}</td>
                  <td className={`py-3 pr-4 font-semibold ${isLow(item) ? "text-orange-500" : "text-[#4a9d8a]"}`}>
                    {item.quantity_available}
                  </td>
                  <td className="py-3 pr-4 text-[#6b7f6b]">
                    {item.category || "Rack A1"}
                  </td>
                  <td className="py-3 pr-4 text-[#6b7f6b] text-xs">
                    {fmt(item.last_restocked)}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-[#4a9d8a] hover:text-[#2d5a27] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e0e5e0] shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-[#1a2e1a] mb-0.5">Update Inventory</h3>
            <p className="text-sm text-[#6b7f6b] mb-5">{editItem.product_name}</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Quantity Available</label>
                <input
                  type="number"
                  min={0}
                  value={editQty}
                  onChange={e => setEditQty(e.target.value)}
                  className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Reorder Level</label>
                <input
                  type="number"
                  min={0}
                  value={editReorder}
                  onChange={e => setEditReorder(e.target.value)}
                  className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditItem(null)}
                className="flex-1 border border-[#e0e5e0] text-[#6b7f6b] py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#2d5a27] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1e3d1a] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
