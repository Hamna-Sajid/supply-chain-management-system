'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { analyticsApi, FinancialSummary, supplierApi, AddExpensePayload } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function FinancialsPage() {
  const { toast } = useToast();
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'revenue' | 'expense'>('revenue');

  // Add Expense form
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: '', description: '' });
  const [addingExpense, setAddingExpense] = useState(false);

  const loadFinancial = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await analyticsApi.getFinancial();
      setFinancial(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFinancial(); }, []);

  // Build 12-month trend chart from real data
  const chartData = useMemo(() => {
    if (!financial) return [];
    const revTrend = financial.revenue_trend ?? {};
    const expTrend = financial.expense_trend ?? {};
    const allKeys = Array.from(new Set([...Object.keys(revTrend), ...Object.keys(expTrend)]));

    return allKeys
      .slice(-12)  // Get last 12 months
      .map(k => ({
        month: k,
        revenue: revTrend[k] ?? 0,
        expenses: expTrend[k] ?? 0,
      }));
  }, [financial]);

  // Add expense using supplierApi
  const handleAddExpense = async () => {
    if (!expenseForm.amount || !expenseForm.category) {
      toast({ title: 'Please fill in Amount and Category' });
      return;
    }
    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Please enter a valid positive amount' });
      return;
    }
    setAddingExpense(true);
    try {
      const payload: AddExpensePayload = {
        amount,
        category: expenseForm.category,
        description: expenseForm.description || undefined,
      };
      await supplierApi.addExpense(payload);
      toast({ title: 'Expense added successfully' });
      setExpenseForm({ amount: '', category: '', description: '' });
      await loadFinancial(); // Refresh to show new expense
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to add expense' });
    } finally {
      setAddingExpense(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">Failed to load financials</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <Button className="mt-4" onClick={loadFinancial}>Retry</Button>
        </div>
      </div>
    );
  }

  const summary = financial?.summary;
  const totalRevenue = summary?.total_revenue ?? 0;
  const totalExpense = summary?.total_expense ?? 0;
  const recentRevenues = financial?.recent_revenues ?? [];
  const recentExpenses = financial?.recent_expenses ?? [];

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString(); }
    catch { return d; }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Financials & Analytics</h1>
        <p className="text-gray-600 mt-2">View financial reports and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm" style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-[#2D6A4F]">
                  ${totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-[#40916C] mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Year to date
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-[#D8F3DC]" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderLeft: '4px solid #E63946' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#E63946]">
              ${totalExpense.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Operating costs</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Add Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No trend data available yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={2} dot={{ r: 3 }} name="revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#E63946" strokeWidth={2} dot={{ r: 3 }} name="expenses" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Add Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <Input
                type="number"
                placeholder="Amount"
                value={expenseForm.amount}
                onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Input
                placeholder="Category"
                value={expenseForm.category}
                onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <Input
                placeholder="Details"
                value={expenseForm.description}
                onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <Button
              className="w-full text-white"
              style={{ backgroundColor: '#2D6A4F' }}
              onClick={handleAddExpense}
              disabled={addingExpense}
            >
              {addingExpense ? 'Adding…' : 'Add Expense'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Revenue and expense records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            {(['revenue', 'expense'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-2 font-medium capitalize transition-colors ${activeTab === tab
                  ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab === 'revenue' ? 'Revenue' : 'Expenses'}
              </button>
            ))}
          </div>

          {activeTab === 'revenue' && (
            <div className="overflow-x-auto">
              {recentRevenues.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No revenue records yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRevenues.map((r, i) => (
                      <tr key={i} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}>
                        <td className="py-3 px-4 font-mono text-xs text-gray-700">
                          {r.order_id ? `REV-${r.order_id.slice(0, 6).toUpperCase()}` : `REV-${String(i + 1).padStart(3, '0')}`}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#2D6A4F]">
                          ${r.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{fmtDate(r.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'expense' && (
            <div className="overflow-x-auto">
              {recentExpenses.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No expense records yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((e, i) => (
                      <tr key={i} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}>
                        <td className="py-3 px-4 text-gray-700">{e.category}</td>
                        <td className="py-3 px-4 font-semibold text-red-600">
                          ${e.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{fmtDate(e.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
