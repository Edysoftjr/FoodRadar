import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get landing page settings from database
    const landingPageSettings = await prisma.landingPageSettings.findFirst()

    // If no settings exist yet, return defaults
    if (!landingPageSettings) {
      return NextResponse.json({
        heroImage: null,
        featuredRestaurants: [],
      })
    }

    // Get featured restaurants with their details
    const featuredRestaurants = await prisma.restaurant.findMany({
      where: {
        id: {
          in: landingPageSettings.featuredRestaurantIds,
        },
      },
      select: {
        id: true,
        name: true,
        cuisine: true,
        images: true,
        rating: true,
        priceRange: true,
      },
    })

    return NextResponse.json({
      heroImage: landingPageSettings.heroImage,
      featuredRestaurants,
    })
  } catch (error) {
    console.error("Error fetching landing page settings:", error)
    return NextResponse.json({ error: "Failed to fetch landing page settings" }, { status: 500 })
  }
}
