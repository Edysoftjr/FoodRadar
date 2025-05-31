"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LocationSelector from "@/components/location-selector"
import { Loader2 } from "lucide-react"

interface SignupLocationProps {
  onComplete: (locationData: {
    address: string
    latitude: number
    longitude: number
    city: string
    state?: string
    country: string
  }) => void
  onBack?: () => void
}

export default function SignupLocation({ onComplete, onBack }: SignupLocationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [locationData, setLocationData] = useState<{
    address: string
    latitude: number
    longitude: number
    city: string
    state?: string
    country: string
  } | null>(null)

  const handleLocationSelected = (location: {
    address: string
    latitude: number
    longitude: number
    city: string
    state?: string
    country: string
  }) => {
    setLocationData(location)
  }

  const handleSubmit = () => {
    if (!locationData) return

    setIsLoading(true)

    // Simulate a delay to show loading state
    setTimeout(() => {
      onComplete(locationData)
      setIsLoading(false)
    }, 500)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Your Location</CardTitle>
        <CardDescription>We need your location to show you nearby restaurants and food options.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocationSelector onLocationSelected={handleLocationSelected} />

        <div className="flex justify-between pt-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!locationData || isLoading} className={onBack ? "" : "w-full"}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
