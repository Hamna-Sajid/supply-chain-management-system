'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Package, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { toast } from 'sonner';

interface OrderData {
    summary: {
        total_orders: number;
        total_value: number;
        completion_rate: string;
        by_status: Record<string, number>;
    };
    monthly_trend: Array<{ month: string; orders: number }>;
    orders: any[];
}

interface ShipmentData {
    summary: {
        total_shipments: number;
        by_status: Record<string, number>;
        ontime_delivery_rate: string;
        avg_delay_days: string;
    };
    shipments: any[];
}

interface PerformanceData {
    ratings: {
        average: number;
        total: number;
        distribution: Record<number, number>;
        recent: any[];
    };
    orders: {
        total: number;
        by_status: Record<string, number>;
        fulfillment_rate: string;
    };
    analytics: any;
}

interface InventoryData {
    summary: {
        total_items: number;
        total_stock_value: number;
        low_stock_count: number;
        out_of_stock_count: number;
    };
    by_category: Record<string, any>;
}

export default function AnalysisPage() {
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
    const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orders, shipments, performance, inventory] = await Promise.all([
                    analyticsApi.getOrderReport().catch(() => null),
                    analyticsApi.getShipmentReport().catch(() => null),
                    analyticsApi.getPerformanceReport().catch(() => null),
                    analyticsApi.getInventoryReport().catch(() => null),
                ]);
                setOrderData(orders);
                setShipmentData(shipments);
                setPerformanceData(performance);
                setInventoryData(inventory);
            } catch (err) {
                toast.error('Failed to load analytics data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-full"><p className="text-gray-400">Loading analytics…</p></div>;
    }

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#2d6a4f]">Analytics & Reports</h1>
                <p className="text-gray-600 mt-2">Comprehensive business intelligence and performance metrics</p>
            </div>

            {/* Order Analytics */}
            {orderData && (
                <>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#2d6a4f] mb-4">Orders</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card style={{ borderLeft: '4px solid #2D6A4F' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Total Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#2D6A4F]">{orderData.summary.total_orders}</div>
                                    <p className="text-xs text-gray-500 mt-1">All time</p>
                                </CardContent>
                            </Card>

                            <Card style={{ borderLeft: '4px solid #06A77D' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Order Value</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#06A77D]">${orderData.summary.total_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                                    <p className="text-xs text-gray-500 mt-1">Total</p>
                                </CardContent>
                            </Card>

                            <Card style={{ borderLeft: '4px solid #40916C' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Completion Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#40916C]">{orderData.summary.completion_rate}</div>
                                    <p className="text-xs text-gray-500 mt-1">Delivered</p>
                                </CardContent>
                            </Card>
                        </div>

                        {orderData.monthly_trend.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Trend</CardTitle>
                                    <CardDescription>Monthly order count</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={orderData.monthly_trend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="orders" fill="#2D6A4F" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </>
            )}

            {/* Shipment Analytics */}
            {shipmentData && (
                <>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#2d6a4f] mb-4">Shipments</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card style={{ borderLeft: '4px solid #2563EB' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Total Shipments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#2563EB]">{shipmentData.summary.total_shipments}</div>
                                    <p className="text-xs text-gray-500 mt-1">All time</p>
                                </CardContent>
                            </Card>

                            <Card style={{ borderLeft: '4px solid #10B981' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">On-Time Delivery</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#10B981]">{shipmentData.summary.ontime_delivery_rate}</div>
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                                </CardContent>
                            </Card>

                            <Card style={{ borderLeft: '4px solid #F59E0B' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Avg Delay</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#F59E0B]">{shipmentData.summary.avg_delay_days} days</div>
                                    <Clock className="w-4 h-4 text-amber-600 mt-1" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Status Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipment Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(shipmentData.summary.by_status).map(([status, count]) => (
                                        <div key={status} className="p-3 rounded" style={{ backgroundColor: '#F9F9F9', borderLeft: '3px solid #2D6A4F' }}>
                                            <p className="text-xs text-gray-600 capitalize">{status}</p>
                                            <p className="text-xl font-bold text-[#2D6A4F]">{count as number}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Inventory Analytics */}
            {inventoryData && (
                <>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#2d6a4f] mb-4">Inventory</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card style={{ borderLeft: '4px solid #2D6A4F' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Total Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#2D6A4F]">{inventoryData.summary.total_items}</div>
                                    <Package className="w-4 h-4 text-[#2D6A4F] mt-1" />
                                </CardContent>
                            </Card>

                            <Card style={{ borderLeft: '4px solid #10B981' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Stock Value</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#10B981]">${inventoryData.summary.total_stock_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                                </CardContent>
                            </Card>

                            <Card style={{ borderLeft: '4px solid #F59E0B' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Low Stock</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#F59E0B]">{inventoryData.summary.low_stock_count}</div>
                                    <AlertCircle className="w-4 h-4 text-amber-600 mt-1" />
                                </CardContent>
                            </Card>

                            <Card style={{ borderLeft: '4px solid #EF4444' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Out of Stock</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#EF4444]">{inventoryData.summary.out_of_stock_count}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}

            {/* Performance Analytics */}
            {performanceData && (
                <>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#2d6a4f] mb-4">Performance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card style={{ borderLeft: '4px solid #FFD700' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Average Rating</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#FFD700]">{performanceData.ratings.average.toFixed(1)} ⭐</div>
                                    <p className="text-xs text-gray-500 mt-1">{performanceData.ratings.total} reviews</p>
                                </CardContent>
                            </Card>

                            <Card style={{ borderLeft: '4px solid #2D6A4F' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Total Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#2D6A4F]">{performanceData.orders.total}</div>
                                </CardContent>
                            </Card>

                            <Card style={{ borderLeft: '4px solid #40916C' }}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-600">Fulfillment Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#40916C]">{performanceData.orders.fulfillment_rate}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Rating Distribution */}
                        {Object.keys(performanceData.ratings.distribution).length > 0 && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Rating Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map(rating => (
                                            <div key={rating} className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-700 w-12">{rating}⭐</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-[#2D6A4F] h-2 rounded-full"
                                                        style={{ width: `${performanceData.ratings.distribution[rating] ? (performanceData.ratings.distribution[rating] / performanceData.ratings.total * 100) : 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-600 w-12 text-right">{performanceData.ratings.distribution[rating] || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
