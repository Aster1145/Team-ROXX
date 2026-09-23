"use client";

import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/Card";
import { Award } from "lucide-react";

export default function MentorsPage() {
  return (
    <>
      <Header title="Project Mentors" />

      <Card className="border-dashed border-2 border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-12 text-center">
        <Award className="h-12 w-12 mx-auto text-purple-500/50 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Mentors Section Removed for Redesign
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          The Mentors section has been removed from navigation and is ready to be redesigned according to your upcoming workflow requirements.
        </p>
      </Card>
    </>
  );
}
