import "server-only"

import { unstable_cache } from "next/cache"
import { LoopCardsData } from "@/data/loops-data"
import { env } from "@/env.mjs"
import { createPublicClient, http, isAddress, parseAbi } from "viem"
import { gnosis } from "viem/chains"

import { getUserRegistrationsAndClaims } from "./get-user-registrations-and-claims"

const abi = parseAbi(["function getCurrentPeriod() view returns (uint256)"])

export async function getUserClaimRate(userAddress: string) {
  if (!isAddress(userAddress)) throw new Error("Invalid user address")
  if (env.GYRALIS_SUBGRAPH_CHAIN_ID !== 100) {
    throw new Error("Claim rate requires the Gnosis subgraph")
  }
  return getCachedClaimRate(userAddress.toLowerCase())
}

const getCachedClaimRate = unstable_cache(
  async (userAddress: string) => {
    // One cache layer: don't extend the lifetime of an older activity snapshot.
    const activity = await getUserRegistrationsAndClaims({
      userAddress,
      bypassCache: true,
    })
    const client = createPublicClient({
      chain: gnosis,
      transport: http(undefined, {
        timeout: 5_000,
        retryCount: 0,
        fetchOptions: { cache: "no-store" },
      }),
    })
    const loops = await Promise.all(
      activity.loops.map(async (loop) => {
        const metadata = LoopCardsData.find(
          (entry) => entry.chainId === 100 && entry.id === loop.loopId
        )
        if (
          !metadata?.address ||
          !isAddress(metadata.address) ||
          metadata.contractType !== "loop"
        ) {
          throw new Error("Unsupported claim-rate loop")
        }
        if (loop.registeredPeriods.length === 0)
          return { loopId: loop.loopId, registrations: 0, claims: 0 }
        // Standard loops register for a target period and claim in that same period.
        // Reading at the indexed block avoids treating unindexed claims as missed.
        const currentPeriod = await client.readContract({
          address: metadata.address,
          abi,
          functionName: "getCurrentPeriod",
          blockNumber: BigInt(activity.indexedBlock),
        })
        const completed = loop.registeredPeriods.filter(
          (period) => BigInt(period) < currentPeriod
        )
        const claimed = new Set(loop.claimedPeriods)
        return {
          loopId: loop.loopId,
          registrations: completed.length,
          claims: completed.filter((period) => claimed.has(period)).length,
        }
      })
    )
    const totals = loops.reduce(
      (sum, loop) => ({
        registrations: sum.registrations + loop.registrations,
        claims: sum.claims + loop.claims,
      }),
      { registrations: 0, claims: 0 }
    )
    return {
      ...totals,
      rate:
        totals.registrations > 0
          ? (totals.claims / totals.registrations) * 100
          : null,
      indexedBlock: activity.indexedBlock,
      fetchedAt: activity.fetchedAt,
    }
  },
  ["user-completed-claim-rate-v1", env.GYRALIS_SUBGRAPH_URL],
  { revalidate: 300 }
)
