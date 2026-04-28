'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';

const chartData = [
  { month: 'Jan', revenue: 45000, expenses: 28000 },
  { month: 'Feb', revenue: 52000, expenses: 31000 },
  { month: 'Mar', revenue: 48000, expenses: 29000 },
  { month: 'Apr', revenue: 61000, expenses: 35000 },
  { month: 'May', revenue: 55000, expenses: 32000 },
  { month: 'Jun', revenue: 67000, expenses: 38000 },
];

export default function ManufacturerFinancialsPage() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: '' });

  const handleAddExpense = () => {
    console.log('[v0] Expense added:', expenseForm);
    setExpenseForm({ amount: '', category: '' });
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d6a4f]">Financials & Analytics</h1>
        <p className="text-gray-600 mt-2">View financial reports and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm" style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-[#2D6A4F]">$328,000</div>
                <p className="text-xs text-[#40916C] mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +18% YoY</p>
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
            <div className="text-3xl font-bold text-[#E63946]">$193,000</div>
            <p className="text-xs text-gray-500 mt-1">Operating costs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#E63946" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Add Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Amount" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ borderColor: '#B7E4C7' }} />
            <Input placeholder="Category" value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})} style={{ borderColor: '#B7E4C7' }} />
            <Button onClick={handleAddExpense} className="w-full text-white" style={{ backgroundColor: '#2D6A4F' }}>Add Expense</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button onClick={() => setActiveTab('revenue')} className={`pb-2 px-2 font-medium transition-colors ${activeTab === 'revenue' ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]' : 'text-gray-600'}`}>Revenue</button>
            <button onClick={() => setActiveTab('expense')} className={`pb-2 px-2 font-medium transition-colors ${activeTab === 'expense' ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]' : 'text-gray-600'}`}>Expenses</button>
          </div>

          {activeTab === 'revenue' && (
            <div className="space-y-3">
              {[{id: 'REV-001', amount: '$45,000', date: '2024-01-15'}, {id: 'REV-002', amount: '$52,000', date: '2024-01-14'}].map(item => (
                <div key={item.id} className="flex justify-between p-3 rounded" style={{backgroundColor: '#F9F9F9', borderColor: '#B7E4C7', borderWidth: '1px'}}>
                  <div>
                    <p className="font-semibold text-gray-900">{item.id}</p>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                  <p className="font-semibold text-[#2D6A4F]">{item.amount}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'expense' && (
            <div className="space-y-3">
              {[{id: 'EXP-001', amount: '$5,000', category: 'Utilities', date: '2024-01-15'}, {id: 'EXP-002', amount: '$8,000', category: 'Materials', date: '2024-01-14'}].map(item => (
                <div key={item.id} className="flex justify-between p-3 rounded" style={{backgroundColor: '#F9F9F9', borderColor: '#B7E4C7', borderWidth: '1px'}}>
                  <div>
                    <p className="font-semibold text-gray-900">{item.id}</p>
                    <p className="text-sm text-gray-600">{item.category} • {item.date}</p>
                  </div>
                  <p className="font-semibold text-red-600">{item.amount}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
