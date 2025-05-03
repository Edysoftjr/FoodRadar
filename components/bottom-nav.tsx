"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, ShoppingBag, User } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
      setShouldRender(false)
    } else {
      setShouldRender(true)
    }
  }, [pathname])

  // Handle scroll effect to hide/show bottom nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  if (!shouldRender) {
    return null
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex justify-around items-center py-2 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link href="/home" className="flex flex-col items-center p-2">
        <Home className={`h-5 w-5 ${pathname === "/home" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs mt-1 ${pathname === "/home" ? "text-primary" : "text-muted-foreground"}`}>Home</span>
      </Link>

      <Link href="/search" className="flex flex-col items-center p-2">
        <Search className={`h-5 w-5 ${pathname === "/search" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs mt-1 ${pathname === "/search" ? "text-primary" : "text-muted-foreground"}`}>
          Search
        </span>
      </Link>

      <Link href="/orders" className="flex flex-col items-center p-2">
        <ShoppingBag
          className={`h-5 w-5 ${pathname.startsWith("/orders") ? "text-primary" : "text-muted-foreground"}`}
        />
        <span className={`text-xs mt-1 ${pathname.startsWith("/orders") ? "text-primary" : "text-muted-foreground"}`}>
          Orders
        </span>
      </Link>

      <Link href="/profile" className="flex flex-col items-center p-2">
        <User className={`h-5 w-5 ${pathname === "/profile" ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-xs mt-1 ${pathname === "/profile" ? "text-primary" : "text-muted-foreground"}`}>
          Profile
        </span>
      </Link>
    </nav>
  )
}
