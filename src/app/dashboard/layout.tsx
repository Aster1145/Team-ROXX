import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
