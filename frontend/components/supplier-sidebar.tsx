'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Star,
  Bell,
  LogOut,
} from 'lucide-react';
import { clearToken } from '@/lib/api';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface SupplierSidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function SupplierSidebar({ mobileOpen = false, onMobileOpenChange }: SupplierSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/supplier/dashboard', icon: LayoutDashboard },
    { label: 'Materials Catalog', href: '/supplier/materials', icon: Package },
    { label: 'Manufacturer Orders', href: '/supplier/orders', icon: ShoppingCart },
    { label: 'Financials', href: '/supplier/financials', icon: BarChart3 },
    { label: 'Ratings & Reviews', href: '/supplier/ratings', icon: Star },
    { label: 'Notifications', href: '/supplier/notifications', icon: Bell },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  const handleLogout = () => {
    clearToken();
    router.push('/');
    onMobileOpenChange?.(false);
  };

  const closeMobileSidebar = () => onMobileOpenChange?.(false);

  const navList = (
    <>
      <div className="p-6 border-b border-[#40916C] flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">SCM Supplier</h1>
          <p className="text-sm text-[#52B788] mt-1">Supplier Portal</p>
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
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
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
