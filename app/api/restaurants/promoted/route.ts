import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in miles
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get("latitude")
    const longitude = searchParams.get("longitude")

    if (!latitude || !longitude) {
      return NextResponse.json({ promotions: [] })
    }

    const userLat = Number.parseFloat(latitude)
    const userLng = Number.parseFloat(longitude)

    // Get all active promotions
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        endDate: {
          gt: new Date(),
        },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            images: true,
            coordinates: true,
            rating: true,
            priceRange: true,
            categories: true,
          },
        },
      },
    })

    // Filter promotions by distance and calculate promotion score
    const eligiblePromotions = promotions
      .map((promotion) => {
        const restaurantCoords = promotion.restaurant.coordinates as { latitude: number; longitude: number }
        const distance = calculateDistance(userLat, userLng, restaurantCoords.latitude, restaurantCoords.longitude)

        // Only include promotions within the max radius (50 miles max)
        if (distance > Math.min(promotion.maxRadius, 50)) {
          return null
        }

        // Calculate promotion score based on distance, budget, and discount
        // Closer restaurants get higher scores
        const distanceScore = Math.max(0, 1 - distance / promotion.maxRadius)
        const budgetScore = Math.min(promotion.budget / 1000, 1) // Normalize budget
        const discountScore = promotion.discountPercentage / 100

        const promotionScore = distanceScore * 0.5 + budgetScore * 0.3 + discountScore * 0.2

        return {
          ...promotion,
          restaurant: promotion.restaurant,
          distance,
          promotionScore,
        }
      })
      .filter(Boolean)
      .sort((a, b) => b!.promotionScore - a!.promotionScore)
      .slice(0, 10) // Top 10 promotions

    return NextResponse.json({ promotions: eligiblePromotions })
  } catch (error) {
    console.error("Error fetching promoted restaurants:", error)
    return NextResponse.json({ error: "Failed to fetch promoted restaurants" }, { status: 500 })
  }
}
