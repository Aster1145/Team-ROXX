import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { assignment_id, profile_id, title, summary, learnings, blockers, drive_url } = await request.json();

    if (!summary || !summary.trim()) {
      return NextResponse.json(
        { error: "Summary of work done is required." },
        { status: 400 }
      );
    }

    let formattedDriveUrl = (drive_url || "").trim();
    if (
      formattedDriveUrl &&
      !formattedDriveUrl.startsWith("http://") &&
      !formattedDriveUrl.startsWith("https://")
    ) {
      formattedDriveUrl = `https://${formattedDriveUrl}`;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycznkbutsbtzyxmjadwd.supabase.co";
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1...";

    // Create server-side admin client (bypasses RLS restrictions completely)
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let targetAssignmentId = assignment_id;

    // If assignment_id is null, check if the user has a pending task assigned to them
    if (!targetAssignmentId && profile_id) {
      const { data: pendingTasks } = await adminSupabase
        .from("trainee_assignments")
        .select("id")
        .eq("profile_id", profile_id)
        .or("summary.is.null,summary.eq.")
        .order("created_at", { ascending: false })
        .limit(1);

      if (pendingTasks && pendingTasks.length > 0) {
        targetAssignmentId = pendingTasks[0].id;
      }
    }

    if (targetAssignmentId) {
      // Updating existing assigned task solution
      let { data, error } = await adminSupabase
        .from("trainee_assignments")
        .update({
          summary: summary.trim(),
          learnings: learnings ? learnings.trim() : null,
          blockers: blockers ? blockers.trim() : null,
          drive_url: formattedDriveUrl || null,
          status: "submitted",
        })
        .eq("id", targetAssignmentId)
        .select();

      // Retry without optional 'status' column if database schema cache hasn't synced
      if (error && (error.message.includes("status") || error.message.includes("schema cache"))) {
        console.warn("Retrying submit update without status column due to schema cache...");
        const retryRes = await adminSupabase
          .from("trainee_assignments")
          .update({
            summary: summary.trim(),
            learnings: learnings ? learnings.trim() : null,
            blockers: blockers ? blockers.trim() : null,
            drive_url: formattedDriveUrl || null,
          })
          .eq("id", targetAssignmentId)
          .select();

        error = retryRes.error;
        data = retryRes.data;
      }

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else {
      // Self-initiated work submission
      let { data, error } = await adminSupabase
        .from("trainee_assignments")
        .insert({
          profile_id,
          title: title || summary.slice(0, 50) || "Trainee Work Submission",
          summary: summary.trim(),
          learnings: learnings ? learnings.trim() : null,
          blockers: blockers ? blockers.trim() : null,
          drive_url: formattedDriveUrl || null,
          status: "submitted",
        })
        .select();

      if (error && (error.message.includes("status") || error.message.includes("schema cache"))) {
        console.warn("Retrying submit insert without status column due to schema cache...");
        const retryRes = await adminSupabase
          .from("trainee_assignments")
          .insert({
            profile_id,
            title: title || summary.slice(0, 50) || "Trainee Work Submission",
            summary: summary.trim(),
            learnings: learnings ? learnings.trim() : null,
            blockers: blockers ? blockers.trim() : null,
            drive_url: formattedDriveUrl || null,
          })
          .select();

        error = retryRes.error;
        data = retryRes.data;
      }

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
  } catch (err: any) {
    console.error("Submit assignment API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
