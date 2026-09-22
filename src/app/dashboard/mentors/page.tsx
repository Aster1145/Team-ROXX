"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ACADEMIC_DEPARTMENTS } from "@/lib/constants";
import { isCaptain, roleLabel } from "@/lib/roles";
import { Profile, Project, Department } from "@/types";
import { Plus, Award, Mail, Phone, Building, FolderGit2, Pencil, Trash2, Users, Eye, EyeOff } from "lucide-react";

export default function MentorsPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Profile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    department: "Computer Science & Engineering (CSE)" as Department,
    project_id: "",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    department: "Computer Science & Engineering (CSE)" as Department,
    project_id: "",
  });

  const fetchData = async () => {
    try {
      const [mentorsRes, profilesRes, projectsRes] = await Promise.all([
        supabase.from("mentors").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("projects").select("*"),
      ]);

      const mentorTableList = (mentorsRes.data as any[]) || [];
      const allProfiles = (profilesRes.data as Profile[]) || [];
      
      const mentorIds = new Set(mentorTableList.map((m) => m.id));

      const combinedMentors: Profile[] = [
        ...mentorTableList.map((m) => ({
          id: m.id,
          email: m.email,
          full_name: m.full_name,
          role: "mentor" as const,
          department: m.department,
          project_id: m.project_id,
          phone_number: m.phone_number,
          created_at: m.created_at || new Date().toISOString(),
        })),
        ...allProfiles.filter((p) => (p.role === "mentor" || (p.full_name && p.full_name.startsWith("Dr."))) && !mentorIds.has(p.id)),
      ];

      setMentors(combinedMentors);
      setMembers(allProfiles);
      setProjects((projectsRes.data as Project[]) || []);
    } catch (err) {
      console.error("Error fetching mentors:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_id) {
      alert("Please select a project to assign to this Mentor.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/create-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: "mentor",
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        alert(result.error || "Failed to add mentor");
        setSubmitting(false);
        return;
      }

      setModalOpen(false);
      setForm({
        email: "",
        password: "",
        full_name: "",
        phone_number: "",
        department: "Computer Science & Engineering (CSE)",
        project_id: "",
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to add mentor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (m: Profile) => {
    setEditingMentor(m);
    setEditForm({
      full_name: m.full_name || "",
      email: m.email || "",
      phone_number: m.phone_number || "",
      department: m.department || "Computer Science & Engineering (CSE)",
      project_id: m.project_id || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/update-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingMentor.id,
          full_name: editForm.full_name,
          email: editForm.email,
          phone_number: editForm.phone_number,
          role: "mentor",
          department: editForm.department,
          project_id: editForm.project_id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || "Failed to update mentor details");
        setSubmitting(false);
        return;
      }

      setEditModalOpen(false);
      setEditingMentor(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update mentor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMentor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove Mentor ${name}?`)) return;

    try {
      await supabase.from("mentors").delete().eq("id", id);
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        alert("Database error: " + error.message);
        return;
      }

      fetch("/api/admin/remove-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      setMentors((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to remove mentor.");
    }
  };

  const userIsCaptain = isCaptain(profile);

  return (
    <>
      <Header title="Project Mentors" />

      {/* Top Banner & Action */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600 shrink-0" />
            <span>Project Mentors Directory</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Faculty advisors, industry specialists, and senior alumni guiding specific team projects.
          </p>
        </div>
        {userIsCaptain && (
          <Button onClick={() => setModalOpen(true)} className="gap-2 shrink-0 self-start sm:self-auto font-semibold bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 shrink-0" /> Add Project Mentor
          </Button>
        )}
      </div>

      {/* Mentor Directory List */}
      <div className="space-y-4">
        {mentors.map((m) => {
          const assignedProject = projects.find((p) => p.id === m.project_id);
          const projectMembers = members.filter((pm) => pm.project_id === m.project_id && pm.id !== m.id);

          return (
            <Card key={m.id} className="hover:shadow-md transition-shadow border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Mentor Information */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600 shrink-0" />
                        <span>{m.full_name}</span>
                      </h3>
                      <Badge variant="forest" className="bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 border-purple-300 font-semibold shrink-0">
                        Project Mentor
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-purple-600 shrink-0" /> {m.email}
                      </span>
                      {m.phone_number && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-purple-600 shrink-0" /> {m.phone_number}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-purple-600 shrink-0" /> {m.department}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons for Captain */}
                  {userIsCaptain && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditModal(m)}
                        className="text-xs font-medium gap-1"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit Mentor
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveMentor(m.id, m.full_name)}
                        className="text-xs p-2"
                        title="Remove Mentor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Mentored Project & Assigned Members Breakdown */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FolderGit2 className="h-3.5 w-3.5 text-amber-600 shrink-0" /> Mentored Project:
                    </span>
                    {assignedProject ? (
                      <Badge variant="forest" className="font-semibold text-xs">
                        {assignedProject.name} ({assignedProject.department})
                      </Badge>
                    ) : (
                      <span className="text-xs italic text-slate-400">No project assigned yet</span>
                    )}
                  </div>

                  {assignedProject && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                        <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" /> Project Members ({projectMembers.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {projectMembers.map((pm) => (
                          <span
                            key={pm.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            {pm.full_name} <span className="text-[10px] text-slate-500">({roleLabel(pm.role, pm.department)})</span>
                          </span>
                        ))}
                        {projectMembers.length === 0 && (
                          <span className="text-xs italic text-slate-400">No members currently assigned to this project.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {mentors.length === 0 && (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-8 text-center">
            <Award className="h-12 w-12 mx-auto text-purple-500/50 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Project Mentors Assigned Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Add faculty advisors, alumni, or domain specialists as Project Mentors to guide team members and rate project work.
            </p>
            {userIsCaptain && (
              <Button onClick={() => setModalOpen(true)} className="mt-4 gap-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 shrink-0" /> Add Project Mentor
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Add Mentor Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Project Mentor">
        <form onSubmit={handleAddMentor} className="space-y-4">
          <Input
            placeholder="Full Name (e.g. Dr. Ramesh Sharma / Prof. Jane Doe)"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email Address"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Phone Number (e.g. +91 9876543210)"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Temporary Password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Academic Department</label>
              <Select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value as any })}
              >
                {ACADEMIC_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Assigned Project *</label>
              <Select
                required
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              >
                <option value="">Select Project...</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" isLoading={submitting}>
            Create Project Mentor Profile
          </Button>
        </form>
      </Modal>

      {/* Edit Mentor Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Project Mentor Details">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
            <Input
              placeholder="Full Name"
              required
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Email Address</label>
            <Input
              type="email"
              placeholder="Email Address"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Phone Number</label>
            <Input
              placeholder="Phone Number"
              value={editForm.phone_number}
              onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Academic Department</label>
              <Select
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value as any })}
              >
                {ACADEMIC_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Assigned Project</label>
              <Select
                value={editForm.project_id}
                onChange={(e) => setEditForm({ ...editForm, project_id: e.target.value })}
              >
                <option value="">No project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" isLoading={submitting}>
            Save Changes
          </Button>
        </form>
      </Modal>
    </>
  );
}
