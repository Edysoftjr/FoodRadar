import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const promotionId = params.id
    const body = await request.json()
    const { isActive } = body

    // Check if the promotion belongs to the user's restaurant
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        restaurant: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!promotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 })
    }

    if (promotion.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to update this promotion" }, { status: 403 })
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: { isActive },
    })

    return NextResponse.json(updatedPromotion)
  } catch (error) {
    console.error("Promotion update error:", error)
    return NextResponse.json({ error: "Failed to update promotion" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const promotionId = params.id

    // Check if the promotion belongs to the user's restaurant
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        restaurant: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!promotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 })
    }

    if (promotion.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to delete this promotion" }, { status: 403 })
    }

    await prisma.promotion.delete({
      where: { id: promotionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Promotion deletion error:", error)
    return NextResponse.json({ error: "Failed to delete promotion" }, { status: 500 })
  }
}
