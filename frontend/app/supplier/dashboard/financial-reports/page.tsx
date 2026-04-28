import { SupplierSidebar } from '@/components/supplier-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', revenue: 45000, expenses: 28000, profit: 17000 },
  { month: 'Feb', revenue: 52000, expenses: 31000, profit: 21000 },
  { month: 'Mar', revenue: 48000, expenses: 29000, profit: 19000 },
  { month: 'Apr', revenue: 61000, expenses: 35000, profit: 26000 },
  { month: 'May', revenue: 55000, expenses: 32000, profit: 23000 },
  { month: 'Jun', revenue: 67000, expenses: 38000, profit: 29000 },
];

const expenseBreakdown = [
  { name: 'COGS', value: 35 },
  { name: 'Labor', value: 25 },
  { name: 'Shipping', value: 20 },
  { name: 'Operations', value: 15 },
  { name: 'Admin', value: 5 },
];

const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#B7E4C7'];

const transactionData = [
  { id: 'TRX-001', type: 'Revenue', description: 'Order ORD-001 Payment', amount: '$5,750', date: '2024-01-18', status: 'Completed' },
  { id: 'TRX-002', type: 'Expense', description: 'Raw Materials Purchase', amount: '$3,200', date: '2024-01-17', status: 'Completed' },
  { id: 'TRX-003', type: 'Revenue', description: 'Order ORD-002 Payment', amount: '$2,400', date: '2024-01-16', status: 'Completed' },
  { id: 'TRX-004', type: 'Expense', description: 'Logistics & Shipping', amount: '$1,850', date: '2024-01-15', status: 'Completed' },
  { id: 'TRX-005', type: 'Revenue', description: 'Order ORD-003 Payment', amount: '$8,900', date: '2024-01-14', status: 'Pending' },
  { id: 'TRX-006', type: 'Expense', description: 'Employee Salaries', amount: '$12,000', date: '2024-01-13', status: 'Scheduled' },
];

export default function FinancialReportsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SupplierSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2D6A4F]">Financial Reports</h1>
          <p className="text-gray-600 mt-2">Track revenue, expenses, and profitability</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#2D6A4F]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total Revenue (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2D6A4F]">$328,000</div>
              <p className="text-xs text-green-600 mt-1">+18% vs last year</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#40916C]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total Expenses (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#40916C]">$193,000</div>
              <p className="text-xs text-gray-500 mt-1">59% of revenue</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#52B788]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Net Profit (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#52B788]">$135,000</div>
              <p className="text-xs text-green-600 mt-1">+22% vs last year</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#2D6A4F]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Avg Monthly Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2D6A4F]">$22,500</div>
              <p className="text-xs text-gray-500 mt-1">Over 6 months</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses (6 Months)</CardTitle>
              <CardDescription>Monthly financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#F76707" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Current month distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={expenseBreakdown} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Profit Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
            <CardDescription>Monthly profitability over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="profit" fill="#2D6A4F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>All income and expense records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Type</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Description</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Amount</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#2D6A4F]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionData.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-mono text-sm text-[#2D6A4F]">{transaction.id}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'Revenue'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{transaction.description}</td>
                      <td
                        className={`py-4 px-4 font-semibold ${
                          transaction.type === 'Revenue' ? 'text-green-600' : 'text-orange-600'
                        }`}
                      >
                        {transaction.type === 'Revenue' ? '+' : '-'} {transaction.amount}
                      </td>
                      <td className="py-4 px-4 text-gray-700">{transaction.date}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
