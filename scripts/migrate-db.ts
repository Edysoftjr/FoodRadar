import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Testing database connection...")

    // Test connection
    await prisma.$connect()
    console.log("Database connection successful!")

    // Run migrations
    console.log("Running database migrations...")
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy")

    if (stderr) {
      console.error("Migration stderr:", stderr)
    }

    console.log("Migration stdout:", stdout)
    console.log("Migrations completed successfully!")

    // Run seed script
    console.log("Running seed script...")
    await import("../prisma/seed")

    console.log("Database setup complete!")
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
