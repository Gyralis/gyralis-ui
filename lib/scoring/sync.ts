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
  getScoringSubgraphSource,
  getScoringSubgraphSources,
} from "./subgraph-client"
import { EarnedStreakBonus, UserLoopScoringStats } from "./types"

type SyncMode = "incremental" | "full"
const PROJECTION_WRITE_CONCURRENCY = 20
const INCREMENTAL_MAX_BATCH_SIZE = 100

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
  if (mode === "full" && (input.loopId != null || input.chainId != null)) {
    throw new Error(
      "Full scoring recompute must run without chain or loop filters"
    )
  }

  const configuredSources = getScoringSubgraphSources()
  const sources = input.chainId
    ? [getScoringSubgraphSource(input.chainId)]
    : configuredSources

  if (mode === "full") {
    await clearScoringProjections()
  }

  const batchSize =
    mode === "incremental"
      ? Math.min(env.SCORING_SYNC_BATCH_SIZE, INCREMENTAL_MAX_BATCH_SIZE)
      : env.SCORING_SYNC_BATCH_SIZE
  const affectedLoops = new Map<string, AffectedLoopKey>()
  const fullModeClaimEventsByLoop = new Map<
    string,
    Awaited<ReturnType<typeof fetchClaimEventsFromSubgraph>>
  >()
  const allAffectedUsers = new Set<string>()
  const sourceCursors = new Map<number, ScoringSyncCursor>()
  const sourceResults: Array<{
    chainId: number
    processedEvents: number
    lastBlockNumber: number
    hasMore: boolean
  }> = []
  let processedEvents = 0

  async function updateProjections(
    pageAffectedLoops: Map<string, AffectedLoopKey>,
    newClaimEventsByLoop: Map<
      string,
      Awaited<ReturnType<typeof fetchClaimEventsFromSubgraph>>
    >
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
                source: getScoringSubgraphSource(key.chainId),
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
          markProcessedClaimEvents(newClaimEventsByLoop.get(loopKey) ?? []),
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
    for (const source of sources) {
      const syncState = await getScoringSyncState(source.chainId)
      const lastSyncedBlock = syncState?.lastBlockNumber ?? 0
      let cursor: ScoringSyncCursor = {
        lastBlockNumber: lastSyncedBlock,
        lastEventId: syncState?.lastEventId ?? undefined,
      }
      const pageAffectedLoops = new Map<string, AffectedLoopKey>()
      const pageClaimEventsByLoop = new Map<
        string,
        Awaited<ReturnType<typeof fetchClaimEventsFromSubgraph>>
      >()
      const events = syncState?.lastEventId
        ? await fetchClaimEventsFromSubgraph({
            source,
            blockNumber: lastSyncedBlock,
            afterEventId: syncState.lastEventId,
            first: batchSize,
            loopId: input.loopId,
            orderBy: "id",
          })
        : []

      if (events.length < batchSize) {
        const newBlockEvents = await fetchClaimEventsFromSubgraph({
          source,
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
        const loopKey = keyForAffectedLoop(key)
        pageAffectedLoops.set(loopKey, key)
        affectedLoops.set(loopKey, key)
        const loopEvents = pageClaimEventsByLoop.get(loopKey) ?? []
        loopEvents.push(event)
        pageClaimEventsByLoop.set(loopKey, loopEvents)
        cursor = advanceScoringSyncCursor(cursor, event)
      }

      const affectedUsers = await updateProjections(
        pageAffectedLoops,
        pageClaimEventsByLoop
      )
      affectedUsers.forEach((userAddress) => allAffectedUsers.add(userAddress))

      if (input.loopId == null) {
        await updateScoringSyncState({
          chainId: source.chainId,
          lastBlockNumber: cursor.lastBlockNumber,
          lastEventId: cursor.lastEventId,
        })
      }

      processedEvents += events.length
      sourceCursors.set(source.chainId, cursor)
      sourceResults.push({
        chainId: source.chainId,
        processedEvents: events.length,
        lastBlockNumber: cursor.lastBlockNumber,
        hasMore: events.length === batchSize,
      })
    }

    return {
      mode,
      processedEvents,
      affectedLoops: affectedLoops.size,
      affectedUsers: allAffectedUsers.size,
      lastBlockNumber: Math.max(
        0,
        ...sourceResults.map((result) => result.lastBlockNumber)
      ),
      hasMore: sourceResults.some((result) => result.hasMore),
      chains: sourceResults,
    }
  }

  for (const source of sources) {
    let cursor: ScoringSyncCursor = { lastBlockNumber: 0 }
    let afterEventId: string | undefined
    let sourceProcessedEvents = 0

    for (;;) {
      const events = await fetchClaimEventsFromSubgraph({
        source,
        fromBlock: 0,
        afterEventId,
        first: batchSize,
        loopId: input.loopId,
        orderBy: "id",
      })

      if (events.length === 0) break
      for (const event of events) {
        const key = {
          userAddress: event.userAddress,
          loopId: event.loopId,
          chainId: event.chainId,
        }
        const loopKey = keyForAffectedLoop(key)
        affectedLoops.set(loopKey, key)
        const loopEvents = fullModeClaimEventsByLoop.get(loopKey) ?? []
        loopEvents.push(event)
        fullModeClaimEventsByLoop.set(loopKey, loopEvents)
        cursor = advanceScoringSyncCursor(cursor, event)
        processedEvents += 1
        sourceProcessedEvents += 1
      }
      if (events.length < batchSize) break
      afterEventId = events[events.length - 1]?.id
    }

    sourceCursors.set(source.chainId, cursor)
    sourceResults.push({
      chainId: source.chainId,
      processedEvents: sourceProcessedEvents,
      lastBlockNumber: cursor.lastBlockNumber,
      hasMore: false,
    })
  }

  const affectedUsers = await updateProjections(
    affectedLoops,
    fullModeClaimEventsByLoop
  )

  if (input.loopId == null) {
    for (const source of sources) {
      const cursor = sourceCursors.get(source.chainId)
      if (!cursor) continue
      await updateScoringSyncState({
        chainId: source.chainId,
        lastBlockNumber: cursor.lastBlockNumber,
        lastEventId: cursor.lastEventId,
      })
    }
  }

  return {
    mode,
    processedEvents,
    affectedLoops: affectedLoops.size,
    affectedUsers: affectedUsers.size,
    lastBlockNumber: Math.max(
      0,
      ...sourceResults.map((result) => result.lastBlockNumber)
    ),
    hasMore: false,
    chains: sourceResults,
  }
}
