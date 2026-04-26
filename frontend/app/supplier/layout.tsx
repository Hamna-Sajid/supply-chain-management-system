import SupplierSidebar from "@/components/supplier-sidebar";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SupplierSidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}