"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
  },
  {
    name: "Status",
    href: "/status",
    icon: MessageSquare,
  },
  {
    name: "Community",
    href: "/community",
    icon: Users,
  },
]

export function BottomNavbar() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="max-w-screen-2xl mx-auto">
        <nav className="flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
