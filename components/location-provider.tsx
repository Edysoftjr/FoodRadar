"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

type Coordinates = {
  latitude: number
  longitude: number
}

type LocationContextType = {
  location: {
    coordinates: Coordinates | null
    address: string | null
    loading: boolean
  }
  updateLocation: () => Promise<void>
  requestLocationPermission: () => Promise<void>
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Try to get location on mount
  useEffect(() => {
    const savedCoordinates = localStorage.getItem("foodradar_coordinates")
    const savedAddress = localStorage.getItem("foodradar_address")

    if (savedCoordinates && savedAddress) {
      setCoordinates(JSON.parse(savedCoordinates))
      setAddress(savedAddress)
    } else {
      // Only auto-request on first visit
      if (!localStorage.getItem("foodradar_location_prompted")) {
        requestLocationPermission()
        localStorage.setItem("foodradar_location_prompted", "true")
      }
    }
  }, [])

  const requestLocationPermission = async () => {
    setLoading(true)
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser")
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords
      setCoordinates({ latitude, longitude })

      // Save to localStorage
      localStorage.setItem("foodradar_coordinates", JSON.stringify({ latitude, longitude }))

      // Get address from coordinates using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        )
        const data = await response.json()

        if (data && data.display_name) {
          const shortAddress = data.address
            ? `${data.address.road || ""}, ${data.address.city || data.address.town || data.address.village || ""}`
            : data.display_name.split(",").slice(0, 2).join(",")

          setAddress(shortAddress)
          localStorage.setItem("foodradar_address", shortAddress)
        }
      } catch (error) {
        console.error("Error getting address:", error)
        // If reverse geocoding fails, just use coordinates
        setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        localStorage.setItem("foodradar_address", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
      }

      toast({
        title: "Location updated",
        description: "Your location has been updated successfully",
      })
    } catch (error: any) {
      console.error("Error getting location:", error)
      toast({
        title: "Location error",
        description: error.message || "Could not get your location. Please check your settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateLocation = async () => {
    return requestLocationPermission()
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return Number.parseFloat(d.toFixed(1))
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  return (
    <LocationContext.Provider
      value={{
        location: {
          coordinates,
          address,
          loading,
        },
        updateLocation,
        requestLocationPermission,
        calculateDistance,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}
