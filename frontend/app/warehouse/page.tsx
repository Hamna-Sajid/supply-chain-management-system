"use client";

import { useEffect, useState } from "react";
import { getDashboard, DashboardData } from "@/lib/warehouse-api";
import { Package, Boxes, CheckCircle, AlertTriangle } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative border bg-[#111] p-5 ${
        accent ? "border-[#c8b86a]/40" : "border-[#1e1e1e]"
      }`}
    >
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8b86a] to-transparent" />
      )}
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#555]">
          {label}
        </p>
        <div
          className={`p-1.5 ${accent ? "bg-[#c8b86a]/10" : "bg-[#1a1a1a]"}`}
        >
          <Icon
            className={`w-3.5 h-3.5 ${accent ? "text-[#c8b86a]" : "text-[#444]"}`}
          />
        </div>
      </div>
      <p
        className={`text-3xl font-mono font-bold tracking-tight ${
          accent ? "text-[#c8b86a]" : "text-[#e8e4dc]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function WarehouseDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between border-b border-[#1e1e1e] pb-6">
        <div>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#c8b86a] mb-1">
            Overview
          </p>
          <h1 className="text-2xl font-mono font-bold text-[#e8e4dc] tracking-tight">
            Dashboard
          </h1>
        </div>
        <p className="text-[11px] font-mono text-[#333]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border border-[#1e1e1e] bg-[#111] p-5 animate-pulse h-28"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="border border-red-900/50 bg-red-950/20 px-4 py-3">
          <p className="text-red-400 text-sm font-mono">{error}</p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Active Shipments"
              value={data.incoming_shipments}
              icon={Package}
            />
            <StatCard
              label="Inventory Lines"
              value={data.inventory_items}
              icon={Boxes}
            />
            <StatCard
              label="Orders Fulfilled"
              value={data.orders_fulfilled}
              icon={CheckCircle}
            />
            <StatCard
              label="Low Stock Alerts"
              value={data.low_stock_alerts}
              icon={AlertTriangle}
              accent={data.low_stock_alerts > 0}
            />
          </div>

          {/* Quick action strip */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <QuickLink
              href="/warehouse/shipments"
              title="Incoming Shipments"
              description="Review, accept, or reject shipments from manufacturers."
              tag={`${data.incoming_shipments} active`}
            />
            <QuickLink
              href="/warehouse/inventory"
              title="Inventory"
              description="Monitor stock levels and update quantities or reorder points."
              tag={`${data.inventory_items} SKUs`}
              warn={data.low_stock_alerts > 0}
              warnLabel={`${data.low_stock_alerts} low stock`}
            />
            <QuickLink
              href="/warehouse/orders"
              title="Retailer Orders"
              description="Process and ship outgoing orders to retailers."
              tag={`${data.orders_fulfilled} fulfilled`}
            />
          </div>
        </>
      )}
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  tag,
  warn,
  warnLabel,
}: {
  href: string;
  title: string;
  description: string;
  tag: string;
  warn?: boolean;
  warnLabel?: string;
}) {
  return (
    <a
      href={href}
      className="group border border-[#1e1e1e] bg-[#111] p-5 hover:border-[#2a2a2a] hover:bg-[#141414] transition-all block"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-mono font-semibold text-[#e8e4dc]">
          {title}
        </h3>
        <div className="flex gap-1.5">
          {warn && warnLabel && (
            <span className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 bg-amber-950/40 text-amber-400 border border-amber-900/40">
              {warnLabel}
            </span>
          )}
          <span className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 bg-[#1a1a1a] text-[#555]">
            {tag}
          </span>
        </div>
      </div>
      <p className="text-[11px] font-mono text-[#444] leading-relaxed">
        {description}
      </p>
      <div className="mt-4 flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-[#333] group-hover:text-[#c8b86a] transition-colors">
        Open
        <span className="group-hover:translate-x-1 transition-transform inline-block">
          →
        </span>
      </div>
    </a>
  );
}
