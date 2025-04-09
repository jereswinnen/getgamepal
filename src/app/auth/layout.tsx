import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is already logged in
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="col-span-full">
      <main className="flex-1 flex flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
}
