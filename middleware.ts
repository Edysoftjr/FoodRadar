import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // If the user is not logged in and trying to access a protected route
  if (
    !token &&
    (pathname.startsWith("/profile") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/vendor") ||
      pathname.startsWith("/orders"))
  ) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", encodeURI(req.url))
    return NextResponse.redirect(url)
  }

  // Admin routes protection
  if (pathname.startsWith("/admin") && token?.role !== "ADMIN" && token?.role !== "VENDOR") {
    return NextResponse.redirect(new URL("/home", req.url))
  }

  // Vendor routes protection
  if (pathname.startsWith("/vendor") && token?.role !== "VENDOR" && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/home", req.url))
  }

  return NextResponse.next()
}

// Specify which paths this middleware should run on
export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/vendor/:path*", "/orders/:path*"],
}
