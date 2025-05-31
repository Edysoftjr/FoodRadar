"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Heart,
  Loader2,
  MapPin,
  Settings,
  Star,
  Camera,
  Clock,
  Eye,
  TrendingUp,
  Store,
  Users,
  DollarSign,
  UserPlus,
  UserMinus,
  Share2,
  MoreHorizontal,
  Award,
  Calendar,
  Phone,
  ChefHat,
  Utensils,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLocation } from "@/components/location-provider"
import { FileUpload } from "@/components/file-upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Types
type UserProfile = {
  id: string
  name: string
  email: string
  image?: string
  role: string
  budget?: number
  preferences?: string[]
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  phone?: string
  bio?: string
  followersCount?: number
  followingCount?: number
  isFollowing?: boolean
  favorites?: {
    id: string
    restaurant: {
      id: string
      name: string
      images: string[]
      priceRange: { average: number }
      rating: number
      address?: string
    }
  }[]
  mealFavorites?: {
    id: string
    meal: {
      id: string
      name: string
      price: number
      image?: string
      restaurant: { id: string; name: string }
    }
  }[]
  recentOrders?: {
    id: string
    total: number
    createdAt: string
    restaurant: { id: string; name: string; images: string[] }
  }[]
  visitedRestaurants?: {
    id: string
    name: string
    images: string[]
    lastVisited: string
  }[]
}

