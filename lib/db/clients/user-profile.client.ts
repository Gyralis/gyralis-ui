import { prisma } from "@/lib/db/client"
import { normalizeDbAddress } from "@/lib/db/ids"

export async function ensureUserProfile(userAddress: string) {
  const address = normalizeDbAddress(userAddress)
  return prisma.userProfile.upsert({
    where: { id: address },
    create: { id: address, address },
    update: {},
  })
}

export async function getUserProfile(userAddress: string) {
  return prisma.userProfile.findUnique({
    where: { id: normalizeDbAddress(userAddress) },
  })
}
