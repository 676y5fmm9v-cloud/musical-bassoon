import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifierToken, COOKIE_NAME } from "@/lib/auth/session";
import type { Role } from "@/lib/types";

const PUBLIC_PATHS = new Set(["/login"]);

function roleHome(role: Role): string {
  switch (role) {
    case "eleve":
      return "/eleve";
    case "prof":
      return "/prof";
    case "parent":
      return "/parent";
    case "ecole":
      return "/";
  }
}

function areaForPath(pathname: string): Role {
  if (pathname === "/eleve" || pathname.startsWith("/eleve/")) return "eleve";
  if (pathname === "/prof" || pathname.startsWith("/prof/")) return "prof";
  if (pathname === "/parent" || pathname.startsWith("/parent/")) return "parent";
  return "ecole";
}

// Optimistic, cookie-only check: redirects unauthenticated or wrong-role
// requests before they render. Every Server Action and data-fetching
// function performs its own authoritative check (see src/lib/auth/dal.ts) —
// this proxy is a fast first line of defense, not the only one.
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifierToken(token);

  if (PUBLIC_PATHS.has(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL(roleHome(session.role), request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (areaForPath(pathname) !== session.role) {
    return NextResponse.redirect(new URL(roleHome(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
