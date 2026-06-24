import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO: Re-enable full auth middleware (NextAuth guard, admin protection, inactive-user block)
//       after UI development phase is complete. Original logic preserved below as reference.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};

/*
 * ORIGINAL MIDDLEWARE (restore when auth is live):
 *
 * import { auth } from "@/lib/auth";
 *
 * const PUBLIC_PATHS = ["/", "/login", "/legal/terms", "/legal/privacy", "/legal/risk-disclosure",
 *   "/api/auth", "/invite/accept", "/_next", "/favicon.ico", "/fonts"];
 * const ADMIN_PATHS = ["/admin"];
 *
 * export default auth((req) => {
 *   const { pathname } = req.nextUrl;
 *   const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
 *   if (isPublic) return NextResponse.next();
 *   if (!req.auth?.user) {
 *     const loginUrl = new URL("/login", req.url);
 *     loginUrl.searchParams.set("callbackUrl", pathname);
 *     return NextResponse.redirect(loginUrl);
 *   }
 *   if (req.auth.user.isActive === false)
 *     return NextResponse.redirect(new URL("/login?error=AccountDisabled", req.url));
 *   const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
 *   if (isAdminPath && !req.auth.user.isSuperAdmin)
 *     return NextResponse.redirect(new URL("/dashboard", req.url));
 *   return NextResponse.next();
 * });
 */
