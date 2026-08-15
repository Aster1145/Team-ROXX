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
import { canEditProject, isCaptain } from "@/lib/roles";
import { LearningResource, ResourceType } from "@/types";
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
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Learning Progress state
  const [completedResourceIds, setCompletedResourceIds] = useState<string[]>([]);

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

  useEffect(() => {
    fetchResources();
    if (profile?.id) {
      const saved = localStorage.getItem(`roxx_completed_learning_${profile.id}`);
      if (saved) {
        try {
          setCompletedResourceIds(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse completed materials:", e);
        }
      }
    }
  }, [profile?.id, supabase]);

  const toggleCompleteResource = (id: string) => {
    setCompletedResourceIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      if (profile?.id) {
        localStorage.setItem(`roxx_completed_learning_${profile.id}`, JSON.stringify(updated));
      }
      return updated;
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

  const isUserTrainee = profile?.role === "trainee";

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

  // Calculate Learning Progress
  const totalTraineeMaterials = visibleResources.length;
  const completedCount = visibleResources.filter((r) => completedResourceIds.includes(r.id)).length;
  const progressPercentage =
    totalTraineeMaterials > 0 ? Math.round((completedCount / totalTraineeMaterials) * 100) : 0;

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
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <Video className="h-3 w-3 text-red-600" /> YouTube Video
          </span>
        );
      case "drive":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
            <Folder className="h-3 w-3 text-amber-600" /> Google Drive
          </span>
        );
      case "link":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200">
            <LinkIcon className="h-3 w-3 text-blue-600" /> Reference Link
          </span>
        );
    }
  };

  const userCanManage = canEditProject(profile);

  return (
    <>
      <Header title="Learning Hub & Study Materials" />

      {/* Top Banner & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-forest shrink-0" />
            Learning & Knowledge Hub
          </h2>
          <p className="text-xs text-charcoal/70">
            {isUserTrainee
              ? "Study materials and tutorials curated for 1st-year trainees."
              : "Tutorials, Google Drive documents, and YouTube videos for trainees and domain study."}
          </p>
        </div>
        {userCanManage && (
          <Button onClick={handleOpenCreate} className="gap-2 bg-forest hover:bg-forest/90 text-white font-semibold shrink-0 self-start sm:self-auto">
            <Plus className="h-4 w-4 shrink-0" /> Add Learning Material
          </Button>
        )}
      </div>

      {/* TRAINEE LEARNING PROGRESS TRACKER CARD (TRAINEES ONLY) */}
      {isUserTrainee && (
        <Card className="mb-6 border-forest/30 bg-gradient-to-r from-forest/10 via-white to-forest/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-charcoal text-base">My Learning Progress</h3>
                  <p className="text-xs text-charcoal/70">
                    Track completed study materials and video tutorials.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-forest">{progressPercentage}%</span>
                <span className="text-xs text-charcoal/60 block">
                  {completedCount} of {totalTraineeMaterials} Materials Completed
                </span>
              </div>
            </div>

            <div className="h-3 w-full rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-3 rounded-full bg-forest transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Bar */}
      <div className="mb-6 rounded-2xl border border-stone bg-white p-4 shadow-2xs">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-charcoal/40" />
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
          const isCompleted = completedResourceIds.includes(res.id);

          return (
            <Card key={res.id} className={`hover:shadow-md transition-all border-stone/70 flex flex-col justify-between min-w-0 ${isCompleted ? "bg-emerald-50/30 border-emerald-300" : ""}`}>
              <CardHeader className="pb-3 p-3.5 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 border border-stone">
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

                <CardTitle className="text-base font-bold text-charcoal leading-snug">
                  {res.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {res.description && (
                  <p className="text-xs text-charcoal/70 line-clamp-3 italic">
                    {res.description}
                  </p>
                )}

                {/* Primary Action Button */}
                <div className="pt-2 border-t border-stone/40 space-y-2">
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
                      className="w-full text-xs bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-1.5"
                    >
                      <PlayCircle className="h-4 w-4" /> Watch YouTube Video
                    </Button>
                  ) : res.resource_type === "drive" ? (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 text-xs font-semibold transition-colors"
                    >
                      <Folder className="h-4 w-4" /> Open Google Drive Material <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-semibold transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" /> Open Reference Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {/* Mark as Completed Toggle Button (Trainees Only) */}
                  {isUserTrainee && (
                    <button
                      onClick={() => toggleCompleteResource(res.id)}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-950 border border-emerald-300 hover:bg-emerald-200"
                          : "bg-stone-100 text-charcoal/70 border border-stone-300 hover:bg-stone-200"
                      }`}
                    >
                      <CheckCircle className={`h-3.5 w-3.5 ${isCompleted ? "text-emerald-700" : "text-stone-400"}`} />
                      {isCompleted ? "Completed ✓" : "Mark as Completed"}
                    </button>
                  )}
                </div>

                {/* Footer Info & Admin Actions */}
                <div className="flex items-center justify-between text-[11px] text-charcoal/50 pt-2 border-t border-stone/30">
                  <span>
                    Added by: <strong>{res.author?.full_name || "Team Lead"}</strong>
                  </span>

                  {userCanManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(res)}
                        className="p-1 text-charcoal/60 hover:text-forest hover:bg-forest/10 rounded transition-colors"
                        title="Edit Material"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id, res.title)}
                        className="p-1 text-charcoal/40 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
          <div className="col-span-full py-16 text-center text-charcoal/60 bg-white rounded-2xl border border-stone">
            <BookOpen className="h-10 w-10 mx-auto text-charcoal/30 mb-2" />
            <p className="font-bold text-base">No learning materials found.</p>
            <p className="text-xs mt-1">
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
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Title *</label>
              <Input
                placeholder="e.g. Flight Controller Calibration & Tuning Tutorial"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal/70 block mb-1">Resource Type *</label>
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
                <label className="text-xs font-semibold text-charcoal/70 block mb-1">Target Domain / Category *</label>
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
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">
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
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Description / Study Notes (Optional)</label>
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
