"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { canRegisterEvent, canAssignEventParticipants, isCaptain } from "@/lib/roles";
import { Event, Profile, EventParticipant } from "@/types";
import { Plus, Calendar, MapPin, Users, Trophy, ExternalLink, Award, CheckCircle2, FileText, Sparkles, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function EventsPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [participants, setParticipants] = useState<Record<string, EventParticipant[]>>({});
  
  // Tab & Filter state
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedEventForResult, setSelectedEventForResult] = useState<Event | null>(null);

  // Forms
  const [form, setForm] = useState({ title: "", description: "", event_date: "", location: "", max_participants: 4 });
  const [resultForm, setResultForm] = useState({
    result_position: "1st Place 🏆 (Gold)",
    custom_position: "",
    result_summary: "",
    result_link: "",
    is_completed: true,
  });
  const [submittingResult, setSubmittingResult] = useState(false);

  const fetchData = async () => {
    try {
      const [eventsRes, membersRes, participantsRes] = await Promise.all([
        supabase.from("events").select("*").order("event_date", { ascending: true }),
        supabase.from("profiles").select("*"),
        supabase.from("event_participants").select("*, profile:profiles(full_name, email)"),
      ]);

      let rawEvents = (eventsRes.data as Event[]) || [];

      // Read saved local results from localStorage as fallback
      try {
        const savedResultsStr = localStorage.getItem("team_roxx_event_results");
        if (savedResultsStr) {
          const savedResults: Record<string, Partial<Event>> = JSON.parse(savedResultsStr);
          rawEvents = rawEvents.map((e) => {
            if (savedResults[e.id]) {
              return { ...e, ...savedResults[e.id] };
            }
            return e;
          });
        }
      } catch (e) {}

      setEvents(rawEvents);
      setMembers((membersRes.data as Profile[]) || []);

      const map: Record<string, EventParticipant[]> = {};
      ((participantsRes.data as EventParticipant[]) || []).forEach((p) => {
        if (!map[p.event_id]) map[p.event_id] = [];
        map[p.event_id].push(p);
      });
      setParticipants(map);
    } catch (err) {
      console.error("Error loading events data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("events").insert({ ...form, registered_by: profile?.id });
      if (error) {
        alert("Error registering event: " + error.message);
        return;
      }
      setModalOpen(false);
      setForm({ title: "", description: "", event_date: "", location: "", max_participants: 4 });
      await fetchData();
    } catch (err: any) {
      alert("Failed to register event: " + err.message);
    }
  };

  const toggleParticipant = async (eventId: string, profileId: string, max: number) => {
    const current = participants[eventId] || [];
    const exists = current.find((p) => p.profile_id === profileId);
    if (exists) {
      await supabase.from("event_participants").delete().eq("id", exists.id);
    } else {
      if (current.length >= max) {
        alert(`Max participant limit (${max}) reached.`);
        return;
      }
      await supabase.from("event_participants").insert({ event_id: eventId, profile_id: profileId });
    }
    await fetchData();
  };

  const handleOpenResultModal = (evt: Event) => {
    setSelectedEventForResult(evt);
    setResultForm({
      result_position: evt.result_position || "1st Place 🏆 (Gold)",
      custom_position: "",
      result_summary: evt.result_summary || "",
      result_link: evt.result_link || "",
      is_completed: evt.is_completed ?? true,
    });
    setResultModalOpen(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForResult) return;
    setSubmittingResult(true);

    const finalPosition =
      resultForm.result_position === "Other / Custom"
        ? resultForm.custom_position || "Completed"
        : resultForm.result_position;

    const payload = {
      result_position: finalPosition,
      result_summary: resultForm.result_summary,
      result_link: resultForm.result_link,
      is_completed: resultForm.is_completed,
    };

    // 1. Instantly update React state
    setEvents((prev) =>
      prev.map((item) => (item.id === selectedEventForResult.id ? { ...item, ...payload } : item))
    );

    // 2. Persist in localStorage as fallback
    try {
      const savedStr = localStorage.getItem("team_roxx_event_results");
      const existing: Record<string, any> = savedStr ? JSON.parse(savedStr) : {};
      existing[selectedEventForResult.id] = payload;
      localStorage.setItem("team_roxx_event_results", JSON.stringify(existing));
    } catch (err) {}

    // 3. Update Supabase database
    try {
      const { error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", selectedEventForResult.id);

      if (error) console.warn("Supabase event result update warning:", error.message);
    } catch (err) {
      console.warn("Error updating event result:", err);
    } finally {
      setSubmittingResult(false);
      setResultModalOpen(false);
      setSelectedEventForResult(null);
      await fetchData();
    }
  };

  // Date & Status calculation
  const todayStr = new Date().toISOString().split("T")[0];

  const isEventOver = (e: Event) => {
    if (e.is_completed) return true;
    if (!e.event_date) return false;
    return e.event_date < todayStr;
  };

  const upcomingEvents = events.filter((e) => !isEventOver(e));
  const pastEvents = events.filter((e) => isEventOver(e));

  const isUserCaptain = isCaptain(profile);

  return (
    <>
      <Header title="Competitions & Events" />

      {/* Top Bar Description & Main Action */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-charcoal/70">
          Track upcoming hackathons & drone competitions, assign participants, and log competition results once completed.
        </p>
        {canRegisterEvent(profile) && (
          <Button onClick={() => setModalOpen(true)} className="gap-1.5 shrink-0 self-start sm:self-auto font-semibold">
            <Plus className="h-4 w-4 shrink-0" /> Register Event
          </Button>
        )}
      </div>

      {/* Tab Controls: Upcoming vs Completed Events & Results */}
      <div className="mb-6 flex items-center gap-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 w-fit">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center gap-2 ${
            activeTab === "upcoming"
              ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Clock className="h-4 w-4" />
          Upcoming Events ({upcomingEvents.length})
        </button>

        <button
          onClick={() => setActiveTab("past")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center gap-2 ${
            activeTab === "past"
              ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Trophy className="h-4 w-4 text-amber-400" />
          Completed Events & Results ({pastEvents.length})
        </button>
      </div>

      {/* TAB 1: UPCOMING EVENTS SECTION */}
      {activeTab === "upcoming" && (
        <div className="grid gap-5 md:grid-cols-2">
          {upcomingEvents.map((e) => {
            const current = participants[e.id] || [];
            return (
              <Card key={e.id} className="border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="break-words [overflow-wrap:anywhere] text-base font-bold text-slate-900 dark:text-slate-100">
                          {e.title}
                        </CardTitle>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> {formatDate(e.event_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-500" /> {e.location || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 shrink-0 text-amber-500" /> {current.length}/{e.max_participants}
                          </span>
                        </div>
                      </div>
                      <Badge variant={current.length >= e.max_participants ? "success" : "forest"} className="shrink-0">
                        {current.length >= e.max_participants ? "Full" : "Open"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 sm:p-5 pt-0 sm:pt-0">
                    <p className="text-sm text-slate-600 dark:text-slate-300 break-words [overflow-wrap:anywhere]">{e.description}</p>
                    
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Assigned Teammates
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {current.map((p) => (
                          <Badge key={p.id} variant="sage">{p.profile?.full_name}</Badge>
                        ))}
                        {current.length === 0 && (
                          <span className="text-xs text-slate-400 italic">No team participants assigned yet.</span>
                        )}
                      </div>
                    </div>

                    {canAssignEventParticipants(profile) && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="mb-2.5 text-xs font-bold text-slate-900 dark:text-slate-100">Assign Members</p>
                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                          {members.map((m) => {
                            const selected = current.some((p) => p.profile_id === m.id);
                            return (
                              <label
                                key={m.id}
                                className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all ${
                                  selected
                                    ? "border-emerald-500 dark:border-emerald-500 bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-300 shadow-2xs"
                                    : "border-slate-200/80 dark:border-slate-700/80 bg-slate-100/90 dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleParticipant(e.id, m.id, e.max_participants)}
                                  className="h-4 w-4 accent-emerald-500 shrink-0"
                                />
                                <span className="truncate">{m.full_name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Card Footer Actions */}
                {isUserCaptain && (
                  <div className="p-3.5 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenResultModal(e)}
                      className="text-xs bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-600 hover:text-white transition-all font-semibold gap-1.5"
                    >
                      <Trophy className="h-3.5 w-3.5" /> Mark Completed & Log Result
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}

          {upcomingEvents.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Calendar className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200">No active upcoming events.</p>
              <p className="text-xs mt-1">New events registered by Captain will appear here until completed or past date.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED EVENTS & RESULTS SECTION */}
      {activeTab === "past" && (
        <div className="grid gap-5 md:grid-cols-2">
          {pastEvents.map((e) => {
            const current = participants[e.id] || [];
            return (
              <Card key={e.id} className="border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="break-words [overflow-wrap:anywhere] text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          {e.title}
                        </CardTitle>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0" /> {formatDate(e.event_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" /> {e.location || "N/A"}
                          </span>
                        </div>
                      </div>
                      <Badge variant="sage" className="shrink-0 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 sm:p-5 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 break-words">{e.description}</p>

                    {/* Prominent Results Outcome Box */}
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/90 to-orange-50/60 dark:from-amber-950/40 dark:to-orange-950/20 p-4 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <Trophy className="h-4 w-4 text-amber-500 shrink-0" /> Competition Result:
                        </span>
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 shadow-2xs">
                          {e.result_position || "Completed Event"}
                        </span>
                      </div>

                      {e.result_summary && (
                        <p className="text-xs text-slate-800 dark:text-slate-200 italic pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                          "{e.result_summary}"
                        </p>
                      )}

                      {e.result_link && (
                        <div className="pt-1">
                          <a
                            href={e.result_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View Certificates / Event Photos & Media
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Team Members Who Participated */}
                    <div>
                      <p className="mb-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                        Participated Members ({current.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {current.map((p) => (
                          <Badge key={p.id} variant="sage" className="text-[11px]">
                            {p.profile?.full_name}
                          </Badge>
                        ))}
                        {current.length === 0 && (
                          <span className="text-xs text-slate-400 italic">No participants logged.</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Edit Results Action */}
                {isUserCaptain && (
                  <div className="p-3.5 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenResultModal(e)}
                      className="text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900 hover:bg-amber-500 hover:text-slate-950"
                    >
                      <Award className="h-3.5 w-3.5" /> Edit / Upload Results
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}

          {pastEvents.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Trophy className="h-10 w-10 mx-auto text-amber-400/40 mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200">No completed competition results logged yet.</p>
              <p className="text-xs mt-1">Once an event passes or is completed, Captain can upload positions won and photos here.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Register New Event */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register New Event / Competition">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Event Title *</label>
            <Input placeholder="e.g. National Aero Drone Challenge 2026" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description / Guidelines</label>
            <Textarea placeholder="Competition domain, rules, or guidelines..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Event Date *</label>
              <Input type="date" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Max Participants *</label>
              <Input type="number" min={1} required value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })} placeholder="Max participants" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Location / Venue</label>
            <Input placeholder="e.g. DSU Campus Main Auditorium / IIT Bombay" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>

          <Button type="submit" className="w-full">
            Register Event
          </Button>
        </form>
      </Modal>

      {/* MODAL 2: Upload / Edit Competition Results (Captain Only) */}
      {selectedEventForResult && (
        <Modal
          isOpen={resultModalOpen}
          onClose={() => setResultModalOpen(false)}
          title={`Log Competition Results for "${selectedEventForResult.title}"`}
        >
          <form onSubmit={handleSaveResult} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Position / Outcome Won *
              </label>
              <Select
                value={resultForm.result_position}
                onChange={(e) => setResultForm({ ...resultForm, result_position: e.target.value })}
              >
                <option value="1st Place 🏆 (Gold)">1st Place 🏆 (Gold Medalist)</option>
                <option value="2nd Place 🥈 (Silver)">2nd Place 🥈 (Runner-Up)</option>
                <option value="3rd Place 🥉 (Bronze)">3rd Place 🥉 (2nd Runner-Up)</option>
                <option value="Top 5 Finalist">Top 5 Finalist</option>
                <option value="Special Achievement Award">Special Achievement Award</option>
                <option value="Successfully Participated">Successfully Participated</option>
                <option value="Other / Custom">Other / Custom</option>
              </Select>
            </div>

            {resultForm.result_position === "Other / Custom" && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Custom Position / Award Title *
                </label>
                <Input
                  placeholder="e.g. Best Autonomous Flight Innovation Award"
                  required
                  value={resultForm.custom_position}
                  onChange={(e) => setResultForm({ ...resultForm, custom_position: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Result Highlights & Performance Summary
              </label>
              <Textarea
                placeholder="Details of performance, final scores, achievements, or judges feedback..."
                rows={3}
                value={resultForm.result_summary}
                onChange={(e) => setResultForm({ ...resultForm, result_summary: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Photos / Certificate Drive Link (Optional)
              </label>
              <Input
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={resultForm.result_link}
                onChange={(e) => setResultForm({ ...resultForm, result_link: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_completed_check"
                checked={resultForm.is_completed}
                onChange={(e) => setResultForm({ ...resultForm, is_completed: e.target.checked })}
                className="h-4 w-4 accent-emerald-500 shrink-0"
              />
              <label htmlFor="is_completed_check" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Mark event as completed (moves event to Completed Events & Results section)
              </label>
            </div>

            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" isLoading={submittingResult}>
              Save Competition Results
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
