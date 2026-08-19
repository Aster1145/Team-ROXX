"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-900/10 dark:bg-white/10 ring-1 ring-slate-900/10 dark:ring-white/20 shadow-md">
              <img
                src="/images/roxx-logo.png"
                alt="Team ROXX Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-slate-900 dark:text-white">
              Team <span className="text-orange-500">ROXX</span>
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Team Sign In
            </CardTitle>
            <p className="text-center text-sm text-charcoal/60">
              Sign in to access your ROXX workspace.
            </p>
          </CardHeader>
          <CardContent>
            {(!process.env.NEXT_PUBLIC_SUPABASE_URL ||
              process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") ||
              process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) && (
              <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4.5 text-xs text-amber-900 shadow-xs">
                <div className="flex items-center gap-2 font-semibold text-amber-950">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  Supabase Credentials Required
                </div>
                <p className="mt-1 leading-relaxed text-amber-800">
                  To log in, please add your <strong>Supabase URL</strong> and <strong>Anon Key</strong> into <code>.env.local</code> and restart the server.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal">Email</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-forest transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-forest" />
                    ) : (
                      <Eye className="h-4 w-4 text-charcoal/60" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-charcoal/60">
              Account registration is managed by your Team ROXX Captain.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
