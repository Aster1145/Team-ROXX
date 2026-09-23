import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fjwrisdcupyzikjttonx.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqd3Jpc2RjdXB5emlranR0b254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTg5MTUsImV4cCI6MjA5ODk5NDkxNX0.NErYH8HSRqKTpPVrmOYHZPgn-VC3nT9x8ZISo_eIvpg";

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method may be called from a Server Component where
            // mutating cookies is not allowed. This can be ignored if you have
            // middleware refreshing sessions.
          }
        },
      },
    }
  );
}
