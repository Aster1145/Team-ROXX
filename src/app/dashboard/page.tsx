"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FolderKanban,
  Users,
  CalendarDays,
  Package,
  FileText,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Project, Event, InventoryLog, WeeklyReport } from "@/types";

export default function DashboardPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState({
    projects: 0,
    members: 0,
    events: 0,
    inventoryOut: 0,
    reportsDue: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [inventory, setInventory] = useState<InventoryLog[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, membersRes, eventsRes, inventoryRes, reportsRes] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("events").select("*").order("event_date", { ascending: true }).limit(3),
        supabase.from("inventory_logs").select("*").is("returned_at", null).limit(5),
        supabase.from("weekly_reports").select("*, profile:profiles(full_name, department)").limit(3),
      ]);

      setProjects((projectsRes.data as Project[]) || []);
      setEvents((eventsRes.data as Event[]) || []);
      setInventory((inventoryRes.data as InventoryLog[]) || []);
      setReports((reportsRes.data as WeeklyReport[]) || []);
      setStats({
        projects: projectsRes.data?.length || 0,
        members: membersRes.count || 0,
        events: eventsRes.data?.length || 0,
        inventoryOut: inventoryRes.data?.length || 0,
        reportsDue: 0,
      });
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const statCards = [
    { label: "Projects", value: stats.projects, icon: FolderKanban, href: "/dashboard/projects" },
    { label: "Members", value: stats.members, icon: Users, href: "/dashboard/members" },
    { label: "Upcoming Events", value: stats.events, icon: CalendarDays, href: "/dashboard/events" },
    { label: "Inventory Out", value: stats.inventoryOut, icon: Package, href: "/dashboard/inventory" },
  ];

  return (
    <>
      <Header title="Dashboard" />

      <div className="mb-6 rounded-2xl border border-stone bg-white p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-forest" />
          <div>
            <p className="text-sm font-medium text-charcoal">
              Sunday report deadline
            </p>
            <p className="text-sm text-charcoal/70">
              Members must upload their weekly work report every Sunday before the Monday review meeting.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-charcoal/60">{s.label}</p>
                  <p className="mt-1 text-3xl font-semibold text-charcoal">{s.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                  <s.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Status</CardTitle>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.slice(0, 4).map((p) => (
                <div key={p.id} className="rounded-xl border border-stone bg-cream p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-charcoal">{p.name}</p>
                      <p className="text-xs text-charcoal/60">{p.department}</p>
                    </div>
                    <Badge variant={p.status === "ongoing" ? "forest" : p.status === "completed" ? "success" : "default"}>
                      {p.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-stone">
                    <div
                      className="h-2 rounded-full bg-forest transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-charcoal/60">No projects yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((e) => (
                  <div key={e.id} className="rounded-xl border border-stone bg-cream p-3">
                    <p className="font-medium text-charcoal">{e.title}</p>
                    <p className="text-xs text-charcoal/60">{formatDate(e.event_date)} · {e.location}</p>
                  </div>
                ))}
                {events.length === 0 && <p className="text-sm text-charcoal/60">No events yet.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventory.map((item) => (
                  <div key={item.id} className="rounded-xl border border-stone bg-cream p-3">
                    <p className="font-medium text-charcoal">{item.item_name}</p>
                    <p className="text-xs text-charcoal/60">
                      {item.profile?.full_name} · {formatDateTime(item.taken_at)}
                    </p>
                  </div>
                ))}
                {inventory.length === 0 && <p className="text-sm text-charcoal/60">All items returned.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Weekly Reports</CardTitle>
            <Link href="/dashboard/reports">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-xl border border-stone bg-cream p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-charcoal">{r.profile?.full_name}</p>
                  <Badge variant="sage">{r.profile?.department}</Badge>
                </div>
                <p className="line-clamp-2 text-sm text-charcoal/70">{r.summary}</p>
                <p className="mt-2 text-xs text-charcoal/50">Week ending {formatDate(r.week_ending)}</p>
              </div>
            ))}
            {reports.length === 0 && <p className="text-sm text-charcoal/60">No reports submitted yet.</p>}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
