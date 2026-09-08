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
import { DEPARTMENTS } from "@/lib/constants";
import { canEditProject, isCaptain, isTrainee, roleLabel } from "@/lib/roles";
import { LearningResource, Profile, ResourceType } from "@/types";
import {
  BookOpen,
  Plus,
  Video,
  Folder,
  Link as LinkIcon,
  ExternalLink,
  Pencil,
  Trash2,
  Search,
  GraduationCap,
  PlayCircle,
  CheckCircle,
  Users,
  Eye,
  UserCheck,
  TrendingUp,
  X,
  Filter,
} from "lucide-react";

// Helper to extract embed URL for YouTube videos
function getYouTubeEmbedUrl(url: string) {
  try {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes("youtube.com/embed/")) {
      return url;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export default function LearningPage() {
  const { profile } = useAuth();
  const supabase = createClient();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Learning Progress state mapping: memberId -> list of completed resource IDs
  const [memberCompletions, setMemberCompletions] = useState<Record<string, string[]>>({});
  
  // Monitoring state for Captains / Vice Captains
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<string>("all");
  const [showMonitorPanel, setShowMonitorPanel] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [videoModalTitle, setVideoModalTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    resource_type: "youtube" as ResourceType,
    url: "",
    category: "Trainee",
  });

  const userCanManage = canEditProject(profile);
  const isUserTrainee = isTrainee(profile);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("learning_resources")
        .select("*, author:profiles!added_by(full_name)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setResources(data as LearningResource[]);
      }
    } catch (err) {
      console.error("Error fetching learning resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilesAndCompletions = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (!error && data) {
        setTeamProfiles(data as Profile[]);

        // Load completions for each profile from localStorage
        const completionsMap: Record<string, string[]> = {};
        data.forEach((p: Profile) => {
          const saved = localStorage.getItem(`roxx_completed_learning_${p.id}`);
          if (saved) {
            try {
              completionsMap[p.id] = JSON.parse(saved);
            } catch (e) {
              completionsMap[p.id] = [];
            }
          } else {
            completionsMap[p.id] = [];
          }
        });

        // Ensure current user completion is synced
        if (profile?.id && !completionsMap[profile.id]) {
          const savedCurrent = localStorage.getItem(`roxx_completed_learning_${profile.id}`);
          completionsMap[profile.id] = savedCurrent ? JSON.parse(savedCurrent) : [];
        }

        setMemberCompletions(completionsMap);
      }
    } catch (err) {
      console.error("Error fetching team profiles:", err);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchProfilesAndCompletions();
  }, [profile?.id, supabase]);

  // Toggle completion for a specific member ID
  const toggleMemberResourceCompletion = (memberId: string, resourceId: string) => {
    setMemberCompletions((prev) => {
      const currentList = prev[memberId] || [];
      const updatedList = currentList.includes(resourceId)
        ? currentList.filter((id) => id !== resourceId)
        : [...currentList, resourceId];

      const newMap = { ...prev, [memberId]: updatedList };

      try {
        localStorage.setItem(`roxx_completed_learning_${memberId}`, JSON.stringify(updatedList));
      } catch (e) {
        console.error("Failed to save learning completion:", e);
      }

      return newMap;
    });
  };

  const handleOpenCreate = () => {
    setEditingResource(null);
    setForm({
      title: "",
      description: "",
      resource_type: "youtube",
      url: "",
      category: profile?.role === "trainee" || profile?.department === "Trainee" ? "Trainee" : "General",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (res: LearningResource) => {
    setEditingResource(res);
    setForm({
      title: res.title,
      description: res.description || "",
      resource_type: res.resource_type,
      url: res.url,
      category: res.category || "General",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSubmitting(true);

    try {
      if (editingResource) {
        const { error } = await supabase
          .from("learning_resources")
          .update({
            title: form.title,
            description: form.description || null,
            resource_type: form.resource_type,
            url: form.url,
            category: form.category,
          })
          .eq("id", editingResource.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("learning_resources").insert({
          title: form.title,
          description: form.description || null,
          resource_type: form.resource_type,
          url: form.url,
          category: form.category,
          added_by: profile.id,
        });

        if (error) throw error;
      }

      setModalOpen(false);
      await fetchResources();
    } catch (err: any) {
      alert("Failed to save learning resource: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete material "${title}"?`)) return;
    try {
      const { error } = await supabase.from("learning_resources").delete().eq("id", id);
      if (error) throw error;
      await fetchResources();
    } catch (err: any) {
      alert("Failed to delete resource: " + err.message);
    }
  };

  // Trainees can ONLY see Trainee materials. Members/Captains can see ALL materials.
  const visibleResources = resources.filter((r) => {
    if (isUserTrainee) {
      return r.category === "Trainee";
    }
    return true;
  });

  const filteredResources = visibleResources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
    const matchesType = typeFilter === "all" || r.resource_type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Calculate Progress for the active target user (Selected member or current user)
  const activeTargetId = selectedMemberId || profile?.id || "";
  const selectedMemberProfile = teamProfiles.find((p) => p.id === activeTargetId) || profile;
  
  const targetUserCompletedIds = memberCompletions[activeTargetId] || [];
  
  // Calculate Target User Progress
  const isTargetTrainee = selectedMemberProfile ? isTrainee(selectedMemberProfile) : isUserTrainee;
  const targetApplicableResources = visibleResources.filter((r) => {
    if (isTargetTrainee) return r.category === "Trainee";
    return true;
  });

  const totalTargetMaterials = targetApplicableResources.length;
  const targetCompletedCount = targetApplicableResources.filter((r) =>
    targetUserCompletedIds.includes(r.id)
  ).length;
  const targetProgressPercentage =
    totalTargetMaterials > 0 ? Math.round((targetCompletedCount / totalTargetMaterials) * 100) : 0;

  // Calculate Team Overview Progress for Captain & Vice Captain
  const filteredTeamMembers = teamProfiles.filter((p) => {
    const matchesSearch = p.full_name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchMemberQuery.toLowerCase());
    const matchesRole =
      memberRoleFilter === "all" ||
      (memberRoleFilter === "trainee" && isTrainee(p)) ||
      (memberRoleFilter === "member" && p.role === "member") ||
      (memberRoleFilter === "vice_captain" && p.role === "vice_captain") ||
      (memberRoleFilter === "captain" && p.role === "captain");
    return matchesSearch && matchesRole;
  });

  const getMemberProgress = (member: Profile) => {
    const memberIsTrainee = isTrainee(member);
    const applicableRes = visibleResources.filter((r) => (memberIsTrainee ? r.category === "Trainee" : true));
    const completedIds = memberCompletions[member.id] || [];
    const completedCnt = applicableRes.filter((r) => completedIds.includes(r.id)).length;
    const totalCnt = applicableRes.length;
    const pct = totalCnt > 0 ? Math.round((completedCnt / totalCnt) * 100) : 0;
    return { completedCnt, totalCnt, pct };
  };

  const teamAveragePct =
    teamProfiles.length > 0
      ? Math.round(
          teamProfiles.reduce((acc, m) => acc + getMemberProgress(m).pct, 0) / teamProfiles.length
        )
      : 0;

  const renderTypeIcon = (type: ResourceType) => {
    switch (type) {
      case "youtube":
        return <Video className="h-5 w-5 text-red-600" />;
      case "drive":
        return <Folder className="h-5 w-5 text-amber-600" />;
      case "link":
        return <LinkIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const renderTypeBadge = (type: ResourceType) => {
    switch (type) {
      case "youtube":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Video className="h-3 w-3 text-red-600 dark:text-red-400" /> YouTube Video
          </span>
        );
      case "drive":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Folder className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Google Drive
          </span>
        );
      case "link":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <LinkIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" /> Reference Link
          </span>
        );
    }
  };

  return (
    <>
      <Header title="Learning Hub & Study Materials" />

      {/* Top Banner & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Learning & Knowledge Hub
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {isUserTrainee
              ? "Study materials and tutorials curated for 1st-year trainees."
              : "Tutorials, Google Drive documents, and YouTube videos. Monitor & update member learning progress."}
          </p>
        </div>
        {userCanManage && (
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0 self-start sm:self-auto">
            <Plus className="h-4 w-4 shrink-0" /> Add Learning Material
          </Button>
        )}
      </div>

      {/* CAPTAIN & VICE CAPTAIN: TEAM LEARNING PROGRESS MONITOR & UPDATE DASHBOARD */}
      {userCanManage && (
        <Card className="mb-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-xs">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      Team Learning Progress Monitor
                    </h3>
                    <Badge variant="forest" className="text-[10px]">
                      {isCaptain(profile) ? "Captain Control" : "Vice Captain View"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Track member study status, inspect individual progress bars, and update completion state.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={showMonitorPanel ? "secondary" : "outline"}
                  onClick={() => setShowMonitorPanel(!showMonitorPanel)}
                  className="text-xs gap-1.5"
                >
                  <Users className="h-3.5 w-3.5" />
                  {showMonitorPanel ? "Hide Team Roster" : "Show Team Roster"}
                </Button>
                {selectedMemberId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedMemberId(null)}
                    className="text-xs gap-1 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                  >
                    <X className="h-3.5 w-3.5" /> Clear Selection
                  </Button>
                )}
              </div>
            </div>

            {/* Team Overview Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Total Members</span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{teamProfiles.length}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Average Team Progress</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{teamAveragePct}%</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Total Materials</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{visibleResources.length}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Monitoring Target</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                  {selectedMemberProfile ? selectedMemberProfile.full_name : "All Team"}
                </span>
              </div>
            </div>
          </CardHeader>

          {/* Member Roster & Individual Progress Bars Table */}
          {showMonitorPanel && (
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-3 mb-4 justify-between items-center">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search member by name..."
                    value={searchMemberQuery}
                    onChange={(e) => setSearchMemberQuery(e.target.value)}
                    className="pl-8 text-xs py-1.5"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <Select
                    value={memberRoleFilter}
                    onChange={(e) => setMemberRoleFilter(e.target.value)}
                    className="text-xs py-1.5"
                  >
                    <option value="all">All Roles</option>
                    <option value="trainee">Trainees Only</option>
                    <option value="member">Regular Members</option>
                    <option value="vice_captain">Vice Captains</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredTeamMembers.map((m) => {
                  const { completedCnt, totalCnt, pct } = getMemberProgress(m);
                  const isSelected = selectedMemberId === m.id;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMemberId(isSelected ? null : m.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/20"
                          : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {m.full_name} {profile?.id === m.id && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(You)</span>}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {m.department} · {roleLabel(m.role)}
                            </p>
                          </div>
                          <Badge variant={isTrainee(m) ? "warning" : "info"} className="text-[9px] shrink-0">
                            {isTrainee(m) ? "Trainee" : m.role}
                          </Badge>
                        </div>

                        {/* Progress Bar per Member */}
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Learning Progress</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {completedCnt}/{totalCnt} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">
                          {pct === 100 ? "✓ 100% Completed" : pct > 0 ? "In Progress" : "Not Started"}
                        </span>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}>
                          <Eye className="h-3 w-3" />
                          {isSelected ? "Currently Updating" : "Inspect & Update"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredTeamMembers.length === 0 && (
                  <div className="col-span-full py-6 text-center text-slate-400 text-xs">
                    No team members match the filter criteria.
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* SELECTED MEMBER MONITORING & UPDATE ACTIVE BAR (When Captain/VC selects a member) */}
      {userCanManage && selectedMemberId && selectedMemberProfile && (
        <Card className="mb-6 border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  Updating Progress for: <span className="text-emerald-700 dark:text-emerald-400">{selectedMemberProfile.full_name}</span>
                  <Badge variant="forest" className="text-[10px]">{selectedMemberProfile.department}</Badge>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Use the material cards below to mark topics completed or incomplete on behalf of {selectedMemberProfile.full_name}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">{targetProgressPercentage}%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  {targetCompletedCount} of {totalTargetMaterials} Completed
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedMemberId(null)}
                className="text-xs gap-1 border-slate-300 dark:border-slate-700"
              >
                <X className="h-3 w-3" /> Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LEARNING PROGRESS TRACKER CARD FOR REGULAR TRAINEES / MEMBERS (Or personal view when not monitoring) */}
      {(!userCanManage || !selectedMemberId) && (
        <Card className="mb-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {isUserTrainee ? "My Learning Progress" : "Personal Learning Progress"}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Track completed study materials and video tutorials.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-emerald-400">{targetProgressPercentage}%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {targetCompletedCount} of {totalTargetMaterials} Materials Completed
                </span>
              </div>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-3 rounded-full bg-slate-900 dark:bg-emerald-500 transition-all duration-500"
                style={{ width: `${targetProgressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Bar */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search tutorials & materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {!isUserTrainee && (
            <div>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs py-2"
              >
                <option value="all">All Domains / Categories</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>
          )}

          <div className={isUserTrainee ? "sm:col-span-2" : ""}>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs py-2"
            >
              <option value="all">All Resource Types</option>
              <option value="youtube">YouTube Videos Only</option>
              <option value="drive">Google Drive Docs Only</option>
              <option value="link">Web Reference Links Only</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Learning Resources Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((res) => {
          const embedUrl = res.resource_type === "youtube" ? getYouTubeEmbedUrl(res.url) : null;
          const isCompleted = targetUserCompletedIds.includes(res.id);

          return (
            <Card key={res.id} className={`hover:shadow-md transition-all border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between min-w-0 ${isCompleted ? "bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60" : ""}`}>
              <CardHeader className="pb-3 p-3.5 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                      {renderTypeIcon(res.resource_type)}
                    </div>
                    <div>
                      <Badge variant="forest" className="text-[10px]">
                        {res.category}
                      </Badge>
                    </div>
                  </div>
                  {renderTypeBadge(res.resource_type)}
                </div>

                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {res.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {res.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 italic">
                    {res.description}
                  </p>
                )}

                {/* Primary Action Button */}
                <div className="space-y-2">
                  {res.resource_type === "youtube" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (embedUrl) {
                          setVideoModalUrl(embedUrl);
                          setVideoModalTitle(res.title);
                        } else {
                          window.open(res.url, "_blank");
                        }
                      }}
                      className="w-full text-xs bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <PlayCircle className="h-4 w-4" /> Watch YouTube Video
                    </Button>
                  ) : res.resource_type === "drive" ? (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Folder className="h-4 w-4" /> Open Google Drive Material <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold transition-colors shadow-2xs"
                    >
                      <LinkIcon className="h-4 w-4" /> Open Reference Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {/* Mark as Completed Toggle Button */}
                  <button
                    onClick={() => toggleMemberResourceCompletion(activeTargetId, res.id)}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <CheckCircle className={`h-3.5 w-3.5 ${isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`} />
                    {userCanManage && selectedMemberId && selectedMemberProfile
                      ? isCompleted
                        ? `Completed for ${selectedMemberProfile.full_name.split(" ")[0]} ✓`
                        : `Mark Completed for ${selectedMemberProfile.full_name.split(" ")[0]}`
                      : isCompleted
                      ? "Completed ✓"
                      : "Mark as Completed"}
                  </button>
                </div>

                {/* Footer Info & Admin Actions */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>
                    Added by: <strong className="text-slate-800 dark:text-slate-200">{res.author?.full_name || "Team Lead"}</strong>
                  </span>

                  {userCanManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(res)}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Edit Material"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id, res.title)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                        title="Delete Material"
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

        {filteredResources.length === 0 && (
          <div className="col-span-full py-16 text-center text-charcoal/60 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-base text-slate-900 dark:text-slate-100">No learning materials found.</p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
              {isUserTrainee
                ? "No trainee materials have been uploaded yet."
                : "Team leads can add Google Drive files and YouTube tutorials for trainee learning."}
            </p>
          </div>
        )}
      </div>

      {/* Embedded YouTube Video Player Modal */}
      {videoModalUrl && (
        <Modal
          isOpen={Boolean(videoModalUrl)}
          onClose={() => setVideoModalUrl(null)}
          title={videoModalTitle || "YouTube Video Player"}
          className="max-w-3xl"
        >
          <div className="space-y-3">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-md">
              <iframe
                src={videoModalUrl}
                title={videoModalTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setVideoModalUrl(null)} variant="secondary">
                Close Player
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Material Modal (Captain & Vice Captain Only) */}
      {userCanManage && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingResource ? "Edit Learning Material" : "Add Learning Material"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-charcoal/70 dark:text-slate-300 block mb-1">Title *</label>
              <Input
                placeholder="e.g. Flight Controller Calibration & Tuning Tutorial"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal/70 dark:text-slate-300 block mb-1">Resource Type *</label>
                <Select
                  value={form.resource_type}
                  onChange={(e) => setForm({ ...form, resource_type: e.target.value as ResourceType })}
                >
                  <option value="youtube">YouTube Video</option>
                  <option value="drive">Google Drive Document / Folder</option>
                  <option value="link">Web Reference Link</option>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal/70 dark:text-slate-300 block mb-1">Target Domain / Category *</label>
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal/70 dark:text-slate-300 block mb-1">
                {form.resource_type === "youtube"
                  ? "YouTube Video URL *"
                  : form.resource_type === "drive"
                  ? "Google Drive Link URL *"
                  : "URL Link *"}
              </label>
              <Input
                type="url"
                required
                placeholder={
                  form.resource_type === "youtube"
                    ? "https://www.youtube.com/watch?v=..."
                    : form.resource_type === "drive"
                    ? "https://drive.google.com/drive/folders/..."
                    : "https://example.com/docs"
                }
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal/70 dark:text-slate-300 block mb-1">Description / Study Notes (Optional)</label>
              <Textarea
                rows={3}
                placeholder="Key takeaways, instructions, or what to learn from this material..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={submitting}>
              {editingResource ? "Save Material Changes" : "Publish Learning Material"}
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
