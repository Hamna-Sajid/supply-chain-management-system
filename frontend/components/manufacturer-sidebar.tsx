'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Factory,
  Warehouse,
  Truck,
  BarChart3,
  Star,
  LogOut,
} from 'lucide-react';
import { clearToken } from '@/lib/api';

export function ManufacturerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/manufacturer/dashboard', icon: LayoutDashboard },
    { label: 'Material Sourcing', href: '/manufacturer/material-sourcing', icon: ShoppingBag },
    { label: 'Product Management', href: '/manufacturer/product-management', icon: Factory },
    { label: 'Finished Goods', href: '/manufacturer/finished-goods', icon: Warehouse },
    { label: 'Warehouse Shipments', href: '/manufacturer/shipments', icon: Truck },
    { label: 'Financials & Analytics', href: '/manufacturer/financials', icon: BarChart3 },
    { label: 'Ratings & Reviews', href: '/manufacturer/reviews', icon: Star },
  ];

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col shadow-lg"
      style={{ backgroundColor: '#2d6a4f' }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: '#40916c' }}>
        <h1 className="text-2xl font-bold text-white">MFG</h1>
        <p className="text-xs mt-1" style={{ color: '#d8f3dc' }}>Manufacturer Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: isActive ? '#40916c' : 'transparent',
                color: isActive ? 'white' : '#95d5b2',
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: '#40916c' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          style={{
            color: '#d8f3dc',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#40916c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
