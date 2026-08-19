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
  Video,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isTrainee, roleLabel } from "@/lib/roles";
import { useSidebar } from "@/context/SidebarContext";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/learning", label: "Learning Hub", icon: BookOpen },
  { href: "/dashboard/meetings", label: "Meetings", icon: Video },
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
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isUserTrainee = isTrainee(profile);
  const visibleNav = NAV.filter((item) => {
    if (isUserTrainee) {
      return !["/dashboard/inventory", "/dashboard/budget", "/dashboard/meetings"].includes(item.href);
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out lg:flex",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* App Brand Header */}
      {!isCollapsed ? (
        // EXPANDED HEADER
        <div className="flex h-16 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900/10 dark:bg-white/10 ring-1 ring-slate-900/10 dark:ring-white/20 shadow-xs">
              <img
                src="/images/roxx-logo.png"
                alt="ROXX Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-slate-900 dark:text-white truncate">
              Team <span className="text-orange-500 dark:text-orange-400">ROXX</span>
            </span>
          </div>

          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Minimize Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      ) : (
        // MINIMIZED HEADER (Clean centered expand button, no overlap)
        <div className="flex h-16 items-center justify-center border-b border-slate-100 dark:border-slate-800 px-2">
          <button
            onClick={toggleSidebar}
            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-900/10 dark:bg-white/10 ring-1 ring-slate-900/10 dark:ring-white/20 shadow-xs hover:scale-110 transition-all"
            title="Expand Sidebar"
          >
            <img
              src="/images/roxx-logo.png"
              alt="ROXX Logo"
              className="h-full w-full object-cover"
            />
            <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <PanelLeftOpen className="h-2.5 w-2.5" />
            </span>

            {/* Fixed Tooltip for Brand Toggle */}
            <div className="fixed left-20 z-[100] ml-3 hidden group-hover:flex items-center px-3 py-1.5 text-xs font-bold font-[family-name:var(--font-playfair)] rounded-xl bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 shadow-2xl border border-slate-700/80 whitespace-nowrap pointer-events-none animate-in fade-in duration-150">
              Expand Sidebar (Team ROXX)
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
            </div>
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav
        className={cn(
          "flex-1 space-y-2 overflow-y-auto py-6 transition-all",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        {visibleNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));

          if (isCollapsed) {
            // MINIMIZED DOCK MODE: Apple macOS Dock Style Icon with Magnification & Fixed Glassmorphic Tooltip
            return (
              <div key={item.href} className="relative flex justify-center group py-1.5">
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ease-out transform group-hover:scale-125 group-hover:z-50 shadow-2xs",
                    active
                      ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                </Link>

                {/* Apple macOS Dock Floating Tooltip Pill (Fixed positioning prevents clipping) */}
                <div className="fixed left-20 z-[100] ml-3 hidden group-hover:flex items-center px-3 py-1.5 text-xs font-bold font-[family-name:var(--font-playfair)] rounded-xl bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 shadow-2xl border border-slate-700/80 whitespace-nowrap pointer-events-none animate-in fade-in duration-150">
                  {item.label}
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
                </div>
              </div>
            );
          }

          // EXPANDED MODE: Full Menu Item
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
      <div className="border-t border-slate-100 dark:border-slate-800 p-3">
        {!isCollapsed ? (
          <>
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <button
              onClick={signOut}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200 transform hover:scale-125"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {/* Fixed Tooltip for Sign Out */}
              <div className="fixed left-20 z-[100] ml-3 hidden group-hover:flex items-center px-3 py-1.5 text-xs font-bold rounded-xl bg-red-600 text-white shadow-2xl border border-red-700 whitespace-nowrap pointer-events-none animate-in fade-in duration-150">
                Sign Out
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-red-600" />
              </div>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
