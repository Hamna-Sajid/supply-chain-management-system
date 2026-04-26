"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ManufacturerSidebar from "@/components/manufacturer-sidebar";

export default function ManufacturerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ManufacturerSidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}