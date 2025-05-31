import { type NextRequest, NextResponse } from "next/server"

// This would be a real implementation using a database
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // In a real implementation, this would query the database

    // Mock data
    const comments = [
      {
        id: "comment-1",
        userId: "user-123",
        userName: "John Doe",
        userImage: "/placeholder.svg?height=40&width=40",
        content: "This place has the best jollof rice I've ever tasted! The spices are perfectly balanced.",
        likes: 12,
        userLiked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        replies: [
          {
            id: "reply-1",
            userId: "user-456",
            userName: "Jane Smith",
            userImage: "/placeholder.svg?height=40&width=40",
            content: "I agree! Their jollof rice is amazing. Have you tried their plantain as well?",
            likes: 3,
            userLiked: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          },
        ],
      },
      // More comments...
    ]

    return NextResponse.json({ comments })
  } catch (error) {
    console.error(`Error fetching restaurant ${params.id} comments:`, error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { content, userId } = await request.json()

    // In a real implementation, this would create a new comment in the database

    return NextResponse.json({
      success: true,
      comment: {
        id: `comment-${Date.now()}`,
        userId,
        userName: "Current User",
        userImage: "/placeholder.svg?height=40&width=40",
        content,
        likes: 0,
        userLiked: false,
        createdAt: new Date().toISOString(),
        replies: [],
      },
    })
  } catch (error) {
    console.error(`Error creating comment for restaurant ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
