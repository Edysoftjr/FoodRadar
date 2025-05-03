import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const zoom = searchParams.get("zoom") || "14"
    const width = searchParams.get("width") || "600"
    const height = searchParams.get("height") || "400"

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing coordinates" }, { status: 400 })
    }

    // Get the API key from server environment
    const apiKey = process.env.HERE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Maps API key not configured" }, { status: 500 })
    }

    // Generate a static map image URL
    const staticMapUrl = `https://image.maps.ls.hereapi.com/mia/1.6/mapview?apiKey=${apiKey}&lat=${lat}&lon=${lng}&zoom=${zoom}&w=${width}&h=${height}`

    const response = await fetch(staticMapUrl)

    if (!response.ok) {
      throw new Error(`HERE API error: ${response.statusText}`)
    }

    const imageBuffer = await response.arrayBuffer()

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error generating static map:", error)

    // Return a placeholder image instead of an error
    return NextResponse.redirect(new URL(`/placeholder.svg?height=400&width=600&text=Map+Unavailable`, request.url))
  }
}
