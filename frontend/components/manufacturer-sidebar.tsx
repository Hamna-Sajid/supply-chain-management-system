"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Factory,
  Box,
  Truck,
  BarChart2,
  ShoppingCart,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const links = [
  { href: "/manufacturer/dashboard",     label: "Dashboard",            icon: LayoutDashboard, exact: true },
  { href: "/manufacturer/materials",     label: "Material Sourcing",    icon: Package },
  { href: "/manufacturer/products",      label: "Product Management",   icon: Factory },
  { href: "/manufacturer/finished-goods",label: "Finished Goods",       icon: Box },
  { href: "/manufacturer/shipments",     label: "Warehouse Shipments",  icon: Truck },
  { href: "/manufacturer/financials",    label: "Financials & Analytics", icon: BarChart2 },
  { href: "/manufacturer/orders",        label: "My Orders",            icon: ShoppingCart, badgeKey: "orders" },
];

export default function ManufacturerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    // Load user info from localStorage
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        setUserName(user.name || user.email || "Manufacturer");
      }
    } catch {
      // ignore
    }

    // Fetch pending order count for badge
    api.get("/manufacturer/orders")
      .then(r => {
        const orders = Array.isArray(r.data) ? r.data : [];
        setPendingOrders(orders.filter((o: { order_status: string }) => o.order_status === "pending").length);
      })
      .catch(() => {/* silent */});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <aside className="w-52 shrink-0 bg-[#1e3d1a] flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <p className="text-white text-lg font-bold tracking-tight">MFG</p>
        <p className="text-[#a8c5a0] text-xs mt-0.5">Manufacturer Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon, exact, badgeKey }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const badge = badgeKey === "orders" && pendingOrders > 0 ? pendingOrders : 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative",
                active
                  ? "bg-white/15 text-white font-medium"
                  : "text-[#a8c5a0] hover:bg-white/10 hover:text-white"
              )}
            >
              {/* Active left bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#4a9d8a] rounded-r-full" />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 leading-none">{label}</span>
              {badge > 0 && (
                <span className="bg-[#4a9d8a] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="px-3 pb-5 pt-2 border-t border-white/10 mt-1">
        {userName && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-[#a8c5a0]" />
            </div>
            <p className="text-[#a8c5a0] text-xs truncate leading-tight">{userName}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-[#a8c5a0] hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}