import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        bio: true,
        location: true,
        createdAt: true,
        restaurants: {
          include: {
            meals: {
              where: { isAvailable: true },
              orderBy: { createdAt: "desc" },
            },
            _count: {
              select: {
                reviews: true,
                followers: true,
              },
            },
          },
        },
        favorites: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                images: true,
                priceRange: true,
                rating: true,
                address: true,
              },
            },
          },
        },
        mealFavorites: {
          include: {
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
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if current user is following this user/restaurant
    let isFollowing = false
    if (session?.user?.id && session.user.id !== id) {
      if (user.role === "VENDOR" && user.restaurants[0]) {
        const restaurantFollow = await prisma.follow.findUnique({
          where: {
            followerId_restaurantId: {
              followerId: session.user.id,
              restaurantId: user.restaurants[0].id,
            },
          },
        })
        isFollowing = !!restaurantFollow
      } else {
        const userFollow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: id,
            },
          },
        })
        isFollowing = !!userFollow
      }
    }

    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing,
      restaurant:
        user.role === "VENDOR" && user.restaurants[0]
          ? {
              ...user.restaurants[0],
              reviewCount: user.restaurants[0]._count.reviews,
              followersCount: user.restaurants[0]._count.followers,
            }
          : null,
      favorites: user.favorites,
      mealFavorites: user.mealFavorites,
      recentOrders: user.orders,
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
