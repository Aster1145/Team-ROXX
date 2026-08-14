"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { canManageBudget } from "@/lib/roles";
import { BudgetItem, Project } from "@/types";
import { Plus, IndianRupee, Wallet } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function BudgetPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ item: "", amount: "", quantity: 1, category: "Components", project_id: "" });

  const fetchData = async () => {
    const [itemsRes, projectsRes] = await Promise.all([
      supabase.from("budget_items").select("*, profile:profiles(full_name)").order("purchased_at", { ascending: false }),
      supabase.from("projects").select("*"),
    ]);
    setItems((itemsRes.data as BudgetItem[]) || []);
    setProjects((projectsRes.data as Project[]) || []);
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const total = items.reduce((sum, i) => sum + i.amount * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("budget_items").insert({
      item: form.item,
      amount: Number(form.amount),
      quantity: Number(form.quantity),
      category: form.category,
      project_id: form.project_id || null,
      purchased_by: profile?.id,
    });
    setModalOpen(false);
    setForm({ item: "", amount: "", quantity: 1, category: "Components", project_id: "" });
    fetchData();
  };

  const projectName = (id: string | null) => projects.find((p) => p.id === id)?.name || "General";

  return (
    <>
      <Header title="Budget Tracking" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-charcoal/70">Track purchases, components and project expenses.</p>
        {canManageBudget(profile) && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        )}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10 text-forest">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">Total Spent</p>
              <p className="text-2xl font-semibold text-charcoal">₹{total.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/10 text-sage">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">Purchases</p>
              <p className="text-2xl font-semibold text-charcoal">{items.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone text-charcoal/60">
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Purchased By</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-stone/50">
                    <td className="py-3 font-medium text-charcoal">{i.item}</td>
                    <td className="py-3">{i.category}</td>
                    <td className="py-3">{projectName(i.project_id)}</td>
                    <td className="py-3">{i.quantity}</td>
                    <td className="py-3">₹{(i.amount * i.quantity).toLocaleString("en-IN")}</td>
                    <td className="py-3">{i.profile?.full_name}</td>
                    <td className="py-3">{formatDate(i.purchased_at)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-charcoal/60">
                      No expenses recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {canManageBudget(profile) && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Item name" required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" min={0} placeholder="Amount (₹)" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <Input type="number" min={1} placeholder="Quantity" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {["Components", "Tools", "Travel", "Registration", "Materials", "Other"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              <option value="">General / No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Button type="submit" className="w-full">Save Expense</Button>
          </form>
        </Modal>
      )}
    </>
  );
}
