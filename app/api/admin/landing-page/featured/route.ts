import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    // Check if user is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { restaurantId, action } = await request.json()

    if (!restaurantId || !["add", "remove"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Get current settings
    let landingPageSettings = await prisma.landingPageSettings.findFirst()

    if (!landingPageSettings) {
      // Create settings if they don't exist
      landingPageSettings = await prisma.landingPageSettings.create({
        data: {
          id: 1,
          heroImage: null,
          featuredRestaurantIds: [],
        },
      })
    }

    // Update featured restaurant IDs based on action
    let featuredRestaurantIds = [...(landingPageSettings.featuredRestaurantIds || [])]

    if (action === "add" && !featuredRestaurantIds.includes(restaurantId)) {
      featuredRestaurantIds.push(restaurantId)
    } else if (action === "remove") {
      featuredRestaurantIds = featuredRestaurantIds.filter((id) => id !== restaurantId)
    }

    // Update settings
    await prisma.landingPageSettings.update({
      where: { id: landingPageSettings.id },
      data: { featuredRestaurantIds },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating featured restaurants:", error)
    return NextResponse.json({ error: "Failed to update featured restaurants" }, { status: 500 })
  }
}
