"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  FolderKanban,
  Users,
  CalendarDays,
  Package,
  ArrowRight,
  AlertCircle,
  CheckSquare,
  Bell,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Project, Event, InventoryLog, WeeklyReport, Task, TaskStatus } from "@/types";

export default function DashboardPage() {
  const { profile } = useAuth();
  const supabase = createClient();

  const [stats, setStats] = useState({
    projects: 0,
    members: 0,
    events: 0,
    inventoryOut: 0,
    myTasksCount: 0,
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [inventory, setInventory] = useState<InventoryLog[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!profile?.id) return;

    try {
      const [projectsRes, membersRes, eventsRes, inventoryRes, reportsRes, myTasksRes] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("events").select("*").order("event_date", { ascending: true }).limit(3),
        supabase.from("inventory_logs").select("*").is("returned_at", null).limit(5),
        supabase.from("weekly_reports").select("*, profile:profiles(full_name, department)").limit(3),
        supabase
          .from("tasks")
          .select("*, project:projects(name)")
          .eq("assigned_to", profile.id)
          .order("created_at", { ascending: false }),
      ]);

      setProjects((projectsRes.data as Project[]) || []);
      setEvents((eventsRes.data as Event[]) || []);
      setInventory((inventoryRes.data as InventoryLog[]) || []);
      setReports((reportsRes.data as WeeklyReport[]) || []);
      
      const fetchedTasks = (myTasksRes.data as Task[]) || [];
      setMyTasks(fetchedTasks);

      setStats({
        projects: projectsRes.data?.length || 0,
        members: membersRes.count || 0,
        events: eventsRes.data?.length || 0,
        inventoryOut: inventoryRes.data?.length || 0,
        myTasksCount: fetchedTasks.filter((t) => t.status !== "done").length,
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData();
    }
  }, [profile?.id, supabase]);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
      setMyTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      // Refresh count
      setStats((prev) => ({
        ...prev,
        myTasksCount: myTasks
          .map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
          .filter((t) => t.status !== "done").length,
      }));
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const activeMyTasks = myTasks.filter((t) => t.status !== "done");

  const statCards = [
    { label: "Projects", value: stats.projects, icon: FolderKanban, href: "/dashboard/projects" },
    { label: "Members", value: stats.members, icon: Users, href: "/dashboard/members" },
    { label: "Upcoming Events", value: stats.events, icon: CalendarDays, href: "/dashboard/events" },
    { label: "Inventory Out", value: stats.inventoryOut, icon: Package, href: "/dashboard/inventory" },
  ];

  const renderTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return <Badge variant="default" className="bg-stone-200 text-charcoal">To Do</Badge>;
      case "in_progress":
        return <Badge variant="forest" className="bg-amber-100 text-amber-900 border-amber-300 font-semibold">In Progress</Badge>;
      case "review":
        return <Badge variant="sage" className="bg-blue-100 text-blue-900 border-blue-300 font-semibold">Under Review</Badge>;
      case "done":
        return <Badge variant="success" className="bg-emerald-100 text-emerald-950 border-emerald-300 font-semibold">Done</Badge>;
    }
  };

  return (
    <>
      <Header title="Dashboard" />

      {/* Prominent Task Assignment Notification Alert */}
      {activeMyTasks.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 h-5 w-5 text-amber-700 shrink-0 animate-bounce" />
            <div>
              <p className="text-sm font-bold text-amber-950">
                Task Assignment Notification
              </p>
              <p className="text-xs text-amber-900 mt-0.5">
                You have <strong>{activeMyTasks.length} active task(s)</strong> assigned to you! View details and update your progress status directly below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Sunday Report Deadline Alert */}
      <div className="mb-6 rounded-2xl border border-stone bg-white p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-forest shrink-0" />
          <div>
            <p className="text-sm font-medium text-charcoal">
              Sunday Report Deadline
            </p>
            <p className="text-xs text-charcoal/70">
              Members must upload their weekly work report every Sunday before the Monday review meeting.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
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

      {/* DEDICATED ASSIGNED TASKS WIDGET FOR LOGGED IN USER */}
      <Card className="mt-6 border-forest/30 bg-gradient-to-r from-forest/5 via-white to-forest/5 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-forest/10">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-forest" />
            <CardTitle className="text-base text-charcoal">My Assigned Tasks</CardTitle>
            <span className="rounded-full bg-forest px-2.5 py-0.5 text-xs font-bold text-white">
              {myTasks.length} Assigned
            </span>
          </div>
          <span className="text-xs text-charcoal/60 font-medium">Update progress status directly from dashboard</span>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-3">
            {myTasks.map((t) => (
              <div
                key={t.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-stone/70 bg-white shadow-2xs hover:border-forest/40 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-charcoal text-sm">{t.title}</h4>
                    {t.project?.name && (
                      <Badge variant="forest" className="text-[10px]">
                        {t.project.name}
                      </Badge>
                    )}
                    {renderTaskStatusBadge(t.status)}
                  </div>
                  {t.description && (
                    <p className="text-xs text-charcoal/70 line-clamp-2">{t.description}</p>
                  )}
                  {t.due_date && (
                    <p className="text-[11px] text-charcoal/50 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-600" /> Due: {formatDate(t.due_date)}
                    </p>
                  )}
                </div>

                {/* Direct Interactive Status Selector on Dashboard */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <span className="text-xs text-charcoal/60 font-medium">Status:</span>
                  <Select
                    value={t.status}
                    onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value as TaskStatus)}
                    className="w-36 text-xs py-1.5 font-medium border-forest/30 focus:border-forest"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Under Review</option>
                    <option value="done">Done ✓</option>
                  </Select>
                </div>
              </div>
            ))}

            {myTasks.length === 0 && (
              <div className="py-8 text-center text-charcoal/60">
                <CheckCircle2 className="h-8 w-8 mx-auto text-forest/40 mb-2" />
                <p className="font-medium text-sm">No tasks assigned to you right now.</p>
                <p className="text-xs mt-1">When team leads assign tasks to you, they will appear here automatically.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Projects, Events & Inventory */}
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
