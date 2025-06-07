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

    const { id: postId } = params

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ message: "Post unliked", isLiked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      })

      // Create notification if not liking own post
      if (post.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: "LIKE",
            title: "Post Liked",
            message: `${session.user.name} liked your post`,
            userId: post.userId,
            senderId: session.user.id,
            data: {
              postId,
              postContent: post.content.substring(0, 50),
            },
          },
        })
      }

      return NextResponse.json({ message: "Post liked", isLiked: true })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}
