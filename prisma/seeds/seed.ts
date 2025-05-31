import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  try {
    // Create a test user if none exists
    const userCount = await prisma.user.count()

    if (userCount === 0) {
      // Create test users
      const adminPassword = await hash("admin123", 10)
      const userPassword = await hash("user123", 10)
      const vendorPassword = await hash("vendor123", 10)

      const admin = await prisma.user.create({
        data: {
          email: "admin@foodradar.com",
          name: "Admin User",
          password: adminPassword,
          role: "ADMIN",
        },
      })

      const user = await prisma.user.create({
        data: {
          email: "user@example.com",
          name: "Test User",
          password: userPassword,
          role: "USER",
          budget: 3000,
          preferences: ["Spicy", "Local"],
          location: {
            latitude: 6.5244,
            longitude: 3.3792,
            address: "Lagos, Nigeria",
          },
        },
      })

      const vendor = await prisma.user.create({
        data: {
          email: "vendor@example.com",
          name: "Restaurant Owner",
          password: vendorPassword,
          role: "VENDOR",
        },
      })

      // Create test restaurant
      const restaurant = await prisma.restaurant.create({
        data: {
          name: "Tasty Delights",
          description: "Authentic Nigerian cuisine with a modern twist",
          address: "123 Lagos Street, Lagos",
          coordinates: { latitude: 6.5244, longitude: 3.3792 },
          categories: ["Local", "Continental"],
          priceRange: { min: 1500, max: 5000, average: 2500 },
          rating: 4.5,
          reviewCount: 120,
          images: ["/placeholder.jpg"],
          owner: {
            connect: {
              id: vendor.id,
            },
          },
        },
      })

      // Create test meals
      const meals = [
        {
          name: "Jollof Rice",
          description: "Spicy rice dish cooked with tomatoes and spices",
          price: 1800,
          categories: ["Local"],
          image: "/placeholder.jpg",
          restaurant: {
            connect: {
              id: restaurant.id,
            },
          },
        },
        {
          name: "Pounded Yam and Egusi Soup",
          description: "Smooth pounded yam with melon seed soup",
          price: 2500,
          categories: ["Local"],
          image: "/placeholder.jpg",
          restaurant: {
            connect: {
              id: restaurant.id,
            },
          },
        },
        {
          name: "Grilled Chicken",
          description: "Marinated chicken grilled to perfection",
          price: 3000,
          categories: ["Continental"],
          image: "/placeholder.jpg",
          restaurant: {
            connect: {
              id: restaurant.id,
            },
          },
        },
      ]

      for (const meal of meals) {
        await prisma.meal.create({
          data: meal,
        })
      }

      console.log("Database seeded successfully!")
    } else {
      console.log("Database already has users, skipping seed")
    }
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
