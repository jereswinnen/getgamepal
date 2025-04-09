"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Attempting login...");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log(
        "Login successful, session:",
        data.session ? "present" : "missing"
      );

      // Store session in a cookie manually
      if (data.session) {
        // JSON.stringify and encode session token to avoid issues
        const token = encodeURIComponent(
          JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          })
        );

        // Set cookie that mimics Supabase format
        document.cookie = `sb-access-token=${token}; path=/; max-age=3600; SameSite=Lax; secure`;

        console.log("Session cookie set, redirecting to:", redirectUrl);

        // Use a small timeout to ensure the session is properly set
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 500);
      } else {
        setError("No session was created. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to login to your account
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="font-medium underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
