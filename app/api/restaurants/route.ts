import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get("latitude")
    const longitude = searchParams.get("longitude")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // Build where clause for filtering
    const where: any = {}

    // Filter by category if provided
    if (category && category !== "all") {
      where.categories = {
        has: category,
      }
    }

    // Filter by search query if provided
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          categories: {
            hasSome: [search],
          },
        },
      ]
    }

    // Fetch restaurants from database
    const restaurants = await prisma.restaurant.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        coordinates: true,
        images: true,
        categories: true,
        priceRange: true,
        rating: true,
        reviewCount: true,
        phone: true,
        website: true,
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        rating: "desc",
      },
    })

    // If user location is provided, we could calculate distances here
    // For now, we'll return the restaurants as-is
    const formattedRestaurants = restaurants.map((restaurant) => ({
      ...restaurant,
      coordinates: restaurant.coordinates as { latitude: number; longitude: number },
      priceRange: restaurant.priceRange as { min: number; max: number; average: number },
    }))

    return NextResponse.json({ restaurants: formattedRestaurants })
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Create a new restaurant in the database
    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        coordinates: data.coordinates,
        images: data.images || [],
        categories: data.categories || [],
        priceRange: data.priceRange,
        phone: data.phone,
        website: data.website,
        ownerId: data.ownerId,
      },
    })

    return NextResponse.json({ success: true, restaurant })
  } catch (error) {
    console.error("Error creating restaurant:", error)
    return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 })
  }
}
