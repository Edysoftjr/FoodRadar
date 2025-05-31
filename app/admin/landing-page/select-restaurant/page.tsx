"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, Plus } from "lucide-react"

export default function SelectRestaurantPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/restaurants")

        if (!response.ok) {
          throw new Error("Failed to fetch restaurants")
        }

        const data = await response.json()
        setRestaurants(data)
      } catch (err) {
        console.error("Error loading restaurants:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const handleAddToFeatured = async (restaurantId: string) => {
    try {
      setAddingId(restaurantId)

      const response = await fetch("/api/admin/landing-page/featured", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restaurantId, action: "add" }),
      })

      if (!response.ok) {
        throw new Error("Failed to add restaurant to featured list")
      }

      // Navigate back to landing page manager
      router.push("/admin/landing-page")
    } catch (err) {
      console.error("Error adding restaurant to featured:", err)
    } finally {
      setAddingId(null)
    }
  }

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Select Restaurant to Feature</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search restaurants by name or cuisine..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={restaurant.images?.[0] || "/placeholder.jpeg?height=225&width=400"}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{restaurant.name}</h3>
                    <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddToFeatured(restaurant.id)}
                    disabled={addingId === restaurant.id}
                  >
                    {addingId === restaurant.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRestaurants.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No restaurants found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
