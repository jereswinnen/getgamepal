"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Setup auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth/login");
      } else if (session) {
        setUser(session.user);
      }
    });

    // Get initial session
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        setIsError(true);
        return;
      }
      if (data?.user) {
        setUser(data.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // Clear cookies manually to ensure complete sign-out
    document.cookie =
      "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure";
    document.cookie =
      "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure";
    document.cookie =
      "supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure";

    router.push("/");
    router.refresh();
  };

  // If there's an error, show error message
  if (isError) {
    return (
      <div className="container mx-auto py-12">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <h2 className="text-xl font-semibold mb-2">Session Error</h2>
          <p>Unable to load your profile. Please try signing in again.</p>
          <Button onClick={() => router.push("/auth/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // If no user data yet, render nothing (avoid flash)
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your GamePal dashboard!
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">User Information</h2>
              <p className="text-muted-foreground">Email: {user?.email}</p>
            </div>

            <div className="pt-4">
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold">My Games</h3>
            <p className="text-muted-foreground">
              Track your gaming progress and achievements.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Gaming Journal</h3>
            <p className="text-muted-foreground">
              Record your thoughts and experiences.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Account Settings</h3>
            <p className="text-muted-foreground">
              Manage your account preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
