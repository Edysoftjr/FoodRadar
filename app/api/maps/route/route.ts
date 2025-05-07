import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.HERE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "HERE Maps API key not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { startLat, startLng, endLat, endLng } = body

    // Construct the HERE Maps routing API URL
    const routeUrl = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${startLat},${startLng}&destination=${endLat},${endLng}&return=summary&apiKey=${apiKey}`

    // Fetch the route from HERE Maps
    const response = await fetch(routeUrl)

    if (!response.ok) {
      throw new Error(`HERE Maps API error: ${response.statusText}`)
    }

    // Get the route data
    const routeData = await response.json()

    // Extract and return only the necessary information
    const route = routeData.routes[0]
    const section = route.sections[0]

    return NextResponse.json({
      distance: (section.summary.length / 1000).toFixed(1), // Convert to km
      duration: Math.ceil(section.summary.duration / 60), // Convert to minutes
    })
  } catch (error) {
    console.error("Error calculating route:", error)

    return NextResponse.json({ error: "Failed to calculate route" }, { status: 500 })
  }
}
