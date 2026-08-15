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
import { canManageBudget, isCaptain } from "@/lib/roles";
import { BudgetItem, BudgetItemRequest, Project, RequestPriority, RequestStatus } from "@/types";
import { Plus, IndianRupee, Wallet, ShoppingCart, CheckCircle, XCircle, ExternalLink, Clock, PackageCheck, AlertCircle, Pencil, Trash2, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import * as XLSX from "xlsx";

export default function BudgetPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState<"expenses" | "requests">("requests");
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [requests, setRequests] = useState<BudgetItemRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [requestSearchQuery, setRequestSearchQuery] = useState<string>("");
  
  // Modals state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<BudgetItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [expenseForm, setExpenseForm] = useState({
    item: "",
    amount: "",
    quantity: 1,
    category: "Components",
    project_id: "",
  });

  const [editExpenseForm, setEditExpenseForm] = useState({
    item: "",
    amount: "",
    quantity: 1,
    category: "Components",
    project_id: "",
  });

  const [requestForm, setRequestForm] = useState({
    item: "",
    amount: "",
    quantity: 1,
    category: "Components",
    priority: "medium" as RequestPriority,
    project_id: "",
    justification: "",
    link: "",
  });

  const fetchData = async () => {
    try {
      const [itemsRes, projectsRes, requestsRes] = await Promise.all([
        supabase
          .from("budget_items")
          .select("*, profile:profiles(full_name)")
          .order("purchased_at", { ascending: false }),
        supabase.from("projects").select("*"),
        supabase
          .from("budget_requests")
          .select("*, requester:profiles!requested_by(full_name, email), reviewer:profiles!reviewed_by(full_name)")
          .order("created_at", { ascending: false }),
      ]);

      setItems((itemsRes.data as BudgetItem[]) || []);
      setProjects((projectsRes.data as Project[]) || []);
      if (!requestsRes.error && requestsRes.data) {
        setRequests(requestsRes.data as BudgetItemRequest[]);
      }
    } catch (err) {
      console.error("Error loading budget data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const totalSpent = items.reduce((sum, i) => sum + i.amount * i.quantity, 0);
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const pendingTotal = pendingRequests.reduce((sum, r) => sum + r.amount * r.quantity, 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from("budget_items").insert({
        item: expenseForm.item,
        amount: Number(expenseForm.amount),
        quantity: Number(expenseForm.quantity),
        category: expenseForm.category,
        project_id: expenseForm.project_id || null,
        purchased_by: profile?.id,
      });
      setExpenseModalOpen(false);
      setExpenseForm({ item: "", amount: "", quantity: 1, category: "Components", project_id: "" });
      await fetchData();
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditExpense = (item: BudgetItem) => {
    setEditingExpense(item);
    setEditExpenseForm({
      item: item.item,
      amount: item.amount.toString(),
      quantity: item.quantity,
      category: item.category,
      project_id: item.project_id || "",
    });
    setEditExpenseModalOpen(true);
  };

  const handleSaveExpenseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("budget_items")
        .update({
          item: editExpenseForm.item,
          amount: Number(editExpenseForm.amount),
          quantity: Number(editExpenseForm.quantity),
          category: editExpenseForm.category,
          project_id: editExpenseForm.project_id || null,
        })
        .eq("id", editingExpense.id);

      if (error) throw error;

      setEditExpenseModalOpen(false);
      setEditingExpense(null);
      await fetchData();
    } catch (err: any) {
      alert("Failed to update expense: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete expense "${itemName}"?`)) return;
    try {
      const { error } = await supabase.from("budget_items").delete().eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      alert("Failed to delete expense: " + err.message);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("budget_requests").insert({
        requested_by: profile.id,
        item: requestForm.item,
        amount: Number(requestForm.amount),
        quantity: Number(requestForm.quantity),
        category: requestForm.category,
        priority: requestForm.priority,
        project_id: requestForm.project_id || null,
        justification: requestForm.justification || null,
        link: requestForm.link || null,
        status: "pending",
      }).select("*, requester:profiles!requested_by(full_name, email)");

      if (error) throw error;

      if (data) {
        setRequests((prev) => [data[0] as BudgetItemRequest, ...prev]);
      }
      setRequestModalOpen(false);
      setRequestForm({
        item: "",
        amount: "",
        quantity: 1,
        category: "Components",
        priority: "medium",
        project_id: "",
        justification: "",
        link: "",
      });
      await fetchData();
    } catch (err) {
      console.error("Error creating item request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: RequestStatus, note?: string) => {
    if (!profile?.id) return;
    try {
      const updatePayload: Record<string, unknown> = {
        status: newStatus,
        reviewed_by: profile.id,
        updated_at: new Date().toISOString(),
      };
      if (note !== undefined) {
        updatePayload.rejection_reason = note;
      }

      await supabase.from("budget_requests").update(updatePayload).eq("id", requestId);
      await fetchData();
    } catch (err) {
      console.error("Error updating request status:", err);
    }
  };

  // Fixed: Prevents duplicate logging if request was already ordered
  const handleOrderRequest = async (req: BudgetItemRequest) => {
    if (!profile?.id) return;
    if (req.status === "ordered") {
      alert("This item has already been ordered and recorded in expenses.");
      return;
    }
    try {
      // 1. Mark request status as 'ordered' FIRST
      await handleUpdateRequestStatus(req.id, "ordered");

      // 2. Insert into budget_items as an official expense ONCE
      await supabase.from("budget_items").insert({
        item: req.item,
        amount: req.amount,
        quantity: req.quantity,
        category: req.category,
        project_id: req.project_id || null,
        purchased_by: profile.id,
      });

      await fetchData();
    } catch (err) {
      console.error("Error ordering request:", err);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) return;
    await handleUpdateRequestStatus(selectedRequestId, "rejected", rejectionReason);
    setRejectModalOpen(false);
    setSelectedRequestId(null);
    setRejectionReason("");
  };

  const exportExpensesExcel = () => {
    const rows = items.map((i) => ({
      Item: i.item,
      Category: i.category,
      Project: projectName(i.project_id),
      Quantity: i.quantity,
      "Unit Price (₹)": i.amount,
      "Total Amount (₹)": i.amount * i.quantity,
      "Purchased / Ordered By": i.profile?.full_name || "Team Lead",
      Date: formatDate(i.purchased_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recorded Expenses");
    XLSX.writeFile(wb, `recorded-expenses-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    if (requestSearchQuery.trim() !== "") {
      const q = requestSearchQuery.toLowerCase();
      const matchItem = r.item?.toLowerCase().includes(q);
      const matchJustification = r.justification?.toLowerCase().includes(q);
      const matchRequester = r.requester?.full_name?.toLowerCase().includes(q);
      if (!matchItem && !matchJustification && !matchRequester) return false;
    }
    return true;
  });

  const exportFilteredRequestsExcel = () => {
    if (filteredRequests.length === 0) {
      alert("No item requests match the current filter criteria to export.");
      return;
    }

    const rows = filteredRequests.map((r, idx) => {
      const unitPrice = Number(r.amount) || 0;
      const qty = Number(r.quantity) || 1;
      const totalPrice = unitPrice * qty;

      return {
        "S.No": idx + 1,
        "Item Name": r.item,
        Category: r.category,
        Priority: r.priority ? r.priority.toUpperCase() : "MEDIUM",
        Quantity: qty,
        "Estimated Unit Price (₹)": unitPrice,
        "Total Estimated Cost (₹)": totalPrice,
        "Requested By": r.requester?.full_name || "Team Member",
        "Requested Email": r.requester?.email || "N/A",
        Status: r.status ? r.status.toUpperCase() : "PENDING",
        "Project / Domain": projectName(r.project_id),
        "Justification / Purpose": r.justification || "N/A",
        "Product Link / Reference": r.link || "N/A",
        "Reviewed By": r.reviewer?.full_name || "N/A",
        "Rejection Note": r.rejection_reason || "N/A",
        "Date Requested": formatDate(r.created_at),
      };
    });

    const grandTotal = filteredRequests.reduce(
      (sum, r) => sum + (Number(r.amount) || 0) * (Number(r.quantity) || 1),
      0
    );

    // Summary row
    rows.push({
      "S.No": "" as any,
      "Item Name": "TOTAL ESTIMATED BUDGET SUM",
      Category: "",
      Priority: "",
      Quantity: "" as any,
      "Estimated Unit Price (₹)": "" as any,
      "Total Estimated Cost (₹)": grandTotal as any,
      "Requested By": "",
      "Requested Email": "",
      Status: "",
      "Project / Domain": "",
      "Justification / Purpose": "",
      "Product Link / Reference": "",
      "Reviewed By": "",
      "Rejection Note": "",
      "Date Requested": "",
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    const filterTag = statusFilter === "all" ? "Filtered" : statusFilter.toUpperCase();
    XLSX.utils.book_append_sheet(wb, ws, `${filterTag} Requests`);

    const fileName = `${filterTag}-Item-Requests-TeamROXX-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const projectName = (id: string | null) => projects.find((p) => p.id === id)?.name || "General";

  const renderStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-300">
            <Clock className="h-3.5 w-3.5 text-amber-800" /> Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900 border border-blue-300">
            <CheckCircle className="h-3.5 w-3.5 text-blue-800" /> Approved
          </span>
        );
      case "ordered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-950 border border-emerald-300">
            <PackageCheck className="h-3.5 w-3.5 text-emerald-800" /> Ordered / Purchased
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-900 border border-rose-300">
            <XCircle className="h-3.5 w-3.5 text-rose-800" /> Rejected
          </span>
        );
    }
  };

  const renderPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case "urgent":
        return <span className="rounded bg-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-950 uppercase border border-rose-300">Urgent</span>;
      case "high":
        return <span className="rounded bg-orange-200 px-2.5 py-0.5 text-xs font-semibold text-orange-950 border border-orange-300">High</span>;
      case "medium":
        return <span className="rounded bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-charcoal border border-stone-300">Medium</span>;
      case "low":
        return <span className="rounded bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-900 border border-slate-300">Low</span>;
    }
  };

  return (
    <>
      <Header title="Budget & Item Requests" />

      {/* Top Header & Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-charcoal/80 font-medium">
          Request hardware/materials, manage team lead approvals, and track budget expenses.
        </p>
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button variant="outline" onClick={exportExpensesExcel} className="gap-1.5 shrink-0 text-xs font-semibold whitespace-nowrap">
            <Download className="h-4 w-4 shrink-0" /> Export Excel
          </Button>
          <Button
            onClick={() => setRequestModalOpen(true)}
            className="bg-forest hover:bg-forest/90 text-white font-semibold shadow-md gap-1.5 shrink-0 text-xs whitespace-nowrap"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" /> Request Item
          </Button>
          {canManageBudget(profile) && (
            <Button
              variant="outline"
              onClick={() => setExpenseModalOpen(true)}
              className="border-charcoal/30 text-charcoal hover:bg-stone/50 font-semibold gap-1.5 shrink-0 text-xs whitespace-nowrap"
            >
              <Plus className="h-4 w-4 shrink-0" /> Direct Expense
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10 text-forest">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">Total Spent</p>
              <p className="text-2xl font-semibold text-charcoal">₹{totalSpent.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">Pending Requests</p>
              <p className="text-2xl font-semibold text-charcoal">
                {pendingRequests.length}{" "}
                <span className="text-xs font-normal text-charcoal/60">
                  (₹{pendingTotal.toLocaleString("en-IN")})
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/10 text-sage">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">Purchased Items</p>
              <p className="text-2xl font-semibold text-charcoal">{items.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 border-b border-stone/60">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "requests"
                ? "border-forest text-forest font-semibold"
                : "border-transparent text-charcoal/60 hover:text-charcoal"
            }`}
          >
            Item Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "expenses"
                ? "border-forest text-forest font-semibold"
                : "border-transparent text-charcoal/60 hover:text-charcoal"
            }`}
          >
            Recorded Expenses ({items.length})
          </button>
        </div>
      </div>

      {/* ITEM REQUESTS TAB */}
      {activeTab === "requests" && (
        <Card>
          <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone/40">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-forest" />
                Item Request Queue
              </CardTitle>
              <p className="text-xs text-charcoal/60 mt-1">
                Showing <strong>{filteredRequests.length}</strong> of {requests.length} requests
                {statusFilter !== "all" ? ` · Status: ${statusFilter.toUpperCase()}` : ""}
                {categoryFilter !== "all" ? ` · Category: ${categoryFilter}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Search Box */}
              <Input
                placeholder="Search item, requester..."
                value={requestSearchQuery}
                onChange={(e) => setRequestSearchQuery(e.target.value)}
                className="w-full sm:w-44 text-xs py-1 h-9"
              />

              {/* Category Filter */}
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-[calc(50%-4px)] sm:w-36 text-xs py-1 h-9"
              >
                <option value="all">All Categories</option>
                <option value="Components">Components</option>
                <option value="Tools">Tools</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Software & Licenses">Software & Licenses</option>
                <option value="Safety & Gear">Safety & Gear</option>
                <option value="Testing Equipment">Testing Equipment</option>
                <option value="Other">Other</option>
              </Select>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-[calc(50%-4px)] sm:w-36 text-xs py-1 h-9 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="ordered">Ordered / Purchased</option>
                <option value="rejected">Rejected</option>
              </Select>

              {/* Export Filtered Requests Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={exportFilteredRequestsExcel}
                className="w-full sm:w-auto text-xs font-semibold gap-1.5 bg-forest/10 hover:bg-forest hover:text-white border-forest/30 text-forest h-9 transition-all justify-center"
                title="Export currently filtered list to Excel for mentors or budget approval"
              >
                <Download className="h-3.5 w-3.5" />
                Export Filtered List ({filteredRequests.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 transition-all bg-white dark:bg-slate-900 shadow-2xs"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{req.item}</h4>
                          {renderStatusBadge(req.status)}
                          {renderPriorityBadge(req.priority)}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Requested by <strong className="text-slate-800 dark:text-slate-200">{req.requester?.full_name || "Team Member"}</strong> • {formatDate(req.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Estimated Total</span>
                        <span className="text-lg font-extrabold text-slate-900 dark:text-emerald-400">
                          ₹{(req.amount * req.quantity).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">
                          ({req.quantity} x ₹{req.amount.toLocaleString("en-IN")})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="grid md:grid-cols-3 gap-3 py-3 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block font-medium">Category & Project</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">
                        {req.category} • {projectName(req.project_id)}
                      </span>
                    </div>

                    {req.justification && (
                      <div className="md:col-span-2">
                        <span className="text-slate-500 dark:text-slate-400 block font-medium">Justification / Reason</span>
                        <p className="text-slate-700 dark:text-slate-300 italic">{req.justification}</p>
                      </div>
                    )}
                  </div>

                  {req.link && (
                    <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      <ExternalLink className="h-3 w-3" />
                      <a href={req.link} target="_blank" rel="noopener noreferrer" className="truncate max-w-xl">
                        Product Link: {req.link}
                      </a>
                    </div>
                  )}

                  {req.rejection_reason && (
                    <div className="mt-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2 border border-rose-200 dark:border-rose-800">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      <div>
                        <span className="font-semibold">Rejection Note:</span> {req.rejection_reason}
                      </div>
                    </div>
                  )}

                  {/* Team Lead Actions */}
                  {canManageBudget(profile) && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {req.reviewer?.full_name && (
                          <span>Reviewed by: <strong className="text-slate-800 dark:text-slate-200">{req.reviewer.full_name}</strong></span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all font-medium"
                              onClick={() => {
                                setSelectedRequestId(req.id);
                                setRejectModalOpen(true);
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-medium"
                              onClick={() => handleUpdateRequestStatus(req.id, "approved")}
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Approve Request
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-800 hover:text-white hover:border-emerald-800 transition-all font-medium"
                              onClick={() => handleOrderRequest(req)}
                            >
                              <PackageCheck className="h-3.5 w-3.5" /> Approve & Order Item
                            </Button>
                          </>
                        )}

                        {req.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-800 hover:text-white hover:border-emerald-800 transition-all font-medium"
                            onClick={() => handleOrderRequest(req)}
                          >
                            <PackageCheck className="h-3.5 w-3.5" /> Order Item & Record Expense
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredRequests.length === 0 && (
                <div className="py-12 text-center text-charcoal/60">
                  <ShoppingCart className="h-10 w-10 mx-auto text-charcoal/30 mb-2" />
                  <p className="font-medium">No item requests found.</p>
                  <p className="text-xs mt-1">Team members can submit item requests for team lead approval.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RECORDED EXPENSES TAB */}
      {activeTab === "expenses" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <CardTitle>Expenses & Purchases Log</CardTitle>
            <Button variant="outline" size="sm" onClick={exportExpensesExcel} className="text-xs font-medium gap-1.5 w-full sm:w-auto justify-center">
              <Download className="h-3.5 w-3.5" /> Export Excel
            </Button>
          </CardHeader>
          <CardContent className="p-3.5 sm:p-5">
            {/* MOBILE CARD VIEW (Phone screens < md) */}
            <div className="space-y-3 md:hidden">
              {items.map((i) => (
                <div key={i.id} className="rounded-xl border border-stone/60 bg-white p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-charcoal text-base break-words">{i.item}</h4>
                      <p className="text-xs text-charcoal/60 mt-0.5">
                        {i.category} • {projectName(i.project_id)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-forest block">₹{(i.amount * i.quantity).toLocaleString("en-IN")}</span>
                      <span className="text-[11px] text-charcoal/50">{i.quantity} x ₹{i.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="text-xs text-charcoal/70 flex items-center justify-between pt-2 border-t border-stone/30">
                    <div>
                      <span>By: <strong>{i.profile?.full_name || "Team Lead"}</strong></span>
                      <span className="text-charcoal/50 block text-[11px]">{formatDate(i.purchased_at)}</span>
                    </div>

                    {isCaptain(profile) && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditExpense(i)}
                          className="p-1.5 text-charcoal/60 hover:text-forest hover:bg-forest/10 rounded-lg transition-colors border border-stone/40"
                          title="Edit Expense (Captain Only)"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(i.id, i.item)}
                          className="p-1.5 text-charcoal/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-stone/40"
                          title="Delete Expense (Captain Only)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <p className="py-8 text-center text-xs text-charcoal/60">No expenses recorded yet.</p>
              )}
            </div>

            {/* DESKTOP TABLE VIEW (Screens >= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-stone text-charcoal/60">
                    <th className="pb-3 font-medium">Item</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Project</th>
                    <th className="pb-3 font-medium">Qty</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Purchased / Ordered By</th>
                    <th className="pb-3 font-medium">Date</th>
                    {isCaptain(profile) && <th className="pb-3 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-b border-stone/50 hover:bg-stone/20">
                      <td className="py-3 font-medium text-charcoal">{i.item}</td>
                      <td className="py-3">{i.category}</td>
                      <td className="py-3">{projectName(i.project_id)}</td>
                      <td className="py-3">{i.quantity}</td>
                      <td className="py-3 font-semibold text-charcoal">₹{(i.amount * i.quantity).toLocaleString("en-IN")}</td>
                      <td className="py-3">{i.profile?.full_name || "Team Lead"}</td>
                      <td className="py-3">{formatDate(i.purchased_at)}</td>
                      {isCaptain(profile) && (
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditExpense(i)}
                              className="p-1.5 text-charcoal/60 hover:text-forest hover:bg-forest/10 rounded-lg transition-colors"
                              title="Edit Expense (Captain Only)"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(i.id, i.item)}
                              className="p-1.5 text-charcoal/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Expense (Captain Only)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={isCaptain(profile) ? 8 : 7} className="py-8 text-center text-charcoal/60">
                        No expenses recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL: Request New Item (All Members) */}
      <Modal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} title="Submit Item Request for Team Lead">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Item Name *</label>
            <Input
              placeholder="e.g., Arduino Mega 2560 / Carbon Fiber Rods"
              required
              value={requestForm.item}
              onChange={(e) => setRequestForm({ ...requestForm, item: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Est. Unit Price (₹) *</label>
              <Input
                type="number"
                min={0}
                placeholder="Amount per unit"
                required
                value={requestForm.amount}
                onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Quantity *</label>
              <Input
                type="number"
                min={1}
                placeholder="Quantity"
                required
                value={requestForm.quantity}
                onChange={(e) => setRequestForm({ ...requestForm, quantity: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Category</label>
              <Select
                value={requestForm.category}
                onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
              >
                {["Components", "Tools", "Travel", "Registration", "Materials", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Priority</label>
              <Select
                value={requestForm.priority}
                onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value as RequestPriority })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Project (Optional)</label>
            <Select
              value={requestForm.project_id}
              onChange={(e) => setRequestForm({ ...requestForm, project_id: e.target.value })}
            >
              <option value="">General / No specific project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Justification / Why is this needed?</label>
            <textarea
              className="w-full rounded-lg border border-stone/80 p-2.5 text-sm focus:border-forest focus:outline-none"
              rows={2}
              placeholder="Provide context on why the team needs this item..."
              value={requestForm.justification}
              onChange={(e) => setRequestForm({ ...requestForm, justification: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Product / Supplier Link (Optional)</label>
            <Input
              type="url"
              placeholder="https://example.com/item-link"
              value={requestForm.link}
              onChange={(e) => setRequestForm({ ...requestForm, link: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Item Request"}
          </Button>
        </form>
      </Modal>

      {/* MODAL: Direct Expense (Team Lead Only) */}
      {canManageBudget(profile) && (
        <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Record Direct Expense">
          <form onSubmit={handleAddExpense} className="space-y-4">
            <Input
              placeholder="Item name"
              required
              value={expenseForm.item}
              onChange={(e) => setExpenseForm({ ...expenseForm, item: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                min={0}
                placeholder="Amount (₹)"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              />
              <Input
                type="number"
                min={1}
                placeholder="Quantity"
                required
                value={expenseForm.quantity}
                onChange={(e) => setExpenseForm({ ...expenseForm, quantity: Number(e.target.value) })}
              />
            </div>
            <Select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            >
              {["Components", "Tools", "Travel", "Registration", "Materials", "Other"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select
              value={expenseForm.project_id}
              onChange={(e) => setExpenseForm({ ...expenseForm, project_id: e.target.value })}
            >
              <option value="">General / No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving..." : "Save Expense"}
            </Button>
          </form>
        </Modal>
      )}

      {/* MODAL: Edit Expense (Captain Only) */}
      {isCaptain(profile) && editingExpense && (
        <Modal isOpen={editExpenseModalOpen} onClose={() => setEditExpenseModalOpen(false)} title="Edit Recorded Expense">
          <form onSubmit={handleSaveExpenseEdit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Item Name *</label>
              <Input
                placeholder="Item name"
                required
                value={editExpenseForm.item}
                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, item: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal/70 block mb-1">Unit Price (₹) *</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Amount (₹)"
                  required
                  value={editExpenseForm.amount}
                  onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-charcoal/70 block mb-1">Quantity *</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Quantity"
                  required
                  value={editExpenseForm.quantity}
                  onChange={(e) => setEditExpenseForm({ ...editExpenseForm, quantity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Category</label>
              <Select
                value={editExpenseForm.category}
                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, category: e.target.value })}
              >
                {["Components", "Tools", "Travel", "Registration", "Materials", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-charcoal/70 block mb-1">Associated Project</label>
              <Select
                value={editExpenseForm.project_id}
                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, project_id: e.target.value })}
              >
                <option value="">General / No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving Changes..." : "Save Expense Changes"}
            </Button>
          </form>
        </Modal>
      )}

      {/* MODAL: Reject Request Reason */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Item Request">
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-charcoal/70">
            Please provide feedback or reason for rejecting this item request for the team member.
          </p>
          <textarea
            className="w-full rounded-lg border border-stone/80 p-2.5 text-sm focus:border-rose-500 focus:outline-none"
            rows={3}
            required
            placeholder="e.g., We already have spare components in inventory / Over budget for this project..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
              Reject Request
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
