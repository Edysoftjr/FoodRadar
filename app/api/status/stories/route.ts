import { NextResponse } from "next/server"

// Dummy data for status stories
const dummyStories = [
  {
    id: 0,
    user: {
      id: "user1",
      name: "Sarah",
      image: "/placeholder.jpg?height=40&width=40",
      type: "USER" as const,
    },
    hasUnread: true,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 1,
    user: {
      id: "restaurant1",
      name: "Bukka Hut",
      image: "/placeholder1.jpeg?height=40&width=40",
      type: "RESTAURANT" as const,
    },
    hasUnread: true,
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    user: {
      id: "user2",
      name: "David",
      image: "/placeholder.jpg?height=40&width=40",
      type: "USER" as const,
    },
    hasUnread: false,
    lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    user: {
      id: "restaurant1",
      name: "Bukka Hut",
      image: "/placeholder.jpeg",
      type: "RESTAURANT" as const,
    },
    hasUnread: true,
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    user: {
      id: "restaurant1",
      name: "Bukka Hut",
      image: "/placeholder1.jpeg?height=40&width=40",
      type: "RESTAURANT" as const,
    },
    hasUnread: true,
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  }
  
]

export async function GET() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 100))

    return NextResponse.json({
      stories: dummyStories,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
  }
}
