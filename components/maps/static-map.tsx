"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

interface StaticMapProps {
  latitude: number
  longitude: number
  width?: number
  height?: number
  zoom?: number
  className?: string
}

export function StaticMap({
  latitude,
  longitude,
  width = 600,
  height = 400,
  zoom = 14,
  className = "",
}: StaticMapProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use our secure proxy for static maps
  const mapUrl = `/api/maps/static?lat=${latitude}&lng=${longitude}&zoom=${zoom}&width=${width}&height=${height}`

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
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

      <Image
        src={mapUrl || "/placeholder.svg"}
        alt="Map"
        width={width}
        height={height}
        className="h-full w-full object-cover"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError("Failed to load map")
        }}
      />

      {/* Center marker */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-6 w-6 rounded-full border-2 border-white bg-primary shadow-lg"></div>
      </div>
    </div>
  )
}
