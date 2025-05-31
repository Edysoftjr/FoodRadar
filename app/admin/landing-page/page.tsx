"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Trash2, ImagePlus } from "lucide-react"
import { uploadImage } from "@/lib/supabase"

export default function LandingPageManager() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [featuredRestaurants, setFeaturedRestaurants] = useState<any[]>([])
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Fetch current landing page settings
    const fetchLandingPageSettings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/landing-page")

        if (!response.ok) {
          throw new Error("Failed to fetch landing page settings")
        }

        const data = await response.json()
        setFeaturedRestaurants(data.featuredRestaurants || [])
        setHeroImage(data.heroImage || null)
      } catch (err) {
        setError("Error loading landing page settings")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLandingPageSettings()
  }, [])

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      const imageUrl = await uploadImage(file, "landing-page", "hero")

      if (!imageUrl) {
        throw new Error("Failed to upload image")
      }

      // Save the hero image URL to the database
      const response = await fetch("/api/admin/landing-page/hero", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to save hero image")
      }

      setHeroImage(imageUrl)
      setSuccess("Hero image updated successfully")
      router.refresh()
    } catch (err) {
      setError("Error uploading hero image")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleFeaturedRestaurantChange = async (restaurantId: string, action: "add" | "remove") => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/admin/landing-page/featured", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restaurantId, action }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} featured restaurant`)
      }

      // Update the local state based on the action
      if (action === "add") {
        // Fetch the restaurant details and add to featured list
        const restaurantResponse = await fetch(`/api/restaurants/${restaurantId}`)
        if (restaurantResponse.ok) {
          const restaurant = await restaurantResponse.json()
          setFeaturedRestaurants([...featuredRestaurants, restaurant])
        }
      } else {
        // Remove from featured list
        setFeaturedRestaurants(featuredRestaurants.filter((r) => r.id !== restaurantId))
      }

      setSuccess(`Restaurant ${action === "add" ? "added to" : "removed from"} featured list`)
    } catch (err) {
      setError(`Error ${action === "add" ? "adding" : "removing"} featured restaurant`)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Landing Page Manager</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="featured">Featured Restaurants</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Image</CardTitle>
              <CardDescription>Upload a high-quality image for the landing page hero section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {heroImage && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    <img src={heroImage || "/placeholder.svg"} alt="Hero" className="h-full w-full object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={async () => {
                        try {
                          setIsLoading(true)
                          const response = await fetch("/api/admin/landing-page/hero", {
                            method: "DELETE",
                          })

                          if (!response.ok) {
                            throw new Error("Failed to delete hero image")
                          }

                          setHeroImage(null)
                          setSuccess("Hero image removed successfully")
                        } catch (err) {
                          setError("Error removing hero image")
                          console.error(err)
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="hero-image">Upload New Hero Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hero-image"
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      disabled={uploading}
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured">
          <Card>
            <CardHeader>
              <CardTitle>Featured Restaurants</CardTitle>
              <CardDescription>Select restaurants to feature on the landing page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {featuredRestaurants.map((restaurant) => (
                    <Card key={restaurant.id} className="overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={restaurant.images?.[0] || "/placeholder.jpeg?height=225&width=400"}
                          alt={restaurant.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleFeaturedRestaurantChange(restaurant.id, "remove")}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Remove from Featured
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                  <Card className="flex flex-col items-center justify-center p-6 border-dashed">
                    <ImagePlus className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Add Featured Restaurant</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Select a restaurant to feature on the landing page
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // This would open a modal or navigate to a restaurant selector
                        router.push("/admin/landing-page/select-restaurant")
                      }}
                    >
                      Select Restaurant
                    </Button>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
