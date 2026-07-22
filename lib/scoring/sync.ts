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
  clearProcessedClaimEvents,
  markProcessedClaimEvents,
} from "@/lib/db/clients/processed-claim-events.client"
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
  loopId?: number
  chainId?: number
}

interface AffectedLoopKey {
  userAddress: string
  loopId: number
  chainId: number
}

interface ScoringSyncCursor {
  lastBlockNumber: number
  lastEventId?: string
}

function keyForAffectedLoop(key: AffectedLoopKey): string {
  return [key.chainId, key.loopId, key.userAddress.toLowerCase()].join("|")
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
    loopId: stats.loopId,
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
  await clearProcessedClaimEvents()
  await resetScoringSyncState()
}

export function advanceScoringSyncCursor(
  cursor: ScoringSyncCursor,
  event: { blockNumber: number; id: string }
): ScoringSyncCursor {
  if (event.blockNumber > cursor.lastBlockNumber) {
    return {
      lastBlockNumber: event.blockNumber,
      lastEventId: event.id,
    }
  }

  if (
    event.blockNumber === cursor.lastBlockNumber &&
    (cursor.lastEventId == null || event.id > cursor.lastEventId)
  ) {
    return {
      lastBlockNumber: cursor.lastBlockNumber,
      lastEventId: event.id,
    }
  }

  return cursor
}

export async function runScoringSync(input: SyncInput = {}) {
  const mode = input.mode ?? "incremental"
  if (mode === "full" && input.loopId != null) {
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
  const batchSize = env.SCORING_SYNC_BATCH_SIZE
  const affectedLoops = new Map<string, AffectedLoopKey>()
  const fullModeClaimEventsByLoop = new Map<
    string,
    Awaited<ReturnType<typeof fetchClaimEventsFromSubgraph>>
  >()
  let processedEvents = 0
  let cursor: ScoringSyncCursor = {
    lastBlockNumber: mode === "incremental" ? lastSyncedBlock : 0,
    lastEventId: syncState?.lastEventId ?? undefined,
  }

  function trackEvents(
    events: Awaited<ReturnType<typeof fetchClaimEventsFromSubgraph>>
  ) {
    for (const event of events) {
      const key = {
        userAddress: event.userAddress,
        loopId: event.loopId,
        chainId: event.chainId,
      }
      const loopKey = keyForAffectedLoop(key)
      affectedLoops.set(loopKey, key)
      if (mode === "full") {
        const eventsForLoop = fullModeClaimEventsByLoop.get(loopKey) ?? []
        eventsForLoop.push(event)
        fullModeClaimEventsByLoop.set(loopKey, eventsForLoop)
      }
      cursor = advanceScoringSyncCursor(cursor, event)
      processedEvents += 1
    }
  }

  async function fetchCursorPages(pageInput: {
    fromBlock?: number
    blockNumber?: number
    afterEventId?: string
  }) {
    let afterEventId = pageInput.afterEventId

    while (true) {
      const events = await fetchClaimEventsFromSubgraph({
        fromBlock: pageInput.fromBlock,
        blockNumber: pageInput.blockNumber,
        afterEventId,
        first: batchSize,
        loopId: input.loopId,
      })

      if (events.length === 0) break
      trackEvents(events)
      if (events.length < batchSize) break
      afterEventId = events[events.length - 1]?.id
    }
  }

  if (mode === "incremental" && syncState?.lastEventId) {
    await fetchCursorPages({
      blockNumber: lastSyncedBlock,
      afterEventId: syncState.lastEventId,
    })
  }

  await fetchCursorPages({
    fromBlock: mode === "incremental" ? lastSyncedBlock + 1 : 0,
  })

  const affectedUsers = new Set<string>()
  for (const key of affectedLoops.values()) {
    await ensureUserProfile(key.userAddress)
    const loopKey = keyForAffectedLoop(key)
    const claimEvents =
      mode === "full"
        ? fullModeClaimEventsByLoop.get(loopKey) ?? []
        : await fetchAllClaimEventsForUserLoop({
            userAddress: key.userAddress,
            loopId: key.loopId,
            batchSize,
          })
    const loopStats = computeLoopStatsFromClaims(
      claimEvents,
      scoringConfig,
      key
    )
    await upsertUserLoopStats(loopStats)
    await upsertLoopLeaderboardEntry(loopStats)
    await markProcessedClaimEvents(claimEvents)
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

  if (input.loopId == null) {
    await updateScoringSyncState({
      lastBlockNumber: cursor.lastBlockNumber,
      lastEventId: cursor.lastEventId,
    })
  }

  return {
    mode,
    processedEvents,
    affectedLoops: affectedLoops.size,
    affectedUsers: affectedUsers.size,
    lastBlockNumber: cursor.lastBlockNumber,
  }
}
