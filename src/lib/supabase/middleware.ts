import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fjwrisdcupyzikjttonx.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqd3Jpc2RjdXB5emlranR0b254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTg5MTUsImV4cCI6MjA5ODk5NDkxNX0.NErYH8HSRqKTpPVrmOYHZPgn-VC3nT9x8ZISo_eIvpg";

  try {
    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: "", ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data } = await supabase.auth.getUser();
    return { response, user: data?.user ?? null };
  } catch {
    return { response, user: null };
  }
}
