'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 45000, expense: 28000 },
  { month: 'Feb', revenue: 52000, expense: 31000 },
  { month: 'Mar', revenue: 48000, expense: 29000 },
  { month: 'Apr', revenue: 61000, expense: 35000 },
  { month: 'May', revenue: 55000, expense: 32000 },
  { month: 'Jun', revenue: 67000, expense: 38000 },
  { month: 'Jul', revenue: 72000, expense: 40000 },
  { month: 'Aug', revenue: 68000, expense: 39000 },
  { month: 'Sep', revenue: 75000, expense: 42000 },
  { month: 'Oct', revenue: 82000, expense: 45000 },
  { month: 'Nov', revenue: 85000, expense: 47000 },
  { month: 'Dec', revenue: 95000, expense: 52000 },
];

const revenueHistory = [
  { id: 'TXN-001', amount: '$2,500', date: '2024-01-15', source: 'ABC Manufacturing' },
  { id: 'TXN-002', amount: '$1,800', date: '2024-01-14', source: 'XYZ Industries' },
  { id: 'TXN-003', amount: '$3,200', date: '2024-01-13', source: 'Global Tech' },
  { id: 'TXN-004', amount: '$1,500', date: '2024-01-12', source: 'Prime Motors' },
];

const expenseHistory = [
  { id: 'EXP-001', amount: '$500', category: 'Rent', date: '2024-01-15' },
  { id: 'EXP-002', amount: '$250', category: 'Utilities', date: '2024-01-14' },
  { id: 'EXP-003', amount: '$1,200', category: 'Equipment', date: '2024-01-13' },
];

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: '', description: '' });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Financials</h1>
        <p className="text-gray-600 mt-2">Track revenue and expenses</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm" style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Year-to-Date Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-[#2D6A4F]">$785,000</div>
                <p className="text-xs text-[#40916C] mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +22% from last year
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-[#D8F3DC]" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderLeft: '4px solid #E63946' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Year-to-Date Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#E63946]">$428,000</div>
            <p className="text-xs text-gray-500 mt-1">Operating expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expense Chart */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Revenue & Expense Trend</CardTitle>
              <CardDescription>Last 12 months comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke="#E63946" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Expense Management Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Add Manual Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Input
                placeholder="e.g., Rent, Utilities"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                style={{ borderColor: '#B7E4C7' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Enter description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm"
                style={{ borderColor: '#B7E4C7' }}
                rows={2}
              />
            </div>
            <Button
              className="w-full text-white"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Add Expense
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Expense History */}
      <div className="mt-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Revenue and expense records</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('revenue')}
                className={`pb-2 px-2 font-medium transition-colors ${
                  activeTab === 'revenue'
                    ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]'
                    : 'text-gray-600'
                }`}
              >
                Revenue History
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`pb-2 px-2 font-medium transition-colors ${
                  activeTab === 'expense'
                    ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]'
                    : 'text-gray-600'
                }`}
              >
                Expense History
              </button>
            </div>

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueHistory.map((item) => (
                      <tr key={item.id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}>
                        <td className="py-3 px-4 text-gray-900 font-medium">{item.id}</td>
                        <td className="py-3 px-4 font-semibold text-[#2D6A4F]">{item.amount}</td>
                        <td className="py-3 px-4 text-gray-700">{item.date}</td>
                        <td className="py-3 px-4 text-gray-700">{item.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Expense Tab */}
            {activeTab === 'expense' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottomColor: '#B7E4C7', borderBottomWidth: '1px' }}>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Expense ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#2D6A4F]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseHistory.map((item) => (
                      <tr key={item.id} style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}>
                        <td className="py-3 px-4 text-gray-900 font-medium">{item.id}</td>
                        <td className="py-3 px-4 font-semibold text-red-600">{item.amount}</td>
                        <td className="py-3 px-4 text-gray-700">{item.category}</td>
                        <td className="py-3 px-4 text-gray-700">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
