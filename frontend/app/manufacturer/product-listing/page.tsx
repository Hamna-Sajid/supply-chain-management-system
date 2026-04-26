"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "@/lib/api";

interface Product { _id: string; name: string; price: number; stock: number; category: string; }

export default function ProductListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", price: "", stock: "", category: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get("/manufacturer/products").then(r => setProducts(r.data)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", price: "", stock: "", category: "" }); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, price: String(p.price), stock: String(p.stock), category: p.category }); setOpen(true); };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.stock) { setError("All fields required"); return; }
    setLoading(true); setError("");
    try {
      if (editing) await api.put(`/manufacturer/products/${editing._id}`, form);
      else await api.post("/manufacturer/products", form);
      setOpen(false); fetch();
    } catch (e: any) { setError(e.response?.data?.message || "Error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete product?")) return;
    await api.delete(`/manufacturer/products/${id}`);
    fetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Product Listing</h1>
        <Button onClick={openCreate}><Plus size={16} className="mr-2"/>Add Product</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Name</th><th className="text-left py-2">Category</th><th className="text-left py-2">Price</th><th className="text-left py-2">Stock</th><th className="text-left py-2">Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="border-b hover:bg-slate-50">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2">{p.category}</td>
                  <td className="py-2">PKR {p.price}</td>
                  <td className="py-2">{p.stock}</td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-blue-600"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Product name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
            <Input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})}/>
            <Input type="number" placeholder="Price (PKR)" value={form.price} onChange={e => setForm({...form, price: e.target.value})}/>
            <Input type="number" placeholder="Stock quantity" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}/>
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