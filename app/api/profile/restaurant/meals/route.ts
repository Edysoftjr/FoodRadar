// Add this file to handle meal creation with file uploads

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { uploadFile, STORAGE_PATHS } from "@/lib/supabase-storage"

// POST /api/profile/restaurant/meals - Create a new meal for the restaurant
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
      return NextResponse.json({ error: "Only vendors can add meals" }, { status: 403 })
    }

    // Find the restaurant
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Handle multipart form data for file uploads
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number(formData.get("price"))
    const categories = JSON.parse((formData.get("categories") as string) || "[]")

    // Handle meal image upload
    const mealImage = formData.get("image") as File | null
    let imageUrl = null

    if (mealImage) {
      imageUrl = await uploadFile(mealImage, STORAGE_PATHS.MEALS)
    }

    // Create the meal
    const meal = await prisma.meal.create({
      data: {
        name,
        description,
        price,
        categories,
        image: imageUrl,
        isAvailable: true,
        restaurant: {
          connect: { id: restaurant.id },
        },
      },
    })

    return NextResponse.json(meal)
  } catch (error) {
    console.error("Meal creation error:", error)
    return NextResponse.json({ error: "Failed to create meal" }, { status: 500 })
  }
}
