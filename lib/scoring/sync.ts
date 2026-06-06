import { env } from "@/env.mjs"

import {
  clearUserGlobalStats,
  upsertUserGlobalStats,
} from "@/lib/db/clients/global-stats.client"
import {
  clearLeaderboardEntries,
  upsertGlobalLeaderboardEntry,
  upsertLoopLeaderboardEntry,
} from "@/lib/db/clients/leaderboard.client"
import {
  clearUserLoopStats,
  getUserLoopStatsForUser,
  upsertUserLoopStats,
} from "@/lib/db/clients/loop-stats.client"
import {
  getScoringSyncState,
  resetScoringSyncState,
  updateScoringSyncState,
} from "@/lib/db/clients/sync-state.client"
import { ensureUserProfile } from "@/lib/db/clients/user-profile.client"

import { computeGlobalStatsFromLoops } from "./aggregate"
import { scoringConfig } from "./config"
import { computeLoopStatsFromClaims } from "./rules"
import {
  fetchAllClaimEventsForUserLoop,
  fetchClaimEventsFromSubgraph,
} from "./subgraph-client"
import { EarnedStreakBonus, UserLoopScoringStats } from "./types"

type SyncMode = "incremental" | "full"

interface SyncInput {
  mode?: SyncMode
  loopAddress?: string
  chainId?: number
}

interface AffectedLoopKey {
  userAddress: string
  loopAddress: string
  chainId: number
}

function keyForAffectedLoop(key: AffectedLoopKey): string {
  return [
    key.chainId,
    key.loopAddress.toLowerCase(),
    key.userAddress.toLowerCase(),
  ].join("|")
}

function parseEarnedBonuses(value: unknown): EarnedStreakBonus[] {
  return Array.isArray(value)
    ? value
        .filter(
          (item): item is EarnedStreakBonus =>
            item != null &&
            typeof item === "object" &&
            typeof (item as EarnedStreakBonus).streak === "number" &&
            typeof (item as EarnedStreakBonus).points === "number"
        )
        .map((item) => ({ streak: item.streak, points: item.points }))
    : []
}

function mapDbLoopStats(
  stats: Awaited<ReturnType<typeof getUserLoopStatsForUser>>[number]
): UserLoopScoringStats {
  return {
    userAddress: stats.userAddress,
    loopAddress: stats.loopAddress,
    chainId: stats.chainId,
    totalClaims: stats.totalClaims,
    claimPoints: stats.claimPoints,
    streakBonusPoints: stats.streakBonusPoints,
    totalPoints: stats.totalPoints,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastClaimedPeriod: stats.lastClaimedPeriod,
    earnedStreakBonuses: parseEarnedBonuses(stats.earnedStreakBonuses),
  }
}

async function clearScoringProjections() {
  await clearLeaderboardEntries()
  await clearUserGlobalStats()
  await clearUserLoopStats()
  await resetScoringSyncState()
}

export async function runScoringSync(input: SyncInput = {}) {
  const mode = input.mode ?? "incremental"
  if (mode === "full" && input.loopAddress) {
    throw new Error("Full scoring recompute must run without a loop filter")
  }
  if (input.chainId && input.chainId !== env.GYRALIS_SUBGRAPH_CHAIN_ID) {
    throw new Error(
      "Requested chainId does not match GYRALIS_SUBGRAPH_CHAIN_ID"
    )
  }

  if (mode === "full") {
    await clearScoringProjections()
  }

  const syncState = mode === "incremental" ? await getScoringSyncState() : null
  const lastSyncedBlock = syncState?.lastBlockNumber ?? 0
  const fromBlock = mode === "incremental" ? lastSyncedBlock + 1 : 0
  const batchSize = env.SCORING_SYNC_BATCH_SIZE
  const affectedLoops = new Map<string, AffectedLoopKey>()
  let skip = 0
  let processedEvents = 0
  let maxBlockNumber = mode === "incremental" ? lastSyncedBlock : 0
  let lastEventId: string | undefined

  while (true) {
    const events = await fetchClaimEventsFromSubgraph({
      fromBlock,
      first: batchSize,
      skip,
      loopAddress: input.loopAddress,
    })

    if (events.length === 0) break

    for (const event of events) {
      const key = {
        userAddress: event.userAddress,
        loopAddress: event.loopAddress,
        chainId: event.chainId,
      }
      affectedLoops.set(keyForAffectedLoop(key), key)
      maxBlockNumber = Math.max(maxBlockNumber, event.blockNumber)
      lastEventId = event.id
      processedEvents += 1
    }

    if (events.length < batchSize) break
    skip += batchSize
  }

  const affectedUsers = new Set<string>()
  for (const key of affectedLoops.values()) {
    await ensureUserProfile(key.userAddress)
    const claimEvents = await fetchAllClaimEventsForUserLoop({
      userAddress: key.userAddress,
      loopAddress: key.loopAddress,
      batchSize,
    })
    const loopStats = computeLoopStatsFromClaims(
      claimEvents,
      scoringConfig,
      key
    )
    await upsertUserLoopStats(loopStats)
    await upsertLoopLeaderboardEntry(loopStats)
    affectedUsers.add(key.userAddress)
  }

  for (const userAddress of affectedUsers) {
    const loopStats = (await getUserLoopStatsForUser(userAddress)).map(
      mapDbLoopStats
    )
    const globalStats = computeGlobalStatsFromLoops(userAddress, loopStats)
    await upsertUserGlobalStats(globalStats)
    await upsertGlobalLeaderboardEntry(globalStats)
  }

  if (!input.loopAddress) {
    await updateScoringSyncState({
      lastBlockNumber: maxBlockNumber,
      lastEventId,
    })
  }

  return {
    mode,
    processedEvents,
    affectedLoops: affectedLoops.size,
    affectedUsers: affectedUsers.size,
    lastBlockNumber: maxBlockNumber,
  }
}
