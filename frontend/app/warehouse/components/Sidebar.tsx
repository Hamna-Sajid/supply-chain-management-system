"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Truck, Package, ShoppingCart, BarChart2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/warehouse", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/warehouse/shipments", label: "Incoming Shipments", icon: Truck },
  { href: "/warehouse/inventory", label: "Warehouse Inventory", icon: Package },
  { href: "/warehouse/orders", label: "Retailer Orders", icon: ShoppingCart },
  { href: "/warehouse/financials", label: "Financials & Analytics", icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="w-52 shrink-0 bg-[#2d5a27] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <p className="text-white text-xl font-bold">WMS</p>
        <p className="text-[#a8c5a0] text-xs mt-0.5">{user?.name || "Warehouse Manager"}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-white/15 text-white font-medium"
                  : "text-[#a8c5a0] hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-6 pt-2">
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
