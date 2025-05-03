"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Search, User, Filter, X, ShoppingBag } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useLocation } from "@/components/location-provider"
import { useAuth } from "@/components/auth-provider"
import { supabaseClient } from "@/lib/supabase-auth"
import { useToast } from "@/components/ui/use-toast"

export default function HomePage() {
  const { location, updateLocation } = useLocation()
  const { user } = useAuth()
  const { toast } = useToast()

  const [priceRange, setPriceRange] = useState([3000])
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [filterDistance, setFilterDistance] = useState("10")
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)

        // Fetch restaurants from Supabase
        const { data: restaurantsData, error: restaurantsError } = await supabaseClient.from("restaurants").select("*")

        if (restaurantsError) throw restaurantsError

        // Extract unique categories
        const allCategories = restaurantsData?.flatMap((r) => r.categories) || []
        const uniqueCategories = [...new Set(allCategories)]
        setCategories(uniqueCategories)

        // Calculate distances if we have user location
        let restaurantsWithDistance = restaurantsData || []

        if (location.coordinates) {
          restaurantsWithDistance = restaurantsWithDistance.map((restaurant) => {
            const distance = calculateDistance(
              location.coordinates!.latitude,
              location.coordinates!.longitude,
              restaurant.coordinates.latitude,
              restaurant.coordinates.longitude,
            )

            return {
              ...restaurant,
              distance,
            }
          })

          // Sort by distance
          restaurantsWithDistance.sort((a, b) => a.distance - b.distance)
        }

        setRestaurants(restaurantsWithDistance)
      } catch (error) {
        console.error("Error fetching restaurants:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurants",
          variant: "destructive",
        })
        // Set empty array to handle the error state gracefully
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [location.coordinates, toast])

  const updateUserLocation = async () => {
    setIsUpdatingLocation(true)
    try {
      await updateLocation()
    } catch (error) {
      console.error("Error updating location:", error)
      toast({
        title: "Error updating location",
        description: "Please check your location settings and try again",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return Number.parseFloat(d.toFixed(1))
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  const filteredRestaurants = () => {
    let filtered = [...restaurants]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.categories.some((c: string) => c.toLowerCase().includes(query)),
      )
    }

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((restaurant) =>
        restaurant.categories.some((c: string) => c.toLowerCase() === activeCategory.toLowerCase()),
      )
    }

    // Apply filters
    if (filterCategories.length > 0) {
      filtered = filtered.filter((restaurant) =>
        restaurant.categories.some((c: string) => filterCategories.includes(c)),
      )
    }

    // Filter by price range
    filtered = filtered.filter((restaurant) => restaurant.price_range.average <= priceRange[0])

    // Filter by distance
    if (location.coordinates) {
      filtered = filtered.filter((restaurant) => restaurant.distance <= Number.parseInt(filterDistance))
    }

    return filtered
  }

  const toggleFilterCategory = (category: string) => {
    setFilterCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
  }

  const resetFilters = () => {
    setPriceRange([3000])
    setFilterDistance("10")
    setFilterCategories([])
    setSearchQuery("")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">FoodRadar</span>
            </Link>
          </div>

          {/* Search bar - visible on all screen sizes */}
          <div className="flex-1 max-w-sm px-2 md:px-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-full rounded-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/orders">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 py-6 sm:px-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Nearby Restaurants</h1>
              <p className="text-sm text-muted-foreground">
                {location.address
                  ? `Showing restaurants near ${location.address}`
                  : "Enable location to see nearby restaurants"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 rounded-full"
                onClick={updateUserLocation}
                disabled={isUpdatingLocation}
              >
                <MapPin className="h-4 w-4" />
                {isUpdatingLocation ? "Updating..." : "Update Location"}
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Restaurants</SheetTitle>
                    <SheetDescription>Customize your restaurant search</SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Categories</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={filterCategories.includes(category)}
                              onCheckedChange={() => toggleFilterCategory(category)}
                            />
                            <Label htmlFor={`category-${category}`}>{category}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Price Range</h3>
                        <span>Up to ₦{priceRange[0].toLocaleString()}</span>
                      </div>
                      <Slider
                        value={priceRange}
                        min={500}
                        max={10000}
                        step={100}
                        onValueChange={setPriceRange}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>₦500</span>
                        <span>₦5,000</span>
                        <span>₦10,000</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Distance</h3>
                      <Select value={filterDistance} onValueChange={setFilterDistance}>
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">Within 2km</SelectItem>
                          <SelectItem value="5">Within 5km</SelectItem>
                          <SelectItem value="10">Within 10km</SelectItem>
                          <SelectItem value="15">Within 15km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <SheetFooter className="mt-6 flex-row justify-between">
                    <Button variant="outline" className="rounded-full" onClick={resetFilters}>
                      <X className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    <SheetClose asChild>
                      <Button className="rounded-full">Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <div className="overflow-x-auto pb-2">
              <TabsList className="mb-6 rounded-full inline-flex w-auto">
                <TabsTrigger value="all" className="rounded-full">
                  All
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category.toLowerCase()} className="rounded-full">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeCategory} className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading restaurants...</p>
                  </div>
                </div>
              ) : filteredRestaurants().length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredRestaurants().map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No restaurants found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? "Try a different search term or " : "Try "}
                    adjusting your filters or updating your location
                  </p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={updateUserLocation}>
          <MapPin className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

function RestaurantCard({ restaurant }: { restaurant: any }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="food-card group h-full flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={restaurant.images?.[0] || "/placeholder.svg?height=225&width=400"}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            width={400}
            height={225}
          />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold line-clamp-1">{restaurant.name}</h3>
            <span className="text-xs text-muted-foreground">{restaurant.distance} km</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Avg: ₦{restaurant.price_range.average.toLocaleString()}
            </span>
            <span className="text-sm">★{restaurant.rating}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {restaurant.categories?.slice(0, 2).map((category: string) => (
              <span key={category} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                {category}
              </span>
            ))}
          </div>
          <div className="mt-auto pt-3">
            <Button className="w-full rounded-full" size="sm">
              View Restaurant
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
