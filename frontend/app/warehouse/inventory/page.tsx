"use client";

import { useEffect, useState } from "react";
import {
  getInventory,
  updateInventory,
  InventoryItem,
} from "@/lib/warehouse-api";
import { RefreshCw, Pencil, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "low">("all");

  // Edit modal
  const [editModal, setEditModal] = useState<InventoryItem | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editReorder, setEditReorder] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    setLoading(true);
    getInventory()
      .then(setItems)
      .catch(() => setError("Failed to load inventory."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const isLow = (item: InventoryItem) =>
    item.quantity_available < item.reorder_level;

  const displayed =
    filter === "low" ? items.filter(isLow) : items;

  const openEdit = (item: InventoryItem) => {
    setEditModal(item);
    setEditQty(String(item.quantity_available));
    setEditReorder(String(item.reorder_level));
  };

  const handleSave = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      await updateInventory(editModal.inventory_id, {
        quantity_available: editQty !== "" ? Number(editQty) : undefined,
        reorder_level: editReorder !== "" ? Number(editReorder) : undefined,
      });
      setEditModal(null);
      refresh();
    } catch {
      alert("Failed to update inventory.");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const lowCount = items.filter(isLow).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#c8b86a] mb-1">
            Warehouse
          </p>
          <h1 className="text-2xl font-mono font-bold text-[#e8e4dc] tracking-tight">
            Inventory
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {lowCount > 0 && (
            <div className="flex items-center gap-1.5 border border-amber-900/50 bg-amber-950/20 px-3 py-1.5 text-[10px] font-mono text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              {lowCount} low stock
            </div>
          )}
          <button
            onClick={refresh}
            className="flex items-center gap-2 border border-[#2a2a2a] px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase text-[#555] hover:text-[#e8e4dc] hover:border-[#3a3a3a] transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 mb-5 border border-[#1e1e1e] w-fit">
        {(["all", "low"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all ${
              filter === f
                ? "bg-[#c8b86a]/10 text-[#c8b86a]"
                : "text-[#444] hover:text-[#999]"
            }`}
          >
            {f === "all" ? `All (${items.length})` : `Low Stock (${lowCount})`}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
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
                {[
                  "Product",
                  "Category",
                  "In Stock",
                  "Reorder At",
                  "Cost",
                  "Price",
                  "Last Restocked",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-[10px] tracking-[0.2em] uppercase text-[#444] font-normal whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-[#333] font-mono"
                  >
                    {filter === "low" ? "No low-stock items." : "No inventory items."}
                  </td>
                </tr>
              )}
              {displayed.map((item) => {
                const low = isLow(item);
                return (
                  <tr
                    key={item.inventory_id}
                    className={`border-b border-[#141414] transition-colors ${
                      low
                        ? "bg-amber-950/5 hover:bg-amber-950/10"
                        : "hover:bg-[#111]"
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {low && (
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                        <span className={low ? "text-amber-200" : "text-[#e8e4dc]"}>
                          {item.product_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#555]">
                      {item.category || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`font-semibold ${
                          low ? "text-amber-400" : "text-[#e8e4dc]"
                        }`}
                      >
                        {item.quantity_available.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#555]">
                      {item.reorder_level.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-[#666]">
                      ${item.cost_price.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-[#666]">
                      ${item.selling_price.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-[#444]">
                      {fmt(item.last_restocked)}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-1 border border-[#2a2a2a] px-2 py-1 text-[10px] text-[#555] hover:text-[#c8b86a] hover:border-[#c8b86a]/40 transition-all"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#2a2a2a] w-full max-w-sm p-6">
            <h2 className="text-sm font-mono font-semibold text-[#e8e4dc] mb-0.5">
              Update Inventory
            </h2>
            <p className="text-[11px] font-mono text-[#444] mb-5 truncate">
              {editModal.product_name}
            </p>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-[#555] mb-1.5">
                  Quantity Available
                </label>
                <input
                  type="number"
                  min={0}
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e4dc] font-mono text-sm px-3 py-2 outline-none focus:border-[#c8b86a] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-[#555] mb-1.5">
                  Reorder Level
                </label>
                <input
                  type="number"
                  min={0}
                  value={editReorder}
                  onChange={(e) => setEditReorder(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e4dc] font-mono text-sm px-3 py-2 outline-none focus:border-[#c8b86a] transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditModal(null)}
                className="border border-[#2a2a2a] px-4 py-2 text-[11px] font-mono text-[#555] hover:text-[#999] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#c8b86a]/10 border border-[#c8b86a]/40 px-4 py-2 text-[11px] font-mono text-[#c8b86a] hover:bg-[#c8b86a]/20 transition-all disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
