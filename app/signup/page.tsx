"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Loader2, Navigation, AlertCircle, CheckCircle } from "lucide-react"
import { GoogleSignInButton } from "@/components/google-signin-button"
import { useAuth } from "@/components/auth-provider"
import { useLocation } from "@/components/location-provider"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignUpPage() {
  const { signUp, loading: authLoading, user } = useAuth()
  const { location, updateLocation, requestLocationPermission, isLoading: locationLoading } = useLocation()
  const { toast } = useToast()
  const router = useRouter()

  const [role, setRole] = useState("USER")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [description, setDescription] = useState("")
  const [budget, setBudget] = useState(2500)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [pageLoading, setPageLoading] = useState(true)
  const [locationError, setLocationError] = useState<string>("")
  const [locationSuccess, setLocationSuccess] = useState<boolean>(false)

  // Redirect if user is already logged in
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.push("/home")
      } else {
        setPageLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [user, router])

  // Monitor location changes
  useEffect(() => {
    if (location.latitude && location.longitude) {
      setLocationSuccess(true)
      setLocationError("")
    }
  }, [location])
  
  console.log(location);
  
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!name.trim()) errors.name = "Name is required"
    if (!email.trim()) errors.email = "Email is required"
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email is invalid"
    if (!password) errors.password = "Password is required"
    if (password.length < 6) errors.password = "Password must be at least 6 characters"
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match"

    if (role === "VENDOR") {
      if (!restaurantName.trim()) errors.restaurantName = "Restaurant name is required"
    }

    // Location validation - make it required
    if (!location.latitude || !location.longitude) {
      errors.location = "Location is required. Please detect your location to continue."
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      // Include location data in signup
      const userData = {
        email,
        password,
        name,
        role: role as "USER" | "VENDOR",
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          neighborhood: location.neighborhood,
          city: location.city,
        },
        // Include role-specific data
        ...(role === "VENDOR" && {
          restaurantName,
          description,
        }),
        ...(role === "USER" && {
          budget,
        }),
      }

      await signUp(userData.email, userData.password, userData.name, userData.role)
      
      toast({
        title: "Account created successfully!",
        description: `Welcome to FoodRadar! Your location (${location.neighborhood || location.city}) has been saved.`,
      })
      
      router.push("/home")
    } catch (error: any) {
      console.error("Sign up error:", error)
      toast({
        title: "Sign up failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      })
    }
  }

  const handleDetectLocation = async () => {
    setLocationError("")
    setLocationSuccess(false)

    try {
      // First, request location permission explicitly
      await requestLocationPermission()
      
      // Then update location
      await updateLocation()
      
      // Success state will be handled by useEffect monitoring location changes
    } catch (error: any) {
      console.error("Location detection error:", error)
      setLocationError(error.message || "Failed to detect location")
      
      toast({
        title: "Location detection failed",
        description: error.message || "Please check your location settings and try again",
        variant: "destructive",
      })
    }
  }

  // Location status component
  const LocationStatus = () => {
    if (locationLoading) {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800">
            Detecting your location... This may take a few moments for high accuracy.
          </AlertDescription>
        </Alert>
      )
    }

    if (locationError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )
    }

    if (locationSuccess && location.latitude) {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div>
              <strong>Location detected:</strong> {location.neighborhood || location.city}
              {location.accuracy && (
                <div className="text-xs mt-1">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-4 md:py-8 gradient-bg px-4">
      <Link href="/" className="mb-6 md:mb-8 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">FoodRadar</span>
      </Link>

      <Card className="w-full max-w-md rounded-xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join FoodRadar to discover restaurants and meals within your budget.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="USER" className="mb-6" onValueChange={setRole}>
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="USER" className="rounded-full">
                Normal User
              </TabsTrigger>
              <TabsTrigger value="VENDOR" className="rounded-full">
                Restaurant Owner
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                className="rounded-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="rounded-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="rounded-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="rounded-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {formErrors.confirmPassword && <p className="text-xs text-destructive">{formErrors.confirmPassword}</p>}
            </div>

            {/* Enhanced Location Section */}
            <div className="space-y-3">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder={
                      locationLoading 
                        ? "Detecting location..." 
                        : location.neighborhood || "Click detect to find your location"
                    }
                    value={location.neighborhood || ""}
                    readOnly
                    className="flex-1 rounded-full"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDetectLocation}
                    disabled={locationLoading}
                    className="rounded-full px-4"
                  >
                    {locationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">
                      {locationLoading 
                        ? "Detecting..." 
                        : locationSuccess 
                          ? "Update" 
                          : "Detect"
                      }
                    </span>
                  </Button>
                </div>

                {/* Location Status Alert */}
                <LocationStatus />

                <p className="text-xs text-muted-foreground">
                  We need your precise location to show nearby restaurants and calculate delivery options.
                </p>
              </div>
              
              {formErrors.location && <p className="text-xs text-destructive">{formErrors.location}</p>}
            </div>

            {role === "USER" && (
              <div className="space-y-2">
                <Label>Budget Range (₦)</Label>
                <div className="pt-4">
                  <Slider value={[budget]} max={10000} step={500} onValueChange={(value) => setBudget(value[0])} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₦1,000</span>
                  <span className="font-medium">₦{budget.toLocaleString()}</span>
                  <span>₦10,000</span>
                </div>
              </div>
            )}

            {role === "VENDOR" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    placeholder="Enter your restaurant name"
                    className="rounded-full"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                  {formErrors.restaurantName && <p className="text-xs text-destructive">{formErrors.restaurantName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Restaurant Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your restaurant, cuisine type, specialties..."
                    rows={3}
                    className="rounded-lg"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full rounded-full" 
              disabled={authLoading || locationLoading || (!location.latitude && !location.longitude)}
            >
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary underline underline-offset-4">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
