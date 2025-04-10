"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "@phosphor-icons/react";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const supabase = createClient();

      // Get the refresh token from the URL
      const refreshToken = searchParams.get("refresh_token");
      if (!refreshToken) {
        // No refresh token means we're showing the "check email" message
        return;
      }

      // Exchange the refresh token for a session
      const { error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("Error refreshing session:", error.message);
        router.push("/auth");
        return;
      }

      // If we have a user, redirect to dashboard
      router.push("/dashboard");
    };

    if (!loading) {
      if (user) {
        // If we already have a user, go to dashboard
        router.push("/dashboard");
      } else {
        // Otherwise, try to confirm the email
        handleEmailConfirmation();
      }
    }
  }, [loading, user, router, searchParams]);

  // Get the email from the URL if it exists
  const email = searchParams.get("email");
  const refreshToken = searchParams.get("refresh_token");

  // If there's no refresh token, show the "check email" message
  if (!refreshToken) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle size={32} className="text-green-600" weight="bold" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Check your email
            </h1>
            <p className="text-muted-foreground">
              {email ? (
                <>
                  We've sent a confirmation link to <strong>{email}</strong>.
                  <br />
                  Please check your email to activate your account.
                </>
              ) : (
                "Please check your email for the confirmation link to activate your account."
              )}
            </p>
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={() => router.push("/auth")}>
              Back to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If there is a refresh token, show the loading state
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Confirming your email...</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we verify your account.
        </p>
      </div>
    </div>
  );
}
