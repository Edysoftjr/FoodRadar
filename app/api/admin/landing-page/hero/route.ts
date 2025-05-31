import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { deleteImage } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    // Check if user is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { imageUrl } = await request.json()

    // Update or create landing page settings
    const landingPageSettings = await prisma.landingPageSettings.upsert({
      where: { id: 1 }, // Assuming a single record for landing page settings
      update: { heroImage: imageUrl },
      create: {
        id: 1,
        heroImage: imageUrl,
        featuredRestaurantIds: [],
      },
    })

    return NextResponse.json({ success: true, heroImage: landingPageSettings.heroImage })
  } catch (error) {
    console.error("Error updating hero image:", error)
    return NextResponse.json({ error: "Failed to update hero image" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession()

    // Check if user is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current hero image URL
    const landingPageSettings = await prisma.landingPageSettings.findFirst()

    if (landingPageSettings?.heroImage) {
      // Extract path from URL to delete from Supabase
      const url = new URL(landingPageSettings.heroImage)
      const path = url.pathname.split("/").slice(-2).join("/") // Get "hero/filename.ext"

      // Delete the image from Supabase storage
      await deleteImage("landing-page", path)
    }

    // Update landing page settings
    await prisma.landingPageSettings.update({
      where: { id: 1 },
      data: { heroImage: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting hero image:", error)
    return NextResponse.json({ error: "Failed to delete hero image" }, { status: 500 })
  }
}
