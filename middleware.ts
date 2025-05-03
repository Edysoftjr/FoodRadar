import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

// This function can be marked `async` if using `await` inside
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth?.token

    console.log("Middleware running for path:", pathname)
    console.log("Token:", token ? "exists" : "does not exist")

    if (token) {
      console.log("User role:", token.role)
    }

    // Admin routes protection
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN" && token?.role !== "VENDOR") {
      console.log("Redirecting from admin route - insufficient permissions")
      return NextResponse.redirect(new URL("/home", req.url))
    }

    // Vendor routes protection
    if (pathname.startsWith("/vendor") && token?.role !== "VENDOR" && token?.role !== "ADMIN") {
      console.log("Redirecting from vendor route - insufficient permissions")
      return NextResponse.redirect(new URL("/home", req.url))
    }

    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true if the token exists
      authorized: ({ token }) => {
        console.log(token)
        console.log("Authorization check:", token ? "authorized" : "unauthorized")
        return !!token
      },
    },
    // Pages configuration for redirects
    pages: {
      signIn: "/login",
    },
  },
)

// Specify which paths this middleware should run on
export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/vendor/:path*", "/orders/:path*"],
}

