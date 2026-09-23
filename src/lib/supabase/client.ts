import { createBrowserClient } from "@supabase/ssr";

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fjwrisdcupyzikjttonx.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqd3Jpc2RjdXB5emlranR0b254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTg5MTUsImV4cCI6MjA5ODk5NDkxNX0.NErYH8HSRqKTpPVrmOYHZPgn-VC3nT9x8ZISo_eIvpg";

  clientInstance = createBrowserClient(url, key);
  return clientInstance;
}
