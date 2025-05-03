"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface HereMapProps {
  width?: string
  height?: string
  startPoint?: { lat: number; lng: number; name?: string }
  endPoint?: { lat: number; lng: number; name?: string }
  markers?: Array<{
    lat: number
    lng: number
    name: string
    info?: string
  }>
  showRoute?: boolean
  zoom?: number
  className?: string
}

export function HereMap({
  width = "100%",
  height = "400px",
  startPoint,
  endPoint,
  markers = [],
  showRoute = false,
  zoom = 14,
  className = "",
}: HereMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeInfo, setRouteInfo] = useState<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let map: any
    const cleanup: () => void = () => {}

    const initMap = async () => {
      try {
        setLoading(true)

        // Initialize map through our secure API
        const response = await fetch("/api/maps/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center: endPoint || startPoint || (markers.length > 0 ? markers[0] : { lat: 6.5244, lng: 3.3792 }),
            zoom,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to initialize map")
        }

        const mapData = await response.json()

        // Create a static map as fallback
        const staticMapUrl = `/api/maps/static?lat=${mapData.center.lat}&lng=${mapData.center.lng}&zoom=${zoom}&width=800&height=600`

        const mapImage = document.createElement("img")
        mapImage.src = staticMapUrl
        mapImage.alt = "Map"
        mapImage.style.width = "100%"
        mapImage.style.height = "100%"
        mapImage.style.objectFit = "cover"

        // Clear and append
        if (mapRef.current) {
          mapRef.current.innerHTML = ""
          mapRef.current.appendChild(mapImage)
        }

        // Add markers as HTML elements
        if (markers.length > 0 || startPoint || endPoint) {
          const markersContainer = document.createElement("div")
          markersContainer.style.position = "relative"
          markersContainer.style.width = "100%"
          markersContainer.style.height = "100%"
          markersContainer.style.top = "-100%"
          markersContainer.style.pointerEvents = "none"

          // Add all markers
          const allPoints = [
            ...(startPoint ? [{ ...startPoint, type: "start" }] : []),
            ...(endPoint ? [{ ...endPoint, type: "end" }] : []),
            ...markers.map((m) => ({ ...m, type: "marker" })),
          ]

          allPoints.forEach((point) => {
            const marker = document.createElement("div")
            marker.className = "absolute transform -translate-x-1/2 -translate-y-1/2"
            marker.style.left = `${point.offsetX || 50}%`
            marker.style.top = `${point.offsetY || 50}%`

            const pin = document.createElement("div")
            pin.className = `h-6 w-6 rounded-full bg-${point.type === "start" ? "blue" : point.type === "end" ? "red" : "primary"}-500 flex items-center justify-center text-white text-xs font-bold shadow-lg`
            pin.innerHTML = point.type === "start" ? "A" : point.type === "end" ? "B" : "•"

            marker.appendChild(pin)
            markersContainer.appendChild(marker)
          })

          if (mapRef.current) {
            mapRef.current.appendChild(markersContainer)
          }
        }

        // If route is needed, draw a line
        if (showRoute && startPoint && endPoint) {
          try {
            const routeResponse = await fetch("/api/maps/route", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                startLat: startPoint.lat,
                startLng: startPoint.lng,
                endLat: endPoint.lat,
                endLng: endPoint.lng,
              }),
            })

            if (routeResponse.ok) {
              const routeData = await routeResponse.json()

              // Set route info if available
              if (routeData.distance && routeData.duration) {
                setRouteInfo({
                  distance: routeData.distance,
                  duration: routeData.duration,
                })
              }
            }
          } catch (routeError) {
            console.error("Error calculating route:", routeError)
          }
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
      cleanup()
    }
  }, [startPoint, endPoint, markers, showRoute, zoom])

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>
        </div>
      )}

      <div ref={mapRef} style={{ width: "100%", height: "100%" }} className="overflow-hidden rounded-md" />

      {routeInfo && (
        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-background/90 p-3 shadow-lg backdrop-blur-sm z-20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Distance: {routeInfo.distance} km</p>
              <p className="text-sm text-muted-foreground">Estimated time: {routeInfo.duration} min</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
