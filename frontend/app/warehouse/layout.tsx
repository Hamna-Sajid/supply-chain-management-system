"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { OrdersProvider } from "./orders-context";

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // OrdersProvider wraps everything so order state survives tab navigation
    <OrdersProvider>
      <div className="min-h-screen bg-background">
        <Sidebar mobileOpen={sidebarOpen} onMobileOpenChange={setSidebarOpen} />

        <div className="md:pl-64 flex flex-col min-h-screen">
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </OrdersProvider>
  );
}
