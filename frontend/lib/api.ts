const BASE_URL = 'http://localhost:5000';

// ─── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('scm_token') : null;

export const setToken = (token: string): void =>
  localStorage.setItem('scm_token', token);

export const clearToken = (): void =>
  localStorage.removeItem('scm_token');

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
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth API ──────────────────────────────────────────────────────────────────
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  contact_number?: string;
  address?: string;
}

/** Returned by POST /auth/login */
export interface LoginResponse {
  token: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: string;
  };
}

/** Returned by POST /auth/signup (no token — call login separately) */
export interface SignupResponse {
  message: string;
  user: {
    user_id: string;
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

// ─── Supplier API ──────────────────────────────────────────────────────────────
export interface Material {
  material_id: string;
  material_name: string;
  description?: string;
  quantity_available: number;
  unit_price: number;
  last_updated_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  expense_id: string;
  amount: number;
  category: string;
  expense_update_date: string;
}

export interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at?: string;
  manufacturer?: {
    name: string;
  };
}

export interface AddMaterialPayload {
  material_name: string;
  description?: string;
  quantity_available: number;
  unit_price: number;
}

export interface UpdateMaterialPayload {
  material_name?: string;
  description?: string;
  quantity_available?: number;
  unit_price?: number;
}

export interface AddExpensePayload {
  amount: number;
  category: string;
  description?: string;
}

export const supplierApi = {
  getMaterials: () =>
    request<Material[]>('/supplier/materials', {}, true),

  addMaterial: (payload: AddMaterialPayload) =>
    request<Material>('/supplier/materials', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true),

  updateMaterial: (id: string, payload: UpdateMaterialPayload) =>
    request<Material>(`/supplier/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, true),

  deleteMaterial: (id: string) =>
    request<void>(`/supplier/materials/${id}`, {
      method: 'DELETE',
    }, true),

  getExpenses: () =>
    request<Expense[]>('/supplier/expenses', {}, true),

  addExpense: (payload: AddExpensePayload) =>
    request<Expense>('/supplier/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true),

  getOrders: () =>
    request<Order[]>('/supplier/orders', {}, true),

  patchOrderStatus: (id: string, status: string) =>
    request<Order>(`/supplier/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true),
};
