"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { OrderDetails } from "@/components/order/order-details"
import { ArrowLeft } from "lucide-react"

export default function OrderPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { user } = useAuth()
  const { toast } = useToast()

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view order details.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <Link href="/orders" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium mobile-hidden">Back to Orders</span>
          </Link>
          <h1 className="ml-4 text-lg font-semibold">Order Details</h1>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 py-6 sm:px-6">
          <OrderDetails orderId={id} isVendor={user.role === "vendor"} />
        </div>
      </main>
    </div>
  )
}
