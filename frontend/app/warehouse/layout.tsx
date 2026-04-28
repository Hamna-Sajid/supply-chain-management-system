"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={sidebarOpen} onMobileOpenChange={setSidebarOpen} />
      
      {/* On desktop, push the content right by 64 (16rem/256px) to make room for the fixed sidebar */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* You probably need a mobile header here to trigger setSidebarOpen(true) */}
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
