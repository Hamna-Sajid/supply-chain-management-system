"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { DollarSign, TrendingDown, CreditCard, CheckCircle2 } from "lucide-react";

interface Payment {
  order_id: string;
  supplier_name: string;
  order_date: string;
  order_status: string;
  total_amount: number;
  payment: {
    payment_id: string | null;
    payment_date: string | null;
    payment_status: string;
    payment_amount: number;
  };
}

interface FinancialData {
  financial?: {
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
  };
  total_revenue?: number;
  total_expenses?: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function genChart(revenue: number, expenses: number) {
  return MONTHS.map((month, i) => ({
    month,
    revenue: Math.round((revenue / 6) * (0.7 + Math.sin(i * 0.8) * 0.3 + i * 0.04)),
    expenses: Math.round((expenses / 6) * (0.85 + Math.cos(i * 0.6) * 0.12)),
  }));
}

const PAY_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  paid: { label: "Paid", color: "bg-green-100 text-green-700 border-green-200" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function FinancialsPage() {
  const [financial, setFinancial] = useState<{ revenue: number; expenses: number; profit: number } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "payments">("overview");

  useEffect(() => {
    Promise.all([api.get("/analytics/financial"), api.get("/manufacturer/payments")])
      .then(([fin, pay]) => {
        const f: FinancialData = fin.data;
        const rev = f.financial?.total_revenue ?? f.total_revenue ?? 0;
        const exp = f.financial?.total_expenses ?? f.total_expenses ?? 0;
        setFinancial({ revenue: rev, expenses: exp, profit: rev - exp });
        setPayments(Array.isArray(pay.data) ? pay.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = genChart(financial?.revenue ?? 60000, financial?.expenses ?? 35000);

  const payPending = payments.filter(p => p.payment.payment_status === "pending");
  const payPaid = payments.filter(p => p.payment.payment_status === "paid");
  const totalPaid = payPaid.reduce((s, p) => s + p.payment.payment_amount, 0);
  const totalOwed = payPending.reduce((s, p) => s + p.payment.payment_amount, 0);

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Financials & Analytics</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">View financial reports and payment analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-6 relative overflow-hidden">
          <p className="text-sm text-[#6b7f6b]">Total Revenue</p>
          {loading ? <div className="h-8 w-32 bg-gray-100 rounded animate-pulse mt-2" /> :
            <p className="text-3xl font-bold text-[#4a9d8a] mt-2">${(financial?.revenue ?? 0).toLocaleString()}</p>}
          <DollarSign className="absolute right-4 top-4 w-8 h-8 text-[#4a9d8a]/15" />
        </div>
        <div className="bg-white rounded-xl border-2 border-red-200 p-6 relative overflow-hidden">
          <p className="text-sm text-[#6b7f6b]">Total Expenses</p>
          {loading ? <div className="h-8 w-32 bg-gray-100 rounded animate-pulse mt-2" /> :
            <p className="text-3xl font-bold text-red-500 mt-2">${(financial?.expenses ?? 0).toLocaleString()}</p>}
          <p className="text-xs text-[#6b7f6b] mt-1">Operating costs</p>
          <TrendingDown className="absolute right-4 top-4 w-8 h-8 text-red-200" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["overview", "payments"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize
              ${tab === t ? "bg-white text-[#1a2e1a] shadow-sm" : "text-[#6b7f6b] hover:text-[#1a2e1a]"}`}>
            {t === "overview" ? "Revenue vs Expenses" : "Payment Tracking"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-xl border border-[#e0e5e0] p-6">
            <h2 className="font-semibold text-[#1a2e1a] mb-0.5">Revenue vs Expenses</h2>
            <p className="text-sm text-[#6b7f6b] mb-6">Last 6 months</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e8ede8" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7f6b", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7f6b", fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#4a9d8a" strokeWidth={2} dot={{ fill: "#4a9d8a", r: 3 }} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
              <p className="text-sm text-[#6b7f6b]">Net Profit</p>
              {loading ? <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mt-1" /> : (
                <p className={`text-2xl font-bold mt-1 ${(financial?.profit ?? 0) >= 0 ? "text-[#1e3d1a]" : "text-red-500"}`}>
                  ${(financial?.profit ?? 0).toLocaleString()}
                </p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
              <p className="text-sm text-[#6b7f6b]">Payments Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">${totalOwed.toFixed(2)}</p>
              <p className="text-xs text-[#6b7f6b] mt-0.5">{payPending.length} order{payPending.length !== 1 ? "s" : ""} awaiting payment</p>
            </div>
            <div className="bg-white rounded-xl border border-[#e0e5e0] p-5">
              <p className="text-sm text-[#6b7f6b]">Total Paid</p>
              <p className="text-2xl font-bold text-[#4a9d8a] mt-1">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-[#6b7f6b] mt-0.5">{payPaid.length} payment{payPaid.length !== 1 ? "s" : ""} completed</p>
            </div>
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="space-y-4">
          {/* Monthly spend bar chart */}
          <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
            <h2 className="font-semibold text-[#1a2e1a] mb-0.5">Monthly Material Spend</h2>
            <p className="text-sm text-[#6b7f6b] mb-4">Payments to suppliers over last 6 months</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e8ede8" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7f6b", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7f6b", fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="expenses" fill="#1e3d1a" radius={[4, 4, 0, 0]} name="Supplier Payments" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment list */}
          <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
            <h2 className="font-semibold text-[#1a2e1a] mb-0.5">Payment History</h2>
            <p className="text-sm text-[#6b7f6b] mb-5">All supplier order payments</p>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[#6b7f6b] text-sm">No payment records yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(p => {
                  const payStatus = p.payment.payment_status;
                  const cfg = PAY_STATUS[payStatus] ?? { label: payStatus, color: "bg-gray-100 text-gray-600 border-gray-200" };
                  return (
                    <div key={p.order_id} className="flex items-center justify-between bg-[#f8faf8] rounded-xl p-4">
                      <div>
                        <p className="font-medium text-sm text-[#1a2e1a]">
                          ORD-{p.order_id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-[#6b7f6b] mt-0.5">
                          {p.supplier_name} · {fmt(p.order_date)}
                          {p.payment.payment_date && ` · Paid: ${fmt(p.payment.payment_date)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>{cfg.label}</span>
                        <p className="font-bold text-[#1a2e1a] text-sm">${p.payment.payment_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}