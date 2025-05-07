import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.HERE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "HERE Maps API key not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { center, zoom } = body

    // We're not directly using the API key in the response
    // Just returning the center and zoom for the static map
    return NextResponse.json({
      center,
      zoom,
      initialized: true,
    })
  } catch (error) {
    console.error("Error initializing map:", error)
    return NextResponse.json({ error: "Failed to initialize map" }, { status: 500 })
  }
}
