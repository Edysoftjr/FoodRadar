"use client"

// --- IMPORTS ---
// React & Next.js
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// UI Components (Shadcn UI)
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // For date picker if implemented

// Custom Components & Providers
import { useLocation } from "@/components/location-provider" // Assuming this component exists

// Utility & Authentication
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils" // Assuming you have a cn utility for tailwind-merge/clsx
import { format } from "date-fns" // For date formatting

// Icons (Lucide React)
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
  Percent,
  CalendarDays,
  Tag,
  BookA,
} from "lucide-react"

// --- TYPES ---
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
  categories: string[] // This is for restaurant categories (e.g., Nigerian, Continental)
  priceRange: { min: number; max: number; average: number }
  rating: number
  reviewCount: number
  openingHours?: any
  phone?: string
  website?: string
  meals: Meal[]
  mealCategories: string[] // New: for custom meal categories within the menu
}

type Meal = {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  categories: string[] // Refers to meal categories (e.g., Main Course, Soup)
  isAvailable: boolean
}

type StatusPost = {
  id: string
  image: string
  caption: string
  createdAt: string
  expiresAt: string
}

type Promotion = {
  id: string
  name: string
  description: string
  discountPercentage: number
  startDate: string
  endDate: string
  isActive: boolean
  code?: string
  appliesTo: 'all_meals' | 'specific_meals' | 'total_order'
  minOrderValue?: number
  imageUrl?: string
}


// --- DUMMY DATA (Streamlined & Enhanced) ---
const dummyData = {
  userProfile: {
    id: 'user123',
    name: "Alex Doe",
    email: "alex.doe@example.com",
    image: "https://github.com/shadcn.png", // Default image
    role: "USER",
    bio: "Food enthusiast on a journey to find the most authentic Nigerian jollof. Lover of all things spicy and flavorful.",
    followersCount: 1258,
    followingCount: 342,
    isFollowing: false,
    location: { latitude: 6.5244, longitude: 3.3792, address: "Lagos, Nigeria" },
    budget: 5000,
    preferences: ["Spicy", "Local Nigerian", "Seafood", "Healthy"],
    favorites: [
      { id: 'fav1', restaurant: { id: 'rest1', name: 'Jollof King', images: ['https://source.unsplash.com/random/300x200?food,jollof,restaurant'], priceRange: { average: 3000 }, rating: 4.8, address: 'Ikeja, Lagos' } },
      { id: 'fav2', restaurant: { id: 'rest2', name: 'Amala Joint', images: ['https://source.unsplash.com/random/300x200?food,amala,restaurant'], priceRange: { average: 2500 }, rating: 4.5, address: 'Yaba, Lagos' } }
    ],
    recentOrders: [
      { id: 'ord1', total: 4500, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), restaurant: { id: 'rest1', name: 'Jollof King', images: ['https://source.unsplash.com/random/300x200?food,order,meal'] } },
      { id: 'ord2', total: 3200, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), restaurant: { id: 'rest3', name: 'Nkwobi Spot', images: ['https://source.unsplash.com/random/300x200?food,meal,nigerian'] } }
    ],
    visitedRestaurants: [
      { id: 'rest1', name: 'Jollof King', images: ['https://source.unsplash.com/random/300x200?restaurant,interior,nigeria'], lastVisited: new Date(Date.now() - 86400000 * 7).toISOString() },
      { id: 'rest4', name: 'Suya Express', images: ['https://source.unsplash.com/random/300x200?suya,restaurant,food'], lastVisited: new Date(Date.now() - 86400000 * 12).toISOString() }
    ],
  } as UserProfile,

  restaurantProfile: {
    id: 'vendor123',
    name: 'Buka Haven',
    description: 'Authentic Nigerian dishes served with a modern twist. Experience the true taste of Naija.',
    address: '123 Foodie Lane, Victoria Island, Lagos',
    coordinates: { latitude: 6.4281, longitude: 3.4218 },
    images: ['https://source.unsplash.com/random/800x400?restaurant,nigeria,food', 'https://source.unsplash.com/random/800x400?restaurant,interior,kitchen'],
    categories: ['Local Nigerian', 'Swallow', 'Pepper Soup'],
    priceRange: { min: 1500, max: 8000, average: 4000 },
    rating: 4.9,
    reviewCount: 512,
    phone: '08012345678',
    meals: [
      { id: 'meal1', name: 'Amala & Ewedu', description: 'Classic combo with gbegiri and assorted meat.', price: 3500, image: 'https://source.unsplash.com/random/300x300?amala,food', categories: ['Swallow'], isAvailable: true },
      { id: 'meal2', name: 'Goat Meat Pepper Soup', description: 'Spicy and aromatic broth.', price: 2500, image: 'https://source.unsplash.com/random/300x300?peppersoup,food', categories: ['Soups'], isAvailable: true },
      { id: 'meal3', name: 'Nkwobi', description: 'A savory delight of cow foot in a rich palm oil paste.', price: 4000, image: 'https://source.unsplash.com/random/300x300?nkwobi,food', categories: ['Small Chops'], isAvailable: false },
      { id: 'meal4', name: 'Jollof Rice with Chicken', description: 'Our signature jollof with perfectly grilled chicken.', price: 3000, image: 'https://source.unsplash.com/random/300x300?jollofrice,food', categories: ['Rice Dishes'], isAvailable: true },
    ],
    mealCategories: ['Swallow', 'Soups', 'Rice Dishes', 'Small Chops', 'Drinks'] // Initial meal categories
  } as RestaurantProfile,

  statusPosts: [
    { id: 'status1', image: 'https://source.unsplash.com/random/400x300?food,eating,happy', caption: "Enjoying some delicious street food today!", createdAt: new Date(Date.now() - 3600000).toISOString(), expiresAt: new Date(Date.now() + 82800000).toISOString() },
    { id: 'status2', image: 'https://source.unsplash.com/random/400x300?restaurant,cafe,interior', caption: "Cozy vibes at my favorite cafe.", createdAt: new Date(Date.now() - 7200000).toISOString(), expiresAt: new Date(Date.now() + 79200000).toISOString() },
  ] as StatusPost[],

  promotions: [
    {
      id: 'promo1',
      name: 'Weekend Jollof Discount',
      description: 'Get 15% off all Jollof Rice orders this weekend!',
      discountPercentage: 15,
      startDate: new Date(2025, 5, 7).toISOString(), // June 7, 2025
      endDate: new Date(2025, 5, 9).toISOString(),   // June 9, 2025
      isActive: true,
      appliesTo: 'specific_meals',
      code: 'JOLLOF15',
      imageUrl: 'https://source.unsplash.com/random/400x200?jollof,discount',
    },
    {
      id: 'promo2',
      name: 'Free Delivery Tuesdays',
      description: 'Enjoy free delivery on all orders above ₦5,000 every Tuesday.',
      discountPercentage: 0,
      startDate: new Date(2025, 5, 10).toISOString(), // June 10, 2025
      endDate: new Date(2025, 5, 30).toISOString(),   // June 30, 2025
      isActive: true,
      appliesTo: 'total_order',
      minOrderValue: 5000,
      imageUrl: 'https://source.unsplash.com/random/400x200?delivery,promo',
    },
    {
      id: 'promo3',
      name: 'Early Bird Special',
      description: '10% off your entire order before 11 AM.',
      discountPercentage: 10,
      startDate: new Date(2025, 4, 1).toISOString(), // May 1, 2025
      endDate: new Date(2025, 4, 31).toISOString(), // May 31, 2025
      isActive: false, // Already expired
      appliesTo: 'total_order',
      imageUrl: 'https://source.unsplash.com/random/400x200?breakfast,offer',
    }
  ] as Promotion[]
};


