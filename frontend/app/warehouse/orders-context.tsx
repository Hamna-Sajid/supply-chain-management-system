"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface RetailerOrder {
  order_id: string;
  retailer_name: string;
  retailer_location: string;
  order_date: string;
  items: { product: string; qty: number; unit_price: number }[];
  total_amount: number;
  order_status: "pending" | "processing" | "shipped" | "delivered";
  priority: "high" | "medium" | "low";
}

const HARDCODED_ORDERS: RetailerOrder[] = [
  {
    order_id: "ORD-2025-001",
    retailer_name: "Metro Retail Co.",
    retailer_location: "Karachi, Pakistan",
    order_date: "2025-04-28",
    items: [
      { product: "Cotton T-Shirt (M)", qty: 120, unit_price: 18.5 },
      { product: "Denim Jeans (32)", qty: 60, unit_price: 42.0 },
    ],
    total_amount: 4740,
    order_status: "pending",
    priority: "high",
  },
  {
    order_id: "ORD-2025-002",
    retailer_name: "Sunrise Boutique",
    retailer_location: "Lahore, Pakistan",
    order_date: "2025-04-27",
    items: [
      { product: "Formal Shirt (L)", qty: 80, unit_price: 28.0 },
      { product: "Chino Pants (34)", qty: 50, unit_price: 35.0 },
    ],
    total_amount: 3990,
    order_status: "pending",
    priority: "high",
  },
  {
    order_id: "ORD-2025-003",
    retailer_name: "City Fashion Hub",
    retailer_location: "Islamabad, Pakistan",
    order_date: "2025-04-26",
    items: [
      { product: "Polo Shirt (S)", qty: 90, unit_price: 22.0 },
      { product: "Cargo Shorts (30)", qty: 40, unit_price: 26.0 },
    ],
    total_amount: 3020,
    order_status: "processing",
    priority: "medium",
  },
  {
    order_id: "ORD-2025-004",
    retailer_name: "Style Point Retail",
    retailer_location: "Faisalabad, Pakistan",
    order_date: "2025-04-25",
    items: [{ product: "Linen Kurta (XL)", qty: 100, unit_price: 24.5 }],
    total_amount: 2450,
    order_status: "shipped",
    priority: "medium",
  },
  {
    order_id: "ORD-2025-005",
    retailer_name: "Trend Bazaar",
    retailer_location: "Multan, Pakistan",
    order_date: "2025-04-24",
    items: [
      { product: "Shalwar Kameez (M)", qty: 150, unit_price: 20.0 },
      { product: "Dupatta Set", qty: 60, unit_price: 15.0 },
    ],
    total_amount: 3900,
    order_status: "delivered",
    priority: "low",
  },
  {
    order_id: "ORD-2025-006",
    retailer_name: "QuickMart Clothing",
    retailer_location: "Rawalpindi, Pakistan",
    order_date: "2025-04-23",
    items: [{ product: "Winter Jacket (L)", qty: 45, unit_price: 65.0 }],
    total_amount: 2925,
    order_status: "delivered",
    priority: "low",
  },
];

interface OrdersContextValue {
  orders: RetailerOrder[];
  advanceStatus: (orderId: string) => void;
}

const STATUS_FLOW: Record<RetailerOrder["order_status"], RetailerOrder["order_status"] | null> = {
  pending:    "processing",
  processing: "shipped",
  shipped:    "delivered",
  delivered:  null,
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<RetailerOrder[]>(HARDCODED_ORDERS);

  const advanceStatus = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.order_id !== orderId) return o;
        const next = STATUS_FLOW[o.order_status];
        return next ? { ...o, order_status: next } : o;
      })
    );
  };

  return (
    <OrdersContext.Provider value={{ orders, advanceStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}