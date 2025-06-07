import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get("latitude")
    const longitude = searchParams.get("longitude")
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const whereClause: any = {
      isActive: true,
    }

    // Search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { categories: { has: search } },
      ]
    }

    // Category filter
    if (category && category !== "all") {
      whereClause.categories = { has: category }
    }

    // Get promoted restaurants first if user location is provided
    let promotedRestaurants: any[] = []
    if (latitude && longitude) {
      try {
        const promotedResponse = await fetch(
          `${process.env.NEXTAUTH_URL}/api/restaurants/promoted?latitude=${latitude}&longitude=${longitude}`,
        )
        if (promotedResponse.ok) {
          const promotedData = await promotedResponse.json()
          promotedRestaurants =
            promotedData.promotions?.map((p: any) => ({
              ...p.restaurant,
              isPromoted: true,
              promotion: {
                title: p.title,
                discountPercentage: p.discountPercentage,
              },
            })) || []
        }
      } catch (error) {
        console.error("Error fetching promoted restaurants:", error)
      }
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      include: {
        meals: {
          where: { isAvailable: true },
          take: 3,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            reviews: true,
            followers: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    // Calculate distance if coordinates provided
    let restaurantsWithDistance = restaurants
    if (latitude && longitude) {
      const userLat = Number.parseFloat(latitude)
      const userLng = Number.parseFloat(longitude)

      restaurantsWithDistance = restaurants.map((restaurant) => {
        const coords = restaurant.coordinates as { latitude: number; longitude: number }
        const distance = calculateDistance(userLat, userLng, coords.latitude, coords.longitude)
        return {
          ...restaurant,
          distance,
        }
      })

      // Sort by distance
      restaurantsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    // Merge promoted restaurants at the top
    const finalRestaurants = [
      ...promotedRestaurants,
      ...restaurantsWithDistance.filter((r) => !promotedRestaurants.some((p) => p.id === r.id)),
    ]

    const total = await prisma.restaurant.count({ where: whereClause })

    return NextResponse.json({
      restaurants: finalRestaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return Math.round(d * 10) / 10
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
