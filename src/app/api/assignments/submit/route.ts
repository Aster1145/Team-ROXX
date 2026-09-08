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

    if (assignment_id) {
      // Updating existing assigned task solution
      const { data, error } = await adminSupabase
        .from("trainee_assignments")
        .update({
          summary: summary.trim(),
          learnings: learnings ? learnings.trim() : null,
          blockers: blockers ? blockers.trim() : null,
          drive_url: formattedDriveUrl || null,
          status: "submitted",
        })
        .eq("id", assignment_id)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else {
      // Self-initiated work submission
      const { data, error } = await adminSupabase
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

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
  } catch (err: any) {
    console.error("Submit assignment API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
