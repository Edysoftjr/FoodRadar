import { NextResponse } from "next/server"

// Dummy data for community posts
const dummyCommunityPosts = [
  {
    id: "1",
    user: {
      id: "user1",
      name: "Sarah Johnson",
      image: "/placeholder.svg?height=40&width=40",
      type: "USER" as const,
    },
    restaurant: {
      id: "rest1",
      name: "Mama's Kitchen",
      rating: 4.5,
    },
    content:
      "Just had the most amazing experience at Mama's Kitchen! The jollof rice was perfectly seasoned and the customer service was top-notch. The ambiance is also very cozy. Definitely coming back soon! 🍚✨",
    images: ["/placeholder.svg?height=300&width=300", "/placeholder.svg?height=300&width=300"],
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    likes: 42,
    comments: 8,
    isLiked: false,
    replies: [
      {
        id: "reply1",
        user: {
          id: "user2",
          name: "David Okafor",
          image: "/placeholder.svg?height=32&width=32",
        },
        content: "I totally agree! Their jollof is the best in the area. Have you tried their pepper soup?",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        likes: 5,
        isLiked: false,
      },
      {
        id: "reply2",
        user: {
          id: "user3",
          name: "Amina Hassan",
          image: "/placeholder.svg?height=32&width=32",
        },
        content: "Thanks for the recommendation! Adding this to my must-visit list 📝",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        likes: 2,
        isLiked: true,
      },
    ],
  },
  {
    id: "2",
    user: {
      id: "restaurant1",
      name: "Bukka Hut",
      image: "/placeholder.svg?height=40&width=40",
      type: "RESTAURANT" as const,
    },
    content:
      "We're excited to announce our new weekend special! Every Saturday and Sunday, enjoy 20% off all our traditional dishes. Come experience authentic Nigerian cuisine at its finest! What's your favorite dish from our menu? Let us know in the comments! 🍽️",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    likes: 127,
    comments: 23,
    isLiked: true,
    replies: [
      {
        id: "reply3",
        user: {
          id: "user4",
          name: "Kemi Adebayo",
          image: "/placeholder.svg?height=32&width=32",
        },
        content: "Love your egusi soup! Will definitely be there this weekend 😍",
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        isLiked: false,
      },
      {
        id: "reply4",
        user: {
          id: "user5",
          name: "Chidi Okwu",
          image: "/placeholder.svg?height=32&width=32",
        },
        content: "The pounded yam and vegetable soup combo is my go-to! 🍠",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        isLiked: true,
      },
    ],
  },
  {
    id: "3",
    user: {
      id: "user6",
      name: "Fatima Bello",
      image: "/placeholder.svg?height=40&width=40",
      type: "USER" as const,
    },
    restaurant: {
      id: "rest2",
      name: "The Place Restaurant",
      rating: 4.2,
    },
    content:
      "Had a disappointing experience at The Place Restaurant yesterday. The food took over an hour to arrive and when it did, it was cold. The waiter seemed overwhelmed and barely checked on us. For the prices they charge, I expected much better service. Has anyone else had similar issues here recently?",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    likes: 18,
    comments: 15,
    isLiked: false,
    replies: [
      {
        id: "reply5",
        user: {
          id: "user7",
          name: "Ahmed Musa",
          image: "/placeholder.svg?height=32&width=32",
        },
        content:
          "Sorry to hear about your experience. I was there last week and had great service. Maybe they were having an off day?",
        timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
        likes: 3,
        isLiked: false,
      },
      {
        id: "reply6",
        user: {
          id: "restaurant2",
          name: "The Place Restaurant",
          image: "/placeholder.svg?height=32&width=32",
        },
        content:
          "Hi Fatima, we sincerely apologize for your poor experience. Please send us a DM with more details so we can make this right. We're committed to improving our service.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 25,
        isLiked: false,
      },
    ],
  },
  {
    id: "4",
    user: {
      id: "user8",
      name: "Tunde Adeyemi",
      image: "/placeholder.svg?height=40&width=40",
      type: "USER" as const,
    },
    content:
      "Looking for recommendations for a good seafood restaurant in Lagos. Planning a date night and want somewhere with great ambiance and fresh fish. Budget is around ₦15,000 for two people. Any suggestions? 🐟🦐",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    likes: 31,
    comments: 19,
    isLiked: false,
    replies: [
      {
        id: "reply7",
        user: {
          id: "user9",
          name: "Grace Okonkwo",
          image: "/placeholder.svg?height=32&width=32",
        },
        content:
          "Try Ocean Basket at The Palms! Great seafood and perfect for dates. Should be within your budget too.",
        timestamp: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString(),
        likes: 7,
        isLiked: true,
      },
      {
        id: "reply8",
        user: {
          id: "user10",
          name: "Emeka Nwosu",
          image: "/placeholder.svg?height=32&width=32",
        },
        content: "Yellow Chilli has amazing seafood pasta and the atmosphere is romantic. Highly recommend! 🍝",
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        likes: 9,
        isLiked: false,
      },
    ],
  },
  {
    id: "5",
    user: {
      id: "user11",
      name: "Blessing Okafor",
      image: "/placeholder.svg?height=40&width=40",
      type: "USER" as const,
    },
    restaurant: {
      id: "rest3",
      name: "Terra Kulture",
      rating: 4.7,
    },
    content:
      "Terra Kulture never disappoints! Just finished their cultural dinner experience and it was absolutely phenomenal. The traditional music, the authentic dishes, and the storytelling made it such a memorable evening. If you want to experience Nigerian culture through food, this is the place! 🎭🍽️",
    images: ["/placeholder.svg?height=300&width=300"],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    likes: 89,
    comments: 12,
    isLiked: true,
    replies: [
      {
        id: "reply9",
        user: {
          id: "user12",
          name: "Yusuf Ibrahim",
          image: "/placeholder.svg?height=32&width=32",
        },
        content: "I've been wanting to try their cultural dinner! How much did it cost?",
        timestamp: new Date(Date.now() - 11.5 * 60 * 60 * 1000).toISOString(),
        likes: 2,
        isLiked: false,
      },
      {
        id: "reply10",
        user: {
          id: "restaurant3",
          name: "Terra Kulture",
          image: "/placeholder.svg?height=32&width=32",
        },
        content:
          "Thank you for the wonderful review, Blessing! We're thrilled you enjoyed the experience. Our cultural dinners are ₦8,500 per person and include the full experience. 🙏",
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        likes: 15,
        isLiked: false,
      },
    ],
  },
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    return NextResponse.json({
      posts: dummyCommunityPosts,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching community posts:", error)
    return NextResponse.json({ error: "Failed to fetch community posts" }, { status: 500 })
  }
}
