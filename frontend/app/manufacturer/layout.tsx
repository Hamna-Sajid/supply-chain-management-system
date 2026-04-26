import ManufacturerSidebar from "@/components/manufacturer-sidebar";
export default function ManufacturerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <ManufacturerSidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}