"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/context/NotificationContext";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DEPARTMENTS } from "@/lib/constants";
import { canAccessMeetings, canScheduleMeetings, roleLabel } from "@/lib/roles";
import { ScheduledMeeting } from "@/types";
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Copy,
  Check,
  ExternalLink,
  Pencil,
  Trash2,
  Lock,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Initial Demo Meetings if Supabase table is fresh
const INITIAL_MEETINGS: ScheduledMeeting[] = [
  {
    id: "m-1",
    title: "Weekly Aero Mechanics & CAD Review",
    description: "Reviewing carbon fiber chassis, wing airfoils, and battery box weight optimization.",
    meet_url: "https://meet.google.com/roxx-aero-sync",
    meeting_date: "2026-08-16",
    start_time: "10:00",
    end_time: "11:30",
    target_department: "Aero Mechanics",
    scheduled_by: "cap-1",
    created_at: new Date().toISOString(),
    organizer: { full_name: "Shreyas R", role: "captain", department: "System Integration" },
  },
  {
    id: "m-2",
    title: "Full Team Flight Test & Operations Sync",
    description: "Pre-flight safety inspection, telemetry check, and task distribution for NIDAR-2026 drone test.",
    meet_url: "https://meet.google.com/roxx-flight-ops",
    meeting_date: "2026-08-17",
    start_time: "16:00",
    end_time: "17:00",
    target_department: "All Team",
    scheduled_by: "vc-1",
    created_at: new Date().toISOString(),
    organizer: { full_name: "Lekh Rathod", role: "vice_captain", department: "Software" },
  },
  {
    id: "m-3",
    title: "Electronics & Flight Controller Telemetry Integration",
    description: "Debugging MAVLink message streaming and motor ESC calibration protocol.",
    meet_url: "https://meet.google.com/roxx-elec-sync",
    meeting_date: "2026-08-18",
    start_time: "14:30",
    end_time: "15:30",
    target_department: "Electronics",
    scheduled_by: "cap-1",
    created_at: new Date().toISOString(),
    organizer: { full_name: "Shreyas R", role: "captain", department: "System Integration" },
  },
];

