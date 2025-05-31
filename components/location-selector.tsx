"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, MapPin, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LocationSelectorProps {
  onLocationSelected: (location: {
    address: string
    latitude: number
    longitude: number
    city: string
    state?: string
    country: string
  }) => void
  defaultLocation?: {
    address?: string
    latitude?: number
    longitude?: number
  }
}

export default function LocationSelector({ onLocationSelected, defaultLocation }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false)

  useEffect(() => {
    if (defaultLocation?.latitude && defaultLocation?.longitude) {
      setCurrentLocation({
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude,
      })
    }
  }, [defaultLocation])

  const searchLocations = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Use our server-side API to search locations instead of calling HERE API directly
      const response = await fetch(`/api/maps?operation=search&query=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error("Failed to search locations")
      }

      const data = await response.json()
      setSearchResults(data.items || [])
    } catch (err) {
      console.error("Error searching locations:", err)
      setError("Failed to search locations. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    setIsGettingCurrentLocation(true)
    setError(null)

    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
        if (permissionStatus.state === "granted" || permissionStatus.state === "prompt") {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const latitude = position.coords.latitude
              const longitude = position.coords.longitude

              setCurrentLocation({ latitude, longitude })

              try {
                // Use our server-side API to get location details instead of calling HERE API directly
                const response = await fetch(`/api/maps?operation=geocode&lat=${latitude}&lng=${longitude}`)

                if (!response.ok) {
                  throw new Error("Failed to get location details")
                }

                const data = await response.json()

                if (data.items && data.items.length > 0) {
                  const locationData = data.items[0]
                  const address = locationData.address

                  onLocationSelected({
                    address: locationData.title || address.label,
                    latitude,
                    longitude,
                    city: address.city || address.county || "",
                    state: address.state || address.stateCode || "",
                    country: address.countryName || "",
                  })
                }
              } catch (err) {
                console.error("Error getting location details:", err)
                setError("Failed to get location details. Please try again.")
              } finally {
                setIsGettingCurrentLocation(false)
              }
            },
            (error) => {
              setIsGettingCurrentLocation(false)
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  setError("Location permission denied. Please enable location services.")
                  break
                case error.POSITION_UNAVAILABLE:
                  setError("Location information is unavailable.")
                  break
                case error.TIMEOUT:
                  setError("Location request timed out.")
                  break
                default:
                  setError("An unknown error occurred.")
                  break
              }
            },
          )
        } else if (permissionStatus.state === "denied") {
          setIsGettingCurrentLocation(false)
          setError("Location permission denied. Please enable location services.")
        }
      })
    } else {
      setIsGettingCurrentLocation(false)
      setError("Geolocation is not supported by your browser.")
    }
  }

  const handleSelectLocation = (location: any) => {
    const { position, address, title } = location

    onLocationSelected({
      address: title || address.label,
      latitude: position.lat,
      longitude: position.lng,
      city: address.city || address.county || "",
      state: address.state || address.stateCode || "",
      country: address.countryName || "",
    })

    setSearchResults([])
    setSearchQuery("")
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <Input
            placeholder="Search for a location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={searchLocations} disabled={isLoading || !searchQuery.trim()} variant="outline">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <Button onClick={getCurrentLocation} variant="outline" className="w-full" disabled={isGettingCurrentLocation}>
          {isGettingCurrentLocation ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 mr-2" />
          )}
          Use Current Location
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {searchResults.length > 0 && (
        <Card>
          <CardContent className="p-2">
            <div className="max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded"
                  onClick={() => handleSelectLocation(result)}
                >
                  <p className="font-medium">{result.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{result.address.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentLocation && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            Current coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}
