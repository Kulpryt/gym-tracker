import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Autoriser les assets publics, la page de login, et l'api d'auth
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  
  if (sessionToken) {
    const payload = await verifySessionToken(sessionToken);
    if (payload) {
      return NextResponse.next();
    }
  }

  // Rediriger vers login si non authentifié
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
