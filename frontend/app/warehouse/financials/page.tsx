"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getFinancialSummary, addExpense,
  FinancialSummary,
} from "@/lib/warehouse-api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, X } from "lucide-react";

interface ChartPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export default function FinancialsPage() {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Add expense form
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseError, setExpenseError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"revenue" | "expenses">("revenue");

  const fetchFinancials = useCallback(async () => {
    try {
      const result = await getFinancialSummary();
      setData(result);

      // Build last-6-months chart from trend data
      // trend format: { month: "2024-01", value: number }
      const revMap: Record<string, number> = {};
      const expMap: Record<string, number> = {};
      result.revenue_trend.forEach(pt => { revMap[pt.month] = pt.value; });
      result.expense_trend.forEach(pt => { expMap[pt.month] = pt.value; });

      const now = new Date();
      const points: ChartPoint[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleString("default", { month: "short" });
        points.push({ month: label, revenue: revMap[key] ?? 0, expenses: expMap[key] ?? 0 });
      }
      setChartData(points);
    } catch {
      // Fallback: show empty chart
      const now = new Date();
      const fallback: ChartPoint[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        fallback.push({
          month: d.toLocaleString("default", { month: "short" }),
          revenue: 0,
          expenses: 0,
        });
      }
      setChartData(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFinancials(); }, [fetchFinancials]);

  const handleAddExpense = async () => {
    setExpenseError("");
    setSuccessMsg("");
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      setExpenseError("Enter a valid amount.");
      return;
    }
    if (!expenseCategory.trim()) {
      setExpenseError("Category is required.");
      return;
    }
    setSubmitting(true);
    try {
      await addExpense({ amount: amt, category: expenseCategory.trim() });
      setExpenseAmount("");
      setExpenseCategory("");
      setSuccessMsg(`Expense of $${amt.toFixed(2)} added to "${expenseCategory.trim()}"!`);
      // Refresh so totals and transaction list update
      await fetchFinancials();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add expense.";
      setExpenseError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const totalRevenue = data?.summary.total_revenue ?? 0;
  const totalExpense = data?.summary.total_expense ?? 0;
  const profit = data?.summary.profit ?? 0;

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-36 bg-gray-200 rounded-xl" />
          <div className="h-36 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Financials & Analytics</h1>
        <p className="text-[#6b7f6b] text-sm mt-1">Financial overview, expense tracking and transaction history</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border-2 border-[#2d5a27] p-6 relative overflow-hidden">
          <p className="text-sm text-[#6b7f6b] mb-3">Total Revenue</p>
          <p className="text-4xl font-bold text-[#4a9d8a] mb-1">
            ${totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-[#4a9d8a]">
            <TrendingUp className="w-4 h-4" />
            <span>{profit >= 0 ? "Profitable" : "Net Loss"}</span>
          </div>
          <DollarSign className="absolute right-4 top-4 w-10 h-10 text-[#4a9d8a] opacity-20" />
        </div>

        <div className="bg-white rounded-xl border-2 border-red-300 p-6 relative overflow-hidden">
          <p className="text-sm text-[#6b7f6b] mb-3">Total Expenses</p>
          <p className="text-4xl font-bold text-red-500 mb-1">
            ${totalExpense.toLocaleString()}
          </p>
          <p className="text-sm text-[#6b7f6b]">Operating costs</p>
          <TrendingDown className="absolute right-4 top-4 w-10 h-10 text-red-300 opacity-30" />
        </div>

        <div className="bg-white rounded-xl border-2 border-blue-300 p-6 relative overflow-hidden">
          <p className="text-sm text-[#6b7f6b] mb-3">Net Profit</p>
          <p className={`text-4xl font-bold mb-1 ${profit >= 0 ? "text-[#2d5a27]" : "text-red-500"}`}>
            {profit < 0 ? "-" : ""}${Math.abs(profit).toLocaleString()}
          </p>
          <p className="text-sm text-[#6b7f6b]">Revenue − Expenses</p>
        </div>
      </div>

      {/* Chart + Add Expense side by side */}
      <div className="grid grid-cols-3 gap-4">
        {/* Chart */}
        <div className="col-span-2 bg-white rounded-xl border border-[#e0e5e0] p-6">
          <h2 className="font-semibold text-[#2d5a27] mb-1">Revenue vs Expenses</h2>
          <p className="text-sm text-[#6b7f6b] mb-6">Last 6 months trend</p>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e8ede8" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7f6b", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7f6b", fontSize: 12 }}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e0e5e0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(val: number) => [`$${val.toLocaleString()}`, ""]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: "16px", fontSize: "13px" }} />
              <Line
                type="monotone" dataKey="revenue" stroke="#4a9d8a" strokeWidth={2}
                dot={{ fill: "#4a9d8a", r: 4 }} activeDot={{ r: 6 }} name="revenue"
              />
              <Line
                type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2}
                dot={{ fill: "#ef4444", r: 4 }} activeDot={{ r: 6 }} name="expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Add Expense */}
        <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
          <h2 className="font-semibold text-[#1a2e1a] mb-1">Add Expense</h2>
          <p className="text-sm text-[#6b7f6b] mb-5">Record a new operating expense</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Amount ($)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={expenseAmount}
                onChange={e => setExpenseAmount(e.target.value)}
                className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a2e1a] mb-1.5">Category</label>
              <select
                value={expenseCategory}
                onChange={e => setExpenseCategory(e.target.value)}
                className="w-full border border-[#e0e5e0] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2d5a27] focus:ring-2 focus:ring-[#2d5a27]/10 transition-all"
              >
                <option value="">Select category...</option>
                <option value="Storage">Storage</option>
                <option value="Logistics">Logistics</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Labour">Labour</option>
                <option value="Packaging">Packaging</option>
                <option value="Insurance">Insurance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {expenseError && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {expenseError}
              </div>
            )}

            {successMsg && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                ✓ {successMsg}
              </div>
            )}

            <button
              onClick={handleAddExpense}
              disabled={submitting}
              className="w-full bg-[#2d5a27] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1e3d1a] transition disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-[#e0e5e0] p-6">
        <h2 className="font-semibold text-[#1a2e1a] mb-1">Transaction History</h2>
        <p className="text-sm text-[#6b7f6b] mb-5">Recent revenue and expense records</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-[#e0e5e0]">
          {(["revenue", "expenses"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#2d5a27] text-[#2d5a27]"
                  : "border-transparent text-[#6b7f6b] hover:text-[#1a2e1a]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "revenue" && (
          <div>
            {(!data?.recent_revenues || data.recent_revenues.length === 0) ? (
              <p className="text-center text-[#6b7f6b] py-8 text-sm">No revenue records found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e0e5e0]">
                    <th className="text-left py-3 font-medium text-[#4a9d8a]">Reference</th>
                    <th className="text-left py-3 font-medium text-[#4a9d8a]">Date</th>
                    <th className="text-right py-3 font-medium text-[#4a9d8a]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_revenues.map((r, idx) => (
                    <tr key={idx} className="border-b border-[#f0f2f0] hover:bg-[#f8faf8] transition-colors">
                      <td className="py-3 font-mono text-xs text-[#1a2e1a]">
                        {r.order_id
                          ? `REV-${r.order_id.slice(0, 8).toUpperCase()}`
                          : `REV-${String(idx + 1).padStart(3, "0")}`}
                      </td>
                      <td className="py-3 text-[#6b7f6b]">
                        {new Date(r.date).toLocaleDateString("en-CA")}
                      </td>
                      <td className="py-3 text-right font-semibold text-[#4a9d8a]">
                        +${Number(r.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "expenses" && (
          <div>
            {(!data?.recent_expenses || data.recent_expenses.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-[#6b7f6b] text-sm">No expense records yet.</p>
                <p className="text-xs text-[#6b7f6b] mt-1">Add your first expense using the form above.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e0e5e0]">
                    <th className="text-left py-3 font-medium text-[#4a9d8a]">Reference</th>
                    <th className="text-left py-3 font-medium text-[#4a9d8a]">Category</th>
                    <th className="text-left py-3 font-medium text-[#4a9d8a]">Date</th>
                    <th className="text-right py-3 font-medium text-[#4a9d8a]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_expenses.map((e, idx) => (
                    <tr key={idx} className="border-b border-[#f0f2f0] hover:bg-[#f8faf8] transition-colors">
                      <td className="py-3 font-mono text-xs text-[#1a2e1a]">
                        EXP-{String(idx + 1).padStart(3, "0")}
                      </td>
                      <td className="py-3">
                        <span className="text-xs bg-[#f0f2f0] text-[#4a9d8a] px-2 py-1 rounded-full font-medium">
                          {e.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="py-3 text-[#6b7f6b]">
                        {new Date(e.date).toLocaleDateString("en-CA")}
                      </td>
                      <td className="py-3 text-right font-semibold text-red-500">
                        -${Number(e.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
