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
import { DEPARTMENTS, ROLES } from "@/lib/constants";
import { isCaptain, roleLabel } from "@/lib/roles";
import { Profile, Project, Role, Department } from "@/types";
import { Plus, Trash2, Mail, Phone, Building, FolderGit2, Pencil } from "lucide-react";

export default function MembersPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Profile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    role: "member" as Role,
    department: "General" as Department,
    project_id: "",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    role: "member" as Role,
    department: "General" as Department,
    project_id: "",
  });

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setMembers((data as Profile[]) || []);
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*");
    setProjects((data as Project[]) || []);
  };

  useEffect(() => {
    Promise.all([fetchMembers(), fetchProjects()]).then(() => setLoading(false));
  }, [supabase]);

  // Check if a Captain already exists in the team
  const hasCaptain = members.some((m) => m.role === "captain");

  // Filter roles for new members: Only allow Captain selection if no Captain exists yet
  const availableRoles = ROLES.filter((r) => {
    if (r.value === "captain" && hasCaptain) return false;
    return true;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/create-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        alert(result.error || "Failed to create member");
        setSubmitting(false);
        return;
      }

      setModalOpen(false);
      setForm({
        email: "",
        password: "",
        full_name: "",
        phone_number: "",
        role: "member",
        department: "General",
        project_id: "",
      });
      await fetchMembers();
    } catch (err: any) {
      alert(err.message || "Failed to add member.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (m: Profile) => {
    setEditingMember(m);
    setEditForm({
      full_name: m.full_name || "",
      email: m.email || "",
      phone_number: m.phone_number || "",
      department: m.department || "General",
      project_id: m.project_id || "",
      role: m.role || "member",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSubmitting(true);
    try {
      const updateData: Record<string, any> = {
        full_name: editForm.full_name,
        email: editForm.email,
        department: editForm.department,
        project_id: editForm.project_id || null,
        role: editForm.role,
        phone_number: editForm.phone_number || null,
      };

      let { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", editingMember.id);

      if (error && error.message.includes("phone_number")) {
        // Fallback: update profile without phone_number if column is not created yet
        delete updateData.phone_number;
        const fallback = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", editingMember.id);

        if (fallback.error) {
          alert("Error updating profile: " + fallback.error.message);
          setSubmitting(false);
          return;
        }

        alert(
          "Profile updated! Note: To store Phone Numbers permanently, run this line in your Supabase SQL Editor:\n\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;"
        );
      } else if (error) {
        alert("Error updating profile: " + error.message);
        setSubmitting(false);
        return;
      }

      setEditModalOpen(false);
      setEditingMember(null);
      await fetchMembers();
    } catch (err: any) {
      alert(err.message || "Failed to update member.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from Team ROXX?`)) return;

    try {
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

      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to remove member.");
    }
  };

  const userIsCaptain = isCaptain(profile);

  return (
    <>
      <Header title="Members" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal">Team Directory</h2>
          <p className="text-xs text-charcoal/60">Complete member directory with roles, contact information, and projects</p>
        </div>
        {userIsCaptain && (
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {members.map((m) => {
          const memberProjectName = projects.find((p) => p.id === m.project_id)?.name;

          return (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Member Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-charcoal">{m.full_name}</h3>
                    <Badge variant={m.role === "captain" ? "forest" : m.role === "vice_captain" ? "sage" : "default"}>
                      {roleLabel(m.role)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal/70">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-forest" />
                      <span>{m.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-forest" />
                      <span>{m.phone_number || "No phone listed"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-sage" />
                      <span>{m.department}</span>
                    </div>

                    {memberProjectName && (
                      <div className="flex items-center gap-1.5">
                        <FolderGit2 className="h-3.5 w-3.5 text-amber-700" />
                        <span>{memberProjectName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Captain */}
                {userIsCaptain && (
                  <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-sand/40">
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="p-2 text-charcoal/60 hover:text-forest hover:bg-forest/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium border border-sand px-3 py-1.5"
                      title="Edit Member Details"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit Teammate</span>
                    </button>

                    {m.id !== profile?.id && (
                      <button
                        onClick={() => handleRemoveMember(m.id, m.full_name)}
                        className="p-2 text-charcoal/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Member Modal (Captain Only) */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Team Member">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            placeholder="Full Name"
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
          <Input
            type="password"
            placeholder="Temporary Password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
            >
              {availableRoles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
            <Select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value as any })}
            >
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </div>
          <Button type="submit" className="w-full" isLoading={submitting}>
            Create Team Member
          </Button>
        </form>
      </Modal>

      {/* Edit Member Modal (Captain Only) */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Teammate Details">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Full Name</label>
            <Input
              placeholder="Full Name"
              required
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Email Address</label>
            <Input
              type="email"
              placeholder="Email Address"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Phone Number</label>
            <Input
              placeholder="Phone Number (e.g. +91 9876543210)"
              value={editForm.phone_number}
              onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Role</label>
              <Select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
              >
                {ROLES.map((r) => {
                  if (r.value === "captain" && hasCaptain && editingMember?.role !== "captain") {
                    return null;
                  }
                  return <option key={r.value} value={r.value}>{r.label}</option>;
                })}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Department</label>
              <Select
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value as any })}
              >
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Assigned Project</label>
            <Select
              value={editForm.project_id}
              onChange={(e) => setEditForm({ ...editForm, project_id: e.target.value })}
            >
              <option value="">No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>

          <Button type="submit" className="w-full" isLoading={submitting}>
            Save Changes
          </Button>
        </form>
      </Modal>
    </>
  );
}
