import {
  deleteSeasonUserGlobalStats,
  deleteSeasonUserLoopStats,
  getSeasonScoringState,
  getSeasonUserLoopStatsForUser,
  upsertSeasonUserGlobalStats,
  upsertSeasonUserLoopStats,
} from "@/lib/db/clients/season-scoring.client"

import {
  activeSeasons,
  computeSeasonGlobalStats,
  computeSeasonLoopStats,
  seasonConfigHash,
  seasonsForLoop,
} from "./seasons"
import { ClaimScoringEvent } from "./types"

export async function seasonProjectionsAreReady() {
  if (activeSeasons.length === 0) return true
  const state = await getSeasonScoringState()
  return state?.status === "ready" && state.configHash === seasonConfigHash()
}

export async function updateSeasonLoopProjections(input: {
  userAddress: string
  chainId: number
  loopId: number
  claimEvents: ClaimScoringEvent[]
}) {
  for (const season of seasonsForLoop(input.chainId, input.loopId)) {
    const stats = computeSeasonLoopStats({
      season,
      events: input.claimEvents,
      ...input,
    })
    if (stats && stats.totalClaims > 0) {
      await upsertSeasonUserLoopStats(stats)
    } else {
      await deleteSeasonUserLoopStats({ seasonId: season.id, ...input })
    }
  }
}

export async function updateSeasonGlobalProjections(userAddress: string) {
  for (const season of activeSeasons) {
    const rows = await getSeasonUserLoopStatsForUser(season.id, userAddress)
    if (rows.length === 0) {
      await deleteSeasonUserGlobalStats(season.id, userAddress)
      continue
    }
    const loopStats = rows.map((row) => ({
      seasonId: row.seasonId,
      userAddress: row.userAddress,
      loopId: row.loopId,
      chainId: row.chainId,
      totalClaims: row.totalClaims,
      claimPointsHundredths: row.claimPointsHundredths,
      streakBonusPointsHundredths: row.streakBonusPointsHundredths,
      totalPointsHundredths: row.totalPointsHundredths,
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      lastClaimedPeriod: row.lastClaimedPeriod,
      earnedStreakBonuses: row.earnedStreakBonuses as Array<{
        streak: number
        pointsHundredths: number
      }>,
    }))
    await upsertSeasonUserGlobalStats(
      computeSeasonGlobalStats(season.id, userAddress, loopStats)
    )
  }
}
