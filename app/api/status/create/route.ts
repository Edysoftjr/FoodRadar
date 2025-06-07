import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { uploadFile, STORAGE_PATHS } from "@/lib/supabase-storage"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const type = formData.get("type") as string
    const text = formData.get("text") as string
    const caption = formData.get("caption") as string

    const content: any = { type }

    if (type === "text") {
      if (!text?.trim()) {
        return NextResponse.json({ error: "Text content is required" }, { status: 400 })
      }
      content.text = text.trim()
    } else if (type === "media") {
      const files = formData.getAll("files") as File[]
      if (files.length === 0) {
        return NextResponse.json({ error: "Media files are required" }, { status: 400 })
      }

      // Upload first file (for simplicity, handling single file)
      const file = files[0]
      const fileUrl = await uploadFile(file, STORAGE_PATHS.STATUS)

      if (!fileUrl) {
        return NextResponse.json({ error: "Failed to upload media" }, { status: 500 })
      }

      content.url = fileUrl
      if (caption?.trim()) {
        content.caption = caption.trim()
      }
    }

    // Get user's restaurant if they're a vendor
    let restaurantId = null
    if (session.user.role === "VENDOR") {
      const restaurant = await prisma.restaurant.findFirst({
        where: { ownerId: session.user.id },
      })
      restaurantId = restaurant?.id || null
    }

    const statusPost = await prisma.statusPost.create({
      data: {
        type,
        content,
        userId: session.user.id,
        restaurantId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    return NextResponse.json({
      status: {
        id: statusPost.id,
        type: statusPost.type,
        content: statusPost.content,
        timestamp: statusPost.createdAt.toISOString(),
        expiresAt: statusPost.expiresAt.toISOString(),
      },
      success: true,
    })
  } catch (error) {
    console.error("Error creating status:", error)
    return NextResponse.json({ error: "Failed to create status" }, { status: 500 })
  }
}
