import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { assignmentId, title, deleteAllWithTitle } = await request.json();

    if (!assignmentId && !title) {
      return NextResponse.json({ error: "Assignment ID or Title is required." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycznkbutsbtzyxmjadwd.supabase.co";
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1...";

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let error = null;

    if (deleteAllWithTitle && title) {
      const res = await adminSupabase
        .from("trainee_assignments")
        .delete()
        .eq("title", title);
      error = res.error;
    } else if (assignmentId) {
      const res = await adminSupabase
        .from("trainee_assignments")
        .delete()
        .eq("id", assignmentId);
      error = res.error;
    } else if (title) {
      const res = await adminSupabase
        .from("trainee_assignments")
        .delete()
        .eq("title", title);
      error = res.error;
    }

    if (error) {
      console.error("Assignment admin deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete assignment API route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
