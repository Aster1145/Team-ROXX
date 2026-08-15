"use client";

import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { roleLabel } from "@/lib/roles";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsPopover } from "./NotificationsPopover";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ title }: { title: string }) {
  const { profile } = useAuth();

  return (
    <header className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 dark:border-slate-800/80 mb-6">
      {/* Title & Mobile Nav */}
      <div className="flex items-center gap-3 min-w-0">
        <MobileNav />
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold font-[family-name:var(--font-playfair)] text-slate-900 dark:text-slate-100 truncate">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Welcome back, <strong className="text-slate-800 dark:text-slate-200">{profile?.full_name || "Teammate"}</strong>
          </p>
        </div>
      </div>

      {/* Header Actions: Search, Notifications, Theme Switcher, Profile Avatar */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
        {/* Global Search Bar */}
        <div className="flex-1 sm:flex-initial min-w-0">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell Icon & Popover */}
          <NotificationsPopover />

          {/* Sun / Moon Theme Switcher */}
          <ThemeToggle />

          {/* User Profile Badge Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800 px-3 py-1.5 shadow-2xs">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                {profile?.full_name}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-none">
                {profile ? roleLabel(profile.role, profile.department) : ""}
              </p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold text-xs shrink-0 shadow-xs">
              {profile?.full_name?.charAt(0) || "?"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
