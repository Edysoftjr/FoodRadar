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
    const body = await request.json()
    const { content, parentId } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // If parentId is provided, check if parent comment exists
    let parentComment = null
    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: { user: true },
      })

      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 })
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        postId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    })

    // Create notification for post owner (if not commenting on own post)
    if (post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          title: parentId ? "New Reply" : "New Comment",
          message: parentId
            ? `${session.user.name} replied to your comment`
            : `${session.user.name} commented on your post`,
          userId: post.userId,
          senderId: session.user.id,
          data: {
            postId,
            commentId: comment.id,
            commentContent: content.substring(0, 50),
          },
        },
      })
    }

    // Create notification for parent comment owner (if replying and not to own comment)
    if (parentComment && parentComment.userId !== session.user.id && parentComment.userId !== post.userId) {
      await prisma.notification.create({
        data: {
          type: "REPLY",
          title: "Reply to Comment",
          message: `${session.user.name} replied to your comment`,
          userId: parentComment.userId,
          senderId: session.user.id,
          data: {
            postId,
            commentId: comment.id,
            parentCommentId: parentId,
            replyContent: content.substring(0, 50),
          },
        },
      })
    }

    const transformedComment = {
      id: comment.id,
      user: comment.user,
      content: comment.content,
      timestamp: comment.createdAt.toISOString(),
      likes: comment._count.likes,
      isLiked: false,
    }

    return NextResponse.json(transformedComment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
