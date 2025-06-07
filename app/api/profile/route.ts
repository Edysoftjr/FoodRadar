

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { uploadFile, STORAGE_PATHS } from "@/lib/supabase-storage"

// GET /api/profile - Get the current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        budget: true,
        preferences: true,
        location: true,
        phone: true,
        createdAt: true,
        restaurants: {
          select: {
            id: true,
            name: true,
            description: true,
            images: true,
            categories: true,
            priceRange: true,
            rating: true,
          },
        },
        favorites: {
          select: {
            id: true,
            restaurant: {
              select: {
                id: true,
                name: true,
                images: true,
                priceRange: true,
                rating: true,
                address: true,
                coordinates: true,
              },
            },
          },
        },
        mealFavorites: {
          select: {
            id: true,
            meal: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                restaurant: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
            status: true,
            restaurant: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
       
      },
    })
    
    console.log(user)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    /* Calculate stats
    const followersCount = user.followers.length
    const followingCount = user.following.length
*/
    const userWithStats = {
      ...user,
     /* followersCount,
      followingCount,*/
      isFollowing: false, // This would be calculated based on the requesting user
      recentOrders: user.orders,
      visitedRestaurants: [], // This would be calculated from order history
    }

    return NextResponse.json(userWithStats)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// PUT /api/profile - Update the current user's profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle multipart form data for file uploads
    const formData = await request.formData()
    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const budget = formData.get("budget") ? Number(formData.get("budget")) : undefined
    const preferences = JSON.parse((formData.get("preferences") as string) || "[]")
    const location = JSON.parse((formData.get("location") as string) || "null")
    const phone = formData.get("phone") as string

    // Handle profile image upload
    const profileImage = formData.get("image") as File | null
    let imageUrl = undefined

    if (profileImage) {
      // Get current user to check if they already have an image
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true },
      })

      // Upload new image, replacing old one if it exists
      imageUrl = await uploadFile(profileImage, STORAGE_PATHS.PROFILES, currentUser?.image || undefined)
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        budget,
        preferences: preferences || undefined,
        location: location || undefined,
        phone: phone || undefined,
        image: imageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        budget: true,
        preferences: true,
        location: true,
        phone: true,
        bio: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}



