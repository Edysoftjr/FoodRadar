import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ stories: [] })
    }

    // Get users and restaurants that the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            images: true,
            owner: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    // Get recent status posts from followed users/restaurants
    const followedUserIds = following.filter((f) => f.following).map((f) => f.following!.id)

    const followedRestaurantIds = following.filter((f) => f.restaurant).map((f) => f.restaurant!.id)

    const recentStatuses = await prisma.statusPost.findMany({
      where: {
        AND: [
          { expiresAt: { gt: new Date() } },
          {
            OR: [{ userId: { in: followedUserIds } }, { restaurantId: { in: followedRestaurantIds } }],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
        views: {
          where: { userId: session.user.id },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Group by user/restaurant and check for unread status
    const storiesMap = new Map()

    recentStatuses.forEach((status) => {
      const key = status.restaurantId || status.userId
      const isRestaurant = !!status.restaurantId

      if (!storiesMap.has(key)) {
        storiesMap.set(key, {
          id: key,
          user: {
            id: isRestaurant ? status.restaurant!.id : status.user.id,
            name: isRestaurant ? status.restaurant!.name : status.user.name,
            image: isRestaurant ? status.restaurant!.images[0] : status.user.image,
            type: isRestaurant ? "RESTAURANT" : "USER",
          },
          hasUnread: status.views.length === 0,
          lastUpdated: status.createdAt.toISOString(),
        })
      } else {
        const existing = storiesMap.get(key)
        if (status.views.length === 0) {
          existing.hasUnread = true
        }
        if (status.createdAt > new Date(existing.lastUpdated)) {
          existing.lastUpdated = status.createdAt.toISOString()
        }
      }
    })

    const stories = Array.from(storiesMap.values())

    return NextResponse.json({
      stories,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
  }
}