// --- INITIAL STATE ---
const initialNewMealState = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: null as File | null,
}

const initialNewPromotionState: Omit<Promotion, 'id' | 'isActive'> = {
  name: "",
  description: "",
  discountPercentage: 0,
  startDate: "",
  endDate: "",
  appliesTo: 'all_meals',
  code: "",
  minOrderValue: undefined,
  imageUrl: "",
}

export default function ProfilePage() {
  // --- HOOKS ---
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { location, updateLocation, isLoading: locationLoading } = useLocation()

  // --- STATE MANAGEMENT ---
  // Loading & Saving States
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [following, setFollowing] = useState(false)
  const [addingMeal, setAddingMeal] = useState(false)
  const [creatingPromotion, setCreatingPromotion] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)


  // Profile Data States
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [restaurantProfile, setRestaurantProfile] = useState<RestaurantProfile | null>(null)

  // UI Control States
  const [editingProfile, setEditingProfile] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isMealDialogOpen, setIsMealDialogOpen] = useState(false)
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false)
  const [isNewPromotionDialogOpen, setIsNewPromotionDialogOpen] = useState(false)

  // Form Input States (for editing user/restaurant profile)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const [restaurantName, setRestaurantName] = useState("")
  const [restaurantDescription, setRestaurantDescription] = useState("")
  const [restaurantAddress, setRestaurantAddress] = useState("")
  const [restaurantPhone, setRestaurantPhone] = useState("")
  const [operatingHours, setOperatingHours] = useState("")
  const [cuisineType, setCuisineType] = useState("") // Restaurant-level category

  // New Meal Form States
  const [newMeal, setNewMeal] = useState(initialNewMealState)
  const [mealCategories, setMealCategories] = useState<string[]>([]) // State for meal categories
  const [newCategoryName, setNewCategoryName] = useState("") // State for adding new category

  // Status Posts States
  const [statusPosts, setStatusPosts] = useState<StatusPost[]>([])
  const [newStatusImage, setNewStatusImage] = useState<File | null>(null)
  const [newStatusCaption, setNewStatusCaption] = useState("")

  // Promotions States
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [newPromotion, setNewPromotion] = useState<Omit<Promotion, 'id' | 'isActive'>>(initialNewPromotionState)
  const [promotionStartDate, setPromotionStartDate] = useState<Date | undefined>(undefined)
  const [promotionEndDate, setPromotionEndDate] = useState<Date | undefined>(undefined)


  // --- DERIVED STATES / CONSTANTS ---
  const isVendor = session?.user?.role === "VENDOR"
  const isOwnProfile = session?.user?.id === (isVendor ? restaurantProfile?.id : userProfile?.id)

  // --- EFFECTS ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (status === "authenticated" && session?.user) {
      // Use dummy data directly
      setUserProfile({ ...dummyData.userProfile, id: session.user.id || dummyData.userProfile.id, name: session.user.name || dummyData.userProfile.name, email: session.user.email || dummyData.userProfile.email, image: session.user.image || dummyData.userProfile.image, role: session.user.role || dummyData.userProfile.role })

      if (session.user.role === "VENDOR") {
        setRestaurantProfile({ ...dummyData.restaurantProfile, id: session.user.id || dummyData.restaurantProfile.id, name: session.user.name || dummyData.restaurantProfile.name }) // Assuming vendor ID/name maps to restaurant
        setMealCategories(dummyData.restaurantProfile.mealCategories); // Initialize meal categories for vendor
        setPromotions(dummyData.promotions); // Initialize promotions for vendor
      }
      setStatusPosts(dummyData.statusPosts); // Initialize status posts with dummy data

      // Set initial form values
      setName(session.user.name || dummyData.userProfile.name)
      setBio(dummyData.userProfile.bio || "")
      setProfileImagePreview(session.user.image || dummyData.userProfile.image || null);

      if (session.user.role === "VENDOR" && dummyData.restaurantProfile) {
        setRestaurantName(dummyData.restaurantProfile.name || "")
        setRestaurantDescription(dummyData.restaurantProfile.description || "")
        setRestaurantAddress(dummyData.restaurantProfile.address || "")
        setRestaurantPhone(dummyData.restaurantProfile.phone || "")
        setCuisineType(dummyData.restaurantProfile.categories[0] || 'local')
        // setOperatingHours(dummyData.restaurantProfile.openingHours || ""); // If you have a specific dummy for this
      }

      setLoading(false) // Set loading to false once dummy data is loaded
    }
  }, [status, session, router])

  // Effect for profile image preview
  useEffect(() => {
    if (profileImageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(profileImageFile);
    } else if (!editingProfile) { // Clear preview when not editing and no file selected
        setProfileImagePreview(userProfile?.image || null);
    }
  }, [profileImageFile, editingProfile, userProfile?.image]);

  // Effect to update newPromotion start/end dates
  useEffect(() => {
    setNewPromotion((prev) => ({
      ...prev,
      startDate: promotionStartDate ? promotionStartDate.toISOString() : "",
      endDate: promotionEndDate ? promotionEndDate.toISOString() : "",
    }));
  }, [promotionStartDate, promotionEndDate]);


  // --- API / DATA FETCHING HANDLERS (These would be replaced by actual API calls) ---
  const simulateApiCall = async (data: any, success: boolean, delay = 500) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          resolve(data)
        } else {
          reject(new Error("Simulated API error"))
        }
      }, delay)
    })
  }

  const handleLocationUpdate = async () => {
    try {
      await simulateApiCall({ success: true }, true)
      await updateLocation()
      toast({
        title: "Location updated",
        description: "Your location has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating location:", error)
      toast({ title: "Error", description: "Failed to update location.", variant: "destructive" })
    }
  }

  const handleFollowToggle = async () => {
    if (!userProfile) return
    setFollowing(true)
    const currentlyFollowing = userProfile.isFollowing
    setUserProfile((prev) => {
      if (!prev) return null
      return {
        ...prev,
        isFollowing: !currentlyFollowing,
        followersCount: (prev.followersCount || 0) + (!currentlyFollowing ? 1 : -1),
      }
    })

    try {
      await simulateApiCall({ success: true }, true)
      toast({
        title: currentlyFollowing ? "Unfollowed" : "Followed",
        description: `You are now ${currentlyFollowing ? "unfollowing" : "following"} ${userProfile.name}.`,
      })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update follow status", variant: "destructive" })
      setUserProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          isFollowing: currentlyFollowing,
          followersCount: (prev.followersCount || 0) - (!currentlyFollowing ? 1 : -1),
        }
      })
    } finally {
      setFollowing(false)
    }
  }

  const saveUserProfile = async () => {
    setSaving(true)
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('bio', bio);
        if (profileImageFile) {
            formData.append('profileImage', profileImageFile);
        }
        // Replace with your actual API endpoint for profile update
        // const response = await fetch('/api/profile/update', {
        //     method: 'POST', // Or PATCH/PUT
        //     body: formData,
        // });
        // if (!response.ok) throw new Error("Failed to save profile");
        // const updatedData = await response.json();

        await simulateApiCall({
            name,
            bio,
            image: profileImagePreview || userProfile?.image,
        }, true);

      setUserProfile((prev) => prev ? { ...prev, name, bio, image: profileImagePreview || prev.image } : null)
      setEditingProfile(false)
      setProfileImageFile(null);
      toast({ title: "Success", description: "Profile updated successfully." })
    } catch (error) {
      console.error("Error saving user profile:", error);
      toast({ title: "Error", description: (error as Error).message || "Failed to save profile.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const saveRestaurantProfile = async () => {
    setSaving(true)
    try {
      await simulateApiCall({
        name: restaurantName,
        description: restaurantDescription,
        address: restaurantAddress,
        phone: restaurantPhone,
        categories: [cuisineType],
        openingHours: operatingHours
      }, true);
      setRestaurantProfile(prev => prev ? {
        ...prev,
        name: restaurantName,
        description: restaurantDescription,
        address: restaurantAddress,
        phone: restaurantPhone,
        categories: [cuisineType]
      } : null);
      toast({ title: "Success", description: "Restaurant profile updated." })
    } catch (error) {
      console.error("Error saving restaurant profile:", error);
      toast({ title: "Error", description: "Failed to save restaurant profile.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleAddMeal = async () => {
    setAddingMeal(true)
    try {
      if (!newMeal.name || !newMeal.price || !newMeal.category) {
        throw new Error("Meal name, price, and category are required.")
      }
      const newMealId = `meal-${Date.now()}`;
      const mealImage = newMeal.image ? URL.createObjectURL(newMeal.image) : 'https://source.unsplash.com/random/300x300?food,meal';

      await simulateApiCall({
          id: newMealId,
          name: newMeal.name,
          description: newMeal.description,
          price: parseFloat(newMeal.price),
          image: mealImage,
          categories: [newMeal.category], // Use selected category
          isAvailable: true,
      }, true);

      setRestaurantProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          meals: [...prev.meals, {
            id: newMealId,
            name: newMeal.name,
            description: newMeal.description,
            price: parseFloat(newMeal.price),
            image: mealImage,
            categories: [newMeal.category],
            isAvailable: true,
          }]
        };
      });

      setIsMealDialogOpen(false)
      setNewMeal(initialNewMealState)
      toast({ title: "Success", description: "Meal added successfully." })
    } catch (error: any) {
      console.error("Error adding meal:", error);
      toast({ title: "Error", description: error.message || "Failed to add meal.", variant: "destructive" })
    } finally {
      setAddingMeal(false)
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    const originalMeals = restaurantProfile?.meals || [];
    setRestaurantProfile(prev => {
      if (!prev) return null;
      return { ...prev, meals: prev.meals.filter(meal => meal.id !== mealId) };
    });
    try {
      await simulateApiCall({ success: true }, true);
      toast({ title: "Success", description: "Meal deleted successfully." })
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast({ title: "Error", description: "Failed to delete meal.", variant: "destructive" })
      setRestaurantProfile(prev => prev ? { ...prev, meals: originalMeals } : null);
    }
  }

  const handleToggleMealAvailability = async (mealId: string, currentStatus: boolean) => {
    setRestaurantProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        meals: prev.meals.map(meal =>
          meal.id === mealId ? { ...meal, isAvailable: !meal.isAvailable } : meal
        )
      };
    });
    try {
      await simulateApiCall({ success: true }, true);
    } catch (error) {
      console.error("Error toggling meal availability:", error);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" })
      setRestaurantProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          meals: prev.meals.map(meal =>
            meal.id === mealId ? { ...meal, isAvailable: currentStatus } : meal
          )
        };
      });
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setAddingCategory(true);
    try {
      // Simulate API call to add category
      await simulateApiCall({ category: newCategoryName }, true);

      // Add to local state
      setMealCategories(prev => {
        const updatedCategories = Array.from(new Set([...prev, newCategoryName.trim()])); // Ensure uniqueness
        return updatedCategories;
      });

      setRestaurantProfile(prev => {
        if (!prev) return null;
        const updatedMealCategories = Array.from(new Set([...prev.mealCategories, newCategoryName.trim()]));
        return { ...prev, mealCategories: updatedMealCategories };
      });

      setNewCategoryName("");
      setIsNewCategoryDialogOpen(false);
      toast({ title: "Success", description: "Meal category added successfully." });
    } catch (error) {
      console.error("Error adding category:", error);
      toast({ title: "Error", description: "Failed to add category.", variant: "destructive" });
    } finally {
      setAddingCategory(false);
    }
  };

  const addStatusPost = () => {
    if (!newStatusImage || !newStatusCaption) {
      toast({ title: "Error", description: "Image and caption are required for a status post.", variant: "destructive" });
      return;
    }

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
    setIsStatusDialogOpen(false)
    toast({ title: "Success", description: "Status posted successfully." });
  }

  const handleAddPromotion = async () => {
    setCreatingPromotion(true);
    try {
      if (!newPromotion.name || !newPromotion.description || !newPromotion.discountPercentage || !newPromotion.startDate || !newPromotion.endDate) {
        throw new Error("All promotion fields are required.");
      }
      if (new Date(newPromotion.startDate) > new Date(newPromotion.endDate)) {
        throw new Error("Start date cannot be after end date.");
      }

      const promotionId = `promo-${Date.now()}`;
      const newPromo: Promotion = {
        ...newPromotion,
        id: promotionId,
        isActive: new Date(newPromotion.endDate) > new Date(), // Set active based on end date
      };

      // Simulate API call
      await simulateApiCall(newPromo, true);

      setPromotions(prev => [newPromo, ...prev]);
      setNewPromotion(initialNewPromotionState);
      setPromotionStartDate(undefined);
      setPromotionEndDate(undefined);
      setIsNewPromotionDialogOpen(false);
      toast({ title: "Success", description: "Promotion created successfully." });
    } catch (error: any) {
      console.error("Error creating promotion:", error);
      toast({ title: "Error", description: error.message || "Failed to create promotion.", variant: "destructive" });
    } finally {
      setCreatingPromotion(false);
    }
  };

  const handleDeletePromotion = async (promoId: string) => {
    const originalPromotions = promotions;
    setPromotions(prev => prev.filter(promo => promo.id !== promoId));
    try {
      // Simulate API call
      await simulateApiCall({ success: true }, true);
      toast({ title: "Success", description: "Promotion deleted successfully." });
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast({ title: "Error", description: "Failed to delete promotion.", variant: "destructive" });
      setPromotions(originalPromotions); // Revert on error
    }
  };


  // --- RENDER LOGIC ---
  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!userProfile && !restaurantProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground font-medium">No profile data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/home" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="relative">
          <div className="h-40 md:h-48 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
            {isVendor && restaurantProfile?.images?.[0] && (
              <img
                src={restaurantProfile.images[0]}
                alt="Restaurant cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-16 md:-mt-20">
              <div className="bg-card rounded-2xl shadow-lg border border-border p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                  <div className="relative flex-shrink-0">
                    <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-card shadow-lg">
                      <AvatarImage src={profileImagePreview || userProfile?.image} alt={userProfile?.name} />
                      <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">
                        {userProfile?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isVendor && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md border-2 border-card">
                        <Store className="h-4 w-4" />
                      </div>
                    )}
                    {editingProfile && isOwnProfile && (
                       <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 rounded-full h-9 w-9 border-2 border-card bg-background flex items-center justify-center cursor-pointer shadow-md">
                         <Camera className="h-4 w-4" />
                         <Input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setProfileImageFile(e.target.files[0]);
                                }
                            }}
                         />
                       </label>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {editingProfile ? (
                          <div className="space-y-3">
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="text-2xl font-bold"/>
                            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Your bio..." className="resize-none" rows={3}/>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{userProfile?.name}</h1>
                              {isVendor && <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20"><ChefHat className="h-3 w-3 mr-1" />Restaurant</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{userProfile?.bio}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              {userProfile?.location?.address && (
                                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /><span>{userProfile.location.address}</span></div>
                              )}
                              {isVendor && restaurantProfile?.phone && (
                                <div className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-primary" /><span>{restaurantProfile.phone}</span></div>
                              )}
                              <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /><span>Joined March 2024</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 gap-2">
                        {isOwnProfile ? (
                          editingProfile ? (
                            <>
                              <Button onClick={saveUserProfile} disabled={saving} className="rounded-lg">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save
                              </Button>
                              <Button variant="outline" onClick={() => { setEditingProfile(false); setProfileImageFile(null); setProfileImagePreview(userProfile?.image || null); }} className="rounded-lg">Cancel</Button>
                            </>
                          ) : (
                           <>
                            <Button onClick={() => setEditingProfile(true)}
                            variant="outline"
                            size = "sm"
                            className="rounded-lg">
                              <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={handleLocationUpdate}
                              disabled={locationLoading} >
                             <MapPin className="h-4 w-4" />{locationLoading ? "Updating..." : "Update Location"}
                            </Button>
                           </>
                          )
                        ) : (
                          <Button onClick={handleFollowToggle} disabled={following} variant={userProfile?.isFollowing ? "outline" : "default"} className="rounded-lg w-28">
                            {following ? <Loader2 className="h-4 w-4 animate-spin" /> : (userProfile?.isFollowing ? 'Following' : 'Follow')}
                          </Button>

                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
                      <div className=""><div className="text-2xl font-bold text-foreground">{isVendor ? restaurantProfile?.meals?.length || 0 : userProfile?.favorites?.length || 0}</div><div className="text-xs text-muted-foreground uppercase tracking-wider">{isVendor ? "Dishes" : "Saved"}</div></div>
                      <div className=""><div className="text-2xl font-bold text-foreground">{userProfile?.followersCount || 0}</div><div className="text-xs text-muted-foreground uppercase tracking-wider">Followers</div></div>
                      <div className=""><div className="text-2xl font-bold text-foreground">{userProfile?.followingCount || 0}</div><div className="text-xs text-muted-foreground uppercase tracking-wider">Following</div></div>
                      <div className=""><div className="text-2xl font-bold text-foreground">{isVendor ? restaurantProfile?.rating || "4.5" : userProfile?.recentOrders?.length || 0}</div><div className="text-xs text-muted-foreground uppercase tracking-wider">{isVendor ? "Rating" : "Orders"}</div></div>
                    </div>

                    {((isVendor && restaurantProfile?.categories) || (!isVendor && userProfile?.preferences)) && (
                      <div className="mt-4 pt-4 border-t border-border"><div className="flex flex-wrap gap-2">
                        {isVendor ? restaurantProfile?.categories?.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)
                          : userProfile?.preferences?.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}
                      </div></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex overflow-x-scroll no-scrollbar bg-card rounded-lg border border-border mb-6 px-auto">
              {/* TABS LIST */}
              <TabsList className="bg-transparent gap-1 whitespace-nowrap px-2 sm:px-0">
                <TabsTrigger value="overview" className="flex-shrink-0">Overview</TabsTrigger>
                <TabsTrigger value="saved" className="flex-shrink-0">{isVendor ? "Menu" : "Saved"}</TabsTrigger>
                <TabsTrigger value="status" className="flex-shrink-0">{isVendor ? "Analytics" : "Status"}</TabsTrigger>
                <TabsTrigger value="history" className="flex-shrink-0">{isVendor ? "Customers" : "History"}</TabsTrigger>
                {isVendor && <TabsTrigger value="promotions" className="flex-shrink-0">Promotions</TabsTrigger>}
              </TabsList>
            </div>

            {/* --- TABS CONTENT --- */}

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {isVendor ? (
                <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4"><CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2"><Store className="h-5 w-5" />Restaurant Information</CardTitle></div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2"><Label>Restaurant Name</Label><Input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Phone Number</Label><Input value={restaurantPhone} onChange={(e) => setRestaurantPhone(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Cuisine Type</Label>
                          <Select value={cuisineType} onValueChange={setCuisineType}>
                            <SelectTrigger><SelectValue placeholder="Select cuisine type" /></SelectTrigger>
                            <SelectContent><SelectItem value="local">Local Nigerian</SelectItem><SelectItem value="continental">Continental</SelectItem><SelectItem value="asian">Asian</SelectItem><SelectItem value="intercontinental">Intercontinental</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2"><Label>Address</Label><Input value={restaurantAddress} onChange={(e) => setRestaurantAddress(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Operating Hours</Label><Input value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} placeholder="e.g., 9:00 AM - 10:00 PM" /></div>
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={restaurantDescription} onChange={(e) => setRestaurantDescription(e.target.value)} placeholder="Tell customers about your restaurant..." rows={4} /></div>
                    <Button onClick={saveRestaurantProfile} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save Changes</Button>
                  </CardContent>
                </Card>
              ) : (
                 <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4"><CardTitle className="text-lg font-bold text-primary-foreground">Profile Summary</CardTitle></div>
                  <CardContent className="p-6">
                     <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-secondary/50 rounded-lg">
                           <div className="bg-primary text-primary-foreground p-3 rounded-full w-fit mx-auto mb-2"><DollarSign className="h-6 w-6" /></div>
                           <div className="text-2xl font-bold text-foreground">₦{userProfile?.budget?.toLocaleString() || "2,500"}</div>
                           <div className="text-sm text-muted-foreground">Budget Range</div>
                        </div>
                        <div className="text-center p-4 bg-secondary/50 rounded-lg">
                           <div className="bg-primary text-primary-foreground p-3 rounded-full w-fit mx-auto mb-2"><Heart className="h-6 w-6" /></div>
                           <div className="text-2xl font-bold text-foreground">{userProfile?.favorites?.length || 0}</div>
                           <div className="text-sm text-muted-foreground">Saved Places</div>
                        </div>
                        <div className="text-center p-4 bg-secondary/50 rounded-lg">
                           <div className="bg-primary text-primary-foreground p-3 rounded-full w-fit mx-auto mb-2"><MapPin className="h-6 w-6" /></div>
                           <div className="text-2xl font-bold text-foreground">{userProfile?.visitedRestaurants?.length || 0}</div>
                           <div className="text-sm text-muted-foreground">Places Visited</div>
                        </div>
                     </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Saved/Menu Tab */}
            <TabsContent value="saved" className="mt-0">
              {isVendor ? (
                <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                   <div className="bg-primary p-4 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2"><Utensils className="h-5 w-5" />Menu Management</CardTitle>
                        <p className="text-sm text-primary-foreground/80 mt-1">Add and manage your dishes</p>
                      </div>
                      <div className="flex gap-2">
                         <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
                            <DialogTrigger asChild><Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"><BookA className="h-4 w-4 mr-2" />Add Category</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                               <DialogHeader><DialogTitle>Add New Meal Category</DialogTitle><DialogDescription>Categorize your dishes for easier Browse.</DialogDescription></DialogHeader>
                               <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                     <Label htmlFor="category-name">Category Name</Label>
                                     <Input id="category-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Soups, Swallows" />
                                  </div>
                               </div>
                               <DialogFooter><Button onClick={handleAddCategory} disabled={addingCategory}>{addingCategory && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Category</Button></DialogFooter>
                            </DialogContent>
                         </Dialog>
                         <Dialog open={isMealDialogOpen} onOpenChange={setIsMealDialogOpen}>
                            <DialogTrigger asChild><Button variant="secondary"><Plus className="h-4 w-4 mr-2" />Add Dish</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                               <DialogHeader><DialogTitle>Add New Dish</DialogTitle><DialogDescription>Fill in the details for your new dish.</DialogDescription></DialogHeader>
                               <div className="grid gap-4 py-4">
                                 <div className="space-y-2"><Label>Dish Name</Label><Input value={newMeal.name} onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })} /></div>
                                 <div className="space-y-2"><Label>Price (₦)</Label><Input type="number" value={newMeal.price} onChange={(e) => setNewMeal({ ...newMeal, price: e.target.value })} /></div>
                                 <div className="space-y-2"><Label>Category</Label>
                                    <Select value={newMeal.category} onValueChange={(v) => setNewMeal({ ...newMeal, category: v })}>
                                       <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                       <SelectContent>
                                          {mealCategories.map((category) => (
                                             <SelectItem key={category} value={category}>{category}</SelectItem>
                                          ))}
                                          {/* Add a default if no categories are present initially or offer a way to create one from here */}
                                          {mealCategories.length === 0 && <SelectItem value="" disabled>No categories available. Add one first!</SelectItem>}
                                       </SelectContent>
                                    </Select>
                                 </div>
                                 <div className="space-y-2"><Label>Description</Label><Textarea value={newMeal.description} onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })} /></div>
                                 <div className="space-y-2">
                                   <Label>Dish Image</Label>
                                   <Input type="file" accept="image/*" onChange={(e) => setNewMeal({ ...newMeal, image: e.target.files ? e.target.files[0] : null })} />
                                   {newMeal.image && <img src={URL.createObjectURL(newMeal.image)} alt="Dish Preview" className="w-24 h-24 object-cover rounded-md mt-2" />}
                                 </div>
                               </div>
                               <DialogFooter><Button onClick={handleAddMeal} disabled={addingMeal}>{addingMeal && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Dish</Button></DialogFooter>
                            </DialogContent>
                         </Dialog>
                      </div>
                   </div>
                   <CardContent className="p-6">
                      <div className="space-y-4">
                        {restaurantProfile?.meals && restaurantProfile.meals.length > 0 ? (
                           restaurantProfile.meals.map((meal) => (
                              <div key={meal.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border">
                                 <img src={meal.image || "/placeholder.svg"} alt={meal.name} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
                                 <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">{meal.name}</h3>
                                    <p className="text-primary font-medium">₦{meal.price.toLocaleString()}</p>
                                    {meal.categories?.[0] && <Badge variant="outline" className="mt-1">{meal.categories[0]}</Badge>}
                                 </div>
                                 <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground hidden sm:inline">Available</span><Switch checked={meal.isAvailable} onCheckedChange={() => handleToggleMealAvailability(meal.id, meal.isAvailable)} /></div>
                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteMeal(meal.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="text-center py-12 text-muted-foreground"><div className="bg-secondary rounded-full p-4 w-fit mx-auto mb-4"><Utensils className="h-12 w-12 text-muted-foreground" /></div><h3 className="font-semibold text-foreground mb-1">No dishes yet</h3><p className="text-sm">Add your first dish to build your menu.</p></div>
                        )}
                      </div>
                   </CardContent>
                </Card>
              ) : (
                <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4"><CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2"><Heart className="h-5 w-5" />Saved Restaurants</CardTitle></div>
                  <CardContent className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {userProfile?.favorites && userProfile.favorites.length > 0 ? (
                          userProfile.favorites.map((fav) => (
                            <div key={fav.id} className="bg-muted/50 rounded-lg p-4 border flex gap-4">
                              <img src={fav.restaurant.images[0]} alt={fav.restaurant.name} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
                              <div className="flex-1"><h3 className="font-semibold text-foreground">{fav.restaurant.name}</h3><div className="flex items-center gap-1 mt-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="text-sm text-muted-foreground">{fav.restaurant.rating}</span></div></div>
                              <Button size="sm" variant="outline" asChild><Link href={`/restaurant/${fav.restaurant.id}`}>Visit</Link></Button>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12 text-muted-foreground"><div className="bg-secondary rounded-full p-4 w-fit mx-auto mb-4"><Heart className="h-12 w-12 text-muted-foreground" /></div><h3 className="font-semibold text-foreground mb-1">No saved items</h3><p className="text-sm">Explore and save your favorite spots!</p></div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Status Tab (User) / Analytics Tab (Vendor) */}
            <TabsContent value="status" className="mt-0">
              {isVendor ? (
                <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4"><CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2"><TrendingUp className="h-5 w-5" />Analytics Overview</CardTitle></div>
                  <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Sales Performance</h3>
                      <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                        <div><div className="text-3xl font-bold">₦250,000</div><div className="text-sm text-muted-foreground">Total Revenue (Last 30 Days)</div></div>
                        <DollarSign className="h-8 w-8 text-primary" />
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                        <div><div className="text-3xl font-bold">120</div><div className="text-sm text-muted-foreground">Total Orders (Last 30 Days)</div></div>
                        <Clock className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Engagement Metrics</h3>
                      <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                        <div><div className="text-3xl font-bold">4.9 <Star className="h-6 w-6 inline fill-yellow-400 text-yellow-400 -mt-1" /></div><div className="text-sm text-muted-foreground">Average Rating</div></div>
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                        <div><div className="text-3xl font-bold">512</div><div className="text-sm text-muted-foreground">Total Reviews</div></div>
                        <Eye className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4 flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2"><Clock className="h-5 w-5" />Your Status Updates</CardTitle>
                      <p className="text-sm text-primary-foreground/80 mt-1">Share what you're eating or where you're dining!</p>
                    </div>
                    <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                      <DialogTrigger asChild><Button variant="secondary"><Plus className="h-4 w-4 mr-2" />Add Status</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader><DialogTitle>Create New Status</DialogTitle><DialogDescription>Share a quick update with your followers.</DialogDescription></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="status-caption">Caption</Label>
                            <Textarea id="status-caption" placeholder="What's cooking?" value={newStatusCaption} onChange={(e) => setNewStatusCaption(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Image</Label>
                            <Input type="file" accept="image/*" onChange={(e) => setNewStatusImage(e.target.files ? e.target.files[0] : null)} />
                            {newStatusImage && <img src={URL.createObjectURL(newStatusImage)} alt="Preview" className="w-24 h-24 object-cover rounded-md mt-2" />}
                          </div>
                        </div>
                        <DialogFooter><Button onClick={addStatusPost}>Post Status</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {statusPosts.length > 0 ? (
                        statusPosts.map((post) => (
                          <Card key={post.id} className="overflow-hidden rounded-lg shadow-sm">
                            <img src={post.image} alt="Status image" className="w-full h-40 object-cover" />
                            <CardContent className="p-4">
                              <p className="text-sm text-foreground mb-2 line-clamp-2">{post.caption}</p>
                              <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                          <div className="bg-secondary rounded-full p-4 w-fit mx-auto mb-4"><Clock className="h-12 w-12 text-muted-foreground" /></div>
                          <h3 className="font-semibold text-foreground mb-1">No status updates yet</h3>
                          <p className="text-sm">Share your food adventures!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* History Tab (User) / Customers Tab (Vendor) */}
            <TabsContent value="history" className="mt-0">
              {isVendor ? (
                <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4"><CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2"><Users className="h-5 w-5" />Customer Insights</CardTitle></div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Mock Customer Data */}
                      {restaurantProfile?.reviewCount > 0 ? ( // Use reviewCount as a proxy for customer interaction
                        <>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Avatar><AvatarImage src="https://api.dicebear.com/7.x/lorelei/svg?seed=Customer1" /><AvatarFallback>JD</AvatarFallback></Avatar>
                              <div><p className="font-semibold">Jane Doe</p><p className="text-sm text-muted-foreground">Last Order: 2 days ago</p></div>
                            </div>
                            <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-2" />Engage</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Avatar><AvatarImage src="https://api.dicebear.com/7.x/lorelei/svg?seed=Customer2" /><AvatarFallback>JS</AvatarFallback></Avatar>
                              <div><p className="font-semibold">John Smith</p><p className="text-sm text-muted-foreground">Last Order: 1 week ago</p></div>
                            </div>
                            <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-2" />Engage</Button>
                          </div>
                           <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Avatar><AvatarImage src="https://api.dicebear.com/7.x/lorelei/svg?seed=Customer3" /><AvatarFallback>AM</AvatarFallback></Avatar>
                              <div><p className="font-semibold">Aisha Musa</p><p className="text-sm text-muted-foreground">Last Order: 4 days ago</p></div>
                            </div>
                            <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-2" />Engage</Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <div className="bg-secondary rounded-full p-4 w-fit mx-auto mb-4"><Users className="h-12 w-12 text-muted-foreground" /></div>
                          <h3 className="font-semibold text-foreground mb-1">No customer data yet</h3>
                          <p className="text-sm">Start getting orders to see your customers here.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4"><CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2"><Clock className="h-5 w-5" />Order History</CardTitle></div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {userProfile?.recentOrders && userProfile.recentOrders.length > 0 ? (
                        userProfile.recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border">
                            <img src={order.restaurant.images[0]} alt={order.restaurant.name} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{order.restaurant.name}</h3>
                              <p className="text-sm text-muted-foreground">Total: ₦{order.total.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button size="sm" variant="outline" asChild><Link href={`/order/${order.id}`}>View</Link></Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <div className="bg-secondary rounded-full p-4 w-fit mx-auto mb-4"><Clock className="h-12 w-12 text-muted-foreground" /></div>
                          <h3 className="font-semibold text-foreground mb-1">No past orders</h3>
                          <p className="text-sm">Start ordering to see your history here!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Promotions Tab (Vendor only) */}
            {isVendor && (
              <TabsContent value="promotions" className="mt-0">
                <Card className="shadow-sm border-border rounded-lg overflow-hidden">
                  <div className="bg-primary p-4 flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-bold text-primary-foreground flex items-center gap-2"><Award className="h-5 w-5" />Promotions & Offers</CardTitle>
                      <p className="text-sm text-primary-foreground/80 mt-1">Create and manage exciting promotions for your customers!</p>
                    </div>
                    <Dialog open={isNewPromotionDialogOpen} onOpenChange={setIsNewPromotionDialogOpen}>
                      <DialogTrigger asChild><Button variant="secondary"><Plus className="h-4 w-4 mr-2" />New Promotion</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader><DialogTitle>Create New Promotion</DialogTitle><DialogDescription>Define the details of your special offer.</DialogDescription></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="promo-name">Promotion Name</Label>
                            <Input id="promo-name" value={newPromotion.name} onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })} placeholder="e.g., Weekend Feast Discount" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="promo-description">Description</Label>
                            <Textarea id="promo-description" value={newPromotion.description} onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })} placeholder="Briefly describe the promotion..." />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="discount-percentage">Discount Percentage</Label>
                              <Input id="discount-percentage" type="number" value={newPromotion.discountPercentage} onChange={(e) => setNewPromotion({ ...newPromotion, discountPercentage: parseFloat(e.target.value) || 0 })} placeholder="e.g., 10" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="promo-code">Promo Code (Optional)</Label>
                              <Input id="promo-code" value={newPromotion.code || ''} onChange={(e) => setNewPromotion({ ...newPromotion, code: e.target.value })} placeholder="e.g., SAVEBIG" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="start-date">Start Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !promotionStartDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {promotionStartDate ? format(promotionStartDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                {/* Implement Calendar from a date picker component like react-day-picker */}
                                {/* For now, just simulating with a simple text input */}
                                <PopoverContent className="w-auto p-0">
                                   {/* Placeholder for a date picker, you'd integrate react-day-picker here */}
                                   <Input type="date" onChange={(e) => setPromotionStartDate(new Date(e.target.value))} />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="end-date">End Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !promotionEndDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {promotionEndDate ? format(promotionEndDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  {/* Placeholder for a date picker */}
                                  <Input type="date" onChange={(e) => setPromotionEndDate(new Date(e.target.value))} />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="applies-to">Applies To</Label>
                              <Select value={newPromotion.appliesTo} onValueChange={(val) => setNewPromotion(prev => ({ ...prev, appliesTo: val as Promotion['appliesTo'] }))}>
                                <SelectTrigger><SelectValue placeholder="Select where it applies" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all_meals">All Meals</SelectItem>
                                  <SelectItem value="specific_meals">Specific Meals</SelectItem>
                                  <SelectItem value="total_order">Total Order</SelectItem>
                                </SelectContent>
                              </Select>
                          </div>
                          {newPromotion.appliesTo === 'total_order' && (
                             <div className="space-y-2">
                               <Label htmlFor="min-order-value">Minimum Order Value (₦)</Label>
                               <Input id="min-order-value" type="number" value={newPromotion.minOrderValue || ''} onChange={(e) => setNewPromotion({ ...newPromotion, minOrderValue: parseFloat(e.target.value) || undefined })} placeholder="e.g., 5000" />
                             </div>
                          )}
                          <div className="space-y-2">
                             <Label htmlFor="promo-image">Promotion Image URL (Optional)</Label>
                             <Input id="promo-image" value={newPromotion.imageUrl || ''} onChange={(e) => setNewPromotion({ ...newPromotion, imageUrl: e.target.value })} placeholder="URL for banner image" />
                             {newPromotion.imageUrl && <img src={newPromotion.imageUrl} alt="Promotion Preview" className="w-full h-32 object-cover rounded-md mt-2" />}
                          </div>
                        </div>
                        <DialogFooter><Button onClick={handleAddPromotion} disabled={creatingPromotion}>{creatingPromotion && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Promotion</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {promotions.length > 0 ? (
                        promotions.map((promo) => (
                          <Card key={promo.id} className={cn("overflow-hidden rounded-lg shadow-sm", { "border-green-500/50 bg-green-50": promo.isActive })}>
                            {promo.imageUrl && <img src={promo.imageUrl} alt={promo.name} className="w-full h-32 object-cover" />}
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-foreground text-lg">{promo.name}</h3>
                                <Badge variant={promo.isActive ? "default" : "secondary"}>
                                  {promo.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{promo.description}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Percent className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-primary">{promo.discountPercentage}% OFF</span>
                                {promo.code && (
                                  <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">CODE: {promo.code}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarDays className="h-3 w-3" />
                                <span>{format(new Date(promo.startDate), "MMM dd")} - {format(new Date(promo.endDate), "MMM dd, yyyy")}</span>
                              </div>
                               {promo.appliesTo === 'total_order' && promo.minOrderValue && (
                                <p className="text-xs text-muted-foreground mt-1">Min. Order: ₦{promo.minOrderValue.toLocaleString()}</p>
                               )}
                              <div className="flex justify-end gap-2 mt-4">
                                {/* Add an Edit button here if needed */}
                                <Button variant="ghost" size="icon" onClick={() => handleDeletePromotion(promo.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <div className="bg-secondary rounded-full p-4 w-fit mx-auto mb-4"><Award className="h-12 w-12 text-muted-foreground" /></div>
                          <h3 className="font-semibold text-foreground mb-1">No active promotions</h3>
                          <p className="text-sm">Create new promotions to attract more customers!</p>
                          <Button className="mt-4" onClick={() => setIsNewPromotionDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create New Promotion</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
