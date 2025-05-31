import { PrismaClient } from "@prisma/client"

// Create a separate instance for auth operations
const authPrisma = new PrismaClient()

export default authPrisma
