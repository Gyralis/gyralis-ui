import { PrismaClient } from "@prisma/client"

import { withMongoConnectionTimeouts } from "@/lib/db/url"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

const databaseUrl = withMongoConnectionTimeouts(process.env.DATABASE_URL)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined
  )

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
