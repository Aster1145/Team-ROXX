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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isCaptain, isViceCaptain, isTrainee, roleLabel } from "@/lib/roles";
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
      {/* App Brand Header & Toggle Button */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-slate-100 dark:border-slate-800 transition-all px-4",
          isCollapsed ? "justify-center gap-0" : "justify-between"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-sm shadow-xs">
            RX
          </span>
          {!isCollapsed && (
            <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-slate-900 dark:text-white truncate">
              Team ROXX
            </span>
          )}
        </div>

        {/* Minimize / Expand Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          title={isCollapsed ? "Expand Sidebar (⌘B)" : "Minimize Sidebar (⌘B)"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List - Apple macOS Dock Style for Minimized View */}
      <nav
        className={cn(
          "flex-1 space-y-2 overflow-y-auto py-6 transition-all",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        {visibleNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));

          if (isCollapsed) {
            // MINIMIZED DOCK MODE: Apple macOS Dock Style Icon with Magnification & Glassmorphic Tooltip
            return (
              <div key={item.href} className="relative flex justify-center group py-1">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ease-out transform group-hover:scale-125 group-hover:z-50 shadow-2xs",
                    active
                      ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                </Link>

                {/* Apple macOS Dock Floating Tooltip Pill */}
                <span className="absolute left-16 top-1/2 -translate-y-1/2 z-50 ml-3 hidden group-hover:flex items-center px-3 py-1.5 text-xs font-bold font-[family-name:var(--font-playfair)] rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white dark:text-slate-100 shadow-2xl backdrop-blur-md border border-slate-700/60 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-150 pointer-events-none">
                  {item.label}
                  <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
                </span>
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
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              onClick={signOut}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200 transform hover:scale-125"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {/* macOS Tooltip for Sign Out */}
              <span className="absolute left-16 top-1/2 -translate-y-1/2 z-50 ml-3 hidden group-hover:flex items-center px-3 py-1.5 text-xs font-bold rounded-xl bg-red-600 text-white shadow-xl backdrop-blur-md whitespace-nowrap animate-in fade-in duration-150 pointer-events-none">
                Sign Out
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
