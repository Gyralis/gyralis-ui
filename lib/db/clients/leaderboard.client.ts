import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db/client"
import { globalLeaderboardEntryId, loopLeaderboardEntryId } from "@/lib/db/ids"
import {
  UserGlobalScoringStats,
  UserLoopScoringStats,
} from "@/lib/scoring/types"

const leaderboardOrder = [
  { totalPoints: "desc" as const },
  { totalClaims: "desc" as const },
  { userAddress: "asc" as const },
]

export async function upsertGlobalLeaderboardEntry(
  stats: UserGlobalScoringStats
) {
  return prisma.leaderboardEntry.upsert({
    where: { id: globalLeaderboardEntryId(stats.userAddress) },
    create: {
      id: globalLeaderboardEntryId(stats.userAddress),
      scope: "global",
      userAddress: stats.userAddress,
      totalPoints: stats.totalPoints,
      claimPoints: stats.claimPoints,
      streakBonusPoints: stats.streakBonusPoints,
      totalClaims: stats.totalClaims,
      activeLoopStreaks: stats.activeLoopStreaks,
      longestStreak: stats.longestStreak,
      earnedStreakBonuses:
        stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
    },
    update: {
      totalPoints: stats.totalPoints,
      claimPoints: stats.claimPoints,
      streakBonusPoints: stats.streakBonusPoints,
      totalClaims: stats.totalClaims,
      activeLoopStreaks: stats.activeLoopStreaks,
      longestStreak: stats.longestStreak,
      earnedStreakBonuses:
        stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
    },
  })
}

export async function upsertLoopLeaderboardEntry(stats: UserLoopScoringStats) {
  return prisma.leaderboardEntry.upsert({
    where: { id: loopLeaderboardEntryId(stats) },
    create: {
      id: loopLeaderboardEntryId(stats),
      scope: "loop",
      userAddress: stats.userAddress,
      chainId: stats.chainId,
      loopAddress: stats.loopAddress,
      totalPoints: stats.totalPoints,
      claimPoints: stats.claimPoints,
      streakBonusPoints: stats.streakBonusPoints,
      totalClaims: stats.totalClaims,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      earnedStreakBonuses:
        stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
    },
    update: {
      totalPoints: stats.totalPoints,
      claimPoints: stats.claimPoints,
      streakBonusPoints: stats.streakBonusPoints,
      totalClaims: stats.totalClaims,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      earnedStreakBonuses:
        stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
    },
  })
}

export async function getGlobalLeaderboard(input: {
  limit: number
  offset: number
}) {
  return prisma.leaderboardEntry.findMany({
    where: { scope: "global" },
    orderBy: leaderboardOrder,
    take: input.limit,
    skip: input.offset,
  })
}

export async function getLoopLeaderboard(input: {
  chainId: number
  loopAddress: string
  limit: number
  offset: number
}) {
  return prisma.leaderboardEntry.findMany({
    where: {
      scope: "loop",
      chainId: input.chainId,
      loopAddress: input.loopAddress.toLowerCase(),
    },
    orderBy: leaderboardOrder,
    take: input.limit,
    skip: input.offset,
  })
}

export async function clearLeaderboardEntries() {
  await prisma.leaderboardEntry.deleteMany()
}
