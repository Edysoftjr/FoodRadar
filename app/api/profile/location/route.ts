import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { latitude, longitude, address, neighborhood, city, accuracy } = body

    // Validate required fields
    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        location: {
          latitude: Number.parseFloat(latitude),
          longitude: Number.parseFloat(longitude),
          address: address || "",
          neighborhood: neighborhood || "",
          city: city || "",
          accuracy: accuracy || 0,
        },
      },
      select: {
        id: true,
        location: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Location update error:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}
