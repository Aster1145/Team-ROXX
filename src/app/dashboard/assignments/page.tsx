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
import { TraineeAssignment, Profile } from "@/types";
import { canRateTrainees, roleLabel, isTrainee } from "@/lib/roles";
import {
  Plus,
  Download,
  GraduationCap,
  Star,
  Trophy,
  Award,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  FileDown,
  Link2,
  BookOpen,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import * as XLSX from "xlsx";

export default function AssignmentsPage() {
  const { profile } = useAuth();
  const supabase = createClient();

  const [assignments, setAssignments] = useState<TraineeAssignment[]>([]);
  const [trainees, setTrainees] = useState<Profile[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Rating Modal state (Captains & Vice Captains)
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TraineeAssignment | null>(null);
  const [stars, setStars] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>("");
  const [submittingRating, setSubmittingRating] = useState(false);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    learnings: "",
    blockers: "",
    drive_url: "",
  });

  const fetchData = async () => {
    try {
      const [assignmentsRes, profilesRes] = await Promise.all([
        supabase
          .from("trainee_assignments")
          .select("*, profile:profiles!profile_id(full_name, department, role), rater:profiles!rated_by(full_name, role)")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
      ]);

      if (assignmentsRes.error) {
        console.warn("Trainee assignments query notice:", assignmentsRes.error.message);
      }

      setAssignments((assignmentsRes.data as TraineeAssignment[]) || []);

      const allProfiles = (profilesRes.data as Profile[]) || [];
      const traineeProfiles = allProfiles.filter(
        (m) => m.role === "trainee" || m.department === "Trainee"
      );
      setTrainees(traineeProfiles.length > 0 ? traineeProfiles : allProfiles);
    } catch (err) {
      console.error("Error fetching assignments data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      let formattedDriveUrl = form.drive_url.trim();
      if (formattedDriveUrl && !formattedDriveUrl.startsWith("http://") && !formattedDriveUrl.startsWith("https://")) {
        formattedDriveUrl = `https://${formattedDriveUrl}`;
      }

      const { error } = await supabase.from("trainee_assignments").insert({
        profile_id: profile.id,
        title: form.title,
        summary: form.summary,
        learnings: form.learnings || null,
        blockers: form.blockers || null,
        drive_url: formattedDriveUrl || null,
      });

      if (error) {
        alert("Error submitting assignment: " + error.message);
        return;
      }

      setModalOpen(false);
      setForm({ title: "", summary: "", learnings: "", blockers: "", drive_url: "" });
      await fetchData();
    } catch (err: any) {
      alert("Failed to submit assignment: " + err.message);
    }
  };

  const handleOpenRatingModal = (assignment: TraineeAssignment) => {
    setSelectedAssignment(assignment);
    setStars(assignment.rating_stars || 5);
    setFeedback(assignment.rating_feedback || "");
    setRatingModalOpen(true);
  };

  const handleSaveRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !profile?.id) return;
    setSubmittingRating(true);

    const calculatedPoints = stars * 2; // Each star is 2 points

    try {
      const { error } = await supabase
        .from("trainee_assignments")
        .update({
          rating_stars: stars,
          points: calculatedPoints,
          rated_by: profile.id,
          rating_feedback: feedback || null,
        })
        .eq("id", selectedAssignment.id);

      if (error) {
        alert("Error saving rating: " + error.message);
      } else {
        setRatingModalOpen(false);
        setSelectedAssignment(null);
        await fetchData();
      }
    } catch (err: any) {
      alert("Failed to submit rating: " + err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  const exportExcel = () => {
    const rows = assignments.map((a) => ({
      Title: a.title,
      "Trainee Name": a.profile?.full_name,
      Department: a.profile?.department,
      Summary: a.summary,
      Learnings: a.learnings || "None",
      Blockers: a.blockers || "None",
      "Google Link": a.drive_url || "No Attachment",
      "Stars (out of 5)": a.rating_stars ? `${a.rating_stars} Stars` : "Not Rated",
      "Points Awarded": a.points ? `${a.points} Pts` : "0 Pts",
      "Evaluated By": a.rater?.full_name ? `${a.rater.full_name} (${roleLabel(a.rater.role)})` : "Pending",
      "Evaluator Feedback": a.rating_feedback || "None",
      Submitted: formatDate(a.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trainee Assignments");
    XLSX.writeFile(wb, `trainee-assignments-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const downloadAssignmentDoc = (a: TraineeAssignment) => {
    const traineeName = a.profile?.full_name || "Trainee Member";
    const dept = a.profile?.department || "Trainee";
    const submittedOn = formatDate(a.created_at);

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Trainee Work Assignment - ${traineeName}</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; margin: 30px; color: #1e293b; line-height: 1.6; }
          .header { border-bottom: 3px solid #ea580c; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { font-size: 22px; color: #ea580c; margin: 0; }
          .header p { font-size: 12px; color: #64748b; margin: 4px 0 0 0; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; background: #fff7ed; border: 1px solid #ffedd5; }
          .meta-table td { padding: 8px 12px; font-size: 13px; border: 1px solid #fed7aa; }
          .meta-label { font-weight: bold; color: #7c2d12; width: 30%; background: #ffedd5; }
          .section-title { font-size: 14px; font-weight: bold; color: #c2410c; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase; border-left: 4px solid #ea580c; padding-left: 8px; }
          .content-box { font-size: 13px; background: #fafafa; padding: 12px; border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 15px; white-space: pre-wrap; word-wrap: break-word; }
          .rating-card { background: #fffbeb; border: 1px solid #fcd34d; padding: 14px; border-radius: 6px; margin-top: 25px; }
          .rating-card h3 { margin: 0 0 8px 0; color: #92400e; font-size: 15px; }
          .rating-card p { margin: 4px 0; font-size: 13px; color: #78350f; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Trainee Technical Assignment Submission</h1>
          <p>Team ROXX Autonomous Systems Portal</p>
        </div>

        <table class="meta-table">
          <tr>
            <td class="meta-label">Submitted By:</td>
            <td><strong>${traineeName}</strong> (Trainee)</td>
          </tr>
          <tr>
            <td class="meta-label">Department / Domain:</td>
            <td>${dept}</td>
          </tr>
          <tr>
            <td class="meta-label">Assignment Title:</td>
            <td><strong>${a.title}</strong></td>
          </tr>
          <tr>
            <td class="meta-label">Submission Date:</td>
            <td>${submittedOn}</td>
          </tr>
          ${a.drive_url ? `
          <tr>
            <td class="meta-label">Paper / Google Link Attachment:</td>
            <td><a href="${a.drive_url}">${a.drive_url}</a></td>
          </tr>
          ` : ""}
        </table>

        <div class="section-title">1. Summary of Work Done</div>
        <div class="content-box">${a.summary || "No summary provided."}</div>

        <div class="section-title">2. Key Technical Learnings & Output</div>
        <div class="content-box">${a.learnings || "None stated."}</div>

        <div class="section-title">3. Doubts & Challenges Faced</div>
        <div class="content-box">${a.blockers || "None stated."}</div>

        ${a.rating_stars ? `
        <div class="rating-card">
          <h3>Evaluator Rating (${a.rater?.full_name || "Team Lead"})</h3>
          <p><strong>Stars Awarded:</strong> ${a.rating_stars} / 5 Stars</p>
          <p><strong>Trainee Points:</strong> +${a.points || 0} Pts</p>
          ${a.rating_feedback ? `<p><strong>Feedback Note:</strong> ${a.rating_feedback}</p>` : ""}
        </div>
        ` : ""}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + docContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName = traineeName.replace(/[^a-zA-Z0-9_-]/g, "_");
    link.download = `Trainee-Assignment-${safeName}-${a.created_at.split("T")[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const userCanRate = canRateTrainees(profile);

  // Trainee Leaderboard Calculation (Ranks Trainees by assignment performance)
  const traineeLeaderboard = trainees
    .map((t) => {
      const tAssignments = assignments.filter((a) => a.profile_id === t.id && a.points != null);
      const totalPoints = tAssignments.reduce((sum, a) => sum + (a.points || 0), 0);
      const totalStars = tAssignments.reduce((sum, a) => sum + (a.rating_stars || 0), 0);
      const avgStars = tAssignments.length > 0 ? (totalStars / tAssignments.length).toFixed(1) : "0.0";
      return {
        ...t,
        totalPoints,
        avgStars,
        ratedAssignmentsCount: tAssignments.length,
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
              star <= numStars ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Header title="Trainee Assignments & Work Ranking" />

      {/* Top Banner & Action Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Trainees submit work done with optional paper/Google Drive link attachments. Vice Captains & Captains review and rank their work.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {assignments.length > 0 && (
            <Button variant="outline" onClick={exportExcel} className="text-xs font-semibold gap-1.5">
              <Download className="h-4 w-4 shrink-0" /> Export Excel
            </Button>
          )}
          <Button onClick={() => setModalOpen(true)} className="text-xs font-semibold gap-1.5 bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 shrink-0" /> Submit Assignment
          </Button>
        </div>
      </div>

      {/* Trainee Performance Ranking Leaderboard */}
      <Card className="mb-8 border-orange-200 dark:border-orange-950/60 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-orange-100 dark:border-slate-800 p-3.5 sm:p-5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Trophy className="h-5 w-5 text-orange-500 shrink-0" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
              Trainee Performance Ranking Leaderboard
            </CardTitle>
            <Badge variant="sage" className="text-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 border-orange-200 shrink-0">
              {traineeLeaderboard.length} Trainees Ranked
            </Badge>
          </div>
          <span className="text-xs text-orange-800 dark:text-orange-300 font-bold shrink-0">
            Evaluated by Vice Captains & Captains (5 Stars = 10 Pts)
          </span>
        </CardHeader>

        <CardContent className="pt-4 p-3.5 sm:p-5">
          <div className="max-h-[260px] overflow-y-auto pr-1.5 scrollbar-thin">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {traineeLeaderboard.map((t, idx) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-orange-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-800/80 shadow-2xs hover:border-orange-400 dark:hover:border-orange-500 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold shrink-0 ${
                        idx === 0
                          ? "bg-amber-400 text-slate-950 border border-amber-500 shadow-2xs"
                          : idx === 1
                          ? "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-400"
                          : idx === 2
                          ? "bg-orange-300 dark:bg-amber-900/60 text-orange-950 dark:text-amber-200 border border-orange-400"
                          : "bg-slate-200/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {t.full_name}
                      </p>
                      <p className="text-[11px] font-medium text-orange-700 dark:text-orange-400 truncate">
                        {roleLabel(t.role, t.department)} • {t.department}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs sm:text-sm font-extrabold text-orange-600 dark:text-orange-400 block">{t.totalPoints} pts</span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline shrink-0" /> {t.avgStars}
                    </span>
                  </div>
                </div>
              ))}

              {traineeLeaderboard.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 col-span-3 py-3 text-center">
                  No trainee evaluation ratings yet.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainee Assignments Feed */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Trainee Work Submissions
        </h3>

        {assignments.map((a) => {
          const hasBeenRated = a.rating_stars != null;
          const isOwnSubmission = a.profile_id === profile?.id;

          return (
            <Card key={a.id} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
              <CardHeader className="p-3.5 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                        <span>{a.title}</span>
                        {isOwnSubmission && (
                          <Badge variant="sage" className="text-[10px] bg-emerald-100 text-emerald-900 border-emerald-300 shrink-0">My Work</Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        By <strong className="text-slate-700 dark:text-slate-300">{a.profile?.full_name}</strong> · {a.profile?.department} · Submitted {formatDate(a.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Display Rating & Points */}
                    <div className="flex items-center gap-2 bg-stone-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700">
                      {hasBeenRated ? (
                        <>
                          {renderStars(a.rating_stars!)}
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 ml-1">
                            +{a.points} Pts
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-stone-400" /> Awaiting VC/Captain Rating
                        </span>
                      )}
                    </div>

                    {/* Both Vice Captains & Captains can Rate Trainee Work */}
                    {userCanRate && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenRatingModal(a)}
                        className="text-xs bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-600 hover:text-white transition-all font-medium gap-1"
                      >
                        <Award className="h-3.5 w-3.5" />
                        {hasBeenRated ? "Edit Rating" : "Rate Trainee"}
                      </Button>
                    )}

                    {/* Download Assignment as Word Document */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAssignmentDoc(a)}
                      className="text-xs bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-700 hover:text-white transition-all font-medium gap-1"
                      title="Download assignment as Word doc (.doc)"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Doc
                    </Button>

                    <Badge variant="sage" className="shrink-0 text-[10px]">{formatDate(a.created_at)}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-3.5 sm:p-5 pt-0 sm:pt-0">
                {/* Google Link Paper Attachment Button */}
                {a.drive_url && (
                  <div className="rounded-xl bg-orange-50/80 dark:bg-orange-950/30 p-3 border border-orange-200 dark:border-orange-900 flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link2 className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
                      <span className="text-xs font-bold text-orange-950 dark:text-orange-200 truncate">
                        Google Paper / Work Attachment:
                      </span>
                    </div>
                    <a
                      href={a.drive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors shrink-0"
                    >
                      Open Google Drive Link <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                <div className="min-w-0 break-words">
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Work Done Summary</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{a.summary}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 min-w-0">
                  <div className="min-w-0 break-words">
                    <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Key Technical Learnings & Output</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{a.learnings || "—"}</p>
                  </div>
                  <div className="min-w-0 break-words">
                    <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Doubts & Blockers</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{a.blockers || "—"}</p>
                  </div>
                </div>

                {/* Evaluator Feedback Note */}
                {a.rating_feedback && (
                  <div className="mt-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 min-w-0">
                    <MessageSquare className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div className="min-w-0 break-words">
                      <span className="font-bold block">
                        Evaluator Review ({a.rater?.full_name ? `${a.rater.full_name} · ${roleLabel(a.rater.role)}` : "Team Lead"}):
                      </span>
                      <p className="mt-0.5 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{a.rating_feedback}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {assignments.length === 0 && (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <GraduationCap className="h-10 w-10 mx-auto text-orange-500/40 mb-2" />
            <p className="font-bold text-base text-slate-800 dark:text-slate-200">No trainee assignments submitted yet.</p>
            <p className="text-xs mt-1">Trainees can submit work done and paper links here for evaluation and ranking.</p>
          </div>
        )}
      </div>

      {/* Submit Assignment Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Trainee Work Assignment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assignment Title / Topic *</label>
            <Input
              placeholder="e.g. Flight Controller Wiring & Drone Firmware Setup"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Google Drive / Paper Attachment Link *</label>
            <Input
              type="url"
              placeholder="https://drive.google.com/file/d/... or Google Doc URL"
              value={form.drive_url}
              onChange={(e) => setForm({ ...form, drive_url: e.target.value })}
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Attach Google Drive link for handwritten paper work, diagram scans, or Google Docs.
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Summary of Work Done *</label>
            <Textarea
              placeholder="Describe the tasks completed and experiments conducted..."
              required
              rows={3}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Key Technical Learnings & Output</label>
            <Textarea
              placeholder="What new skills or knowledge did you acquire?"
              rows={2}
              value={form.learnings}
              onChange={(e) => setForm({ ...form, learnings: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Doubts & Challenges Faced</label>
            <Textarea
              placeholder="Any questions or technical blockers for Vice Captains / Captain..."
              rows={2}
              value={form.blockers}
              onChange={(e) => setForm({ ...form, blockers: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold">
            Submit Assignment & Request Ranking
          </Button>
        </form>
      </Modal>

      {/* Vice Captain & Captain Star Rating Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          title={`Rate Trainee Work - ${selectedAssignment.profile?.full_name}`}
        >
          <form onSubmit={handleSaveRating} className="space-y-5">
            <div className="text-center py-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-900 dark:text-amber-200 font-medium mb-2">Select Star Rating (1 Star = 2 Points):</p>
              
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
                          : "text-stone-300 dark:text-slate-700 hover:text-amber-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-3 py-1 rounded-full text-sm font-bold border border-amber-300 dark:border-amber-700">
                <Award className="h-4 w-4 text-amber-600" />
                {stars} Stars = {stars * 2} Trainee Points Awarded
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Feedback & Review Comments (Optional)
              </label>
              <Textarea
                rows={3}
                placeholder="Give constructive feedback or guidance to help the trainee improve..."
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
                <CheckCircle2 className="h-4 w-4" /> Save Trainee Rating
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
