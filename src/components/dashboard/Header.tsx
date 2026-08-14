"use client";

import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { roleLabel } from "@/lib/roles";

export function Header({ title }: { title: string }) {
  const { profile } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 pb-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-charcoal md:text-3xl">
          {title}
        </h1>
      </div>
      <div className="hidden items-center gap-3 rounded-xl border border-stone bg-white px-4 py-2 sm:flex">
        <div className="text-right">
          <p className="text-sm font-semibold text-charcoal">{profile?.full_name}</p>
          <p className="text-xs text-charcoal/60">
            {profile ? roleLabel(profile.role) : ""}
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/10 text-forest font-bold text-sm">
          {profile?.full_name?.charAt(0) || "?"}
        </span>
      </div>
    </header>
  );
}
