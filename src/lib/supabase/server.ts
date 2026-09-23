import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycznkbutsbtzyxmjadwd.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljem5rYnV0c2J0enl4bWphZHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjYxNzIsImV4cCI6MjEwMjIwMjE3Mn0.Ke0UDMrgqmYLEoJcCUI2PAj2LdWI-ag4ikbgg02mDck";

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
