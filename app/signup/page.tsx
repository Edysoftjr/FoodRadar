"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Loader2 } from "lucide-react"
import { GoogleSignInButton } from "@/components/google-signin-button"
import { useAuth } from "@/components/auth-provider"
import { useLocation } from "@/components/location-provider"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function SignUpPage() {
  const { signUp, loading: authLoading } = useAuth()
  const { location, updateLocation } = useLocation()
  const { toast } = useToast()

  const [role, setRole] = useState("user")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [description, setDescription] = useState("")
  const [budget, setBudget] = useState(2500)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [detectingLocation, setDetectingLocation] = useState(false)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!name.trim()) errors.name = "Name is required"
    if (!email.trim()) errors.email = "Email is required"
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email is invalid"
    if (!password) errors.password = "Password is required"
    if (password.length < 6) errors.password = "Password must be at least 6 characters"
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match"

    if (role === "vendor") {
      if (!restaurantName.trim()) errors.restaurantName = "Restaurant name is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await signUp(email, password, name, role as "user" | "vendor")
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
    setDetectingLocation(true)
    try {
      await updateLocation()
      toast({
        title: "Location detected",
        description: location.address || "Your location has been updated",
      })
    } catch (error: any) {
      console.error("Location detection error:", error)
      toast({
        title: "Location detection failed",
        description: error.message || "Please check your location settings and try again",
        variant: "destructive",
      })
    } finally {
      setDetectingLocation(false)
    }
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
          <Tabs defaultValue="user" className="mb-6" onValueChange={setRole}>
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="user" className="rounded-full">
                Normal User
              </TabsTrigger>
              <TabsTrigger value="vendor" className="rounded-full">
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

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="Your location"
                  value={location.address || ""}
                  readOnly
                  className="flex-1 rounded-full"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="rounded-full"
                >
                  {detectingLocation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : location.address ? (
                    "Update"
                  ) : (
                    "Detect"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">We need your location to show nearby restaurants</p>
            </div>

            {role === "user" && (
              <div className="space-y-2">
                <Label>Budget Range (₦)</Label>
                <div className="pt-4">
                  <Slider value={[budget]} max={10000} step={500} onValueChange={(value) => setBudget(value[0])} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₦1,000</span>
                  <span>₦{budget.toLocaleString()}</span>
                  <span>₦10,000</span>
                </div>
              </div>
            )}

            {role === "vendor" && (
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
                  <Label htmlFor="description">Restaurant Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your restaurant, cuisine type, etc."
                    rows={3}
                    className="rounded-lg"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full rounded-full" disabled={authLoading}>
              {authLoading ? "Creating Account..." : "Sign Up"}
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
