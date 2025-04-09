import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storage: {
          getItem: (key) => {
            if (typeof window === "undefined") {
              return null;
            }
            const value = document.cookie
              .split("; ")
              .find((row) => row.startsWith(`${key}=`))
              ?.split("=")[1];
            return value ? JSON.parse(decodeURIComponent(value)) : null;
          },
          setItem: (key, value) => {
            if (typeof window === "undefined") {
              return;
            }
            document.cookie = `${key}=${encodeURIComponent(
              JSON.stringify(value)
            )}; path=/; max-age=31536000; SameSite=Lax; secure`;
          },
          removeItem: (key) => {
            if (typeof window === "undefined") {
              return;
            }
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure`;
          },
        },
      },
    }
  );
}
