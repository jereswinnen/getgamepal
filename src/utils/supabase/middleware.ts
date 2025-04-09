import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Set cookie in the request
          request.cookies.set({
            name,
            value,
            ...options,
          });

          // Set cookie in the response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name) {
          // Delete cookie from the request
          request.cookies.delete(name);

          // Delete cookie from the response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          response.cookies.delete(name);
        },
      },
    }
  );

  return { response, supabase };
};
