import { NextResponse } from "next/server"

// Dummy suggested follows
const dummySuggested = [
  {
    id: "suggest1",
    name: "Chicken Republic",
    image: "/placeholder.svg?height=40&width=40",
    type: "RESTAURANT" as const,
    category: "Fast Food",
    rating: 4.2,
  },
  {
    id: "suggest2",
    name: "Amina Hassan",
    image: "/placeholder.svg?height=40&width=40",
    type: "USER" as const,
    mutualConnections: 5,
  },
  {
    id: "suggest3",
    name: "Yellow Chilli",
    image: "/placeholder.svg?height=40&width=40",
    type: "RESTAURANT" as const,
    category: "Indian Cuisine",
    rating: 4.5,
  },
  {
    id: "suggest4",
    name: "John Doe",
    image: "/placeholder.svg?height=40&width=40",
    type: "USER" as const,
    mutualConnections: 3,
  },
  {
    id: "suggest5",
    name: "Mama Cass",
    image: "/placeholder.svg?height=40&width=40",
    type: "RESTAURANT" as const,
    category: "Local Nigerian",
    rating: 4.7,
  },
]

export async function GET() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 400))

    return NextResponse.json({
      suggested: dummySuggested,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching suggested follows:", error)
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 })
  }
}
