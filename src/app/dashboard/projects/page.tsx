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
import { DEPARTMENTS, STATUS_OPTIONS } from "@/lib/constants";
import { canEditProject, isCaptain } from "@/lib/roles";
import { Project, Profile, Task } from "@/types";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";

export default function ProjectsPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [form, setForm] = useState<Partial<Project>>({
    name: "",
    description: "",
    status: "ongoing",
    department: "General",
    progress: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects((data as Project[]) || []);
  };

  const fetchMembers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    setMembers((data as Profile[]) || []);
  };

  useEffect(() => {
    Promise.all([fetchProjects(), fetchMembers()]).then(() => setLoading(false));
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from("projects").update(form).eq("id", editingId);
    } else {
      await supabase.from("projects").insert(form);
    }
    setModalOpen(false);
    setForm({ name: "", description: "", status: "ongoing", department: "General", progress: 0 });
    setEditingId(null);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    fetchProjects();
  };

  const openEdit = (p: Project) => {
    setForm(p);
    setEditingId(p.id);
    setModalOpen(true);
  };

  const openCreate = () => {
    setForm({ name: "", description: "", status: "ongoing", department: profile?.department || "General", progress: 0 });
    setEditingId(null);
    setModalOpen(true);
  };

  return (
    <>
      <Header title="Projects" />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-charcoal/70">Track drone, hydroponics and research projects.</p>
        {canEditProject(profile) && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <Card
            key={p.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setDetailProject(p)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{p.name}</CardTitle>
                  <p className="text-xs text-charcoal/60">{p.department}</p>
                </div>
                <Badge variant={p.status === "ongoing" ? "forest" : p.status === "completed" ? "success" : "default"}>
                  {p.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-sm text-charcoal/70">{p.description}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-charcoal/60">Progress</span>
                  <span className="font-medium">{p.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-stone">
                  <div
                    className="h-2 rounded-full bg-forest"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
              {canEditProject(profile) && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  {isCaptain(profile) && (
                    <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Project" : "New Project"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Department</label>
              <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as any })}>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Progress (%)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
            />
          </div>
          <Button type="submit" className="w-full">{editingId ? "Save Changes" : "Create Project"}</Button>
        </form>
      </Modal>

      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          members={members}
          onClose={() => setDetailProject(null)}
          onUpdate={fetchProjects}
        />
      )}
    </>
  );
}

function ProjectDetailModal({
  project,
  members,
  onClose,
  onUpdate,
}: {
  project: Project;
  members: Profile[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const { profile } = useAuth();
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "todo",
    assigned_to: "",
    due_date: "",
  });

  const fetchTasks = async () => {
    const { data } = await supabase.from("tasks").select("*").eq("project_id", project.id).order("created_at", { ascending: false });
    setTasks((data as Task[]) || []);
  };

  useEffect(() => {
    fetchTasks();
  }, [project.id, supabase]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("tasks").insert({
      ...taskForm,
      project_id: project.id,
      assigned_by: profile?.id,
    });
    setTaskForm({ title: "", description: "", status: "todo", assigned_to: "", due_date: "" });
    setShowTaskForm(false);
    fetchTasks();
    onUpdate();
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    await supabase.from("tasks").update({ status }).eq("id", id);
    fetchTasks();
  };

  const assignedMember = (id: string | null) => members.find((m) => m.id === id);

  return (
    <Modal isOpen onClose={onClose} title={project.name} className="max-w-2xl">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-charcoal/70">{project.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="forest">{project.department}</Badge>
            <Badge variant={project.status === "ongoing" ? "success" : "default"}>{project.status.replace("_", " ")}</Badge>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-charcoal">Tasks</h3>
            {canEditProject(profile) && (
              <Button size="sm" onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            )}
          </div>

          {showTaskForm && (
            <form onSubmit={handleAddTask} className="mb-4 space-y-3 rounded-xl border border-stone bg-cream p-4">
              <Input
                placeholder="Task title"
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={taskForm.assigned_to || ""}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value || null })}
                >
                  <option value="">Assign to...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name} ({m.department})</option>
                  ))}
                </Select>
                <Input
                  type="date"
                  value={taskForm.due_date || ""}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save Task</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowTaskForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="rounded-xl border border-stone bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-charcoal">{t.title}</p>
                    <p className="text-sm text-charcoal/70">{t.description}</p>
                    <p className="mt-1 text-xs text-charcoal/50">
                      Assigned to: {assignedMember(t.assigned_to)?.full_name || "Unassigned"}
                    </p>
                  </div>
                  <Select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value as Task["status"])}
                    className="w-36"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </Select>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-charcoal/60">No tasks yet.</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
}
