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

    // 1. If updating a Project Mentor, update public.mentors table directly
    if (role === "mentor") {
      const mentorPayload: Record<string, any> = {
        id: userId,
        email,
        full_name,
        phone_number: phone_number || null,
        department: targetDept,
        project_id: project_id || null,
      };

      const { error: mentorErr } = await adminSupabase
        .from("mentors")
        .upsert(mentorPayload, { onConflict: "id" });

      if (mentorErr && mentorErr.message.includes("phone_number")) {
        delete mentorPayload.phone_number;
        await adminSupabase.from("mentors").upsert(mentorPayload, { onConflict: "id" });
      }

      // Try updating public.profiles with role = "mentor" first (stores mentor role in DB if constraint allows)
      const profilePayload: Record<string, any> = {
        full_name,
        email,
        role: "mentor",
        department: targetDept,
        project_id: project_id || null,
        phone_number: phone_number || null,
      };

      let { error: profileErr } = await adminSupabase
        .from("profiles")
        .update(profilePayload)
        .eq("id", userId);

      // If DB constraint fails because 'mentor' isn't added to profiles_role_check yet, fallback to 'member' for profiles
      if (profileErr && (profileErr.message.includes("profiles_role_check") || profileErr.message.includes("check constraint"))) {
        profilePayload.role = "member";
        profileErr = (await adminSupabase.from("profiles").update(profilePayload).eq("id", userId)).error;
      }

      if (profileErr && profileErr.message.includes("phone_number")) {
        delete profilePayload.phone_number;
        profileErr = (await adminSupabase.from("profiles").update(profilePayload).eq("id", userId)).error;
      }

      return NextResponse.json({ success: true });
    }

    // 2. Standard update for student members (Captain, Vice Captain, Member, Trainee)
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

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    // If demoting from mentor, remove from mentors table
    await adminSupabase.from("mentors").delete().eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update member route error:", err);
    return NextResponse.json({ error: err.message || "Failed to update member." }, { status: 500 });
  }
}
