"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useLocation } from "@/components/location-provider"
import { useToast } from "@/components/ui/use-toast"

type Meal = {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  categories: string[]
  isAvailable: boolean
}

type Restaurant = {
  id: string
  name: string
  address: string
  phone?: string
  images: string[]
}

type OrderItem = {
  meal: Meal
  quantity: number
  specialInstructions?: string
}

interface OrderFormProps {
  meal: Meal
  restaurant: Restaurant
  onClose: () => void
  onSuccess: () => void
}

export function OrderForm({ meal, restaurant, onClose, onSuccess }: OrderFormProps) {
  const { user } = useAuth()
  const { location } = useLocation()
  const { toast } = useToast()

  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ meal, quantity: 1 }])
  const [deliveryAddress, setDeliveryAddress] = useState(location.address || "")
  const [contactPhone, setContactPhone] = useState(user?.phone || "")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [loading, setLoading] = useState(false)

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setOrderItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: newQuantity } : item)))
  }

  const updateInstructions = (index: number, instructions: string) => {
    setOrderItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, specialInstructions: instructions } : item)),
    )
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + item.meal.price * item.quantity, 0)
  }

  const deliveryFee = 500
  const serviceFee = calculateSubtotal() * 0.05
  const total = calculateSubtotal() + deliveryFee + serviceFee

  const handleSubmitOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Missing delivery address",
        description: "Please provide a delivery address",
        variant: "destructive",
      })
      return
    }

    if (!contactPhone.trim()) {
      toast({
        title: "Missing contact phone",
        description: "Please provide a contact phone number",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const orderData = {
        restaurantId: restaurant.id,
        items: orderItems.map((item) => ({
          mealId: item.meal.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        deliveryLocation: {
          address: deliveryAddress,
          coordinates:
            location.latitude && location.longitude
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                }
              : null,
        },
        contactPhone,
        specialInstructions,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to place order")
      }

      const result = await response.json()
      onSuccess()

      toast({
        title: "Order placed successfully!",
        description: `Your order #${result.order.id.slice(0, 8)} has been submitted`,
      })
    } catch (error: any) {
      console.error("Error placing order:", error)
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Place Order - {restaurant.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={item.meal.image || "/placeholder.svg?height=64&width=64"}
                      alt={item.meal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{item.meal.name}</h3>
                        <p className="text-sm text-muted-foreground">₦{item.meal.price.toLocaleString()} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.meal.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>

                    <Input
                      placeholder="Special instructions for this item..."
                      value={item.specialInstructions || ""}
                      onChange={(e) => updateInstructions(index, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delivery-address">Delivery Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="delivery-address"
                    placeholder="Enter your delivery address..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="pl-10 resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special-instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="special-instructions"
                  placeholder="Any special instructions for the restaurant..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₦{calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₦{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee (5%)</span>
                <span>₦{serviceFee.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmitOrder} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Order - ₦{total.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