type RestaurantProfile = {
  id: string
  name: string
  description?: string
  address?: string
  coordinates: { latitude: number; longitude: number }
  images: string[]
  categories: string[]
  priceRange: { min: number; max: number; average: number }
  rating: number
  reviewCount: number
  openingHours?: any
  phone?: string
  website?: string
  meals: Meal[]
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

type StatusPost = {
  id: string
  image: string
  caption: string
  createdAt: string
  expiresAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { location, updateLocation } = useLocation()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [following, setFollowing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [restaurantProfile, setRestaurantProfile] = useState<RestaurantProfile | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Form states
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [userLocation, setUserLocation] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)

  // Restaurant form states
  const [restaurantName, setRestaurantName] = useState("")
  const [restaurantDescription, setRestaurantDescription] = useState("")
  const [restaurantAddress, setRestaurantAddress] = useState("")
  const [restaurantPhone, setRestaurantPhone] = useState("")
  const [operatingHours, setOperatingHours] = useState("")
  const [cuisineType, setCuisineType] = useState("")

  // New meal form
  const [newMeal, setNewMeal] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null as File | null,
  })
  const [addingMeal, setAddingMeal] = useState(false)

  // Status posts
  const [statusPosts, setStatusPosts] = useState<StatusPost[]>([])
  const [newStatusImage, setNewStatusImage] = useState<File | null>(null)
  const [newStatusCaption, setNewStatusCaption] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchUserProfile()
      if (session.user.role === "VENDOR") {
        fetchRestaurantProfile()
      }
    }
  }, [status, session])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/profile")
      if (!response.ok) throw new Error("Failed to fetch profile")

      const data = await response.json()
      setUserProfile(data)
      setName(data.name || "")
      setBio(data.bio || "")
      setUserLocation(data.location?.address || "")
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRestaurantProfile = async () => {
    try {
      const response = await fetch("/api/profile/restaurant")
      if (response.status === 404) {
        setRestaurantProfile(null)
        return
      }
      if (!response.ok) throw new Error("Failed to fetch restaurant profile")

      const data = await response.json()
      setRestaurantProfile(data)
      setRestaurantName(data.name || "")
      setRestaurantDescription(data.description || "")
      setRestaurantAddress(data.address || "")
      setRestaurantPhone(data.phone || "")
    } catch (error) {
      console.error("Error fetching restaurant profile:", error)
    }
  }

  const handleFollowToggle = async () => {
    try {
      setFollowing(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUserProfile((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.isFollowing ? (prev.followersCount || 0) - 1 : (prev.followersCount || 0) + 1,
        }
      })

      toast({
        title: "Success",
        description: userProfile?.isFollowing ? "Unfollowed successfully" : "Following successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    } finally {
      setFollowing(false)
    }
  }

  const saveUserProfile = async () => {
    try {
      setSaving(true)
      const formData = new FormData()
      formData.append("name", name)
      formData.append("bio", bio)

      if (userProfile?.location) {
        formData.append("location", JSON.stringify(userProfile.location))
      }
      if (profileImage) {
        formData.append("image", profileImage)
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to update profile")

      const data = await response.json()
      setUserProfile(data)
      setEditingProfile(false)

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveRestaurantProfile = async () => {
    try {
      setSaving(true)
      const formData = new FormData()
      formData.append("name", restaurantName)
      formData.append("description", restaurantDescription)
      formData.append("address", restaurantAddress)
      formData.append("phone", restaurantPhone)
      formData.append("categories", JSON.stringify([cuisineType]))
      formData.append("coordinates", JSON.stringify({ latitude: 0, longitude: 0 }))
      formData.append("priceRange", JSON.stringify({ min: 1000, max: 5000, average: 2500 }))

      const response = await fetch("/api/profile/restaurant", {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to update restaurant profile")

      const data = await response.json()
      setRestaurantProfile(data)

      toast({
        title: "Success",
        description: "Restaurant profile updated successfully.",
      })
    } catch (error) {
      console.error("Error saving restaurant profile:", error)
      toast({
        title: "Error",
        description: "Failed to save restaurant profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddMeal = async () => {
    try {
      setAddingMeal(true)
      if (!newMeal.name || !newMeal.price) {
        toast({
          title: "Error",
          description: "Meal name and price are required.",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append("name", newMeal.name)
      formData.append("description", newMeal.description || "")
      formData.append("price", newMeal.price)
      formData.append("categories", JSON.stringify([newMeal.category]))

      if (newMeal.image) {
        formData.append("image", newMeal.image)
      }

      const response = await fetch("/api/profile/restaurant/meals", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to add meal")

      setNewMeal({ name: "", description: "", price: "", category: "", image: null })
      await fetchRestaurantProfile()

      toast({
        title: "Success",
        description: "Meal added successfully.",
      })
    } catch (error) {
      console.error("Error adding meal:", error)
      toast({
        title: "Error",
        description: "Failed to add meal.",
        variant: "destructive",
      })
    } finally {
      setAddingMeal(false)
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const response = await fetch(`/api/profile/restaurant/meals/${mealId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete meal")

      await fetchRestaurantProfile()
      toast({
        title: "Success",
        description: "Meal deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting meal:", error)
      toast({
        title: "Error",
        description: "Failed to delete meal.",
        variant: "destructive",
      })
    }
  }

  const handleToggleMealAvailability = async (mealId: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/profile/restaurant/meals/${mealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      })
      if (!response.ok) throw new Error("Failed to update meal availability")

      await fetchRestaurantProfile()
    } catch (error) {
      console.error("Error updating meal availability:", error)
      toast({
        title: "Error",
        description: "Failed to update meal availability.",
        variant: "destructive",
      })
    }
  }

  const addStatusPost = () => {
    if (!newStatusImage || !newStatusCaption) return

    const newPost: StatusPost = {
      id: Date.now().toString(),
      image: URL.createObjectURL(newStatusImage),
      caption: newStatusCaption,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    setStatusPosts([newPost, ...statusPosts])
    setNewStatusImage(null)
    setNewStatusCaption("")
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background/95">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  const isVendor = session?.user?.role === "VENDOR"
  const isOwnProfile = session?.user?.id === userProfile?.id

  return (
  <div className="min-h-screen bg-background/95">
    {/* Header */}
    <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/home" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            {isOwnProfile && (
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Hero Section */}
    <div className="relative">
      {/* Cover Image */}
      <div className="h-40 md:h-48 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        {isVendor && restaurantProfile?.images?.[0] && (
          <img
            src={restaurantProfile.images[0] || "/placeholder.svg"}
            alt="Restaurant cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 md:-mt-20">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="relative">
                  <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-card shadow-lg">
                    <AvatarImage src={userProfile?.image || ""} alt={userProfile?.name || "User"} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                      {userProfile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isVendor && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md">
                      <Store className="h-4 w-4" />
                    </div>
                  )}
                </div>
                {editingProfile && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <FileUpload
                      onUpload={(file) => setProfileImage(file)}
                      currentImage={userProfile?.image}
                      buttonText=""
                      className="h-8 w-8"
                    >
                      <div className="h-8 w-8 bg-card rounded-full shadow-md flex items-center justify-center border border-border hover:border-primary transition-colors">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </FileUpload>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {editingProfile ? (
                      <div className="space-y-3">
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="text-xl font-bold border-border rounded-lg focus:border-primary"
                        />
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about your food journey..."
                          className="resize-none border-border rounded-lg focus:border-primary"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                            {userProfile?.name}
                          </h1>
                          {isVendor && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <ChefHat className="h-3 w-3 mr-1" />
                              Restaurant
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3 leading-relaxed">
                          {userProfile?.bio ||
                            (isVendor ? "Passionate about serving great food" : "Food enthusiast exploring flavors")}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {userProfile?.location?.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span>{userProfile.location.address}</span>
                            </div>
                          )}
                          {isVendor && restaurantProfile?.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4 text-primary" />
                              <span>{restaurantProfile.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>Joined March 2024</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {editingProfile ? (
                      <>
                        <Button
                          onClick={saveUserProfile}
                          disabled={saving}
                          className="rounded-lg"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingProfile(false)}
                          className="rounded-lg"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        {!isOwnProfile && (
                          <Button
                            onClick={handleFollowToggle}
                            disabled={following}
                            variant={userProfile?.isFollowing ? "outline" : "default"}
                            className="rounded-lg"
                          >
                            {following ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : userProfile?.isFollowing ? (
                              <UserMinus className="h-4 w-4 mr-2" />
                            ) : (
                              <UserPlus className="h-4 w-4 mr-2" />
                            )}
                            {userProfile?.isFollowing ? "Following" : "Follow"}
                          </Button>
                        )}
                        {isOwnProfile && (
                          <Button
                            onClick={() => setEditingProfile(true)}
                            variant="outline"
                            className="rounded-lg"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-foreground">
                      {isVendor ? restaurantProfile?.meals?.length || 0 : userProfile?.favorites?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{isVendor ? "Dishes" : "Saved"}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-foreground">
                      {userProfile?.followersCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-foreground">
                      {userProfile?.followingCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-foreground">
                      {isVendor ? restaurantProfile?.rating || "4.5" : userProfile?.recentOrders?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{isVendor ? "Rating" : "Orders"}</div>
                  </div>
                </div>

                {/* Preferences/Categories */}
                {((isVendor && restaurantProfile?.categories) || (!isVendor && userProfile?.preferences)) && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {isVendor
                        ? restaurantProfile?.categories?.map((category) => (
                            <Badge
                              key={category}
                              variant="secondary"
                              className="rounded-full"
                            >
                              {category}
                            </Badge>
                          ))
                        : userProfile?.preferences?.map((preference) => (
                            <Badge
                              key={preference}
                              variant="secondary"
                              className="rounded-full"
                            >
                              {preference}
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

    {/* Content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-card rounded-lg shadow-sm border border-border p-1 mb-6">
          <TabsList
            className="grid w-full bg-transparent gap-1"
            style={{ gridTemplateColumns: isVendor ? "repeat(5, 1fr)" : "repeat(4, 1fr)" }}
          >
            <TabsTrigger
              value="overview"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {isVendor ? "Menu" : "Saved"}
            </TabsTrigger>
            <TabsTrigger
              value="status"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {isVendor ? "Analytics" : "Status"}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {isVendor ? "Customers" : "History"}
            </TabsTrigger>
            {isVendor && (
              <TabsTrigger
                value="promotions"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Promotions
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0">
          {isVendor ? (
            <div className="space-y-6">
              {/* Restaurant Overview */}
              <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                <div className="bg-primary p-4">
                  <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Restaurant Information
                  </CardTitle>
                  <p className="text-primary-foreground/80 text-sm mt-1">Manage your restaurant details</p>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Restaurant Name</Label>
                        <Input
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                          className="rounded-lg border-border focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Phone Number</Label>
                        <Input
                          value={restaurantPhone}
                          onChange={(e) => setRestaurantPhone(e.target.value)}
                          className="rounded-lg border-border focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Cuisine Type</Label>
                        <Select value={cuisineType} onValueChange={setCuisineType}>
                          <SelectTrigger className="rounded-lg border-border focus:border-primary">
                            <SelectValue placeholder="Select cuisine type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local Nigerian</SelectItem>
                            <SelectItem value="continental">Continental</SelectItem>
                            <SelectItem value="fastfood">Fast Food</SelectItem>
                            <SelectItem value="seafood">Seafood</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="desserts">Desserts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Address</Label>
                        <Input
                          value={restaurantAddress}
                          onChange={(e) => setRestaurantAddress(e.target.value)}
                          className="rounded-lg border-border focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Operating Hours</Label>
                        <Input
                          value={operatingHours}
                          onChange={(e) => setOperatingHours(e.target.value)}
                          placeholder="e.g., 9:00 AM - 10:00 PM"
                          className="rounded-lg border-border focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Description</Label>
                    <Textarea
                      value={restaurantDescription}
                      onChange={(e) => setRestaurantDescription(e.target.value)}
                      placeholder="Tell customers about your restaurant..."
                      className="rounded-lg border-border focus:border-primary resize-none"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={saveRestaurantProfile}
                    disabled={saving}
                    className="rounded-lg"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                <div className="bg-primary p-4">
                  <CardTitle className="text-lg font-bold text-primary-foreground">Profile Summary</CardTitle>
                  <p className="text-primary-foreground/80 text-sm mt-1">Your food journey at a glance</p>
                </div>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className="bg-primary text-primary-foreground p-2 rounded-full w-fit mx-auto mb-3">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div className="text-2xl font-bold text-foreground mb-1">
                        ₦{userProfile?.budget?.toLocaleString() || "2,500"}
                      </div>
                      <div className="text-sm text-muted-foreground">Budget Range</div>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className="bg-primary text-primary-foreground p-2 rounded-full w-fit mx-auto mb-3">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {userProfile?.favorites?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Saved Places</div>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className="bg-primary text-primary-foreground p-2 rounded-full w-fit mx-auto mb-3">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {userProfile?.visitedRestaurants?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Places Visited</div>
                    </div>
                  </div>

                  {userProfile?.preferences && userProfile.preferences.length > 0 && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold text-foreground mb-3">Food Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.preferences.map((pref) => (
                          <Badge
                            key={pref}
                            variant="secondary"
                            className="rounded-full"
                          >
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Saved/Menu Tab */}
        <TabsContent value="saved" className="mt-0">
          {isVendor ? (
            <div className="space-y-6">
              {/* Menu Management */}
              <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                <div className="bg-primary p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                        <Utensils className="h-5 w-5" />
                        Menu Management
                      </CardTitle>
                      <p className="text-primary-foreground/80 text-sm mt-1">Add and manage your dishes</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="rounded-lg">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Dish
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-lg max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Dish</DialogTitle>
                          <DialogDescription>Fill in the details for your new dish</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Dish Name</Label>
                              <Input
                                value={newMeal.name}
                                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                                className="rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Price (₦)</Label>
                              <Input
                                type="number"
                                value={newMeal.price}
                                onChange={(e) => setNewMeal({ ...newMeal, price: e.target.value })}
                                className="rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={newMeal.category}
                              onValueChange={(value) => setNewMeal({ ...newMeal, category: value })}
                            >
                              <SelectTrigger className="rounded-lg">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="appetizer">Appetizer</SelectItem>
                                <SelectItem value="main">Main Course</SelectItem>
                                <SelectItem value="dessert">Dessert</SelectItem>
                                <SelectItem value="beverage">Beverage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={newMeal.description}
                              onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                              className="rounded-lg resize-none"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Dish Image</Label>
                            <FileUpload
                              onUpload={(file) => setNewMeal({ ...newMeal, image: file })}
                              buttonText="Upload Image"
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddMeal} disabled={addingMeal} className="rounded-lg">
                            {addingMeal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Add Dish
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {restaurantProfile?.meals && restaurantProfile.meals.length > 0 ? (
                      restaurantProfile.meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border"
                        >
                          <div className="h-16 w-16 rounded-lg bg-card flex-shrink-0 overflow-hidden">
                            <img
                              src={meal.image || "/placeholder.svg?height=64&width=64"}
                              alt={meal.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{meal.name}</h3>
                            <p className="text-primary font-medium">₦{meal.price.toLocaleString()}</p>
                            {meal.description && (
                              <p className="text-muted-foreground text-sm line-clamp-1">{meal.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {meal.categories.map((category) => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Available</span>
                              <Switch
                                checked={meal.isAvailable}
                                onCheckedChange={() => handleToggleMealAvailability(meal.id, meal.isAvailable)}
                              />
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="bg-muted rounded-full p-4 w-fit mx-auto mb-4">
                          <Utensils className="h-12 w-12" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No dishes added yet</h3>
                        <p>Add your first dish to get started with your menu.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Saved Restaurants & Meals */}
              <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                <div className="bg-primary p-4">
                  <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Saved Restaurants & Meals
                  </CardTitle>
                  <p className="text-primary-foreground/80 text-sm mt-1">Your favorite places and dishes</p>
                </div>
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {userProfile?.favorites && userProfile.favorites.length > 0 ? (
                      userProfile.favorites.map((favorite) => (
                        <div
                          key={favorite.id}
                          className="bg-muted rounded-lg p-4 border border-border"
                        >
                          <div className="flex gap-4">
                            <div className="h-16 w-16 rounded-lg bg-card flex-shrink-0 overflow-hidden">
                              <img
                                src={favorite.restaurant.images[0] || "/placeholder.svg?height=64&width=64"}
                                alt={favorite.restaurant.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{favorite.restaurant.name}</h3>
                              <p className="text-muted-foreground text-sm">
                                Avg: ₦{favorite.restaurant.priceRange.average.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-muted-foreground">{favorite.restaurant.rating}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Link href={`/restaurant/${favorite.restaurant.id}`}>
                                <Button size="sm" variant="outline" className="rounded-lg">
                                  Visit
                                </Button>
                              </Link>
                              <Button size="icon" variant="ghost" className="rounded-lg">
                                <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-muted-foreground">
                        <div className="bg-muted rounded-full p-4 w-fit mx-auto mb-4">
                          <Heart className="h-12 w-12" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No saved restaurants yet</h3>
                        <p>Start exploring and save your favorites!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Status/Analytics Tab */}
        <TabsContent value="status" className="mt-0">
          {isVendor ? (
            <div className="space-y-6">
              {/* Analytics Dashboard */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-sm border-border rounded-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Total Views</p>
                        <p className="text-3xl font-bold text-foreground mt-1">1,234</p>
                        <p className="text-primary text-sm font-medium mt-1">+12% from last week</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Eye className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-border rounded-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Orders Today</p>
                        <p className="text-3xl font-bold text-foreground mt-1">23</p>
                        <p className="text-primary text-sm font-medium mt-1">+5 from yesterday</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-border rounded-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Revenue</p>
                        <p className="text-3xl font-bold text-foreground mt-1">₦45,600</p>
                        <p className="text-primary text-sm font-medium mt-1">+8% from last week</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* FoodRadar Status */}
              <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                <div className="bg-primary p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        FoodRadar Status
                      </CardTitle>
                      <p className="text-primary-foreground/80 text-sm mt-1">Share your food moments (24hr expiration)</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="rounded-lg">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-lg">
                        <DialogHeader>
                          <DialogTitle>Add to Status</DialogTitle>
                          <DialogDescription>Share a food moment with your followers</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <FileUpload
                            onUpload={(file) => setNewStatusImage(file)}
                            buttonText="Upload Food Photo"
                            className="rounded-lg"
                          />
                          <Textarea
                            value={newStatusCaption}
                            onChange={(e) => setNewStatusCaption(e.target.value)}
                            placeholder="What's on your plate today?"
                            className="rounded-lg resize-none"
                            rows={3}
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={addStatusPost} className="rounded-lg">
                            Share Status
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <CardContent className="p-6">
                  {statusPosts.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {statusPosts.map((post) => (
                        <div key={post.id} className="flex-shrink-0 w-32">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                            <img
                              src={post.image || "/placeholder.svg"}
                              alt="Status"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{post.caption}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {Math.floor((new Date(post.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))}h left
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="bg-muted rounded-full p-4 w-fit mx-auto mb-4">
                        <Camera className="h-12 w-12" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">No status posts yet</h3>
                      <p>Share your first food moment!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* History/Customers Tab */}
        <TabsContent value="history" className="mt-0">
          {isVendor ? (
            <div className="space-y-6">
              {/* Customer Interactions */}
              <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                <div className="bg-primary p-4">
                  <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Interactions
                  </CardTitle>
                  <p className="text-primary-foreground/80 text-sm mt-1">Recent customer activities and feedback</p>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">User {i} viewed your menu</p>
                          <p className="text-sm text-muted-foreground">2 hours ago</p>
                        </div>
                        <Badge variant="secondary">View</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Interaction History */}
              <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                <div className="bg-primary p-4">
                  <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Interaction History
                  </CardTitle>
                  <p className="text-primary-foreground/80 text-sm mt-1">Restaurants you've visited and interacted with</p>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {userProfile?.recentOrders && userProfile.recentOrders.length > 0 ? (
                      userProfile.recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border"
                        >
                          <div className="h-12 w-12 rounded-lg bg-card flex-shrink-0 overflow-hidden">
                            <img
                              src={order.restaurant.images[0] || "/placeholder.svg?height=48&width=48"}
                              alt={order.restaurant.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{order.restaurant.name}</h3>
                            <p className="text-primary font-medium">Order: ₦{order.total.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Button size="sm" variant="outline" className="rounded-lg">
                            Reorder
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="bg-muted rounded-full p-4 w-fit mx-auto mb-4">
                          <Clock className="h-12 w-12" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No interaction history yet</h3>
                        <p>Start exploring restaurants!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Promotions Tab (Vendor only) */}
        {isVendor && (
          <TabsContent value="promotions" className="mt-0">
            <div className="space-y-6">
              <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                <div className="bg-primary p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Promotions & Offers
                      </CardTitle>
                      <p className="text-primary-foreground/80 text-sm mt-1">Create and manage special offers for your customers</p>
                    </div>
                    <Button variant="secondary" className="rounded-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Promotion
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="bg-muted rounded-full p-4 w-fit mx-auto mb-4">
                      <Award className="h-12 w-12" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">No active promotions</h3>
                    <p>Create your first promotion to attract more customers!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  </div>
)
}
