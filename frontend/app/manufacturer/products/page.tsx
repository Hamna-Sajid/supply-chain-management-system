"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Trash2, Pencil, ChevronRight, CheckCircle2, Circle, X } from "lucide-react";

interface Product {
  product_id: string;
  product_name: string;
  category: string;
  size: string;
  color: string;
  cost_price: number;
  selling_price: number;
  production_stage: string;
}

const STAGES = ["design", "cutting", "sewing", "quality", "packaging", "completed"];

const STAGE_COLORS: Record<string, string> = {
  design: "bg-purple-100 text-purple-700 border-purple-200",
  cutting: "bg-blue-100 text-blue-700 border-blue-200",
  sewing: "bg-cyan-100 text-cyan-700 border-cyan-200",
  quality: "bg-orange-100 text-orange-700 border-orange-200",
  packaging: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-green-100 text-green-700 border-green-200",
};

const STAGE_LABELS: Record<string, string> = {
  design: "Design",
  cutting: "Cutting",
  sewing: "Sewing",
  quality: "Quality Check",
  packaging: "Packaging",
  completed: "Completed",
};

function ProductionPipeline({ stage }: { stage: string }) {
  const current = STAGES.indexOf(stage);
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center gap-0.5">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all
              ${done ? "bg-[#1e3d1a] text-white" : active ? "bg-[#4a9d8a]/20 text-[#1e3d1a] border border-[#4a9d8a]" : "bg-gray-100 text-gray-400"}`}>
              {done ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Circle className="w-2.5 h-2.5" />}
              {STAGE_LABELS[s]}
            </div>
            {i < STAGES.length - 1 && (
              <ChevronRight className={`w-2.5 h-2.5 ${done || active ? "text-[#4a9d8a]" : "text-gray-300"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [stageModal, setStageModal] = useState<Product | null>(null);
  const [qtyModal, setQtyModal] = useState<Product | null>(null);
  const [addQty, setAddQty] = useState("");
  const [form, setForm] = useState({ product_name: "", category: "", size: "", color: "", cost_price: "", selling_price: "" });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [stageError, setStageError] = useState("");
  const [updatingStage, setUpdatingStage] = useState(false);
  const [success, setSuccess] = useState("");

  const load = () => {
    api.get("/manufacturer/products")
      .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.product_name.trim()) { setError("Product name is required"); return; }
    setAdding(true); setError("");
    try {
      await api.post("/manufacturer/products", {
        product_name: form.product_name,
        category: form.category || undefined,
        size: form.size || undefined,
        color: form.color || undefined,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : undefined,
        selling_price: form.selling_price ? parseFloat(form.selling_price) : undefined,
        production_stage: "design",
      });
      setForm({ product_name: "", category: "", size: "", color: "", cost_price: "", selling_price: "" });
      setShowAdd(false);
      setSuccess("Product added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to add product");
    } finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/manufacturer/products/${id}`);
      setProducts(prev => prev.filter(p => p.product_id !== id));
    } catch (e: unknown) {
      alert((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to delete");
    }
  };

  const handleStageUpdate = async (newStage: string) => {
    if (!stageModal) return;
    setUpdatingStage(true); setStageError("");
    try {
      await api.put(`/manufacturer/products/${stageModal.product_id}/stage`, { production_stage: newStage });
      setProducts(prev => prev.map(p => p.product_id === stageModal.product_id ? { ...p, production_stage: newStage } : p));
      setStageModal(null);
      setSuccess(`Stage updated to "${STAGE_LABELS[newStage]}"`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: unknown) {
      setStageError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update stage");
    } finally { setUpdatingStage(false); }
  };

  const handleAddQty = async () => {
    if (!qtyModal || !addQty) return;
    try {
      await api.put(`/manufacturer/products/${qtyModal.product_id}/quantity`, { quantity: parseInt(addQty) });
      setQtyModal(null); setAddQty("");
      setSuccess("Quantity added to finished goods inventory!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: unknown) {
      alert((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to add quantity");
    }
  };

  const activeProducts = products.filter(p => p.production_stage !== "completed");
  const completedProducts = products.filter(p => p.production_stage === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2e1a]">Product Management</h1>
          <p className="text-[#6b7f6b] text-sm mt-1">Manage and track products through the production pipeline</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-[#1e3d1a] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#152d12] transition"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Production Stage Guide */}
      <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
        <h2 className="font-semibold text-[#1a2e1a] mb-1">Production Pipeline Template</h2>
        <p className="text-xs text-[#6b7f6b] mb-4">All products follow this production workflow from start to completion</p>
        <div className="flex items-center gap-2 flex-wrap">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${STAGE_COLORS[s]}`}>
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                {STAGE_LABELS[s]}
              </div>
              {i < STAGES.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          ))}
        </div>
      </div>

      {/* Add Product Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border-2 border-[#1e3d1a] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#1a2e1a]">Add New Product</h2>
              <p className="text-xs text-[#6b7f6b] mt-0.5">Product will start at the Design stage</p>
            </div>
            <button onClick={() => { setShowAdd(false); setError(""); }}><X className="w-5 h-5 text-[#6b7f6b]" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Product Name *</label>
              <input value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))}
                placeholder="e.g. Men's Designer Jeans" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Category</label>
              <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                placeholder="e.g. Clothing" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Size</label>
              <input value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
                placeholder="e.g. M, L, XL" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Color</label>
              <input value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                placeholder="e.g. Blue" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Cost Price ($)</label>
              <input value={form.cost_price} onChange={e => setForm(p => ({ ...p, cost_price: e.target.value }))}
                type="number" min="0" step="0.01" placeholder="0.00" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Selling Price ($)</label>
              <input value={form.selling_price} onChange={e => setForm(p => ({ ...p, selling_price: e.target.value }))}
                type="number" min="0" step="0.01" placeholder="0.00" className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all" />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
          <button onClick={handleAdd} disabled={adding}
            className="bg-[#1e3d1a] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#152d12] transition disabled:opacity-60">
            {adding ? "Adding..." : "Add Product"}
          </button>
        </div>
      )}

      {/* Active Products */}
      <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-[#1a2e1a]">In Production</h2>
            <p className="text-sm text-[#6b7f6b]">{activeProducts.length} product{activeProducts.length !== 1 ? "s" : ""} in pipeline</p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : activeProducts.length === 0 ? (
          <p className="text-[#6b7f6b] text-sm text-center py-8">No products in production. Add a product to get started.</p>
        ) : (
          <div className="space-y-3">
            {activeProducts.map(p => (
              <div key={p.product_id} className="border border-[#e0e5e0] rounded-xl p-4 hover:border-[#1e3d1a]/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-[#4a9d8a] font-semibold">PRD-{p.product_id.slice(-6).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STAGE_COLORS[p.production_stage]}`}>
                        {STAGE_LABELS[p.production_stage]}
                      </span>
                      {p.category && <span className="text-xs text-[#6b7f6b] bg-gray-100 px-2 py-0.5 rounded">{p.category}</span>}
                    </div>
                    <p className="font-medium text-[#1a2e1a]">{p.product_name}</p>
                    <div className="flex gap-3 mt-1 text-xs text-[#6b7f6b]">
                      {p.size && <span>Size: {p.size}</span>}
                      {p.color && <span>Color: {p.color}</span>}
                      {p.cost_price > 0 && <span>Cost: ${p.cost_price.toFixed(2)}</span>}
                      {p.selling_price > 0 && <span>Sell: ${p.selling_price.toFixed(2)}</span>}
                    </div>
                    <div className="mt-3">
                      <ProductionPipeline stage={p.production_stage} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setStageModal(p); setStageError(""); }}
                      className="flex items-center gap-1.5 bg-[#1e3d1a] text-white text-xs px-3 py-2 rounded-lg hover:bg-[#152d12] transition">
                      <Pencil className="w-3 h-3" /> Update Stage
                    </button>
                    <button onClick={() => handleDelete(p.product_id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Products */}
      {completedProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
          <div className="mb-4">
            <h2 className="font-semibold text-[#1a2e1a]">Completed Products</h2>
            <p className="text-sm text-[#6b7f6b]">Ready to be added to finished goods inventory</p>
          </div>
          <div className="space-y-3">
            {completedProducts.map(p => (
              <div key={p.product_id} className="border border-green-200 bg-green-50/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-[#4a9d8a] font-semibold">PRD-{p.product_id.slice(-6).toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    </div>
                    <p className="font-medium text-[#1a2e1a]">{p.product_name}</p>
                    <div className="flex gap-3 mt-1 text-xs text-[#6b7f6b]">
                      {p.category && <span>{p.category}</span>}
                      {p.cost_price > 0 && <span>Cost: ${p.cost_price.toFixed(2)}</span>}
                      {p.selling_price > 0 && <span>Sell: ${p.selling_price.toFixed(2)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setQtyModal(p); setAddQty(""); }}
                      className="flex items-center gap-1.5 bg-green-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-700 transition">
                      <Plus className="w-3 h-3" /> Add to Inventory
                    </button>
                    <button onClick={() => handleDelete(p.product_id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Update Modal */}
      {stageModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e0e5e0] shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-[#1a2e1a]">Update Production Stage</h3>
              <button onClick={() => setStageModal(null)}><X className="w-5 h-5 text-[#6b7f6b]" /></button>
            </div>
            <p className="text-sm text-[#6b7f6b] mb-5">
              <span className="font-medium text-[#1a2e1a]">{stageModal.product_name}</span> — currently at{" "}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STAGE_COLORS[stageModal.production_stage]}`}>
                {STAGE_LABELS[stageModal.production_stage]}
              </span>
            </p>
            <p className="text-xs text-[#6b7f6b] mb-3 font-medium">Advance to stage:</p>
            <div className="space-y-2">
              {STAGES.map((s, i) => {
                const current = STAGES.indexOf(stageModal.production_stage);
                const isDisabled = i <= current;
                return (
                  <button
                    key={s}
                    disabled={isDisabled || updatingStage}
                    onClick={() => handleStageUpdate(s)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-all
                      ${isDisabled ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" :
                        "bg-white border-[#e0e5e0] hover:border-[#1e3d1a] hover:bg-[#f0f8f0] text-[#1a2e1a] cursor-pointer"}`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isDisabled ? "bg-gray-100 text-gray-400" : "bg-[#1e3d1a]/10 text-[#1e3d1a]"}`}>{i + 1}</span>
                    {STAGE_LABELS[s]}
                    {isDisabled && i < current && <span className="ml-auto text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Done</span>}
                    {isDisabled && i === current && <span className="ml-auto text-xs text-[#4a9d8a]">Current</span>}
                  </button>
                );
              })}
            </div>
            {stageError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">{stageError}</p>}
          </div>
        </div>
      )}

      {/* Add to Inventory Modal */}
      {qtyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e0e5e0] shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a2e1a]">Add to Finished Goods</h3>
              <button onClick={() => setQtyModal(null)}><X className="w-5 h-5 text-[#6b7f6b]" /></button>
            </div>
            <p className="text-sm text-[#6b7f6b] mb-4">Enter the quantity of <span className="font-medium text-[#1a2e1a]">{qtyModal.product_name}</span> to add to inventory.</p>
            <input
              type="number" min="1" value={addQty} onChange={e => setAddQty(e.target.value)}
              placeholder="Quantity (e.g. 200)"
              className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1e3d1a] focus:ring-2 focus:ring-[#1e3d1a]/10 transition-all mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setQtyModal(null)} className="flex-1 border border-[#e0e5e0] text-[#6b7f6b] py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAddQty} disabled={!addQty}
                className="flex-1 bg-[#1e3d1a] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#152d12] transition disabled:opacity-60">
                Add to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}