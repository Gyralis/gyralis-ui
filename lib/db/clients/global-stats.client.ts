import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db/client"
import { UserGlobalScoringStats } from "@/lib/scoring/types"

export async function upsertUserGlobalStats(stats: UserGlobalScoringStats) {
  return prisma.userGlobalStats.upsert({
    where: { id: stats.userAddress },
    create: {
      id: stats.userAddress,
      userAddress: stats.userAddress,
      totalClaims: stats.totalClaims,
      claimPoints: stats.claimPoints,
      streakBonusPoints: stats.streakBonusPoints,
      totalPoints: stats.totalPoints,
      activeLoopStreaks: stats.activeLoopStreaks,
      longestStreak: stats.longestStreak,
      loopCount: stats.loopCount,
      earnedStreakBonuses:
        stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
    },
    update: {
      totalClaims: stats.totalClaims,
      claimPoints: stats.claimPoints,
      streakBonusPoints: stats.streakBonusPoints,
      totalPoints: stats.totalPoints,
      activeLoopStreaks: stats.activeLoopStreaks,
      longestStreak: stats.longestStreak,
      loopCount: stats.loopCount,
      earnedStreakBonuses:
        stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
    },
  })
}

export async function getUserGlobalStats(userAddress: string) {
  return prisma.userGlobalStats.findUnique({
    where: { id: userAddress.toLowerCase() },
  })
}

export async function clearUserGlobalStats() {
  await prisma.userGlobalStats.deleteMany()
}
