import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { startLat, startLng, endLat, endLng } = await request.json()

    if (!startLat || !startLng || !endLat || !endLng) {
      return NextResponse.json({ error: "Missing route coordinates" }, { status: 400 })
    }

    // Get the API key from server environment
    const apiKey = process.env.HERE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Maps API key not configured" }, { status: 500 })
    }

    // Call HERE Maps API for routing
    const routeUrl = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${startLat},${startLng}&destination=${endLat},${endLng}&return=polyline,summary&apiKey=${apiKey}`
    const response = await fetch(routeUrl)

    if (!response.ok) {
      throw new Error(`HERE API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract and return only the necessary information
    let distance = "Unknown"
    let duration = "Unknown"

    if (data.routes && data.routes.length > 0 && data.routes[0].sections && data.routes[0].sections.length > 0) {
      const section = data.routes[0].sections[0]
      if (section.summary) {
        distance = (section.summary.length / 1000).toFixed(1) // km
        duration = Math.ceil(section.summary.duration / 60) // minutes
      }
    }

    return NextResponse.json({
      distance,
      duration,
    })
  } catch (error) {
    console.error("Error calculating route:", error)
    return NextResponse.json({ error: "Failed to calculate route" }, { status: 500 })
  }
}
