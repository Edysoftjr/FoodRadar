import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const posts = await prisma.post.findMany({
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
            rating: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
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
            },
            _count: {
              select: { likes: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // Transform posts to include user interaction data
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      user: {
        id: post.user.id,
        name: post.user.name,
        image: post.user.image,
        type: post.user.role === "VENDOR" ? "RESTAURANT" : "USER",
      },
      restaurant: post.restaurant,
      content: post.content,
      images: post.images,
      timestamp: post.createdAt.toISOString(),
      likes: post._count.likes,
      comments: post._count.comments,
      isLiked: currentUserId ? post.likes.some((like) => like.userId === currentUserId) : false,
      replies: post.comments.map((comment) => ({
        id: comment.id,
        user: comment.user,
        content: comment.content,
        timestamp: comment.createdAt.toISOString(),
        likes: comment._count.likes,
        isLiked: currentUserId ? comment.likes.some((like) => like.userId === currentUserId) : false,
        replies: comment.replies?.map((reply) => ({
          id: reply.id,
          user: reply.user,
          content: reply.content,
          timestamp: reply.createdAt.toISOString(),
          likes: reply._count.likes,
          isLiked: currentUserId ? reply.likes.some((like) => like.userId === currentUserId) : false,
        })),
      })),
    }))

    return NextResponse.json({
      posts: transformedPosts,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching community posts:", error)
    return NextResponse.json({ error: "Failed to fetch community posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, restaurantId, images = [] } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        images,
        userId: session.user.id,
        restaurantId: restaurantId || null,
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
            rating: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    const transformedPost = {
      id: post.id,
      user: {
        id: post.user.id,
        name: post.user.name,
        image: post.user.image,
        type: post.user.role === "VENDOR" ? "RESTAURANT" : "USER",
      },
      restaurant: post.restaurant,
      content: post.content,
      images: post.images,
      timestamp: post.createdAt.toISOString(),
      likes: post._count.likes,
      comments: post._count.comments,
      isLiked: false,
      replies: [],
    }

    return NextResponse.json(transformedPost)
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
