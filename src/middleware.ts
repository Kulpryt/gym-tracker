import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const appPasswords = process.env.APP_PASSWORDS || process.env.APP_PASSWORD;
  if (!appPasswords) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow public assets, login page, and auth api
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("gym_auth");
  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
