/**
 * Auth middleware — prevents 508 INFINITE_LOOP by:
 * 1. Only redirecting when necessary (never redirect /auth/* to /auth/*)
 * 2. Using getToken (Edge-compatible) instead of getSession
 * 3. Excluding API, static files, and NextAuth routes from matcher
 *
 * Loop prevention: when unauthenticated on protected route → /auth/signin (public).
 * When authenticated on /auth/signin → /dashboard. No circular redirects.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/forgot-username",
  "/auth/reset-password",
  "/auth/verify",
  "/auth/callback",
  "/auth/signin/email",
  "/pricing",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/blog",
  "/audit",
];

const AUTH_PAGES = ["/auth/signin", "/auth/signup"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/audits") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/features")
  );
}

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Never run on API or NextAuth internal routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Authenticated user on signin/signup → redirect to dashboard (or callbackUrl/next)
  if (isAuthenticated && isAuthPage(pathname)) {
    const callbackUrl =
      req.nextUrl.searchParams.get("callbackUrl") ??
      req.nextUrl.searchParams.get("next") ??
      "/dashboard";
    // Prevent redirect to another auth page (loop prevention)
    const target = callbackUrl.startsWith("/auth")
      ? "/dashboard"
      : callbackUrl;
    return NextResponse.redirect(new URL(target, req.url));
  }

  // Unauthenticated user on protected path → redirect to signin
  if (!isAuthenticated && isProtectedPath(pathname)) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set(
      "callbackUrl",
      pathname + req.nextUrl.search.toString()
    );
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (handled above)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt, etc.
     */
    "/((?!api|_next/static|_next/image|favicon|sitemap|robots|og|rankypulse-logo).*)",
  ],
};
