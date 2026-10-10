import {
  getSeasonScoringState,
  getSeasonUserGlobalStats,
  getSeasonUserLoopStatsForUser,
} from "@/lib/db/clients/season-scoring.client"

import { normalizeAddress } from "./rules"
import {
  activeSeasons,
  getSeasonById,
  pointsFromHundredths,
  publicSeason,
  seasonConfigHash,
} from "./seasons"

export class SeasonNotFoundError extends Error {}
export class SeasonRebuildRequiredError extends Error {}

export function seasonRebuildRequired(
  state: { status: string; configHash: string } | null,
  configHash: string,
  hasActiveSeasons = activeSeasons.length > 0
) {
  return (
    hasActiveSeasons &&
    (state?.status !== "ready" || state.configHash !== configHash)
  )
}

export async function assertSeasonScoringReady(seasonId: string) {
  const season = getSeasonById(seasonId)
  if (!season) throw new SeasonNotFoundError("Season not found")
  const state = await getSeasonScoringState()
  if (seasonRebuildRequired(state, seasonConfigHash(), true)) {
    throw new SeasonRebuildRequiredError("Season scoring rebuild required")
  }
  return season
}

export async function getSeasonCatalog() {
  const state = await getSeasonScoringState()
  const configHash = seasonConfigHash()
  return {
    seasons: activeSeasons.map(publicSeason),
    rebuild: {
      required: seasonRebuildRequired(state, configHash),
      status: state?.status ?? "not-built",
      configHash,
      completedAt: state?.rebuildCompletedAt?.toISOString() ?? null,
    },
  }
}

function publicEarnedBonuses(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((bonus) => {
    const item = bonus as { streak: number; pointsHundredths: number }
    return {
      streak: item.streak,
      points: pointsFromHundredths(item.pointsHundredths),
    }
  })
}

export function publicSeasonGlobalStats(row: {
  seasonId: string
  userAddress: string
  totalClaims: number
  claimPointsHundredths: number
  streakBonusPointsHundredths: number
  totalPointsHundredths: number
  activeLoopStreaks: number
  longestStreak: number
  loopCount: number
  earnedStreakBonuses: unknown
}) {
  return {
    seasonId: row.seasonId,
    userAddress: row.userAddress,
    totalClaims: row.totalClaims,
    claimPoints: pointsFromHundredths(row.claimPointsHundredths),
    streakBonusPoints: pointsFromHundredths(row.streakBonusPointsHundredths),
    totalPoints: pointsFromHundredths(row.totalPointsHundredths),
    activeLoopStreaks: row.activeLoopStreaks,
    longestStreak: row.longestStreak,
    loopCount: row.loopCount,
    earnedStreakBonuses: publicEarnedBonuses(row.earnedStreakBonuses),
  }
}

export function rankSeasonLeaderboardPage(
  rows: Parameters<typeof publicSeasonGlobalStats>[0][],
  offset: number
) {
  return rows.map((row, index) => ({
    ...publicSeasonGlobalStats(row),
    rank: offset + index + 1,
  }))
}

export function publicSeasonLoopStats(row: {
  seasonId: string
  userAddress: string
  loopId: number
  chainId: number
  totalClaims: number
  claimPointsHundredths: number
  streakBonusPointsHundredths: number
  totalPointsHundredths: number
  currentStreak: number
  longestStreak: number
  lastClaimedPeriod: number | null
  earnedStreakBonuses: unknown
}) {
  return {
    seasonId: row.seasonId,
    userAddress: row.userAddress,
    loopId: row.loopId,
    chainId: row.chainId,
    totalClaims: row.totalClaims,
    claimPoints: pointsFromHundredths(row.claimPointsHundredths),
    streakBonusPoints: pointsFromHundredths(row.streakBonusPointsHundredths),
    totalPoints: pointsFromHundredths(row.totalPointsHundredths),
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastClaimedPeriod: row.lastClaimedPeriod,
    earnedStreakBonuses: publicEarnedBonuses(row.earnedStreakBonuses),
  }
}

export async function getSeasonUserData(seasonId: string, address: string) {
  const season = await assertSeasonScoringReady(seasonId)
  const userAddress = normalizeAddress(address)
  const [global, loops] = await Promise.all([
    getSeasonUserGlobalStats(seasonId, userAddress),
    getSeasonUserLoopStatsForUser(seasonId, userAddress),
  ])
  return {
    season: publicSeason(season),
    userAddress,
    stats: global ? publicSeasonGlobalStats(global) : null,
    loops: loops.map(publicSeasonLoopStats),
  }
}
