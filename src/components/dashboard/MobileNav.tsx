"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, LayoutDashboard, FolderKanban, Users, CalendarDays, FlaskConical, FileText, Package, Wallet, BookOpen, Video } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { isTrainee } from "@/lib/roles";

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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useAuth();

  const isUserTrainee = isTrainee(profile);
  const visibleNav = NAV.filter((item) => {
    if (isUserTrainee) {
      return !["/dashboard/inventory", "/dashboard/budget", "/dashboard/meetings"].includes(item.href);
    }
    return true;
  });

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900/10 dark:bg-white/10 ring-1 ring-slate-900/10 dark:ring-white/20 shadow-xs">
                  <img
                    src="/images/roxx-logo.png"
                    alt="ROXX Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-slate-900 dark:text-white">
                  Team <span className="text-orange-500 dark:text-orange-400">ROXX</span>
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 space-y-1.5">
              {visibleNav.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-all",
                      active
                        ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
