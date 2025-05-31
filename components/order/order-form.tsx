"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useLocation } from "@/components/location-provider"
import { Loader2, Phone } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-auth"

interface OrderFormProps {
  mealId: string
  mealName: string
  mealPrice: number
  restaurantId: string
  restaurantName: string
  onSuccess?: () => void
}

export function OrderForm({ mealId, mealName, mealPrice, restaurantId, restaurantName, onSuccess }: OrderFormProps) {
  const { user } = useAuth()
  const { location } = useLocation()
  const { toast } = useToast()

  const [quantity, setQuantity] = useState(1)
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const total = mealPrice * quantity

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order",
        variant: "destructive",
      })
      return
    }

    if (!location.coordinates) {
      toast({
        title: "Location required",
        description: "Please enable location services to place an order",
        variant: "destructive",
      })
      return
    }

    if (!phone) {
      toast({
        title: "Phone number required",
        description: "Please provide a phone number for delivery",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Create order in Supabase
      const { data, error } = await supabaseClient
        .from("orders")
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          status: "pending",
          total: total,
          delivery_location: {
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude,
            address: location.address,
          },
          contact_phone: phone,
          items: [
            {
              meal_id: mealId,
              name: mealName,
              price: mealPrice,
              quantity: quantity,
              notes: notes,
            },
          ],
        })
        .select()

      if (error) throw error

      toast({
        title: "Order placed successfully",
        description: `Your order for ${quantity} ${mealName} has been placed`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Failed to place order",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
            className="h-8 rounded-none text-center"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (for delivery)</Label>
        <div className="flex">
          <div className="flex items-center rounded-l-md border border-r-0 bg-muted px-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-l-none"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Special Instructions (optional)</Label>
        <Input
          id="notes"
          placeholder="Any special requests for your order"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Price per item</span>
          <span>₦{mealPrice.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Quantity</span>
          <span>{quantity}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <span className="font-medium">Total</span>
          <span className="font-bold">₦{total.toLocaleString()}</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Place Order"
        )}
      </Button>
    </form>
  )
}
