import { createBrowserClient } from "@supabase/ssr";

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycznkbutsbtzyxmjadwd.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljem5rYnV0c2J0enl4bWphZHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjYxNzIsImV4cCI6MjEwMjIwMjE3Mn0.Ke0UDMrgqmYLEoJcCUI2PAj2LdWI-ag4ikbgg02mDck";

  clientInstance = createBrowserClient(url, key);
  return clientInstance;
}
