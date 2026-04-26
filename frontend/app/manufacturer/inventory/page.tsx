"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  useEffect(() => { api.get("/manufacturer/inventory").then(r => setInventory(r.data)).catch(console.error); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Inventory</h1>
      <Card>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Item</th><th className="text-left py-2">Quantity</th><th className="text-left py-2">Status</th><th className="text-left py-2">Last Updated</th></tr></thead>
            <tbody>
              {(inventory as any[]).map(item => (
                <tr key={item._id} className="border-b hover:bg-slate-50">
                  <td className="py-2 font-medium">{item.name}</td>
                  <td className="py-2">{item.quantity} {item.unit}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.quantity < 10 ? "bg-red-100 text-red-700" : item.quantity < 50 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      {item.quantity < 10 ? "Critical" : item.quantity < 50 ? "Low" : "OK"}
                    </span>
                  </td>
                  <td className="py-2 text-slate-400">{new Date(item.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}