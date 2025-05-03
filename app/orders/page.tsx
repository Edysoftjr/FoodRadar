"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, ShoppingBag, MapPin } from "lucide-react"

export default function OrdersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view your orders",
        variant: "destructive",
      })
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("orders")
          .select("*, restaurants(name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setOrders(data || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Failed to load orders",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, toast])

  const filteredOrders = () => {
    if (activeTab === "all") return orders
    return orders.filter((order) => {
      if (activeTab === "active") {
        return ["pending", "accepted", "preparing", "ready"].includes(order.status)
      }
      if (activeTab === "completed") {
        return order.status === "delivered"
      }
      if (activeTab === "cancelled") {
        return order.status === "cancelled"
      }
      return true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "accepted":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "preparing":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
      case "ready":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your orders.</p>
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
          <Link href="/home" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium mobile-hidden">Back</span>
          </Link>
          <h1 className="ml-4 text-lg font-semibold">My Orders</h1>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 py-6 sm:px-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                All
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1 sm:flex-initial">
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 sm:flex-initial">
                Completed
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1 sm:flex-initial">
                Cancelled
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading orders...</p>
                  </div>
                </div>
              ) : filteredOrders().length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders().map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{order.restaurants.name}</h3>
                                <Badge
                                  className={`${getStatusColor(order.status)} px-2 py-0.5 text-xs font-medium capitalize`}
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="line-clamp-1">{order.delivery_location.address}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold">₦{order.total.toLocaleString()}</p>
                              <Button variant="ghost" size="sm" className="rounded-full">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No orders found</h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === "all"
                      ? "You haven't placed any orders yet."
                      : `You don't have any ${activeTab} orders.`}
                  </p>
                  <Link href="/home">
                    <Button>Browse Restaurants</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
