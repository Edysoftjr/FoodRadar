import { PrismaClient } from "@prisma/client"

async function main() {
  console.log("Setting up database...")

  const prisma = new PrismaClient()

  try {
    // Test database connection
    await prisma.$connect()
    console.log("Database connection successful!")

    // Run a simple query to verify schema
    const userCount = await prisma.user.count()
    console.log(`Current user count: ${userCount}`)

    console.log("Database setup complete!")
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
