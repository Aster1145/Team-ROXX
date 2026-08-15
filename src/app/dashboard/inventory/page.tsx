"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { InventoryLog } from "@/types";
import { Package, Download, CheckCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import * as XLSX from "xlsx";

export default function InventoryPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ item_name: "", purpose: "", condition_notes: "" });

  const fetchLogs = async () => {
    try {
      let { data, error } = await supabase
        .from("inventory_logs")
        .select("*, profile:profiles!profile_id(full_name)")
        .order("taken_at", { ascending: false });

      if (error) {
        const fallback = await supabase
          .from("inventory_logs")
          .select("*, profile:profiles(full_name)")
          .order("taken_at", { ascending: false });
        data = fallback.data;
      }

      setLogs((data as InventoryLog[]) || []);
    } catch (err) {
      console.error("Error fetching inventory logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [supabase]);

  const handleTake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      alert("You must be logged in to log an item.");
      return;
    }
    setSubmitting(true);

    try {
      // 1. Primary insert attempting profile_id & notes
      let { error } = await supabase.from("inventory_logs").insert({
        item_name: form.item_name,
        purpose: form.purpose || null,
        profile_id: profile.id,
        notes: form.condition_notes || null,
      });

      // 2. Fallback attempt if database schema expects taken_by / condition_notes
      if (error) {
        const fallback = await supabase.from("inventory_logs").insert({
          item_name: form.item_name,
          purpose: form.purpose || null,
          taken_by: profile.id,
          condition_notes: form.condition_notes || null,
        });
        error = fallback.error;
      }

      if (error) {
        alert("Error logging inventory item: " + error.message);
        return;
      }

      setModalOpen(false);
      setForm({ item_name: "", purpose: "", condition_notes: "" });
      await fetchLogs();
    } catch (err: any) {
      alert("Failed to log inventory item: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const markReturned = async (id: string) => {
    try {
      const { error } = await supabase
        .from("inventory_logs")
        .update({ returned_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      await fetchLogs();
    } catch (err: any) {
      alert("Failed to mark item returned: " + err.message);
    }
  };

  const exportExcel = () => {
    const rows = logs.map((l) => ({
      Item: l.item_name,
      Purpose: l.purpose || "N/A",
      "Taken By": l.profile?.full_name || "Team Member",
      "Taken At": formatDateTime(l.taken_at),
      "Returned At": formatDateTime(l.returned_at),
      Notes: l.notes || l.condition_notes || "None",
      Status: l.returned_at ? "Returned" : "Out",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Logs");
    XLSX.writeFile(wb, `inventory-logs-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <>
      <Header title="Inventory Log" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-charcoal/70">
          Log tools and components taken out of the lab. State the purpose, and dates are captured automatically.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExcel}>
            <Download className="h-4 w-4" /> Export Excel
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Package className="h-4 w-4" /> Take Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone text-charcoal/60">
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium">Purpose / Intended Use</th>
                  <th className="pb-3 font-medium">Taken By</th>
                  <th className="pb-3 font-medium">Taken At</th>
                  <th className="pb-3 font-medium">Returned At</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-stone/50">
                    <td className="py-3 font-medium text-charcoal">{l.item_name}</td>
                    <td className="py-3 text-charcoal/80">{l.purpose || "—"}</td>
                    <td className="py-3">{l.profile?.full_name || "Team Member"}</td>
                    <td className="py-3">{formatDateTime(l.taken_at)}</td>
                    <td className="py-3">{formatDateTime(l.returned_at)}</td>
                    <td className="py-3">
                      <Badge variant={l.returned_at ? "success" : "warning"}>
                        {l.returned_at ? "Returned" : "Out"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {!l.returned_at && (
                        <Button size="sm" variant="outline" onClick={() => markReturned(l.id)}>
                          <CheckCircle className="h-4 w-4" /> Return
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-charcoal/60">
                      No inventory logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Take Item Out">
        <form onSubmit={handleTake} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Item Name *</label>
            <Input
              placeholder="e.g. Drilling Machine / Oscilloscope"
              required
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Purpose / Intended Use *</label>
            <Input
              placeholder="e.g. Aero Mechanics wing assembly testing"
              required
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal/70 block mb-1">Condition / Notes (Optional)</label>
            <Textarea
              placeholder="Condition, extra accessories taken, or notes..."
              value={form.condition_notes}
              onChange={(e) => setForm({ ...form, condition_notes: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" isLoading={submitting}>
            Log Item
          </Button>
        </form>
      </Modal>
    </>
  );
}
