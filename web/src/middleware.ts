import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  // TODO: Re-enable strict authentication after UI development phase
  "/dashboard",
  "/crypto-algo",
  "/equities",
  "/signals",
  "/trades",
  "/backtest",
  "/settings",
  // end TODO
  "/legal/terms",
  "/legal/privacy",
  "/legal/risk-disclosure",
  "/api/auth",
  "/invite/accept",
  "/_next",
  "/favicon.ico",
  "/fonts",
];

const ADMIN_PATHS = ["/admin"];

export default auth((req: NextRequest & { auth: { user?: { id: string; isSuperAdmin?: boolean; isActive?: boolean } } | null }) => {
  const { pathname } = req.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Require authentication
  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Block inactive users
  if (req.auth.user.isActive === false) {
    return NextResponse.redirect(new URL("/login?error=AccountDisabled", req.url));
  }

  // Require super admin for admin routes
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminPath && !req.auth.user.isSuperAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};
