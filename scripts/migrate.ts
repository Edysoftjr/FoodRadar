import { execSync } from "child_process"

// Run Prisma migrations
try {
  console.log("Running Prisma migrations...")
  execSync("npx prisma migrate deploy", { stdio: "inherit" })
  console.log("Migrations completed successfully!")
} catch (error) {
  console.error("Error running migrations:", error)
  process.exit(1)
}