export default function MeetingsPage() {
  const { profile } = useAuth();
  const { addNotification } = useNotifications();
  const supabase = createClient();

  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filterTab, setFilterTab] = useState<"upcoming" | "all" | "past">("upcoming");
  const [deptFilter, setDeptFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    meet_url: "",
    meeting_date: new Date().toISOString().split("T")[0],
    start_time: "10:00",
    end_time: "11:00",
    target_department: "All Team",
  });

  const userCanAccess = canAccessMeetings(profile);
  const userCanSchedule = canScheduleMeetings(profile);

  useEffect(() => {
    fetchMeetings();
  }, []);

  async function fetchMeetings() {
    try {
      setLoading(true);

      // Read deleted meeting IDs from localStorage so deleted items NEVER return upon refresh
      let deletedIds: string[] = [];
      try {
        const savedDel = localStorage.getItem("team_roxx_deleted_meeting_ids");
        if (savedDel) deletedIds = JSON.parse(savedDel);
      } catch (e) {}

      // Attempt to load from Supabase scheduled_meetings table
      const { data, error } = await supabase
        .from("scheduled_meetings")
        .select("*, organizer:profiles!scheduled_by(full_name, role, department)")
        .order("meeting_date", { ascending: true });

      if (error || !data || data.length === 0) {
        // Fallback to local state / initial meetings
        const saved = localStorage.getItem("team_roxx_meetings");
        let baseList: ScheduledMeeting[] = INITIAL_MEETINGS;
        if (saved) {
          try {
            baseList = JSON.parse(saved);
          } catch (e) {
            baseList = INITIAL_MEETINGS;
          }
        }
        const cleanList = baseList.filter((m) => !deletedIds.includes(m.id));
        setMeetings(cleanList);
      } else {
        const cleanData = data.filter((m: any) => !deletedIds.includes(m.id));
        setMeetings(cleanData);
      }
    } catch (e) {
      setMeetings(INITIAL_MEETINGS);
    } finally {
      setLoading(false);
    }
  }

  function saveMeetingsState(newMeetings: ScheduledMeeting[]) {
    setMeetings(newMeetings);
    try {
      localStorage.setItem("team_roxx_meetings", JSON.stringify(newMeetings));
    } catch (e) {
      // Ignore storage errors
    }
  }

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      meet_url: "https://meet.google.com/new",
      meeting_date: new Date().toISOString().split("T")[0],
      start_time: "10:00",
      end_time: "11:00",
      target_department: "All Team",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m: ScheduledMeeting) => {
    setEditingId(m.id);
    setForm({
      title: m.title,
      description: m.description || "",
      meet_url: m.meet_url,
      meeting_date: m.meeting_date,
      start_time: m.start_time,
      end_time: m.end_time,
      target_department: m.target_department || "All Team",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.meeting_date || !form.start_time || !form.end_time) return;

    let meetUrl = form.meet_url.trim();
    if (!meetUrl) {
      meetUrl = "https://meet.google.com/roxx-team-sync";
    } else if (!meetUrl.startsWith("http://") && !meetUrl.startsWith("https://")) {
      meetUrl = `https://${meetUrl}`;
    }

    if (editingId) {
      const updated = meetings.map((m) =>
        m.id === editingId
          ? {
              ...m,
              title: form.title,
              description: form.description,
              meet_url: meetUrl,
              meeting_date: form.meeting_date,
              start_time: form.start_time,
              end_time: form.end_time,
              target_department: form.target_department,
            }
          : m
      );
      saveMeetingsState(updated);
    } else {
      const newMeeting: ScheduledMeeting = {
        id: `meet-${Date.now()}`,
        title: form.title,
        description: form.description,
        meet_url: meetUrl,
        meeting_date: form.meeting_date,
        start_time: form.start_time,
        end_time: form.end_time,
        target_department: form.target_department,
        scheduled_by: profile?.id || "captain",
        created_at: new Date().toISOString(),
        organizer: {
          full_name: profile?.full_name || "Captain",
          role: profile?.role || "captain",
          department: profile?.department,
        },
      };

      // Attempt Supabase insert if table exists
      try {
        await supabase.from("scheduled_meetings").insert([
          {
            title: form.title,
            description: form.description,
            meet_url: meetUrl,
            meeting_date: form.meeting_date,
            start_time: form.start_time,
            end_time: form.end_time,
            target_department: form.target_department,
            scheduled_by: profile?.id,
          },
        ]);
      } catch (err) {
        // Fallback to local storage
      }

      saveMeetingsState([newMeeting, ...meetings]);

      // Push notification to team members in Notification Center
      addNotification({
        title: `📅 Scheduled Meeting: ${form.title}`,
        message: `Google Meet call set for ${form.meeting_date} at ${form.start_time} IST (${form.target_department}). Click to join call!`,
        type: "meeting",
        link: "/dashboard/meetings",
      });
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the scheduled meeting "${title}"?`)) return;

    // 1. Instantly update React state & save remaining meetings
    const remaining = meetings.filter((m) => m.id !== id);
    saveMeetingsState(remaining);

    // 2. Persist deleted ID in localStorage so page refresh NEVER restores it
    try {
      const saved = localStorage.getItem("team_roxx_deleted_meeting_ids");
      const existing: string[] = saved ? JSON.parse(saved) : [];
      if (!existing.includes(id)) {
        localStorage.setItem("team_roxx_deleted_meeting_ids", JSON.stringify([...existing, id]));
      }
    } catch (e) {}

    // 3. Delete from Supabase database table
    try {
      const { error } = await supabase.from("scheduled_meetings").delete().eq("id", id);
      if (error) console.warn("Supabase delete meeting warning:", error);
    } catch (e) {
      console.warn("Failed to delete meeting:", e);
    }
  };

  // Helper to calculate status (Live, Upcoming, Past)
  const getMeetingStatus = (m: ScheduledMeeting) => {
    const today = new Date().toISOString().split("T")[0];
    if (m.meeting_date < today) return "past";
    if (m.meeting_date > today) return "upcoming";

    // Today: check time
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const [sH, sM] = m.start_time.split(":").map(Number);
    const [eH, eM] = m.end_time.split(":").map(Number);

    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;

    if (currentMin >= startMin && currentMin <= endMin) return "live";
    if (currentMin < startMin) return "upcoming";
    return "past";
  };

  const filteredMeetings = meetings.filter((m) => {
    const status = getMeetingStatus(m);

    if (filterTab === "upcoming" && status === "past") return false;
    if (filterTab === "past" && status !== "past") return false;

    if (deptFilter !== "all" && m.target_department !== "All Team" && m.target_department !== deptFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = m.description?.toLowerCase().includes(q) || false;
      const matchOrg = m.organizer?.full_name.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchOrg) return false;
    }

    return true;
  });

  // ACCESS GATE: Restricted to Members, Vice Captains, and Captains
  if (!userCanAccess) {
    return (
      <>
        <Header title="Meeting Schedule & Google Meet" />
        <Card className="max-w-2xl mx-auto border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-slate-900 dark:text-slate-100 mb-2">
            Restricted Section: Team Meetings
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
            The Meeting Schedule section is reserved exclusively for <strong>Team Members</strong>, <strong>Vice Captains</strong>, and <strong>Captains</strong>.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span>Signed in as:</span>
            <Badge variant="sage">{roleLabel(profile?.role, profile?.department)}</Badge>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <Header title="Meeting Schedule & Google Meet" />

      {/* Top Header & Action Row */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Official Team ROXX video calls. Only <strong>Vice Captain</strong> and <strong>Captain</strong> can schedule new Google Meet calls.
          </p>
        </div>

        {userCanSchedule && (
          <Button
            onClick={handleOpenCreate}
            className="gap-2 shrink-0 self-start sm:self-auto font-bold bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-emerald-400 shadow-md"
          >
            <Video className="h-4 w-4 shrink-0 text-emerald-400 dark:text-slate-950" /> Schedule Meeting
          </Button>
        )}
      </div>

      {/* Controls & Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 w-fit">
          <button
            onClick={() => setFilterTab("upcoming")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
              filterTab === "upcoming"
                ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Upcoming & Live
          </button>
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
              filterTab === "all"
                ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            All Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setFilterTab("past")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
              filterTab === "past"
                ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Past Meetings
          </button>
        </div>

        {/* Search & Department Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full sm:w-44 text-xs h-9"
          >
            <option value="all">All Departments</option>
            <option value="All Team">All Team Sync</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredMeetings.map((m) => {
          const status = getMeetingStatus(m);
          const isLive = status === "live";
          const isPast = status === "past";

          return (
            <Card
              key={m.id}
              className={`hover:shadow-md transition-all flex flex-col justify-between border-slate-200/80 dark:border-slate-800 ${
                isLive
                  ? "ring-2 ring-emerald-500 dark:ring-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20"
                  : isPast
                  ? "opacity-75 bg-slate-50/50 dark:bg-slate-900/40"
                  : "bg-white dark:bg-slate-900"
              }`}
            >
              <CardHeader className="pb-3 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                      <Video className={`h-4 w-4 ${isLive ? "text-emerald-500 animate-pulse" : "text-slate-600 dark:text-slate-300"}`} />
                    </div>
                    <Badge variant={m.target_department === "All Team" ? "sage" : "forest"} className="text-[10px]">
                      {m.target_department || "All Team"}
                    </Badge>
                  </div>

                  {/* Status Badge */}
                  {isLive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2.5 py-1 text-[10px] font-extrabold border border-red-500/30 animate-pulse">
                      🔴 LIVE NOW
                    </span>
                  ) : isPast ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 text-[10px] font-bold">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 text-[10px] font-bold border border-emerald-500/30">
                      ⏰ Upcoming
                    </span>
                  )}
                </div>

                <CardTitle className="text-base sm:text-lg font-bold font-[family-name:var(--font-playfair)] text-slate-900 dark:text-slate-100 leading-snug">
                  {m.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-0 p-4 sm:p-5">
                {m.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 italic">
                    {m.description}
                  </p>
                )}

                {/* Date & Time Info */}
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold">{formatDate(m.meeting_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">
                      {m.start_time} - {m.end_time} IST
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Join Google Meet & Copy Link */}
                <div className="space-y-2 pt-1">
                  <a
                    href={m.meet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold transition-all shadow-sm ${
                      isLive
                        ? "bg-red-600 hover:bg-red-700 text-white animate-bounce shadow-md"
                        : "bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-slate-950"
                    }`}
                  >
                    <Video className="h-4 w-4 shrink-0" />
                    Join Google Meet <ExternalLink className="h-3 w-3 shrink-0 ml-0.5" />
                  </a>

                  <button
                    onClick={() => handleCopyLink(m.id, m.meet_url)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied Meet Link!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" /> Copy Meet Link
                      </>
                    )}
                  </button>
                </div>

                {/* Footer Info & Admin Actions */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>
                    Scheduled by: <strong className="text-slate-800 dark:text-slate-200">{m.organizer?.full_name || "Captain / Vice Captain"}</strong>
                  </span>

                  {userCanSchedule && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Edit Meeting"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.title)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                        title="Delete Meeting"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredMeetings.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
            <Video className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-sm">No scheduled meetings found.</p>
            {userCanSchedule && (
              <Button size="sm" onClick={handleOpenCreate} className="mt-3 text-xs gap-1.5 font-bold">
                <Plus className="h-3.5 w-3.5" /> Schedule Google Meet
              </Button>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Schedule or Edit Google Meet Meeting */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Scheduled Meeting" : "Schedule Google Meet Meeting"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Meeting Title *
            </label>
            <Input
              placeholder="e.g. Weekly Aero Mechanics & CAD Review"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Google Meet Link *
            </label>
            <Input
              type="url"
              placeholder="https://meet.google.com/abc-defg-hij"
              required
              value={form.meet_url}
              onChange={(e) => setForm({ ...form, meet_url: e.target.value })}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Create a link on <a href="https://meet.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline">meet.google.com</a> and paste it here.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Meeting Date *
              </label>
              <Input
                type="date"
                required
                value={form.meeting_date}
                onChange={(e) => setForm({ ...form, meeting_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Start Time *
              </label>
              <Input
                type="time"
                required
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                End Time *
              </label>
              <Input
                type="time"
                required
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Target Audience / Department
            </label>
            <Select
              value={form.target_department}
              onChange={(e) => setForm({ ...form, target_department: e.target.value })}
            >
              <option value="All Team">All Team Sync (Everyone)</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Agenda & Topics (Optional)
            </label>
            <Textarea
              placeholder="Outline key discussion points for this meeting..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full font-bold">
            {editingId ? "Update Scheduled Meeting" : "Confirm & Publish Google Meet"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
