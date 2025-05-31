import { NextResponse } from "next/server"

// Dummy data for status posts
const dummyStatusPosts = [
  {
    id: "1",
    user: {
      id: "user1",
      name: "Sarah Johnson",
      image: "/placeholder1.jpeg?height=40&width=40",
      type: "USER" as const,
      location: "Lagos, Nigeria",
    },
    content: {
      type: "image" as const,
      url: "/placeholder.svg?height=400&width=400",
      caption: "Amazing jollof rice at Mama's Kitchen! 🍚✨ #foodie #jollofrice",
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likes: 24,
    comments: 5,
    isLiked: false,
    location: "Victoria Island, Lagos",
  },
  {
    id: "2",
    user: {
      id: "restaurant1",
      name: "Bukka Hut",
      image: "/placeholder.svg?height=40&width=40",
      type: "RESTAURANT" as const,
      location: "Multiple Locations",
    },
    content: {
      type: "video" as const,
      url: "/placeholder.svg?height=400&width=400",
      caption: "Fresh suya being prepared right now! Come get yours while it's hot 🔥 #suya #fresh",
    },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    likes: 89,
    comments: 12,
    isLiked: true,
    location: "Ikeja, Lagos",
  },
  {
    id: "3",
    user: {
      id: "user2",
      name: "David Okafor",
      image: "/placeholder.svg?height=40&width=40",
      type: "USER" as const,
      location: "Abuja, Nigeria",
    },
    content: {
      type: "image" as const,
      url: "/placeholder.svg?height=400&width=400",
      caption: "Sunday brunch vibes at The Place! Their pancakes are incredible 🥞",
    },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    likes: 15,
    comments: 3,
    isLiked: false,
    location: "Wuse 2, Abuja",
  },
  {
    id: "4",
    user: {
      id: "restaurant2",
      name: "Terra Kulture",
      image: "/placeholder.svg?height=40&width=40",
      type: "RESTAURANT" as const,
      location: "Victoria Island, Lagos",
    },
    content: {
      type: "image" as const,
      url: "/placeholder.svg?height=400&width=400",
      caption: "New menu alert! 🚨 Try our signature pepper soup with fresh fish. Available all week!",
    },
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    likes: 156,
    comments: 28,
    isLiked: false,
    location: "Victoria Island, Lagos",
  },
  id: "5",
    user: {
      id: "user1",
      name: "Sarah Johnson",
      image: "/placeholder.svg?height=40&width=40",
      type: "USER" as const,
      location: "Lagos, Nigeria",
    },
    content: {
      type: "image" as const,
      url: "/placeholder.svg?height=400&width=400",
      caption: "Amazing jollof rice at Mama's Kitchen! 🍚✨ #foodie #jollofrice",
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likes: 24,
    comments: 5,
    isLiked: false,
    location: "Victoria Island, Lagos",
  },
  {
    id: "6",
    user: {
      id: "user3",
      name: "Amina Hassan",
      image: "/placeholder.svg?height=40&width=40",
      type: "USER" as const,
      location: "Kano, Nigeria",
    },
    content: {
      type: "image" as const,
      url: "/placeholder.svg?height=400&width=400",
      caption: "Best shawarma in town! 🌯 The sauce is just perfect. Highly recommend!",
    },
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    likes: 31,
    comments: 7,
    isLiked: true,
    location: "Sabon Gari, Kano",
  },
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    return NextResponse.json({
      posts: dummyStatusPosts,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching status posts:", error)
    return NextResponse.json({ error: "Failed to fetch status posts" }, { status: 500 })
  }
}
