import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Keep axios instance for backward compatibility with existing warehouse components
export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ─── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export const setToken = (token: string): void =>
  localStorage.setItem('token', token);

export const clearToken = (): void =>
  localStorage.removeItem('token');

// ─── Fetch wrapper ─────────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (withAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || body.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  contact_number?: string;
  address?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface SignupResponse {
  message: string;
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (payload: SignupPayload) =>
    request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// ─── Supplier: Materials ───────────────────────────────────────────────────────
// Backend: GET /supplier/materials  → RawMaterial[]
// Backend: POST /supplier/materials → RawMaterial (201)
export interface Material {
  material_id: string;
  material_name: string;
  description?: string;
  quantity_available: number;
  unit_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface AddMaterialPayload {
  material_name: string;
  description?: string;
  quantity_available: number;
  unit_price: number;
}

// ─── Supplier: Expenses ────────────────────────────────────────────────────────
export interface AddExpensePayload {
  amount: number;
  category: string;
  description?: string;
}

// ─── Supplier: Orders ──────────────────────────────────────────────────────────
// Backend returns Order with: order_id, order_status, order_date, total_amount,
//   ordered_by: { name, contact_number }, items: [{ product, ... }]
export interface OrderItem {
  product?: { product_name?: string };
  quantity?: number;
}

export interface Order {
  order_id: string;
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  order_date: string;
  total_amount: number;
  ordered_by?: {
    name: string;
    contact_number?: string;
  };
  items?: OrderItem[];
}

// ─── Analytics: Financial ─────────────────────────────────────────────────────
// Backend: GET /analytics/financial
// Returns: { summary, revenue_trend, expense_trend, recent_revenues, recent_expenses }
export interface FinancialSummary {
  summary: {
    total_revenue: number;
    total_expense: number;
    profit: number;
    avg_rating: number;
  };
  revenue_trend: Record<string, number>;   // { "Jan 2024": 45000, ... }
  expense_trend: Record<string, number>;
  expense_by_category: Record<string, number>;
  recent_revenues: Array<{ amount: number; date: string; order_id?: string }>;
  recent_expenses: Array<{ amount: number; category: string; date: string }>;
}

// ─── Analytics: Performance (ratings) ────────────────────────────────────────
// Backend: GET /analytics/performance
// Returns: { ratings: { average, total, distribution, recent }, orders: { ... } }
export interface PerformanceReport {
  ratings: {
    average: number;
    total: number;
    distribution: Record<string, number>; // { "1": 0, "2": 0, "3": 5, ... }
    recent: Array<{
      rating_value: number;
      comment?: string;
      given_by?: { name: string; role: string };
      created_at?: string;
    }>;
  };
  orders: {
    total: number;
    fulfillment_rate: number;
    by_status: Record<string, number>;
  };
}

// ─── Notifications ────────────────────────────────────────────────────────────
// Backend: GET /notifications → { notifications: Notification[], unread_count }
export interface Notification {
  notification_id: string;
  type: string;          // 'new_order' | 'order_status' | 'rating' | 'low_stock' | etc.
  description: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

// ─── API objects ───────────────────────────────────────────────────────────────
export const supplierApi = {
  // Materials
  getMaterials: () =>
    request<Material[]>('/supplier/materials', {}, true),

  addMaterial: (payload: AddMaterialPayload) =>
    request<Material>('/supplier/materials', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true),

  updateMaterial: (id: string, payload: AddMaterialPayload) =>
    request<Material>(`/supplier/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, true),

  deleteMaterial: (id: string) =>
    request<void>(`/supplier/materials/${id}`, {
      method: 'DELETE',
    }, true),

  // Orders
  getOrders: () =>
    request<Order[]>('/supplier/orders', {}, true),

  patchOrderStatus: (orderId: string, status: string) =>
    request<Order>(`/supplier/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true),

  // Expenses
  addExpense: (payload: AddExpensePayload) =>
    request<{ expense_id: string; amount: number; category: string }>('/supplier/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true),

  getExpenses: () =>
    request<Array<{ amount: number; category: string; date: string }>>('/supplier/expenses', {}, true),
};

export const analyticsApi = {
  getFinancial: () =>
    request<FinancialSummary>('/analytics/financial', {}, true),

  getPerformance: () =>
    request<PerformanceReport>('/analytics/performance', {}, true),
};

export const notificationsApi = {
  getAll: (unreadOnly = false) =>
    request<NotificationsResponse>(
      `/notifications${unreadOnly ? '?unread_only=true' : ''}`,
      {},
      true
    ),

  markAsRead: (id: string) =>
    request<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }, true),

  markAllAsRead: () =>
    request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    }, true),

  delete: (id: string) =>
    request<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    }, true),
};
