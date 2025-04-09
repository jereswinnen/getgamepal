import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // For dashboard routes, check for authentication
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Check for any Supabase session cookie
    const allCookies = request.cookies.getAll();

    // Check for standard Supabase cookies or any cookie starting with sb-
    const hasAuth =
      request.cookies.has("sb-access-token") ||
      request.cookies.has("sb-refresh-token") ||
      request.cookies.has("supabase-auth-token") ||
      allCookies.some((c) => c.name.startsWith("sb-"));

    // If no auth cookie is found, redirect to login
    if (!hasAuth) {
      const redirectUrl = new URL("/auth/login", request.url);
      // Add the original URL as a query parameter for post-login redirect
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
