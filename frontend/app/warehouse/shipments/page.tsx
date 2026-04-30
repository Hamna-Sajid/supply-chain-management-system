"use client";

import { useEffect, useState } from "react";
import {
  getShipments, acceptShipment, rejectShipment, Shipment,
} from "@/lib/warehouse-api";
import { Truck } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  in_transit: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  delayed: "bg-orange-100 text-orange-700",
  returned: "bg-gray-200 text-gray-500",
};

function getDisplayStatus(s: Shipment): string {
  const today = new Date().toDateString();
  const eta = new Date(s.expected_delivery_date).toDateString();
  if (eta === today && (s.status === "pending" || s.status === "in_transit")) return "Arriving Today";
  if (s.status === "in_transit") return "In Transit";
  return s.status.charAt(0).toUpperCase() + s.status.slice(1).replace("_", " ");
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [damageNotes, setDamageNotes] = useState("");

  const refresh = async () => {
    try { const data = await getShipments(); setShipments(data); }
    catch { console.error("Failed to load shipments"); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const handleAccept = async (id: string) => {
    setActionLoading(id + "_a");
    try { await acceptShipment(id); await refresh(); }
    catch { alert("Failed to accept shipment"); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget + "_r");
    try {
      await rejectShipment(rejectTarget, damageNotes || undefined);
      setRejectTarget(null);
      setDamageNotes("");
      await refresh();
    } catch { alert("Failed to reject shipment"); }
    finally { setActionLoading(null); }
  };

  const fmt = (d: string) => new Date(d).toISOString().slice(0, 10);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Incoming Shipments</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">Manage incoming shipments from manufacturers</p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-xl border border-[#e0e5e0] animate-pulse" />)}
        </div>
      )}

      <div className="space-y-4">
        {shipments.map((s, idx) => {
          const displayStatus = getDisplayStatus(s);
          const statusCls = displayStatus === "Arriving Today"
            ? "bg-green-100 text-green-700"
            : STATUS_STYLES[s.status] || "bg-gray-100 text-gray-600";
          const canAct = s.status !== "accepted" && s.status !== "rejected" && s.status !== "delivered";

          return (
            <div key={s.shipment_id} className="bg-white rounded-xl border border-[#e0e5e0] p-6 relative">
              {/* Status badge top-right */}
              <span className={`absolute top-5 right-5 text-xs px-3 py-1 rounded-full font-medium ${statusCls}`}>
                {displayStatus}
              </span>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-5 h-5 text-[#4a9d8a]" />
                <div>
                  <p className="font-bold text-[#2d5a27] text-base">SHIP-{String(idx + 1).padStart(3, "0")}</p>
                  <p className="text-sm text-[#6b7f6b]">{s.manufacturer_name}</p>
                </div>
              </div>

              {/* Details row */}
              <div className="grid grid-cols-2 gap-6 mb-5">
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Items</p>
                  <p className="font-semibold text-[#1a2e1a]">{s.quantity.toLocaleString()} units</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">ETA</p>
                  <p className="font-semibold text-[#1a2e1a]">{fmt(s.expected_delivery_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Shipping Address</p>
                  <p className="font-semibold text-[#1a2e1a]">{s.shipping_address || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7f6b] mb-1">Status</p>
                  <p className="font-semibold text-[#1a2e1a]">{displayStatus}</p>
                </div>
              </div>

              {/* Action buttons */}
              {canAct && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAccept(s.shipment_id)}
                    disabled={actionLoading === s.shipment_id + "_a"}
                    className="flex items-center justify-center gap-2 bg-[#2d5a27] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1e3d1a] transition disabled:opacity-60"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => { setRejectTarget(s.shipment_id); setDamageNotes(""); }}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-500 border border-red-200 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!loading && shipments.length === 0 && (
          <div className="bg-white rounded-xl border border-[#e0e5e0] p-12 text-center">
            <Truck className="w-10 h-10 text-[#a8c5a0] mx-auto mb-3" />
            <p className="text-[#6b7f6b]">No shipments found</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e0e5e0] shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-[#1a2e1a] mb-1">Reject Shipment</h3>
            <p className="text-sm text-[#6b7f6b] mb-4">Optionally add damage or rejection notes.</p>
            <textarea
              value={damageNotes}
              onChange={e => setDamageNotes(e.target.value)}
              placeholder="e.g. Box arrived crushed, contents damaged"
              rows={3}
              className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 border border-[#e0e5e0] text-[#6b7f6b] py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-60"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
