import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operation = searchParams.get("operation")

    // Get the API key from server environment
    const apiKey = process.env.HERE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Maps API key not configured" }, { status: 500 })
    }

    if (!operation) {
      return NextResponse.json({ error: "No operation specified" }, { status: 400 })
    }

    // Handle different map operations
    switch (operation) {
      case "init":
        // Return initialization data without exposing the API key
        return NextResponse.json({
          initialized: true,
          timestamp: Date.now(),
        })

      case "geocode":
        const lat = searchParams.get("lat")
        const lng = searchParams.get("lng")

        if (!lat || !lng) {
          return NextResponse.json({ error: "Missing coordinates" }, { status: 400 })
        }

        // Call HERE Maps API for geocoding
        const geocodeUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&apiKey=${apiKey}`
        const geocodeResponse = await fetch(geocodeUrl)
        const geocodeData = await geocodeResponse.json()

        return NextResponse.json(geocodeData)

      case "route":
        const startLat = searchParams.get("startLat")
        const startLng = searchParams.get("startLng")
        const endLat = searchParams.get("endLat")
        const endLng = searchParams.get("endLng")

        if (!startLat || !startLng || !endLat || !endLng) {
          return NextResponse.json({ error: "Missing route coordinates" }, { status: 400 })
        }

        // Call HERE Maps API for routing
        const routeUrl = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${startLat},${startLng}&destination=${endLat},${endLng}&return=polyline,summary&apiKey=${apiKey}`
        const routeResponse = await fetch(routeUrl)
        const routeData = await routeResponse.json()

        return NextResponse.json(routeData)

      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in maps API:", error)
    return NextResponse.json({ error: "Failed to process map request" }, { status: 500 })
  }
}
