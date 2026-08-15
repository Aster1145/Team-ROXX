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
import { isCaptain, isViceCaptain, isTrainee, roleLabel } from "@/lib/roles";
import { Plus, Download, FileText, Star, Trophy, Award, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const { profile } = useAuth();
  const supabase = createClient();

  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Rating Modal state (Captain Only)
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [stars, setStars] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Duplicate report limit modal state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateWeekDate, setDuplicateWeekDate] = useState("");

  const [form, setForm] = useState({
    week_ending: "",
    summary: "",
    accomplishments: "",
    blockers: "",
    next_steps: "",
  });

  const fetchData = async () => {
    try {
      const [reportsRes, membersRes] = await Promise.all([
        supabase
          .from("weekly_reports")
          .select("*, profile:profiles!profile_id(full_name, department, role)")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
      ]);

      setReports((reportsRes.data as WeeklyReport[]) || []);
      setMembers((membersRes.data as Profile[]) || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    // Check if member has already submitted a report for this week_ending
    const existing = reports.find(
      (r) => r.profile_id === profile.id && r.week_ending === form.week_ending
    );

    if (existing) {
      setDuplicateWeekDate(formatDate(form.week_ending));
      setDuplicateModalOpen(true);
      return;
    }

    try {
      const { error } = await supabase.from("weekly_reports").insert({ ...form, profile_id: profile.id });

      if (error) {
        if (error.code === "23505" || error.message.includes("unique") || error.message.includes("duplicate")) {
          setDuplicateWeekDate(formatDate(form.week_ending));
          setDuplicateModalOpen(true);
        } else {
          alert("Error submitting report: " + error.message);
        }
        return;
      }

      setModalOpen(false);
      setForm({ week_ending: "", summary: "", accomplishments: "", blockers: "", next_steps: "" });
      await fetchData();
    } catch (err: any) {
      alert("Failed to submit report: " + err.message);
    }
  };

  const handleOpenRatingModal = (report: WeeklyReport) => {
    setSelectedReport(report);
    setStars(report.rating_stars || 5);
    setFeedback(report.rating_feedback || "");
    setRatingModalOpen(true);
  };

  const handleSaveRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !profile?.id) return;
    setSubmittingRating(true);

    const calculatedPoints = stars * 2; // Each star is 2 points

    try {
      const { error } = await supabase
        .from("weekly_reports")
        .update({
          rating_stars: stars,
          points: calculatedPoints,
          rated_by: profile.id,
          rating_feedback: feedback || null,
        })
        .eq("id", selectedReport.id);

      if (error) {
        alert("Error saving rating: " + error.message);
      } else {
        setRatingModalOpen(false);
        setSelectedReport(null);
        await fetchData();
      }
    } catch (err: any) {
      alert("Failed to submit rating: " + err.message);
    } finally {
      setSubmittingRating(false);
    }
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
      "Stars (out of 5)": r.rating_stars ? `${r.rating_stars} Stars` : "Not Rated",
      "Points Awarded": r.points ? `${r.points} Pts` : "0 Pts",
      "Captain Feedback": r.rating_feedback || "None",
      Submitted: formatDate(r.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Weekly Reports");
    XLSX.writeFile(wb, `weekly-reports-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const userIsCaptain = isCaptain(profile);
  const canDownload = isCaptain(profile) || isViceCaptain(profile);

  // Leaderboard Calculation (Excludes Captain and Trainees, ranks Members & Vice Captains)
  const leaderboard = members
    .filter((m) => m.role !== "captain" && !isTrainee(m))
    .map((m) => {
      const mReports = reports.filter((r) => r.profile_id === m.id && r.points != null);
      const totalPoints = mReports.reduce((sum, r) => sum + (r.points || 0), 0);
      const totalStars = mReports.reduce((sum, r) => sum + (r.rating_stars || 0), 0);
      const avgStars = mReports.length > 0 ? (totalStars / mReports.length).toFixed(1) : "0.0";
      return {
        ...m,
        totalPoints,
        avgStars,
        ratedReportsCount: mReports.length,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const renderStars = (numStars: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= numStars ? "fill-amber-400 text-amber-400" : "text-stone-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Header title="Weekly Reports & Performance" />

      {/* Top Description & Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-charcoal/70">
            Submit weekly progress reports. Captain evaluates performance (Up to 5 Stars = 10 Points).
          </p>
        </div>
        <div className="flex gap-2">
          {canDownload && (
            <Button variant="outline" onClick={exportExcel}>
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          )}
          {profile?.role !== "trainee" && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Submit Report
            </Button>
          )}
        </div>
      </div>

      {/* Performance Leaderboard */}
      <Card className="mb-8 border-amber-200/80 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base text-charcoal">Team Performance Leaderboard</CardTitle>
            <Badge variant="sage" className="text-[10px] ml-1">
              {leaderboard.length} Teammates
            </Badge>
          </div>
          <span className="text-xs text-charcoal/60 font-medium">5 Stars = 10 Points (Captain Evaluation)</span>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {leaderboard.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-stone/60 bg-white shadow-2xs hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                        idx === 0
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : idx === 1
                          ? "bg-slate-100 text-slate-700 border border-slate-300"
                          : idx === 2
                          ? "bg-orange-100 text-orange-800 border border-orange-300"
                          : "bg-stone-100 text-charcoal/60"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-charcoal flex items-center gap-1 truncate">
                        {m.full_name}
                        <span className="text-[10px] font-normal text-charcoal/50">({roleLabel(m.role, m.department)})</span>
                      </p>
                      <p className="text-xs text-charcoal/60 truncate">{m.department}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-amber-600 block">{m.totalPoints} pts</span>
                    <span className="text-[11px] text-charcoal/60 flex items-center justify-end gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" /> {m.avgStars}
                    </span>
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <p className="text-xs text-charcoal/60 col-span-3 py-3 text-center">
                  No teammate report ratings yet.
                </p>
              )}
            </div>
          </div>
          {leaderboard.length > 6 && (
            <div className="mt-2 text-center text-[11px] text-amber-800/80 font-medium flex items-center justify-center gap-1 border-t border-amber-100/60 pt-2">
              <span>Scroll inside box to view all {leaderboard.length} members</span> ↓
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-charcoal">Weekly Work Submissions</h3>

        {reports.map((r) => {
          const authorIsCaptain = r.profile?.role === "captain";
          const hasBeenRated = r.rating_stars != null;

          return (
            <Card key={r.id} className="hover:shadow-sm transition-shadow">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {r.profile?.full_name}
                        {authorIsCaptain && (
                          <Badge variant="forest" className="text-[10px]">Captain</Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-charcoal/60">
                        {r.profile?.department} · Week ending {formatDate(r.week_ending)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Display Rating & Points */}
                    {!authorIsCaptain && (
                      <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone/60">
                        {hasBeenRated ? (
                          <>
                            {renderStars(r.rating_stars!)}
                            <span className="text-xs font-bold text-amber-700 ml-1">
                              +{r.points} Pts
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-charcoal/50 italic flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-stone-400" /> Awaiting Rating
                          </span>
                        )}
                      </div>
                    )}

                    {/* Captain Only Action to Rate Non-Captain Teammates */}
                    {userIsCaptain && !authorIsCaptain && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenRatingModal(r)}
                        className="text-xs bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all font-medium gap-1"
                      >
                        <Award className="h-3.5 w-3.5" />
                        {hasBeenRated ? "Edit Rating" : "Rate Performance"}
                      </Button>
                    )}

                    <Badge variant="sage">{formatDate(r.created_at)}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="min-w-0 break-words">
                  <p className="text-xs font-semibold uppercase text-charcoal/50 mb-1">Summary</p>
                  <p className="text-sm text-charcoal/90 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{r.summary}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3 min-w-0">
                  <div className="min-w-0 break-words">
                    <p className="text-xs font-semibold uppercase text-charcoal/50 mb-1">Accomplishments</p>
                    <p className="text-sm text-charcoal/80 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{r.accomplishments || "—"}</p>
                  </div>
                  <div className="min-w-0 break-words">
                    <p className="text-xs font-semibold uppercase text-charcoal/50 mb-1">Blockers</p>
                    <p className="text-sm text-charcoal/80 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{r.blockers || "—"}</p>
                  </div>
                  <div className="min-w-0 break-words">
                    <p className="text-xs font-semibold uppercase text-charcoal/50 mb-1">Next Steps</p>
                    <p className="text-sm text-charcoal/80 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{r.next_steps || "—"}</p>
                  </div>
                </div>

                {/* Captain Feedback Note */}
                {r.rating_feedback && (
                  <div className="mt-3 rounded-lg bg-amber-50/70 p-3 border border-amber-200 text-xs text-amber-950 flex items-start gap-2 min-w-0 break-words">
                    <MessageSquare className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div className="min-w-0 break-words">
                      <span className="font-bold block">Captain Review:</span>
                      <p className="mt-0.5 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{r.rating_feedback}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {reports.length === 0 && (
          <div className="py-12 text-center text-charcoal/60 bg-white rounded-xl border border-stone">
            <FileText className="h-10 w-10 mx-auto text-charcoal/30 mb-2" />
            <p className="font-medium">No reports submitted yet.</p>
            <p className="text-xs mt-1">Submit a weekly report to track progress and earn points.</p>
          </div>
        )}
      </div>

      {/* Submit Report Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Weekly Report">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Week Ending Date *</label>
            <Input type="date" required value={form.week_ending} onChange={(e) => setForm({ ...form, week_ending: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Summary of Work Done *</label>
            <Textarea placeholder="Summary of work done this week" required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Key Accomplishments</label>
            <Textarea placeholder="Key accomplishments" value={form.accomplishments} onChange={(e) => setForm({ ...form, accomplishments: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Blockers / Doubts</label>
            <Textarea placeholder="Blockers / doubts" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Next Week's Plan</label>
            <Textarea placeholder="Plan for next week" value={form.next_steps} onChange={(e) => setForm({ ...form, next_steps: e.target.value })} />
          </div>
          <Button type="submit" className="w-full">Submit Report</Button>
        </form>
      </Modal>

      {/* Custom Duplicate Report Limit Warning Modal */}
      <Modal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        title="Weekly Report Limit Reached"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-1.5">
              <p className="font-bold text-sm text-amber-900">Only 1 Report Per Week Allowed</p>
              <p>
                You have already submitted a weekly report for the week ending{" "}
                <strong>{duplicateWeekDate}</strong>.
              </p>
              <p className="text-amber-800 pt-1">
                Each team member is permitted <strong>only 1 report per week</strong> to maintain an accurate, fair, and reliable performance points leaderboard.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setDuplicateModalOpen(false)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              Understood
            </Button>
          </div>
        </div>
      </Modal>

      {/* Captain Only Star Rating Modal */}
      {selectedReport && (
        <Modal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          title={`Rate Performance - ${selectedReport.profile?.full_name}`}
        >
          <form onSubmit={handleSaveRating} className="space-y-5">
            <div className="text-center py-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-900 font-medium mb-2">Select Star Rating (1 Star = 2 Points):</p>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= stars
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : "text-stone-300 hover:text-amber-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-sm font-bold border border-amber-300">
                <Award className="h-4 w-4 text-amber-600" />
                {stars} Stars = {stars * 2} Points Awarded
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Captain Review & Feedback (Optional)</label>
              <Textarea
                rows={3}
                placeholder="Give constructive feedback or praise on this week's work..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setRatingModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={submittingRating}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> Save Performance Rating
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
