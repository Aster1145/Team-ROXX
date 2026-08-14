"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { useEffect, useState, useCallback } from "react";

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (sessionUser: { id: string; email?: string; user_metadata?: Record<string, any> }) => {
      try {
        // 1. Try to fetch profile by user id
        let { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();

        // 2. Try to fetch profile by email if not found by id
        if (!data && sessionUser.email) {
          const res = await supabase
            .from("profiles")
            .select("*")
            .eq("email", sessionUser.email)
            .maybeSingle();
          data = res.data;
        }

        // 3. If profile row is missing in database, create profile row
        if (!data && sessionUser.id && sessionUser.email) {
          const newProfile: Profile = {
            id: sessionUser.id,
            email: sessionUser.email,
            full_name: sessionUser.user_metadata?.full_name || sessionUser.email.split("@")[0],
            role: "member",
            department: "General",
            project_id: null,
            created_at: new Date().toISOString(),
          };

          const { data: inserted } = await supabase
            .from("profiles")
            .upsert(newProfile, { onConflict: "id" })
            .select("*")
            .maybeSingle();

          data = inserted || newProfile;
        }

        // 4. If 0 Captains exist in the entire database, promote initial user to Captain
        if (data) {
          const { count: captainCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "captain");

          if (!captainCount || captainCount === 0) {
            await supabase
              .from("profiles")
              .update({ role: "captain" })
              .eq("id", (data as Profile).id);
            (data as Profile).role = "captain";
          }
        }

        if (data) {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    },
    [supabase]
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user);
      }
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const onFocus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user);
      }
    };

    window.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [supabase, fetchProfile]);

  const promoteToCaptain = async () => {
    if (!profile) return;
    await supabase.from("profiles").update({ role: "captain" }).eq("id", profile.id);
    setProfile({ ...profile, role: "captain" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return { user, profile, loading, signOut, promoteToCaptain, supabase };
}
