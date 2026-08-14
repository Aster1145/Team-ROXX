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
import { WeeklyReport, Profile } from "@/types";
import { isCaptain, isViceCaptain } from "@/lib/roles";
import { Plus, Download, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    week_ending: "",
    summary: "",
    accomplishments: "",
    blockers: "",
    next_steps: "",
  });

  const fetchData = async () => {
    const [reportsRes, membersRes] = await Promise.all([
      supabase.from("weekly_reports").select("*, profile:profiles(full_name, department)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
    ]);
    setReports((reportsRes.data as WeeklyReport[]) || []);
    setMembers((membersRes.data as Profile[]) || []);
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("weekly_reports").insert({ ...form, profile_id: profile?.id });
    setModalOpen(false);
    setForm({ week_ending: "", summary: "", accomplishments: "", blockers: "", next_steps: "" });
    fetchData();
  };

  const exportExcel = () => {
    const rows = reports.map((r) => ({
      Name: r.profile?.full_name,
      Department: r.profile?.department,
      "Week Ending": formatDate(r.week_ending),
      Summary: r.summary,
      Accomplishments: r.accomplishments,
      Blockers: r.blockers,
      "Next Steps": r.next_steps,
      Submitted: formatDate(r.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Weekly Reports");
    XLSX.writeFile(wb, `weekly-reports-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const canDownload = isCaptain(profile) || isViceCaptain(profile);

  return (
    <>
      <Header title="Weekly Reports" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-charcoal/70">Submit and review Sunday work reports for Monday meetings.</p>
        <div className="flex gap-2">
          {canDownload && (
            <Button variant="outline" onClick={exportExcel}>
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          )}
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Submit Report
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{r.profile?.full_name}</CardTitle>
                    <p className="text-xs text-charcoal/60">{r.profile?.department} · Week ending {formatDate(r.week_ending)}</p>
                  </div>
                </div>
                <Badge variant="sage">{formatDate(r.created_at)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase text-charcoal/50">Summary</p>
                <p className="text-sm text-charcoal/80">{r.summary}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase text-charcoal/50">Accomplishments</p>
                  <p className="text-sm text-charcoal/80">{r.accomplishments}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-charcoal/50">Blockers</p>
                  <p className="text-sm text-charcoal/80">{r.blockers}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-charcoal/50">Next Steps</p>
                  <p className="text-sm text-charcoal/80">{r.next_steps}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {reports.length === 0 && <p className="text-charcoal/60">No reports submitted yet.</p>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Weekly Report">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="date" required value={form.week_ending} onChange={(e) => setForm({ ...form, week_ending: e.target.value })} />
          <Textarea placeholder="Summary of work done this week" required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <Textarea placeholder="Key accomplishments" value={form.accomplishments} onChange={(e) => setForm({ ...form, accomplishments: e.target.value })} />
          <Textarea placeholder="Blockers / doubts" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} />
          <Textarea placeholder="Plan for next week" value={form.next_steps} onChange={(e) => setForm({ ...form, next_steps: e.target.value })} />
          <Button type="submit" className="w-full">Submit Report</Button>
        </form>
      </Modal>
    </>
  );
}
