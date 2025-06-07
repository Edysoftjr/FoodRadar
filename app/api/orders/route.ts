import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const restaurantId = searchParams.get("restaurantId")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const whereClause: any = {}

    // If user is a vendor, show orders for their restaurant
    if (session.user.role === "VENDOR") {
      const restaurant = await prisma.restaurant.findFirst({
        where: { ownerId: session.user.id },
      })
      if (restaurant) {
        whereClause.restaurantId = restaurant.id
      }
    } else {
      // Regular users see their own orders
      whereClause.userId = session.user.id
    }

    // Apply additional filters
    if (userId && session.user.role === "ADMIN") {
      whereClause.userId = userId
    }
    if (restaurantId && session.user.role === "ADMIN") {
      whereClause.restaurantId = restaurantId
    }
    if (status) {
      whereClause.status = status
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            images: true,
            address: true,
            phone: true,
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    const total = await prisma.order.count({ where: whereClause })

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { restaurantId, items, deliveryLocation, contactPhone, specialInstructions } = body

    // Validate required fields
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!deliveryLocation || !contactPhone) {
      return NextResponse.json({ error: "Delivery location and contact phone are required" }, { status: 400 })
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Verify all meals exist and calculate total
    const mealIds = items.map((item: any) => item.mealId)
    const meals = await prisma.meal.findMany({
      where: {
        id: { in: mealIds },
        restaurantId,
        isAvailable: true,
      },
    })

    if (meals.length !== mealIds.length) {
      return NextResponse.json({ error: "Some meals are not available" }, { status: 400 })
    }

    // Calculate total
    let total = 0
    const orderItems = items.map((item: any) => {
      const meal = meals.find((m) => m.id === item.mealId)
      if (!meal) throw new Error("Meal not found")

      const itemTotal = meal.price * item.quantity
      total += itemTotal

      return {
        mealId: item.mealId,
        quantity: item.quantity,
        price: meal.price,
        specialInstructions: item.specialInstructions || null,
      }
    })

    // Add delivery and service fees
    const deliveryFee = 500 // ₦500 delivery fee
    const serviceFee = total * 0.05 // 5% service fee
    const finalTotal = total + deliveryFee + serviceFee

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        restaurantId,
        status: "PENDING",
        total: finalTotal,
        deliveryFee,
        serviceFee,
        deliveryLocation,
        contactPhone,
        specialInstructions,
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            meal: true,
          },
        },
        restaurant: true,
      },
    })

    // Create notification for restaurant owner
    await prisma.notification.create({
      data: {
        type: "ORDER",
        title: "New Order",
        message: `New order from ${session.user.name}`,
        userId: restaurant.ownerId,
        senderId: session.user.id,
        data: {
          orderId: order.id,
          orderTotal: finalTotal,
          customerName: session.user.name,
        },
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
