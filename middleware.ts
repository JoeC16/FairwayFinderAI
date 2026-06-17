import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes require ADMIN role
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Retailer routes require RETAILER or ADMIN role
    if (
      pathname.startsWith("/retailer") &&
      token?.role !== "RETAILER" &&
      token?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return attachReferralCookie(req, NextResponse.next());
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public paths that don't require auth
        const publicPaths = [
          "/",
          "/pricing",
          "/about",
          "/auth",
          "/fitting",
          "/embed",
          "/swing-analysis",
          "/setup",
          "/api/auth",
          "/api/fitting",
          "/api/widget",
          "/api/stripe",
          "/api/webhooks",
          "/api/swing-analysis",
          "/widget.js",
        ];

        if (publicPaths.some((p) => pathname.startsWith(p))) return true;

        return !!token;
      },
    },
  }
);

// Captures ?ref=CODE into a 30-day cookie so signup attribution survives
// browsing before the user creates an account.
function attachReferralCookie(req: NextRequestWithAuth, res: NextResponse) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (ref && /^[a-zA-Z0-9_-]{1,40}$/.test(ref)) {
    res.cookies.set("ff_ref", ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
