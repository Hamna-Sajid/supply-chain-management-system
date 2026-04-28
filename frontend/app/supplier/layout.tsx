'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupplierSidebar } from '@/components/supplier-sidebar';
import { getToken } from '@/lib/api';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F4F4F4' }}>
      <SupplierSidebar mobileOpen={mobileSidebarOpen} onMobileOpenChange={setMobileSidebarOpen} />

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="bg-white shadow-sm"
          onClick={() => setMobileSidebarOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <span className="text-sm font-semibold text-[#2D6A4F]">Supplier Portal</span>
      </div>

      <main className="flex-1 md:ml-64 p-4 pt-20 md:p-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
