'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ManufacturerSidebar } from '@/components/manufacturer-sidebar';
import { getToken } from '@/lib/api';

export default function ManufacturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F4F4F4' }}>
      <ManufacturerSidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
