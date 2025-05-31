import { NextResponse } from "next/server"

// Dummy notifications data
const dummyNotifications = [
  {
    id: "1",
    title: "New Order",
    message: "You have a new order from John Doe",
    time: "2 minutes ago",
    type: "order",
    read: false,
  },
  {
    id: "2",
    title: "Order Ready",
    message: "Your order from Bukka Hut is ready for pickup",
    time: "15 minutes ago",
    type: "order_update",
    read: false,
  },
  {
    id: "3",
    title: "New Follower",
    message: "Sarah Johnson started following you",
    time: "1 hour ago",
    type: "social",
    read: true,
  },
  {
    id: "4",
    title: "Restaurant Review",
    message: "Someone reviewed your restaurant",
    time: "2 hours ago",
    type: "review",
    read: true,
  },
]

export async function GET() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json({
      notifications: dummyNotifications,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
