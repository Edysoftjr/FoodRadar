import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // days

    // Check if the user is a vendor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "VENDOR") {
      return NextResponse.json({ error: "Only vendors can access analytics" }, { status: 403 })
    }

    // Find the restaurant
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const periodDays = Number.parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Get orders within the period
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        items: {
          include: {
            meal: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate analytics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get unique customers
    const uniqueCustomers = new Set(orders.map((order) => order.userId))
    const customersCount = uniqueCustomers.size

    // Get top customers
    const customerOrderCounts = orders.reduce(
      (acc, order) => {
        acc[order.userId] = (acc[order.userId] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topCustomers = Object.entries(customerOrderCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, orderCount]) => {
        const customer = orders.find((order) => order.userId === userId)?.user
        return {
          ...customer,
          orderCount,
          totalSpent: orders.filter((order) => order.userId === userId).reduce((sum, order) => sum + order.total, 0),
        }
      })

    // Get popular meals
    const mealCounts = orders
      .flatMap((order) => order.items)
      .reduce(
        (acc, item) => {
          acc[item.mealId] = (acc[item.mealId] || 0) + item.quantity
          return acc
        },
        {} as Record<string, number>,
      )

    const popularMeals = Object.entries(mealCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([mealId, count]) => {
        const meal = orders.flatMap((order) => order.items).find((item) => item.mealId === mealId)?.meal
        return {
          ...meal,
          orderCount: count,
        }
      })

    // Daily revenue for chart
    const dailyRevenue = orders.reduce(
      (acc, order) => {
        const date = order.createdAt.toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + order.total
        return acc
      },
      {} as Record<string, number>,
    )

    const revenueChart = Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }))

    return NextResponse.json({
      analytics: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        customersCount,
        period: periodDays,
      },
      orders: orders.slice(0, 20), // Latest 20 orders
      topCustomers,
      popularMeals,
      revenueChart,
    })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
