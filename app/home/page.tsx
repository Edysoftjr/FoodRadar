"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Search, User, Filter, X, ShoppingBag, LogOut, Star, Navigation, Bell } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { BottomNavbar } from "@/components/bottom-navbar"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Restaurant = {
  id: string
  name: string
  description?: string
  address?: string
  coordinates: {
    latitude: number
    longitude: number
  }
  images: string[]
  categories: string[]
  priceRange: {
    min: number
    max: number
    average: number
  }
  rating: number
  reviewCount: number
  distance?: number
  phone?: string
  website?: string
  meals: Meal[]
}

type Meal = {
  id: string
  name: string
  price: number
  image?: string
  description?: string
}

export default function HomePage() {
  const { location, updateLocation, isLoading: locationLoading } = useLocation()
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [priceRange, setPriceRange] = useState([10000])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [filterDistance, setFilterDistance] = useState("10")
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<any[]>([])

  // Check if user has location
  const hasLocation = location.latitude && location.longitude

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)

        // Build query parameters
        const params = new URLSearchParams()

        if (hasLocation) {
          params.append("latitude", location.latitude.toString())
          params.append("longitude", location.longitude.toString())
        }

        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim())
        }

        if (activeCategory !== "all") {
          params.append("category", activeCategory)
        }

        // Fetch restaurants from API
        const response = await fetch(`/api/restaurants?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch restaurants")
        }

        const data = await response.json()
        const restaurantsData = data.restaurants || []

        // Extract unique categories
        const allCategories = restaurantsData.flatMap((r: Restaurant) => r.categories)
        const uniqueCategories = [...new Set(allCategories)]
        setCategories(uniqueCategories)

        // Calculate distances if we have user location
        let restaurantsWithDistance = restaurantsData

        if (hasLocation) {
          restaurantsWithDistance = restaurantsData.map((restaurant: Restaurant) => {
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              restaurant.coordinates.latitude,
              restaurant.coordinates.longitude,
            )

            return {
              ...restaurant,
              distance,
            }
          })

          // Sort by distance
          restaurantsWithDistance.sort((a: Restaurant, b: Restaurant) => (a.distance || 0) - (b.distance || 0))
        }

        setRestaurants(restaurantsWithDistance)
      } catch (error) {
        console.error("Error fetching restaurants:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurants",
          variant: "destructive",
        })
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [hasLocation, location.latitude, location.longitude, searchQuery, activeCategory, toast])

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    if (user) {
      fetchNotifications()
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      })
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  const handleLocationUpdate = async () => {
    try {
      await updateLocation()
      toast({
        title: "Location updated",
        description: "Your location has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating location:", error)
      // Error handling is done in the location provider
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
          restaurant.categories.some((c: string) => c.toLowerCase().includes(query)) ||
          restaurant.description?.toLowerCase().includes(query),
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
    filtered = filtered.filter((restaurant) => restaurant.priceRange.average <= priceRange[0])

    // Filter by distance
    if (hasLocation && filterDistance) {
      filtered = filtered.filter((restaurant) => (restaurant.distance || 0) <= Number.parseInt(filterDistance))
    }

    return filtered
  }

  const toggleFilterCategory = (category: string) => {
    setFilterCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
  }

  const resetFilters = () => {
    setPriceRange([10000])
    setFilterDistance("10")
    setFilterCategories([])
    setSearchQuery("")
    setActiveCategory("all")
  }

  // Location prompt component
  const LocationPrompt = () => {
    if (hasLocation) return null

    return (
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Navigation className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable location for better experience</p>
              <p className="text-sm">Get personalized restaurant recommendations near you</p>
            </div>
            <Button onClick={handleLocationUpdate} disabled={locationLoading} size="sm" className="ml-4">
              {locationLoading ? "Detecting..." : "Enable Location"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex min-h-screen flex-col pb-16">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-0 mx-0">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                alt="FoodRadar App"
                src="/foodrlogo.png"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
              <span className="text-xl font-bold">FoodRadar</span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-sm px-2 md:px-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search restaurants..."
                className="w-full rounded-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification, index) => (
                    <DropdownMenuItem key={index} className="flex flex-col items-start p-3">
                      <span className="font-medium text-sm">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">{notification.message}</span>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 py-6 sm:px-6 mx-auto">
          <LocationPrompt />

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{hasLocation ? "Nearby Restaurants" : "Restaurants"}</h1>
              <p className="text-sm text-muted-foreground">
                {hasLocation && location.address
                  ? `Showing restaurants near ${location.neighborhood || location.city}`
                  : "Discover amazing restaurants and cuisines"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 rounded-full"
                  onClick={handleLocationUpdate}
                  disabled={locationLoading}
                >
                  <MapPin className="h-4 w-4" />
                  {locationLoading ? "Updating..." : "Update Location"}
                </Button>
              )}

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
                        max={15000}
                        step={500}
                        onValueChange={setPriceRange}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>₦500</span>
                        <span>₦7,500</span>
                        <span>₦15,000</span>
                      </div>
                    </div>

                    {hasLocation && (
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
                            <SelectItem value="25">Within 25km</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
            <div className="overflow-x-auto no-scrollbar pb-2">
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
                    adjusting your filters {!hasLocation && "or enable location"}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={resetFilters}>Reset Filters</Button>
                    {!hasLocation && (
                      <Button variant="outline" onClick={handleLocationUpdate}>
                        Enable Location
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavbar />
    </div>
  )
}


function RestaurantCard({ restaurant }: { restaurant: any }) {
  // If this is a placeholder restaurant (no data yet)
  if (!restaurant.name) {
    return (
      <div className="food-card group">
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src="/placeholder.jpeg?height=225&width=400"
            alt="Restaurant"
            className="food-card-image"
            width={400}
            height={225}
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Restaurant Name</h3>
            <span className="text-xs text-muted-foreground">2.3 km</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg: ₦2,500</span>
            <span className="text-sm">★★★★☆</span>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <img
                src="/placeholder1.jpeg?height=48&width=48"
                alt="Meal"
                className="h-full w-full object-cover"
                width={48}
                height={48}
              />
              <div className="absolute bottom-0 w-full bg-primary/80 px-1 py-0.5 text-center text-[10px] text-white">
                ₦1,800
              </div>
            </div>
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <img
                src="/placeholder.jpeg?height=48&width=48"
                alt="Meal"
                className="h-full w-full object-cover"
                width={48}
                height={48}
              />
              <div className="absolute bottom-0 w-full bg-primary/80 px-1 py-0.5 text-center text-[10px] text-white">
                ₦2,200
              </div>
            </div>
          </div>
          <Button className="mt-3 w-full rounded-full" size="sm">
            View Restaurant
          </Button>
        </div>
      </div>
    )
  }

  // Real restaurant data
  return (
    <div className="food-card group">
      <div className="aspect-video overflow-hidden bg-muted">
        <img
          src={restaurant.images?.[0] || "/placeholder.jpeg?height=225&width=400"}
          alt={restaurant.name}
          className="food-card-image"
          width={400}
          height={225}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{restaurant.name}</h3>
          <span className="text-xs text-muted-foreground">
            {restaurant.location?.distance ? `${(restaurant.location.distance / 1000).toFixed(1)} km` : ""}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {restaurant.priceRange ? `Avg: ₦${restaurant.priceRange}` : ""}
          </span>
          <span className="text-sm">
            {restaurant.rating
              ? `★`.repeat(Math.floor(restaurant.rating)) + `☆`.repeat(5 - Math.floor(restaurant.rating))
              : ""}
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          {restaurant.meals?.slice(0, 2).map((meal: any) => (
            <div key={meal.id} className="relative h-12 w-12 overflow-hidden rounded-md">
              <img
                src={meal.image || "/placeholder1.jpeg?height=48&width=48"}
                alt={meal.name}
                className="h-full w-full object-cover"
                width={48}
                height={48}
              />
              <div className="absolute bottom-0 w-full bg-primary/80 px-1 py-0.5 text-center text-[10px] text-white">
                ₦{meal.price}
              </div>
            </div>
          ))}
        </div>
        <Link href={`/restaurant/${restaurant.id}`}>
          <Button className="mt-3 w-full rounded-full" size="sm">
            View Restaurant
          </Button>
        </Link>
      </div>
    </div>
  )
}