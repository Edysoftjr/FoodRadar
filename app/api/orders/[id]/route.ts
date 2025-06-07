import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            images: true,
            address: true,
            phone: true,
            coordinates: true,
            ownerId: true,
          },
        },
        items: {
          include: {
            meal: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user has permission to view this order
    const isOwner = order.userId === session.user.id
    const isRestaurantOwner = order.restaurant.ownerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isRestaurantOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error(`Error fetching order ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ["PENDING", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get order to check permissions
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check permissions - only restaurant owner can update order status
    if (order.restaurant.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        actualDeliveryTime: status === "DELIVERED" ? new Date() : undefined,
      },
      include: {
        items: {
          include: {
            meal: true,
          },
        },
        restaurant: true,
        user: true,
      },
    })

    // Create notification for customer
    const statusMessages = {
      ACCEPTED: "Your order has been accepted",
      PREPARING: "Your order is being prepared",
      READY: "Your order is ready for pickup/delivery",
      OUT_FOR_DELIVERY: "Your order is out for delivery",
      DELIVERED: "Your order has been delivered",
      CANCELLED: "Your order has been cancelled",
    }

    await prisma.notification.create({
      data: {
        type: "ORDER_UPDATE",
        title: "Order Update",
        message: statusMessages[status as keyof typeof statusMessages] || "Order status updated",
        userId: order.userId,
        senderId: session.user.id,
        data: {
          orderId: order.id,
          status,
          restaurantName: order.restaurant.name,
        },
      },
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error(`Error updating order ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
