import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db/client"
import { userLoopStatsId } from "@/lib/db/ids"
import { UserLoopScoringStats } from "@/lib/scoring/types"

export async function upsertUserLoopStats(stats: UserLoopScoringStats) {
  const id = userLoopStatsId(stats)
  return prisma.userLoopStats.upsert({
    where: { id },
    create: {
      id,
      userAddress: stats.userAddress,
      loopId: stats.loopId,
      chainId: stats.chainId,
      totalClaims: stats.totalClaims,
      claimPoints: stats.claimPoints,
      streakBonusPoints: stats.streakBonusPoints,
      totalPoints: stats.totalPoints,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastClaimedPeriod: stats.lastClaimedPeriod,
      earnedStreakBonuses:
        stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
    },
    update: {
      totalClaims: stats.totalClaims,
      claimPoints: stats.claimPoints,
      streakBonusPoints: stats.streakBonusPoints,
      totalPoints: stats.totalPoints,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastClaimedPeriod: stats.lastClaimedPeriod,
      earnedStreakBonuses:
        stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
    },
  })
}

export async function getUserLoopStatsForUser(userAddress: string) {
  return prisma.userLoopStats.findMany({
    where: { userAddress: userAddress.toLowerCase() },
  })
}

export async function getUserLoopStats(input: {
  userAddress: string
  loopId: number
  chainId: number
}) {
  return prisma.userLoopStats.findUnique({
    where: { id: userLoopStatsId(input) },
  })
}

export async function clearUserLoopStats() {
  await prisma.userLoopStats.deleteMany()
}
