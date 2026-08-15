"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  FolderKanban,
  Users,
  Package,
  CheckSquare,
  FlaskConical,
  FileText,
  Video,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Project" | "Member" | "Inventory" | "Task" | "Research" | "Report" | "Meeting";
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const supabase = createClient();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const q = val.toLowerCase().trim();

    try {
      const [projectsRes, membersRes, inventoryRes, tasksRes, researchRes, reportsRes] =
        await Promise.all([
          supabase.from("projects").select("id, name, department").ilike("name", `%${q}%`).limit(3),
          supabase.from("profiles").select("id, full_name, role, department").ilike("full_name", `%${q}%`).limit(3),
          supabase.from("inventory_logs").select("id, item_name, purpose").ilike("item_name", `%${q}%`).limit(3),
          supabase.from("tasks").select("id, title, status").ilike("title", `%${q}%`).limit(3),
          supabase.from("research_docs").select("id, title, content").ilike("title", `%${q}%`).limit(3),
          supabase.from("weekly_reports").select("id, summary, week_ending").ilike("summary", `%${q}%`).limit(3),
        ]);

      const items: SearchResultItem[] = [];

      (projectsRes.data || []).forEach((p: any) => {
        items.push({
          id: `proj-${p.id}`,
          title: p.name,
          subtitle: p.department || "Project",
          category: "Project",
          href: "/dashboard/projects",
        });
      });

      (membersRes.data || []).forEach((m: any) => {
        items.push({
          id: `mem-${m.id}`,
          title: m.full_name,
          subtitle: `${m.role?.toUpperCase() || "MEMBER"} · ${m.department}`,
          category: "Member",
          href: "/dashboard/members",
        });
      });

      (inventoryRes.data || []).forEach((i: any) => {
        items.push({
          id: `inv-${i.id}`,
          title: i.item_name,
          subtitle: i.purpose || "Inventory Item",
          category: "Inventory",
          href: "/dashboard/inventory",
        });
      });

      (tasksRes.data || []).forEach((t: any) => {
        items.push({
          id: `task-${t.id}`,
          title: t.title,
          subtitle: `Status: ${t.status.toUpperCase()}`,
          category: "Task",
          href: "/dashboard",
        });
      });

      (researchRes.data || []).forEach((r: any) => {
        items.push({
          id: `res-${r.id}`,
          title: r.title,
          subtitle: "Research Document",
          category: "Research",
          href: "/dashboard/research",
        });
      });

      (reportsRes.data || []).forEach((rep: any) => {
        items.push({
          id: `rep-${rep.id}`,
          title: `Weekly Report (${rep.week_ending})`,
          subtitle: rep.summary?.slice(0, 60) || "Weekly Report",
          category: "Report",
          href: "/dashboard/reports",
        });
      });

      setResults(items);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: SearchResultItem["category"]) => {
    switch (category) {
      case "Project":
        return <FolderKanban className="h-4 w-4 text-blue-500" />;
      case "Member":
        return <Users className="h-4 w-4 text-emerald-500" />;
      case "Inventory":
        return <Package className="h-4 w-4 text-amber-500" />;
      case "Task":
        return <CheckSquare className="h-4 w-4 text-purple-500" />;
      case "Research":
        return <FlaskConical className="h-4 w-4 text-indigo-500" />;
      case "Report":
        return <FileText className="h-4 w-4 text-rose-500" />;
      case "Meeting":
        return <Video className="h-4 w-4 text-emerald-500" />;
    }
  };

  const handleSelectResult = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
      {/* Search Bar Input pill styled identically to reference UI */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search projects, members, tasks..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setIsOpen(true);
            handleSearch(e.target.value);
          }}
          className="w-full h-10 pl-9 pr-9 text-xs sm:text-sm font-medium rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200/80 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="absolute right-3.5 hidden sm:flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 pointer-events-none">
            ⌘K
          </span>
        )}
      </div>

      {/* Live Search Results Dropdown */}
      {isOpen && query.trim() !== "" && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-0 sm:right-0 top-20 sm:top-12 z-50 w-auto sm:w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 p-3 shadow-2xl backdrop-blur-md transition-all">
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Search Results ({results.length})
            </span>
            {loading && <span className="text-xs text-slate-400 animate-pulse">Searching...</span>}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1">
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectResult(item.href)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.category}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </div>
              </button>
            ))}

            {!loading && results.length === 0 && (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500">
                <Sparkles className="h-6 w-6 mx-auto mb-1 opacity-40" />
                <p className="text-xs font-medium">No matches found for "{query}"</p>
                <p className="text-[11px] mt-0.5">Try searching for project names, member names, or tasks.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
