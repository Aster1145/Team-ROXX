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
import { canRegisterEvent, canAssignEventParticipants } from "@/lib/roles";
import { Event, Profile, EventParticipant } from "@/types";
import { Plus, Calendar, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function EventsPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [participants, setParticipants] = useState<Record<string, EventParticipant[]>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", location: "", max_participants: 4 });

  const fetchData = async () => {
    const [eventsRes, membersRes, participantsRes] = await Promise.all([
      supabase.from("events").select("*").order("event_date", { ascending: true }),
      supabase.from("profiles").select("*"),
      supabase.from("event_participants").select("*, profile:profiles(full_name, email)"),
    ]);
    setEvents((eventsRes.data as Event[]) || []);
    setMembers((membersRes.data as Profile[]) || []);
    const map: Record<string, EventParticipant[]> = {};
    ((participantsRes.data as EventParticipant[]) || []).forEach((p) => {
      if (!map[p.event_id]) map[p.event_id] = [];
      map[p.event_id].push(p);
    });
    setParticipants(map);
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("events").insert({ ...form, registered_by: profile?.id });
    setModalOpen(false);
    setForm({ title: "", description: "", event_date: "", location: "", max_participants: 4 });
    fetchData();
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
    fetchData();
  };

  return (
    <>
      <Header title="Events" />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-charcoal/70">Register competitions and assign participating members.</p>
        {canRegisterEvent(profile) && (
          <Button onClick={() => setModalOpen(true)} className="gap-1.5 shrink-0 self-start sm:self-auto font-semibold">
            <Plus className="h-4 w-4 shrink-0" /> Register Event
          </Button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {events.map((e) => {
          const current = participants[e.id] || [];
          return (
            <Card key={e.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <CardTitle className="break-words [overflow-wrap:anywhere]">{e.title}</CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-charcoal/60">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 shrink-0" /> {formatDate(e.event_date)}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" /> {e.location}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 shrink-0" /> {current.length}/{e.max_participants}</span>
                    </div>
                  </div>
                  <Badge variant={current.length >= e.max_participants ? "success" : "forest"} className="shrink-0">
                    {current.length >= e.max_participants ? "Full" : "Open"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-5 pt-0 sm:pt-0">
                <p className="text-sm text-charcoal/70 break-words [overflow-wrap:anywhere]">{e.description}</p>
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-charcoal">Participants</p>
                  <div className="flex flex-wrap gap-2">
                    {current.map((p) => (
                      <Badge key={p.id} variant="sage">{p.profile?.full_name}</Badge>
                    ))}
                    {current.length === 0 && <span className="text-xs text-charcoal/50">No participants assigned.</span>}
                  </div>
                </div>
                {canAssignEventParticipants(profile) && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-charcoal">Assign members</p>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {members.map((m) => {
                        const selected = current.some((p) => p.profile_id === m.id);
                        return (
                          <label
                            key={m.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                              selected ? "border-forest bg-forest/5 text-forest" : "border-stone bg-white text-charcoal"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleParticipant(e.id, m.id, e.max_participants)}
                              className="h-4 w-4 accent-forest shrink-0"
                            />
                            <span className="truncate">{m.full_name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register New Event">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input placeholder="Event title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="date" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            <Input type="number" min={1} required value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })} placeholder="Max participants" />
          </div>
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Button type="submit" className="w-full">Register Event</Button>
        </form>
      </Modal>
    </>
  );
}
