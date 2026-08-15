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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-stone bg-white lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-stone px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white text-xs font-bold">
          RX
        </span>
        <span className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-forest">
          ROXX
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {visibleNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-forest text-white"
                  : "text-charcoal/70 hover:bg-stone hover:text-charcoal"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-stone p-4">
        <div className="mb-3 rounded-xl bg-cream p-3">
          <p className="text-sm font-semibold text-charcoal">{profile?.full_name || "Loading..."}</p>
          <p className="text-xs text-charcoal/60">
            {profile ? roleLabel(profile.role) : ""} · {profile?.department}
          </p>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
