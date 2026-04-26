"use client";

import { useEffect, useState } from "react";
import {
  getShipments,
  acceptShipment,
  rejectShipment,
  updateShipmentStatus,
  Shipment,
} from "@/lib/warehouse-api";
import { CheckCheck, X, RefreshCw, ChevronDown } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-950/30 text-yellow-400 border-yellow-900/40",
  accepted: "bg-emerald-950/30 text-emerald-400 border-emerald-900/40",
  rejected: "bg-red-950/30 text-red-400 border-red-900/40",
  preparing: "bg-blue-950/30 text-blue-400 border-blue-900/40",
  in_transit: "bg-purple-950/30 text-purple-400 border-purple-900/40",
  delivered: "bg-emerald-950/30 text-emerald-400 border-emerald-900/40",
  delayed: "bg-orange-950/30 text-orange-400 border-orange-900/40",
  returned: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

const VALID_STATUSES = ["preparing", "in_transit", "delivered", "delayed", "returned"];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [damageNotes, setDamageNotes] = useState("");

  // Status modal state
  const [statusModal, setStatusModal] = useState<{ id: string; current: string } | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const refresh = () => {
    setLoading(true);
    getShipments()
      .then(setShipments)
      .catch(() => setError("Failed to load shipments."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const handleAccept = async (id: string) => {
    setActionLoading(id + "_accept");
    try {
      await acceptShipment(id);
      refresh();
    } catch {
      alert("Failed to accept shipment.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id + "_reject");
    try {
      await rejectShipment(rejectModal.id, damageNotes || undefined);
      setRejectModal(null);
      setDamageNotes("");
      refresh();
    } catch {
      alert("Failed to reject shipment.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusModal || !newStatus) return;
    setActionLoading(statusModal.id + "_status");
    try {
      await updateShipmentStatus(statusModal.id, newStatus);
      setStatusModal(null);
      setNewStatus("");
      refresh();
    } catch {
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#c8b86a] mb-1">
            Warehouse
          </p>
          <h1 className="text-2xl font-mono font-bold text-[#e8e4dc] tracking-tight">
            Shipments
          </h1>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 border border-[#2a2a2a] px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase text-[#555] hover:text-[#e8e4dc] hover:border-[#3a3a3a] transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
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
                {["Shipment ID", "Manufacturer", "Product", "Qty", "Expected", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-[10px] tracking-[0.2em] uppercase text-[#444] font-normal"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#333]">
                    No shipments found.
                  </td>
                </tr>
              )}
              {shipments.map((s) => (
                <tr
                  key={s.shipment_id}
                  className="border-b border-[#141414] hover:bg-[#111] transition-colors"
                >
                  <td className="px-3 py-3 text-[#555]">
                    {s.shipment_id.slice(0, 8)}…
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <span className="text-[#e8e4dc]">{s.manufacturer_name}</span>
                      <span className="ml-2 text-[10px] text-[#444]">
                        ★ {s.manufacturer_rating}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[#bbb]">{s.product_name}</td>
                  <td className="px-3 py-3 text-[#999]">{s.quantity.toLocaleString()}</td>
                  <td className="px-3 py-3 text-[#666]">
                    {fmt(s.expected_delivery_date)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center border px-2 py-0.5 text-[10px] tracking-wider uppercase ${
                        STATUS_COLORS[s.status] || "bg-[#1a1a1a] text-[#555] border-[#2a2a2a]"
                      }`}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* Accept */}
                      {s.status === "pending" && (
                        <button
                          onClick={() => handleAccept(s.shipment_id)}
                          disabled={actionLoading === s.shipment_id + "_accept"}
                          className="flex items-center gap-1 border border-emerald-900/50 bg-emerald-950/20 px-2 py-1 text-[10px] text-emerald-400 hover:bg-emerald-950/40 transition-all disabled:opacity-50"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Accept
                        </button>
                      )}
                      {/* Reject */}
                      {s.status === "pending" && (
                        <button
                          onClick={() => { setRejectModal({ id: s.shipment_id }); setDamageNotes(""); }}
                          className="flex items-center gap-1 border border-red-900/50 bg-red-950/20 px-2 py-1 text-[10px] text-red-400 hover:bg-red-950/40 transition-all"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                      )}
                      {/* Update Status */}
                      {s.status !== "pending" && s.status !== "delivered" && s.status !== "rejected" && (
                        <button
                          onClick={() => { setStatusModal({ id: s.shipment_id, current: s.status }); setNewStatus(""); }}
                          className="flex items-center gap-1 border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1 text-[10px] text-[#666] hover:text-[#bbb] hover:border-[#3a3a3a] transition-all"
                        >
                          <ChevronDown className="w-3 h-3" />
                          Status
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#2a2a2a] w-full max-w-md p-6">
            <h2 className="text-sm font-mono font-semibold text-[#e8e4dc] mb-1">
              Reject Shipment
            </h2>
            <p className="text-[11px] font-mono text-[#444] mb-5">
              Optionally provide damage or rejection notes.
            </p>
            <textarea
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              placeholder="e.g. Box arrived crushed, contents damaged"
              rows={3}
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e4dc] font-mono text-xs px-3 py-2 outline-none focus:border-[#c8b86a] resize-none mb-4 placeholder:text-[#2a2a2a]"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModal(null)}
                className="border border-[#2a2a2a] px-4 py-2 text-[11px] font-mono text-[#555] hover:text-[#999] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="bg-red-900/40 border border-red-800/50 px-4 py-2 text-[11px] font-mono text-red-400 hover:bg-red-900/60 transition-all disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#2a2a2a] w-full max-w-sm p-6">
            <h2 className="text-sm font-mono font-semibold text-[#e8e4dc] mb-1">
              Update Status
            </h2>
            <p className="text-[11px] font-mono text-[#444] mb-5">
              Current: <span className="text-[#c8b86a]">{statusModal.current.replace("_", " ")}</span>
            </p>
            <div className="space-y-1.5 mb-5">
              {VALID_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`w-full text-left px-3 py-2 text-[11px] font-mono border transition-all ${
                    newStatus === s
                      ? "border-[#c8b86a]/50 bg-[#c8b86a]/10 text-[#c8b86a]"
                      : "border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a] hover:text-[#999]"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setStatusModal(null)}
                className="border border-[#2a2a2a] px-4 py-2 text-[11px] font-mono text-[#555] hover:text-[#999] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || !!actionLoading}
                className="bg-[#c8b86a]/10 border border-[#c8b86a]/40 px-4 py-2 text-[11px] font-mono text-[#c8b86a] hover:bg-[#c8b86a]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
