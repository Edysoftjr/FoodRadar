import { type NextRequest, NextResponse } from "next/server"
import { proxyHereRequest } from "./here-proxy"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const operation = searchParams.get("operation")

    if (!operation) {
      return NextResponse.json({ error: "Operation parameter is required" }, { status: 400 })
    }

    // Handle different map operations
    switch (operation) {
      case "init":
        // Return initialization data
        return NextResponse.json({
          initialized: true,
          timestamp: new Date().toISOString(),
        })

      case "geocode": {
        // Reverse geocoding (coordinates to address)
        const lat = searchParams.get("lat")
        const lng = searchParams.get("lng")

        if (!lat || !lng) {
          return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
        }

        const data = await proxyHereRequest("revgeocode.search.hereapi.com/v1/revgeocode", {
          at: `${lat},${lng}`,
          lang: "en-US",
        })

        return NextResponse.json(data)
      }

      case "search": {
        // Location search by query
        const query = searchParams.get("query")

        if (!query) {
          return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
        }

        const data = await proxyHereRequest("geocode.search.hereapi.com/v1/geocode", {
          q: query,
        })

        return NextResponse.json(data)
      }

      case "route": {
        // Route calculation
        const startLat = searchParams.get("startLat")
        const startLng = searchParams.get("startLng")
        const endLat = searchParams.get("endLat")
        const endLng = searchParams.get("endLng")

        if (!startLat || !startLng || !endLat || !endLng) {
          return NextResponse.json({ error: "Start and end coordinates are required" }, { status: 400 })
        }

        const data = await proxyHereRequest("router.hereapi.com/v8/routes", {
          transportMode: "car",
          origin: `${startLat},${startLng}`,
          destination: `${endLat},${endLng}`,
          return: "polyline,summary,actions,instructions",
        })

        return NextResponse.json(data)
      }

      default:
        return NextResponse.json({ error: "Unknown operation" }, { status: 400 })
    }
  } catch (error) {
    console.error("Map API error:", error)
    return NextResponse.json({ error: "An error occurred processing the map request" }, { status: 500 })
  }
}
