import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, role, department, project_id, phone_number } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password, and full name are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycznkbutsbtzyxmjadwd.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1...";

    // Create server-side isolated client (will not touch browser cookies/session)
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Create auth user (Pass safe default metadata to avoid database trigger failure on profiles_role_check)
    const { data: authData, error: authError } = await adminSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: "member",
          department: "General",
        },
      },
    });

    let userId: string | undefined = authData?.user?.id;

    if (authError) {
      if (
        authError.message.toLowerCase().includes("already registered") ||
        authError.message.toLowerCase().includes("already exists") ||
        authError.message.toLowerCase().includes("user_already_exists")
      ) {
        // User already exists in Supabase Auth — fetch existing profile by email to update role & project
        const { data: existingProfile } = await adminSupabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingProfile?.id) {
          userId = existingProfile.id;
        } else {
          return NextResponse.json({ error: authError.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Failed to obtain user ID from Supabase." }, { status: 500 });
    }

    // 2. Insert/upsert into public.profiles directly
    const targetDept = role === "trainee" ? "Trainee" : (department || "General");

    const profilePayload: Record<string, any> = {
      id: userId,
      email,
      full_name,
      role: role || "member",
      department: targetDept,
      project_id: project_id || null,
      phone_number: phone_number || null,
    };

    let { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select("*")
      .single();

    if (profileError && profileError.message.includes("phone_number")) {
      delete profilePayload.phone_number;
      const fallback = await adminSupabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" })
        .select("*")
        .single();
      profile = fallback.data;
      profileError = fallback.error;
    }

    if (profileError && (profileError.message.includes("check constraint") || profileError.message.includes("profiles_role_check"))) {
      // Fallback role: "member" if database check constraint excludes 'mentor'
      profilePayload.role = "member";
      const retry = await adminSupabase.from("profiles").upsert(profilePayload, { onConflict: "id" }).select("*").single();
      profile = retry.data;
      profileError = retry.error;
    }

    if (role === "mentor") {
      try {
        await adminSupabase.from("mentors").upsert({
          id: userId,
          user_id: userId,
          email,
          full_name,
          department: targetDept,
          project_id: project_id || null,
          phone_number: phone_number || null,
        }, { onConflict: "email" });
      } catch (e) {
        console.warn("Mentors table sync notice:", e);
      }
    }

    return NextResponse.json({
      success: true,
      member: profile || {
        id: userId,
        email,
        full_name,
        role: role || "member",
        department: department || "General",
        phone_number: phone_number || null,
      },
    });
  } catch (err: any) {
    console.error("Create member route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
