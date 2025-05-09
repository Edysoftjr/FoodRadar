import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")
  const isProtectedPage =
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/orders")

  // If on an auth page and already logged in, redirect to home
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/home", req.url))
  }

  // If on a protected page and not logged in, redirect to login
  if (isProtectedPage && !session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

// Specify which paths this middleware should run on
export const config = {
  matcher: ["/login/:path*", "/signup/:path*", "/profile/:path*", "/admin/:path*", "/orders/:path*"],
}
