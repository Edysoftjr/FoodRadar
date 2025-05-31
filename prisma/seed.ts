import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  try {
    // Check existing users and create if needed
    console.log("Checking for existing users...")
    
    let admin = await prisma.user.findUnique({
      where: { email: "admin@foodradar.com" }
    })
    
    let user = await prisma.user.findUnique({
      where: { email: "user@example.com" }
    })
    
    let vendor = await prisma.user.findUnique({
      where: { email: "vendor@example.com" }
    })

    // Create users if they don't exist
    if (!admin) {
      console.log("Creating admin user...")
      const adminPassword = await hash("admin123", 10)
      admin = await prisma.user.create({
        data: {
          email: "admin@foodradar.com",
          name: "Admin User",
          password: adminPassword,
          role: "ADMIN",
        },
      })
      console.log("Admin user created:", admin.email)
    } else {
      console.log("Admin user already exists:", admin.email)
    }

    if (!user) {
      console.log("Creating test user...")
      const userPassword = await hash("user123", 10)
      user = await prisma.user.create({
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
      console.log("Test user created:", user.email)
    } else {
      console.log("Test user already exists:", user.email)
    }

    if (!vendor) {
      console.log("Creating vendor user...")
      const vendorPassword = await hash("vendor123", 10)
      vendor = await prisma.user.create({
        data: {
          email: "vendor@example.com",
          name: "Restaurant Owner",
          password: vendorPassword,
          role: "VENDOR",
        },
      })
      console.log("Vendor user created:", vendor.email)
    } else {
      console.log("Vendor user already exists:", vendor.email)
    }

    // Always create additional vendors for more restaurants
    console.log("Creating additional vendor users...")
    const additionalVendors = []
    
    const vendorEmails = [
      "vendor2@example.com",
      "vendor3@example.com",
      "vendor4@example.com"
    ]

    for (let i = 0; i < vendorEmails.length; i++) {
      const email = vendorEmails[i]
      let existingVendor = await prisma.user.findUnique({
        where: { email }
      })

      if (!existingVendor) {
        const vendorPassword = await hash("vendor123", 10)
        existingVendor = await prisma.user.create({
          data: {
            email,
            name: `Restaurant Owner ${i + 2}`,
            password: vendorPassword,
            role: "VENDOR",
          },
        })
        console.log(`Additional vendor created: ${existingVendor.email}`)
      }
      additionalVendors.push(existingVendor)
    }

    // Create restaurants (always run this part)
    console.log("Creating restaurants...")
    
    const restaurantsData = [
      {
        name: "Tasty Delights",
        description: "Authentic Nigerian cuisine with a modern twist",
        address: "123 Lagos Street, Lagos",
        coordinates: { latitude: 6.5244, longitude: 3.3792 },
        categories: ["Local", "Continental"],
        priceRange: { min: 1500, max: 5000, average: 2500 },
        rating: 4.5,
        reviewCount: 120,
        images: ["/placeholder.jpg"],
        ownerId: vendor.id,
      },
      {
        name: "Spice Garden",
        description: "Fresh ingredients, bold flavors, unforgettable meals",
        address: "456 Victoria Island, Lagos",
        coordinates: { latitude: 6.4474, longitude: 3.4043 },
        categories: ["Continental", "Asian"],
        priceRange: { min: 2000, max: 8000, average: 4000 },
        rating: 4.2,
        reviewCount: 89,
        images: ["/placeholder.jpg"],
        ownerId: additionalVendors[0]?.id || vendor.id,
      },
      {
        name: "Mama's Kitchen",
        description: "Home-style cooking that reminds you of family",
        address: "789 Ikeja, Lagos",
        coordinates: { latitude: 6.5954, longitude: 3.3364 },
        categories: ["Local", "Traditional"],
        priceRange: { min: 1000, max: 3500, average: 2000 },
        rating: 4.7,
        reviewCount: 205,
        images: ["/placeholder.jpg"],
        ownerId: additionalVendors[1]?.id || vendor.id,
      },
      {
        name: "Urban Bistro",
        description: "Modern dining experience in the heart of the city",
        address: "321 Lekki Phase 1, Lagos",
        coordinates: { latitude: 6.4698, longitude: 3.5852 },
        categories: ["Continental", "Fine Dining"],
        priceRange: { min: 3000, max: 12000, average: 6500 },
        rating: 4.3,
        reviewCount: 67,
        images: ["/placeholder.jpg"],
        ownerId: additionalVendors[2]?.id || vendor.id,
      }
    ]

    const createdRestaurants = []
    for (const restaurantData of restaurantsData) {
      // Check if restaurant already exists
      const existingRestaurant = await prisma.restaurant.findFirst({
        where: { 
          name: restaurantData.name,
          ownerId: restaurantData.ownerId 
        }
      })

      if (!existingRestaurant) {
        const restaurant = await prisma.restaurant.create({
          data: restaurantData,
        })
        console.log(`Restaurant created: ${restaurant.name}`)
        createdRestaurants.push(restaurant)
      } else {
        console.log(`Restaurant already exists: ${existingRestaurant.name}`)
        createdRestaurants.push(existingRestaurant)
      }
    }

    // Create meals for each restaurant
    console.log("Creating meals...")
    
    const mealTemplates = [
      // Nigerian dishes
      { name: "Jollof Rice", description: "Spicy rice dish cooked with tomatoes and spices", price: 1800, categories: ["Local"] },
      { name: "Pounded Yam and Egusi Soup", description: "Smooth pounded yam with melon seed soup", price: 2500, categories: ["Local"] },
      { name: "Fried Rice", description: "Colorful rice mixed with vegetables and proteins", price: 2200, categories: ["Local"] },
      { name: "Amala and Ewedu", description: "Traditional yam flour with jute leaf soup", price: 2000, categories: ["Local", "Traditional"] },
      { name: "Pepper Soup", description: "Spicy broth with fish or meat", price: 1500, categories: ["Local"] },
      
      // Continental dishes
      { name: "Grilled Chicken", description: "Marinated chicken grilled to perfection", price: 3000, categories: ["Continental"] },
      { name: "Beef Steak", description: "Tender beef steak with garlic butter", price: 5500, categories: ["Continental"] },
      { name: "Caesar Salad", description: "Fresh romaine lettuce with caesar dressing", price: 2800, categories: ["Continental"] },
      { name: "Pasta Alfredo", description: "Creamy pasta with parmesan cheese", price: 3500, categories: ["Continental"] },
      { name: "Fish and Chips", description: "Crispy battered fish with golden fries", price: 4000, categories: ["Continental"] },
      
      // Asian dishes
      { name: "Chicken Fried Rice", description: "Wok-fried rice with chicken and vegetables", price: 2800, categories: ["Asian"] },
      { name: "Sweet and Sour Pork", description: "Crispy pork in tangy sauce", price: 3200, categories: ["Asian"] },
      { name: "Pad Thai", description: "Stir-fried noodles with shrimp and peanuts", price: 3000, categories: ["Asian"] }
    ]

    for (const restaurant of createdRestaurants) {
      // Filter meals based on restaurant categories
      const suitableMeals = mealTemplates.filter(meal => 
        meal.categories.some(category => restaurant.categories.includes(category))
      )
      
      // Select 4-6 random meals for each restaurant
      const selectedMeals = suitableMeals
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 4)
      
      for (const mealTemplate of selectedMeals) {
        // Check if meal already exists for this restaurant
        const existingMeal = await prisma.meal.findFirst({
          where: {
            name: mealTemplate.name,
            restaurantId: restaurant.id
          }
        })

        if (!existingMeal) {
          await prisma.meal.create({
            data: {
              ...mealTemplate,
              image: "/placeholder.jpg",
              restaurantId: restaurant.id,
            },
          })
        }
      }
      
      console.log(`Meals created for ${restaurant.name}`)
    }

    // Create sample reviews and favorites
    console.log("Creating sample reviews and favorites...")
    
    for (const restaurant of createdRestaurants.slice(0, 2)) {
      // Create review if it doesn't exist
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: user.id,
          restaurantId: restaurant.id
        }
      })

      if (!existingReview) {
        await prisma.review.create({
          data: {
            rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
            comment: `Great food at ${restaurant.name}! Highly recommended.`,
            userId: user.id,
            restaurantId: restaurant.id,
          },
        })
      }

      // Create favorite if it doesn't exist
      const existingFavorite = await prisma.favorite.findFirst({
        where: {
          userId: user.id,
          restaurantId: restaurant.id
        }
      })

      if (!existingFavorite) {
        await prisma.favorite.create({
          data: {
            userId: user.id,
            restaurantId: restaurant.id,
          },
        })
      }
    }

    console.log("Database seeded successfully!")
    console.log("\nTest accounts:")
    console.log("- Admin: admin@foodradar.com / admin123")
    console.log("- User: user@example.com / user123")
    console.log("- Vendor: vendor@example.com / vendor123")
    console.log("- Additional vendors: vendor2@example.com, vendor3@example.com, vendor4@example.com / vendor123")
    console.log(`\nCreated ${createdRestaurants.length} restaurants with meals`)

  } catch (error) {
    console.error("Error seeding database:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error("Fatal error:", e)
    process.exit(1)
  })