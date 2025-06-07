"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  Globe,
  Share2,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Store,
  ChefHat,
  Utensils,
  Calendar,
  ShoppingBag,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { OrderForm } from "@/components/order/order-form"

type ProfileData = {
  id: string
  name: string
  email: string
  image?: string
  role: string
  bio?: string
  phone?: string
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  followersCount: number
  followingCount: number
  isFollowing: boolean
  restaurant?: {
    id: string
    name: string
    description?: string
    address: string
    coordinates: { latitude: number; longitude: number }
    images: string[]
    categories: string[]
    priceRange: { min: number; max: number; average: number }
    rating: number
    reviewCount: number
    phone?: string
    website?: string
    openingHours?: any
    meals: Meal[]
  }
  favorites?: any[]
  recentOrders?: any[]
}

type Meal = {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  categories: string[]
  isAvailable: boolean
}

export default function ProfilePage() {
  const params = useParams()
  const profileId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)

  const isOwnProfile = user?.id === profileId
  const isRestaurant = profile?.role === "VENDOR" && profile?.restaurant

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/profile/${profileId}`)
        if (!response.ok) throw new Error("Failed to fetch profile")

        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (profileId) {
      fetchProfile()
    }
  }, [profileId, toast])

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow users",
        variant: "destructive",
      })
      return
    }

    try {
      setFollowing(true)
      const endpoint = isRestaurant
        ? `/api/restaurants/${profile?.restaurant?.id}/follow`
        : `/api/users/${profileId}/follow`

      const response = await fetch(endpoint, { method: "POST" })
      if (!response.ok) throw new Error("Failed to toggle follow")

      const data = await response.json()
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: data.isFollowing,
              followersCount: data.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1,
            }
          : null,
      )

      toast({
        title: "Success",
        description: data.message,
      })
    } catch (error) {
      console.error("Error toggling follow:", error)
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    } finally {
      setFollowing(false)
    }
  }

  const handleOrderMeal = (meal: Meal) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to place orders",
        variant: "destructive",
      })
      return
    }
    setSelectedMeal(meal)
    setShowOrderForm(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
          <Link href="/home">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/home"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-40 md:h-48 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
          {isRestaurant && profile.restaurant?.images?.[0] && (
            <img
              src={profile.restaurant.images[0] || "/placeholder.svg"}
              alt="Restaurant cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* Profile Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 md:-mt-20">
            <div className="bg-card rounded-2xl shadow-lg border p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-card shadow-lg">
                    <AvatarImage
                      src={isRestaurant ? profile.restaurant?.images?.[0] : profile.image}
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                      {profile.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isRestaurant && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md">
                      <Store className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                          {isRestaurant ? profile.restaurant?.name : profile.name}
                        </h1>
                        {isRestaurant && (
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            <ChefHat className="h-3 w-3 mr-1" />
                            Restaurant
                          </Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-3 leading-relaxed">
                        {isRestaurant ? profile.restaurant?.description : profile.bio}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{isRestaurant ? profile.restaurant?.address : profile.location?.address}</span>
                        </div>

                        {isRestaurant && profile.restaurant?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>{profile.restaurant.phone}</span>
                          </div>
                        )}

                        {isRestaurant && profile.restaurant?.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>
                              {profile.restaurant.rating.toFixed(1)} ({profile.restaurant.reviewCount} reviews)
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>Joined March 2024</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {!isOwnProfile && (
                        <Button
                          onClick={handleFollowToggle}
                          disabled={following}
                          variant={profile.isFollowing ? "outline" : "default"}
                          className="rounded-lg"
                        >
                          {following ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : profile.isFollowing ? (
                            <UserMinus className="h-4 w-4 mr-2" />
                          ) : (
                            <UserPlus className="h-4 w-4 mr-2" />
                          )}
                          {profile.isFollowing ? "Following" : "Follow"}
                        </Button>
                      )}

                      {isOwnProfile && (
                        <Link href="/profile">
                          <Button variant="outline" className="rounded-lg">
                            Edit Profile
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-foreground">
                        {isRestaurant ? profile.restaurant?.meals?.length || 0 : profile.favorites?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {isRestaurant ? "Dishes" : "Saved"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-foreground">{profile.followersCount}</div>
                      <div className="text-xs text-muted-foreground font-medium">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-foreground">{profile.followingCount}</div>
                      <div className="text-xs text-muted-foreground font-medium">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-foreground">
                        {isRestaurant ? profile.restaurant?.reviewCount || 0 : profile.recentOrders?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {isRestaurant ? "Reviews" : "Orders"}
                      </div>
                    </div>
                  </div>

                  {/* Categories/Preferences */}
                  {((isRestaurant && profile.restaurant?.categories) || (!isRestaurant && profile.favorites)) && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {isRestaurant
                          ? profile.restaurant?.categories?.map((category) => (
                              <Badge key={category} variant="secondary" className="rounded-full">
                                {category}
                              </Badge>
                            ))
                          : profile.favorites?.slice(0, 3).map((fav, index) => (
                              <Badge key={index} variant="secondary" className="rounded-full">
                                Food Lover
                              </Badge>
                            ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-card rounded-lg shadow-sm border p-1 mb-6">
            <TabsList className="grid w-full bg-transparent gap-1 grid-cols-3">
              <TabsTrigger
                value="overview"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {isRestaurant ? "Menu" : "Overview"}
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {isRestaurant ? "Reviews" : "Activity"}
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {isRestaurant ? "Info" : "About"}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Menu/Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            {isRestaurant ? (
              <div className="space-y-6">
                <Card className="shadow-sm border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4">
                    <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      Our Menu
                    </CardTitle>
                    <p className="text-primary-foreground/80 text-sm mt-1">Delicious dishes prepared with love</p>
                  </div>
                  <CardContent className="p-6">
                    {profile.restaurant?.meals && profile.restaurant.meals.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {profile.restaurant.meals.map((meal) => (
                          <div
                            key={meal.id}
                            className="bg-muted rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
                          >
                            <div className="aspect-video rounded-lg overflow-hidden bg-card mb-3">
                              <img
                                src={meal.image || "/placeholder.svg?height=200&width=300"}
                                alt={meal.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-foreground line-clamp-1">{meal.name}</h3>
                                <Badge variant={meal.isAvailable ? "default" : "secondary"} className="text-xs">
                                  {meal.isAvailable ? "Available" : "Unavailable"}
                                </Badge>
                              </div>
                              {meal.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">₦{meal.price.toLocaleString()}</span>
                                {meal.isAvailable && !isOwnProfile && (
                                  <Button size="sm" onClick={() => handleOrderMeal(meal)} className="rounded-full">
                                    <ShoppingBag className="h-4 w-4 mr-1" />
                                    Order
                                  </Button>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {meal.categories.map((category) => (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="bg-muted rounded-full p-4 w-fit mx-auto mb-4">
                          <Utensils className="h-12 w-12" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No menu items yet</h3>
                        <p>This restaurant hasn't added any dishes to their menu.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Overview */}
                <Card className="shadow-sm border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4">
                    <CardTitle className="text-lg font-bold text-primary-foreground">Profile Overview</CardTitle>
                    <p className="text-primary-foreground/80 text-sm mt-1">Food journey and preferences</p>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">About</h3>
                          <p className="text-muted-foreground">
                            {profile.bio || "Food enthusiast exploring flavors and discovering amazing restaurants."}
                          </p>
                        </div>
                        {profile.location && (
                          <div>
                            <h3 className="font-semibold mb-2">Location</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{profile.location.address}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Activity Stats</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Favorite Places</span>
                              <span className="font-medium">{profile.favorites?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Recent Orders</span>
                              <span className="font-medium">{profile.recentOrders?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Reviews/Activity Tab */}
          <TabsContent value="reviews" className="mt-0">
            <Card className="shadow-sm border rounded-lg overflow-hidden">
              <div className="bg-primary p-4">
                <CardTitle className="text-lg font-bold text-primary-foreground">
                  {isRestaurant ? "Customer Reviews" : "Recent Activity"}
                </CardTitle>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  {isRestaurant ? "What customers are saying" : "Your food journey highlights"}
                </p>
              </div>
              <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <div className="bg-muted rounded-full p-4 w-fit mx-auto mb-4">
                    <Star className="h-12 w-12" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {isRestaurant ? "No reviews yet" : "No recent activity"}
                  </h3>
                  <p>
                    {isRestaurant
                      ? "Customer reviews will appear here once you start receiving orders."
                      : "Your activity and interactions will be shown here."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Info/About Tab */}
          <TabsContent value="info" className="mt-0">
            <Card className="shadow-sm border rounded-lg overflow-hidden">
              <div className="bg-primary p-4">
                <CardTitle className="text-lg font-bold text-primary-foreground">
                  {isRestaurant ? "Restaurant Information" : "About"}
                </CardTitle>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  {isRestaurant ? "Details and contact information" : "Personal information"}
                </p>
              </div>
              <CardContent className="p-6">
                {isRestaurant && profile.restaurant ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Contact Information</h3>
                          <div className="space-y-2">
                            {profile.restaurant.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{profile.restaurant.phone}</span>
                              </div>
                            )}
                            {profile.restaurant.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <a
                                  href={profile.restaurant.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {profile.restaurant.website}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{profile.restaurant.address}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Price Range</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Average:</span>
                            <span className="font-medium">
                              ₦{profile.restaurant.priceRange.average.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ₦{profile.restaurant.priceRange.min.toLocaleString()} - ₦
                            {profile.restaurant.priceRange.max.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Operating Hours</h3>
                          {profile.restaurant.openingHours ? (
                            <div className="space-y-1 text-sm">
                              {Object.entries(profile.restaurant.openingHours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between">
                                  <span className="capitalize">{day}</span>
                                  <span className="text-muted-foreground">{hours as string}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">Hours not specified</p>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Cuisine Types</h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.restaurant.categories.map((category) => (
                              <Badge key={category} variant="secondary">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Contact</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{profile.email}</span>
                        </div>
                        {profile.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Phone:</span>
                            <span>{profile.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {profile.location && (
                      <div>
                        <h3 className="font-semibold mb-2">Location</h3>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.location.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedMeal && profile.restaurant && (
        <OrderForm
          meal={selectedMeal}
          restaurant={profile.restaurant}
          onClose={() => {
            setShowOrderForm(false)
            setSelectedMeal(null)
          }}
          onSuccess={() => {
            setShowOrderForm(false)
            setSelectedMeal(null)
            toast({
              title: "Order placed!",
              description: "Your order has been submitted successfully.",
            })
          }}
        />
      )}
    </div>
  )
}
