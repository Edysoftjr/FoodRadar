import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const x = searchParams.get("x")
    const y = searchParams.get("y")
    const z = searchParams.get("z")

    if (!x || !y || !z) {
      return NextResponse.json({ error: "Missing tile coordinates" }, { status: 400 })
    }

    // Get the API key from server environment
    const apiKey = process.env.HERE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Maps API key not configured" }, { status: 500 })
    }

    // Proxy the tile request to HERE Maps
    const tileUrl = `https://1.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/${z}/${x}/${y}/256/png8?apiKey=${apiKey}`

    const response = await fetch(tileUrl)
    const imageBuffer = await response.arrayBuffer()

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error fetching map tile:", error)
    return NextResponse.json({ error: "Failed to fetch map tile" }, { status: 500 })
  }
}
