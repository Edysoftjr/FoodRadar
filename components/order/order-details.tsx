"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleMap } from "@/components/maps/simple-map"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Phone, MapPin, XCircle } from "lucide-react"

interface OrderDetailsProps {
  orderId: string
  isVendor?: boolean
}

export function OrderDetails({ orderId, isVendor = false }: OrderDetailsProps) {
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)

        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*, users(name, email)")
          .eq("id", orderId)
          .single()

        if (orderError) throw orderError

        setOrder(orderData)

        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", orderData.restaurant_id)
          .single()

        if (restaurantError) throw restaurantError

        setRestaurant(restaurantData)
      } catch (error) {
        console.error("Error fetching order details:", error)
        toast({
          title: "Failed to load order details",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, toast])

  const updateOrderStatus = async (status: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (error) throw error

      setOrder({ ...order, status })

      toast({
        title: "Order status updated",
        description: `Order status changed to ${status}`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Failed to update order status",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order || !restaurant) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="mt-2">Order not found</p>
        </div>
      </div>
    )
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Order #{order.id.slice(0, 8)}</h2>
          <p className="text-sm text-muted-foreground">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-xs font-medium capitalize`}>
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Items and delivery information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Items</h3>
              <div className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {item.name} × {item.quantity}
                      </p>
                      {item.notes && <p className="text-xs text-muted-foreground">Note: {item.notes}</p>}
                    </div>
                    <p>₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>₦{order.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Delivery Information</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p>{order.delivery_location.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{order.contact_phone}</p>
                </div>
                {isVendor && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary flex-shrink-0" />
                    <p>
                      {order.users.name} ({order.users.email})
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          {isVendor && order.status !== "delivered" && order.status !== "cancelled" && (
            <CardFooter className="flex-col space-y-2">
              {order.status === "pending" && (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => updateOrderStatus("cancelled")}>
                    Reject
                  </Button>
                  <Button className="flex-1" onClick={() => updateOrderStatus("accepted")}>
                    Accept
                  </Button>
                </div>
              )}
              {order.status === "accepted" && (
                <Button className="w-full" onClick={() => updateOrderStatus("preparing")}>
                  Start Preparing
                </Button>
              )}
              {order.status === "preparing" && (
                <Button className="w-full" onClick={() => updateOrderStatus("ready")}>
                  Mark as Ready
                </Button>
              )}
              {order.status === "ready" && (
                <Button className="w-full" onClick={() => updateOrderStatus("delivered")}>
                  Mark as Delivered
                </Button>
              )}
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Location</CardTitle>
            <CardDescription>{isVendor ? "Customer location" : "Restaurant location"}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-lg">
            <SimpleMap
              latitude={order.delivery_location.latitude}
              longitude={order.delivery_location.longitude}
              height={300}
              width={600}
              className="w-full rounded-b-lg"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
