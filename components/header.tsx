"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Menu, Search, Home, User, ShoppingBag, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
      setShouldRender(false)
    } else {
      setShouldRender(true)
    }
  }, [pathname])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (!shouldRender) {
    return null
  }

  return (
    <header
      className={`w-full py-3 px-4 flex items-center justify-between z-50 fixed top-0 left-0 right-0 transition-all duration-200 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background"
      }`}
    >
      <div className="flex items-center gap-2">
        <Link href="/home" className="flex items-center gap-1.5">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="font-bold">FoodRadar</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/search">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 py-4">
                <Avatar>
                  <AvatarImage src={user?.image || ""} />
                  <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-2 mt-6">
                <Link href="/home">
                  <Button variant={pathname === "/home" ? "default" : "ghost"} className="w-full justify-start">
                    <Home className="mr-2 h-5 w-5" />
                    Home
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant={pathname === "/profile" ? "default" : "ghost"} className="w-full justify-start">
                    <User className="mr-2 h-5 w-5" />
                    Profile
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant={pathname === "/orders" ? "default" : "ghost"} className="w-full justify-start">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Orders
                  </Button>
                </Link>
              </nav>

              <div className="mt-auto pb-6">
                <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
