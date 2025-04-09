"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Attempting signup...");

    // Simple validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Signup error:", error.message);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log("Signup successful, user:", data.user?.id);

      // Automatically sign in the user after successful signup
      if (data.user) {
        console.log("Signing in after signup...");
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          console.error("Auto-login error:", signInError.message);
          setError(
            "Account created, but couldn't log in automatically. Please go to login page."
          );
          setLoading(false);
          return;
        }

        console.log(
          "Auto-login successful, session:",
          signInData.session ? "present" : "missing"
        );

        // Store session in a cookie manually
        if (signInData.session) {
          // JSON.stringify and encode session token to avoid issues
          const token = encodeURIComponent(
            JSON.stringify({
              access_token: signInData.session.access_token,
              refresh_token: signInData.session.refresh_token,
            })
          );

          // Set cookie that mimics Supabase format
          document.cookie = `sb-access-token=${token}; path=/; max-age=3600; SameSite=Lax; secure`;

          console.log("Session cookie set, redirecting to dashboard...");

          // Use a small timeout to ensure the session is properly set
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 500);
        } else {
          setError("No session was created. Please try again.");
          setLoading(false);
        }
      } else {
        // Handle the case where the user needs to confirm their email first
        setError(
          "Please check your email to confirm your account before logging in."
        );
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected signup error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign Up</h1>
          <p className="text-sm text-muted-foreground">
            Create an account to get started
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
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

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
