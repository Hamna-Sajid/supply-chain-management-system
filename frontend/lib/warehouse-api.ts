import { api } from "./api";

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post("/auth/login", payload);
  return res.data;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardData {
  incoming_shipments: number;
  inventory_items: number;
  orders_fulfilled: number;
  low_stock_alerts: number;
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await api.get("/warehouse/dashboard");
  return res.data;
}

// ── Shipments ─────────────────────────────────────────────────────────────────

export interface Shipment {
  shipment_id: string;
  manufacturer_id: string;
  manufacturer_name: string;
  manufacturer_rating: string;
  product_id: string;
  product_name: string;
  quantity: number;
  status: string;
  expected_delivery_date: string;
  actual_date_delivered: string | null;
  shipping_address: string;
  created_at: string;
}

export async function getShipments(): Promise<Shipment[]> {
  const res = await api.get("/warehouse/shipments");
  return res.data;
}

export async function acceptShipment(id: string) {
  const res = await api.put(`/warehouse/shipments/${id}/accept`);
  return res.data;
}

export async function rejectShipment(id: string, damage_notes?: string) {
  const res = await api.put(`/warehouse/shipments/${id}/reject`, { damage_notes });
  return res.data;
}

export async function updateShipmentStatus(id: string, status: string) {
  const res = await api.put(`/warehouse/shipments/${id}/status`, { status });
  return res.data;
}

export async function createOutgoingShipment(data: {
  order_id: string;
  product_id: string;
  quantity: number;
  shipping_address: string;
  expected_delivery_date: string;
}) {
  const res = await api.post("/warehouse/shipments", data);
  return res.data;
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export interface InventoryItem {
  inventory_id: string;
  product_id: string;
  product_name: string;
  category: string;
  quantity_available: number;
  reorder_level: number;
  cost_price: number;
  selling_price: number;
  last_restocked: string | null;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const res = await api.get("/warehouse/inventory");
  return res.data;
}

export async function getLowStock(): Promise<InventoryItem[]> {
  const res = await api.get("/warehouse/low-stock");
  return res.data;
}

export async function updateInventory(
  id: string,
  data: { quantity_available?: number; reorder_level?: number }
) {
  const res = await api.put(`/warehouse/inventory/${id}`, data);
  return res.data;
}

/** POST /warehouse/inventory — manually add a new product to warehouse inventory */
export async function addInventory(data: {
  product_name: string;
  category?: string;
  quantity_available: number;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
}) {
  const res = await api.post("/warehouse/inventory", data);
  return res.data;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface Order {
  order_id: string;
  retailer_name: string;
  order_date: string;
  total_amount: number;
  order_status: string;
}

export async function getOrders(): Promise<Order[]> {
  const res = await api.get("/warehouse/orders");
  return res.data;
}

export async function updateOrderStatus(id: string, status: string) {
  const res = await api.put(`/warehouse/orders/${id}/status`, { status });
  return res.data;
}

// ── Financials ────────────────────────────────────────────────────────────────

export interface FinancialSummary {
  summary: {
    total_revenue: number;
    total_expense: number;
    profit: number;
    avg_rating: number;
  };
  revenue_trend: { month: string; value: number }[];
  expense_trend: { month: string; value: number }[];
  recent_revenues: { amount: number; date: string; order_id: string | null }[];
  recent_expenses: { amount: number; category: string; date: string }[];
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const res = await api.get("/analytics/financial");
  return res.data;
}

export async function addExpense(data: { amount: number; category: string }) {
  const res = await api.post("/warehouse/expenses", data);
  return res.data;
}