import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { uploadFile, STORAGE_PATHS } from "@/lib/supabase-storage"

// GET /api/profile/restaurant - Get the current user's restaurant profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is a vendor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "VENDOR") {
      return NextResponse.json({ error: "Only vendors can access restaurant profiles" }, { status: 403 })
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: session.user.id },
      include: {
        meals: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("Restaurant profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch restaurant profile" }, { status: 500 })
  }
}

// PUT /api/profile/restaurant - Update the current user's restaurant profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is a vendor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "VENDOR") {
      return NextResponse.json({ error: "Only vendors can update restaurant profiles" }, { status: 403 })
    }

    // Handle multipart form data for file uploads
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const address = formData.get("address") as string
    const coordinates = JSON.parse((formData.get("coordinates") as string) || '{"latitude": 0, "longitude": 0}')
    const categories = JSON.parse((formData.get("categories") as string) || "[]")
    const priceRange = JSON.parse((formData.get("priceRange") as string) || '{"min": 0, "max": 0, "average": 0}')
    const phone = formData.get("phone") as string
    const website = formData.get("website") as string
    const openingHours = JSON.parse((formData.get("openingHours") as string) || "{}")

    // Handle cover image upload
    const coverImage = formData.get("coverImage") as File | null
    let coverImageUrl = null

    if (coverImage) {
      coverImageUrl = await uploadFile(coverImage, STORAGE_PATHS.RESTAURANTS.COVERS)
    }

    // Handle gallery images upload
    const galleryImages = formData.getAll("galleryImages") as File[]
    const galleryImageUrls: string[] = []

    for (const image of galleryImages) {
      const imageUrl = await uploadFile(image, STORAGE_PATHS.RESTAURANTS.GALLERY)
      if (imageUrl) {
        galleryImageUrls.push(imageUrl)
      }
    }

    // Find the restaurant or create it if it doesn't exist
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: { ownerId: session.user.id },
    })

    let restaurant
    let images = []

    // Prepare images array
    if (existingRestaurant) {
      images = [...existingRestaurant.images]

      // Add new cover image if uploaded
      if (coverImageUrl) {
        // Replace first image if it exists, otherwise add it
        if (images.length > 0) {
          images[0] = coverImageUrl
        } else {
          images.push(coverImageUrl)
        }
      }

      // Add new gallery images
      images = [...images, ...galleryImageUrls]
    } else {
      // For new restaurant
      if (coverImageUrl) {
        images.push(coverImageUrl)
      }
      images = [...images, ...galleryImageUrls]
    }

    if (existingRestaurant) {
      // Update existing restaurant
      restaurant = await prisma.restaurant.update({
        where: { id: existingRestaurant.id },
        data: {
          name,
          description,
          address,
          coordinates,
          images,
          categories,
          priceRange,
          phone,
          website,
          openingHours,
        },
      })
    } else {
      // Create new restaurant
      restaurant = await prisma.restaurant.create({
        data: {
          name,
          description,
          address,
          coordinates: coordinates || { latitude: 0, longitude: 0 },
          images,
          categories: categories || [],
          priceRange: priceRange || { min: 0, max: 0, average: 0 },
          phone,
          website,
          openingHours,
          owner: {
            connect: { id: session.user.id },
          },
        },
      })
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("Restaurant profile update error:", error)
    return NextResponse.json({ error: "Failed to update restaurant profile" }, { status: 500 })
  }
}
