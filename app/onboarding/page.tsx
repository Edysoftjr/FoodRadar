"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MapPin, ArrowRight, Check } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-auth"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [preferences, setPreferences] = useState<string[]>([])
  const [budget, setBudget] = useState(2500)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const foodPreferences = [
    { id: "spicy", label: "Spicy" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "local", label: "Local Cuisine" },
    { id: "continental", label: "Continental" },
    { id: "fastfood", label: "Fast Food" },
    { id: "seafood", label: "Seafood" },
    { id: "desserts", label: "Desserts" },
    { id: "healthy", label: "Healthy Options" },
  ]

  const togglePreference = (id: string) => {
    setPreferences((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const enableLocation = () => {
    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationEnabled(true)
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Could not get your location. Please check your settings.",
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      })
    }
  }

  const completeOnboarding = async () => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to complete onboarding.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Update user preferences in the database
      const { error } = await supabaseClient
        .from("users")
        .update({
          preferences: preferences,
          budget: budget,
          onboarding_completed: true,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Onboarding complete!",
        description: "Your preferences have been saved.",
      })

      router.push("/home")
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-8 gradient-bg">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">FoodRadar</span>
      </Link>

      <div className="mb-8 flex w-full max-w-md justify-between">
        <div className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "border bg-muted"}`}
          >
            {step > 1 ? <Check className="h-4 w-4" /> : 1}
          </div>
          <div className={`mx-2 h-1 w-12 ${step > 1 ? "bg-primary" : "bg-muted"}`}></div>
        </div>
        <div className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "border bg-muted"}`}
          >
            {step > 2 ? <Check className="h-4 w-4" /> : 2}
          </div>
          <div className={`mx-2 h-1 w-12 ${step > 2 ? "bg-primary" : "bg-muted"}`}></div>
        </div>
        <div className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "border bg-muted"}`}
          >
            3
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 1 && "Food Preferences"}
            {step === 2 && "Budget Range"}
            {step === 3 && "Enable Location"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Select the types of food you enjoy"}
            {step === 2 && "Set your average meal budget"}
            {step === 3 && "Allow us to find restaurants near you"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {foodPreferences.map((pref) => (
                <div key={pref.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={pref.id}
                    checked={preferences.includes(pref.id)}
                    onCheckedChange={() => togglePreference(pref.id)}
                  />
                  <Label htmlFor={pref.id}>{pref.label}</Label>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Budget per meal (₦)</Label>
                  <span className="font-medium">₦{budget.toLocaleString()}</span>
                </div>
                <Slider
                  value={[budget]}
                  min={500}
                  max={10000}
                  step={100}
                  onValueChange={(value) => setBudget(value[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₦500</span>
                  <span>₦5,000</span>
                  <span>₦10,000</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium">What this means:</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'll prioritize restaurants with meals around ₦{budget.toLocaleString()} in your feed.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                  <MapPin className="h-12 w-12 text-primary" />
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium">Why we need your location:</h4>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Find restaurants within your specified radius</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Calculate accurate distance and delivery times</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Provide better recommendations based on your area</span>
                  </li>
                </ul>
              </div>

              <Button onClick={enableLocation} className="w-full rounded-full" disabled={locationEnabled}>
                {locationEnabled ? "Location Enabled" : "Enable Location"}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} className="rounded-full">
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <Button onClick={nextStep} className="rounded-full">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={completeOnboarding} disabled={!locationEnabled || loading} className="rounded-full">
              {loading ? "Saving..." : "Finish"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
