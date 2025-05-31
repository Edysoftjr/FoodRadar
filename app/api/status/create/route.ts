import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const type = formData.get("type") as string
    const text = formData.get("text") as string
    const caption = formData.get("caption") as string
    const file = formData.get("file") as File

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would:
    // 1. Upload file to storage (if provided)
    // 2. Save status to database
    // 3. Set expiration time (24 hours)
    // 4. Notify followers

    const newStatus = {
      id: Date.now().toString(),
      type,
      content: {
        type,
        text: text || undefined,
        caption: caption || undefined,
        url: file ? "/placeholder.svg?height=400&width=400" : undefined,
      },
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json({
      status: newStatus,
      success: true,
    })
  } catch (error) {
    console.error("Error creating status:", error)
    return NextResponse.json({ error: "Failed to create status" }, { status: 500 })
  }
}
