"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default function FinancialReportsPage() {
  const [report, setReport] = useState<any>(null);
  useEffect(() => { api.get("/supplier/financial-reports").then(r => setReport(r.data)).catch(console.error); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Financial Reports</h1>
      {report && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-slate-500 text-sm">Total Revenue</p><p className="text-2xl font-bold">PKR {report.totalRevenue?.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-slate-500 text-sm">Orders Completed</p><p className="text-2xl font-bold">{report.completedOrders}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-slate-500 text-sm">Avg Order Value</p><p className="text-2xl font-bold">PKR {report.avgOrderValue?.toLocaleString()}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month"/>
                  <YAxis/>
                  <Tooltip/>
                  <Bar dataKey="revenue" fill="#3b82f6"/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}