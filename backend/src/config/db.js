import { PrismaClient } from '@prisma/client'

// Initialize the Prisma Client
const prisma = new PrismaClient()

// Export the client so your controllers can use it
export default prisma