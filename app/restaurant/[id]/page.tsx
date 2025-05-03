"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowLeft, Heart, Share2, Clock, Star, ChevronRight, Info, MapPinned, ShoppingBag } from "lucide-react"
import { useLocation } from "@/components/location-provider"
import { useAuth } from "@/components/auth-provider"
import { CommentSection } from "@/components/community/comment-section"
import { useToast } from "@/components/ui/use-toast"
import { SimpleMap } from "@/components/maps/simple-map"
import { supabaseClient } from "@/lib/supabase-auth"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OrderForm } from "@/components/order/order-form"

type Restaurant = {
  id: string
  name: string
  description: string
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
  categories: string[]
  price_range: {
    min: number
    max: number
    average: number
  }
  rating: number
  review_count: number
  images: string[]
  opening_hours?: {
    [day: string]: {
      open: string
      close: string
    }
  }
}

type Meal = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
}

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { location, calculateDistance } = useLocation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [distance, setDistance] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("menu")
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState("price_asc")
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true)

        // Fetch restaurant details from Supabase
        const { data: restaurantData, error: restaurantError } = await supabaseClient
          .from("restaurants")
          .select("*")
          .eq("id", id)
          .single()

        if (restaurantError) throw restaurantError

        setRestaurant(restaurantData)

        // Fetch meals from Supabase
        const { data: mealsData, error: mealsError } = await supabaseClient
          .from("meals")
          .select("*")
          .eq("restaurant_id", id)

        if (mealsError) throw mealsError

        setMeals(mealsData || [])

        // Calculate distance if we have user location and restaurant coordinates
        if (location.coordinates && restaurantData.coordinates) {
          const dist = calculateDistance(
            location.coordinates.latitude,
            location.coordinates.longitude,
            restaurantData.coordinates.latitude,
            restaurantData.coordinates.longitude,
          )
          setDistance(dist)
        }

        // Check if restaurant is in user's favorites
        if (user) {
          const { data: favoriteData, error: favoriteError } = await supabaseClient
            .from("favorites")
            .select("*")
            .eq("user_id", user.id)
            .eq("restaurant_id", id)
            .single()

          if (!favoriteError && favoriteData) {
            setIsFavorite(true)
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurant details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurantData()
  }, [id, location.coordinates, calculateDistance, toast, user])

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: restaurant?.name || "FoodRadar Restaurant",
          text: restaurant?.description || "Check out this restaurant on FoodRadar",
          url: window.location.href,
        })
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied",
          description: "Restaurant link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save favorites",
        variant: "destructive",
      })
      return
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabaseClient.from("favorites").delete().eq("user_id", user.id).eq("restaurant_id", id)

        if (error) throw error

        setIsFavorite(false)
        toast({
          title: "Removed from favorites",
          description: `${restaurant?.name} has been removed from your favorites`,
        })
      } else {
        // Add to favorites
        const { error } = await supabaseClient.from("favorites").insert({
          user_id: user.id,
          restaurant_id: id,
        })

        if (error) throw error

        setIsFavorite(true)
        toast({
          title: "Added to favorites",
          description: `${restaurant?.name} has been added to your favorites`,
        })
      }
    } catch (error) {
      console.error("Error updating favorites:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      })
    }
  }

  const handleOrderMeal = (meal: Meal) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order",
        variant: "destructive",
      })
      return
    }

    setSelectedMeal(meal)
    setOrderDialogOpen(true)
  }

  const sortedAndFilteredMeals = () => {
    let filtered = [...meals]

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((meal) => meal.category.toLowerCase() === activeCategory.toLowerCase())
    }

    // Sort
    switch (sortOrder) {
      case "price_asc":
        return filtered.sort((a, b) => a.price - b.price)
      case "price_desc":
        return filtered.sort((a, b) => b.price - a.price)
      case "name_asc":
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return filtered
    }
  }

  if (loading || !restaurant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading restaurant details...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/home" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium mobile-hidden">Back</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleFavorite}>
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative h-48 w-full bg-muted sm:h-64 md:h-80">
          <img
            src={restaurant.images[0] || "/placeholder.svg?height=320&width=1280"}
            alt={restaurant.name}
            className="h-full w-full object-cover"
            width={1280}
            height={320}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="container px-4 py-6 sm:px-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
              <div>
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {distance !== null ? `${distance} km away` : "Distance unknown"} • {restaurant.address}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{restaurant.rating}</span>
                  <span className="text-sm text-muted-foreground">({restaurant.review_count})</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Avg: ₦{restaurant.price_range.average.toLocaleString()} per meal
                </span>
              </div>
            </div>

            <p className="mt-4 text-muted-foreground">{restaurant.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {restaurant.categories.map((category) => (
                <Badge key={category} variant="secondary" className="rounded-full">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Open: 8:00 AM - 10:00 PM</span>
              </div>
              <Button variant="link" size="sm" className="h-auto p-0">
                <Info className="mr-1 h-4 w-4" />
                More Info
              </Button>
            </div>
          </div>

          <Tabs defaultValue="menu" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 rounded-full w-full sm:w-auto">
              <TabsTrigger value="menu" className="rounded-full flex-1 sm:flex-initial">
                Menu
              </TabsTrigger>
              <TabsTrigger value="community" className="rounded-full flex-1 sm:flex-initial">
                Community
              </TabsTrigger>
              <TabsTrigger value="location" className="rounded-full flex-1 sm:flex-initial">
                Location
              </TabsTrigger>
            </TabsList>

            <TabsContent value="menu" className="mt-0">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold">Menu</h2>

                <div className="flex items-center gap-2">
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[180px] rounded-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="name_asc">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
                <div className="overflow-x-auto pb-2">
                  <TabsList className="mb-6 rounded-full inline-flex w-auto">
                    <TabsTrigger value="all" className="rounded-full">
                      All
                    </TabsTrigger>
                    {Array.from(new Set(meals.map((meal) => meal.category))).map((category) => (
                      <TabsTrigger key={category} value={category.toLowerCase()} className="rounded-full">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value={activeCategory} className="mt-0">
                  {meals.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">No meals available</h3>
                      <p className="text-muted-foreground mb-6">This restaurant hasn't added any meals yet.</p>
                    </div>
                  ) : sortedAndFilteredMeals().length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No meals found in this category</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {sortedAndFilteredMeals().map((meal) => (
                        <MealCard key={meal.id} meal={meal} onOrder={() => handleOrderMeal(meal)} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="community" className="mt-0">
              <CommentSection type="restaurant" id={id} />
            </TabsContent>

            <TabsContent value="location" className="mt-0">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Location</h2>

                <div className="rounded-xl overflow-hidden border">
                  <SimpleMap
                    latitude={restaurant.coordinates.latitude}
                    longitude={restaurant.coordinates.longitude}
                    height={400}
                    width={800}
                    className="w-full"
                  />
                </div>

                <div className="rounded-xl border p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-medium">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                      {distance !== null && (
                        <p className="mt-1 text-sm">
                          <span className="font-medium">{distance} km</span> from your location
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {user?.role === "vendor" && (
                        <Button variant="outline" className="rounded-full">
                          <MapPinned className="mr-2 h-4 w-4" />
                          Set Location
                        </Button>
                      )}
                      <Link href={`/directions/${id}`}>
                        <Button variant="default" className="rounded-full w-full sm:w-auto">
                          Get Directions
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
            <DialogDescription>{selectedMeal?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <OrderForm
              mealId={selectedMeal?.id || ""}
              mealName={selectedMeal?.name || ""}
              mealPrice={selectedMeal?.price || 0}
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
              onSuccess={() => setOrderDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MealCard({ meal, onOrder }: { meal: Meal; onOrder: () => void }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Check if meal is in user's favorites
    const checkFavorite = async () => {
      if (!user) return

      try {
        const { data, error } = await supabaseClient
          .from("meal_favorites")
          .select("*")
          .eq("user_id", user.id)
          .eq("meal_id", meal.id)
          .single()

        if (!error && data) {
          setIsFavorite(true)
        }
      } catch (error) {
        console.error("Error checking meal favorite:", error)
      }
    }

    checkFavorite()
  }, [meal.id, user])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save favorites",
        variant: "destructive",
      })
      return
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabaseClient
          .from("meal_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("meal_id", meal.id)

        if (error) throw error

        setIsFavorite(false)
      } else {
        // Add to favorites
        const { error } = await supabaseClient.from("meal_favorites").insert({
          user_id: user.id,
          meal_id: meal.id,
        })

        if (error) throw error

        setIsFavorite(true)
      }
    } catch (error) {
      console.error("Error updating meal favorites:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="food-card group">
      <div className="relative aspect-square bg-muted">
        <img
          src={meal.image || "/placeholder.svg?height=200&width=200"}
          alt={meal.name}
          className="h-full w-full object-cover"
          width={200}
          height={200}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={toggleFavorite}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : ""}`} />
        </Button>
        {!meal.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="rounded-full bg-background/80 px-3 py-1 text-sm font-medium">Currently Unavailable</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-medium">{meal.name}</h3>
          <Badge variant="outline" className="rounded-full text-xs">
            {meal.category}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold">₦{meal.price.toLocaleString()}</span>
          <Button size="sm" disabled={!meal.available} className="rounded-full" onClick={onOrder}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Order
          </Button>
        </div>
      </div>
    </div>
  )
}
