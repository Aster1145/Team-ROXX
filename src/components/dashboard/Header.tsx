"use client";

import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { roleLabel } from "@/lib/roles";

export function Header({ title }: { title: string }) {
  const { profile } = useAuth();

  return (
    <header className="flex items-center justify-between gap-3 pb-4 sm:pb-6">
      <div className="flex items-center gap-2.5 min-w-0">
        <MobileNav />
        <h1 className="font-[family-name:var(--font-playfair)] text-lg sm:text-2xl md:text-3xl font-bold text-charcoal truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-stone/60 bg-white px-2.5 py-1.5 sm:px-4 sm:py-2 shrink-0 shadow-2xs">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-charcoal leading-tight truncate max-w-[140px]">{profile?.full_name}</p>
          <p className="text-xs text-charcoal/60 leading-tight">
            {profile ? roleLabel(profile.role, profile.department) : ""}
          </p>
        </div>
        <div className="flex flex-col items-end sm:hidden text-right">
          <span className="text-xs font-bold text-charcoal truncate max-w-[90px]">{profile?.full_name?.split(" ")[0]}</span>
          <span className="text-[10px] text-charcoal/60 leading-none">{profile ? roleLabel(profile.role, profile.department) : ""}</span>
        </div>
        <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-forest/10 text-forest font-bold text-xs sm:text-sm shrink-0 border border-forest/20">
          {profile?.full_name?.charAt(0) || "?"}
        </span>
      </div>
    </header>
  );
}
