import { withAuth } from "next-auth/middleware";
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

    return NextResponse.next();
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
          "/api/auth",
          "/api/fitting",
          "/api/widget",
          "/widget.js",
        ];

        if (publicPaths.some((p) => pathname.startsWith(p))) return true;

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
