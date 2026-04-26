"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "@/lib/api";

export default function ProductionPage() {
  const [batches, setBatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ productName: "", quantity: "", startDate: "", estimatedEndDate: "" });
  const [error, setError] = useState("");

  const fetchBatches = () => api.get("/manufacturer/production").then(r => setBatches(r.data)).catch(console.error);
  useEffect(() => { fetchBatches(); }, []);

  const handleSubmit = async () => {
    if (!form.productName || !form.quantity) { setError("Product name and quantity required"); return; }
    try {
      await api.post("/manufacturer/production", form);
      setOpen(false); fetchBatches();
    } catch (e: any) { setError(e.response?.data?.message || "Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Production Batches</h1>
        <Button onClick={() => setOpen(true)}><Plus size={16} className="mr-2"/>New Batch</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Product</th><th className="text-left py-2">Qty</th><th className="text-left py-2">Start</th><th className="text-left py-2">Est. End</th><th className="text-left py-2">Status</th></tr></thead>
            <tbody>
              {(batches as any[]).map(b => (
                <tr key={b._id} className="border-b hover:bg-slate-50">
                  <td className="py-2 font-medium">{b.productName}</td>
                  <td className="py-2">{b.quantity}</td>
                  <td className="py-2">{b.startDate ? new Date(b.startDate).toLocaleDateString() : "-"}</td>
                  <td className="py-2">{b.estimatedEndDate ? new Date(b.estimatedEndDate).toLocaleDateString() : "-"}</td>
                  <td className="py-2"><span className={`px-2 py-1 rounded-full text-xs ${b.status === "completed" ? "bg-green-100 text-green-700" : b.status === "in-progress" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Production Batch</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Product name" value={form.productName} onChange={e => setForm({...form, productName: e.target.value})}/>
            <Input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}/>
            <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}/>
            <Input type="date" value={form.estimatedEndDate} onChange={e => setForm({...form, estimatedEndDate: e.target.value})}/>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create Batch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}