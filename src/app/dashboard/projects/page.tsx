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
import { canEditProject, isCaptain, canDeleteTask, canAssignTasksForProject } from "@/lib/roles";
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

  const isUserMentor = profile?.role === "mentor";
  const displayedProjects = isUserMentor && profile?.project_id
    ? projects.filter((p) => p.id === profile.project_id)
    : projects;

  return (
    <>
      <Header title="Projects" />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-charcoal/70">Track drone, hydroponics and research projects.</p>
        {canEditProject(profile) && (
          <Button onClick={openCreate} className="gap-1.5 shrink-0 self-start sm:self-auto font-semibold">
            <Plus className="h-4 w-4 shrink-0" /> New Project
          </Button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {displayedProjects.map((p) => (
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchTasks();
    onUpdate();
  };

  const assignedMember = (id: string | null) => members.find((m) => m.id === id);

  return (
    <Modal isOpen onClose={onClose} title={project.name} className="max-w-3xl">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{project.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="forest">{project.department}</Badge>
            <Badge variant={project.status === "ongoing" ? "success" : "default"}>{project.status.replace("_", " ")}</Badge>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Tasks</h3>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {tasks.length}
              </span>
            </div>
            {canAssignTasksForProject(profile, project.id) && (
              <Button size="sm" onClick={() => setShowTaskForm(true)} className="gap-1">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            )}
          </div>

          {showTaskForm && (
            <form onSubmit={handleAddTask} className="mb-4 space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  value={taskForm.assigned_to || ""}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value || null })}
                >
                  <option value="">Assign to...</option>
                  {members
                    .filter((m) => !profile || profile.role !== "mentor" || m.project_id === project.id)
                    .map((m) => (
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

          {/* Scrollable Tasks Container */}
          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3 scroll-smooth">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug break-words">{t.title}</p>
                    {t.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed break-words">{t.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>Assigned to: <strong className="text-slate-800 dark:text-slate-200">{assignedMember(t.assigned_to)?.full_name || "Unassigned"}</strong></span>
                      {t.due_date && <span>• Due: <strong className="text-slate-700 dark:text-slate-300">{t.due_date}</strong></span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <Select
                      value={t.status}
                      onChange={(e) => updateTaskStatus(t.id, e.target.value as Task["status"])}
                      className="w-full sm:w-36"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </Select>
                    {canDeleteTask(profile) && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteTask(t.id)}
                        className="h-10 px-2.5 shrink-0"
                        title="Delete Task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No tasks created for this project yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
