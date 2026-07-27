import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db/client"
import { globalLeaderboardEntryId, loopLeaderboardEntryId } from "@/lib/db/ids"
import {
  LeaderboardFilters,
  LeaderboardQuery,
  LeaderboardSortField,
  SortOrder,
  UserGlobalScoringStats,
  UserLoopScoringStats,
} from "@/lib/scoring/types"

const tieBreakerOrder: LeaderboardSortField[] = [
  "totalPoints",
  "totalClaims",
  "userAddress",
]

const leaderboardFilterRanges = [
  ["totalPoints", "minTotalPoints", "maxTotalPoints"],
  ["claimPoints", "minClaimPoints", "maxClaimPoints"],
  ["streakBonusPoints", "minStreakBonusPoints", "maxStreakBonusPoints"],
  ["totalClaims", "minTotalClaims", "maxTotalClaims"],
  ["currentStreak", "minCurrentStreak", "maxCurrentStreak"],
  ["activeLoopStreaks", "minActiveLoopStreaks", "maxActiveLoopStreaks"],
  ["longestStreak", "minLongestStreak", "maxLongestStreak"],
] as const

type LeaderboardReadInput = Pick<
  LeaderboardQuery,
  "limit" | "offset" | "sortBy" | "sortOrder" | "filters"
>

function defaultTieBreakerOrder(field: LeaderboardSortField): SortOrder {
  return field === "userAddress" ? "asc" : "desc"
}

function buildLeaderboardOrder(input: {
  sortBy: LeaderboardSortField
  sortOrder: SortOrder
}): Prisma.LeaderboardEntryOrderByWithRelationInput[] {
  const orderBy = [
    { [input.sortBy]: input.sortOrder },
  ] as Prisma.LeaderboardEntryOrderByWithRelationInput[]

  for (const field of tieBreakerOrder) {
    if (field === input.sortBy) continue
    orderBy.push({ [field]: defaultTieBreakerOrder(field) })
  }

  return orderBy
}

function numberRangeFilter(
  minValue?: number,
  maxValue?: number
): Prisma.IntFilter | undefined {
  const filter: Prisma.IntFilter = {}
  if (minValue != null) filter.gte = minValue
  if (maxValue != null) filter.lte = maxValue
  return Object.keys(filter).length > 0 ? filter : undefined
}

function applyLeaderboardFilters(
  where: Prisma.LeaderboardEntryWhereInput,
  filters: LeaderboardFilters
) {
  if (filters.userAddress) {
    where.userAddress = { contains: filters.userAddress.toLowerCase() }
  }

  for (const [field, minKey, maxKey] of leaderboardFilterRanges) {
    const range = numberRangeFilter(filters[minKey], filters[maxKey])
    if (range) {
      where[field] = range
    }
  }

  return where
}

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
      loopId: stats.loopId,
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
  sortBy?: LeaderboardSortField
  sortOrder?: SortOrder
  filters?: LeaderboardFilters
}) {
  return prisma.leaderboardEntry.findMany({
    where: applyLeaderboardFilters({ scope: "global" }, input.filters ?? {}),
    orderBy: buildLeaderboardOrder({
      sortBy: input.sortBy ?? "totalPoints",
      sortOrder: input.sortOrder ?? "desc",
    }),
    take: input.limit,
    skip: input.offset,
  })
}

export async function getLoopLeaderboard(
  input: LeaderboardReadInput & {
    chainId: number
    loopId: number
  }
) {
  return prisma.leaderboardEntry.findMany({
    where: applyLeaderboardFilters(
      {
        scope: "loop",
        chainId: input.chainId,
        loopId: input.loopId,
      },
      input.filters
    ),
    orderBy: buildLeaderboardOrder({
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    }),
    take: input.limit,
    skip: input.offset,
  })
}

export async function clearLeaderboardEntries() {
  await prisma.leaderboardEntry.deleteMany()
}
