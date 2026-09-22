import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, email, full_name, role, department, project_id, phone_number } = await request.json();

    if (!userId || !email || !full_name) {
      return NextResponse.json(
        { error: "Missing required user fields." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycznkbutsbtzyxmjadwd.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1...";

    // Create server-side isolated client (bypasses browser RLS restrictions)
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const targetDept = role === "trainee" ? "Trainee" : (department || "General");

    // 1. Update public.profiles
    const updatePayload: Record<string, any> = {
      full_name,
      email,
      role: role || "member",
      department: targetDept,
      project_id: project_id || null,
      phone_number: phone_number || null,
    };

    let { error: updateErr } = await adminSupabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId);

    if (updateErr && updateErr.message.includes("phone_number")) {
      delete updatePayload.phone_number;
      const fallback = await adminSupabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId);
      updateErr = fallback.error;
    }

    if (updateErr && (updateErr.message.includes("check constraint") || updateErr.message.includes("profiles_role_check"))) {
      // Fallback role to 'member' if DB check constraint is not updated yet
      updatePayload.role = "member";
      await adminSupabase.from("profiles").update(updatePayload).eq("id", userId);
    }

    // 2. Sync to public.mentors if role is mentor
    if (role === "mentor") {
      await adminSupabase.from("mentors").upsert(
        {
          id: userId,
          email,
          full_name,
          phone_number: phone_number || null,
          department: targetDept,
          project_id: project_id || null,
        },
        { onConflict: "id" }
      );
    } else {
      await adminSupabase.from("mentors").delete().eq("id", userId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update member route error:", err);
    return NextResponse.json({ error: err.message || "Failed to update member." }, { status: 500 });
  }
}
