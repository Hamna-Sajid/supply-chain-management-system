"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Star, Bell, BarChart2, LogOut } from "lucide-react";

const links = [
  { href: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/supplier/materials", label: "Materials", icon: Package },
  { href: "/supplier/orders", label: "Orders", icon: ShoppingCart },
  { href: "/supplier/ratings", label: "Ratings", icon: Star },
  { href: "/supplier/notifications", label: "Notifications", icon: Bell },
  { href: "/supplier/financial-reports", label: "Financial Reports", icon: BarChart2 },
];

export default function SupplierSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-lg font-bold">Supplier Portal</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === href
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 w-full"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}