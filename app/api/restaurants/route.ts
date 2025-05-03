import { type NextRequest, NextResponse } from "next/server"

// This would be a real implementation using a database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get("latitude")
    const longitude = searchParams.get("longitude")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // In a real implementation, this would query the database
    // and sort by distance from the user's location

    // Mock data
    const restaurants = [
      {
        id: "1",
        name: "Tasty Delights",
        description: "Authentic Nigerian cuisine with a modern twist",
        address: "123 Lagos Street, Lagos",
        coordinates: { latitude: 6.5244, longitude: 3.3792 },
        categories: ["Local", "Continental"],
        priceRange: { min: 1500, max: 5000, average: 2500 },
        rating: 4.5,
        reviewCount: 120,
        images: ["/placeholder.svg?height=225&width=400"],
        distance: 2.3, // km
      },
      {
        id: "2",
        name: "Spice Haven",
        description: "Spicy and flavorful dishes from around the world",
        address: "456 Abuja Road, Lagos",
        coordinates: { latitude: 6.5344, longitude: 3.3692 },
        categories: ["Continental", "Spicy"],
        priceRange: { min: 2000, max: 7000, average: 3500 },
        rating: 4.2,
        reviewCount: 85,
        images: ["/placeholder.svg?height=225&width=400"],
        distance: 3.1, // km
      },
      // More restaurants...
    ]

    return NextResponse.json({ restaurants })
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // In a real implementation, this would create a new restaurant in the database

    return NextResponse.json({ success: true, id: "new-restaurant-id" })
  } catch (error) {
    console.error("Error creating restaurant:", error)
    return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 })
  }
}
