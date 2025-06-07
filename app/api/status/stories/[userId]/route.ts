import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    // Check if userId is a restaurant ID
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: userId },
    })

    const statusPosts = await prisma.statusPost.findMany({
      where: {
        AND: [{ expiresAt: { gt: new Date() } }, restaurant ? { restaurantId: userId } : { userId }],
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
        views: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // Mark as viewed
    const viewPromises = statusPosts.map((post) =>
      prisma.statusView.upsert({
        where: {
          userId_statusPostId: {
            userId: session.user.id,
            statusPostId: post.id,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          statusPostId: post.id,
        },
      }),
    )

    await Promise.all(viewPromises)

    const transformedPosts = statusPosts.map((post) => ({
      id: post.id,
      user: {
        id: restaurant ? restaurant.id : post.user.id,
        name: restaurant ? restaurant.name : post.user.name,
        image: restaurant ? restaurant.images[0] : post.user.image,
        type: restaurant ? "RESTAURANT" : "USER",
      },
      content: post.content,
      timestamp: post.createdAt.toISOString(),
      expiresAt: post.expiresAt.toISOString(),
      views: post.views.length,
    }))

    return NextResponse.json({
      posts: transformedPosts,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching user stories:", error)
    return NextResponse.json({ error: "Failed to fetch user stories" }, { status: 500 })
  }
}
