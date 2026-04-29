import axios from "axios";

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: any) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("scm_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res: any) => res,
  (error: any) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("scm_token");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ==========================================
// Token Management
// ==========================================
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("scm_token", token);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("scm_token");
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("scm_token");
  }
};

// ==========================================
// Authentication API
// ==========================================
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  signup: async (payload: any) => {
    const response = await api.post("/auth/signup", payload);
    return response.data;
  },
};

// ==========================================
// Manufacturer API
// ==========================================
export const manufacturerApi = {
  getDashboard: async () => {
    const response = await api.get("/manufacturer/dashboard");
    return response.data;
  },
  getRawMaterials: async () => {
    const response = await api.get("/manufacturer/raw-materials");
    return response.data;
  },
  placeOrder: async (payload: any) => {
    const response = await api.post("/manufacturer/orders", payload);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get("/manufacturer/orders");
    return response.data;
  },
  getProducts: async () => {
    const response = await api.get("/manufacturer/products");
    return response.data;
  },
  createProduct: async (payload: any) => {
    const response = await api.post("/manufacturer/products", payload);
    return response.data;
  },
  updateProductStage: async (id: string, production_stage: string) => {
    const response = await api.put(`/manufacturer/products/${id}/stage`, { production_stage });
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/manufacturer/products/${id}`);
    return response.data;
  },
  getInventory: async () => {
    const response = await api.get("/manufacturer/inventory");
    return response.data;
  },
  updateInventoryPrices: async (id: string, payload: any) => {
    const response = await api.put(`/manufacturer/inventory/${id}`, payload);
    return response.data;
  },
  updateProduct: async (id: string, payload: any) => {
    const response = await api.put(`/manufacturer/products/${id}`, payload);
    return response.data;
  },
  updateProductQuantity: async (id: string, quantity: number) => {
    const response = await api.put(`/manufacturer/products/${id}/quantity`, { quantity });
    return response.data;
  },
  getShipments: async () => {
    const response = await api.get("/manufacturer/shipments");
    return response.data;
  },
  createShipment: async (payload: any) => {
    const response = await api.post("/manufacturer/shipments", payload);
    return response.data;
  },
  getWarehouses: async () => {
    const response = await api.get("/manufacturer/warehouses");
    return response.data;
  },
  updateShipmentStatus: async (id: string, status: string) => {
    const response = await api.put(`/manufacturer/shipments/${id}/status`, { status });
    return response.data;
  },
  getPayments: async () => {
    const response = await api.get("/manufacturer/payments");
    return response.data;
  },
  getProductionStages: async () => {
    const response = await api.get("/manufacturer/production-stages");
    return response.data;
  },
};

// ==========================================
// Analytics API
// ==========================================
export const analyticsApi = {
  getDashboard: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },
  getFinancialReport: async () => {
    const response = await api.get("/analytics/financial");
    return response.data;
  },
  getInventoryReport: async () => {
    const response = await api.get("/analytics/inventory");
    return response.data;
  },
  getOrderReport: async () => {
    const response = await api.get("/analytics/orders");
    return response.data;
  },
  getShipmentReport: async () => {
    const response = await api.get("/analytics/shipments");
    return response.data;
  },
  getPerformanceReport: async () => {
    const response = await api.get("/analytics/performance");
    return response.data;
  },
};

// ==========================================
// Analytics Expense API
// ==========================================
export const expenseApi = {
  createExpense: async (payload: any) => {
    const response = await api.post("/analytics/expenses", payload);
    return response.data;
  },
};