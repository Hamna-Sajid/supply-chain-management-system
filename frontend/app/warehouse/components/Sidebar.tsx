'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  LayoutDashboard,
  Truck,
  Package,
  ShoppingCart,
  BarChart2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/warehouse", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/warehouse/shipments", label: "Incoming Shipments", icon: Truck },
    { href: "/warehouse/inventory", label: "Warehouse Inventory", icon: Package },
    { href: "/warehouse/orders", label: "Retailer Orders", icon: ShoppingCart },
    { href: "/warehouse/financials", label: "Financials & Analytics", icon: BarChart2 },
  ];

  // Modified slightly to handle exact matches (for the dashboard root)
  const isActive = (href: string, exact?: boolean) => 
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.push('/');
    onMobileOpenChange?.(false);
  };

  const closeMobileSidebar = () => onMobileOpenChange?.(false);

  const navList = (
    <>
      <div className="p-6 border-b border-[#40916C] flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">WMS</h1>
          <p className="text-sm text-[#52B788] mt-1">{user?.name || "Warehouse Manager"}</p>
        </div>
        {onMobileOpenChange && (
          <button
            onClick={closeMobileSidebar}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-[#40916C] transition-colors"
            aria-label="Close sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#40916C] text-white'
                      : 'text-white hover:bg-[#40916C]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#40916C]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#40916C] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#2D6A4F] text-white hidden md:flex flex-col z-40">
        {navList}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-64 p-0 bg-[#2D6A4F] text-white border-r border-[#40916C] md:hidden">
          <div className="h-full flex flex-col">{navList}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}