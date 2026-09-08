import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { assigned_by, title, description, target_profile_id, due_date } = await request.json();

    if (!title || !target_profile_id) {
      return NextResponse.json(
        { error: "Title and target member are required." },
        { status: 400 }
      );
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

    // Determine target profile IDs
    let targetIds: string[] = [];
    if (target_profile_id === "all_trainees" || target_profile_id === "all_members") {
      const { data: profiles, error: pErr } = await adminSupabase.from("profiles").select("id, role, department");
      if (pErr) throw pErr;

      if (target_profile_id === "all_trainees") {
        targetIds = (profiles || [])
          .filter((p) => p.role === "trainee" || p.department === "Trainee")
          .map((p) => p.id);
      } else {
        targetIds = (profiles || []).map((p) => p.id);
      }
    } else {
      targetIds = [target_profile_id];
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ error: "No target members found for assignment." }, { status: 400 });
    }

    // Try full insert with assigned_by and description
    const records = targetIds.map((profileId) => ({
      profile_id: profileId,
      assigned_by: assigned_by || null,
      title,
      description: description || null,
      due_date: due_date || null,
      summary: "", // Pending submission
      status: "pending",
    }));

    let { data, error } = await adminSupabase.from("trainee_assignments").insert(records).select();

    if (error) {
      // Fallback if DB column structure differs
      console.warn("API insert fallback triggered:", error.message);
      const fallbackRecords = targetIds.map((profileId) => ({
        profile_id: profileId,
        title,
        summary: description ? `[Instructions]: ${description}` : "",
      }));

      const retryRes = await adminSupabase.from("trainee_assignments").insert(fallbackRecords).select();
      if (retryRes.error) throw retryRes.error;
      data = retryRes.data;
    }

    return NextResponse.json({ success: true, count: targetIds.length, data });
  } catch (err: any) {
    console.error("Create assignment API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
