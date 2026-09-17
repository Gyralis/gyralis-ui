import { unstable_cache } from "next/cache"
import { env } from "@/env.mjs"
import { isAddress } from "viem"

import { getUserLoopStats } from "@/lib/db/clients/loop-stats.client"

// Only the 1Hive Gardens and Blockscout Merits loops on Gnosis.
const comparisonLoopIds = [3, 4] as const

type EventEntity = "registerEvents" | "claimEvents"
interface ActivityEvent {
  id: string
  periodNumber: string
}

async function queryActivity<T>(query: string, variables = {}): Promise<T> {
  const response = await fetch(env.GYRALIS_SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    throw new Error(`Subgraph request failed with status ${response.status}`)
  }
  const payload = (await response.json()) as {
    data?: T
    errors?: Array<{ message: string }>
  }
  if (payload.errors?.length || !payload.data) {
    throw new Error(
      payload.errors?.map((error) => error.message).join("; ") ||
        "Subgraph returned no activity data"
    )
  }
  return payload.data
}

async function countUserLoopEvents(
  entity: EventEntity,
  input: {
    userAddress: string
    loopId: number
    blockNumber: number
    batchSize: number
  }
) {
  const query = `
    query UserLoopActivity(
      $userAddress: ID!, $loopId: ID!, $afterId: ID!,
      $first: Int!, $blockNumber: Int!, $allowedLoopIds: [ID!]!
    ) {
      events: ${entity}(
        first: $first
        orderBy: id
        orderDirection: asc
        block: { number: $blockNumber }
        where: {
          account: $userAddress, loop: $loopId,
          loop_in: $allowedLoopIds, id_gt: $afterId
        }
      ) {
        id
        periodNumber
      }
    }
  `
  let afterId = ""
  let eventCount = 0
  const periods = new Set<string>()

  for (;;) {
    const { events } = await queryActivity<{ events: ActivityEvent[] }>(query, {
      userAddress: input.userAddress,
      loopId: String(input.loopId),
      allowedLoopIds: comparisonLoopIds.map(String),
      afterId,
      first: input.batchSize,
      blockNumber: input.blockNumber,
    })
    if (!Array.isArray(events)) {
      throw new Error(`Subgraph returned no ${entity} list`)
    }
    for (const event of events) {
      if (
        typeof event.id !== "string" ||
        event.id <= afterId ||
        typeof event.periodNumber !== "string" ||
        !/^\d+$/.test(event.periodNumber)
      ) {
        throw new Error(`Invalid or non-advancing ${entity} page`)
      }
      afterId = event.id
      periods.add(BigInt(event.periodNumber).toString())
      eventCount++
    }
    if (events.length < input.batchSize) {
      return { events: eventCount, periods: periods.size }
    }
  }
}

/** Cached for five minutes. Bypass for live diagnostics outside page rendering. */
export async function getUserLoopActivityComparison(input: {
  userAddress: string
  loopId: number
  chainId: number
  batchSize?: number
  bypassCache?: boolean
}) {
  if (!isAddress(input.userAddress)) throw new Error("Invalid user address")
  if (
    input.chainId !== 100 ||
    input.chainId !== env.GYRALIS_SUBGRAPH_CHAIN_ID
  ) {
    throw new Error(
      "Activity comparison requires the Gnosis subgraph (chainId 100)"
    )
  }
  if (!comparisonLoopIds.some((loopId) => loopId === input.loopId)) {
    throw new Error(
      "Activity comparison only supports 1Hive (3) and Blockscout (4)"
    )
  }
  const batchSize = input.batchSize ?? 1000
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 1000) {
    throw new Error("batchSize must be between 1 and 1000")
  }
  const identity = {
    userAddress: input.userAddress.toLowerCase(),
    chainId: input.chainId,
    loopId: input.loopId,
  }
  return input.bypassCache
    ? fetchUserLoopActivityComparison(identity, batchSize)
    : getCachedUserLoopActivityComparison(identity, batchSize)
}

// Next includes function arguments in the key. Normalize the wallet before use.
const getCachedUserLoopActivityComparison = unstable_cache(
  fetchUserLoopActivityComparison,
  ["user-loop-activity-comparison-v1", env.GYRALIS_SUBGRAPH_URL],
  { revalidate: 300 }
)

async function fetchUserLoopActivityComparison(
  identity: { userAddress: string; chainId: number; loopId: number },
  batchSize: number
) {
  const [snapshot, databaseStats] = await Promise.all([
    queryActivity<{
      _meta: { block: { number: number }; hasIndexingErrors: boolean } | null
    }>("{ _meta { block { number } hasIndexingErrors } }"),
    getUserLoopStats(identity),
  ])
  const blockNumber = snapshot._meta?.block?.number
  if (
    typeof blockNumber !== "number" ||
    !Number.isSafeInteger(blockNumber) ||
    blockNumber < 0 ||
    snapshot._meta?.hasIndexingErrors !== false
  ) {
    throw new Error("Subgraph snapshot is unavailable or has indexing errors")
  }

  // Pin both event streams and every page to the same indexed block.
  const queryInput = { ...identity, blockNumber, batchSize }
  const [registrations, claims] = await Promise.all([
    countUserLoopEvents("registerEvents", queryInput),
    countUserLoopEvents("claimEvents", queryInput),
  ])
  const databaseTotalClaims = databaseStats?.totalClaims ?? 0
  // Scoring counts one claim per period, not every emitted claim event.
  const claimsDifference = claims.periods - databaseTotalClaims

  return {
    ...identity,
    fetchedAt: new Date().toISOString(),
    subgraph: {
      indexedBlock: blockNumber,
      registrations: registrations.events,
      claimEvents: claims.events,
      totalClaims: claims.periods,
    },
    database: {
      recordExists: databaseStats != null,
      totalClaims: databaseTotalClaims,
      updatedAt: databaseStats?.updatedAt.toISOString() ?? null,
    },
    // Positive: subgraph has more; negative: database has more.
    claimsDifference,
    claimsMatch: claimsDifference === 0,
  }
}
