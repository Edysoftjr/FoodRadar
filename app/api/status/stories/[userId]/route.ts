import { NextResponse } from "next/server"

// Dummy story posts for specific users
const dummyStoryPosts: Record<string, any[]> = {
  user1: [
    {
      id: "user1-post1",
      user: {
        id: "user1",
        name: "Sarah Johnson",
        image: "/avatars/sarah.jpg",
        type: "USER",
      },
      content: {
        type: "image",
        url: "/stories/sarah-jollof.jpg",
        caption: "Amazing jollof rice from the new spot! 🍚 Definitely coming back!",
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      views: 24,
    },
    {
      id: "user1-post2",
      user: {
        id: "user1",
        name: "Sarah Johnson",
        image: "/avatars/sarah.jpg",
        type: "USER",
      },
      content: {
        type: "text", // Changed from video to text
        text: "Just had the most insightful conversation about sustainable farming. Food for thought! 💡", // Text content
      },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
      views: 18,
    },
    {
      id: "user1-post3",
      user: {
        id: "user1",
        name: "Sarah Johnson",
        image: "/avatars/sarah.jpg",
        type: "USER",
      },
      content: {
        type: "image", // Changed from text to image
        url: "/stories/sarah-morning-vibes.jpg", // New image URL
        caption: "Morning coffee fix! ☕ Perfect start to a productive day.",
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      expiresAt: new Date(Date.now() + 23.5 * 60 * 60 * 1000).toISOString(),
      views: 10,
    },
  ],
  restaurant1: [
    {
      id: "restaurant1-post1",
      user: {
        id: "restaurant1",
        name: "Ngozi's Restaurant",
        image: "/avatars/ngozi-rest.jpg",
        type: "RESTAURANT",
        location: "Victoria Island, Lagos"
      },
      content: {
        type: "image",
        url: "/stories/ngozi-suya.jpg",
        caption: "Fresh suya being prepared for tonight's rush! 🔥 Come get yours!",
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
      views: 89,
    },
    {
      id: "restaurant1-post2",
      user: {
        id: "restaurant1",
        name: "Ngozi's Restaurant",
        image: "/avatars/ngozi-rest.jpg",
        type: "RESTAURANT",
        location: "Victoria Island, Lagos"
      },
      content: {
        type: "image", // Changed from video to image
        url: "/stories/ngozi-chef-dish.jpg", // New image URL
        caption: "Chef Tunde's special Jollof Spaghetti! Available starting this evening! 🍝",
      },
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
      views: 75,
    },
     {
      id: "restaurant1-post3",
      user: {
        id: "restaurant1",
        name: "Ngozi's Restaurant",
        image: "/avatars/ngozi-rest.jpg",
        type: "RESTAURANT",
        location: "Victoria Island, Lagos"
      },
      content: {
        type: "text",
        text: "New menu items launching next week! Stay tuned for a taste of innovation! 🚀 #NigerianCuisine",
      },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
      views: 50,
    },
  ],
  user2: [
    {
      id: "user2-post1",
      user: {
        id: "user2",
        name: "David Okafor",
        image: "/avatars/david.jpg",
        type: "USER",
      },
      content: {
        type: "text",
        text: "Best shawarma in town, hands down! 🌯 If you haven't tried it, you're missing out!",
      },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
      views: 15,
    },
    {
      id: "user2-post2",
      user: {
        id: "user2",
        name: "David Okafor",
        image: "/avatars/david.jpg",
        type: "USER",
      },
      content: {
        type: "image",
        url: "/stories/david-coffee.jpg",
        caption: "Morning coffee fix! ☕ Perfect start to a productive day.",
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      views: 10,
    },
  ],
  restaurant2: [
    {
      id: "restaurant2-post1",
      user: {
        id: "restaurant2",
        name: "Taste of Lagos",
        image: "/avatars/taste-of-lagos.jpg",
        type: "RESTAURANT",
        location: "Lekki, Lagos"
      },
      content: {
        type: "image",
        url: "/stories/taste-of-lagos-interiors.jpg",
        caption: "Our cozy dining space awaits you! ✨ Book your table now.",
      },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      views: 120,
    },
    {
      id: "restaurant2-post2",
      user: {
        id: "restaurant2",
        name: "Taste of Lagos",
        image: "/avatars/taste-of-lagos.jpg",
        type: "RESTAURANT",
        location: "Lekki, Lagos"
      },
      content: {
        type: "text", // Changed from video to text
        text: "Exciting news! We're hosting a special tasting event next Friday. DM us for invites! 🥂",
      },
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
      views: 95,
    },
  ]
}

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

    const posts = dummyStoryPosts[userId] || []

    return NextResponse.json({
      posts,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching story posts:", error)
    return NextResponse.json({ error: "Failed to fetch story posts" }, { status: 500 })
  }
}
