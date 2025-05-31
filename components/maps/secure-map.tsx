"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface SecureMapProps {
  width?: string
  height?: string
  latitude: number
  longitude: number
  zoom?: number
  className?: string
}

export function SecureMap({
  width = "100%",
  height = "400px",
  latitude,
  longitude,
  zoom = 14,
  className = "",
}: SecureMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let map: any

    const initMap = async () => {
      try {
        // Load the map using our secure API endpoint
        const response = await fetch(`/api/maps/init?lat=${latitude}&lng=${longitude}&zoom=${zoom}`)

        if (!response.ok) {
          throw new Error("Failed to initialize map")
        }

        const mapData = await response.json()

        // Use the map data to render a static map
        const mapImage = document.createElement("img")
        mapImage.src = mapData.imageUrl
        mapImage.alt = "Map"
        mapImage.style.width = "100%"
        mapImage.style.height = "100%"
        mapImage.style.objectFit = "cover"

        // Clear and append
        if (mapRef.current) {
          mapRef.current.innerHTML = ""
          mapRef.current.appendChild(mapImage)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error initializing map:", err)
        setError("Failed to initialize map")
        setLoading(false)
      }
    }

    initMap()

    return () => {
      if (map) {
        // Cleanup if needed
      }
    }
  }, [latitude, longitude, zoom])

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>
        </div>
      )}

      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
