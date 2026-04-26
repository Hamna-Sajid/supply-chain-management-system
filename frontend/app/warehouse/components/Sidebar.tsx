"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/warehouse", label: "Dashboard", icon: LayoutDashboard },
  { href: "/warehouse/shipments", label: "Shipments", icon: Package },
  { href: "/warehouse/inventory", label: "Inventory", icon: Boxes },
  { href: "/warehouse/orders", label: "Orders", icon: ShoppingCart },
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
    <aside className="w-56 shrink-0 bg-[#0f0f0f] border-r border-[#1e1e1e] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-1.5 h-1.5 bg-[#c8b86a]" />
          <span className="text-[9px] tracking-[0.3em] text-[#c8b86a] uppercase font-mono">
            Supply Chain OS
          </span>
        </div>
        <p className="text-[13px] font-mono font-semibold text-[#e8e4dc] tracking-tight pl-3.5">
          Warehouse
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/warehouse"
              ? pathname === "/warehouse"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 font-mono text-xs tracking-wide transition-all",
                active
                  ? "bg-[#c8b86a]/10 text-[#c8b86a] border-l-2 border-[#c8b86a]"
                  : "text-[#555] hover:text-[#999] hover:bg-[#1a1a1a] border-l-2 border-transparent"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-[#1e1e1e] pt-4 space-y-3">
        <div className="px-3">
          <p className="text-[10px] font-mono text-[#666] tracking-wider uppercase mb-0.5">
            Signed in as
          </p>
          <p className="text-xs font-mono text-[#e8e4dc] truncate">{user?.name}</p>
          <p className="text-[10px] font-mono text-[#444] truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 font-mono text-xs text-[#555] hover:text-red-400 hover:bg-red-950/20 transition-all border-l-2 border-transparent hover:border-red-800"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
