"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ResearchDoc, Project } from "@/types";
import { Plus, BookOpen, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { isCaptain } from "@/lib/roles";

export default function ResearchPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [docs, setDocs] = useState<ResearchDoc[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ResearchDoc | null>(null);
  const [form, setForm] = useState({ title: "", content: "", project_id: "" });

  const fetchData = async () => {
    setLoading(true);
    const [docsRes, projectsRes] = await Promise.all([
      supabase.from("research_docs").select("*, author:profiles(full_name)").order("created_at", { ascending: false }),
      supabase.from("projects").select("*"),
    ]);
    setDocs((docsRes.data as ResearchDoc[]) || []);
    setProjects((projectsRes.data as Project[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleOpenAddModal = () => {
    setEditingDoc(null);
    setForm({ title: "", content: "", project_id: "" });
    setModalOpen(true);
  };

  const handleOpenEditModal = (doc: ResearchDoc) => {
    setEditingDoc(doc);
    setForm({
      title: doc.title,
      content: doc.content,
      project_id: doc.project_id || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDoc) {
        // Update document
        const { error } = await supabase
          .from("research_docs")
          .update({
            title: form.title,
            content: form.content,
            project_id: form.project_id || null,
          })
          .eq("id", editingDoc.id);

        if (error) throw error;
      } else {
        // Create new document
        const { error } = await supabase.from("research_docs").insert({
          title: form.title,
          content: form.content,
          project_id: form.project_id || null,
          author_id: profile?.id || user?.id || null,
        });

        if (error) throw error;
      }

      setModalOpen(false);
      setEditingDoc(null);
      setForm({ title: "", content: "", project_id: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save document.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research document?")) return;
    try {
      const { error } = await supabase.from("research_docs").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete document.");
    }
  };

  const projectName = (id: string | null) => projects.find((p) => p.id === id)?.name || "General";

  const canModifyDoc = (doc: ResearchDoc) => {
    if (!profile && !user) return false;
    const isTeamCaptain = profile?.role === "captain";
    const isDocAuthor = Boolean(
      doc.author_id && (doc.author_id === profile?.id || doc.author_id === user?.id)
    );
    return isTeamCaptain || isDocAuthor;
  };

  return (
    <>
      <Header title="Research & Documentation" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal">Research Log</h2>
          <p className="text-xs text-charcoal/60">Document engineering improvements, experiments, and technical notes</p>
        </div>
        <Button onClick={handleOpenAddModal} className="gap-2">
          <Plus className="h-4 w-4" /> Add Doc
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {docs.map((d) => (
          <Card key={d.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{d.title}</CardTitle>
                    <p className="text-xs text-charcoal/60 mt-0.5">
                      {projectName(d.project_id)} · {d.author?.full_name || "Author"} · {formatDate(d.created_at)}
                    </p>
                  </div>
                </div>

                {canModifyDoc(d) && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(d)}
                      className="p-1.5 text-charcoal/50 hover:text-forest hover:bg-forest/10 rounded-lg transition-colors"
                      title="Edit document"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1.5 text-charcoal/50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/80 bg-cream/30 p-3 rounded-lg border border-sand/40">
                {d.content}
              </p>
            </CardContent>
          </Card>
        ))}

        {!loading && docs.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-16 text-center text-charcoal/60">
              <BookOpen className="h-12 w-12 mx-auto text-charcoal/30 mb-3" />
              <p className="font-semibold text-charcoal">No research documents yet</p>
              <p className="text-xs text-charcoal/60 mt-1">Start documenting your experiments, designs, and innovations.</p>
              <Button onClick={handleOpenAddModal} className="mt-4 gap-2">
                <Plus className="h-4 w-4" /> Create First Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDoc(null);
        }}
        title={editingDoc ? "Edit Research Document" : "New Research Document"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal/70 mb-1 block">Document Title</label>
            <Input
              placeholder="e.g. Autonomous Flight PID Tuning Results"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal/70 mb-1 block">Associated Project</label>
            <Select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              <option value="">General / No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal/70 mb-1 block">Document Content</label>
            <Textarea
              placeholder="Document your findings, parameters, sensor data, or notes..."
              required
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" isLoading={submitting}>
            {editingDoc ? "Update Document" : "Save Document"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
