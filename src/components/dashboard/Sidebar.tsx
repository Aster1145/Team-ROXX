"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CalendarDays,
  FlaskConical,
  FileText,
  Package,
  Wallet,
  BookOpen,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isCaptain, isViceCaptain, isTrainee, roleLabel } from "@/lib/roles";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/learning", label: "Learning Hub", icon: BookOpen },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/research", label: "Research", icon: FlaskConical },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/members", label: "Members", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const isUserTrainee = isTrainee(profile);
  const visibleNav = NAV.filter((item) => {
    if (isUserTrainee) {
      return !["/dashboard/inventory", "/dashboard/budget"].includes(item.href);
    }
    return true;
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors lg:flex">
      {/* App Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-sm shadow-xs">
          RX
        </span>
        <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-slate-900 dark:text-white">
          Team ROXX
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
        {visibleNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                active
                  ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-4">
        <div className="mb-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3 border border-slate-100 dark:border-slate-700/50">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {profile?.full_name || "Loading..."}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {profile ? roleLabel(profile.role) : ""} · {profile?.department}
          </p>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
