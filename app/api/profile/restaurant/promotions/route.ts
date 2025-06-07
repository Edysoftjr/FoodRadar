import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is a vendor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "VENDOR") {
      return NextResponse.json({ error: "Only vendors can access promotions" }, { status: 403 })
    }

    // Find the restaurant
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const promotions = await prisma.promotion.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error("Promotions fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is a vendor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "VENDOR") {
      return NextResponse.json({ error: "Only vendors can create promotions" }, { status: 403 })
    }

    // Find the restaurant
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, discountPercentage, maxRadius, budget, duration } = body

    // Validate required fields
    if (!title || !description || !discountPercentage || !maxRadius || !budget || !duration) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setHours(endDate.getHours() + duration)

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description,
        discountPercentage,
        maxRadius,
        budget,
        startDate,
        endDate,
        isActive: true,
        restaurant: {
          connect: { id: restaurant.id },
        },
      },
    })

    return NextResponse.json(promotion)
  } catch (error) {
    console.error("Promotion creation error:", error)
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 })
  }
}
