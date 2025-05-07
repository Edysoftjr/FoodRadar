import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.HERE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "HERE Maps API key not configured" }, { status: 500 })
    }

    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat") || "0"
    const lng = searchParams.get("lng") || "0"
    const zoom = searchParams.get("zoom") || "14"
    const width = searchParams.get("width") || "800"
    const height = searchParams.get("height") || "600"

    // Construct the HERE Maps static image URL
    const mapUrl = `https://maps.hereapi.com/v3/staticimage?apiKey=${apiKey}&lat=${lat}&lon=${lng}&z=${zoom}&w=${width}&h=${height}`

    // Fetch the image from HERE Maps
    const response = await fetch(mapUrl)

    if (!response.ok) {
      throw new Error(`HERE Maps API error: ${response.statusText}`)
    }

    // Get the image data
    const imageData = await response.arrayBuffer()

    // Return the image with the correct content type
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error generating static map:", error)

    // Return a placeholder image or error response
    return NextResponse.json({ error: "Failed to generate map" }, { status: 500 })
  }
}
