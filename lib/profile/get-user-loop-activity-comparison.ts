import { unstable_cache } from "next/cache"
import { env } from "@/env.mjs"
import { isAddress } from "viem"

import { getUserLoopStats } from "@/lib/db/clients/loop-stats.client"

import {
  userActivityLoopIds as comparisonLoopIds,
  countUserLoopEvents,
  getUserActivitySnapshot,
} from "./user-activity-subgraph"

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
  const [blockNumber, databaseStats] = await Promise.all([
    getUserActivitySnapshot(),
    getUserLoopStats(identity),
  ])

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
