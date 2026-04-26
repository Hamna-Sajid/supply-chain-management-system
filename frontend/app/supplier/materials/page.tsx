"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "@/lib/api";

interface Material { _id: string; name: string; quantity: number; price: number; unit: string; }

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState({ name: "", quantity: "", price: "", unit: "kg" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMaterials = () => api.get("/supplier/materials").then(r => setMaterials(r.data)).catch(console.error);
  useEffect(() => { fetchMaterials(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", quantity: "", price: "", unit: "kg" }); setOpen(true); };
  const openEdit = (m: Material) => { setEditing(m); setForm({ name: m.name, quantity: String(m.quantity), price: String(m.price), unit: m.unit }); setOpen(true); };

  const handleSubmit = async () => {
    if (!form.name || !form.quantity || !form.price) { setError("All fields required"); return; }
    setLoading(true); setError("");
    try {
      if (editing) await api.put(`/supplier/materials/${editing._id}`, form);
      else await api.post("/supplier/materials", form);
      setOpen(false); fetchMaterials();
    } catch (e: any) { setError(e.response?.data?.message || "Error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    await api.delete(`/supplier/materials/${id}`);
    fetchMaterials();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Materials</h1>
        <Button onClick={openCreate}><Plus size={16} className="mr-2"/>Add Material</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Name</th><th className="text-left py-2">Qty</th><th className="text-left py-2">Price</th><th className="text-left py-2">Unit</th><th className="text-left py-2">Actions</th></tr></thead>
            <tbody>
              {materials.map(m => (
                <tr key={m._id} className="border-b hover:bg-slate-50">
                  <td className="py-2 font-medium">{m.name}</td>
                  <td className="py-2">{m.quantity}</td>
                  <td className="py-2">PKR {m.price}</td>
                  <td className="py-2">{m.unit}</td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => openEdit(m)} className="text-blue-600 hover:text-blue-800"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:text-red-800"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Material" : "Add Material"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Material name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
            <Input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}/>
            <Input type="number" placeholder="Price (PKR)" value={form.price} onChange={e => setForm({...form, price: e.target.value})}/>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
              {["kg","ton","liter","piece","meter"].map(u => <option key={u}>{u}</option>)}
            </select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}