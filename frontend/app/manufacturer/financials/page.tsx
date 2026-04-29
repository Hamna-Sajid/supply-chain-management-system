'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { analyticsApi, expenseApi } from '@/lib/api';
import { toast } from 'sonner';

interface FinancialData {
  summary: {
    total_revenue: number;
    total_expense: number;
    profit: number;
    avg_rating: number;
  };
  revenue_by_month?: Array<{ month: string; revenue: number }>;
  expense_by_month?: Array<{ month: string; expense: number }>;
  expense_by_category: Record<string, number>;
  recent_expenses?: Array<{ expense_id: string; amount: number; category: string; date: string }>;
}

export default function FinancialsPage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: '' });
  const [addingExpense, setAddingExpense] = useState(false);

  const fetchData = async () => {
    try {
      const result = await analyticsApi.getFinancialReport();
      setData(result);
    } catch (error) {
      toast.error('Failed to load financial data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async () => {
    const amt = parseFloat(expenseForm.amount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (!expenseForm.category.trim()) {
      toast.error('Enter a category.');
      return;
    }

    setAddingExpense(true);
    try {
      await expenseApi.createExpense({
        amount: amt,
        category: expenseForm.category
      });
      toast.success(`Expense of $${amt.toFixed(2)} added to ${expenseForm.category}!`);
      setExpenseForm({ amount: '', category: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to add expense.');
    } finally {
      setAddingExpense(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p className="text-gray-400">Loading financial data…</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-full"><p className="text-gray-400">No data available</p></div>;
  }

  const { summary, revenue_by_month = [], expense_by_month = [], expense_by_category, recent_expenses = [] } = data;
  const profitMargin = summary.total_revenue > 0 ? ((summary.profit / summary.total_revenue) * 100).toFixed(1) : '0';

  // Combine monthly data - handle undefined safely
  const monthlyData = (revenue_by_month || []).map((r, i) => ({
    month: r.month,
    revenue: r.revenue,
    expense: (expense_by_month || [])[i]?.expense || 0
  }));

  // Prepare expense category data
  const expenseCategoryData = Object.entries(expense_by_category || {}).map(([name, value]) => ({
    name,
    value: Number(value)
  }));

  const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#B7E4C7'];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d6a4f]">Financials</h1>
        <p className="text-gray-600 mt-2">Complete financial overview and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-[#2D6A4F]">${summary.total_revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: '4px solid #E63946' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-[#E63946]">${summary.total_expense.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: '4px solid #F77F00' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${summary.profit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <span className="text-xs text-gray-500">({profitMargin}%)</span>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: '4px solid #06A77D' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#06A77D]">{summary.avg_rating.toFixed(1)} ⭐</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Monthly trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke="#E63946" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {expenseCategoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>By category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={expenseCategoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Expense & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Add Expense Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Amount ($)" type="number" min="0" step="0.01" value={expenseForm.amount}
              onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Category (e.g. Utilities)" value={expenseForm.category}
              onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
              style={{ borderColor: '#B7E4C7' }} />
            <Button onClick={handleAddExpense} disabled={addingExpense} className="w-full text-white" style={{ backgroundColor: '#2D6A4F' }}>
              {addingExpense ? 'Adding...' : 'Add Expense'}
            </Button>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        {expenseCategoryData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expenseCategoryData.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: '#F9F9F9' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="font-medium text-gray-700 text-sm">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">${cat.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Expenses Table */}
      {recent_expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>{recent_expenses.length} recent entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Category</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#2D6A4F]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_expenses.map((exp) => (
                    <tr key={exp.expense_id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-medium">{exp.category}</td>
                      <td className="py-3 px-4 text-right text-[#E63946]">${exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
