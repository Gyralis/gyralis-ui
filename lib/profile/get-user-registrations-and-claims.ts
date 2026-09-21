import "server-only"

import { unstable_cache } from "next/cache"
import { env } from "@/env.mjs"
import { isAddress } from "viem"

import {
  countUserLoopEvents,
  getUserActivitySnapshot,
  userActivityLoopIds,
} from "./user-activity-subgraph"

/**
 * Subgraph-only activity for 1Hive/Blockscout on Gnosis; no database reads.
 * Counts include open periods. These are NOT yet a completed-period claim rate.
 */
export async function getUserRegistrationsAndClaims(input: {
  userAddress: string
  batchSize?: number
  bypassCache?: boolean
}) {
  if (!isAddress(input.userAddress)) throw new Error("Invalid user address")
  if (env.GYRALIS_SUBGRAPH_CHAIN_ID !== 100) {
    throw new Error("User activity requires the Gnosis subgraph (chainId 100)")
  }
  const batchSize = input.batchSize ?? 1000
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 1000) {
    throw new Error("batchSize must be between 1 and 1000")
  }
  const address = input.userAddress.toLowerCase()
  return input.bypassCache
    ? fetchUserRegistrationsAndClaims(address, batchSize)
    : getCachedUserRegistrationsAndClaims(address, batchSize)
}

const getCachedUserRegistrationsAndClaims = unstable_cache(
  fetchUserRegistrationsAndClaims,
  ["user-registrations-and-claims-v1", env.GYRALIS_SUBGRAPH_URL],
  { revalidate: 300 }
)

async function fetchUserRegistrationsAndClaims(
  userAddress: string,
  batchSize: number
) {
  const indexedBlock = await getUserActivitySnapshot()
  // All four event streams (and every page) use the same indexed block.
  // Fail the request if any stream fails; don't report partial counts as totals.
  const loops = await Promise.all(
    userActivityLoopIds.map(async (loopId) => {
      const input = {
        userAddress,
        loopId,
        blockNumber: indexedBlock,
        batchSize,
      }
      const [registrations, claims] = await Promise.all([
        countUserLoopEvents("registerEvents", input),
        countUserLoopEvents("claimEvents", input),
      ])
      return {
        chainId: 100 as const,
        loopId,
        registrationEvents: registrations.events,
        claimEvents: claims.events,
        totalRegistrations: registrations.periods,
        totalClaims: claims.periods,
        // Strings preserve uint256 precision; lists are unique and sorted.
        registeredPeriods: registrations.periodNumbers,
        claimedPeriods: claims.periodNumbers,
      }
    })
  )

  return {
    userAddress,
    chainId: 100 as const,
    loopIds: [...userActivityLoopIds],
    indexedBlock,
    fetchedAt: new Date().toISOString(),
    includesOpenPeriods: true as const,
    loops,
    // Deduplicate within each loop, never across loops with the same period ID.
    totals: loops.reduce(
      (total, loop) => ({
        registrationEvents: total.registrationEvents + loop.registrationEvents,
        claimEvents: total.claimEvents + loop.claimEvents,
        totalRegistrations: total.totalRegistrations + loop.totalRegistrations,
        totalClaims: total.totalClaims + loop.totalClaims,
      }),
      {
        registrationEvents: 0,
        claimEvents: 0,
        totalRegistrations: 0,
        totalClaims: 0,
      }
    ),
  }
}

export type UserRegistrationsAndClaims = Awaited<
  ReturnType<typeof getUserRegistrationsAndClaims>
>
