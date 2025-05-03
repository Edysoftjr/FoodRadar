import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { center, zoom } = await request.json()

    if (!center || !center.lat || !center.lng) {
      return NextResponse.json({ error: "Invalid center coordinates" }, { status: 400 })
    }

    // Return map initialization data without exposing API key
    return NextResponse.json({
      center: {
        lat: center.lat,
        lng: center.lng,
      },
      zoom: zoom || 14,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Error initializing map:", error)
    return NextResponse.json({ error: "Failed to initialize map" }, { status: 500 })
  }
}
