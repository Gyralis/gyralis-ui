import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db/client"
import { seasonUserGlobalStatsId, seasonUserLoopStatsId } from "@/lib/db/ids"
import { normalizeAddress } from "@/lib/scoring/rules"
import {
  SeasonUserGlobalScoringStats,
  SeasonUserLoopScoringStats,
} from "@/lib/scoring/season-types"

const STATE_ID = "season-scoring"

export async function clearSeasonScoringProjections() {
  await Promise.all([
    prisma.seasonUserLoopStats.deleteMany(),
    prisma.seasonUserGlobalStats.deleteMany(),
  ])
}

export async function beginSeasonScoringRebuild(configHash: string) {
  return prisma.seasonScoringState.upsert({
    where: { id: STATE_ID },
    create: {
      id: STATE_ID,
      configHash,
      status: "rebuilding",
      rebuildStartedAt: new Date(),
    },
    update: {
      configHash,
      status: "rebuilding",
      rebuildStartedAt: new Date(),
      rebuildCompletedAt: null,
      error: null,
    },
  })
}

export async function completeSeasonScoringRebuild(configHash: string) {
  return prisma.seasonScoringState.upsert({
    where: { id: STATE_ID },
    create: {
      id: STATE_ID,
      configHash,
      status: "ready",
      rebuildCompletedAt: new Date(),
    },
    update: {
      configHash,
      status: "ready",
      rebuildCompletedAt: new Date(),
      error: null,
    },
  })
}

export async function failSeasonScoringRebuild(
  configHash: string,
  error: unknown
) {
  const message = error instanceof Error ? error.message : String(error)
  return prisma.seasonScoringState.upsert({
    where: { id: STATE_ID },
    create: { id: STATE_ID, configHash, status: "failed", error: message },
    update: { configHash, status: "failed", error: message },
  })
}

export function getSeasonScoringState() {
  return prisma.seasonScoringState.findUnique({ where: { id: STATE_ID } })
}

export async function upsertSeasonUserLoopStats(
  stats: SeasonUserLoopScoringStats
) {
  const id = seasonUserLoopStatsId(stats)
  const data = {
    seasonId: stats.seasonId,
    userAddress: stats.userAddress,
    loopId: stats.loopId,
    chainId: stats.chainId,
    totalClaims: stats.totalClaims,
    claimPointsHundredths: stats.claimPointsHundredths,
    streakBonusPointsHundredths: stats.streakBonusPointsHundredths,
    totalPointsHundredths: stats.totalPointsHundredths,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastClaimedPeriod: stats.lastClaimedPeriod,
    earnedStreakBonuses:
      stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
  }
  return prisma.seasonUserLoopStats.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  })
}

export function deleteSeasonUserLoopStats(input: {
  seasonId: string
  userAddress: string
  chainId: number
  loopId: number
}) {
  return prisma.seasonUserLoopStats.deleteMany({
    where: { id: seasonUserLoopStatsId(input) },
  })
}

export function getSeasonUserLoopStatsForUser(
  seasonId: string,
  userAddress: string
) {
  return prisma.seasonUserLoopStats.findMany({
    where: { seasonId, userAddress: normalizeAddress(userAddress) },
  })
}

export async function upsertSeasonUserGlobalStats(
  stats: SeasonUserGlobalScoringStats
) {
  const id = seasonUserGlobalStatsId(stats)
  const data = {
    seasonId: stats.seasonId,
    userAddress: stats.userAddress,
    totalClaims: stats.totalClaims,
    claimPointsHundredths: stats.claimPointsHundredths,
    streakBonusPointsHundredths: stats.streakBonusPointsHundredths,
    totalPointsHundredths: stats.totalPointsHundredths,
    activeLoopStreaks: stats.activeLoopStreaks,
    longestStreak: stats.longestStreak,
    loopCount: stats.loopCount,
    earnedStreakBonuses:
      stats.earnedStreakBonuses as unknown as Prisma.InputJsonValue,
  }
  return prisma.seasonUserGlobalStats.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  })
}

export function deleteSeasonUserGlobalStats(
  seasonId: string,
  userAddress: string
) {
  return prisma.seasonUserGlobalStats.deleteMany({
    where: { id: seasonUserGlobalStatsId({ seasonId, userAddress }) },
  })
}

export function getSeasonUserGlobalStats(
  seasonId: string,
  userAddress: string
) {
  return prisma.seasonUserGlobalStats.findUnique({
    where: { id: seasonUserGlobalStatsId({ seasonId, userAddress }) },
  })
}

export function getSeasonLeaderboard(input: {
  seasonId: string
  limit: number
  offset: number
}) {
  return prisma.seasonUserGlobalStats.findMany({
    where: { seasonId: input.seasonId },
    orderBy: [
      { totalPointsHundredths: "desc" },
      { totalClaims: "desc" },
      { userAddress: "asc" },
    ],
    take: input.limit,
    skip: input.offset,
  })
}

export function countSeasonLeaderboard(seasonId: string) {
  return prisma.seasonUserGlobalStats.count({ where: { seasonId } })
}
