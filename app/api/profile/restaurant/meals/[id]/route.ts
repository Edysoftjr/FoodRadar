import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/profile/restaurant/meals/[id] - Get a specific meal
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mealId = params.id

    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        restaurant: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }

    // Check if the user owns the restaurant that has this meal
    if (meal.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to access this meal" }, { status: 403 })
    }

    return NextResponse.json(meal)
  } catch (error) {
    console.error("Meal fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch meal" }, { status: 500 })
  }
}

// PUT /api/profile/restaurant/meals/[id] - Update a specific meal
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mealId = params.id

    // Check if the meal exists and belongs to the user's restaurant
    const existingMeal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        restaurant: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!existingMeal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }

    if (existingMeal.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to update this meal" }, { status: 403 })
    }

    const data = await request.json()

    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price ? Number.parseInt(data.price) : undefined,
        image: data.image,
        categories: data.categories,
        isAvailable: data.isAvailable,
      },
    })

    return NextResponse.json(updatedMeal)
  } catch (error) {
    console.error("Meal update error:", error)
    return NextResponse.json({ error: "Failed to update meal" }, { status: 500 })
  }
}

// DELETE /api/profile/restaurant/meals/[id] - Delete a specific meal
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mealId = params.id

    // Check if the meal exists and belongs to the user's restaurant
    const existingMeal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        restaurant: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!existingMeal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }

    if (existingMeal.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to delete this meal" }, { status: 403 })
    }

    await prisma.meal.delete({
      where: { id: mealId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Meal deletion error:", error)
    return NextResponse.json({ error: "Failed to delete meal" }, { status: 500 })
  }
}
