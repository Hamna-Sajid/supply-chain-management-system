"use client";

import { useEffect, useState } from "react";
import {
  getDashboard, DashboardData,
  getShipments, Shipment,
  getOrders, Order,
  getLowStock, InventoryItem,
  acceptShipment, rejectShipment,
  updateOrderStatus,
} from "@/lib/warehouse-api";
import { Truck, Package, ShoppingCart, AlertCircle } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-600 text-white",
  medium: "bg-orange-400 text-white",
  low: "bg-gray-300 text-gray-700",
};

export default function WarehouseDashboard() {
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [d, s, o, ls] = await Promise.all([
        getDashboard(), getShipments(), getOrders(), getLowStock()
      ]);
      setDash(d);
      setShipments(s);
      setOrders(o);
      setLowStock(ls);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleAccept = async (id: string) => {
    setActionLoading(id + "_a");
    try { await acceptShipment(id); await refresh(); }
    catch { alert("Failed to accept shipment"); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + "_r");
    try { await rejectShipment(id); await refresh(); }
    catch { alert("Failed to reject shipment"); }
    finally { setActionLoading(null); }
  };

  const handleStartProcessing = async (orderId: string) => {
    setActionLoading(orderId + "_o");
    try { await updateOrderStatus(orderId, "processing"); await refresh(); }
    catch { alert("Failed to update order"); }
    finally { setActionLoading(null); }
  };

  const pendingShipments = shipments.filter(s => s.status === "pending" || s.status === "in_transit" || s.status === "accepted");
  const newOrders = orders.filter(o => o.order_status === "pending" || o.order_status === "processing");
  const filteredStock = lowStock.filter(i =>
    i.product_name.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const getShipStatus = (s: Shipment) => {
    const today = new Date().toDateString();
    const eta = new Date(s.expected_delivery_date).toDateString();
    if (eta === today) return { label: "Arriving Today", cls: "bg-green-100 text-green-700" };
    if (s.status === "in_transit") return { label: "In Transit", cls: "bg-blue-100 text-blue-700" };
    if (s.status === "pending") return { label: "Pending", cls: "bg-gray-100 text-gray-600" };
    return { label: s.status, cls: "bg-gray-100 text-gray-600" };
  };

  const getStockPct = (item: InventoryItem) => {
    if (item.reorder_level === 0) return 0;
    return Math.min(100, Math.round((item.quantity_available / (item.reorder_level * 2)) * 100));
  };

  const getOrderPriority = (o: Order) => {
    if (o.total_amount > 3000) return "high";
    if (o.total_amount > 1500) return "medium";
    return "low";
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-CA"); // YYYY-MM-DD format

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Warehouse Manager Dashboard</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">Manage shipments, inventory, and order fulfillment</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
          <p className="text-sm text-[#6b7f6b]">Incoming Shipments Expected Today</p>
          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-4xl font-bold text-[#4a9d8a]">{dash?.incoming_shipments ?? 0}</p>
              <p className="text-xs text-[#6b7f6b] mt-1">Shipments arriving</p>
            </div>
            <Truck className="w-8 h-8 text-[#4a9d8a] opacity-60" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
          <p className="text-sm text-[#6b7f6b]">Total Stock Value</p>
          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-4xl font-bold text-[#4a9d8a]">
                ${((dash?.inventory_items ?? 0) * 1000).toLocaleString()}
              </p>
              <p className="text-xs text-[#6b7f6b] mt-1">Current inventory value</p>
            </div>
            <Package className="w-8 h-8 text-[#4a9d8a] opacity-60" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
          <p className="text-sm text-[#6b7f6b]">Orders Ready for Shipment</p>
          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-4xl font-bold text-[#4a9d8a]">{dash?.orders_fulfilled ?? 0}</p>
              <p className="text-xs text-[#6b7f6b] mt-1">Ready to ship</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-[#4a9d8a] opacity-60" />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-[#1a2e1a]">Low Stock Alerts</h2>
        </div>
        <p className="text-sm text-[#6b7f6b] mb-4">Products below reorder level</p>

        <input
          type="text"
          placeholder="Search products..."
          value={stockSearch}
          onChange={e => setStockSearch(e.target.value)}
          className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#2d5a27] mb-4"
        />

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e0e5e0]">
              <th className="text-left py-2 font-medium text-[#4a9d8a]">Product Name</th>
              <th className="text-left py-2 font-medium text-[#4a9d8a]">Current Stock</th>
              <th className="text-left py-2 font-medium text-[#4a9d8a]">Reorder Level</th>
              <th className="text-left py-2 font-medium text-[#4a9d8a] w-48">Stock Level %</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-[#6b7f6b]">No low stock items</td></tr>
            )}
            {filteredStock.map(item => {
              const pct = getStockPct(item);
              const barColor = pct < 25 ? "#dc2626" : "#f59e0b";
              return (
                <tr key={item.inventory_id} className="border-b border-[#f0f2f0]">
                  <td className="py-3 font-medium text-[#1a2e1a]">{item.product_name}</td>
                  <td className="py-3 text-[#6b7f6b]">{item.quantity_available} units</td>
                  <td className="py-3 text-[#6b7f6b]">{item.reorder_level} units</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#e8ede8] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: barColor }}
                        />
                      </div>
                      <span className="text-xs text-[#6b7f6b] w-8">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom two panels */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pending Deliveries */}
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
          <h2 className="font-semibold text-[#1a2e1a] mb-0.5">Pending Deliveries (Incoming Shipments)</h2>
          <p className="text-sm text-[#6b7f6b] mb-4">Expected shipments awaiting action</p>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e0e5e0]">
                <th className="text-left py-2 text-xs font-medium text-[#6b7f6b]">Shipment ID</th>
                <th className="text-left py-2 text-xs font-medium text-[#6b7f6b]">Manufacturer</th>
                <th className="text-left py-2 text-xs font-medium text-[#6b7f6b]">Expected Date</th>
                <th className="text-left py-2 text-xs font-medium text-[#6b7f6b]">Status</th>
                <th className="text-left py-2 text-xs font-medium text-[#6b7f6b]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingShipments.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-[#6b7f6b] text-xs">No pending shipments</td></tr>
              )}
              {pendingShipments.slice(0, 5).map(s => {
                const st = getShipStatus(s);
                return (
                  <tr key={s.shipment_id} className="border-b border-[#f0f2f0]">
                    <td className="py-2 font-mono text-xs text-[#1a2e1a]">{s.shipment_id.slice(0,8).toUpperCase()}</td>
                    <td className="py-2 text-xs text-[#1a2e1a]">{s.manufacturer_name}</td>
                    <td className="py-2 text-xs text-[#6b7f6b]">{fmt(s.expected_delivery_date)}</td>
                    <td className="py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAccept(s.shipment_id)}
                          disabled={actionLoading === s.shipment_id + "_a"}
                          className="flex items-center gap-1 bg-[#2d5a27] text-white text-[10px] px-2 py-1 rounded-md hover:bg-[#1e3d1a] transition disabled:opacity-50"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleReject(s.shipment_id)}
                          disabled={actionLoading === s.shipment_id + "_r"}
                          className="flex items-center gap-1 bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-md hover:bg-red-200 transition disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* New Retailer Orders */}
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
          <h2 className="font-semibold text-[#1a2e1a] mb-0.5">New Retailer Orders</h2>
          <p className="text-sm text-[#6b7f6b] mb-4">Orders awaiting fulfillment processing</p>

          <div className="space-y-3">
            {newOrders.length === 0 && (
              <p className="text-center text-[#6b7f6b] text-sm py-4">No new orders</p>
            )}
            {newOrders.slice(0, 5).map(o => {
              const priority = getOrderPriority(o);
              return (
                <div key={o.order_id} className="flex items-center justify-between border-l-4 border-[#4a9d8a] pl-3 py-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-[#1a2e1a]">
                        {o.order_id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLORS[priority]}`}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-[#6b7f6b]">{o.retailer_name}</p>
                    <p className="text-xs text-[#6b7f6b]">
                      {Math.round(o.total_amount / 50)} items • Created {fmt(o.order_date)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartProcessing(o.order_id)}
                    disabled={actionLoading === o.order_id + "_o" || o.order_status === "processing"}
                    className="bg-[#2d5a27] text-white text-xs px-3 py-2 rounded-lg hover:bg-[#1e3d1a] transition shrink-0 disabled:opacity-60"
                  >
                    {o.order_status === "processing" ? "Processing..." : "Start Processing"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
