"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleMap } from "@/components/maps/simple-map"
import { useLocation } from "@/components/location-provider"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, MapPin, Navigation, Clock } from "lucide-react"

export default function DirectionsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { location } = useLocation()
  const { toast } = useToast()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [routeInfo, setRouteInfo] = useState<{
    distance: string
    duration: string
  } | null>(null)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true)

        // Fetch restaurant details
        const { data, error } = await supabase.from("restaurants").select("*").eq("id", id).single()

        if (error) throw error

        setRestaurant(data)
      } catch (error) {
        console.error("Error fetching restaurant:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurant details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [id, toast])

  // Calculate route when restaurant and location are available
  useEffect(() => {
    const calculateRoute = async () => {
      if (!restaurant || !location.coordinates) return

      try {
        const response = await fetch("/api/maps/route", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startLat: location.coordinates.latitude,
            startLng: location.coordinates.longitude,
            endLat: restaurant.coordinates.latitude,
            endLng: restaurant.coordinates.longitude,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setRouteInfo({
            distance: data.distance,
            duration: data.duration,
          })
        }
      } catch (error) {
        console.error("Error calculating route:", error)
      }
    }

    calculateRoute()
  }, [restaurant, location.coordinates])

  if (loading || !restaurant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading directions...</p>
      </div>
    )
  }

  if (!location.coordinates) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Location Required</h1>
          <p className="text-muted-foreground mb-6">We need your location to show directions to the restaurant.</p>
          <Button onClick={() => location.requestLocationPermission()}>Enable Location</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <Link href={`/restaurant/${id}`} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium mobile-hidden">Back to Restaurant</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 py-6 sm:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Directions</h1>
            <p className="text-muted-foreground">Directions to {restaurant.name}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div className="rounded-xl overflow-hidden border">
              <SimpleMap
                latitude={restaurant.coordinates.latitude}
                longitude={restaurant.coordinates.longitude}
                height={600}
                width={800}
                className="w-full h-[calc(100vh-200px)]"
              />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Route Information</CardTitle>
                  <CardDescription>From your location to {restaurant.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {routeInfo ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Navigation className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Distance</p>
                          <p className="font-medium">{routeInfo.distance} km</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Time</p>
                          <p className="font-medium">{routeInfo.duration} minutes</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      <p>Calculating route...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Destination</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full" asChild>
                <a
                  href={`https://waze.com/ul?ll=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Waze
                </a>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
