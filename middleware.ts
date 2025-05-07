import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Define protected routes based on user role
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes protection
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN" && token?.role !== "VENDOR") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Vendor routes protection
    if (pathname.startsWith("/vendor") && token?.role !== "VENDOR" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

// Specify which paths this middleware should run on
export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/vendor/:path*", "/orders/:path*"],
}
