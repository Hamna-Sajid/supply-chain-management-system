'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SupplierSidebar } from '@/components/supplier-sidebar';
import { getToken } from '@/lib/api';

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F4F4F4' }}>
      <SupplierSidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
