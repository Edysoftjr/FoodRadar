import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: restaurantId } = params

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_restaurantId: {
          followerId: session.user.id,
          restaurantId,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      })

      // Create notification for unfollow (optional)
      return NextResponse.json({ message: "Unfollowed successfully", isFollowing: false })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          restaurantId,
        },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          type: "FOLLOW",
          title: "New Follower",
          message: `${session.user.name} started following your restaurant`,
          userId: restaurant.ownerId,
          senderId: session.user.id,
          data: {
            restaurantId,
            followerName: session.user.name,
          },
        },
      })

      return NextResponse.json({ message: "Followed successfully", isFollowing: true })
    }
  } catch (error) {
    console.error("Error toggling follow:", error)
    return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ isFollowing: false })
    }

    const { id: restaurantId } = params

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_restaurantId: {
          followerId: session.user.id,
          restaurantId,
        },
      },
    })

    return NextResponse.json({ isFollowing: !!follow })
  } catch (error) {
    console.error("Error checking follow status:", error)
    return NextResponse.json({ isFollowing: false })
  }
}
