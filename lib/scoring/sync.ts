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
const PROJECTION_WRITE_CONCURRENCY = 20

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

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  callback: (item: T) => Promise<void>
) {
  for (let index = 0; index < items.length; index += concurrency) {
    await Promise.all(items.slice(index, index + concurrency).map(callback))
  }
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

    for (;;) {
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

  async function updateProjections(
    pageAffectedLoops: Map<string, AffectedLoopKey>
  ) {
    const affectedUsers = new Set<string>()

    await mapWithConcurrency(
      [...pageAffectedLoops.values()],
      PROJECTION_WRITE_CONCURRENCY,
      async (key) => {
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
        await Promise.all([
          upsertUserLoopStats(loopStats),
          upsertLoopLeaderboardEntry(loopStats),
          markProcessedClaimEvents(claimEvents),
        ])
        affectedUsers.add(key.userAddress)
      }
    )

    await mapWithConcurrency(
      [...affectedUsers],
      PROJECTION_WRITE_CONCURRENCY,
      async (userAddress) => {
        const loopStats = (await getUserLoopStatsForUser(userAddress)).map(
          mapDbLoopStats
        )
        const globalStats = computeGlobalStatsFromLoops(userAddress, loopStats)
        await Promise.all([
          upsertUserGlobalStats(globalStats),
          upsertGlobalLeaderboardEntry(globalStats),
        ])
      }
    )

    return affectedUsers
  }

  if (mode === "incremental") {
    const pageAffectedLoops = new Map<string, AffectedLoopKey>()
    const events = syncState?.lastEventId
      ? await fetchClaimEventsFromSubgraph({
          blockNumber: lastSyncedBlock,
          afterEventId: syncState.lastEventId,
          first: batchSize,
          loopId: input.loopId,
          orderBy: "id",
        })
      : []

    if (events.length < batchSize) {
      const newBlockEvents = await fetchClaimEventsFromSubgraph({
        fromBlock: lastSyncedBlock + 1,
        first: batchSize - events.length,
        loopId: input.loopId,
        orderBy: "blockNumber",
      })
      events.push(...newBlockEvents)
    }

    for (const event of events) {
      const key = {
        userAddress: event.userAddress,
        loopId: event.loopId,
        chainId: event.chainId,
      }
      pageAffectedLoops.set(keyForAffectedLoop(key), key)
      cursor = advanceScoringSyncCursor(cursor, event)
    }

    const affectedUsers = await updateProjections(pageAffectedLoops)

    if (input.loopId == null) {
      await updateScoringSyncState({
        lastBlockNumber: cursor.lastBlockNumber,
        lastEventId: cursor.lastEventId,
      })
    }

    return {
      mode,
      processedEvents: events.length,
      affectedLoops: pageAffectedLoops.size,
      affectedUsers: affectedUsers.size,
      lastBlockNumber: cursor.lastBlockNumber,
      hasMore: events.length === batchSize,
    }
  }

  await fetchCursorPages({
    fromBlock: 0,
  })

  const affectedUsers = await updateProjections(affectedLoops)

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
    hasMore: false,
  }
}
