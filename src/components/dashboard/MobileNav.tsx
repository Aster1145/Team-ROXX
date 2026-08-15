"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, LayoutDashboard, FolderKanban, Users, CalendarDays, FlaskConical, FileText, Package, Wallet, BookOpen } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useAuth();

  const isUserTrainee = profile?.role === "trainee";
  const visibleNav = NAV.filter((item) => {
    if (isUserTrainee) {
      return !["/dashboard/inventory", "/dashboard/budget", "/dashboard/members"].includes(item.href);
    }
    return true;
  });

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone bg-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-cream p-4">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-forest">
              ROXX
            </span>
            <button
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone bg-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-8 space-y-2">
            {visibleNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                    active ? "bg-forest text-white" : "text-charcoal/70"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
