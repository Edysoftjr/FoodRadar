"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

type LocationContextType = {
  location: {
    latitude: number
    longitude: number
    address: string
    neighborhood?: string
    city?: string
    accuracy?: number
  }
  updateLocation: () => Promise<void>
  requestLocationPermission: () => Promise<void>
  setLocation: (location: { 
    latitude: number; 
    longitude: number; 
    address: string;
    neighborhood?: string;
    city?: string;
    accuracy?: number;
  }) => void
  isLoading: boolean
}

type LocationProviderProps = {
  children: React.ReactNode
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: LocationProviderProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<{ 
    latitude: number; 
    longitude: number; 
    address: string;
    neighborhood?: string;
    city?: string;
    accuracy?: number;
  }>({
    latitude: 0,
    longitude: 0,
    address: "",
    neighborhood: "",
    city: "",
    accuracy: 0,
  })

  // Load location from localStorage on initial render
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation)
        setLocation(parsedLocation)
      } catch (error) {
        console.error("Error parsing saved location:", error)
      }
    }
  }, [])

  // Save location to localStorage whenever it changes
  useEffect(() => {
    if (location.latitude && location.longitude) {
      localStorage.setItem("userLocation", JSON.stringify(location))
    }
  }, [location])

  const requestLocationPermission = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation not supported",
          description: "Your browser does not support geolocation.",
          variant: "destructive",
        })
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            resolve()
          } else if (permissionStatus.state === "prompt") {
            // This will trigger the permission prompt
            navigator.geolocation.getCurrentPosition(
              () => resolve(),
              (error) => {
                console.error("Permission request error:", error)
                reject(new Error("Location permission denied"))
              },
              { timeout: 15000, enableHighAccuracy: true },
            )
          } else {
            reject(new Error("Location permission denied"))
          }
        })
        .catch((error) => {
          console.error("Permission query error:", error)
          reject(error)
        })
    })
  }

  // Enhanced function to get multiple position readings for better accuracy
  const getHighAccuracyPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      let bestPosition: GeolocationPosition | null = null
      let attempts = 0
      const maxAttempts = 3
      let watchId: number

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0, // Don't use cached positions
      }

      const successCallback = (position: GeolocationPosition) => {
        attempts++
        
        // Keep the most accurate position
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position
        }

        // If we have a very accurate position (under 10 meters) or reached max attempts
        if (position.coords.accuracy < 10 || attempts >= maxAttempts) {
          navigator.geolocation.clearWatch(watchId)
          resolve(bestPosition!)
        }
      }

      const errorCallback = (error: GeolocationPositionError) => {
        navigator.geolocation.clearWatch(watchId)
        if (bestPosition) {
          resolve(bestPosition)
        } else {
          reject(error)
        }
      }

      // Start watching position
      watchId = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options
      )

      // Fallback timeout to ensure we don't wait forever
      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId)
        if (bestPosition) {
          resolve(bestPosition)
        } else {
          reject(new Error("Timeout: Could not get accurate position"))
        }
      }, 25000)
    })
  }

  // Enhanced reverse geocoding with multiple data sources
  const getDetailedAddress = async (latitude: number, longitude: number) => {
    const hereApiKey = process.env.NEXT_PUBLIC_HERE_API_KEY

    if (!hereApiKey) {
      console.error("HERE API key not found in environment variables")
      throw new Error("HERE API key not configured")
    }

    console.log(`Attempting reverse geocoding for: ${latitude}, ${longitude}`)

    try {
      // Build URL with proper encoding
      const baseUrl = 'https://revgeocode.search.hereapi.com/v1/revgeocode'
      const params = new URLSearchParams({
        at: `${latitude},${longitude}`,
        lang: 'en-US',
        apiKey: hereApiKey,
        limit: '1'
      })

      const url = `${baseUrl}?${params.toString()}`
      console.log('Making request to HERE API:', url.replace(hereApiKey, 'API_KEY_HIDDEN'))

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      // Log response details for debugging
      console.log('HERE API Response Status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('HERE API error response:', errorText)
        throw new Error(`HERE API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('HERE API Response Data:', data)

      if (data.items && data.items.length > 0) {
        const item = data.items[0]
        const address = item.address || {}

        // Build detailed address components
        const addressParts = []
        const neighborhood = address.district || address.subdistrict || address.neighbourhood
        const street = address.street || address.houseNumber ? 
          `${address.houseNumber || ''} ${address.street || ''}`.trim() : ''
        
        if (street) addressParts.push(street)
        if (neighborhood && neighborhood !== address.city) addressParts.push(neighborhood)
        if (address.city) addressParts.push(address.city)
        if (address.state || address.stateCode) addressParts.push(address.state || address.stateCode)
        if (address.countryName) addressParts.push(address.countryName)

        const fullAddress = addressParts.filter(Boolean).join(", ")

        const result = {
          address: fullAddress || "Unknown location",
          neighborhood: item.title || neighborhood || address.city || "",
          city: address.city || "",
          street: street,
          district: address.district,
          state: address.state,
          country: address.countryName
        }

        console.log('Parsed address result:', result)
        return result
      }

      console.log('No items found in HERE API response, trying fallback...')

      // Fallback: try with simpler parameters
      const fallbackParams = new URLSearchParams({
        at: `${latitude},${longitude}`,
        apiKey: hereApiKey
      })

      const fallbackUrl = `${baseUrl}?${fallbackParams.toString()}`
      const fallbackResponse = await fetch(fallbackUrl)

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        console.log('Fallback API response:', fallbackData)
        
        if (fallbackData.items && fallbackData.items.length > 0) {
          const address = fallbackData.items[0].address || {}
          return {
            address: [address.street, address.district, address.city, address.countryName]
              .filter(Boolean).join(", ") || "Location found",
            neighborhood: address.district || address.city || "",
            city: address.city || "",
          }
        }
      }

      throw new Error("No address data found from HERE API")
    } catch (error) {
      console.error("Address lookup failed:", error)
      
      // Check if it's a network error or API key issue
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Network error: Please check your internet connection")
      }
      
      if (error.message.includes('401')) {
        throw new Error("Invalid API key: Please check your HERE API configuration")
      }
      
      if (error.message.includes('403')) {
        throw new Error("API access denied: Please check your HERE API permissions")
      }

      // For development/testing, provide coordinates as fallback
      console.log("Using coordinate fallback due to API error")
      return {
        address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
        neighborhood: "Location detected",
        city: "",
      }
    }
  }

  const updateLocation = async (): Promise<void> => {
    if (isLoading) return // Prevent multiple simultaneous requests
    
    setIsLoading(true)

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation not supported")
      }

      // Get high accuracy position
      const position = await getHighAccuracyPosition()
      const { latitude, longitude, accuracy } = position.coords

      console.log(`Location acquired - Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`)

      // Get detailed address information
      const addressDetails = await getDetailedAddress(latitude, longitude)

      setLocation({
        latitude,
        longitude,
        accuracy,
        address: addressDetails.address,
        neighborhood: addressDetails.neighborhood,
        city: addressDetails.city,
      })

      // Show success toast with accuracy info
      toast({
        title: "Location updated successfully",
        description: `Found: ${addressDetails.neighborhood || addressDetails.city} (±${Math.round(accuracy)}m accuracy)`,
      })

    } catch (error: any) {
      console.error("Location update error:", error)
      
      let errorMessage = "Failed to get your location"
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location services."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check your GPS settings."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again."
            break
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LocationContext.Provider
      value={{
        location,
        updateLocation,
        requestLocationPermission,
        setLocation,
        isLoading,
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
